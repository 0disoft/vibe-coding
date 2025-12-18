#!/usr/bin/env bun
/**
 * find-word.ts
 * 프로젝트에서 특정 단어/패턴을 검색하는 도구
 *
 * 사용법:
 *   bun .vibe-coding/TOOLS/find-word.ts <패턴> [경로] [옵션]
 */

import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

// ─────────────────────────────────────────────────────────────────────────────
// 🔧 Types & Interfaces
// ─────────────────────────────────────────────────────────────────────────────

interface AuditConfig {
	pattern: string;
	target: string;
	caseSensitive: boolean;
	noColor: boolean;
	noReport: boolean;
	json: boolean;
}

interface Match {
	file: string;
	relativePath: string;
	line: number;
	column: number;
	content: string;
	matchText: string;
}

interface SearchResult {
	pattern: string;
	matches: Match[];
	filesSearched: number;
	filesWithMatches: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// 🎨 Constants
// ─────────────────────────────────────────────────────────────────────────────

const TARGET_EXTENSIONS = new Set([
	".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
	".svelte", ".vue", ".html",
	".css", ".scss", ".sass",
	".json", ".yaml", ".yml", ".toml",
	".md", ".mdx",
]);

const IGNORE_PATTERNS = [
	"node_modules",
	".git",
	"dist",
	"build",
	".svelte-kit",
	".vite",
	"coverage",
	"__snapshots__",
	"paraglide",
	"bun.lock",
];

// ─────────────────────────────────────────────────────────────────────────────
// 💡 Services & Components
// ─────────────────────────────────────────────────────────────────────────────

/** Service to handle configuration and arguments */
class AuditConfigService {
	public static parseArgs(args: string[]): AuditConfig {
		const json = args.includes("--json");
		const noColor = args.includes("--no-color");
		const noReport = args.includes("--no-report");
		const caseSensitive = args.includes("--case-sensitive") || args.includes("-s");

		const positional = args.filter((arg) => !arg.startsWith("--") && arg !== "-s");
		const pattern = positional[0];
		const target = positional[1] ?? "src";

		if (!pattern && !args.includes("--help") && !args.includes("-h")) {
			// 패턴이 없으면 생성자 밖에서 처리하거나 여기서 에러를 던짐.
			// 여기서는 null 체크를 상위에서 하도록 빈 문자열 허용하지 않음.
		}

		return {
			pattern: pattern || "",
			target,
			caseSensitive,
			noColor,
			noReport,
			json,
		};
	}
}

/** Logger for unified output handling */
class ConsoleLogger {
	log(message: string) {
		console.log(message);
	}
	error(message: string, ...args: any[]) {
		console.error(message, ...args);
	}
}

/** Service to scan directory */
class FileScanner {
	public async scan(target: string): Promise<string[]> {
		const targetStat = await stat(target).catch(() => null);
		if (!targetStat) {
			throw new Error(`Target path not found: ${target}`);
		}

		if (targetStat.isFile()) {
			if (this.isTargetFile(target)) return [target];
			return [];
		}

		return this.walk(target);
	}

	private async walk(dir: string, fileList: string[] = []): Promise<string[]> {
		try {
			const entries = await readdir(dir, { withFileTypes: true });
			for (const entry of entries) {
				const fullPath = join(dir, entry.name);
				if (this.shouldIgnore(fullPath)) continue;

				if (entry.isDirectory()) {
					await this.walk(fullPath, fileList); // accumulator 패턴
				} else if (entry.isFile() && this.isTargetFile(entry.name)) {
					fileList.push(fullPath);
				}
			}
		} catch (error) {
			console.error(`Error reading directory ${dir}:`, error);
		}
		return fileList;
	}

	private shouldIgnore(path: string): boolean {
		const segments = path.split(/[\\/]/);
		return IGNORE_PATTERNS.some((pattern) => segments.includes(pattern));
	}

	private isTargetFile(path: string): boolean {
		const ext = extname(path).toLowerCase();
		return TARGET_EXTENSIONS.has(ext);
	}
}

/** Service to search for patterns in files */
class WordSearcher {
	public async searchFile(filePath: string, pattern: RegExp, basePath: string): Promise<Match[]> {
		const matches: Match[] = [];
		try {
			const content = await readFile(filePath, "utf-8");
			const lines = content.split(/\r?\n/);
			const relativePath = relative(basePath, filePath).replace(/\\/g, '/');

			for (let i = 0; i < lines.length; i++) {
				const line = lines[i];
				pattern.lastIndex = 0; // Reset for each line

				let match: RegExpExecArray | null;
				while ((match = pattern.exec(line)) !== null) {
					if (match[0].length === 0) {
						pattern.lastIndex++;
						continue;
					}

					matches.push({
						file: filePath,
						relativePath,
						line: i + 1,
						column: match.index + 1,
						content: line.trimEnd(),
						matchText: match[0],
					});
				}
			}
		} catch (error) {
			// Skip binary or unreadable files
		}
		return matches;
	}
}

/** Service to generate reports */
class ReportGenerator {
	constructor(
		private config: AuditConfig,
		private logger: ConsoleLogger
	) { }

	public async processResults(result: SearchResult, elapsed: string) {
		if (this.config.json) {
			this.logger.log(JSON.stringify({ ...result, elapsed }, null, 2));
			return; // JSON output doesn't save to file by default in original logic? Original saved if not noReport.
		}

		this.printConsole(result, elapsed);

		if (!this.config.noReport && result.matches.length > 0) {
			await this.saveReport(result, elapsed);
		}
	}

	private printConsole(result: SearchResult, elapsed: string) {
		const { pattern, matches, filesSearched, filesWithMatches } = result;

		this.logger.log(`\n🔍 패턴: ${pattern}`);
		this.logger.log(`대소문자: ${this.config.caseSensitive ? "구분" : "무시"}\n`);
		this.logger.log(`검색: ${filesSearched}개 파일 | 매치: ${matches.length}개 | 파일: ${filesWithMatches}개\n`);

		if (matches.length === 0) {
			this.logger.log("❌ 매치되는 항목이 없습니다.\n");
			return;
		}

		const grouped = this.groupMatchesByFile(matches);

		for (const [relativePath, fileMatches] of grouped) {
			this.logger.log(`📄 ${relativePath} (${fileMatches.length})`);

			for (const match of fileMatches) {
				const lineNum = String(match.line).padStart(4, " ");
				if (this.config.noColor) {
					this.logger.log(`   ${lineNum}: ${match.content}`);
				} else {
					const hlFlags = this.config.caseSensitive ? "g" : "gi";
					const highlighted = match.content.replace(
						new RegExp(`(${this.escapeRegex(match.matchText)})`, hlFlags),
						"\x1b[33m$1\x1b[0m",
					);
					this.logger.log(`   ${lineNum}: ${highlighted}`);
				}
			}
			this.logger.log("");
		}

		this.logger.log(`⏱️ 소요 시간: ${elapsed}\n`);
	}

	private async saveReport(result: SearchResult, elapsed: string) {
		const scriptDir = dirname(fileURLToPath(import.meta.url));
		const reportsDir = join(scriptDir, "reports");
		await mkdir(reportsDir, { recursive: true });

		const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
		const reportPath = join(reportsDir, "find-word-report.txt");

		const lines: string[] = [
			`Find Word Report - ${timestamp}`,
			`Pattern: ${result.pattern}`,
			`Case Sensitive: ${this.config.caseSensitive ? "Yes" : "No"}`,
			`Target: ${this.config.target}`,
			`Elapsed: ${elapsed}`,
			"=".repeat(50),
			"",
			`검색: ${result.filesSearched}개 파일 | 매치: ${result.matches.length}개 | 파일: ${result.filesWithMatches}개`,
			"",
		];

		const grouped = this.groupMatchesByFile(result.matches);

		for (const [relativePath, fileMatches] of grouped) {
			lines.push(`📄 ${relativePath} (${fileMatches.length})`);
			for (const match of fileMatches) {
				const lineNum = String(match.line).padStart(4, " ");
				lines.push(`   ${lineNum}: ${match.content}`);
			}
			lines.push("");
		}

		await writeFile(reportPath, lines.join("\n"), "utf-8");
		this.logger.log(`📝 리포트 저장됨: ${reportPath}`);
	}

	private groupMatchesByFile(matches: Match[]): [string, Match[]][] {
		const byFile = new Map<string, Match[]>();
		for (const match of matches) {
			const existing = byFile.get(match.relativePath) ?? [];
			existing.push(match);
			byFile.set(match.relativePath, existing);
		}
		return [...byFile.entries()].sort((a, b) => a[0].localeCompare(b[0]));
	}

	private escapeRegex(str: string): string {
		return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// 🚀 Main Entry
// ─────────────────────────────────────────────────────────────────────────────

class WordFinderTool {
	private config: AuditConfig;
	private logger: ConsoleLogger;
	private scanner: FileScanner;
	private searcher: WordSearcher;
	private reporter: ReportGenerator;

	constructor() {
		const args = process.argv.slice(2);
		if (args.includes("--help") || args.includes("-h") || args.length === 0) {
			this.printHelp();
			process.exit(0);
		}

		this.config = AuditConfigService.parseArgs(args);

		if (!this.config.pattern) {
			console.error("오류: 검색 패턴을 지정해주세요.");
			process.exit(1);
		}

		this.logger = new ConsoleLogger();
		this.scanner = new FileScanner();
		this.searcher = new WordSearcher();
		this.reporter = new ReportGenerator(this.config, this.logger);
	}

	public async run() {
		try {
			const startTime = performance.now();
			const files = await this.scanner.scan(this.config.target);

			const basePath = (await stat(this.config.target)).isDirectory()
				? this.config.target
				: process.cwd(); // Or parent of target file? Logic in original was process.cwd() for basePath calculation mostly.
			// Replicating original logic: basePath = process.cwd() was used in original 'search' function regardless of target. 
			// Wait, original: `const basePath = process.cwd();` on line 174. 
			// Let's stick to process.cwd() to keep relative paths consistent with original output.
			const searchBasePath = process.cwd();

			const flags = this.config.caseSensitive ? "g" : "gi";
			const regex = new RegExp(this.config.pattern, flags);

			const allMatches: Match[] = [];
			let filesSearched = 0;

			// 병렬 처리: 청크 단위로 Promise.all 실행
			const CHUNK_SIZE = 50;
			for (let i = 0; i < files.length; i += CHUNK_SIZE) {
				const chunk = files.slice(i, i + CHUNK_SIZE);
				const chunkResults = await Promise.all(
					chunk.map(file => this.searcher.searchFile(file, regex, searchBasePath))
				);
				for (const matches of chunkResults) {
					filesSearched++;
					allMatches.push(...matches);
				}
			}

			const filesWithMatches = new Set(allMatches.map((m) => m.file)).size;

			const result: SearchResult = {
				pattern: this.config.pattern,
				matches: allMatches,
				filesSearched,
				filesWithMatches,
			};

			const elapsed = this.formatElapsed(performance.now() - startTime);
			await this.reporter.processResults(result, elapsed);

			process.exit(allMatches.length > 0 ? 0 : 1);

		} catch (error) {
			this.logger.error(`오류: ${error instanceof Error ? error.message : error}`);
			process.exit(1);
		}
	}

	private printHelp() {
		console.log(`
🔍 find-word.ts — 프로젝트 단어 검색 도구

사용법:
  bun .vibe-coding/TOOLS/find-word.ts <패턴> [경로] [옵션]

인자:
  <패턴>        검색할 단어 또는 정규식 (따옴표로 감싸기 권장)
  [경로]        검색 대상 경로 (기본: src)

옵션:
  --case-sensitive, -s  대소문자 구분 검색 (기본: 무시)
  --no-color            색상 하이라이트 없이 출력
  --no-report           리포트 파일 생성 생략
  --json                JSON 형식으로 출력
  --help, -h            도움말 표시

예시:
  bun .vibe-coding/TOOLS/find-word.ts TODO                    # TODO 검색
  bun .vibe-coding/TOOLS/find-word.ts "TODO|FIXME|HACK"       # OR 검색
  bun .vibe-coding/TOOLS/find-word.ts "console\\.log" src/lib  # 특정 경로
`);
	}

	private formatElapsed(ms: number): string {
		return ms < 1000 ? `${ms.toFixed(0)}ms` : `${(ms / 1000).toFixed(2)}s`;
	}
}

async function main() {
	const tool = new WordFinderTool();
	await tool.run();
}

main();
