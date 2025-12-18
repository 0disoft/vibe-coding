#!/usr/bin/env bun
/**
 * 06-fix-bold-issues.ts — 마크다운 볼드 파싱 오류 수정 도구
 *
 * Usage:
 *   bun .vibe-coding/TOOLS/06-fix-bold-issues.ts
 *   bun .vibe-coding/TOOLS/06-fix-bold-issues.ts --dry-run
 *   bun .vibe-coding/TOOLS/06-fix-bold-issues.ts --self-test
 */

import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// ─────────────────────────────────────────────────────────────────────────────
// 🔧 Types & Interfaces
// ─────────────────────────────────────────────────────────────────────────────

interface AuditConfig {
	target: string;
	dryRun: boolean;
	noReport: boolean;
	verbose: boolean;
	selfTest: boolean;
}

interface InlineCodeRange {
	start: number;
	end: number;
}

interface FixResult {
	file: string;
	count: number;
	skipped: number;
	skippedLines: number[];
}

interface LineFixResult {
	line: string;
	count: number;
	skipped: boolean;
}

interface BlockFixResult {
	content: string;
	count: number;
	skipped: number;
	skippedLines: number[];
}

// ─────────────────────────────────────────────────────────────────────────────
// 💡 Services & Components
// ─────────────────────────────────────────────────────────────────────────────

/** Service to handle configuration and arguments */
class AuditConfigService {
	public static parseArgs(args: string[]): AuditConfig {
		return {
			target: args.find((arg) => !arg.startsWith('--')) || 'src/content',
			dryRun: args.includes('--dry-run'),
			noReport: args.includes('--no-report'),
			verbose: args.includes('--verbose'),
			selfTest: args.includes('--self-test'),
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
		const targetStat = await stat(target);
		if (targetStat.isFile()) {
			const ext = extname(target);
			if (ext !== '.md' && ext !== '.mdx') {
				throw new Error('Only .md or .mdx files are supported.');
			}
			return [target];
		}
		return this.walk(target);
	}

	private async walk(dir: string, fileList: string[] = []): Promise<string[]> {
		const entries = await readdir(dir, { withFileTypes: true });

		for (const entry of entries) {
			const path = join(dir, entry.name);
			if (entry.isDirectory()) {
				await this.walk(path, fileList); // accumulator 패턴
			} else if (entry.isFile()) {
				const ext = extname(path);
				if (ext === '.md' || ext === '.mdx') fileList.push(path);
			}
		}
		return fileList;
	}
}

/** Service to fix markdown bold issues */
class MarkdownFixer {
	private static ZWS_ENTITY = '&#8203;';
	private static BOLD_ENDING_WITH_PUNCT = /(\*\*(?:(?!\*\*).)+?[.:;!?)]\*\*)/g;

	public async processFile(path: string, config: AuditConfig): Promise<FixResult | null> {
		const original = await readFile(path, 'utf-8');
		const maxSkippedLines = config.verbose ? 500 : 0;
		const fixed = this.fixMarkdownKeepingCodeFences(original, maxSkippedLines);

		if (fixed.content !== original || fixed.skipped > 0) {
			const parts: string[] = [];
			if (fixed.count > 0) parts.push(`${fixed.count}건 수정`);
			if (fixed.skipped > 0) parts.push(`${fixed.skipped}줄 스킵`);

			console.log(`[FIX] ${path}  (${parts.join(', ')})`);

			if (!config.dryRun && fixed.content !== original) {
				await writeFile(path, fixed.content, 'utf-8');
			}
			return { file: path, count: fixed.count, skipped: fixed.skipped, skippedLines: fixed.skippedLines };
		}
		return null;
	}

	// ─────────────────────────────────────────────────────────────────────────────
	// Core Logic
	// ─────────────────────────────────────────────────────────────────────────────

	public fixMarkdownKeepingCodeFences(content: string, maxSkippedLinesToStore: number = 0): BlockFixResult {
		const lineEnding = content.includes('\r\n') ? '\r\n' : '\n';
		const lines = content.split(lineEnding);

		let inFence = false;
		let closingFenceRe: RegExp | null = null; // 정규식 캐싱
		let count = 0;
		let skipped = 0;
		const skippedLines: number[] = [];

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			const stripped = this.stripBlockquote(line).trimStart();

			if (!inFence) {
				const m = stripped.match(/^(`{3,}|~{3,})/);
				if (m) {
					inFence = true;
					const fenceChar = m[1][0];
					const fenceLength = m[1].length;
					// 펜스 진입 시 1회만 정규식 생성
					closingFenceRe = new RegExp(`^${fenceChar}{${fenceLength},}\\s*$`);
					continue;
				}
			} else {
				// 캐싱된 정규식 재사용
				if (closingFenceRe && closingFenceRe.test(stripped)) {
					inFence = false;
					closingFenceRe = null;
				}
				continue;
			}

			const fixed = this.fixLineOutsideInlineCode(line);
			lines[i] = fixed.line;
			count += fixed.count;
			if (fixed.skipped) {
				skipped++;
				if (maxSkippedLinesToStore > 0 && skippedLines.length < maxSkippedLinesToStore) {
					skippedLines.push(i + 1);
				}
			}
		}

		return { content: lines.join(lineEnding), count, skipped, skippedLines };
	}

	public fixLineOutsideInlineCode(line: string): LineFixResult {
		if (!line.includes('**')) {
			return { line, count: 0, skipped: false };
		}

		if (!line.includes('`')) {
			const fixed = this.fixBoldBeforeCJK(line);
			return { line: fixed.text, count: fixed.count, skipped: false };
		}

		const ranges = this.findInlineCodeRanges(line);

		if (ranges.length === 0) {
			return { line, count: 0, skipped: true };
		}

		let result = '';
		let count = 0;
		let lastEnd = 0;

		for (const range of ranges) {
			if (range.end <= lastEnd) continue;

			if (range.start > lastEnd) {
				const outside = line.slice(lastEnd, range.start);
				const fixed = this.fixBoldBeforeCJK(outside);
				result += fixed.text;
				count += fixed.count;
			}

			result += line.slice(Math.max(range.start, lastEnd), range.end);
			lastEnd = Math.max(lastEnd, range.end);
		}

		if (lastEnd < line.length) {
			const outside = line.slice(lastEnd);
			const fixed = this.fixBoldBeforeCJK(outside);
			result += fixed.text;
			count += fixed.count;
		}

		return { line: result, count, skipped: false };
	}

	private fixBoldBeforeCJK(text: string): { text: string; count: number; } {
		let count = 0;
		const result = text.replace(MarkdownFixer.BOLD_ENDING_WITH_PUNCT, (match, _bold, offset) => {
			const nextChar = text[offset + match.length];
			if (this.isCJK(nextChar)) {
				count++;
				return match + MarkdownFixer.ZWS_ENTITY;
			}
			return match;
		});
		return { text: result, count };
	}

	private isCJK(char: string): boolean {
		if (!char) return false;
		const code = char.charCodeAt(0);
		return (
			(code >= 0xac00 && code <= 0xd7af) || // 한글 음절
			(code >= 0x1100 && code <= 0x11ff) || // 한글 자모
			(code >= 0x4e00 && code <= 0x9fff) || // CJK 통합 한자
			(code >= 0x3040 && code <= 0x309f) || // 히라가나
			(code >= 0x30a0 && code <= 0x30ff)    // 가타카나
		);
	}

	private findInlineCodeRanges(line: string): InlineCodeRange[] {
		const ranges: InlineCodeRange[] = [];
		const n = line.length;
		let i = 0;

		while (i < n) {
			if (line[i] !== '`') {
				i++;
				continue;
			}

			const start = i;
			let tickLen = 0;
			while (i < n && line[i] === '`') {
				tickLen++;
				i++;
			}

			let j = i;
			let foundEnd = -1;

			while (j < n) {
				if (line[j] !== '`') {
					j++;
					continue;
				}

				let closeLen = 0;
				while (j < n && line[j] === '`') {
					closeLen++;
					j++;
				}

				if (closeLen === tickLen) {
					foundEnd = j;
					break;
				}
			}

			if (foundEnd !== -1) {
				ranges.push({ start, end: foundEnd });
				i = foundEnd;
			} else {
				return [];
			}
		}

		return ranges;
	}

	private stripBlockquote(line: string): string {
		return line.replace(/^(?:\s*>\s*)+/, '');
	}
}

/** Service to generate reports */
class ReportGenerator {
	constructor(private config: AuditConfig) { }

	public async generateAndSave(results: FixResult[], totalFiles: number, elapsed: string) {
		const report = this.formatReport(results, totalFiles, elapsed);
		console.log(this.formatConsoleOutput(results, elapsed));

		if (!this.config.noReport) {
			const scriptDir = dirname(fileURLToPath(import.meta.url));
			const reportsDir = join(scriptDir, 'reports');
			await mkdir(reportsDir, { recursive: true });
			const reportPath = join(reportsDir, '06-fix-bold-report.txt');
			await writeFile(reportPath, report, 'utf-8');
			console.log(`📝 리포트 저장됨: ${reportPath}`);
		}
	}

	private formatConsoleOutput(results: FixResult[], elapsed: string): string {
		const totalFixes = results.reduce((sum, r) => sum + r.count, 0);
		return `Done. Total fixes: ${totalFixes}\n⏱️ 소요 시간: ${elapsed}`;
	}

	private formatReport(results: FixResult[], totalFiles: number, elapsed: string): string {
		const lines: string[] = [];
		const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

		lines.push(`Fix Bold Issues Report - ${timestamp}`);
		lines.push(`Target: ${this.config.target}`);
		lines.push(`Elapsed: ${elapsed}`);
		lines.push(`Mode: ${this.config.dryRun ? 'DRY RUN (파일 미수정)' : 'APPLIED (파일 수정됨)'}`);
		lines.push('='.repeat(50));

		const totalSkipped = results.reduce((sum, r) => sum + r.skipped, 0);

		if (results.length === 0) {
			lines.push('\n✅ 수정이 필요한 파일이 없습니다.');
		} else {
			lines.push(`\n📝 수정된 파일: ${results.length}개 / 전체 ${totalFiles}개\n`);

			for (const r of results) {
				const parts: string[] = [];
				if (r.count > 0) parts.push(`${r.count}건`);
				if (r.skipped > 0) parts.push(`${r.skipped}줄 스킵`);
				lines.push(`  📄 ${r.file} (${parts.join(', ')})`);

				if (this.config.verbose && r.skippedLines.length > 0) {
					const displayLines = r.skippedLines.slice(0, 10);
					const remaining = Math.max(0, r.skipped - displayLines.length);
					const suffix = remaining > 0 ? ` ... 외 ${remaining}줄` : '';
					const capped = r.skippedLines.length < r.skipped;
					const capNote = capped ? ' (줄번호는 저장 상한으로 일부만 기록됨)' : '';
					lines.push(`       └─ L${displayLines.join(', L')}${suffix}${capNote}`);
				}
			}

			const totalFixes = results.reduce((sum, r) => sum + r.count, 0);
			lines.push(`\n${'─'.repeat(50)}`);
			lines.push(`총 ${totalFixes}건 수정${this.config.dryRun ? ' 예정' : ' 완료'}`);
		}

		if (totalSkipped > 0) {
			lines.push(`\n⚠️  ${totalSkipped}줄이 닫히지 않은 백틱으로 인해 스킵됨 (--verbose로 줄번호 확인)`);
		}

		return lines.join('\n');
	}
}

/** Self-Test Logic */
class SelfTestRunner {
	static run() {
		const fixer = new MarkdownFixer();

		// Line tests
		const lineTests = [
			{ input: '**무료:**이', shouldChange: true, shouldSkip: false, description: '구두점 뒤 한글 조사' },
			{ input: '**무료:** 이', shouldChange: false, shouldSkip: false, description: '구두점 뒤 공백' },
			{ input: '`**무료:**이`', shouldChange: false, shouldSkip: false, description: '인라인 코드 내부' },
			{ input: '``**무료:**이``', shouldChange: false, shouldSkip: false, description: '멀티 백틱 인라인 코드' },
			{ input: '``코드 안에 `백틱` 있고 **무료:**이``', shouldChange: false, shouldSkip: false, description: '멀티 백틱 안에 단일 백틱' },
			{ input: '`닫히지 않은 **무료:**이', shouldChange: false, shouldSkip: true, description: '닫히지 않은 백틱' },
			{ input: '`ok` 그리고 `닫히지 않은 **무료:**이', shouldChange: false, shouldSkip: true, description: '정상 스팬 후 미닫힘 백틱' },
		];

		for (const test of lineTests) {
			const result = fixer.fixLineOutsideInlineCode(test.input);
			const changed = result.line !== test.input;

			if (changed !== test.shouldChange) {
				throw new Error(`Self-test failed: ${test.description} (Expected change: ${test.shouldChange}, Got: ${changed})`);
			}
			if (test.shouldSkip !== undefined && result.skipped !== test.shouldSkip) {
				throw new Error(`Self-test failed: ${test.description} (Expected skip: ${test.shouldSkip}, Got: ${result.skipped})`);
			}
		}

		// Fence test
		const fenceContent = '````markdown\n**무료:**이\n````';
		const fenceResult = fixer.fixMarkdownKeepingCodeFences(fenceContent);
		if (fenceResult.content !== fenceContent) {
			throw new Error('Self-test failed: fence test - content modified');
		}

		// Idempotency test
		const idempotentInput = '**무료:**이';
		const first = fixer.fixLineOutsideInlineCode(idempotentInput);
		const second = fixer.fixLineOutsideInlineCode(first.line);
		if (first.line !== second.line) {
			throw new Error('Self-test failed: idempotency test');
		}

		console.log('✅ Self-test passed');
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// 🚀 Main Entry
// ─────────────────────────────────────────────────────────────────────────────

class FixBoldIssuesTool {
	private config: AuditConfig;
	private logger: ConsoleLogger;
	private scanner: FileScanner;
	private fixer: MarkdownFixer;
	private reporter: ReportGenerator;

	constructor() {
		const args = process.argv.slice(2);
		this.config = AuditConfigService.parseArgs(args);
		this.logger = new ConsoleLogger();
		this.scanner = new FileScanner();
		this.fixer = new MarkdownFixer();
		this.reporter = new ReportGenerator(this.config);
	}

	public async run() {
		if (this.config.selfTest) {
			SelfTestRunner.run();
			process.exit(0);
		}

		this.logger.log(`Scanning: ${this.config.target}`);
		if (this.config.dryRun) this.logger.log('DRY RUN MODE: No files will be modified.');
		if (this.config.verbose) this.logger.log('VERBOSE MODE: Skipped line numbers will be shown.');

		try {
			const startTime = performance.now();
			const files = await this.scanner.scan(this.config.target);
			this.logger.log(`Found ${files.length} markdown file(s).`);

			const results: FixResult[] = [];
			// 병렬 처리: 청크 단위로 Promise.all 실행
			const CHUNK_SIZE = 16;
			for (let i = 0; i < files.length; i += CHUNK_SIZE) {
				const chunk = files.slice(i, i + CHUNK_SIZE);
				const chunkResults = await Promise.all(
					chunk.map(file => this.fixer.processFile(file, this.config))
				);
				for (const result of chunkResults) {
					if (result) results.push(result);
				}
			}

			const elapsed = this.formatElapsed(performance.now() - startTime);
			await this.reporter.generateAndSave(results, files.length, elapsed);

		} catch (error) {
			this.logger.error('Error:', error);
			process.exit(1);
		}
	}

	private formatElapsed(ms: number): string {
		return ms < 1000 ? `${ms.toFixed(0)}ms` : `${(ms / 1000).toFixed(2)}s`;
	}
}

async function main() {
	const tool = new FixBoldIssuesTool();
	await tool.run();
}

main();
