#!/usr/bin/env bun
/**
 * stale-files.ts
 * 오래된 파일을 찾아서 보고하는 도구
 *
 * 사용법:
 *   bun .vibe-coding/TOOLS/stale-files.ts [경로] [옵션]
 *
 * 옵션:
 *   --days <N>    N일 이상 수정되지 않은 파일 검색 (기본: 30)
 *   --all         결과 개수 제한 해제 (기본: 상위 50개)
 *   --json        JSON 형식으로 출력
 *   --no-report   리포트 파일 생성 생략
 *   --help, -h    도움말 표시
 */

import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

// ─────────────────────────────────────────────────────────────────────────────
// 🎨 ANSI Colors & Styles
// ─────────────────────────────────────────────────────────────────────────────

const c = {
	reset: "\x1b[0m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	magenta: "\x1b[35m",
	cyan: "\x1b[36m",
	gray: "\x1b[90m",
	bold: "\x1b[1m",
	dim: "\x1b[2m",
};

// ─────────────────────────────────────────────────────────────────────────────
// 🔧 Types & Interfaces
// ─────────────────────────────────────────────────────────────────────────────

interface StaleConfig {
	target: string;
	days: number;
	all: boolean;
	json: boolean;
	noReport: boolean;
}

interface StaleFile {
	relativePath: string;
	absolutePath: string;
	mtime: Date;
	daysOld: number;
	sizeBytes: number;
}

interface StaleResult {
	threshold: number;
	scanDate: string;
	target: string;
	totalFilesScanned: number;
	staleFilesFound: number;
	files: StaleFile[];
}

// ─────────────────────────────────────────────────────────────────────────────
// 📏 Constants
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_DAYS = 30;
const DEFAULT_LIMIT = 50;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const TARGET_EXTENSIONS = new Set([
	".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
	".svelte", ".vue", ".html",
	".css", ".scss", ".sass",
	".json", ".yaml", ".yml", ".toml",
	".md", ".mdx",
]);

const IGNORE_PATTERNS = new Set([
	"node_modules",
	".git",
	"dist",
	"build",
	".svelte-kit",
	".vite",
	"coverage",
	"__snapshots__",
	"paraglide",
	".vibe-coding",
]);

// ─────────────────────────────────────────────────────────────────────────────
// 💡 Services & Components
// ─────────────────────────────────────────────────────────────────────────────

/** Service to handle configuration and arguments */
class ConfigService {
	public static parseArgs(args: string[]): StaleConfig {
		const json = args.includes("--json");
		const noReport = args.includes("--no-report");
		const all = args.includes("--all");

		// --days 파싱
		const daysIdx = args.indexOf("--days");
		let days = DEFAULT_DAYS;
		if (daysIdx !== -1 && args[daysIdx + 1]) {
			const parsed = parseInt(args[daysIdx + 1], 10);
			if (!isNaN(parsed) && parsed > 0) days = parsed;
		}

		// 위치 인자 (경로)
		const positional = args.filter(
			(arg, i) =>
				!arg.startsWith("--") &&
				!arg.startsWith("-") &&
				!(args[i - 1] === "--days")
		);
		const target = positional[0] ?? "src";

		return { target, days, all, json, noReport };
	}
}

/** Logger for unified output handling */
class ConsoleLogger {
	log(message: string) {
		console.log(message);
	}
	error(message: string, ...args: unknown[]) {
		console.error(message, ...args);
	}
}

/** Service to scan files and check staleness */
class StaleFileScanner {
	private now: Date;

	constructor() {
		this.now = new Date();
	}

	public async scan(target: string, thresholdDays: number): Promise<{ files: StaleFile[]; totalScanned: number; }> {
		const targetStat = await stat(target).catch(() => null);
		if (!targetStat) {
			throw new Error(`대상 경로를 찾을 수 없습니다: ${target}`);
		}

		const allFiles: string[] = [];
		if (targetStat.isFile()) {
			if (this.isTargetFile(target)) allFiles.push(target);
		} else {
			await this.walk(target, allFiles);
		}

		const thresholdMs = thresholdDays * MS_PER_DAY;
		const staleFiles: StaleFile[] = [];

		for (const filePath of allFiles) {
			const fileStat = await stat(filePath).catch(() => null);
			if (!fileStat) continue;

			const mtime = fileStat.mtime;
			const ageMs = this.now.getTime() - mtime.getTime();

			if (ageMs >= thresholdMs) {
				const daysOld = Math.floor(ageMs / MS_PER_DAY);
				staleFiles.push({
					relativePath: relative(process.cwd(), filePath).replace(/\\/g, "/"),
					absolutePath: filePath,
					mtime,
					daysOld,
					sizeBytes: fileStat.size,
				});
			}
		}

		// 오래된 순서대로 정렬 (가장 오래된 파일이 먼저)
		staleFiles.sort((a, b) => a.mtime.getTime() - b.mtime.getTime());

		return { files: staleFiles, totalScanned: allFiles.length };
	}

	private async walk(dir: string, fileList: string[]): Promise<void> {
		try {
			const entries = await readdir(dir, { withFileTypes: true });
			for (const entry of entries) {
				const fullPath = join(dir, entry.name);
				if (this.shouldIgnore(fullPath)) continue;

				if (entry.isDirectory()) {
					await this.walk(fullPath, fileList);
				} else if (entry.isFile() && this.isTargetFile(entry.name)) {
					fileList.push(fullPath);
				}
			}
		} catch {
			// 읽기 실패 시 무시
		}
	}

	private shouldIgnore(path: string): boolean {
		const segments = path.split(/[\\/]/);
		return segments.some((seg) => IGNORE_PATTERNS.has(seg));
	}

	private isTargetFile(path: string): boolean {
		const ext = extname(path).toLowerCase();
		return TARGET_EXTENSIONS.has(ext);
	}
}

/** Service to generate reports */
class ReportGenerator {
	constructor(
		private config: StaleConfig,
		private logger: ConsoleLogger
	) { }

	public async processResults(result: StaleResult, elapsed: string) {
		if (this.config.json) {
			this.logger.log(JSON.stringify(result, null, 2));
		} else {
			this.printConsole(result, elapsed);
		}

		if (!this.config.noReport && result.files.length > 0) {
			await this.saveReport(result, elapsed);
		}
	}

	private printConsole(result: StaleResult, elapsed: string) {
		const { threshold, target, totalFilesScanned, staleFilesFound, files } = result;

		this.logger.log(`\n${c.cyan}${c.bold}📅 Stale Files Report${c.reset}`);
		this.logger.log(`${c.gray}──────────────────────────────────────${c.reset}`);
		this.logger.log(`기준일: ${c.yellow}${threshold}일${c.reset} 이상 수정되지 않은 파일`);
		this.logger.log(`검색 대상: ${c.blue}${target}${c.reset}`);
		this.logger.log(`검색일: ${result.scanDate}`);
		this.logger.log(`\n검색: ${totalFilesScanned}개 파일 | 발견: ${c.red}${staleFilesFound}개${c.reset}\n`);

		if (files.length === 0) {
			this.logger.log(`${c.green}✅ ${threshold}일 이상 된 파일이 없습니다.${c.reset}\n`);
			return;
		}

		const displayFiles = this.config.all ? files : files.slice(0, DEFAULT_LIMIT);
		const hasMore = !this.config.all && files.length > DEFAULT_LIMIT;

		for (const file of displayFiles) {
			const daysStr = String(file.daysOld).padStart(4, " ");
			const sizeStr = this.formatSize(file.sizeBytes).padStart(8, " ");
			const dateStr = file.mtime.toISOString().slice(0, 10);

			let color = c.yellow;
			if (file.daysOld >= 180) color = c.red;
			else if (file.daysOld >= 90) color = c.magenta;

			this.logger.log(
				`${color}${daysStr}일${c.reset} ${c.gray}│${c.reset} ${dateStr} ${c.gray}│${c.reset} ${sizeStr} ${c.gray}│${c.reset} ${file.relativePath}`
			);
		}

		if (hasMore) {
			this.logger.log(`\n${c.gray}... 그 외 ${files.length - DEFAULT_LIMIT}개 파일 (--all 옵션으로 전체 보기)${c.reset}`);
		}

		this.logger.log(`\n${c.gray}⏱️ 소요 시간: ${elapsed}${c.reset}\n`);
	}

	private async saveReport(result: StaleResult, elapsed: string) {
		const scriptDir = dirname(fileURLToPath(import.meta.url));
		const reportsDir = join(scriptDir, "reports");
		await mkdir(reportsDir, { recursive: true });

		const reportPath = join(reportsDir, "stale-files-report.txt");

		const lines: string[] = [
			`Stale Files Report - ${result.scanDate}`,
			`Threshold: ${result.threshold} days`,
			`Target: ${result.target}`,
			`Elapsed: ${elapsed}`,
			"=".repeat(60),
			"",
			`검색: ${result.totalFilesScanned}개 파일 | 발견: ${result.staleFilesFound}개`,
			"",
			"Days  │ Last Modified │   Size   │ Path",
			"──────┼───────────────┼──────────┼" + "─".repeat(40),
		];

		for (const file of result.files) {
			const daysStr = String(file.daysOld).padStart(5, " ");
			const sizeStr = this.formatSize(file.sizeBytes).padStart(8, " ");
			const dateStr = file.mtime.toISOString().slice(0, 10);
			lines.push(`${daysStr} │ ${dateStr}    │ ${sizeStr} │ ${file.relativePath}`);
		}

		lines.push("");
		await writeFile(reportPath, lines.join("\n"), "utf-8");
		this.logger.log(`${c.gray}📝 리포트 저장됨: ${reportPath}${c.reset}`);
	}

	private formatSize(bytes: number): string {
		if (bytes < 1024) return `${bytes}B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
		return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// 🚀 Main Entry
// ─────────────────────────────────────────────────────────────────────────────

class StaleFilesTool {
	private config: StaleConfig;
	private logger: ConsoleLogger;
	private scanner: StaleFileScanner;
	private reporter: ReportGenerator;

	constructor() {
		const args = process.argv.slice(2);
		if (args.includes("--help") || args.includes("-h")) {
			this.printHelp();
			process.exit(0);
		}

		this.config = ConfigService.parseArgs(args);
		this.logger = new ConsoleLogger();
		this.scanner = new StaleFileScanner();
		this.reporter = new ReportGenerator(this.config, this.logger);
	}

	public async run() {
		try {
			const startTime = performance.now();
			const { files, totalScanned } = await this.scanner.scan(
				this.config.target,
				this.config.days
			);

			const result: StaleResult = {
				threshold: this.config.days,
				scanDate: new Date().toISOString().slice(0, 19).replace("T", " "),
				target: this.config.target,
				totalFilesScanned: totalScanned,
				staleFilesFound: files.length,
				files,
			};

			const elapsed = this.formatElapsed(performance.now() - startTime);
			await this.reporter.processResults(result, elapsed);

		} catch (error) {
			this.logger.error(`${c.red}오류:${c.reset} ${error instanceof Error ? error.message : error}`);
			process.exit(1);
		}
	}

	private printHelp() {
		console.log(`
${c.cyan}📅 stale-files.ts${c.reset} — 오래된 파일 검색 도구

${c.bold}사용법:${c.reset}
  bun .vibe-coding/TOOLS/stale-files.ts [경로] [옵션]

${c.bold}인자:${c.reset}
  [경로]        검색 대상 경로 (기본: src)

${c.bold}옵션:${c.reset}
  --days <N>    N일 이상 수정되지 않은 파일 검색 (기본: 30)
  --all         결과 개수 제한 해제 (기본: 상위 50개)
  --json        JSON 형식으로 출력
  --no-report   리포트 파일 생성 생략
  --help, -h    도움말 표시

${c.bold}예시:${c.reset}
  bun .vibe-coding/TOOLS/stale-files.ts                  # src에서 30일+ 파일 검색
  bun .vibe-coding/TOOLS/stale-files.ts --days 60        # 60일 이상 된 파일
  bun .vibe-coding/TOOLS/stale-files.ts src/lib --days 90 --all
`);
	}

	private formatElapsed(ms: number): string {
		return ms < 1000 ? `${ms.toFixed(0)}ms` : `${(ms / 1000).toFixed(2)}s`;
	}
}

async function main() {
	const tool = new StaleFilesTool();
	await tool.run();
}

main();
