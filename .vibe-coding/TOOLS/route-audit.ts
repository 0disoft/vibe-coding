#!/usr/bin/env bun
/**
 * route-audit.ts
 *
 * SvelteKit 라우트/링크 정적 점검 도구
 * - src/routes 기반으로 페이지/엔드포인트 라우트를 수집
 * - src/**, e2e/**, content markdown에서 내부 링크(/...)를 찾아 존재 여부 점검
 *
 * 사용법:
 *   bun .vibe-coding/TOOLS/route-audit.ts
 *   bun .vibe-coding/TOOLS/route-audit.ts --routes-only
 *   bun .vibe-coding/TOOLS/route-audit.ts --links-only
 *   bun .vibe-coding/TOOLS/route-audit.ts --json
 *   bun .vibe-coding/TOOLS/route-audit.ts --no-report
 */

import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Dirent } from 'node:fs';

type Severity = 'error' | 'warning' | 'info';

type LinkKind = 'href' | 'md' | 'goto' | 'fetch' | 'url';

type AuditFinding = {
  severity: Severity;
  id: string;
  message: string;
  file?: string;
  line?: number;
  column?: number;
  extra?: Record<string, unknown>;
};

type RouteKind = 'page' | 'endpoint';

type RouteDef = {
  kind: RouteKind;
  file: string;
  pattern: string; // 인간이 읽기 쉬운 패턴 (예: /[[lang]]/privacy)
  regex: RegExp; // 매칭용 정규식 (trailing slash 허용)
  isDynamic: boolean;
  specificity: number;
  hasRest: boolean;
};

const ROUTES_DIR = join('src', 'routes');
const REPORT_PREFIX = 'route-audit-report';

const DEFAULT_SCAN_DIRS = ['src', 'e2e'];
const DEFAULT_IGNORE_PREFIXES = ['/__', '/@', '/_app/'];
const IGNORE_FILE_PATH = join('.vibe-coding', 'TOOLS', 'route-audit.ignore');

const ROUTE_FILES = new Set([
  '+page.svelte',
  '+server.ts',
  '+server.js',
  '+page.ts',
  '+page.js',
  '+page.server.ts',
  '+page.server.js'
]);

const LINK_FILE_EXTS = new Set(['.svelte', '.ts', '.js', '.md', '.html']);

const IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  '.svelte-kit',
  'build',
  'dist',
  '.vibe-coding'
]);

const ASSET_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.avif',
  '.svg',
  '.ico',
  '.txt',
  '.xml',
  '.json',
  '.css',
  '.js',
  '.map',
  '.webmanifest',
  '.pdf',
  '.woff',
  '.woff2',
  '.ttf',
  '.otf'
]);

function normalizeSlashes(p: string): string {
  return p.replace(/\\/g, '/');
}

function stripQueryHash(pathname: string): string {
  const q = pathname.indexOf('?');
  const h = pathname.indexOf('#');
  const end = q === -1 ? (h === -1 ? pathname.length : h) : (h === -1 ? q : Math.min(q, h));
  return pathname.slice(0, end);
}

function normalizePathname(input: string): string {
  const raw = stripQueryHash(input.trim());
  if (raw.length > 1 && raw.endsWith('/')) return raw.slice(0, -1);
  return raw;
}

function looksLikeAssetPath(pathname: string): boolean {
  // /something.ext 형태는 대부분 정적 파일
  const ext = extname(pathname).toLowerCase();
  if (!ext) return false;
  // 라우트로 취급할 가능성이 낮은 확장자
  return ASSET_EXTENSIONS.has(ext);
}

function shouldIgnorePath(path: string): boolean {
  const parts = normalizeSlashes(path).split('/');
  return parts.some((seg) => IGNORE_DIRS.has(seg));
}

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  if (shouldIgnorePath(dir)) return out;

  // NOTE: ReturnType<typeof readdir>는 오버로드 마지막 시그니처로 평가되어
  // Dirent<NonSharedBuffer>로 굳어질 수 있으므로(에디터 TS 오류), 명시 타입 사용
  let entries: Dirent<string>[];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (error) {
    // 기본 동작: 조용히 스킵 (툴이 실패보다 결과를 주는 것을 우선)
    // 필요하면 --verbose로 원인 확인
    if (CURRENT_OPTIONS?.verbose) {
      console.warn(`⚠️ walk failed: ${normalizeSlashes(dir)}: ${(error as Error).message}`);
    }
    return out;
  }

  for (const ent of entries) {
    const full = join(dir, ent.name);
    if (shouldIgnorePath(full)) continue;
    if (ent.isDirectory()) {
      out.push(...(await walk(full)));
    } else if (ent.isFile()) {
      out.push(full);
    }
  }

  return out;
}

function isRouteGroup(segment: string): boolean {
  return segment.startsWith('(') && segment.endsWith(')');
}

function parseRouteSegmentToRegex(segment: string): { source: string; isDynamic: boolean; isOptional: boolean } {
  // route group은 URL에 포함되지 않음
  if (isRouteGroup(segment)) return { source: '', isDynamic: false, isOptional: true };

  // [[param]] optional
  const optional = segment.match(/^\[\[([^\]]+)\]\]$/);
  if (optional) {
    return { source: '[^/]+', isDynamic: true, isOptional: true };
  }

  // [...rest] rest
  const rest = segment.match(/^\[\.\.\.([^\]]+)\]$/);
  if (rest) {
    // 빈 문자열도 허용 (예: /foo 와 /foo/bar 모두)
    return { source: '.*', isDynamic: true, isOptional: false };
  }

  // [param] or [param=matcher]
  const param = segment.match(/^\[([^\]=]+)(?:=[^\]]+)?\]$/);
  if (param) {
    return { source: '[^/]+', isDynamic: true, isOptional: false };
  }

  // static
  const escaped = segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return { source: escaped, isDynamic: false, isOptional: false };
}

function buildRouteRegex(segments: string[]): { pattern: string; regex: RegExp; isDynamic: boolean } {
  // segments는 routes/ 아래 상대경로의 디렉토리 세그먼트
  const visibleSegments = segments.filter((s) => !isRouteGroup(s));
  const pattern = `/${visibleSegments.join('/')}`.replace(/\/+$/, '') || '/';

  let src = '^';
  let isDynamic = false;
  let staticCount = 0;
  let segmentCount = 0;
  let hasRest = false;

  for (const seg of segments) {
    if (isRouteGroup(seg)) continue;
    segmentCount++;
    if (/^\[\.\.\.[^\]]+\]$/.test(seg)) hasRest = true;
    const r = parseRouteSegmentToRegex(seg);
    if (!r.source) continue;
    if (r.isDynamic) isDynamic = true;
    if (!r.isDynamic) staticCount++;

    if (r.isOptional) {
      src += `(?:/${r.source})?`;
    } else {
      src += `/${r.source}`;
    }
  }

  // root
  if (src === '^') src = '^/';
  src += '/?$';
  return { pattern, regex: new RegExp(src), isDynamic };
}

async function collectRoutes(): Promise<{ routes: RouteDef[]; findings: AuditFinding[] }> {
  const findings: AuditFinding[] = [];

  const st = await stat(ROUTES_DIR).catch(() => null);
  if (!st || !st.isDirectory()) {
    return {
      routes: [],
      findings: [{ severity: 'error', id: 'routes-dir-missing', message: `routes 폴더가 없습니다: ${ROUTES_DIR}` }]
    };
  }

  const files = (await walk(ROUTES_DIR)).filter((p) => ROUTE_FILES.has(normalizeSlashes(p).split('/').at(-1) ?? ''));

  // 디렉토리별로 라우트 파일 묶기
  const byDir = new Map<string, string[]>();
  for (const f of files) {
    const dir = dirname(f);
    const arr = byDir.get(dir) ?? [];
    arr.push(f);
    byDir.set(dir, arr);
  }

  const routes: RouteDef[] = [];
  for (const [dir, dirFiles] of byDir) {
    const relDir = normalizeSlashes(relative(ROUTES_DIR, dir));
    const segs = relDir === '' ? [] : relDir.split('/');
    const built = buildRouteRegex(segs);

    // +page.svelte가 있어야 "페이지 라우트"로 취급
    const hasPage = dirFiles.some((p) => p.endsWith('+page.svelte'));
    if (hasPage) {
      routes.push({
        kind: 'page',
        file: dirFiles.find((p) => p.endsWith('+page.svelte'))!,
        pattern: built.pattern,
        regex: built.regex,
        isDynamic: built.isDynamic,
        specificity: 0,
        hasRest: /^\//.test(built.pattern) && segs.some((s) => /^\[\.\.\.[^\]]+\]$/.test(s))
      });
    }

    const hasEndpoint = dirFiles.some((p) => /\/\+server\.(ts|js)$/.test(normalizeSlashes(p)));
    if (hasEndpoint) {
      routes.push({
        kind: 'endpoint',
        file: dirFiles.find((p) => /\/\+server\.(ts|js)$/.test(normalizeSlashes(p)))!,
        pattern: built.pattern,
        regex: built.regex,
        isDynamic: built.isDynamic,
        specificity: 0,
        hasRest: segs.some((s) => /^\[\.\.\.[^\]]+\]$/.test(s))
      });
    }

    // +page.ts만 있고 +page.svelte가 없으면 "의도 실수" 가능성 경고
    const hasPageLoadOnly = dirFiles.some((p) => /\/\+page\.(ts|js)$/.test(normalizeSlashes(p))) && !hasPage;
    if (hasPageLoadOnly) {
      findings.push({
        severity: 'warning',
        id: 'page-load-without-page-svelte',
        message: `+page.ts(+page.js)는 있는데 +page.svelte가 없습니다: ${built.pattern}`,
        file: dirFiles.find((p) => /\/\+page\.(ts|js)$/.test(normalizeSlashes(p)))!
      });
    }
  }

  // 경로 충돌 점검 (Windows는 대소문자 구분이 없으므로)
  const key = (r: RouteDef) => `${r.kind}:${r.pattern.toLowerCase()}`;
  const seen = new Map<string, RouteDef[]>();
  for (const r of routes) {
    const k = key(r);
    const arr = seen.get(k) ?? [];
    arr.push(r);
    seen.set(k, arr);
  }
  for (const [k, arr] of seen) {
    if (arr.length < 2) continue;
    findings.push({
      severity: 'error',
      id: 'route-collision',
      message: `라우트 충돌(대소문자/구조): ${k}`,
      extra: { routes: arr.map((r) => ({ kind: r.kind, pattern: r.pattern, file: normalizeSlashes(r.file) })) }
    });
  }

  // specificity 계산 + 정렬(매칭 안정성)
  for (const r of routes) {
    const parts = r.pattern === '/' ? [] : r.pattern.split('/').filter(Boolean);
    const staticCount = parts.filter((p) => !p.startsWith('[')).length;
    const segCount = parts.length;
    r.specificity = staticCount * 100 + segCount * 10 + (r.hasRest ? -1000 : 0);
  }
  routes.sort((a, b) => b.specificity - a.specificity);

  // 루트 catch-all 경고 (거의 모든 경로가 매칭되어 broken link 탐지가 무의미해질 수 있음)
  const rootCatchAll = routes.filter((r) => r.kind === 'page' && r.pattern === '/[...rest]');
  if (rootCatchAll.length) {
    findings.push({
      severity: 'warning',
      id: 'root-catchall-route',
      message: '루트 catch-all([...rest]) 라우트가 있어 broken link 탐지가 약해질 수 있습니다.',
      extra: { files: rootCatchAll.map((r) => normalizeSlashes(r.file)) }
    });
  }

  return { routes, findings };
}

type LinkHit = {
  file: string;
  line: number;
  column: number;
  url: string;
  kind: LinkKind;
};

const LINK_PATTERNS: Array<{ kind: LinkKind; re: RegExp }> = [
  { kind: 'href', re: /\b(?:href|action)\s*=\s*["'](\/[^"'\s>]+)["']/g },
  { kind: 'href', re: /\b(?:href|action)\s*=\s*["']((?:\.\.\/|\.\/)[^"'\s>]+)["']/g },
  { kind: 'md', re: /\]\((\/[^)\s]+)\)/g },
  { kind: 'md', re: /\]\(((?:\.\.\/|\.\/)[^) \t\r\n]+)\)/g },
  { kind: 'goto', re: /\bgoto\s*\(\s*['"`](\/[^'"`]+)['"`]/g },
  { kind: 'fetch', re: /\bfetch\s*\(\s*['"`](\/[^'"`]+)['"`]/g },
  { kind: 'url', re: /\bnew\s+URL\s*\(\s*['"`](\/[^'"`]+)['"`]/g }
];

type Options = {
  routesOnly: boolean;
  linksOnly: boolean;
  errorsOnly: boolean;
  jsonOutput: boolean;
  noReport: boolean;
  scanDirs: string[];
  ignorePrefixes: string[];
  verbose: boolean;
  base: string;
};

function parseArgs(argv: string[]): Options | { help: true } {
  if (argv.includes('--help') || argv.includes('-h')) return { help: true };

  const takeMany = (name: string): string[] => {
    const out: string[] = [];
    for (let i = 0; i < argv.length; i++) {
      const a = argv[i];
      if (a === name) {
        const v = argv[i + 1];
        if (!v || v.startsWith('--')) continue;
        out.push(v);
      } else if (a.startsWith(`${name}=`)) {
        out.push(a.slice(name.length + 1));
      }
    }
    return out;
  };

  const scanDirs = takeMany('--scan');
  const ignorePrefixes = takeMany('--ignore-prefix');
  const baseRaw = takeMany('--base')[0];
  const base = baseRaw ? normalizePathname(baseRaw.startsWith('/') ? baseRaw : `/${baseRaw}`) : '';

  return {
    routesOnly: argv.includes('--routes-only'),
    linksOnly: argv.includes('--links-only'),
    errorsOnly: argv.includes('--errors-only'),
    jsonOutput: argv.includes('--json'),
    noReport: argv.includes('--no-report'),
    scanDirs: scanDirs.length ? scanDirs : DEFAULT_SCAN_DIRS,
    ignorePrefixes: ignorePrefixes.length ? ignorePrefixes : DEFAULT_IGNORE_PREFIXES,
    verbose: argv.includes('--verbose'),
    base
  };
}

let CURRENT_OPTIONS: Options | null = null;

async function readIgnoreFile(): Promise<string[]> {
  const content = await readFile(IGNORE_FILE_PATH, 'utf-8').catch(() => null);
  if (!content) return [];

  const lines = content
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));

  // 중복 제거 + 정렬
  return Array.from(new Set(lines)).sort((a, b) => a.localeCompare(b));
}

function stripMdCodeFences(content: string): string {
  // ``` ~~~ code fence 제거 (정교한 마크다운 파서 대신 오탐 방지용)
  const lines = content.split('\n');
  let inFence = false;
  let fenceChar: '`' | '~' | null = null;
  let fenceLen = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const t = line.trimStart();
    const m = t.match(/^(`{3,}|~{3,})/);
    if (m) {
      const token = m[1];
      const ch = token[0] as '`' | '~';
      const len = token.length;

      if (!inFence) {
        inFence = true;
        fenceChar = ch;
        fenceLen = len;
      } else if (fenceChar === ch && len >= fenceLen) {
        inFence = false;
        fenceChar = null;
        fenceLen = 0;
      }

      // fence 라인 자체는 제거
      lines[i] = '';
      continue;
    }

    if (inFence) lines[i] = '';
  }

  return lines.join('\n');
}

function buildLineStarts(content: string): number[] {
  const starts = [0];
  for (let i = 0; i < content.length; i++) {
    if (content[i] === '\n') starts.push(i + 1);
  }
  return starts;
}

function indexToLineCol(lineStarts: number[], index: number): { line: number; column: number } {
  // upper_bound(lineStarts, index) - 1
  let lo = 0;
  let hi = lineStarts.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (lineStarts[mid] <= index) lo = mid + 1;
    else hi = mid;
  }
  const lineIdx = Math.max(0, lo - 1);
  const lineStart = lineStarts[lineIdx] ?? 0;
  return { line: lineIdx + 1, column: index - lineStart + 1 };
}

function maskMdInlineCode(line: string): string {
  // 인라인 코드(`...`)는 링크로 오탐될 수 있어 동일 길이의 공백으로 마스킹
  // 중첩/복잡한 케이스까지 완벽 지원은 아니지만, 일반적인 사용에서 오탐을 크게 줄임
  const chars = [...line];
  let i = 0;
  let inSpan = false;
  let spanLen = 0;
  let spanStart = 0;

  const isBacktickAt = (idx: number) => chars[idx] === '`';
  const countRun = (idx: number) => {
    let n = 0;
    while (idx + n < chars.length && chars[idx + n] === '`') n++;
    return n;
  };

  while (i < chars.length) {
    if (!isBacktickAt(i)) {
      i++;
      continue;
    }

    const run = countRun(i);
    if (!inSpan) {
      inSpan = true;
      spanLen = run;
      spanStart = i;
      i += run;
      continue;
    }

    if (run >= spanLen) {
      // [spanStart, i+run) 구간 마스킹
      for (let k = spanStart; k < i + run; k++) chars[k] = ' ';
      inSpan = false;
      spanLen = 0;
      spanStart = 0;
      i += run;
      continue;
    }

    i += run;
  }

  // 닫히지 않은 인라인 코드도 마스킹
  if (inSpan) {
    for (let k = spanStart; k < chars.length; k++) chars[k] = ' ';
  }

  return chars.join('');
}

function extractLinks(content: string, filePath: string): LinkHit[] {
  const hits: LinkHit[] = [];
  const normalizedContent = filePath.endsWith('.md')
    ? stripMdCodeFences(content)
        .split('\n')
        .map(maskMdInlineCode)
        .join('\n')
    : content;
  const lineStarts = buildLineStarts(normalizedContent);

  // RegExp의 lastIndex는 mutable이므로, 병렬 실행 안전을 위해 호출마다 clone
  const patterns = LINK_PATTERNS.map((p) => ({ kind: p.kind, re: new RegExp(p.re.source, p.re.flags) }));

  for (const p of patterns) {
    p.re.lastIndex = 0;
    // biome-ignore lint/suspicious/noAssignInExpressions: standard regex loop pattern
    let m: RegExpExecArray | null;
    while ((m = p.re.exec(normalizedContent)) !== null) {
      const url = m[1];
      if (!url) continue;
      const pos = indexToLineCol(lineStarts, m.index);
      hits.push({
        file: filePath,
        line: pos.line,
        column: pos.column,
        url,
        kind: p.kind
      });
      if (m[0] === '') p.re.lastIndex++;
    }
  }

  return hits;
}

function isRelativeUrl(url: string): boolean {
  return url.startsWith('./') || url.startsWith('../');
}

function shouldIgnoreLink(pathname: string, ignorePrefixes: string[]): boolean {
  if (pathname.startsWith('//')) return true;
  for (const p of ignorePrefixes) {
    if (pathname === p || pathname.startsWith(p)) return true;
  }
  if (pathname.includes('{') || pathname.includes('}') || pathname.includes('${')) return true;
  if (looksLikeAssetPath(pathname)) return true;
  return false;
}

function matchesAny(pathname: string, routes: RouteDef[]): RouteDef | null {
  for (const r of routes) {
    if (r.regex.test(pathname)) return r;
  }
  return null;
}

function applyBase(pathname: string, base: string): string {
  if (!base) return pathname;
  if (pathname === base) return '/';
  if (pathname.startsWith(`${base}/`)) return pathname.slice(base.length) || '/';
  return pathname;
}

function buildSampleBaseFromRouteFile(filePath: string): string | null {
  const rel = normalizeSlashes(relative(ROUTES_DIR, filePath));
  if (rel.startsWith('..')) return null;
  const dirRel = normalizeSlashes(dirname(rel));
  const segs = dirRel === '.' ? [] : dirRel.split('/');

  const sampleSegs: string[] = [];
  for (const seg of segs) {
    if (isRouteGroup(seg)) continue;
    if (seg.startsWith('[') && seg.endsWith(']')) {
      // [[x]], [x], [x=matcher], [...x]
      sampleSegs.push('x');
      continue;
    }
    sampleSegs.push(seg);
  }

  const basePath = `/${sampleSegs.join('/')}`.replace(/\/+$/, '');
  return `${basePath || '/'}/`;
}

function resolveRelativeUrl(url: string, basePath: string): string {
  // basePath는 반드시 / 로 시작하고 / 로 끝나야 함
  const base = `http://route-audit.local${basePath}`;
  const u = new URL(url, base);
  return u.pathname;
}

async function auditLinks(routes: RouteDef[], options: Options): Promise<AuditFinding[]> {
  const findings: AuditFinding[] = [];

  const files: string[] = [];
  for (const d of options.scanDirs) {
    files.push(...(await walk(d)));
  }

  const linkFiles = files.filter((p) => LINK_FILE_EXTS.has(extname(p).toLowerCase()));

  const pages = routes.filter((r) => r.kind === 'page').sort((a, b) => b.specificity - a.specificity);
  const endpoints = routes.filter((r) => r.kind === 'endpoint').sort((a, b) => b.specificity - a.specificity);

  const staticPages = new Map<string, RouteDef>();
  for (const r of pages) {
    if (!r.isDynamic) staticPages.set(normalizePathname(r.pattern), r);
  }
  const staticEndpoints = new Map<string, RouteDef>();
  for (const r of endpoints) {
    if (!r.isDynamic) staticEndpoints.set(normalizePathname(r.pattern), r);
  }

  const runWithLimit = async <T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> => {
    const results: R[] = [];
    let idx = 0;

    const worker = async () => {
      while (true) {
        const i = idx++;
        if (i >= items.length) return;
        results[i] = await fn(items[i]);
      }
    };

    const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
    await Promise.all(workers);
    return results;
  };

  const perFileFindings = await runWithLimit(linkFiles, 16, async (filePath) => {
    const content = await readFile(filePath, 'utf-8').catch((error) => {
      if (options.verbose) {
        console.warn(`⚠️ readFile failed: ${normalizeSlashes(filePath)}: ${(error as Error).message}`);
      }
      return null;
    });
    if (content == null) return [] as AuditFinding[];

    const out: AuditFinding[] = [];
    const hits = extractLinks(content, filePath);
    for (const hit of hits) {
      let decoded = hit.url;
      try {
        decoded = decodeURIComponent(decoded);
      } catch {
        // noop (원본 그대로 검사)
      }

      let pathname = normalizePathname(decoded);

      if (isRelativeUrl(pathname)) {
        // 상대 경로는 routes 파일에서만 제한적으로 해석 가능
        const basePath = buildSampleBaseFromRouteFile(filePath);
        if (!basePath) {
          if (options.verbose) {
            out.push({
              severity: 'info',
              id: 'relative-link-skipped',
              message: `상대 링크는 routes 밖에서는 해석할 수 있어 스킵합니다: ${pathname}`,
              file: hit.file,
              line: hit.line,
              column: hit.column,
              extra: { kind: hit.kind }
            });
          }
          continue;
        }
        pathname = resolveRelativeUrl(pathname, basePath);
      } else {
        // 절대 경로만 base 처리 가능
        if (!pathname.startsWith('/')) continue;
        pathname = applyBase(pathname, options.base);
      }

      pathname = normalizePathname(pathname);
      if (shouldIgnoreLink(pathname, options.ignorePrefixes)) continue;

      const isApi = pathname === '/api' || pathname.startsWith('/api/');
      const staticMatch = isApi ? staticEndpoints.get(pathname) : staticPages.get(pathname);
      const matched = staticMatch ?? matchesAny(pathname, isApi ? endpoints : pages);
      if (matched) continue;

      // 동적 라우트/선택적 세그먼트로 매칭될 수도 있으니 전체 라우트에서 재확인
      const any = matchesAny(pathname, routes);
      if (any) continue;

      out.push({
        severity: 'error',
        id: 'broken-internal-link',
        message: `내부 링크가 라우트에 매칭되지 않습니다: ${pathname}`,
        file: hit.file,
        line: hit.line,
        column: hit.column,
        extra: { kind: hit.kind }
      });
    }
    return out;
  });

  findings.push(...perFileFindings.flat());

  return findings;
}

function formatFindings(findings: AuditFinding[], basePath: string): string {
  if (findings.length === 0) return '✅ 문제가 발견되지 않았습니다.';

  const toRel = (p: string) => normalizeSlashes(relative(basePath, p));
  const byFile = new Map<string, AuditFinding[]>();

  for (const f of findings) {
    const key = f.file ? toRel(f.file) : '(global)';
    const arr = byFile.get(key) ?? [];
    arr.push(f);
    byFile.set(key, arr);
  }

  const sevOrder: Record<Severity, number> = { error: 0, warning: 1, info: 2 };
  const icon: Record<Severity, string> = { error: '❌', warning: '⚠️', info: '💡' };

  const lines: string[] = [];
  const counts = { error: 0, warning: 0, info: 0 };

  const files = [...byFile.keys()].sort((a, b) => a.localeCompare(b));
  for (const file of files) {
    const items = (byFile.get(file) ?? []).sort((a, b) => {
      const s = sevOrder[a.severity] - sevOrder[b.severity];
      if (s !== 0) return s;
      const la = a.line ?? 0;
      const lb = b.line ?? 0;
      if (la !== lb) return la - lb;
      return (a.column ?? 0) - (b.column ?? 0);
    });

    lines.push(`\n📄 ${file}`);
    for (const it of items) {
      counts[it.severity]++;
      const loc = it.line ? ` L${it.line}:${it.column ?? 1}` : '';
      lines.push(`  ${icon[it.severity]}${loc} [${it.id}] ${it.message}`);
    }
  }

  lines.push('\n────────────────────────────────────');
  lines.push(
    `총 ${findings.length}개 이슈: ❌ ${counts.error} 오류, ⚠️ ${counts.warning} 경고, 💡 ${counts.info} 정보`
  );

  return lines.join('\n');
}

function printHelp(): void {
  console.log(`
🧭 route-audit.ts — SvelteKit 라우트/링크 정적 점검

사용법:
  bun .vibe-coding/TOOLS/route-audit.ts [옵션]

옵션:
  --routes-only   라우트 수집/충돌만 검사 (링크 스캔 생략)
  --links-only    링크 스캔만 수행 (라우트는 src/routes 기준)
  --scan <dir>    링크 스캔 대상 디렉토리 추가 (기본: src, e2e)
  --base <path>   base path 접두사 제거 후 매칭 (예: /myapp)
  --ignore-prefix <p>  링크 스캔에서 제외할 경로 prefix (기본: /__, /@, /_app/)
  --verbose       파일 접근 실패 등 디버그 로그 출력
  --errors-only   오류(❌)만 출력
  --json          JSON으로 출력
  --no-report     리포트 파일 저장 생략
  --help, -h      도움말

종료 코드:
  0: 오류 없음
  1: 오류 존재 (broken link, route collision 등)
`);
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if ('help' in parsed) {
    printHelp();
    process.exit(0);
  }

  const options = parsed;
  CURRENT_OPTIONS = options;

  console.log('🧭 route-audit');

  const startTime = performance.now();
  const { routes, findings: routeFindings } = await collectRoutes();

  const findings: AuditFinding[] = [...routeFindings];

  const shouldScanLinks = !options.routesOnly;
  const shouldScanRoutes = !options.linksOnly;

  if (shouldScanRoutes) {
    const pages = routes.filter((r) => r.kind === 'page');
    const endpoints = routes.filter((r) => r.kind === 'endpoint');
    const dynamic = routes.filter((r) => r.isDynamic);
    console.log(
      `📦 routes: pages=${pages.length}, endpoints=${endpoints.length}, dynamic=${dynamic.length}`
    );
  }

  if (shouldScanLinks) {
    const ignoreFromFile = await readIgnoreFile();
    options.ignorePrefixes = Array.from(new Set([...options.ignorePrefixes, ...ignoreFromFile])).sort(
      (a, b) => a.localeCompare(b)
    );
    console.log(`🔎 내부 링크 스캔: ${options.scanDirs.map((d) => `${d}/`).join(', ')}`);
    if (ignoreFromFile.length) {
      console.log(`🙈 ignore file: ${IGNORE_FILE_PATH} (${ignoreFromFile.length}개)`);
    }
    findings.push(...(await auditLinks(routes, options)));
  }

  let outFindings = findings;
  if (options.errorsOnly) outFindings = findings.filter((f) => f.severity === 'error');

  outFindings.sort((a, b) => {
    const order: Record<Severity, number> = { error: 0, warning: 1, info: 2 };
    const s = order[a.severity] - order[b.severity];
    if (s !== 0) return s;
    const fa = a.file ?? '';
    const fb = b.file ?? '';
    if (fa !== fb) return fa.localeCompare(fb);
    return (a.line ?? 0) - (b.line ?? 0);
  });

  const elapsed = performance.now() - startTime;
  const elapsedStr = elapsed < 1000 ? `${elapsed.toFixed(0)}ms` : `${(elapsed / 1000).toFixed(2)}s`;

  const basePath = process.cwd();
  const reportText = options.jsonOutput
    ? JSON.stringify(
        {
          routes: routes.map((r) => ({
            kind: r.kind,
            pattern: r.pattern,
            file: normalizeSlashes(relative(basePath, r.file)),
            isDynamic: r.isDynamic
          })),
          findings: outFindings,
          elapsed: elapsedStr
        },
        null,
        2
      )
    : formatFindings(outFindings, basePath);

  console.log(reportText);
  console.log(`\n⏱️ 소요 시간: ${elapsedStr}`);

  if (!options.noReport) {
    const scriptDir = dirname(fileURLToPath(import.meta.url));
    const reportsDir = join(scriptDir, 'reports');
    await mkdir(reportsDir, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const reportPath = join(reportsDir, `${REPORT_PREFIX}-${timestamp}.txt`);
    const header = `Route Audit Report - ${timestamp}\nElapsed: ${elapsedStr}\n${'='.repeat(50)}\n`;
    await writeFile(reportPath, header + reportText, 'utf-8');
    console.log(`📝 리포트 저장됨: ${reportPath}`);
  }

  const hasErrors = findings.some((f) => f.severity === 'error');
  if (hasErrors) process.exit(1);
}

main().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
