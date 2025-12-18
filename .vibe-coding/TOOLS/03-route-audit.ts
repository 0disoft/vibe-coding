#!/usr/bin/env bun
/**
 * 03-route-audit.ts
 *
 * SvelteKit Route & Link Static Audit Tool
 * - Collects routes from src/routes
 * - Scans src/**, e2e/**, content for broken internal links
 *
 * Usage:
 *   bun .vibe-coding/TOOLS/03-route-audit.ts
 *   bun .vibe-coding/TOOLS/03-route-audit.ts --quiet
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
type LinkKind = 'href' | 'md' | 'goto' | 'fetch' | 'url';
type RouteKind = 'page' | 'endpoint';

interface AuditFinding {
	severity: Severity;
	id: string;
	message: string;
	file?: string;
	line?: number;
	column?: number;
	extra?: Record<string, unknown>;
}

interface RouteDef {
	kind: RouteKind;
	file: string;
	pattern: string;
	regex: RegExp;
	isDynamic: boolean;
	specificity: number;
	hasRest: boolean;
}

interface AuditConfig {
	routesOnly: boolean;
	linksOnly: boolean;
	errorsOnly: boolean;
	jsonOutput: boolean;
	noReport: boolean;
	scanDirs: string[];
	ignorePrefixes: string[];
	verbose: boolean;
	base: string;
	quiet: boolean;
}

interface LinkHit {
	file: string;
	line: number;
	column: number;
	url: string;
	kind: LinkKind;
}

// ─────────────────────────────────────────────────────────────────────────────
// 📏 Constants
// ─────────────────────────────────────────────────────────────────────────────

const SEVERITY_ICON: Record<Severity, string> = {
	error: '❌',
	warning: '⚠️',
	info: '💡',
};

const ROUTES_DIR = join('src', 'routes');
const REPORT_PREFIX = '03-route-audit-report';
const IGNORE_FILE_PATH = join('.vibe-coding', 'TOOLS', 'route-audit.ignore');

const DEFAULT_SCAN_DIRS = ['src', 'e2e'];
const DEFAULT_IGNORE_PREFIXES = ['/__', '/@', '/_app/'];

const ROUTE_FILES = new Set([
	'+page.svelte',
	'+server.ts',
	'+server.js',
	'+page.ts',
	'+page.js',
	'+page.server.ts',
	'+page.server.js',
]);

const LINK_FILE_EXTS = new Set(['.svelte', '.ts', '.js', '.md', '.html']);

const IGNORE_DIRS = new Set([
	'node_modules',
	'.git',
	'.svelte-kit',
	'build',
	'dist',
	'.vibe-coding',
]);

const ASSET_EXTENSIONS = new Set([
	'.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.svg', '.ico',
	'.txt', '.xml', '.json', '.css', '.js', '.map', '.webmanifest',
	'.pdf', '.woff', '.woff2', '.ttf', '.otf',
]);

const LINK_PATTERNS: Array<{ kind: LinkKind; re: RegExp; }> = [
	{ kind: 'href', re: /\b(?:href|action)\s*=\s*["'](\/[^"'\s>]+)["']/g },
	{ kind: 'href', re: /\b(?:href|action)\s*=\s*["']((?:\.\.\/|\.\/)[^"'\s>]+)["']/g },
	{ kind: 'md', re: /\]\((\/[^)\s]+)\)/g },
	{ kind: 'md', re: /\]\(((?:\.\.\/|\.\/)[^)\t\r\n]+)\)/g },
	{ kind: 'goto', re: /\bgoto\s*\(\s*['"`](\/[^'"`]+)['"`]/g },
	{ kind: 'fetch', re: /\bfetch\s*\(\s*['"`](\/[^'"`]+)['"`]/g },
	{ kind: 'url', re: /\bnew\s+URL\s*\(\s*['"`](\/[^'"`]+)['"`]/g },
];

// ─────────────────────────────────────────────────────────────────────────────
// 💡 Services & Components
// ─────────────────────────────────────────────────────────────────────────────

/** Service to handle configuration and arguments */
class AuditConfigService {
	public static parseArgs(args: string[]): AuditConfig {
		const scanDirs = this.getArgValues(args, '--scan');
		const ignorePrefixes = this.getArgValues(args, '--ignore-prefix');
		const baseIndex = args.indexOf('--base');
		const base = baseIndex !== -1 ? args[baseIndex + 1] : '';

		return {
			routesOnly: args.includes('--routes-only'),
			linksOnly: args.includes('--links-only'),
			errorsOnly: args.includes('--errors-only'),
			jsonOutput: args.includes('--json'),
			noReport: args.includes('--no-report'),
			verbose: args.includes('--verbose'),
			quiet: args.includes('--quiet'),
			scanDirs: scanDirs.length ? scanDirs : DEFAULT_SCAN_DIRS,
			ignorePrefixes: ignorePrefixes.length ? ignorePrefixes : DEFAULT_IGNORE_PREFIXES,
			base: base ? (base.startsWith('/') ? base : `/${base}`) : '',
		};
	}

	private static getArgValues(args: string[], name: string): string[] {
		const out: string[] = [];
		for (let i = 0; i < args.length; i++) {
			if (args[i] === name) {
				const val = args[i + 1];
				if (val && !val.startsWith('--')) out.push(val);
			}
		}
		return out;
	}
}

/** Logger for unified output handling */
class ConsoleLogger {
	constructor(private config: AuditConfig) { }

	log(message: string) {
		if (!this.config.quiet) console.log(message);
	}

	warn(message: string, ...args: any[]) {
		if (!this.config.quiet) console.warn(message, ...args);
	}

	error(message: string, ...args: any[]) {
		console.error(message, ...args);
	}

	verbose(message: string, ...args: any[]) {
		if (this.config.verbose && !this.config.quiet) console.log(message, ...args);
	}
}

/** Service to scan and parse routes */
class RouteScanner {
	constructor(private logger: ConsoleLogger) { }

	public async scan(): Promise<{ routes: RouteDef[]; findings: AuditFinding[]; }> {
		const findings: AuditFinding[] = [];
		const st = await stat(ROUTES_DIR).catch(() => null);

		if (!st || !st.isDirectory()) {
			return {
				routes: [],
				findings: [{ severity: 'error', id: 'routes-dir-missing', message: `Routes directory missing: ${ROUTES_DIR}` }],
			};
		}

		const files = (await this.walk(ROUTES_DIR)).filter((p) =>
			ROUTE_FILES.has(this.normalizeSlashes(p).split('/').at(-1) ?? '')
		);

		const byDir = new Map<string, string[]>();
		for (const f of files) {
			const dir = dirname(f);
			const arr = byDir.get(dir) ?? [];
			arr.push(f);
			byDir.set(dir, arr);
		}

		const routes: RouteDef[] = [];
		for (const [dir, dirFiles] of byDir) {
			const relDir = this.normalizeSlashes(relative(ROUTES_DIR, dir));
			const segs = relDir === '' ? [] : relDir.split('/');
			const built = this.buildRouteRegex(segs);

			// Page Route
			const hasPage = dirFiles.some((p) => p.endsWith('+page.svelte'));
			if (hasPage) {
				routes.push({
					kind: 'page',
					file: dirFiles.find((p) => p.endsWith('+page.svelte'))!,
					pattern: built.pattern,
					regex: built.regex,
					isDynamic: built.isDynamic,
					specificity: 0,
					hasRest: /^\//.test(built.pattern) && segs.some((s) => /^[[...][^]]+]]$/.test(s)),
				});
			}

			// Endpoint Route
			const hasEndpoint = dirFiles.some((p) => /\/\+server\.(ts|js)$/.test(this.normalizeSlashes(p)));
			if (hasEndpoint) {
				routes.push({
					kind: 'endpoint',
					file: dirFiles.find((p) => /\/\+server\.(ts|js)$/.test(this.normalizeSlashes(p)))!,
					pattern: built.pattern,
					regex: built.regex,
					isDynamic: built.isDynamic,
					specificity: 0,
					hasRest: segs.some((s) => /^[[...][^]]+]]$/.test(s)),
				});
			}

			// Warning: +page.ts without +page.svelte
			const hasPageLoadOnly = dirFiles.some((p) => /\/\+page\.(ts|js)$/.test(this.normalizeSlashes(p))) && !hasPage;
			if (hasPageLoadOnly) {
				findings.push({
					severity: 'warning',
					id: 'page-load-without-page-svelte',
					message: `Found +page.ts/js but missing +page.svelte: ${built.pattern}`,
					file: dirFiles.find((p) => /\/\+page\.(ts|js)$/.test(this.normalizeSlashes(p)))!,
				});
			}
		}

		this.checkRouteCollisions(routes, findings);
		this.calculateSpecificity(routes);
		this.checkRootCatchAll(routes, findings);

		return { routes, findings };
	}

	private async walk(dir: string, out: string[] = []): Promise<string[]> {
		const entries = await readdir(dir, { withFileTypes: true });
		for (const ent of entries) {
			const full = join(dir, ent.name);
			if (ent.isDirectory()) {
				await this.walk(full, out); // accumulator 패턴: spread 대신 직접 push
			} else if (ent.isFile()) {
				out.push(full);
			}
		}
		return out;
	}

	private normalizeSlashes(p: string): string {
		return p.replace(/\\/g, '/');
	}

	private buildRouteRegex(segments: string[]): { pattern: string; regex: RegExp; isDynamic: boolean; } {
		const visibleSegments = segments.filter((s) => !this.isRouteGroup(s));
		const pattern = `/${visibleSegments.join('/')}`.replace(/\/+$/, '') || '/';

		let src = '^';
		let isDynamic = false;

		for (const seg of segments) {
			if (this.isRouteGroup(seg)) continue;
			const r = this.parseRouteSegmentToRegex(seg);
			if (!r.source) continue;
			if (r.isDynamic) isDynamic = true;

			if (r.isOptional) {
				src += `(?:/${r.source})?`;
			} else {
				src += `/${r.source}`;
			}
		}

		if (src === '^') src = '^/';
		src += '/?$';
		return { pattern, regex: new RegExp(src), isDynamic };
	}

	private parseRouteSegmentToRegex(segment: string): { source: string; isDynamic: boolean; isOptional: boolean; } {
		if (this.isRouteGroup(segment)) return { source: '', isDynamic: false, isOptional: true };

		// [[param]] - 옵셔널 파라미터
		if (/^\[\[([^\]]+)\]\]$/.test(segment)) {
			return { source: '[^/]+', isDynamic: true, isOptional: true };
		}
		// [...rest] - 캐치올
		if (/^\[\.\.\.([^\]]+)\]$/.test(segment)) {
			return { source: '.*', isDynamic: true, isOptional: false };
		}
		// [param] 또는 [param=matcher] - 동적 파라미터
		if (/^\[([^\]]+)\]$/.test(segment)) {
			return { source: '[^/]+', isDynamic: true, isOptional: false };
		}

		const escaped = segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		return { source: escaped, isDynamic: false, isOptional: false };
	}

	private isRouteGroup(segment: string): boolean {
		return segment.startsWith('(') && segment.endsWith(')');
	}

	private checkRouteCollisions(routes: RouteDef[], findings: AuditFinding[]) {
		const seen = new Map<string, RouteDef[]>();
		for (const r of routes) {
			const k = `${r.kind}:${r.pattern.toLowerCase()}`;
			const arr = seen.get(k) ?? [];
			arr.push(r);
			seen.set(k, arr);
		}
		for (const [k, arr] of seen) {
			if (arr.length < 2) continue;
			findings.push({
				severity: 'error',
				id: 'route-collision',
				message: `Route collision detected: ${k}`,
				extra: { routes: arr.map((r) => ({ kind: r.kind, pattern: r.pattern, file: r.file })) },
			});
		}
	}

	private calculateSpecificity(routes: RouteDef[]) {
		for (const r of routes) {
			const parts = r.pattern === '/' ? [] : r.pattern.split('/').filter(Boolean);
			const staticCount = parts.filter((p) => !p.startsWith('[')).length;
			const segCount = parts.length;
			r.specificity = staticCount * 100 + segCount * 10 + (r.hasRest ? -1000 : 0);
		}
		routes.sort((a, b) => b.specificity - a.specificity);
	}

	private checkRootCatchAll(routes: RouteDef[], findings: AuditFinding[]) {
		const rootCatchAll = routes.filter((r) => r.kind === 'page' && r.pattern === '/[...rest]');
		if (rootCatchAll.length) {
			findings.push({
				severity: 'warning',
				id: 'root-catchall-route',
				message: 'Root catch-all route ([...rest]) detected. This may mask broken links.',
				extra: { files: rootCatchAll.map((r) => r.file) },
			});
		}
	}
}

/** Service to audit internal links */
class LinkAuditor {
	constructor(
		private config: AuditConfig,
		private logger: ConsoleLogger
	) { }

	public async audit(routes: RouteDef[]): Promise<AuditFinding[]> {
		const findings: AuditFinding[] = [];
		const files: string[] = [];

		await this.loadIgnoreFile();

		for (const d of this.config.scanDirs) {
			files.push(...(await this.walk(d)));
		}

		const linkFiles = files.filter((p) => LINK_FILE_EXTS.has(extname(p).toLowerCase()));

		if (!this.config.quiet) {
			this.logger.log(`${c.gray}🔎 Scanning links in: ${this.config.scanDirs.join(', ')} (${linkFiles.length} files)${c.reset}`);
		}

		const pages = routes.filter((r) => r.kind === 'page');
		const endpoints = routes.filter((r) => r.kind === 'endpoint');

		// Optimizations: Static map for O(1) lookup
		const staticPages = new Map<string, RouteDef>();
		const staticEndpoints = new Map<string, RouteDef>();
		pages.forEach(r => !r.isDynamic && staticPages.set(this.normalizePathname(r.pattern), r));
		endpoints.forEach(r => !r.isDynamic && staticEndpoints.set(this.normalizePathname(r.pattern), r));

		// Chunk processing to avoid event loop starvation
		const chunkedFiles = this.chunkArray(linkFiles, 50);

		for (const chunk of chunkedFiles) {
			const results = await Promise.all(chunk.map(file => this.scanFile(file, routes, staticPages, staticEndpoints)));
			findings.push(...results.flat());
		}

		return findings;
	}

	private async scanFile(
		filePath: string,
		allRoutes: RouteDef[],
		staticPages: Map<string, RouteDef>,
		staticEndpoints: Map<string, RouteDef>
	): Promise<AuditFinding[]> {
		const content = await readFile(filePath, 'utf-8').catch(() => null);
		if (content === null) return [];

		const out: AuditFinding[] = [];
		const hits = this.extractLinks(content, filePath);

		for (const hit of hits) {
			let pathname = this.processLinkUrl(hit.url, filePath);
			if (!pathname) continue;

			if (this.shouldIgnoreLink(pathname)) continue;

			// Check Static
			const isApi = pathname === '/api' || pathname.startsWith('/api/');
			const staticMatch = isApi ? staticEndpoints.get(pathname) : staticPages.get(pathname);

			if (staticMatch) continue;

			// Check Dynamic
			const matched = this.matchesAny(pathname, allRoutes);
			if (matched) continue;

			out.push({
				severity: 'error',
				id: 'broken-internal-link',
				message: `Broken internal link: ${pathname}`,
				file: hit.file,
				line: hit.line,
				column: hit.column,
				extra: { kind: hit.kind },
			});
		}
		return out;
	}

	private async walk(dir: string, out: string[] = []): Promise<string[]> {
		if (this.shouldIgnorePath(dir)) return out;

		try {
			const entries = await readdir(dir, { withFileTypes: true });
			for (const ent of entries) {
				const full = join(dir, ent.name);
				if (this.shouldIgnorePath(full)) continue;
				if (ent.isDirectory()) {
					await this.walk(full, out); // accumulator 패턴: spread 대신 직접 push
				} else if (ent.isFile()) {
					out.push(full);
				}
			}
		} catch (error) {
			this.logger.verbose(`${c.yellow}⚠️ Walk failed: ${dir}${c.reset}`, error);
		}
		return out;
	}

	private shouldIgnorePath(path: string): boolean {
		const parts = this.normalizeSlashes(path).split('/');
		return parts.some((seg) => IGNORE_DIRS.has(seg));
	}

	private shouldIgnoreLink(pathname: string): boolean {
		if (pathname.startsWith('//')) return true;
		for (const p of this.config.ignorePrefixes) {
			if (pathname === p || pathname.startsWith(p)) return true;
		}
		if (pathname.includes('{') || pathname.includes('}') || pathname.includes('${')) return true;

		const ext = extname(pathname).toLowerCase();
		if (ext && ASSET_EXTENSIONS.has(ext)) return true;

		return false;
	}

	private async loadIgnoreFile() {
		try {
			const content = await readFile(IGNORE_FILE_PATH, 'utf-8');
			const lines = content.split('\n')
				.map(l => l.trim())
				.filter(l => l && !l.startsWith('#'));
			this.config.ignorePrefixes.push(...lines);
		} catch {
			// Ignore missing file
		}
	}

	private extractLinks(content: string, filePath: string): LinkHit[] {
		const hits: LinkHit[] = [];
		const normalizedContent = filePath.endsWith('.md')
			? this.maskMdCode(content)
			: content;

		const lineStarts = this.buildLineStarts(normalizedContent);

		for (const p of LINK_PATTERNS) {
			// 정규식 재사용: new RegExp 대신 lastIndex 리셋
			const re = p.re;
			re.lastIndex = 0;
			let m;
			while ((m = re.exec(normalizedContent)) !== null) {
				const url = m[1];
				if (!url) continue;
				const pos = this.indexToLineCol(lineStarts, m.index);
				hits.push({
					file: filePath,
					line: pos.line,
					column: pos.column,
					url,
					kind: p.kind,
				});
				if (m[0] === '') re.lastIndex++;
			}
		}
		return hits;
	}

	private processLinkUrl(url: string, sourceFile: string): string | null {
		let decoded = url;
		try { decoded = decodeURIComponent(url); } catch { }

		let pathname = this.normalizePathname(decoded);

		if (this.isRelativeUrl(pathname)) {
			const basePath = this.buildSampleBaseFromRouteFile(sourceFile);
			if (!basePath) return null; // Cannot resolve relative link outside routes
			pathname = this.resolveRelativeUrl(pathname, basePath);
		} else {
			if (!pathname.startsWith('/')) return null;
			pathname = this.applyBase(pathname);
		}

		return this.normalizePathname(pathname);
	}

	// Helpers
	private normalizeSlashes(p: string): string {
		return p.replace(/\\/g, '/');
	}

	private normalizePathname(input: string): string {
		let raw = input.trim();
		const q = raw.indexOf('?');
		if (q !== -1) raw = raw.slice(0, q);
		const h = raw.indexOf('#');
		if (h !== -1) raw = raw.slice(0, h);
		if (raw.length > 1 && raw.endsWith('/')) raw = raw.slice(0, -1);
		return raw;
	}

	private isRelativeUrl(url: string): boolean {
		return url.startsWith('./') || url.startsWith('../');
	}

	private applyBase(pathname: string): string {
		const { base } = this.config;
		if (!base) return pathname;
		if (pathname === base) return '/';
		if (pathname.startsWith(`${base}/`)) return pathname.slice(base.length) || '/';
		return pathname;
	}

	private resolveRelativeUrl(url: string, basePath: string): string {
		const base = `http://dummy.local${basePath}`;
		const u = new URL(url, base);
		return u.pathname;
	}

	private buildSampleBaseFromRouteFile(filePath: string): string | null {
		const rel = this.normalizeSlashes(relative(ROUTES_DIR, filePath));
		if (rel.startsWith('..')) return null;
		const dirRel = this.normalizeSlashes(dirname(rel));
		const segs = dirRel === '.' ? [] : dirRel.split('/');

		const sampleSegs: string[] = [];
		for (const seg of segs) {
			if (this.isRouteGroup(seg)) continue;
			if (seg.startsWith('[') && seg.endsWith(']')) {
				sampleSegs.push('x'); // dummy param
			} else {
				sampleSegs.push(seg);
			}
		}
		const path = `/${sampleSegs.join('/')}`.replace(/\/+$/, '');
		return `${path || '/'}/`;
	}

	private isRouteGroup(segment: string): boolean {
		return segment.startsWith('(') && segment.endsWith(')');
	}

	private maskMdCode(content: string): string {
		let lines = content.split('\n');
		let inFence = false;

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (line.trim().match(/^(`{3,}|~{3,})/)) {
				inFence = !inFence;
				lines[i] = '';
				continue;
			}
			if (inFence) lines[i] = '';
		}

		return lines.map(line => {
			const chars = [...line];
			let inCode = false;
			for (let i = 0; i < chars.length; i++) {
				if (chars[i] === '`') inCode = !inCode;
				else if (inCode) chars[i] = ' ';
			}
			return chars.join('');
		}).join('\n');
	}

	private buildLineStarts(content: string): number[] {
		const starts = [0];
		for (let i = 0; i < content.length; i++) {
			if (content[i] === '\n') starts.push(i + 1);
		}
		return starts;
	}

	private indexToLineCol(lineStarts: number[], index: number): { line: number; column: number; } {
		let lo = 0, hi = lineStarts.length;
		while (lo < hi) {
			const mid = (lo + hi) >> 1;
			if (lineStarts[mid] <= index) lo = mid + 1;
			else hi = mid;
		}
		const lineIdx = Math.max(0, lo - 1);
		return { line: lineIdx + 1, column: index - (lineStarts[lineIdx] ?? 0) + 1 };
	}

	private chunkArray<T>(array: T[], size: number): T[][] {
		const result = [];
		for (let i = 0; i < array.length; i += size) {
			result.push(array.slice(i, i + size));
		}
		return result;
	}

	private matchesAny(pathname: string, routes: RouteDef[]): RouteDef | null {
		for (const r of routes) {
			if (r.regex.test(pathname)) return r;
		}
		return null;
	}
}

/** Service to generate reports */
class ReportGenerator {
	constructor(
		private config: AuditConfig,
		private logger: ConsoleLogger
	) { }

	public async processResults(findings: AuditFinding[], routes: RouteDef[], elapsed: number) {
		let outFindings = findings;
		if (this.config.errorsOnly) {
			outFindings = findings.filter((f) => f.severity === 'error');
		}

		outFindings.sort((a, b) => {
			const sev = { error: 0, warning: 1, info: 2 };
			if (sev[a.severity] !== sev[b.severity]) return sev[a.severity] - sev[b.severity];
			if (a.file !== b.file) return (a.file || '').localeCompare(b.file || '');
			return (a.line || 0) - (b.line || 0);
		});

		const elapsedStr = elapsed < 1000 ? `${elapsed.toFixed(0)}ms` : `${(elapsed / 1000).toFixed(2)}s`;
		const reportText = this.config.jsonOutput
			? JSON.stringify({ routes: routes.map(r => r.pattern), findings: outFindings, elapsed: elapsedStr }, null, 2)
			: this.formatReport(outFindings);

		if (!this.config.quiet) {
			console.log(reportText);
			console.log(`\n${c.gray}⏱️  Elapsed: ${elapsedStr}${c.reset}`);
		}

		if (!this.config.noReport) {
			await this.saveReport(reportText, elapsedStr);
		}

		if (outFindings.some(f => f.severity === 'error')) {
			process.exit(1);
		}
	}

	private formatReport(findings: AuditFinding[]): string {
		if (findings.length === 0) return `${c.green}✅ No route issues found.${c.reset}`;

		const byFile = new Map<string, AuditFinding[]>();
		findings.forEach(f => {
			const k = f.file ? relative(process.cwd(), f.file).replace(/\\/g, '/') : '(global)';
			const list = byFile.get(k) || [];
			list.push(f);
			byFile.set(k, list);
		});

		const lines: string[] = [];
		const counts = { error: 0, warning: 0, info: 0 };

		for (const [file, items] of byFile) {
			lines.push(`\n${c.bold}📄 ${file}${c.reset}`);
			for (const item of items) {
				counts[item.severity]++;
				const icon = SEVERITY_ICON[item.severity];
				const color = item.severity === 'error' ? c.red : item.severity === 'warning' ? c.yellow : c.blue;
				const loc = item.line ? ` L${item.line}:${item.column}` : '';
				lines.push(`  ${icon}${c.gray}${loc}${c.reset} ${color}[${item.id}]${c.reset} ${item.message}`);
			}
		}

		lines.push(`\n${c.gray}────────────────────────────────────${c.reset}`);
		lines.push(`Total: ${findings.length} | ${c.red}❌ ${counts.error} Errors${c.reset}, ${c.yellow}⚠️  ${counts.warning} Warnings${c.reset}, ${c.blue}💡 ${counts.info} Info${c.reset}`);
		return lines.join('\n');
	}

	private async saveReport(content: string, elapsed: string) {
		const scriptDir = dirname(fileURLToPath(import.meta.url));
		const reportsDir = join(scriptDir, 'reports');
		await mkdir(reportsDir, { recursive: true });

		const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
		const reportPath = join(reportsDir, `${REPORT_PREFIX}.txt`);

		const plainContent = content.replace(/\x1b\[[0-9;]*m/g, '');
		const header = `Route Audit Report - ${timestamp}\nElapsed: ${elapsed}\n${'='.repeat(50)}\n`;

		await writeFile(reportPath, header + plainContent, 'utf-8');
		if (!this.config.quiet) {
			console.log(`${c.gray}📝 Report saved: ${reportPath}${c.reset}`);
		}
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// 🧠 Main Route Auditor Controller
// ─────────────────────────────────────────────────────────────────────────────

class RouteAuditor {
	private config: AuditConfig;
	private logger: ConsoleLogger;
	private scanner: RouteScanner;
	private linker: LinkAuditor;
	private reporter: ReportGenerator;

	constructor() {
		this.config = AuditConfigService.parseArgs(process.argv.slice(2));
		this.logger = new ConsoleLogger(this.config);
		this.scanner = new RouteScanner(this.logger);
		this.linker = new LinkAuditor(this.config, this.logger);
		this.reporter = new ReportGenerator(this.config, this.logger);
	}

	public async run() {
		this.logger.log(`${c.cyan}🧭 Route Audit${c.reset}`);

		const startTime = performance.now();
		const { routes, findings: routeFindings } = await this.scanner.scan();
		const findings: AuditFinding[] = [...routeFindings];

		const shouldScanRoutes = !this.config.linksOnly;
		const shouldScanLinks = !this.config.routesOnly;

		if (shouldScanRoutes) {
			const pages = routes.filter((r) => r.kind === 'page');
			const endpoints = routes.filter((r) => r.kind === 'endpoint');
			const dynamic = routes.filter((r) => r.isDynamic);
			this.logger.log(
				`${c.gray}📦 Routes found: Pages=${pages.length}, Endpoints=${endpoints.length}, Dynamic=${dynamic.length}${c.reset}`
			);
		}

		if (shouldScanLinks) {
			const linkFindings = await this.linker.audit(routes);
			findings.push(...linkFindings);
		}

		const elapsed = performance.now() - startTime;
		await this.reporter.processResults(findings, routes, elapsed);
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// 🚀 Main Entry
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
	try {
		const auditor = new RouteAuditor();
		await auditor.run();
	} catch (error) {
		console.error(`${c.red}Fatal Error:${c.reset}`, error);
		process.exit(1);
	}
}

main();
