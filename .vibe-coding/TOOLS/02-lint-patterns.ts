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

type RuleScope = 'script' | 'markup' | 'all' | 'server-only';
type CommentMode = 'js' | 'css' | 'markup';
type Severity = 'error' | 'warning' | 'info';

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

interface CodeBlock {
	content: string;
	startLine: number;
	endLine: number;
}

type DsTokenKind = 'component' | 'pattern';

interface DsToken {
	name: string;
	line: number;
	kind: DsTokenKind;
	section: string;
}

interface LintConfig {
	target: string;
	strict: boolean;
	filterSeverity: Severity | null;
	noReport: boolean;
	noDsTokens: boolean;
	quiet: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// 📏 Constants & Rules
// ─────────────────────────────────────────────────────────────────────────────

const SEVERITY_ICON: Record<Severity, string> = {
	error: '❌',
	warning: '⚠️',
	info: '💡',
};

const VALID_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.svelte', '.css'];

const IGNORE_PATTERNS = [
	/(?:^|\/)node_modules(?:\/|$)/,
	/(?:^|\/)\.svelte-kit(?:\/|$)/,
	/(?:^|\/)dist(?:\/|$)/,
	/(?:^|\/)build(?:\/|$)/,
	/(?:^|\/)\.git(?:\/|$)/,
	/(?:^|\/)scripts(?:\/|$)/,
	/(?:^|\/)\.vibe-coding(?:\/|$)/,
	/\/components\/design-system(?:\/|$)/, // DS components use native tags internally
];

const SERVER_FILE_PATTERNS = [
	/\+page\.server\.(ts|tsx|js|jsx)$/,
	/\+layout\.server\.(ts|tsx|js|jsx)$/,
	/\+server\.(ts|tsx|js|jsx)$/,
	/hooks\.server\.(ts|tsx|js|jsx)$/,
	/\/server\//,
	/\.server\.(ts|tsx|js|jsx)$/,
];

const RULES: LintRule[] = [
	// TypeScript Safety
	{
		id: 'no-ts-ignore',
		name: 'No @ts-ignore',
		description: 'Detects @ts-ignore or @ts-nocheck',
		pattern: /@ts-(?:ignore|nocheck)/g,
		suggestion: 'Use @ts-expect-error with a reason, or fix the type issue.',
		severity: 'error',
		scope: 'script',
	},
	{
		id: 'no-non-null-assertion',
		name: 'No Non-null assertion (!)',
		description: 'Detects variable! usage',
		pattern: /\w+!(?:\.|[[(])/g,
		suggestion: 'Use optional chaining (?.) or explicit null checks.',
		severity: 'info',
		scope: 'script',
	},

	// Best Practices
	{
		id: 'prefer-isdef-filter',
		name: 'Prefer isDef in filter',
		description: 'Detects != null checks in filter',
		pattern: /\.filter\s*\([\s\S]*?(?:!=|!==)\s*null/g,
		suggestion: 'Use an isDef type guard for better type inference.',
		severity: 'info',
		scope: 'script',
	},
	{
		id: 'no-console-outside-dev',
		name: 'No console log outside DEV',
		description: 'Detects console usage without DEV guard',
		pattern: /console\.(?:log|warn|error|info|debug)\s*\(/g,
		suggestion: 'Wrap in import.meta.env.DEV check or remove.',
		severity: 'warning',
		scope: 'script',
	},
	{
		id: 'prefer-set-over-includes',
		name: 'Prefer Set over .includes()',
		description: 'Detects .includes() on constant arrays',
		pattern: /(?:ALLOWED|VALUES|LIST|ITEMS|KEYS|IDS)\w*\.includes\s*\(/gi,
		suggestion: 'Convert to new Set() and use .has() for O(1) lookup.',
		severity: 'info',
		scope: 'script',
	},

	// Svelte 5 / SvelteKit 2 Migration
	{
		id: 'no-app-stores',
		name: 'Avoid $app/stores (Deprecated)',
		description: 'Detects $app/stores import',
		pattern: /from\s+['"]?\$app\/stores['"]?/g,
		suggestion: 'Migrate to $app/state (SvelteKit 2.12+).',
		severity: 'warning',
		scope: 'script',
	},
	{
		id: 'no-legacy-store',
		name: 'Legacy Store Usage',
		description: 'Detects writable/readable import',
		pattern: /from\s+['"]?svelte\/store['"]?/g,
		suggestion: 'Use Svelte 5 runes ($state, $derived).',
		severity: 'info',
		scope: 'script',
	},
	{
		id: 'no-reactive-statement',
		name: 'Legacy Reactive Statement ($:)',
		description: 'Detects $: syntax',
		pattern: /^\s*\$: \s+/gm,
		suggestion: 'Use $derived or $effect in Svelte 5.',
		severity: 'info',
		scope: 'script',
	},
	{
		id: 'no-on-directive',
		name: 'Legacy Event Directive (on:)',
		description: 'Detects on:click, etc.',
		pattern: /\bon:[a-z]+\s*=/gi,
		suggestion: 'Use native attributes like onclick, onsubmit in Svelte 5.',
		severity: 'info',
		scope: 'markup',
	},

	// SvelteKit Security
	{
		id: 'no-private-env-client',
		name: 'Private Env in Client',
		description: 'Detects $env/.../private import in client code',
		pattern: /from\s+['"]?\$env\/(?:static|dynamic)\/private['"]?/g,
		suggestion: 'Private env is server-only. Move code to a .server file.',
		severity: 'error',
		scope: 'script',
	},
	{
		id: 'no-browser-globals-server',
		name: 'Browser Globals in Server',
		description: 'Detects window/document usage in server files',
		pattern: /\b(?:window|document|localStorage|sessionStorage|navigator)\b(?!:)/g,
		suggestion: 'Wrap in browser check or move to client-only code.',
		severity: 'error',
		scope: 'server-only',
	},

	// Design System Violations
	{
		id: 'ds-legacy-token',
		name: 'Legacy Color Token',
		description: 'Detects --color-gray-* usage',
		pattern: /--color-(?:gray|red|blue|green|yellow|indigo|purple|pink)-(?:[1-9]00|50)/g,
		suggestion: 'Use Semantic tokens (--color-*, --raw-color-*) from design-system.tokens.css.',
		severity: 'warning',
		scope: 'markup',
	},
	{
		id: 'ds-raw-tailwind-color',
		name: 'Raw Tailwind Color',
		description: 'Detects bg-blue-500 etc.',
		pattern:
			/\b(?:text|bg|border|ring|divide|shadow|from|to|via)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|[1-9]00|950)\b/g,
		suggestion: 'Use Semantic classes (bg-primary, text-muted-foreground).',
		severity: 'warning',
		scope: 'markup',
	},
	{
		id: 'ds-raw-font-family',
		name: 'Raw Font Utility',
		description: 'Detects font-sans, font-mono',
		pattern: /(?<!-)\bfont-(?:sans|serif|mono)\b/g,
		suggestion: 'Use Typography classes (.text-h1, .text-body).',
		severity: 'info',
		scope: 'markup',
	},

	// Design System Component Usage
	{
		id: 'ds-prefer-button',
		name: 'Prefer DsButton',
		description: 'Detects raw <button> tag',
		pattern: /<button\b(?![^>]*class\s*=\s*["'][^"']*ds-button)/gi,
		suggestion: 'Use DsButton or DsIconButton component.',
		severity: 'info',
		scope: 'markup',
	},
	{
		id: 'ds-prefer-input',
		name: 'Prefer DsInput',
		description: 'Detects raw <input> tag',
		pattern: /<input\b(?![^>]*class\s*=\s*["'][^"']*ds-)/gi,
		suggestion: 'Use DsInput + DsField component.',
		severity: 'info',
		scope: 'markup',
	},
	{
		id: 'ds-custom-dropdown',
		name: 'Custom Dropdown Detected',
		description: 'Detects aria-haspopup usage',
		pattern: /\baria-haspopup\s*=\s*["'](?:menu|listbox|dialog)["']/gi,
		suggestion: 'Use DsDropdown component.',
		severity: 'info',
		scope: 'markup',
	},
];

// ─────────────────────────────────────────────────────────────────────────────
// 🧠 LintScanner Class
// ─────────────────────────────────────────────────────────────────────────────

class LintScanner {
	private config: LintConfig;
	private projectRoot: string;

	constructor(config: LintConfig) {
		this.config = config;
		this.projectRoot = process.cwd();
	}

	public async run() {
		if (this.config.strict && !this.config.quiet) {
			console.log(`${c.yellow}⚙️  Strict Mode: Warnings treated as errors${c.reset}`);
		}
		if (!this.config.quiet) {
			console.log(`${c.cyan}🔍 Scanning target: ${c.bold}${this.config.target}${c.reset}`);
		}

		const startTime = performance.now();
		const files = await this.getFiles(this.config.target);

		if (!this.config.quiet) {
			console.log(`${c.gray}📁 Found ${files.length} files${c.reset}\n`);
		}

		// Parallel processing
		const allResults: LintResult[] = [];
		const chunkedFiles = this.chunkArray(files, 50); // Process 50 files at a time

		for (const chunk of chunkedFiles) {
			const chunkResults = await Promise.all(chunk.map((file) => this.lintFile(file)));
			allResults.push(...chunkResults.flat());
		}

		// Design System Token Audit
		if (!this.config.noDsTokens) {
			const dsResults = await this.auditDsTokens(files);
			allResults.push(...dsResults);
		}

		const elapsed = performance.now() - startTime;
		this.processResults(allResults, elapsed);
	}

	private async getFiles(target: string): Promise<string[]> {
		const statInfo = await stat(target);
		if (statInfo.isFile()) {
			return VALID_EXTENSIONS.includes(extname(target)) ? [target] : [];
		}
		return this.walk(target);
	}

	private async walk(dir: string, fileList: string[] = []): Promise<string[]> {
		const entries = await readdir(dir, { withFileTypes: true });

		for (const entry of entries) {
			const path = join(dir, entry.name);
			const normalized = path.replace(/\\/g, '/');

			if (IGNORE_PATTERNS.some((p) => p.test(normalized))) continue;

			if (entry.isDirectory()) {
				await this.walk(path, fileList); // accumulator 패턴: spread 대신 직접 push
			} else if (entry.isFile()) {
				if (VALID_EXTENSIONS.includes(extname(path))) {
					fileList.push(path);
				}
			}
		}
		return fileList;
	}

	private async lintFile(filePath: string): Promise<LintResult[]> {
		try {
			const content = await readFile(filePath, 'utf-8');
			return this.lintContent(content, filePath);
		} catch (error) {
			if (!this.config.quiet) {
				console.warn(`${c.red}Failed to read ${filePath}${c.reset}`, error);
			}
			return [];
		}
	}

	private lintContent(content: string, filePath: string): LintResult[] {
		const results: LintResult[] = [];
		const isSvelte = filePath.endsWith('.svelte');
		const isServer = this.isServerFile(filePath);

		const scriptRules = RULES.filter((r) => r.scope === 'script');
		const markupRules = RULES.filter((r) => r.scope === 'markup');
		const serverRules = RULES.filter((r) => r.scope === 'server-only');

		if (isSvelte) {
			const scriptBlocks = this.extractBlocks(content, 'script');
			const styleBlocks = this.extractBlocks(content, 'style');

			for (const block of scriptBlocks) {
				const lines = block.content.split('\n');
				results.push(...this.lintLines(lines, filePath, scriptRules, block.startLine, [], 'js'));
			}

			const skipRanges = [
				...scriptBlocks.map((b) => ({ start: b.startLine, end: b.endLine })),
				...styleBlocks.map((b) => ({ start: b.startLine, end: b.endLine })),
			];
			const fullLines = content.split('\n');
			results.push(...this.lintLines(fullLines, filePath, markupRules, 0, skipRanges, 'markup'));
		} else if (filePath.endsWith('.css')) {
			const lines = content.split('\n');
			results.push(...this.lintLines(lines, filePath, markupRules, 0, [], 'css'));
		} else {
			const lines = content.split('\n');
			results.push(...this.lintLines(lines, filePath, scriptRules, 0, [], 'js'));
			if (isServer) {
				results.push(...this.lintLines(lines, filePath, serverRules, 0, [], 'js'));
			}
		}

		return results;
	}

	private lintLines(
		lines: string[],
		filePath: string,
		rules: LintRule[],
		lineOffset: number,
		skipRanges: Array<{ start: number; end: number; }>,
		mode: CommentMode
	): LintResult[] {
		const results: LintResult[] = [];
		let inBlockComment = false;
		let devBlockDepth = 0;
		let devGuardPending = false;

		for (let i = 0; i < lines.length; i++) {
			const actualLineIdx = i + lineOffset;
			if (skipRanges.some((r) => actualLineIdx >= r.start && actualLineIdx < r.end)) continue;

			let line = lines[i] ?? '';

			// Strip comments
			const stripped = this.stripComments(line, mode, inBlockComment);
			inBlockComment = stripped.inBlock;
			line = stripped.line;

			if (!line.trim()) continue;

			// DEV Guard Logic

			const { ifDevThisLine, devGuardsConsoleInline } = this.checkDevGuardOnLine(line);

			// Update Depth
			const openBraces = (line.match(/{/g) || []).length;
			const closeBraces = (line.match(/}/g) || []).length;
			const guardOnly = /^\s*if\s*\(\s*import\.meta\.env\.DEV\s*\)\s*$/.test(line);

			const pending = devGuardPending;
			devGuardPending = false;

			if (ifDevThisLine && devBlockDepth === 0) {
				const diff = openBraces - closeBraces;
				if (diff > 0) devBlockDepth = diff;
				else if (guardOnly) devGuardPending = true;
			} else if (pending && devBlockDepth === 0) {
				const diff = openBraces - closeBraces;
				if (openBraces > 0 && diff > 0) devBlockDepth = diff;
			} else if (devBlockDepth > 0) {
				devBlockDepth += openBraces - closeBraces;
				if (devBlockDepth < 0) devBlockDepth = 0;
			}

			// Apply Rules
			for (const rule of rules) {
				if (rule.id === 'no-console-outside-dev' && (devBlockDepth > 0 || devGuardsConsoleInline || pending || this.isServerFile(filePath))) {
					continue;
				}
				if (rule.id === 'no-private-env-client' && this.isServerFile(filePath)) {
					continue;
				}

				const regex = rule.pattern;
				regex.lastIndex = 0;

				if (!regex.global) {
					const match = regex.exec(line);
					if (match) {
						results.push({
							file: filePath,
							line: actualLineIdx + 1,
							column: match.index + 1,
							rule,
							match: match[0],
						});
					}
				} else {
					let match;
					while ((match = regex.exec(line)) !== null) {
						results.push({
							file: filePath,
							line: actualLineIdx + 1,
							column: match.index + 1,
							rule,
							match: match[0],
						});
						if (match[0] === '') regex.lastIndex++;
					}
				}
			}
		}

		return results;
	}

	// ─────────────────────────────────────────────────────────────────────────────
	// 🛠 Helpers
	// ─────────────────────────────────────────────────────────────────────────────

	private checkDevGuardOnLine(line: string) {
		const ifDevThisLine = this.isDevIfLine(line);
		const consoleIdx = line.indexOf('console.');
		const devIdx = line.indexOf('import.meta.env.DEV');
		let devGuardsConsoleInline = false;

		if (consoleIdx !== -1 && devIdx !== -1 && devIdx < consoleIdx) {
			const semi = line.indexOf(';', devIdx);
			const semiBetween = semi !== -1 && semi < consoleIdx;
			if (!semiBetween) {
				const direct = /import\.meta\.env\.DEV\s*&&\s*(?:\(\s*)?console\./.test(line);
				if (direct) {
					devGuardsConsoleInline = true;
				} else if (ifDevThisLine) {
					const condEnd = this.findIfConditionEnd(line);
					const braceOpen = condEnd === -1 ? -1 : line.indexOf('{', condEnd + 1);
					if (braceOpen !== -1 && braceOpen < consoleIdx) {
						const braceClose = this.findMatchingBrace(line, braceOpen);
						devGuardsConsoleInline = braceClose !== -1 && consoleIdx < braceClose;
					} else if (condEnd !== -1) {
						const semiAfter = line.indexOf(';', condEnd + 1);
						devGuardsConsoleInline = semiAfter === -1 || consoleIdx < semiAfter;
					}
				}
			}
		}
		return { ifDevThisLine, devGuardsConsoleInline };
	}

	private findIfConditionEnd(line: string): number {
		const m = /\bif\b/.exec(line);
		if (!m) return -1;
		const open = line.indexOf('(', m.index);
		if (open === -1) return -1;
		let depth = 0;
		for (let i = open; i < line.length; i++) {
			if (line[i] === '(') depth++;
			else if (line[i] === ')') {
				depth--;
				if (depth === 0) return i;
			}
		}
		return -1;
	}

	private findMatchingBrace(line: string, openIdx: number): number {
		let depth = 0;
		for (let i = openIdx; i < line.length; i++) {
			if (line[i] === '{') depth++;
			else if (line[i] === '}') {
				depth--;
				if (depth === 0) return i;
			}
		}
		return -1;
	}

	private isDevIfLine(line: string): boolean {
		const m = /\bif\b/.exec(line);
		if (!m) return false;
		const open = line.indexOf('(', m.index);
		if (open === -1) return false;
		const end = this.findIfConditionEnd(line);
		if (end === -1) return false;
		return line.slice(open + 1, end).includes('import.meta.env.DEV');
	}

	extractBlocks(content: string, tagName: 'script' | 'style'): CodeBlock[] {
		const blocks: CodeBlock[] = [];
		const regex = new RegExp(`<${tagName}[^>]*>([\s\S]*?)<\/${tagName}>`, 'gi');
		let match;
		while ((match = regex.exec(content)) !== null) {
			const tagEndIndex = match.index + match[0].indexOf('>') + 1;
			const beforeContent = content.slice(0, tagEndIndex);
			const startLine = (beforeContent.match(/\n/g) || []).length;
			const beforeMatchEnd = content.slice(0, match.index + match[0].length);
			const endLine = (beforeMatchEnd.match(/\n/g) || []).length;
			blocks.push({
				content: match[1] ?? '',
				startLine,
				endLine: endLine + 1,
			});
		}
		return blocks;
	}

	private stripComments(line: string, mode: CommentMode, inBlock: boolean) {
		let result = '';
		let i = 0;
		const len = line.length;
		let currentInBlock = inBlock;
		let inSingle = false, inDouble = false, inTemplate = false, escaped = false;

		while (i < len) {
			if (currentInBlock) {
				const closeMarker = mode === 'markup' ? '-->' : '*/';
				const closeIdx = line.indexOf(closeMarker, i);
				if (closeIdx === -1) return { line: result, inBlock: true };
				i = closeIdx + closeMarker.length;
				currentInBlock = false;
				continue;
			}

			const char = line[i];
			const next = line[i + 1];

			if (mode === 'js') {
				if (!escaped && char === '\\' && (inSingle || inDouble || inTemplate)) {
					escaped = true;
					result += char;
					i++;
					continue;
				}
				if (!escaped) {
					if (char === "'" && !inDouble && !inTemplate) inSingle = !inSingle;
					else if (char === '"' && !inSingle && !inTemplate) inDouble = !inDouble;
					else if (char === '`' && !inSingle && !inDouble) inTemplate = !inTemplate;
				}
				escaped = false;

				if (!inSingle && !inDouble && !inTemplate) {
					if (char === '/' && next === '/') break;
					if (char === '/' && next === '*') {
						currentInBlock = true;
						i += 2;
						continue;
					}
				}
			} else if (mode === 'css') {
				if (!escaped && char === '\\') {
					escaped = true;
					result += char;
					i++;
					continue;
				}
				if (!escaped) {
					if (char === "'" && !inDouble) inSingle = !inSingle;
					else if (char === '"' && !inSingle) inDouble = !inDouble;
				}
				escaped = false;
				if (!inSingle && !inDouble && char === '/' && next === '*') {
					currentInBlock = true;
					i += 2;
					continue;
				}
			} else { // markup
				if (char === '<' && next === '!' && line.slice(i, i + 4) === '<!--') {
					currentInBlock = true;
					i += 4;
					continue;
				}
			}
			result += char;
			i++;
		}
		return { line: result, inBlock: currentInBlock };
	}

	private isServerFile(filePath: string): boolean {
		const normalized = filePath.replace(/\\/g, '/');
		return SERVER_FILE_PATTERNS.some((p) => p.test(normalized));
	}

	private isTestFile(filePath: string): boolean {
		const normalized = filePath.replace(/\\/g, '/');
		return normalized.includes('/__test__/') || normalized.includes('/__tests__/') || /\.(?:spec|test)\.[^.]+$/.test(normalized);
	}

	private chunkArray<T>(array: T[], size: number): T[][] {
		const result = [];
		for (let i = 0; i < array.length; i += size) {
			result.push(array.slice(i, i + size));
		}
		return result;
	}

	// ─────────────────────────────────────────────────────────────────────────────
	// 🎨 Design System Audit
	// ─────────────────────────────────────────────────────────────────────────────

	private async auditDsTokens(scannedFiles: string[]): Promise<LintResult[]> {
		const tokensPath = join(this.projectRoot, 'src', 'styles', 'design-system.tokens.css');
		const results: LintResult[] = [];

		try {
			const tokensContent = await readFile(tokensPath, 'utf-8');
			const tokens = this.parseDsTokens(tokensContent);

			// Collect all files to check usage against
			const extraAuditFiles = await this.collectDsAuditFiles();
			const auditFilesSet = new Set([...scannedFiles, ...extraAuditFiles]);
			auditFilesSet.delete(tokensPath);
			const auditFiles = Array.from(auditFilesSet);

			// Read all content once
			const fileContents = await Promise.all(
				auditFiles.map(async (f) => {
					try { return await readFile(f, 'utf-8'); } catch { return ''; }
				})
			);

			const dsTokenUnusedRule: LintRule = {
				id: 'ds-component-token-unused',
				name: 'Unused DS Token',
				description: 'Component/Pattern token not found in codebase',
				pattern: /$/,
				suggestion: 'Use var(--token) or remove it.',
				severity: 'warning',
				scope: 'all'
			};

			for (const token of tokens) {
				const isUsed = fileContents.some(c => c.includes(token.name));
				if (!isUsed) {
					results.push({
						file: tokensPath,
						line: token.line,
						column: 1,
						rule: dsTokenUnusedRule,
						match: token.name,
					});
				}
			}

		} catch (error) {
			if (!this.config.quiet) {
				console.warn(`${c.yellow}⚠️  Skipping DS Token audit: ${tokensPath} not found.${c.reset}`);
			}
		}

		return results;
	}

	private parseDsTokens(css: string): DsToken[] {
		const tokens: DsToken[] = [];
		const lines = css.split('\n');
		let currentKind: DsTokenKind | null = null;
		let currentSection: string | null = null;

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i] ?? '';
			const header = line.match(/^\s*\/\*\s*([^*]+?)\s*\*\/\s*$/);

			if (header) {
				const title = header[1]?.trim() ?? '';
				const match = title.match(/^(Component|Pattern):\s*(.+)$/i);
				if (match) {
					currentKind = match[1]?.toLowerCase() as DsTokenKind;
					currentSection = match[2]?.trim() ?? '';
				} else {
					currentKind = null;
					currentSection = null;
				}
			}

			const tokenMatch = line.match(/^\s*(--[a-z0-9-]+)\s*:/i);
			if (tokenMatch && currentKind) {
				tokens.push({
					name: tokenMatch[1] ?? '',
					line: i + 1,
					kind: currentKind,
					section: currentSection ?? tokenMatch[1] ?? '',
				});
			}
		}
		return tokens;
	}

	private async collectDsAuditFiles(): Promise<string[]> {
		const result: string[] = [];
		const dsCss = join(this.projectRoot, 'src', 'styles', 'design-system.css');
		try { if ((await stat(dsCss)).isFile()) result.push(dsCss); } catch { }

		const dsCompDir = join(this.projectRoot, 'src', 'lib', 'components', 'design-system');
		try {
			if ((await stat(dsCompDir)).isDirectory()) {
				const files = await this.walk(dsCompDir);
				result.push(...files.filter(f => !this.isTestFile(f)));
			}
		} catch { }
		return result;
	}

	// ─────────────────────────────────────────────────────────────────────────────
	// 📊 Reporting
	// ─────────────────────────────────────────────────────────────────────────────

	private async processResults(results: LintResult[], elapsed: number) {
		const { strict, filterSeverity, quiet, noReport, target } = this.config;

		// Apply Strict Mode
		if (strict) {
			results = results.map(r => ({
				...r,
				rule: { ...r.rule, severity: r.rule.severity === 'warning' ? 'error' : r.rule.severity }
			}));
		}

		// Filter
		if (filterSeverity) {
			results = results.filter(r => r.rule.severity === filterSeverity);
		}

		// Sort
		results.sort((a, b) => {
			if (a.file !== b.file) return a.file.localeCompare(b.file);
			if (a.line !== b.line) return a.line - b.line;
			return a.column - b.column;
		});

		const elapsedStr = elapsed < 1000 ? `${elapsed.toFixed(0)}ms` : `${(elapsed / 1000).toFixed(2)}s`;
		const reportText = this.formatReport(results);

		// Console Output
		if (!quiet) {
			console.log(reportText);
			console.log(`\n${c.gray}⏱️  Elapsed: ${elapsedStr}${c.reset}`);
		}

		// File Output
		if (!noReport) {
			await this.saveReport(reportText, elapsedStr, target);
		}

		// Exit Code
		if (results.some(r => r.rule.severity === 'error')) {
			process.exit(1);
		}
	}

	private formatReport(results: LintResult[]): string {
		if (results.length === 0) {
			return `${c.green}✅ No lint issues found.${c.reset}`;
		}

		const byFile = new Map<string, LintResult[]>();
		results.forEach(r => {
			const rel = relative(process.cwd(), r.file).replace(/\\/g, '/');
			const list = byFile.get(rel) || [];
			list.push(r);
			byFile.set(rel, list);
		});

		const counts = { error: 0, warning: 0, info: 0 };
		const lines: string[] = [];

		for (const [file, items] of byFile) {
			lines.push(`\n${c.bold}📄 ${file}${c.reset}`);
			for (const r of items) {
				counts[r.rule.severity]++;
				const icon = SEVERITY_ICON[r.rule.severity];
				const color = r.rule.severity === 'error' ? c.red : r.rule.severity === 'warning' ? c.yellow : c.blue;

				lines.push(`  ${icon} ${c.gray}L${r.line}:${r.column}${c.reset} ${color}[${r.rule.id}]${c.reset}`);
				lines.push(`     ${c.dim}${r.rule.name}:${c.reset} "${r.match.trim()}"`);
				lines.push(`     → ${c.green}${r.rule.suggestion}${c.reset}`);
			}
		}

		lines.push(`\n${c.gray}────────────────────────────────────${c.reset}`);
		lines.push(
			`Total: ${results.length} | ${c.red}❌ ${counts.error} Errors${c.reset}, ${c.yellow}⚠️  ${counts.warning} Warnings${c.reset}, ${c.blue}💡 ${counts.info} Info${c.reset}`
		);

		return lines.join('\n');
	}

	private async saveReport(content: string, elapsed: string, target: string) {
		const scriptDir = dirname(fileURLToPath(import.meta.url));
		const reportsDir = join(scriptDir, 'reports');
		await mkdir(reportsDir, { recursive: true });

		const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
		const reportPath = join(reportsDir, '02-lint-report.txt');

		// Strip ANSI codes for text file
		const plainContent = content.replace(/\x1b\[[0-9;]*m/g, '');
		const header = `Lint Report - ${timestamp}\nTarget: ${target}\nElapsed: ${elapsed}\n${'='.repeat(40)}\n`;

		await writeFile(reportPath, header + plainContent, 'utf-8');
		if (!this.config.quiet) {
			console.log(`${c.gray}📝 Report saved: ${reportPath}${c.reset}`);
		}
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// 🚀 Main Entry
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
	const args = process.argv.slice(2);

	const config: LintConfig = {
		target: args.find(a => !a.startsWith('--')) || 'src',
		strict: args.includes('--strict'),
		filterSeverity: args.includes('--errors-only') ? 'error' : null,
		noReport: args.includes('--no-report'),
		noDsTokens: args.includes('--no-ds-tokens'),
		quiet: args.includes('--quiet'),
	};

	try {
		const scanner = new LintScanner(config);
		await scanner.run();
	} catch (error) {
		console.error(`${c.red}Fatal Error:${c.reset}`, error);
		process.exit(1);
	}
}

main();
