#!/usr/bin/env bun
/**
 * 05-file-size-patterns.ts
 * 파일 크기 및 복잡도 검사 도구
 *
 * AGENTS.md의 '파일 크기 및 분리 기준'에 따라 파일을 분석합니다.
 * - ~150줄: 🟡 경고 — 책임 분리 점검
 * - ~300줄: 🟠 권장 — 파일 분리 권장
 * - ~600줄: 🔴 필수 — 즉시 분리
 * - 1000+줄: 💀 리스크 — 구조 리스크
 */

import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

// ─────────────────────────────────────────────────────────────────────────────
// 🎨 ANSI Colors & Styles
// ─────────────────────────────────────────────────────────────────────────────
const c = {
	reset: '\x1b[0m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	magenta: '\x1b[35m',
	cyan: '\x1b[36m',
	gray: '\x1b[90m',
	bold: '\x1b[1m',
	dim: '\x1b[2m',
};

// ─────────────────────────────────────────────────────────────────────────────
// 🔧 Types & Interfaces
// ─────────────────────────────────────────────────────────────────────────────

type Severity = "warning" | "recommend" | "required" | "risk";
type Emoji = "🟡" | "🟠" | "🔴" | "💀";

interface AuditConfig {
	target: string;
	all: boolean;
	json: boolean;
	noReport: boolean;
}

interface FileAnalysis {
	path: string;
	relativePath: string;
	lines: number;
	imports: number;
	isEntryFile: boolean;
	severity: Severity | null;
	issues: string[];
}

interface ScanResult {
	files: FileAnalysis[];
	totalFiles: number;
	skippedSmallFiles: number;
	issueCount: Record<Severity, number>;
}

// ─────────────────────────────────────────────────────────────────────────────
// 📏 Constants
// ─────────────────────────────────────────────────────────────────────────────

const THRESHOLDS = {
	WARNING: 150,   // 🟡 경고
	RECOMMEND: 300, // 🟠 권장
	REQUIRED: 600,  // 🔴 필수
	RISK: 1000,     // 💀 리스크
} as const;

const IMPORT_THRESHOLD = 20;
const BYTE_THRESHOLD = 4096;

const TARGET_EXTENSIONS = new Set([
	".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
	".svelte", ".vue",
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
];

const ENTRY_FILE_PATTERNS = [
	/hooks\.server\.ts$/,
	/hooks\.client\.ts$/,
	/\+layout\.server\.ts$/,
	/\+layout\.ts$/,
	/\+page\.server\.ts$/,
	/\+server\.ts$/,        // API 라우트
	/\+error\.svelte$/,     // 에러 페이지
	/vite\.config\.(ts|js)$/,
	/svelte\.config\.(ts|js)$/,
	/uno\.config\.(ts|js)$/,
	/tailwind\.config\.(ts|js)$/,
	/eslint\.config\.(ts|js)$/,
];

const SEVERITY_EMOJI: Record<Severity, Emoji> = {
	warning: "🟡",
	recommend: "🟠",
	required: "🔴",
	risk: "💀",
};

const SEVERITY_LABEL: Record<Severity, string> = {
	warning: "경고",
	recommend: "권장",
	required: "필수",
	risk: "리스크",
};

// ─────────────────────────────────────────────────────────────────────────────
// 💡 Services & Components
// ─────────────────────────────────────────────────────────────────────────────

/** Service to handle configuration and arguments */
class AuditConfigService {
	public static parseArgs(args: string[]): AuditConfig {
		return {
			target: args.find((arg) => !arg.startsWith("--")) ?? "src",
			all: args.includes("--all"),
			json: args.includes("--json"),
			noReport: args.includes("--no-report"),
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
	constructor(private config: AuditConfig) { }

	public async scan(targetPath: string): Promise<{ files: string[]; skipped: number; }> {
		const statInfo = await stat(targetPath).catch(() => null);
		if (!statInfo) return { files: [], skipped: 0 };

		if (statInfo.isDirectory()) {
			return this.walkDirectory(targetPath);
		} else if (this.isTargetFile(targetPath)) {
			// 단일 파일 지정 시 항상 포함
			return { files: [targetPath], skipped: 0 };
		}

		return { files: [], skipped: 0 };
	}

	private async walkDirectory(dir: string, fileList: string[] = [], skipCount = { value: 0 }): Promise<{ files: string[]; skipped: number; }> {
		try {
			const entries = await readdir(dir, { withFileTypes: true });

			for (const entry of entries) {
				const fullPath = join(dir, entry.name);

				if (this.shouldIgnore(fullPath)) continue;

				if (entry.isDirectory()) {
					await this.walkDirectory(fullPath, fileList, skipCount); // accumulator 패턴
				} else if (entry.isFile() && this.isTargetFile(entry.name)) {
					if (this.isEntryFile(fullPath)) {
						fileList.push(fullPath);
						continue;
					}

					const fileStat = await stat(fullPath);
					if (fileStat.size <= BYTE_THRESHOLD) {
						skipCount.value++;
						continue;
					}
					fileList.push(fullPath);
				}
			}
		} catch (error) {
			console.error(`디렉토리 읽기 실패: ${dir}`);
		}
		return { files: fileList, skipped: skipCount.value };
	}

	private shouldIgnore(path: string): boolean {
		const segments = path.split(/[\\/]/);
		return IGNORE_PATTERNS.some((pattern) => segments.includes(pattern));
	}

	private isTargetFile(path: string): boolean {
		const ext = extname(path).toLowerCase();
		return TARGET_EXTENSIONS.has(ext);
	}

	private isEntryFile(path: string): boolean {
		return ENTRY_FILE_PATTERNS.some((pattern) => pattern.test(path));
	}
}

/** Service to analyze file content */
class FileSizeAnalyzer {
	public async analyze(filePath: string, basePath: string): Promise<FileAnalysis> {
		const content = await readFile(filePath, "utf-8");
		const lines = this.countLines(content);
		const imports = this.countImports(content);
		const isEntry = this.isEntryFile(filePath);
		const relativePath = relative(basePath, filePath).replace(/\\/g, '/');
		let severity = this.getSeverity(lines, isEntry);

		const issues: string[] = [];

		if (severity) {
			if (isEntry) {
				issues.push(`진입 파일 ${lines}줄 (목표: 50~150줄)`);
			} else {
				issues.push(`${lines}줄 — ${SEVERITY_LABEL[severity]} 수준`);
			}
		}

		if (imports > IMPORT_THRESHOLD) {
			issues.push(`import ${imports}개 (임계치: ${IMPORT_THRESHOLD}개)`);
			if (!severity) {
				severity = "warning";
			}
		}

		return {
			path: filePath,
			relativePath,
			lines,
			imports,
			isEntryFile: isEntry,
			severity,
			issues,
		};
	}

	private countLines(content: string): number {
		if (content.length === 0) return 0;
		// Zero-allocation 라인 카운팅: split 대신 charCodeAt 루프
		let lines = 1;
		const len = content.length;
		for (let i = 0; i < len; i++) {
			if (content.charCodeAt(i) === 10) lines++; // 10 = '\n'
		}
		// 마지막 문자가 개행이면 카운트 조정 (빈 줄 방지)
		if (content.charCodeAt(len - 1) === 10) lines--;
		return Math.max(lines, 1);
	}

	private countImports(content: string): number {
		const importRegex = /^import\s+/gm;
		const matches = content.match(importRegex);
		return matches ? matches.length : 0;
	}

	private isEntryFile(path: string): boolean {
		return ENTRY_FILE_PATTERNS.some((pattern) => pattern.test(path));
	}

	private getSeverity(lines: number, isEntry: boolean): Severity | null {
		if (isEntry) {
			if (lines >= 300) return "risk";
			if (lines >= 200) return "required";
			if (lines >= 150) return "recommend";
			return null;
		}

		if (lines >= THRESHOLDS.RISK) return "risk";
		if (lines >= THRESHOLDS.REQUIRED) return "required";
		if (lines >= THRESHOLDS.RECOMMEND) return "recommend";
		if (lines >= THRESHOLDS.WARNING) return "warning";
		return null;
	}
}

/** Service to generate reports */
class ReportGenerator {
	constructor(
		private config: AuditConfig,
		private logger: ConsoleLogger
	) { }

	public async processResults(result: ScanResult, elapsed: string) {
		if (this.config.json) {
			this.logger.log(JSON.stringify({ ...result, elapsed }, null, 2));
			await this.saveJSON(result, elapsed);
		} else {
			const text = this.formatTextReport(result);
			this.logger.log("\n" + text.join("\n"));
			this.logger.log(`⏱️ 소요 시간: ${elapsed}\n`);
			await this.saveText(text.join("\n"), elapsed);
		}

		// Exit on critical issues
		const hasErrors = result.issueCount.required > 0 || result.issueCount.risk > 0;
		process.exit(hasErrors ? 1 : 0);
	}

	private formatTextReport(result: ScanResult): string[] {
		const { files, totalFiles, skippedSmallFiles, issueCount } = result;
		const issueFiles = files.filter((f) => f.issues.length > 0);
		const lines: string[] = [];

		lines.push("📊 파일 크기 검사 결과\n");
		lines.push(`분석: ${totalFiles}개 | 소형 스킵: ${skippedSmallFiles}개 | 총 대상: ${totalFiles + skippedSmallFiles}개\n`);

		const totalIssues = Object.values(issueCount).reduce((a, b) => a + b, 0);

		if (totalIssues === 0) {
			lines.push(`${c.green}✅ 모든 파일이 기준을 충족합니다.${c.reset}\n`);
			return lines;
		}

		lines.push("── 요약 ────────────────────────────────────────");
		lines.push(`💀 리스크:  ${issueCount.risk}개`);
		lines.push(`🔴 필수:    ${issueCount.required}개`);
		lines.push(`🟠 권장:    ${issueCount.recommend}개`);
		lines.push(`🟡 경고:    ${issueCount.warning}개`);
		lines.push("────────────────────────────────────────────────\n");

		const displayFiles = this.config.all ? issueFiles : issueFiles.slice(0, 20);

		for (const file of displayFiles) {
			if (!file.severity) continue;

			const emoji = SEVERITY_EMOJI[file.severity];
			const entryTag = file.isEntryFile ? ` ${c.cyan}[진입]${c.reset}` : "";
			const color = file.severity === 'risk' || file.severity === 'required' ? c.red : c.yellow;

			lines.push(`${emoji} ${c.bold}${file.relativePath}${c.reset}${entryTag}`);
			lines.push(`   줄: ${file.lines} | import: ${file.imports}`);

			for (const issue of file.issues) {
				lines.push(`   → ${color}${issue}${c.reset}`);
			}
			lines.push("");
		}

		if (!this.config.all && issueFiles.length > 20) {
			lines.push(`${c.gray}... 외 ${issueFiles.length - 20}개 파일 (전체: --all 옵션)${c.reset}\n`);
		}

		lines.push(`${c.gray}── 기준 (AGENTS.md) ────────────────────────────`);
		lines.push("🟡 ~150줄  : 책임이 2개 이상인지 점검");
		lines.push("🟠 ~300줄  : 모듈 경계 잡고 파일 분리");
		lines.push("🔴 ~600줄  : 즉시 분리 (리뷰·테스트 비용 급증)");
		lines.push("💀 1000+줄 : 진입 파일은 조립만, 로직 이동");
		lines.push(`────────────────────────────────────────────────${c.reset}\n`);

		return lines;
	}

	private async saveText(content: string, elapsed: string) {
		if (this.config.noReport) return;
		await this.save(content, elapsed, ".txt", (c) => c.replace(/\x1b\[[0-9;]*m/g, ''));
	}

	private async saveJSON(result: ScanResult, elapsed: string) {
		if (this.config.noReport) return;
		await this.save(JSON.stringify({ ...result, elapsed }, null, 2), elapsed, ".json", (c) => c);
	}

	private async save(content: string, elapsed: string, ext: string, transform: (c: string) => string) {
		const scriptDir = dirname(fileURLToPath(import.meta.url));
		const reportsDir = join(scriptDir, "reports");
		await mkdir(reportsDir, { recursive: true });

		const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
		const reportPath = join(reportsDir, `05-file-size-report${ext}`);
		const header = ext === '.txt' ? `File Size Report - ${timestamp}\nTarget: ${this.config.target}\nElapsed: ${elapsed}\n${'='.repeat(50)}\n\n` : '';

		await writeFile(reportPath, header + transform(content), "utf-8");
		this.logger.log(`${c.gray}📝 리포트 저장됨: ${reportPath}${c.reset}`);
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// 🚀 Main Entry
// ─────────────────────────────────────────────────────────────────────────────

class FileSizeAuditor {
	private config: AuditConfig;
	private logger: ConsoleLogger;
	private scanner: FileScanner;
	private analyzer: FileSizeAnalyzer;
	private reporter: ReportGenerator;

	constructor() {
		const args = process.argv.slice(2);
		if (args.includes("--help") || args.includes("-h")) {
			this.printHelp();
			process.exit(0);
		}
		this.config = AuditConfigService.parseArgs(args);
		this.logger = new ConsoleLogger();
		this.scanner = new FileScanner(this.config);
		this.analyzer = new FileSizeAnalyzer();
		this.reporter = new ReportGenerator(this.config, this.logger);
	}

	public async run() {
		const startTime = performance.now();
		const { files, skipped } = await this.scanner.scan(this.config.target);
		const basePath = (await stat(this.config.target)).isDirectory() ? this.config.target : join(this.config.target, "..");

		const analyses: FileAnalysis[] = [];
		const issueCount: Record<Severity, number> = {
			warning: 0,
			recommend: 0,
			required: 0,
			risk: 0,
		};

		// 병렬 처리: 청크 단위로 Promise.all 실행
		const CHUNK_SIZE = 50;
		for (let i = 0; i < files.length; i += CHUNK_SIZE) {
			const chunk = files.slice(i, i + CHUNK_SIZE);
			const results = await Promise.all(
				chunk.map(file => this.analyzer.analyze(file, basePath))
			);
			for (const analysis of results) {
				analyses.push(analysis);
				if (analysis.severity) {
					issueCount[analysis.severity]++;
				}
			}
		}

		// Sort
		const severityOrder: Record<Severity | "null", number> = {
			risk: 0,
			required: 1,
			recommend: 2,
			warning: 3,
			null: 4,
		};

		analyses.sort((a, b) => {
			const aOrder = severityOrder[a.severity ?? "null"];
			const bOrder = severityOrder[b.severity ?? "null"];
			if (aOrder !== bOrder) return aOrder - bOrder;
			return b.lines - a.lines;
		});

		const result: ScanResult = {
			files: analyses,
			totalFiles: files.length,
			skippedSmallFiles: skipped,
			issueCount,
		};

		const elapsed = formatElapsed(performance.now() - startTime);
		await this.reporter.processResults(result, elapsed);
	}

	private printHelp() {
		console.log(`
📏 05-file-size-patterns.ts — 파일 크기 및 복잡도 검사

사용법:
  bun .vibe-coding/TOOLS/05-file-size-patterns.ts [경로] [옵션]

옵션:
  --all         모든 이슈 파일 표시 (기본: 상위 20개)
  --json        JSON 형식으로 출력
  --no-report   리포트 파일 생성 생략
  --help, -h    도움말 표시

예시:
  bun .vibe-coding/TOOLS/05-file-size-patterns.ts              # src 전체 스캔
  bun .vibe-coding/TOOLS/05-file-size-patterns.ts src/lib      # 특정 디렉토리
`);
	}
}

function formatElapsed(ms: number): string {
	return ms < 1000 ? `${ms.toFixed(0)}ms` : `${(ms / 1000).toFixed(2)}s`;
}

async function main() {
	try {
		const auditor = new FileSizeAuditor();
		await auditor.run();
	} catch (error) {
		console.error(`${c.red}오류:${c.reset}`, error);
		process.exit(1);
	}
}

main();
