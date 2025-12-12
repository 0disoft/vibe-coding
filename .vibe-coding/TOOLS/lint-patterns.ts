import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// 규칙 스코프 정의
type RuleScope = 'script' | 'markup' | 'all' | 'server-only';
type CommentMode = 'js' | 'css' | 'markup';

// 감지할 코드 패턴 정의
interface LintRule {
	id: string;
	name: string;
	description: string;
	pattern: RegExp;
	suggestion: string;
	severity: 'error' | 'warning' | 'info';
	scope: RuleScope; // 규칙이 적용되는 영역
}

interface LintResult {
	file: string;
	line: number;
	column: number;
	rule: LintRule;
	match: string;
}

// 서버 파일 패턴 (윈도우 경로 대응을 위해 슬래시로 정규화 후 검사)
const SERVER_FILE_PATTERNS = [
	/\+page\.server\.(ts|js)$/,
	/\+layout\.server\.(ts|js)$/,
	/\+server\.(ts|js)$/,
	/hooks\.server\.(ts|js)$/,
	/\/server\//,
	/\.server\.(ts|js)$/ // src/lib/whatever.server.ts 형태
];

function isServerFile(filePath: string): boolean {
	// 윈도우 역슬래시를 슬래시로 정규화
	const normalized = filePath.replace(/\\/g, '/');
	return SERVER_FILE_PATTERNS.some((p) => p.test(normalized));
}

const RULES: LintRule[] = [
	// 레벨 1: 기본적인 타입 안전성 문제 (script scope)
	// 참고: no-explicit-any는 security-patterns.ts로 이동됨
	{
		id: 'no-ts-ignore',
		name: '@ts-ignore 사용 금지',
		description: '@ts-ignore 또는 @ts-nocheck 주석 감지',
		pattern: /@ts-(?:ignore|nocheck)/g,
		suggestion: '@ts-expect-error + 구체적인 사유 명시, 또는 타입 수정',
		severity: 'error',
		scope: 'script'
	},
	{
		id: 'no-non-null-assertion',
		name: 'Non-null assertion (!) 사용',
		description: '변수 뒤 ! 사용 감지',
		pattern: /\w+!(?:\.|[[(])/g, // foo!. , foo![0], foo!() 모두 감지
		suggestion: '옵셔널 체이닝(?.) 또는 명시적 null 체크로 교체',
		severity: 'info',
		scope: 'script'
	},

	// 레벨 2: 패턴 기반 권장사항 (script scope)
	{
		id: 'prefer-isdef-filter',
		name: 'filter에서 isDef 타입 가드 권장',
		description: 'filter 내 != null 패턴 감지',
		pattern: /\.filter\s*\([^)]*(?:!=\s*null|!==\s*null)/g,
		suggestion: 'isDef 타입 가드 함수로 교체하면 타입 추론 향상',
		severity: 'info',
		scope: 'script'
	},
	{
		id: 'no-console-outside-dev',
		name: 'DEV 블록 외 console 사용',
		description: 'console.log/warn/error 감지 (DEV 가드 없이)',
		pattern: /console\.(?:log|warn|error|info|debug)\s*\(/g,
		suggestion: 'import.meta.env.DEV 조건문으로 감싸거나 제거',
		severity: 'warning',
		scope: 'script'
	},
	{
		id: 'prefer-set-over-includes',
		name: '배열 .includes() 대신 Set 권장',
		description: '상수 배열에 .includes() 호출 감지',
		pattern: /(?:ALLOWED|VALUES|LIST|ITEMS|KEYS|IDS)\w*\.includes\s*\(/gi,
		suggestion: 'new Set()으로 변환 후 .has()로 O(1) 조회',
		severity: 'info',
		scope: 'script'
	},

	// Svelte 5 / SvelteKit 2 안티패턴 (script scope)
	{
		id: 'no-app-stores',
		name: '$app/stores 사용 금지 (deprecated)',
		description: '$app/stores import 감지',
		pattern: /from\s+['"]?\$app\/stores['"]?/g,
		suggestion: '$app/state로 마이그레이션 필요 (SvelteKit 2.12+)',
		severity: 'warning',
		scope: 'script'
	},
	{
		id: 'no-legacy-store',
		name: '레거시 스토어 사용 (Svelte 4)',
		description: 'writable/readable import 감지',
		pattern: /from\s+['"]?svelte\/store['"]?/g,
		suggestion: 'Svelte 5 runes ($state, $derived) 사용 권장',
		severity: 'info',
		scope: 'script'
	},
	{
		id: 'no-reactive-statement',
		name: '$: 반응성 문법 (Svelte 4)',
		description: '$: 반응성 문 감지',
		pattern: /^\s*\$:\s+/gm,
		suggestion: 'Svelte 5: $derived 또는 $effect 사용',
		severity: 'info',
		scope: 'script'
	},

	// Svelte 마크업 전용 규칙 (markup scope)
	// 참고: no-html-tag(XSS)는 security-patterns.ts로 이동됨
	{
		id: 'no-on-directive',
		name: 'on:event 문법 (Svelte 4)',
		description: 'on:click, on:submit 등 레거시 이벤트 문법 감지',
		pattern: /\bon:[a-z]+\s*=/gi,
		suggestion: 'Svelte 5: onclick, onsubmit 등 네이티브 속성 사용',
		severity: 'info',
		scope: 'markup'
	},

	// SvelteKit 보안 규칙
	{
		id: 'no-private-env-client',
		name: '클라이언트에서 private env 사용',
		description: '$env/static/private 또는 $env/dynamic/private import 감지',
		pattern: /from\s+['"]?\$env\/(?:static|dynamic)\/private['"]?/g,
		suggestion: '서버 전용 환경변수입니다. 클라이언트에서 사용 불가. .server 파일로 이동',
		severity: 'error',
		scope: 'script'
	},
	{
		id: 'no-browser-globals-server',
		name: '서버 파일에서 브라우저 전역 객체 사용',
		description: 'window, document, localStorage 등 감지',
		pattern: /\b(?:window|document|localStorage|sessionStorage|navigator)\b(?!:)/g,
		suggestion: '서버에서 실행 불가. browser 가드로 감싸거나 클라이언트로 이동',
		severity: 'error',
		scope: 'server-only'
	}
];

// 파일 확장자 필터
const VALID_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.svelte', '.css', '.html'];

// 무시할 경로 패턴 (경로 세그먼트 시작/끝 모두 매칭)
const IGNORE_PATTERNS = [
	/(?:^|[\/\\])node_modules(?:[\/\\]|$)/,
	/(?:^|[\/\\])\.svelte-kit(?:[\/\\]|$)/,
	/(?:^|[\/\\])dist(?:[\/\\]|$)/,
	/(?:^|[\/\\])build(?:[\/\\]|$)/,
	/(?:^|[\/\\])\.git(?:[\/\\]|$)/,
	/(?:^|[\/\\])scripts(?:[\/\\]|$)/
];

// Svelte 파일에서 script/style 블록 추출 (시작 라인 오프셋 포함)
interface CodeBlock {
	content: string;
	startLine: number; // 원본 파일에서의 시작 라인 (0-indexed)
	endLine: number; // 끝 라인 (마크업 제외용)
}

function extractScriptBlocks(content: string): CodeBlock[] {
	const blocks: CodeBlock[] = [];
	const regex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
	let match: RegExpExecArray | null;

	// biome-ignore lint/suspicious/noAssignInExpressions: standard regex loop pattern
	while ((match = regex.exec(content)) !== null) {
		// <script> 태그의 끝 위치(>)를 찾아서 content 시작점 계산
		const tagEndIndex = match.index + match[0].indexOf('>') + 1;
		const beforeContent = content.slice(0, tagEndIndex);
		const startLine = (beforeContent.match(/\n/g) || []).length;

		// 전체 매치의 끝까지 줄바꿈 개수
		const beforeMatchEnd = content.slice(0, match.index + match[0].length);
		const endLine = (beforeMatchEnd.match(/\n/g) || []).length;

		blocks.push({
			content: match[1],
			startLine,
			endLine: endLine + 1 // 닫는 태그 줄까지 완전 제외
		});
	}

	return blocks;
}

function extractStyleBlocks(content: string): CodeBlock[] {
	const blocks: CodeBlock[] = [];
	const regex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
	let match: RegExpExecArray | null;

	// biome-ignore lint/suspicious/noAssignInExpressions: standard regex loop pattern
	while ((match = regex.exec(content)) !== null) {
		const tagEndIndex = match.index + match[0].indexOf('>') + 1;
		const beforeContent = content.slice(0, tagEndIndex);
		const startLine = (beforeContent.match(/\n/g) || []).length;
		const beforeMatchEnd = content.slice(0, match.index + match[0].length);
		const endLine = (beforeMatchEnd.match(/\n/g) || []).length;

		blocks.push({
			content: match[1],
			startLine,
			endLine: endLine + 1 // 닫는 태그 줄까지 완전 제외
		});
	}

	return blocks;
}

async function walk(dir: string): Promise<string[]> {
	const files: string[] = [];
	const entries = await readdir(dir, { withFileTypes: true });

	for (const entry of entries) {
		const path = join(dir, entry.name);

		// 무시 패턴 체크 (윈도우 역슬래시 정규화)
		const normalizedPath = path.replace(/\\/g, '/');
		if (IGNORE_PATTERNS.some((p) => p.test(normalizedPath))) continue;

		if (entry.isDirectory()) {
			files.push(...(await walk(path)));
		} else if (entry.isFile()) {
			const ext = extname(path);
			if (VALID_EXTENSIONS.includes(ext)) files.push(path);
		}
	}
	return files;
}

/**
 * 모드별 주석 제거 및 라인 정제
 * - js: 문자열 고려하여 // 및 /* 내부 주석 제거 (블록 시작 감지 지원)
 * - css: /* 제거
 * - markup: <!-- --> 제거 (//, /* 는 무시)
 */
function stripComments(
	line: string,
	mode: CommentMode,
	inBlock: boolean
): { line: string; inBlock: boolean; } {
	let result = '';
	let i = 0;
	const len = line.length;
	let currentInBlock = inBlock;

	// JS String state
	let inSingle = false;
	let inDouble = false;
	let inTemplate = false;
	let escaped = false;

	while (i < len) {
		if (currentInBlock) {
			// 블록 주석 닫힘 찾기 */
			// CSS/JS: */, Markup: -->
			const closeMarker = mode === 'markup' ? '-->' : '*/';
			const closeIdx = line.indexOf(closeMarker, i);

			if (closeIdx === -1) {
				// 닫는 마커가 없으면 이번 줄은 통째로 주석 처리됨 (빈 문자열 반환 아님, 스킵해야 함)
				// 다만 여기서는 result에 아무것도 추가 안 함
				return { line: result, inBlock: true };
			}

			// 주석 닫힘
			i = closeIdx + closeMarker.length;
			currentInBlock = false;
			continue;
		}

		const char = line[i];
		const next = line[i + 1];


		// JS 모드에서만 문자열 트래킹
		if (mode === 'js') {
			if (!escaped && char === '\\') {
				// 문자열/템플릿 내부일 때만 이스케이프 처리
				if (inSingle || inDouble || inTemplate) {
					escaped = true;
				}
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

			// 문자열 밖에서만 주석 체크
			if (!inSingle && !inDouble && !inTemplate) {
				// 1. 한 줄 주석 (//)
				if (char === '/' && next === '/') {
					break;
				}
				// 2. 블록 주석 (/*)
				if (char === '/' && next === '*') {
					currentInBlock = true;
					i += 2;
					continue;
				}
			}
		} else if (mode === 'css') {
			// CSS 모드: 문자열 트래킹 (', ")
			if (!escaped && char === '\\') {
				// CSS에서 백슬래시는 보통 이스케이프
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

			// 문자열 밖에서만 블록 주석 시작 체크
			if (!inSingle && !inDouble) {
				if (char === '/' && next === '*') {
					currentInBlock = true;
					i += 2;
					continue;
				}
			}
		} else {
			// Markup 모드 등 (기존 로직: 1. // 무시, 2. 블록 주석 시작)
			// 문자열 밖인지 체크할 필요 없음 (HTML 주석은 문자열 안에서도 유효할 수 있지만, 보통은 태그 밖)
			// 여기서는 단순히 <!-- 만 체크 (기존 로직 유지)

			const isBlockStart =
				(mode === 'markup' && char === '<' && next === '!' && line.slice(i, i + 4) === '<!--');

			if (isBlockStart) {
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

function lintLines(
	lines: string[],
	filePath: string,
	rules: LintRule[],
	lineOffset: number = 0,
	skipLineRanges: Array<{ start: number; end: number; }> = [],
	commentMode: CommentMode = 'js'
): LintResult[] {
	const results: LintResult[] = [];
	let inBlockComment = false;
	let devBlockDepth = 0;
	let devGuardPending = false;

	for (let lineNum = 0; lineNum < lines.length; lineNum++) {
		const actualLine = lineNum + lineOffset;

		// 제외 범위 체크
		if (skipLineRanges.some((r) => actualLine >= r.start && actualLine < r.end)) {
			continue;
		}

		let line = lines[lineNum];

		// 1. 통합 주석 처리 (모드별 / 문자열 안전)
		const stripped = stripComments(line, commentMode, inBlockComment);
		inBlockComment = stripped.inBlock;
		line = stripped.line;

		// 빈 줄이면 건너뜀
		if (line.trim() === '') continue;

		// ... 나머지 로직 (DEV 블록 등) 유지 ...

		// DEV 블록 추적 (if, {, } 단위로 깊이 계산)
		const hasDevGuard = /import\.meta\.env\.DEV/.test(line);
		const openBraces = (line.match(/{/g) || []).length;
		const closeBraces = (line.match(/}/g) || []).length;

		const pending = devGuardPending;

		if (hasDevGuard && devBlockDepth === 0) {
			const diff = openBraces - closeBraces;
			if (diff > 0) devBlockDepth = diff;
			else devGuardPending = true;
		} else if (pending) {
			const diff = openBraces - closeBraces;
			// 다음 줄이 { 로 블록을 여는 스타일
			if (openBraces > 0) {
				devBlockDepth = Math.max(0, diff);
			}
			// 블록을 열든 말든, pending은 이 줄에서 소비
			devGuardPending = false;
		} else if (devBlockDepth > 0) {
			devBlockDepth += openBraces - closeBraces;
			if (devBlockDepth < 0) devBlockDepth = 0;
		}

		for (const rule of rules) {
			// DEV 블록 내부이거나, 같은 줄에 DEV 가드가 있으면 console 규칙 건너뜀
			if (
				rule.id === 'no-console-outside-dev' &&
				(devBlockDepth > 0 || hasDevGuard || pending)
			)
				continue;

			// private env 규칙: 서버 파일이면 건너뜀
			if (rule.id === 'no-private-env-client' && isServerFile(filePath)) continue;

			// regex 재사용 (lastIndex 리셋)
			const regex = rule.pattern;
			regex.lastIndex = 0;

			// g 플래그가 없으면 1회만 매칭 (무한 루프 방지)
			if (!regex.global) {
				const match = regex.exec(line);
				if (match) {
					results.push({
						file: filePath,
						line: lineNum + 1 + lineOffset,
						column: match.index + 1,
						rule,
						match: match[0]
					});
				}
			} else {
				let match: RegExpExecArray | null;
				// biome-ignore lint/suspicious/noAssignInExpressions: standard regex loop pattern
				while ((match = regex.exec(line)) !== null) {
					results.push({
						file: filePath,
						line: lineNum + 1 + lineOffset,
						column: match.index + 1,
						rule,
						match: match[0]
					});
					// 빈 문자열 매치 방어 (무한 루프 방지)
					if (match[0] === '') regex.lastIndex++;
				}
			}
		}
	}

	return results;
}

function lintContent(content: string, filePath: string): LintResult[] {
	const results: LintResult[] = [];
	const isSvelte = filePath.endsWith('.svelte');
	const isServer = isServerFile(filePath);

	// script scope 규칙
	const scriptRules = RULES.filter((r) => r.scope === 'script');
	// markup scope 규칙
	const markupRules = RULES.filter((r) => r.scope === 'markup');
	// server-only scope 규칙
	const serverRules = RULES.filter((r) => r.scope === 'server-only');

	if (isSvelte) {
		// Svelte 파일: script 블록과 마크업을 분리하여 검사
		const scriptBlocks = extractScriptBlocks(content);
		const styleBlocks = extractStyleBlocks(content);

		// Script 블록 검사 (라인 오프셋 적용)
		for (const block of scriptBlocks) {
			const lines = block.content.split('\n');
			results.push(...lintLines(lines, filePath, scriptRules, block.startLine, [], 'js')); // script
		}

		// 마크업 검사 (script/style 블록 제외)
		const skipRanges = [
			...scriptBlocks.map((b) => ({ start: b.startLine, end: b.endLine })),
			...styleBlocks.map((b) => ({ start: b.startLine, end: b.endLine }))
		];
		const fullLines = content.split('\n');
		results.push(...lintLines(fullLines, filePath, markupRules, 0, skipRanges, 'markup')); // markup mode
	} else {
		// 일반 TS/JS 파일
		const lines = content.split('\n');
		results.push(...lintLines(lines, filePath, scriptRules, 0, [], 'js'));

		// 서버 파일이면 브라우저 전역 객체 검사
		if (isServer) {
			results.push(...lintLines(lines, filePath, serverRules, 0, [], 'js'));
		}
	}

	return results;
}

async function lintFile(path: string): Promise<LintResult[]> {
	const content = await readFile(path, 'utf-8');
	return lintContent(content, path);
}

function formatResults(results: LintResult[], basePath: string): string {
	const lines: string[] = [];

	if (results.length === 0) {
		lines.push('✅ 문제가 발견되지 않았습니다.');
		return lines.join('\n');
	}

	// 파일별로 그룹화
	const byFile = new Map<string, LintResult[]>();
	for (const r of results) {
		const rel = relative(basePath, r.file);
		const existing = byFile.get(rel);
		if (existing) {
			existing.push(r);
		} else {
			byFile.set(rel, [r]);
		}
	}

	// 심각도별 카운트
	const counts = { error: 0, warning: 0, info: 0 };

	for (const [file, fileResults] of byFile) {
		lines.push(`\n📄 ${file}`);
		for (const r of fileResults) {
			const icon = r.rule.severity === 'error' ? '❌' : r.rule.severity === 'warning' ? '⚠️' : '💡';
			lines.push(`  ${icon} L${r.line}:${r.column} [${r.rule.id}]`);
			lines.push(`     ${r.rule.name}: "${r.match.trim()}"`);
			lines.push(`     → ${r.rule.suggestion}`);
			counts[r.rule.severity]++;
		}
	}

	lines.push('\n────────────────────────────────────');
	lines.push(
		`총 ${results.length}개 이슈: ❌ ${counts.error} 오류, ⚠️ ${counts.warning} 경고, 💡 ${counts.info} 정보`
	);

	return lines.join('\n');
}

async function main() {
	const TARGET = process.argv.slice(2).find((arg) => !arg.startsWith('--')) || 'src';
	const FILTER_SEVERITY = process.argv.includes('--errors-only') ? 'error' : null;

	console.log(`🔍 스캔 대상: ${TARGET}`);

	try {
		const targetStat = await stat(TARGET);
		let files: string[];

		if (targetStat.isFile()) {
			const ext = extname(TARGET);
			if (!VALID_EXTENSIONS.includes(ext)) {
				console.log(`Error: 지원 확장자는 ${VALID_EXTENSIONS.join(', ')} 입니다.`);
				process.exit(1);
			}
			files = [TARGET];
		} else {
			files = await walk(TARGET);
		}

		console.log(`📁 ${files.length}개 파일 발견\n`);

		let allResults: LintResult[] = [];
		for (const file of files) {
			const results = await lintFile(file);
			allResults.push(...results);
		}

		// 심각도 필터링
		if (FILTER_SEVERITY) {
			allResults = allResults.filter((r) => r.rule.severity === FILTER_SEVERITY);
		}

		// 결과 정렬 (파일 경로, 라인, 컨럼 순)
		allResults.sort((a, b) => {
			if (a.file !== b.file) return a.file.localeCompare(b.file);
			if (a.line !== b.line) return a.line - b.line;
			return a.column - b.column;
		});

		// basePath는 디렉터리 기준으로 (파일 타겟일 때 relative 경로 정상화)
		const basePath = targetStat.isFile() ? dirname(TARGET) : TARGET;
		const report = formatResults(allResults, basePath);
		console.log(report);

		// 리포트 파일로 저장 (폴더 자동 생성)
		const scriptDir = dirname(fileURLToPath(import.meta.url));
		const reportsDir = join(scriptDir, 'reports');
		await mkdir(reportsDir, { recursive: true });

		const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
		const reportPath = join(reportsDir, `lint-report-${timestamp}.txt`);

		const header = `Lint Report - ${timestamp}\nTarget: ${TARGET}\n${'='.repeat(40)}\n`;
		await writeFile(reportPath, header + report, 'utf-8');
		console.log(`\n📝 리포트 저장됨: ${reportPath}`);

		// CI용 종료 코드: 오류가 있으면 exit(1)
		const hasErrors = allResults.some((r) => r.rule.severity === 'error');
		if (hasErrors) {
			process.exit(1);
		}
	} catch (error) {
		console.error('Error:', error);
		process.exit(1);
	}
}

main();
