import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * 보안 패턴 탐지 도구 (Security Pattern Scanner)
 *
 * SvelteKit 2, Svelte 5, TypeScript, UnoCSS, Bun 스택에서
 * 정적 분석으로 감지 가능한 보안 위험을 탐지합니다.
 *
 * 사용법:
 *   bunx tsx .vibe-coding/TOOLS/01-security-patterns.ts src
 *   bunx tsx .vibe-coding/TOOLS/01-security-patterns.ts src --errors-only
 */

// 규칙 스코프 정의
type RuleScope = 'script' | 'markup' | 'all' | 'server-only' | 'config';
type CommentMode = 'js' | 'css' | 'markup';

// 보안 규칙 정의
interface SecurityRule {
	id: string;
	name: string;
	category: string;
	description: string;
	pattern: RegExp;
	suggestion: string;
	severity: 'error' | 'warning' | 'info';
	scope: RuleScope;
	references?: string[];
	// 추가 검증 로직 (false 반환 시 매칭 취소)
	check?: (match: string, context: { file?: string; line?: number; content?: string; }) => boolean;
}

interface SecurityResult {
	file: string;
	line: number;
	column: number;
	rule: SecurityRule;
	match: string;
}

// 서버 파일 패턴
const SERVER_FILE_PATTERNS = [
	/\+page\.server\.(ts|js)$/,
	/\+layout\.server\.(ts|js)$/,
	/\+server\.(ts|js)$/,
	/hooks\.server\.(ts|js)$/,
	/\/server\//,
	/\.server\.(ts|js)$/
];

function isServerFile(filePath: string): boolean {
	const normalized = filePath.replace(/\\/g, '/');
	return SERVER_FILE_PATTERNS.some((p) => p.test(normalized));
}

const RULES: SecurityRule[] = [
	// ═══════════════════════════════════════════════════════════════════════════
	// XSS (Cross-Site Scripting)
	// ═══════════════════════════════════════════════════════════════════════════
	{
		id: 'xss-innerhtml',
		name: 'innerHTML 사용 (XSS 위험)',
		category: 'XSS',
		description: 'innerHTML, outerHTML 사용 감지',
		pattern: /\.(innerHTML|outerHTML)\s*(?:\+?=)/g,
		suggestion: 'textContent 사용 권장. HTML 필요 시 DOMPurify로 정화',
		severity: 'error',
		scope: 'script',
		references: [
			'https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html'
		]
	},
	{
		id: 'xss-document-write',
		name: 'document.write 사용 (XSS 위험)',
		category: 'XSS',
		description: 'document.write/writeln 감지',
		pattern: /document\.(?:write|writeln)\s*\(/g,
		suggestion: 'DOM API 사용 권장. 동적 스크립트 로딩은 다른 방법으로',
		severity: 'error',
		scope: 'script'
	},
	{
		id: 'xss-target-blank',
		name: 'target="_blank" without noopener',
		category: 'XSS',
		description: '탭 납치(tabnabbing) 위험',
		// 라인 단위 매칭이 아니라, lintContent에서 별도로 처리함 (멀티라인 지원 위해)
		// 패턴을 매칭되지 않게 설정하거나, lintContent에서 직접 로직 구현
		pattern: /$^/g, // 매칭되지 않음 (더미)
		check: () => false,
		suggestion: 'rel="noopener noreferrer" 추가 권장',
		severity: 'warning',
		scope: 'markup',
		references: ['https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#security_and_privacy']
	},
	{
		id: 'xss-svelte-html',
		name: '{@html} 사용 (XSS 위험)',
		category: 'XSS',
		description: 'Svelte {@html} 태그 사용 감지',
		pattern: /\{@html\s+/g,
		suggestion: '사용자 입력에는 절대 금지. 데이터 생성 지점에서 정화 필수 + CSP 적용',
		severity: 'warning',
		scope: 'markup',
		references: ['https://svelte.dev/docs/svelte/@html']
	},

	// ═══════════════════════════════════════════════════════════════════════════
	// 코드 인젝션 (Code Injection)
	// ═══════════════════════════════════════════════════════════════════════════
	{
		id: 'injection-eval',
		name: 'eval() 사용 금지',
		category: 'Injection',
		description: 'eval 함수 사용 감지',
		pattern: /\beval\s*\(/g,
		suggestion: 'eval 대신 JSON.parse, Function 생성자도 위험. 정적 코드로 대체',
		severity: 'error',
		scope: 'script',
		references: [
			'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval#never_use_eval!'
		]
	},
	{
		id: 'injection-new-function',
		name: 'new Function() 사용 금지',
		category: 'Injection',
		description: 'Function 생성자 사용 감지',
		pattern: /new\s+Function\s*\(/g,
		suggestion: '동적 코드 생성 금지. 정적 함수로 대체',
		severity: 'error',
		scope: 'script'
	},
	{
		id: 'injection-setinterval-string',
		name: 'setTimeout/setInterval 문자열 사용',
		category: 'Injection',
		description: '타이머에 문자열 코드 전달 감지',
		pattern: /(?:setTimeout|setInterval)\s*\(\s*["'`]/g,
		suggestion: '문자열 대신 함수 참조 사용',
		severity: 'error',
		scope: 'script'
	},

	// ═══════════════════════════════════════════════════════════════════════════
	// 프로토타입 오염 (Prototype Pollution)
	// ═══════════════════════════════════════════════════════════════════════════
	{
		id: 'prototype-pollution-proto',
		name: '__proto__ 접근 (프로토타입 오염)',
		category: 'Prototype Pollution',
		description: '__proto__ 속성 접근 감지',
		// 공백 허용 + 따옴표 필수 + 열림/닫힘 일치
		pattern: /\[\s*(['"`])__proto__\1\s*\]/g,
		suggestion: '입력에서 __proto__, prototype, constructor 키 필터링 필수',
		severity: 'error',
		scope: 'script',
		references: [
			'https://cheatsheetseries.owasp.org/cheatsheets/Prototype_Pollution_Prevention_Cheat_Sheet.html'
		]
	},
	{
		id: 'prototype-pollution-proto-dot',
		name: '__proto__ 점 표기 접근',
		category: 'Prototype Pollution',
		description: '__proto__ 점 표기 접근 감지',
		pattern: /\.__proto__\b/g,
		suggestion: '입력에서 __proto__, prototype, constructor 키 필터링 필수',
		severity: 'warning',
		scope: 'script'
	},
	{
		id: 'prototype-pollution-constructor',
		name: 'constructor 동적 접근',
		category: 'Prototype Pollution',
		description: 'constructor 속성 동적 접근 감지',
		// 공백 허용 + 따옴표 필수 + 열림/닫힘 일치
		pattern: /\[\s*(['"`])constructor\1\s*\]/g,
		suggestion: 'Object.create(null) 또는 Map 사용 권장',
		severity: 'warning',
		scope: 'script'
	},

	// ═══════════════════════════════════════════════════════════════════════════
	// SvelteKit 보안
	// ═══════════════════════════════════════════════════════════════════════════
	{
		id: 'sveltekit-private-env',
		name: '클라이언트에서 private env 사용',
		category: 'SvelteKit',
		description: '$env/static/private 또는 $env/dynamic/private import',
		pattern: /from\s+['"]?\$env\/(?:static|dynamic)\/private['"]?/g,
		suggestion: '서버 전용 환경변수. .server 파일로 이동',
		severity: 'error',
		scope: 'script',
		references: ['https://svelte.dev/docs/kit/security']
	},
	{
		id: 'sveltekit-browser-globals-server',
		name: '서버에서 브라우저 전역 객체 사용',
		category: 'SvelteKit',
		description: 'window, document, localStorage 등',
		pattern: /\b(?:window|document|localStorage|sessionStorage|navigator)\b(?!:)/g,
		suggestion: '서버에서 실행 불가. browser 가드 또는 클라이언트로 이동',
		severity: 'error',
		scope: 'server-only'
	},
	{
		id: 'sveltekit-searchparams-iterate',
		name: 'searchParams 전체 순회 (XSS 위험)',
		category: 'SvelteKit',
		description: 'URL searchParams 키 전체 순회 감지',
		pattern: /(?:searchParams|url\.searchParams)\.(?:keys|entries|forEach)\s*\(/g,
		suggestion:
			'GHSA-6q87-84jw-cjhp (CVE-2025-32388): 허용된 키 목록만 읽기. SvelteKit 2.20.6+ 필수',
		severity: 'warning',
		scope: 'server-only',
		references: ['https://github.com/sveltejs/kit/security/advisories/GHSA-6q87-84jw-cjhp']
	},
	{
		id: 'sveltekit-open-redirect',
		name: 'Open Redirect 위험',
		category: 'SvelteKit',
		description: '사용자 입력으로 redirect 호출',
		pattern: /redirect\s*\(\s*\d+\s*,\s*(?:params\.|url\.searchParams)/g,
		suggestion: '허용된 경로 목록 기반으로만 리다이렉트. 외부 URL 차단',
		severity: 'error',
		scope: 'server-only',
		references: [
			'https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html'
		]
	},
	{
		id: 'sveltekit-cors-wildcard-credentials',
		name: 'CORS 와일드카드 + credentials 위험',
		category: 'SvelteKit',
		description: 'Access-Control-Allow-Origin: * 와 credentials 조합',
		// 객체 리터럴, headers.set, headers.append 모두 탐지 (닫는 따옴표 포함, 대소문자 무시)
		pattern: /(?:Access-Control-Allow-Origin['"]\s*:\s*['"]\*['"]|\.(?:set|append)\s*\(\s*['"]Access-Control-Allow-Origin['"]\s*,\s*['"]\*['"])/gi,
		suggestion: 'credentials: true와 함께 사용 시 인증 정보 유출 위험',
		severity: 'warning',
		scope: 'server-only'
	},

	// ═══════════════════════════════════════════════════════════════════════════
	// 입력 검증, 요청 바디 처리
	// ═══════════════════════════════════════════════════════════════════════════
	{
		id: 'input-request-json',
		name: 'request.json 사용 지점 (스키마 검증, 크기 제한 점검 필요)',
		category: 'Input',
		description: '서버에서 JSON 바디를 읽는 지점',
		pattern: /\b(?:event\.)?request\.json\s*\(|\brequest\.json\s*\(/g,
		suggestion: '스키마로 검증하고, 가능한 경우 본문 크기 제한도 함께 적용',
		severity: 'info',
		scope: 'server-only',
		references: ['https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html']
	},
	{
		id: 'input-request-formdata',
		name: 'request.formData 사용 지점 (스키마 검증, 길이 제한 점검 필요)',
		category: 'Input',
		description: '서버에서 FormData를 읽는 지점',
		pattern: /\b(?:event\.)?request\.formData\s*\(|\brequest\.formData\s*\(/g,
		suggestion: '허용 필드 목록 기반으로 파싱하고, 각 필드 길이 제한을 적용',
		severity: 'info',
		scope: 'server-only'
	},
	{
		id: 'input-request-text-arraybuffer',
		name: 'request.text 또는 arrayBuffer 사용 지점 (요청 크기 제한 점검 필요)',
		category: 'Input',
		description: '서버에서 원문 바디를 읽는 지점',
		pattern:
			/\b(?:event\.)?request\.(?:text|arrayBuffer)\s*\(|\brequest\.(?:text|arrayBuffer)\s*\(/g,
		suggestion: '대용량 요청 방어를 위해 크기 제한과 허용 타입 검증을 적용',
		severity: 'warning',
		scope: 'server-only'
	},

	// ═══════════════════════════════════════════════════════════════════════════
	// CSRF / 세션
	// ═══════════════════════════════════════════════════════════════════════════
	{
		id: 'session-localstorage-token',
		name: 'localStorage에 토큰 저장',
		category: 'Session',
		description: 'localStorage에 token/jwt/session 저장 감지',
		pattern:
			/localStorage\.setItem\s*\(\s*["'`](?:token|jwt|session|auth|access_token|refresh_token|id_token)/gi,
		suggestion: 'XSS 시 탈취 가능. HttpOnly 쿠키 사용 권장',
		severity: 'warning',
		scope: 'script',
		references: [
			'https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html'
		]
	},

	// ═══════════════════════════════════════════════════════════════════════════
	// SSRF (Server-Side Request Forgery)
	// ═══════════════════════════════════════════════════════════════════════════
	{
		id: 'ssrf-fetch-user-url',
		name: '사용자 URL로 fetch 호출',
		category: 'SSRF',
		description: '사용자 입력이 fetch URL에 사용될 가능성',
		pattern: /fetch\s*\(\s*(?:event\.url|request\.url|url\.searchParams)/g,
		suggestion: '허용된 호스트 목록 기반 검증 필수. 내부망 주소 차단',
		severity: 'warning',
		scope: 'server-only',
		references: ['https://owasp.org/www-community/attacks/Server_Side_Request_Forgery']
	},

	// ═══════════════════════════════════════════════════════════════════════════
	// UnoCSS 보안
	// ═══════════════════════════════════════════════════════════════════════════
	{
		id: 'unocss-runtime-mode',
		name: 'UnoCSS 런타임 모드 사용',
		category: 'UnoCSS',
		description: '@unocss/runtime import 감지',
		pattern: /from\s+['"]@unocss\/runtime['"]|['"]@unocss\/runtime['"]/g,
		suggestion: '운영에서 런타임 모드는 DoS 위험. 빌드 타임 생성으로 전환',
		severity: 'warning',
		scope: 'script',
		references: ['https://unocss.dev/integrations/runtime']
	},
	{
		id: 'unocss-attributify',
		name: 'UnoCSS Attributify 활성화',
		category: 'UnoCSS',
		description: 'attributify 프리셋 사용 감지',
		pattern: /presetAttributify\s*\(/g,
		suggestion: '공격 표면 확대. 사용자 콘텐츠 영역에서는 비활성화 고려',
		severity: 'info',
		scope: 'config'
	},

	// ═══════════════════════════════════════════════════════════════════════════
	// Bun 보안
	// ═══════════════════════════════════════════════════════════════════════════
	{
		id: 'bun-bunx-no-version',
		name: 'bunx 버전 명시 없이 실행',
		category: 'Bun',
		description: 'bunx 패키지 실행 시 버전 미명시',
		// tsx, eslint 등은 버전 명시 없이 자주 사용되므로 제외
		pattern: /bunx\s+(?!.*@[\d.])(?!(?:tsx|eslint|remix|vite|wrangler|playwright|biome)\b)(?:@[\w-]+\/)?[\w-]+/gi,
		suggestion: 'typosquatting 위험. bunx package@version 형태로 버전 명시',
		severity: 'info',
		scope: 'script',
		references: ['https://bun.sh/docs/cli/bunx']
	},

	// ═══════════════════════════════════════════════════════════════════════════
	// CSS 인젝션
	// ═══════════════════════════════════════════════════════════════════════════
	{
		id: 'css-import-external',
		name: '외부 CSS @import',
		category: 'CSS',
		description: '@import로 외부 CSS 로딩 감지',
		pattern: /@import\s+(?:url\s*\()?['"]https?:\/\//gi,
		suggestion: '외부 CSS는 공급망 리스크. 셀프 호스팅 권장',
		severity: 'info',
		scope: 'all',
		references: ['https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity']
	},

	// ═══════════════════════════════════════════════════════════════════════════
	// 암호화 / 비밀 관리
	// ═══════════════════════════════════════════════════════════════════════════
	{
		id: 'crypto-hardcoded-secret',
		name: '하드코딩된 비밀 의심',
		category: 'Secrets',
		description: '코드 내 API 키, 시크릿 패턴 감지',
		pattern: /(?:api[_-]?key|secret|password|token)\s*[=:]\s*["'`][A-Za-z0-9+/=_-]{16,}/gi,
		suggestion: '비밀은 환경변수로 관리. 레포에 커밋 금지',
		// 오탐이 많을 수 있어 warning으로 유지, 확정 패턴은 별도 error 룰 추가 권장
		severity: 'warning',
		scope: 'script',
		references: [
			'https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html'
		]
	},

	// ═══════════════════════════════════════════════════════════════════════════
	// 타입스크립트 타입 안전성
	// ═══════════════════════════════════════════════════════════════════════════
	{
		id: 'ts-any-cast',
		name: 'as any 캐스팅 (타입 우회)',
		category: 'TypeScript',
		description: 'as any 캐스팅 감지',
		pattern: /\bas\s+any\b/g,
		suggestion: '권한/결제 코드 주변에서는 금지. unknown + 타입 가드 사용',
		severity: 'warning',
		scope: 'script'
	}
];

// 파일 확장자 필터
const VALID_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.svelte', '.css', '.html'];

// 무시할 경로 패턴 (경로 세그먼트 시작/끝 모두 매칭)
// 백슬래시 매칭 제거 및 정규화 경로(/) 기준 매칭
const IGNORE_PATTERNS = [
	/(?:^|\/)node_modules(?:\/|$)/,
	/(?:^|\/)\.svelte-kit(?:\/|$)/,
	/(?:^|\/)dist(?:\/|$)/,
	/(?:^|\/)build(?:\/|$)/,
	/(?:^|\/)\.git(?:\/|$)/,
	/(?:^|\/)scripts(?:\/|$)/,
	/(?:^|\/)\.vibe-coding(?:\/|$)/,
	// 자체 리포트 폴더만 무시 (다른 reports 폴더는 스캔)
	/\.vibe-coding\/TOOLS\/reports(?:\/|$)/
];

// Svelte script/style 블록 추출
interface CodeBlock {
	content: string;
	startLine: number;
	endLine: number;
}

function extractScriptBlocks(content: string): CodeBlock[] {
	const blocks: CodeBlock[] = [];
	const regex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
	let match: RegExpExecArray | null;

	// biome-ignore lint/suspicious/noAssignInExpressions: standard regex loop pattern
	while ((match = regex.exec(content)) !== null) {
		const tagEndIndex = match.index + match[0].indexOf('>') + 1;
		const beforeContent = content.slice(0, tagEndIndex);
		const startLine = (beforeContent.match(/\n/g) || []).length;
		const beforeMatchEnd = content.slice(0, match.index + match[0].length);
		const endLine = (beforeMatchEnd.match(/\n/g) || []).length;

		blocks.push({ content: match[1], startLine, endLine: endLine + 1 }); // endLine+1로 미포함 끝 확정
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

		blocks.push({ content: match[1], startLine, endLine: endLine + 1 }); // endLine+1로 미포함 끝 확정
	}
	return blocks;
}

async function walk(dir: string): Promise<string[]> {
	const files: string[] = [];
	const entries = await readdir(dir, { withFileTypes: true });

	for (const entry of entries) {
		const path = join(dir, entry.name);
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
interface ParsingState {
	inBlock: boolean;
	inTemplate: boolean;
}

/**
 * 모드별 주석 제거 및 라인 정제
 * - js: 문자열 고려하여 // 및 /* 내부 주석 제거 (블록, 템플릿 리터럴 상태 유지 지원)
 * - css: /* 제거
 * - markup: <!-- --> 제거 (//, /* 는 무시)
 */
function stripComments(
	line: string,
	mode: CommentMode,
	state: ParsingState
): { line: string; state: ParsingState; } {
	let result = '';
	let i = 0;
	const len = line.length;

	// Copy state to local variables
	let { inBlock: currentInBlock, inTemplate } = state;

	// JS String state (Line-local)
	let inSingle = false;
	let inDouble = false;
	let escaped = false;
	let inRegex = false;
	let inCharClass = false; // Regex 문자 클래스 [...] 내부 여부

	while (i < len) {
		if (currentInBlock) {
			const closeMarker = mode === 'markup' ? '-->' : '*\u002f';
			const closeIdx = line.indexOf(closeMarker, i);

			if (closeIdx === -1) {
				// 끝까지 전부 주석이므로 남은 길이만큼 공백 보존
				result += ' '.repeat(len - i);
				return { line: result, state: { inBlock: true, inTemplate } };
			}

			// 주석 제거된 길이만큼 공백으로 채워 위치 보존
			const removedLen = closeIdx + closeMarker.length - i;
			result += ' '.repeat(removedLen);

			i = closeIdx + closeMarker.length;
			currentInBlock = false;
			continue;
		}

		const char = line[i];
		const next = line[i + 1];

		if (mode === 'js') {
			// 1. 역슬래시 처리 (Escaping)
			if (!escaped && char === '\\') {
				escaped = true;
				result += char;
				i++;
				continue;
			}

			// 2. 문자열 상태 처리
			if (!escaped && !inRegex) {
				if (char === "'" && !inDouble && !inTemplate) inSingle = !inSingle;
				else if (char === '"' && !inSingle && !inTemplate) inDouble = !inDouble;
				else if (char === '`' && !inSingle && !inDouble) inTemplate = !inTemplate;
			}

			// 3. 정규식 리터럴 상태 처리
			if (!escaped && !inSingle && !inDouble && !inTemplate) {
				if (inRegex) {
					if (inCharClass) {
						if (char === ']') inCharClass = false;
					} else {
						if (char === '[') inCharClass = true;
						else if (char === '/') inRegex = false; // 정규식 종료
					}
				} else {
					// 정규식 시작 조건 체크
					if (char === '/' && next !== '/' && next !== '*') {
						const prevTrim = line.slice(0, i).trim();
						const prevNonWs = prevTrim.slice(-1);

						// 정규식 시작 유도 키워드
						const isKeyword = /\b(return|throw|case|typeof|instanceof|in|of)$/.test(prevTrim);

						if (isKeyword || !/[\w\d)\]}]/.test(prevNonWs)) {
							inRegex = true;
						}
					}
				}
			}

			// 4. 주석 시작 체크 (문자열, 정규식 내부가 아닐 때만)
			if (!escaped && !inSingle && !inDouble && !inTemplate && !inRegex) {
				// 1. 한 줄 주석 (//)
				if (char === '/' && next === '/') {
					break;
				}
				// 2. 블록 주석 (/*)
				if (char === '/' && next === '*') {
					result += '  '; // "/*" 길이 보존
					currentInBlock = true;
					i += 2;
					continue;
				}
			}

			// Reset escaped
			escaped = false;
		}

		else if (mode === 'css') {
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
					result += '  '; // "/*" 길이 보존
					currentInBlock = true;
					i += 2;
					continue;
				}
			}
		} else {
			// Markup 모드
			const isBlockStart =
				(mode === 'markup' && char === '<' && next === '!' && line.slice(i, i + 4) === '<!--');

			if (isBlockStart) {
				result += '    '; // "<!--" 길이 보존
				currentInBlock = true;
				i += 4;
				continue;
			}
		}

		result += char;
		i++;
	}

	return { line: result, state: { inBlock: currentInBlock, inTemplate } };
}

/**
 * 원본 라인에서 security-ignore 억제 룰 ID 추출
 */
function extractSuppressedRuleIds(rawLine: string): Set<string> {
	const suppressed = new Set<string>();
	const re = /security-ignore:\s*([a-z0-9-]+)/gi;
	for (const m of rawLine.matchAll(re)) suppressed.add(m[1]);
	return suppressed;
}

function lintLines(
	lines: string[],
	filePath: string,
	rules: SecurityRule[],
	lineOffset: number = 0,
	skipLineRanges: Array<{ start: number; end: number; }> = [],
	commentMode: CommentMode = 'js'
): SecurityResult[] {
	const results: SecurityResult[] = [];
	let parsingState: ParsingState = { inBlock: false, inTemplate: false };

	for (let lineNum = 0; lineNum < lines.length; lineNum++) {
		const actualLine = lineNum + lineOffset;

		if (skipLineRanges.some((r) => actualLine >= r.start && actualLine < r.end)) {
			// 스킵 구간이어도 상태 업데이트를 위해 파싱은 수행
			const stripped = stripComments(lines[lineNum], commentMode, parsingState);
			parsingState = stripped.state;
			// line-local state인 inTemplate이 true면 다음 줄도 template 내부로 시작됨
			// 단, commentMode가 js가 아니면 inTemplate은 의미 없음
			if (commentMode !== 'js') parsingState.inTemplate = false;
			continue;
		}

		let line = lines[lineNum];
		const rawLine = line; // suppression 추출용 원본 보존

		// suppression을 먼저 추출 (주석 제거 전에)
		const suppressed = extractSuppressedRuleIds(rawLine);

		// 통합 주석 처리
		const stripped = stripComments(line, commentMode, parsingState);
		parsingState = stripped.state;
		// line-local state인 inTemplate이 true면 다음 줄도 template 내부로 시작됨
		// 단, commentMode가 js가 아니면 inTemplate은 의미 없음
		if (commentMode !== 'js') parsingState.inTemplate = false;

		line = stripped.line;

		// 빈 줄이면 건너뜀
		if (line.trim() === '') continue;

		for (const rule of rules) {
			// private env는 서버 파일이면 건너뜀
			if (rule.id === 'sveltekit-private-env' && isServerFile(filePath)) continue;

			// suppression comment 확인 (원본 라인에서 추출한 것 사용)
			if (suppressed.has(rule.id)) continue;

			const regex = rule.pattern;
			regex.lastIndex = 0;

			// g 플래그가 없으면 1회만 매칭 (무한 루프 방지)
			if (!regex.global) {
				const match = regex.exec(line);
				if (match) {
					// 추가 검증 (check 함수) - context 전달
					if (rule.check && !rule.check(match[0], { file: filePath, line: lineNum + 1 + lineOffset, content: line })) {
						continue;
					}

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
					// 추가 검증 (check 함수) - context 전달
					if (rule.check && !rule.check(match[0], { file: filePath, line: lineNum + 1 + lineOffset, content: line })) {
						// 정규식 lastIndex가 전진했는지 확인 (빈 매치 방지용)
						if (match[0] === '') regex.lastIndex++;
						continue;
					}

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

const COOKIE_FLAGS_RULE: SecurityRule = {
	id: 'session-cookie-flags-missing',
	name: 'cookies.set 옵션 누락 가능성',
	category: 'Session',
	description: 'cookies.set 호출에서 httpOnly, secure, sameSite 누락 점검',
	pattern: /cookies\.set\s*\(/g,
	suggestion: 'cookies.set 옵션에 httpOnly, secure, sameSite를 명시하고 목적에 맞게 설정',
	severity: 'warning',
	scope: 'server-only',
	references: ['https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html']
};

function indexToLineCol(text: string, index: number): { line: number; column: number; } {
	const before = text.slice(0, index);
	const line = (before.match(/\n/g) || []).length + 1;
	const lastNl = before.lastIndexOf('\n');
	const column = index - (lastNl === -1 ? -1 : lastNl);
	return { line, column };
}

function lintCookieSetOptions(content: string, filePath: string): SecurityResult[] {
	const results: SecurityResult[] = [];
	const re = /\b(?:event\.)?cookies\.set\s*\(/g;
	let m: RegExpExecArray | null;

	// biome-ignore lint/suspicious/noAssignInExpressions: standard regex loop pattern
	while ((m = re.exec(content)) !== null) {
		const start = m.index;

		// 대충 이 호출 구간만 스캔, 너무 멀리 가면 오탐이 늘어서 적당히 끊기
		const slice = content.slice(start, Math.min(content.length, start + 1500));

		const missing: string[] = [];
		if (!/\bhttpOnly\s*:/i.test(slice)) missing.push('httpOnly');
		if (!/\bsecure\s*:/i.test(slice)) missing.push('secure');
		if (!/\bsameSite\s*:/i.test(slice)) missing.push('sameSite');

		// 같은 파일에서 cookies.set을 여러 줄로 쓰는 경우가 많아서
		// 누락 체크는 가벼운 경고로만 둠
		if (missing.length > 0) {
			const pos = indexToLineCol(content, start);
			results.push({
				file: filePath,
				line: pos.line,
				column: pos.column,
				rule: COOKIE_FLAGS_RULE,
				match: 'cookies.set('
			});
		}

		// sameSite none인데 secure true가 아닐 때는 더 강하게 경고
		if (/\bsameSite\s*:\s*['"]none['"]/i.test(slice) && !/\bsecure\s*:\s*true\b/i.test(slice)) {
			const pos = indexToLineCol(content, start);
			results.push({
				file: filePath,
				line: pos.line,
				column: pos.column,
				rule: {
					...COOKIE_FLAGS_RULE,
					id: 'session-cookie-samesite-none-without-secure',
					name: 'sameSite none 사용 시 secure true 필요',
					suggestion: 'sameSite none을 쓰면 secure true가 사실상 필수',
					severity: 'error'
				},
				match: "sameSite: 'none'"
			});
		}
	}

	return results;
}

function lintContent(content: string, filePath: string): SecurityResult[] {
	const results: SecurityResult[] = [];
	const isSvelte = filePath.endsWith('.svelte');
	const isHtml = filePath.endsWith('.html');
	const isCss = filePath.endsWith('.css');
	const isServer = isServerFile(filePath);

	const scriptRules = RULES.filter((r) => r.scope === 'script' || r.scope === 'all');
	const markupRules = RULES.filter((r) => r.scope === 'markup' || r.scope === 'all');
	const serverRules = RULES.filter((r) => r.scope === 'server-only');
	const configRules = RULES.filter((r) => r.scope === 'config');

	if (isSvelte || isHtml) {
		const scriptBlocks = extractScriptBlocks(content);
		const styleBlocks = extractStyleBlocks(content);

		for (const block of scriptBlocks) {
			const lines = block.content.split('\n');
			results.push(...lintLines(lines, filePath, scriptRules, block.startLine, [], 'js'));
		}

		const skipRanges = [
			...scriptBlocks.map((b) => ({ start: b.startLine, end: b.endLine })),
			...styleBlocks.map((b) => ({ start: b.startLine, end: b.endLine }))
		];
		const fullLines = content.split('\n');
		results.push(...lintLines(fullLines, filePath, markupRules, 0, skipRanges, 'markup'));

		// Style Check
		const cssRules = RULES.filter((r) => r.category === 'CSS');
		for (const block of styleBlocks) {
			const lines = block.content.split('\n');
			results.push(...lintLines(lines, filePath, cssRules, block.startLine, [], 'css'));
		}

		// [NEW] Multi-line Markup Check (예: xss-target-blank)
		// 줄 단위가 아니라 전체 컨텐츠에서 태그를 찾음
		// script/style 내부 내용은 공백으로 치환하여 오탐 방지 (줄바꿈은 유지)
		const maskedContent = content.replace(
			/<script[^>]*>([\s\S]*?)<\/script>/gi,
			(match, body) => match.replace(body, body.replace(/[^\n]/g, ' '))
		).replace(
			/<style[^>]*>([\s\S]*?)<\/style>/gi,
			(match, body) => match.replace(body, body.replace(/[^\n]/g, ' '))
		);

		const markupRulesForMultiLine = RULES.filter(r => r.id === 'xss-target-blank');
		const allLines = content.split('\n');

		for (const rule of markupRulesForMultiLine) {
			// <a> 태그 전체 매칭 (멀티라인 포함) - maskedContent 사용
			const pattern = /<a\s+[^>]*target=["']_blank["'][^>]*>/gis;
			let match: RegExpExecArray | null;
			// biome-ignore lint/suspicious/noAssignInExpressions: standard regex loop pattern
			while ((match = pattern.exec(maskedContent)) !== null) {
				const fullMatch = match[0];

				// 매치된 구간의 줄 범위 계산
				const startPos = indexToLineCol(content, match.index);
				const endPos = indexToLineCol(content, match.index + fullMatch.length);
				const startLine = startPos.line;
				const endLine = endPos.line;

				// Suppression Check: 매치 구간 내 어떤 줄이라도 security-ignore가 있으면 스킵
				// + 바로 윗줄도 확인 (표준적인 주석 위치)
				let suppressed = false;
				for (let l = startLine - 2; l < endLine; l++) { // startLine-2 captures the line before
					if (l >= 0 && l < allLines.length) {
						if (extractSuppressedRuleIds(allLines[l]).has(rule.id)) {
							suppressed = true;
							break;
						}
					}
				}
				if (suppressed) continue;

				// rel 확인 (원본 매치 문자열 사용 - maskedContent에서 태그 자체는 유지됨)
				const relMatch = fullMatch.match(/rel=["']([^"']*)["']/i); // case insensitive checking
				let safe = false;
				if (relMatch) {
					const relValue = relMatch[1].toLowerCase();
					if (relValue.includes('noopener') || relValue.includes('noreferrer')) {
						safe = true;
					}
				}

				if (!safe) {
					const compact = fullMatch.replace(/\n/g, ' ');
					const preview = compact.length > 200 ? `${compact.slice(0, 200)}...` : compact;

					results.push({
						file: filePath,
						line: startLine,
						column: startPos.column,
						rule: rule,
						match: preview
					});
				}
			}
		}

	} else if (isCss) {
		const lines = content.split('\n');
		const cssRules = RULES.filter((r) => r.category === 'CSS');
		results.push(...lintLines(lines, filePath, cssRules, 0, [], 'css'));
	} else {
		const lines = content.split('\n');
		results.push(...lintLines(lines, filePath, scriptRules, 0, [], 'js'));

		if (isServer) {
			results.push(...lintLines(lines, filePath, serverRules, 0, [], 'js'));
			results.push(...lintCookieSetOptions(content, filePath));
		}

		// config 파일 검사
		if (filePath.includes('uno.config') || filePath.includes('unocss.config')) {
			results.push(...lintLines(lines, filePath, configRules, 0, [], 'js'));
		}
	}



	return results;
}

async function lintFile(path: string): Promise<SecurityResult[]> {
	const content = await readFile(path, 'utf-8');
	return lintContent(content, path);
}

function formatResults(results: SecurityResult[], basePath: string): string {
	const lines: string[] = [];

	if (results.length === 0) {
		lines.push('✅ 보안 이슈가 발견되지 않았습니다.');
		return lines.join('\n');
	}

	// 결과 정렬 (카테고리 → 상대경로 → 라인 → 컬럼)
	// 상대 경로 기준 정렬로 실행 위치 무관한 일관된 결과 보장
	const toRelPath = (file: string) => relative(basePath, file).replace(/\\/g, '/');
	const sorted = [...results].sort((a, b) => {
		const catCmp = a.rule.category.localeCompare(b.rule.category);
		if (catCmp !== 0) return catCmp;
		const fileCmp = toRelPath(a.file).localeCompare(toRelPath(b.file));
		if (fileCmp !== 0) return fileCmp;
		const lineCmp = a.line - b.line;
		if (lineCmp !== 0) return lineCmp;
		return a.column - b.column;
	});

	// 카테고리별로 그룹화
	const byCategory = new Map<string, SecurityResult[]>();
	for (const r of sorted) {
		const cat = r.rule.category;
		if (!byCategory.has(cat)) byCategory.set(cat, []);
		byCategory.get(cat)?.push(r);
	}

	const counts = { error: 0, warning: 0, info: 0 };

	for (const [category, catResults] of byCategory) {
		lines.push(`\n🔐 [${category}]`);

		// 파일별로 하위 그룹화 (슬래시 통일된 상대경로 사용)
		const byFile = new Map<string, SecurityResult[]>();
		for (const r of catResults) {
			const rel = toRelPath(r.file);
			if (!byFile.has(rel)) byFile.set(rel, []);
			byFile.get(rel)?.push(r);
		}

		for (const [file, fileResults] of byFile) {
			lines.push(`  📄 ${file}`);
			for (const r of fileResults) {
				const icon =
					r.rule.severity === 'error' ? '❌' : r.rule.severity === 'warning' ? '⚠️' : '💡';
				lines.push(`    ${icon} L${r.line}:${r.column} [${r.rule.id}]`);
				lines.push(`       ${r.rule.name}: "${r.match.trim()}"`);
				lines.push(`       → ${r.rule.suggestion}`);
				const sev = r.rule.severity as keyof typeof counts;
				counts[sev]++;
			}
		}
	}

	lines.push(`\n${'═'.repeat(50)}`);
	lines.push(
		`총 ${results.length}개 보안 이슈: ❌ ${counts.error} 오류, ⚠️ ${counts.warning} 경고, 💡 ${counts.info} 정보`
	);

	return lines.join('\n');
}

async function main() {
	const TARGET = process.argv.slice(2).find((arg) => !arg.startsWith('--')) || 'src';
	const FILTER_SEVERITY = process.argv.includes('--errors-only') ? 'error' : null;
	const NO_REPORT = process.argv.includes('--no-report');

	console.log('🔒 보안 패턴 스캐너');
	console.log(`🔍 스캔 대상: ${TARGET}`);

	try {
		const startTime = performance.now();
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
			// 경로 구분자 정규화 후 정렬 (OS 무관 일관된 순서)
			files = (await walk(TARGET)).sort((a, b) =>
				a.replace(/\\/g, '/').localeCompare(b.replace(/\\/g, '/'))
			);
		}

		console.log(`📁 ${files.length}개 파일 발견\n`);

		let allResults: SecurityResult[] = [];
		for (const file of files) {
			const results = await lintFile(file);
			allResults.push(...results);
		}

		const elapsed = performance.now() - startTime;
		const elapsedStr = elapsed < 1000 ? `${elapsed.toFixed(0)}ms` : `${(elapsed / 1000).toFixed(2)}s`;

		if (FILTER_SEVERITY) {
			allResults = allResults.filter((r) => r.rule.severity === FILTER_SEVERITY);
		}

		// basePath는 디렉터리 기준으로 (파일 타겟일 때 relative 경로 정상화)
		const basePath = targetStat.isFile() ? dirname(TARGET) : TARGET;
		const report = formatResults(allResults, basePath);
		console.log(report);
		console.log(`\n⏱️ 소요 시간: ${elapsedStr}`);

		// 에러가 있으면 종료 코드 1 설정 (CI 실패 유도)
		const errorCount = allResults.filter((r) => r.rule.severity === 'error').length;
		if (errorCount > 0) {
			process.exitCode = 1;
		}

		// 리포트 저장 (폴더 자동 생성)
		if (!NO_REPORT) {
			const scriptDir = dirname(fileURLToPath(import.meta.url));
			const reportsDir = join(scriptDir, 'reports');
			await mkdir(reportsDir, { recursive: true });
			const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
			const reportPath = join(reportsDir, 'security-report.txt');
			const header = `Security Report - ${timestamp}\nTarget: ${TARGET}\nElapsed: ${elapsedStr}\n${'='.repeat(50)}\n`;
			await writeFile(reportPath, header + report, 'utf-8');
			console.log(`📝 리포트 저장됨: ${reportPath}`);
		}
	} catch (error) {
		console.error('Error:', error);
		process.exit(1);
	}
}

main();
