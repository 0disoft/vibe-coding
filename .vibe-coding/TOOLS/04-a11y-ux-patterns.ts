#!/usr/bin/env bun
/**
 * 04-a11y-ux-patterns.ts
 *
 * Accessibility & UX Pattern Audit Tool
 * - Scans .svelte, .html, .css files
 * - Checks for common a11y issues (alt text, labels, etc.)
 * - Checks for mobile UX anti-patterns (tap-highlight, zoom blocking)
 * - Checks for RTL compatibility
 *
 * Usage:
 *   bun .vibe-coding/TOOLS/04-a11y-ux-patterns.ts
 *   bun .vibe-coding/TOOLS/04-a11y-ux-patterns.ts --quiet
 */

import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

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

type Severity = 'error' | 'warning' | 'info';
type RuleScope = 'markup' | 'style' | 'html' | 'all';

interface LintRule {
	id: string;
	name: string;
	description: string;
	pattern: RegExp;
	suggestion: string;
	severity: Severity;
	scope: RuleScope;
}

interface LintResult {
	file: string;
	line: number;
	column: number;
	rule: LintRule;
	match: string;
}

interface ScannerConfig {
	target: string;
	noReport: boolean;
	filterSeverity: Severity | null;
	quiet: boolean;
	selfTest: boolean;
}

interface CodeBlock {
	content: string;
	startLine: number;
	endLine: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// 📏 Constants & Rules
// ─────────────────────────────────────────────────────────────────────────────

const SEVERITY_ICON: Record<Severity, string> = {
	error: '❌',
	warning: '⚠️',
	info: '💡',
};

const VALID_EXTENSIONS = ['.svelte', '.html', '.css'];

const IGNORE_PATTERNS = [
	/(^|[/\\])node_modules([/\\]|$)/,
	/(^|[/\\])\.svelte-kit([/\\]|$)/,
	/(^|[/\\])dist([/\\]|$)/,
	/(^|[/\\])build([/\\]|$)/,
	/(^|[/\\])\.git([/\\]|$)/,
];

const RULES: LintRule[] = [
	// Image A11y
	{
		id: 'a11y-img-alt-missing',
		name: 'Missing Image Alt',
		description: '<img> tags must have an alt attribute',
		pattern: /<img(?=\s|>|\/>)(?![^>]*\salt\s*=)[^>]*>/gi,
		suggestion: 'Add alt="description" (use alt="" for decorative images)',
		severity: 'error',
		scope: 'markup',
	},

	// Link/Button A11y
	{
		id: 'a11y-empty-link',
		name: 'Empty Link',
		description: '<a> tag with no text content',
		pattern: /<a(?=\s|>)[^>]*>\s*<\/a>/gi,
		suggestion: 'Add link text or aria-label',
		severity: 'error',
		scope: 'markup',
	},
	{
		id: 'a11y-button-type',
		name: 'Missing Button Type',
		description: '<button> should have a type attribute',
		pattern: /<button(?=\s|>)(?![^>]*\stype\s*=)[^>]*>/gi,
		suggestion: 'Add type="button" to prevent accidental form submission',
		severity: 'warning',
		scope: 'markup',
	},
	{
		id: 'a11y-icon-only-interactive',
		name: 'Icon-only Interactive Element',
		description: 'Icon-only buttons/links need aria-label',
		pattern: /<(?:button|a)(?=\s|>)(?![^>]*\saria-label\s*=\s*)(?![^>]*\saria-labelledby\s*=\s*)[^>]*>\s*<(span|i|svg)(?=[\s/>])[^>]*\sclass\s*=\s*["'][^"']*\bi-[^"']*["'][^>]*(\/?>|>[\s\S]*?<\/\1>)\s*<\/(?:button|a)>/gi,
		suggestion: 'Add aria-label or aria-labelledby',
		severity: 'info',
		scope: 'markup',
	},

	// ARIA
	{
		id: 'a11y-tabindex-positive',
		name: 'Positive Tabindex',
		description: 'tabindex > 0 disrupts navigation order',
		pattern: /\btabindex\s*=\s*["']?[1-9]\d*["']?/gi,
		suggestion: 'Use tabindex="0" or tabindex="-1"',
		severity: 'warning',
		scope: 'markup',
	},
	{
		id: 'a11y-popup-no-expanded',
		name: 'Popup without Expanded State',
		description: 'aria-haspopup requires aria-expanded',
		pattern: /<[a-z][\w:-]*\b(?=[^>]*\baria-haspopup\s*=)(?![^>]*\baria-expanded\s*=)[^>]*>/gi,
		suggestion: 'Add aria-expanded={isOpen}',
		severity: 'warning',
		scope: 'markup',
	},

	// Forms
	{
		id: 'a11y-input-missing-label',
		name: 'Possible Missing Input Label',
		description: 'Input needs aria-label or aria-labelledby',
		pattern: /<input(?=\s|>|\/>)(?![^>]*\stype\s*=\s*["']?(?:hidden|submit|button|image|reset)["']?)(?![^>]*\saria-label\s*=)(?![^>]*\saria-labelledby\s*=)[^>]*>/gi,
		suggestion: 'Add aria-label or ensure <label for=...> is used',
		severity: 'info',
		scope: 'markup',
	},

	// RTL Support
	{
		id: 'rtl-position-class',
		name: 'Physical Position Class',
		description: 'Use logical properties for RTL support',
		pattern: /\b(?:left|right)-(?:0|px|auto|\d+)\b/g,
		suggestion: 'Use start-*, end-*',
		severity: 'warning',
		scope: 'markup',
	},
	{
		id: 'rtl-margin-class',
		name: 'Physical Margin Class',
		description: 'Use logical properties for RTL support',
		pattern: /\b(?:ml|mr)-(?:\d+|auto|px)\b/g,
		suggestion: 'Use ms-*, me-*',
		severity: 'info',
		scope: 'markup',
	},
	{
		id: 'rtl-padding-class',
		name: 'Physical Padding Class',
		description: 'Use logical properties for RTL support',
		pattern: /\b(?:pl|pr)-(?:\d+|auto|px)\b/g,
		suggestion: 'Use ps-*, pe-*',
		severity: 'info',
		scope: 'markup',
	},
	{
		id: 'rtl-text-align-class',
		name: 'Physical Text Align',
		description: 'Use logical properties for RTL support',
		pattern: /\btext-(?:left|right)\b/g,
		suggestion: 'Use text-start, text-end',
		severity: 'info',
		scope: 'markup',
	},

	// CSS Patterns
	{
		id: 'mobile-tap-highlight-global',
		name: 'Global Tap Highlight Removal',
		description: 'Avoid removing tap highlight globally',
		pattern: /\*\s*\{[^}]*-webkit-tap-highlight-color\s*:\s*transparent/gi,
		suggestion: 'Limit to .interactive class and ensure :focus-visible is styled',
		severity: 'warning',
		scope: 'style',
	},
];

const MULTIPLE_MAIN_RULE: LintRule = {
	id: 'a11y-multiple-main',
	name: 'Multiple Main Elements',
	description: 'Only one main element allowed per page',
	pattern: /<main\b/gi,
	suggestion: 'Use only one <main> element',
	severity: 'error',
	scope: 'markup',
};

const MOBILE_NO_ZOOM_RULE: LintRule = {
	id: 'mobile-no-zoom',
	name: 'Zoom Blocking',
	description: 'User scalability blocked in viewport',
	pattern: /(?:user-scalable\s*=\s*["']?no["']?|maximum-scale\s*=\s*["']?1["']?)/gi,
	suggestion: 'Allow zooming for accessibility',
	severity: 'error',
	scope: 'all',
};

const ZOOM_BLOCK_PATTERN = /(?:user-scalable\s*=\s*["']?no["']?|maximum-scale\s*=\s*["']?1["']?)/gi;

// ─────────────────────────────────────────────────────────────────────────────
// 💡 Services & Components
// ─────────────────────────────────────────────────────────────────────────────

/** Service to handle configuration and arguments */
class AuditConfigService {
	public static parseArgs(args: string[]): ScannerConfig {
		return {
			target: args.find(a => !a.startsWith('--')) || 'src',
			noReport: args.includes('--no-report'),
			filterSeverity: args.includes('--errors-only') ? 'error'
				: args.includes('--warnings-only') ? 'warning'
					: args.includes('--infos-only') ? 'info' : null,
			quiet: args.includes('--quiet'),
			selfTest: args.includes('--self-test'),
		};
	}
}

/** Logger for unified output handling */
class ConsoleLogger {
	constructor(private config: ScannerConfig) { }

	log(message: string) {
		if (!this.config.quiet) console.log(message);
	}

	error(message: string, ...args: any[]) {
		console.error(message, ...args);
	}
}

/** Service to scan files */
class FileScanner {
	constructor(private config: ScannerConfig) { }

	public async getFiles(target: string): Promise<string[]> {
		const statInfo = await stat(target);
		if (statInfo.isFile()) {
			const ext = extname(target);
			return VALID_EXTENSIONS.includes(ext) ? [target] : [];
		}
		return this.walk(target);
	}

	private async walk(dir: string, files: string[] = []): Promise<string[]> {
		const entries = await readdir(dir, { withFileTypes: true });

		for (const entry of entries) {
			const path = join(dir, entry.name);
			const normalized = path.replace(/\\/g, '/');
			if (IGNORE_PATTERNS.some((p) => p.test(normalized))) continue;

			if (entry.isDirectory()) {
				await this.walk(path, files); // accumulator 패턴: spread 대신 직접 push
			} else if (entry.isFile()) {
				if (VALID_EXTENSIONS.includes(extname(path))) files.push(path);
			}
		}
		return files;
	}
}

/** Service to lint content patterns */
class PatternLinter {
	public async lintFile(filePath: string): Promise<LintResult[]> {
		const content = await readFile(filePath, 'utf-8');
		return this.lintContent(content, filePath);
	}

	public runSelfTests() {
		const rule = RULES.find((r) => r.id === 'a11y-icon-only-interactive');
		if (!rule) throw new Error('Self-test failed: Rule not found');

		const testRe = new RegExp(rule.pattern.source, rule.pattern.flags.replace(/[gy]/g, ''));

		const passes = [
			`<button><svg class="i-x"></svg></button>`,
			`<a><span class="i-lucide"></span></a>`,
			`<button>\n  <svg class="i-x"></svg>\n</button>`,
		];
		const fails = [
			`<button aria-label="close"><svg class="i-x"/></button>`,
			`<button><svg class="i-x"></svg><span>Close</span></button>`,
		];

		passes.forEach(p => { if (!testRe.test(p)) throw new Error(`Expected match failed: ${p}`); });
		fails.forEach(f => { if (testRe.test(f)) throw new Error(`Expected no-match failed: ${f}`); });

		console.log(`${c.green}✅ Self-test passed${c.reset}`);
	}

	private lintContent(content: string, filePath: string): LintResult[] {
		const results: LintResult[] = [];
		const isSvelte = filePath.endsWith('.svelte');
		const isHtml = filePath.endsWith('.html');
		const isCss = filePath.endsWith('.css');

		const markupRules = RULES.filter((r) => r.scope === 'markup' || r.scope === 'all');
		const styleRules = RULES.filter((r) => r.scope === 'style' || r.scope === 'all');

		if (isSvelte) {
			const markupBlocks = this.extractMarkupBlocks(content);
			for (const block of markupBlocks) {
				results.push(...this.lintBlockWhole(block.content, filePath, markupRules, block.startLine));
			}

			const styleBlocks = this.extractStyleBlocks(content);
			for (const block of styleBlocks) {
				results.push(...this.lintBlockWhole(block.content, filePath, styleRules, block.startLine));
			}

			const mainMatches = [...content.matchAll(/<main\b/gi)];
			if (mainMatches.length > 1) {
				results.push(this.createResult(filePath, MULTIPLE_MAIN_RULE, mainMatches[1], content));
			}

			const cleaned = this.stripScriptStyleBlocks(this.stripHtmlComments(content));
			results.push(...this.checkViewportZoom(cleaned, filePath));

		} else if (isHtml) {
			const rules = RULES.filter((r) => ['markup', 'html', 'all'].includes(r.scope));
			results.push(...this.lintBlockWhole(content, filePath, rules, 0, true));

			const cleaned = this.stripScriptStyleBlocks(this.stripHtmlComments(content));
			results.push(...this.checkViewportZoom(cleaned, filePath));

		} else if (isCss) {
			results.push(...this.lintBlockWhole(content, filePath, styleRules));
		}

		return results;
	}

	private lintBlockWhole(
		content: string,
		filePath: string,
		rules: LintRule[],
		lineOffset: number = 0,
		skipScriptStyle: boolean = false
	): LintResult[] {
		let cleanContent = this.stripHtmlComments(content);
		if (skipScriptStyle) cleanContent = this.stripScriptStyleBlocks(cleanContent);

		const results: LintResult[] = [];
		for (const rule of rules) {
			// 정규식 재사용: new RegExp 대신 lastIndex 리셋
			const regex = rule.pattern;
			regex.lastIndex = 0;
			let match;

			while ((match = regex.exec(cleanContent)) !== null) {
				const before = cleanContent.slice(0, match.index);
				const lineInBlock = (before.match(/\n/g) || []).length + 1;
				const lastNl = before.lastIndexOf('\n');
				const colInBlock = match.index - (lastNl === -1 ? 0 : lastNl + 1) + 1;

				const originalMatch = content.slice(match.index, match.index + match[0].length);
				results.push({
					file: filePath,
					line: lineInBlock + lineOffset,
					column: colInBlock,
					rule,
					match: originalMatch.slice(0, 40) + (originalMatch.length > 40 ? '...' : ''),
				});
			}
		}
		return results;
	}

	private checkViewportZoom(content: string, filePath: string): LintResult[] {
		const results: LintResult[] = [];
		const viewportRegex = /<meta\s+[^>]*name\s*=\s*(?:["']viewport["']|viewport(?=[\s/>]))[^>]*>/gi;
		let match;

		while ((match = viewportRegex.exec(content)) !== null) {
			const metaTag = match[0];
			const metaIndex = match.index;

			const zoomPattern = new RegExp(ZOOM_BLOCK_PATTERN.source, 'gi');
			let zoomMatch;

			while ((zoomMatch = zoomPattern.exec(metaTag)) !== null) {
				const before = content.slice(0, metaIndex + zoomMatch.index);
				const line = (before.match(/\n/g) || []).length + 1;
				const lastNl = before.lastIndexOf('\n');
				const column = metaIndex + zoomMatch.index - (lastNl === -1 ? 0 : lastNl + 1) + 1;

				results.push({
					file: filePath,
					line,
					column,
					rule: MOBILE_NO_ZOOM_RULE,
					match: zoomMatch[0],
				});
			}
		}
		return results;
	}

	private createResult(filePath: string, rule: LintRule, match: RegExpMatchArray, fullContent: string): LintResult {
		const idx = match.index ?? 0;
		const before = fullContent.slice(0, idx);
		const line = (before.match(/\n/g) || []).length + 1;
		const lastNl = before.lastIndexOf('\n');
		const column = idx - (lastNl === -1 ? 0 : lastNl + 1) + 1;

		return {
			file: filePath,
			line,
			column,
			rule,
			match: (match[0] || '').slice(0, 40) + ((match[0]?.length || 0) > 40 ? '...' : ''),
		};
	}

	// Helpers
	private extractMarkupBlocks(content: string): CodeBlock[] {
		const lines = content.split(/\r?\n/);
		const blocks: CodeBlock[] = [];
		let inScript = false;
		let inStyle = false;
		let currentBlock: string[] = [];
		let blockStartLine = 0;

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			const trimmed = line.trim();

			if (trimmed.startsWith('<script')) {
				inScript = true;
				if (currentBlock.length > 0) {
					blocks.push({ content: currentBlock.join('\n'), startLine: blockStartLine, endLine: i - 1 });
					currentBlock = [];
				}
				if (line.includes('</script>')) inScript = false;
				continue;
			}
			if (trimmed.startsWith('</script>')) {
				inScript = false;
				blockStartLine = i + 1;
				continue;
			}
			if (trimmed.startsWith('<style')) {
				inStyle = true;
				if (currentBlock.length > 0) {
					blocks.push({ content: currentBlock.join('\n'), startLine: blockStartLine, endLine: i - 1 });
					currentBlock = [];
				}
				if (line.includes('</style>')) inStyle = false;
				continue;
			}
			if (trimmed.startsWith('</style>')) {
				inStyle = false;
				blockStartLine = i + 1;
				continue;
			}

			if (!inScript && !inStyle) {
				if (currentBlock.length === 0) blockStartLine = i;
				currentBlock.push(line);
			}
		}

		if (currentBlock.length > 0) {
			blocks.push({ content: currentBlock.join('\n'), startLine: blockStartLine, endLine: lines.length - 1 });
		}
		return blocks;
	}

	private extractStyleBlocks(content: string): CodeBlock[] {
		const blocks: CodeBlock[] = [];
		const regex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
		let match;
		while ((match = regex.exec(content)) !== null) {
			const tagEndIndex = match.index + match[0].indexOf('>') + 1;
			const beforeContent = content.slice(0, tagEndIndex);
			const startLine = (beforeContent.match(/\n/g) || []).length;
			const beforeMatchEnd = content.slice(0, match.index + match[0].length);
			const endLine = (beforeMatchEnd.match(/\n/g) || []).length;
			blocks.push({ content: match[1], startLine, endLine });
		}
		return blocks;
	}

	private stripHtmlComments(content: string): string {
		return content.replace(/<!--[\s\S]*?-->/g, (match) => match.replace(/[^\n]/g, ' '));
	}

	private stripScriptStyleBlocks(content: string): string {
		return content
			.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, (match) => match.replace(/[^\n]/g, ' '))
			.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, (match) => match.replace(/[^\n]/g, ' '));
	}
}

/** Service to generate reports */
class ReportGenerator {
	constructor(
		private config: ScannerConfig,
		private logger: ConsoleLogger
	) { }

	public async processResults(results: LintResult[], elapsed: string) {
		const errorCount = results.filter((r) => r.rule.severity === 'error').length;
		const warningCount = results.filter((r) => r.rule.severity === 'warning').length;
		const infoCount = results.filter((r) => r.rule.severity === 'info').length;

		const byFile = new Map<string, LintResult[]>();
		results.forEach((r) => {
			const rel = relative(this.config.target.endsWith('.') ? process.cwd() : dirname(this.config.target), r.file);
			const list = byFile.get(rel) || [];
			list.push(r);
			byFile.set(rel, list);
		});

		const lines: string[] = [];
		if (results.length === 0) {
			lines.push(`${c.green}✅ No issues found.${c.reset}`);
		} else {
			for (const [file, items] of byFile) {
				lines.push(`\n${c.bold}📄 ${file}${c.reset}`);
				const sorted = items.sort((a, b) => a.line - b.line || a.column - b.column);
				for (const r of sorted) {
					const icon = SEVERITY_ICON[r.rule.severity];
					const color = r.rule.severity === 'error' ? c.red : r.rule.severity === 'warning' ? c.yellow : c.blue;
					lines.push(`  ${icon} ${c.gray}L${r.line}:${r.column}${c.reset} ${color}[${r.rule.id}]${c.reset}`);
					lines.push(`     ${c.dim}${r.rule.name}:${c.reset} "${r.match}"`);
					lines.push(`     → ${c.green}${r.rule.suggestion}${c.reset}`);
				}
			}
			lines.push(`\n${c.gray}────────────────────────────────────${c.reset}`);
			lines.push(`Total: ${results.length} | ${c.red}❌ ${errorCount} Errors${c.reset}, ${c.yellow}⚠️  ${warningCount} Warnings${c.reset}, ${c.blue}💡 ${infoCount} Info${c.reset}`);
		}

		if (!this.config.quiet) {
			console.log(lines.join('\n'));
			console.log(`\n${c.gray}⏱️  Elapsed: ${elapsed}${c.reset}`);
		}

		if (!this.config.noReport) {
			await this.saveReport(lines.join('\n'), elapsed);
		}

		if (errorCount > 0) process.exit(1);
	}

	private async saveReport(content: string, elapsed: string) {
		const scriptDir = dirname(fileURLToPath(import.meta.url));
		const reportsDir = join(scriptDir, 'reports');
		await mkdir(reportsDir, { recursive: true });

		const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
		const reportPath = join(reportsDir, '04-a11y-ux-report.txt');
		const plainContent = content.replace(/\x1b\[[0-9;]*m/g, '');
		const header = `A11y/UX Report - ${timestamp}\nTarget: ${this.config.target}\nElapsed: ${elapsed}\n${'='.repeat(40)}\n`;

		await writeFile(reportPath, header + plainContent, 'utf-8');
		if (!this.config.quiet) {
			console.log(`${c.gray}📝 Report saved: ${reportPath}${c.reset}`);
		}
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// 🧠 Main Scanner Controller
// ─────────────────────────────────────────────────────────────────────────────

class A11yScanner {
	private config: ScannerConfig;
	private logger: ConsoleLogger;
	private scanner: FileScanner;
	private linter: PatternLinter;
	private reporter: ReportGenerator;

	constructor() {
		this.config = AuditConfigService.parseArgs(process.argv.slice(2));
		this.logger = new ConsoleLogger(this.config);
		this.scanner = new FileScanner(this.config);
		this.linter = new PatternLinter();
		this.reporter = new ReportGenerator(this.config, this.logger);
	}

	public async run() {
		if (this.config.selfTest) {
			this.linter.runSelfTests();
			return;
		}

		this.logger.log(`${c.cyan}🔍 A11y/UX Pattern Audit: ${c.bold}${this.config.target}${c.reset}`);

		const startTime = performance.now();
		const files = await this.scanner.getFiles(this.config.target);

		this.logger.log(`${c.gray}📁 Found ${files.length} files${c.reset}\n`);

		// Parallel Scan
		const resultsArrays = await this.runWithLimit(files, 16, (f) => this.linter.lintFile(f));
		let allResults = resultsArrays.flat();

		const elapsed = performance.now() - startTime;
		const elapsedStr = elapsed < 1000 ? `${elapsed.toFixed(0)}ms` : `${(elapsed / 1000).toFixed(2)}s`;

		// Filter
		if (this.config.filterSeverity) {
			allResults = allResults.filter((r) => r.rule.severity === this.config.filterSeverity);
		}

		// Report
		await this.reporter.processResults(allResults, elapsedStr);
	}

	private async runWithLimit<T, R>(items: readonly T[], limit: number, worker: (item: T) => Promise<R>): Promise<R[]> {
		const results: R[] = [];
		let nextIndex = 0;
		const runner = async () => {
			while (true) {
				const i = nextIndex++;
				if (i >= items.length) return;
				results[i] = await worker(items[i]);
			}
		};
		await Promise.all(Array.from({ length: Math.min(limit, items.length) }, runner));
		return results;
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// 🚀 Main Entry
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
	try {
		const scanner = new A11yScanner();
		await scanner.run();
	} catch (error) {
		console.error(`${c.red}Fatal Error:${c.reset}`, error);
		process.exit(1);
	}
}

main();
