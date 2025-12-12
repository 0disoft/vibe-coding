import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * 보안 패턴 탐지 도구 (Security Pattern Scanner)
 *
 * SvelteKit 2, Svelte 5, TypeScript, UnoCSS, Bun 스택에서
 * 정적 분석으로 감지 가능한 보안 위험을 탐지합니다.
 *
 * 사용법:
 *   bunx tsx .vibe-coding/TOOLS/security-patterns.ts src
 *   bunx tsx .vibe-coding/TOOLS/security-patterns.ts src --errors-only
 */

// 규칙 스코프 정의
type RuleScope = 'script' | 'markup' | 'all' | 'server-only' | 'config';

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
		pattern: /\.(innerHTML|outerHTML)\s*=/g,
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
		pattern: /target\s*=\s*["']_blank["'](?![^>]*rel\s*=\s*["'][^"]*noopener)/gi,
		suggestion: 'rel="noopener noreferrer" 추가 필요',
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
		pattern: /\["?__proto__"?\]/g,
		suggestion: '입력에서 __proto__, prototype, constructor 키 필터링 필수',
		severity: 'error',
		scope: 'script',
		references: [
			'https://cheatsheetseries.owasp.org/cheatsheets/Prototype_Pollution_Prevention_Cheat_Sheet.html'
		]
	},
	{
		id: 'prototype-pollution-constructor',
		name: 'constructor 동적 접근',
		category: 'Prototype Pollution',
		description: 'constructor 속성 동적 접근 감지',
		pattern: /\["?constructor"?\]/g,
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
		scope: 'script',
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
		pattern: /Access-Control-Allow-Origin['"]\s*:\s*['"]\*/g,
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
		pattern: /bunx\s+(?!.*@[\d.])[a-z][\w-]*/gi,
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
		severity: 'error',
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

// 무시할 경로 패턴
const IGNORE_PATTERNS = [/node_modules/, /\.svelte-kit/, /dist/, /build/, /\.git/, /\/scripts\//];

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

function lintLines(
	lines: string[],
	filePath: string,
	rules: SecurityRule[],
	lineOffset: number = 0,
	skipLineRanges: Array<{ start: number; end: number }> = []
): SecurityResult[] {
	const results: SecurityResult[] = [];
	let inBlockComment = false;

	for (let lineNum = 0; lineNum < lines.length; lineNum++) {
		const actualLine = lineNum + lineOffset;

		if (skipLineRanges.some((r) => actualLine >= r.start && actualLine < r.end)) {
			continue;
		}

		let line = lines[lineNum];
		const trimmed = line.trim();

		// 블록 주석 처리
		if (inBlockComment) {
			if (trimmed.includes('*/')) inBlockComment = false;
			continue;
		}
		if (trimmed.startsWith('/*')) {
			inBlockComment = !trimmed.includes('*/');
			continue;
		}

		// 인라인 블록 주석 제거
		line = line.replace(/\/\*.*?\*\//g, '');
		const inlineCommentStart = line.indexOf('/*');
		if (inlineCommentStart !== -1) {
			line = line.slice(0, inlineCommentStart);
			inBlockComment = true;
		}

		if (trimmed.startsWith('//')) continue;

		for (const rule of rules) {
			// private env는 서버 파일이면 건너뜀
			if (rule.id === 'sveltekit-private-env' && isServerFile(filePath)) continue;

			// suppression comment 확인
			if (line.includes(`security-ignore: ${rule.id}`)) continue;

			const regex = rule.pattern;
			regex.lastIndex = 0;
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

function indexToLineCol(text: string, index: number): { line: number; column: number } {
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
	const isCss = filePath.endsWith('.css');
	const isServer = isServerFile(filePath);

	const scriptRules = RULES.filter((r) => r.scope === 'script' || r.scope === 'all');
	const markupRules = RULES.filter((r) => r.scope === 'markup' || r.scope === 'all');
	const serverRules = RULES.filter((r) => r.scope === 'server-only');
	const configRules = RULES.filter((r) => r.scope === 'config');

	if (isSvelte) {
		const scriptBlocks = extractScriptBlocks(content);
		const styleBlocks = extractStyleBlocks(content);

		for (const block of scriptBlocks) {
			const lines = block.content.split('\n');
			results.push(...lintLines(lines, filePath, scriptRules, block.startLine));
		}

		const skipRanges = [
			...scriptBlocks.map((b) => ({ start: b.startLine, end: b.endLine })),
			...styleBlocks.map((b) => ({ start: b.startLine, end: b.endLine }))
		];
		const fullLines = content.split('\n');
		results.push(...lintLines(fullLines, filePath, markupRules, 0, skipRanges));
	} else if (isCss) {
		const lines = content.split('\n');
		const cssRules = RULES.filter((r) => r.category === 'CSS');
		results.push(...lintLines(lines, filePath, cssRules));
	} else {
		const lines = content.split('\n');
		results.push(...lintLines(lines, filePath, scriptRules));

		if (isServer) {
			results.push(...lintLines(lines, filePath, serverRules));
			results.push(...lintCookieSetOptions(content, filePath));
		}

		// config 파일 검사
		if (filePath.includes('uno.config') || filePath.includes('unocss.config')) {
			results.push(...lintLines(lines, filePath, configRules));
		}
	}

	// Svelte style 블록 CSS 규칙 검사 (isSvelte일 때)
	if (isSvelte) {
		const styleBlocks = extractStyleBlocks(content);
		const cssRules = RULES.filter((r) => r.category === 'CSS');
		for (const block of styleBlocks) {
			const lines = block.content.split('\n');
			results.push(...lintLines(lines, filePath, cssRules, block.startLine));
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

	// 카테고리별로 그룹화
	const byCategory = new Map<string, SecurityResult[]>();
	for (const r of results) {
		const cat = r.rule.category;
		if (!byCategory.has(cat)) byCategory.set(cat, []);
		byCategory.get(cat)?.push(r);
	}

	const counts = { error: 0, warning: 0, info: 0 };

	for (const [category, catResults] of byCategory) {
		lines.push(`\n🔐 [${category}]`);

		// 파일별로 하위 그룹화
		const byFile = new Map<string, SecurityResult[]>();
		for (const r of catResults) {
			const rel = relative(basePath, r.file);
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
				counts[r.rule.severity]++;
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

	console.log('🔒 보안 패턴 스캐너');
	console.log(`🔍 스캔 대상: ${TARGET}`);

	try {
		const targetStat = await stat(TARGET);
		let files: string[];

		if (targetStat.isFile()) {
			const ext = extname(TARGET);
			if (!VALID_EXTENSIONS.includes(ext)) {
				console.log(`Error: 지원 확장자는 ${VALID_EXTENSIONS.join(', ')} 입니다.`);
				return;
			}
			files = [TARGET];
		} else {
			files = await walk(TARGET);
		}

		console.log(`📁 ${files.length}개 파일 발견\n`);

		let allResults: SecurityResult[] = [];
		for (const file of files) {
			const results = await lintFile(file);
			allResults.push(...results);
		}

		if (FILTER_SEVERITY) {
			allResults = allResults.filter((r) => r.rule.severity === FILTER_SEVERITY);
		}

		const report = formatResults(allResults, TARGET);
		console.log(report);

		// 리포트 저장
		const scriptDir = dirname(fileURLToPath(import.meta.url));
		const reportPath = join(scriptDir, 'reports', 'security-report.txt');
		const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
		const header = `Security Report - ${timestamp}\nTarget: ${TARGET}\n${'='.repeat(50)}\n`;
		await writeFile(reportPath, header + report, 'utf-8');
		console.log(`\n📝 리포트 저장됨: ${reportPath}`);
	} catch (error) {
		console.error('Error:', error);
	}
}

main();
