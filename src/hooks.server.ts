/**
 * [hooks.server.ts] 서버 사이드 전용 훅
 * 실행 환경: 서버 (Node.js, Bun, Cloudflare Workers 등)
 * 핵심 역할: 보안 통제, 데이터 제어, 백엔드 로직 수행
 *
 * [주요 활용 예시 7가지]
 * 1. [인증 및 세션] 쿠키에서 세션 ID를 검증하고 event.locals에 유저 정보를 주입하여 서버 전역에서 사용
 * 2. [보안 헤더] CSP, CORS 등 보안 관련 헤더를 강제로 주입하여 외부 공격 방어
 * 3. [DB 연결] 요청이 들어올 때마다 데이터베이스 연결을 확인하거나 커넥션 풀 초기화
 * 4. [접근 제어] 관리자(/admin) 등 특정 경로 접근 시 권한을 확인하고 차단 또는 리다이렉트
 * 5. [API 프록시] 프론트엔드의 요청을 가로채 서버에 숨겨진 비밀 API 키를 헤더에 붙여서 외부로 전송
 * 6. [에러 모니터링] 서버 내부에서 발생한 500 에러 등을 포착하여 슬랙, 디스코드, Sentry 등으로 알림 전송
 * 7. [테마 감지] 초기 요청 시 쿠키를 읽어 다크/라이트 모드를 판별하고 깜빡임 없는 HTML 렌더링 지원
 */

import type { Handle, HandleServerError } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { FONT_SIZE_COOKIE, policy, THEME_COOKIE } from '$lib/constants';
import { baseLocale, extractLocaleFromHeader, isLocale } from '$lib/paraglide/runtime.js';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { checkRateLimit, getClientIP, type RateLimitRule } from '$lib/server/rate-limiter';

// ============================================================================
// 0. Rate Limiting 핸들러
// IP별 요청 횟수를 추적하여 초당 최대 요청 수를 초과하면 429 응답 반환
// ============================================================================

/** high-risk 경로 패턴 (인증 관련) - 중복 정의 방지를 위해 상수로 분리 */
const HIGH_RISK_PATTERN = /^\/(auth|login|signup|reset)(?:$|\/)/;

// Rate Limit 규칙 정의
const RATE_LIMIT_RULES: RateLimitRule[] = [
	{
		name: 'high-risk',
		// 인증 관련 경로는 엄격하게 제한 (10회/분)
		pattern: HIGH_RISK_PATTERN,
		windowMs: 60 * 1000,
		max: 10
	},
	{
		name: 'default',
		// 그 외 경로는 일반 정책 적용 (50회/분 - constants 정책 사용)
		pattern: /.*/,
		windowMs: policy.rateLimit.windowMs,
		max: policy.rateLimit.maxRequests
	}
];

// unknown IP용 high-risk 경로 규칙 (공유 버킷 방어)
const UNKNOWN_HIGH_RISK_RULES: RateLimitRule[] = [
	{ name: 'unknown-high-risk', pattern: HIGH_RISK_PATTERN, windowMs: 60_000, max: 3 }
];

/**
 * 정적 파일 요청인지 확인 (Rate Limit 제외 대상)
 */
function isStaticRequest(pathname: string): boolean {
	const p = pathname.toLowerCase();
	return (
		p.startsWith('/_app/') || // SvelteKit 빌드 출력
		p.startsWith('/favicon') ||
		p.startsWith('/apple-touch-icon') ||
		p.startsWith('/icons/') || // /icons/ 디렉토리
		p.startsWith('/icon-') || // icon-192.png 등
		p.startsWith('/icon.') || // icon.png 등
		p === '/robots.txt' ||
		p === '/sitemap.xml' ||
		p === '/sitemap.xml.gz' ||
		p === '/manifest.webmanifest' ||
		p === '/manifest.json' ||
		p === '/service-worker.js' ||
		p === '/sw.js'
	);
}

/**
 * 브라우저 문서 네비게이션 요청인지 확인
 * F5 새로고침, 주소창 직접 입력, 링크 클릭 등만 타깃
 */
function isDocumentNavigation(request: Request): boolean {
	if (request.method !== 'GET') return false;

	// sec-fetch-dest: document가 가장 정확 (문서 요청 전용)
	const dest = request.headers.get('sec-fetch-dest');
	if (dest === 'document') return true; // security-ignore: sveltekit-browser-globals-server - 서버에서 헤더 접근은 정상 동작이며 오탐 방지용

	// 폴백: navigate 모드 또는 HTML Accept 헤더
	const mode = request.headers.get('sec-fetch-mode');
	const accept = request.headers.get('accept') || '';
	return mode === 'navigate' || accept.includes('text/html');
}

/**
 * 429 응답 HTML 생성 (중복 제거)
 */
function render429Html(retryAfter: number): string {
	return `<!DOCTYPE html>
<html lang="ko">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>요청 제한</title>
	<style>
		body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
		.container { text-align: center; padding: 2rem; }
		h1 { font-size: 3rem; margin: 0; }
		p { color: #666; margin-top: 1rem; }
	</style>
</head>
<body>
	<div class="container">
		<h1>⏳</h1>
		<p>요청이 너무 빨라요.<br>${retryAfter}초 후 다시 시도해 주세요.</p>
	</div>
</body>
</html>`;
}

/**
 * Rate Limit 결과 타입 (타입 드리프트 방지)
 * - rate-limiter의 반환 타입에서 필요한 필드만 추출
 */
type RateLimitResult = ReturnType<typeof checkRateLimit>;
type RateLimitHeaderFields = Pick<RateLimitResult, 'retryAfter' | 'limit' | 'remaining' | 'reset'>;

/**
 * Rate Limit 차단 시 429 응답 생성
 * - Retry-After, Cache-Control, X-RateLimit-* 헤더 포함
 * - Accept 헤더에 따라 HTML 또는 JSON 응답 분기
 */
function create429Response(request: Request, result: RateLimitHeaderFields): Response {
	const accept = request.headers.get('accept') || '';
	const wantsHtml = accept.includes('text/html');

	const headers = new Headers();
	headers.set('Retry-After', String(result.retryAfter));
	headers.set('Cache-Control', 'private, no-store');
	headers.set('Vary', 'Accept'); // HTML/JSON 분기에 따른 프록시 혼란 방지

	// X-RateLimit 헤더 추가 (일관성)
	if (result.limit > 0) {
		headers.set('X-RateLimit-Limit', String(result.limit));
		headers.set('X-RateLimit-Remaining', String(result.remaining));
		headers.set('X-RateLimit-Reset', String(result.reset));
	}

	if (wantsHtml) {
		headers.set('Content-Type', 'text/html; charset=utf-8');
		return new Response(render429Html(result.retryAfter), { status: 429, headers });
	}

	headers.set('Content-Type', 'application/json; charset=utf-8');
	return new Response(JSON.stringify({ error: 'rate_limited', retryAfter: result.retryAfter }), {
		status: 429,
		headers
	});
}

const handleRateLimit: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;

	// 정적 파일은 Rate Limit 제외
	if (isStaticRequest(pathname)) {
		return resolve(event);
	}

	// high-risk 경로(인증 관련)는 모든 HTTP 메서드에 Rate Limit 적용
	// 그 외 경로는 문서 네비게이션(GET)만 적용하여 내부 fetch/프리로드 제외
	const isHighRiskPath = HIGH_RISK_PATTERN.test(pathname);
	const shouldApply = isHighRiskPath || isDocumentNavigation(event.request);

	if (!shouldApply) {
		return resolve(event);
	}

	const clientIP = getClientIP(event);

	// unknown IP 처리:
	// - 일반 경로: Rate Limit 건너뛰기 (모두가 같은 바구니 문제 방지)
	// - high-risk 경로: 공유 버킷으로 최소 방어 (공격 우회 방지)
	if (clientIP === 'unknown') {
		if (isHighRiskPath) {
			// high-risk 경로는 unknown IP도 공유 버킷으로 최소 방어 (분당 3회)
			const unknownResult = checkRateLimit(event, UNKNOWN_HIGH_RISK_RULES);

			if (unknownResult.blocked) {
				if (!import.meta.env.DEV) {
					const method = event.request.method;
					console.warn(
						`[RateLimit] ${method} unknown IP blocked (ID: ${event.locals.requestId}) on ${pathname} [Rule: ${unknownResult.ruleName}]. Retry after ${unknownResult.retryAfter}s.`
					);
				}
				return create429Response(event.request, unknownResult);
			}

			// 성공 응답에도 X-RateLimit 헤더 추가 (일관성)
			const response = await resolve(event);
			if (unknownResult.limit > 0) {
				response.headers.set('X-RateLimit-Limit', String(unknownResult.limit));
				response.headers.set('X-RateLimit-Remaining', String(unknownResult.remaining));
				response.headers.set('X-RateLimit-Reset', String(unknownResult.reset));
			}
			return response;
		}
		return resolve(event);
	}

	// 모듈을 통한 Rate Limit 검사
	const result = checkRateLimit(event, RATE_LIMIT_RULES);

	// Rate Limit 정보 헤더 준비
	const setRateLimitHeaders = (headers: Headers) => {
		if (result.limit > 0) {
			headers.set('X-RateLimit-Limit', String(result.limit));
			headers.set('X-RateLimit-Remaining', String(result.remaining));
			headers.set('X-RateLimit-Reset', String(result.reset));
		}
	};

	if (result.blocked) {
		const method = event.request.method;
		console.warn(
			`[RateLimit] ${method} blocked for ${clientIP} (ID: ${event.locals.requestId}) on ${pathname} [Rule: ${result.ruleName}]. Retry after ${result.retryAfter}s.`
		);
		return create429Response(event.request, result);
	}

	const response = await resolve(event);
	setRateLimitHeaders(response.headers);

	return response;
};

// ============================================================================
// 2. 다국어 + 테마 + 폰트 크기 처리 (통합 핸들러)
// transformPageChunk를 한 곳에서만 사용하여 SvelteKit 업데이트에 대한 안정성 확보
// ============================================================================

/**
 * html 태그에 속성을 안전하게 설정/추가하는 헬퍼
 * - 속성이 있으면 값만 교체
 * - 속성이 없으면 새로 추가
 */
function setAttrOnTag(tag: string, name: string, value: string): string {
	const needle = `${name}="`;
	const i = tag.indexOf(needle);
	if (i >= 0) {
		const j = tag.indexOf('"', i + needle.length);
		if (j >= 0) return `${tag.slice(0, i)}${needle}${value}"${tag.slice(j + 1)}`;
		return tag;
	}
	// 속성이 없으면 > 앞에 새로 추가
	const k = tag.lastIndexOf('>');
	if (k < 0) return tag;
	return `${tag.slice(0, k)} ${name}="${value}"${tag.slice(k)}`;
}

/**
 * HTML 문서의 <html> 태그에만 테마/폰트 속성을 주입
 * - 정규식 대신 문자열 파싱으로 예측 가능성 향상
 * - 대소문자 안전 처리 (앞부분만 lowercase 비교로 성능 최적화)
 * - 다른 엘리먼트의 동일 속성에 영향 주지 않음
 *
 * 참고: setAttrOnTag는 name="만 찾으므로, SSR 출력에서 속성이
 * 큰따옴표(")를 사용한다는 전제가 있습니다 (SvelteKit 기본 동작).
 */
function patchHtmlRoot(
	html: string,
	theme: string | null,
	fontSize: string | null | undefined
): string {
	// 성능 최적화: 전체 HTML 대신 앞 8KB만 lowercase 처리
	const HEAD_LIMIT = 8192;
	const head = html.slice(0, HEAD_LIMIT);
	const lowerHead = head.toLowerCase();
	const start = lowerHead.indexOf('<html');
	if (start < 0) return html;

	// 다음 문자 검사를 위한 범위 확인
	if (start + 5 >= lowerHead.length) return html;

	// <htmlx> 같은 오탐 방지: 다음 문자가 공백/>/개행인지 확인
	const nextChar = lowerHead[start + 5];
	if (nextChar && ![' ', '>', '\n', '\r', '\t'].includes(nextChar)) return html;

	// 스캔 비용 상한: start부터 최대 1024자 범위 안에서만 > 찾기
	const TAG_MAX_LEN = 1024;
	const endLimit = Math.min(HEAD_LIMIT, start + TAG_MAX_LEN);
	const endRel = html.slice(start, endLimit).indexOf('>');
	if (endRel < 0) return html;

	const end = start + endRel;
	let tag = html.slice(start, end + 1);

	if (theme) tag = setAttrOnTag(tag, 'data-theme', theme);
	if (fontSize && /^[1-9]$/.test(fontSize)) tag = setAttrOnTag(tag, 'data-font-size', fontSize);

	return html.slice(0, start) + tag + html.slice(end + 1);
}

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		// 테마 쿠키 읽기 (light/dark만 허용)
		const rawTheme = event.cookies.get(THEME_COOKIE);
		const theme = rawTheme === 'light' || rawTheme === 'dark' ? rawTheme : null;

		// 폰트 크기 쿠키 읽기 (1~9만 허용)
		const fontSize = event.cookies.get(FONT_SIZE_COOKIE);

		return resolve(event, {
			transformPageChunk: ({ html }) => {
				// 언어 속성 주입 (중복 등장 대비 replaceAll 사용)
				html = html.replaceAll('%paraglide.lang%', locale);

				// <html> 태그에만 테마/폰트 속성 주입
				html = patchHtmlRoot(html, theme, fontSize);

				return html;
			}
		});
	});

// ============================================================================
// 3. 루트 경로 자동 리다이렉트 (언어 감지)
// Paraglide의 URL 전략이 루트('/')를 기본 언어(en)로 인식하여 preferredLanguage가 무시되는 문제 해결
// 쿠키가 없는 첫 방문자에게만 적용됨
// ============================================================================

const handleRootRedirect: Handle = async ({ event, resolve }) => {
	// 루트 경로이고, 쿼리 파라미터가 없는 경우에만 수행 (보수적 접근)
	if (event.url.pathname === '/' && event.url.search === '') {
		const cookie = event.cookies.get('PARAGLIDE_LOCALE');

		// 1. 쿠키가 있는 경우: 쿠키 값에 따라 리다이렉트 결정
		if (cookie && isLocale(cookie)) {
			// 쿠키가 기본 언어(en)가 아니라면 해당 언어 경로로 리다이렉트
			// 예: 쿠키가 'ko'이면 /ko 로 이동. 쿠키가 'en'이면 그냥 둬서 / (영어)로 진입.
			if (cookie !== baseLocale) {
				return new Response(null, {
					status: 302,
					headers: {
						Location: `/${cookie}`,
						'Cache-Control': 'private, no-store',
						Vary: 'Accept-Language, Cookie'
					}
				});
			}
			// 쿠키가 'en'인 경우 바로 통과시켜서 Paraglide가 / = en 으로 처리하게 함
			return resolve(event);
		}

		// 2. 쿠키가 없는 경우: 브라우저 언어 설정(Accept-Language) 확인
		const preferredLocale = extractLocaleFromHeader(event.request);

		// 감지된 언어가 있고, 기본 언어와 다르며, 유효한 로케일인 경우 리다이렉트
		if (preferredLocale && preferredLocale !== baseLocale && isLocale(preferredLocale)) {
			if (import.meta.env.DEV) {
				console.log(`[Root Redirect] Redirecting to /${preferredLocale} based on Accept-Language`);
			}
			// CDN 캐시 오염 방지: 리다이렉트 응답은 캐싱하지 않음
			return new Response(null, {
				status: 302,
				headers: {
					Location: `/${preferredLocale}`,
					'Cache-Control': 'private, no-store',
					Vary: 'Accept-Language, Cookie'
				}
			});
		}
	}
	return resolve(event);
};

// ============================================================================
// 4. 보안 헤더 핸들러
// 기본 보안 헤더를 응답에 추가 (CSP는 사이트별로 kit.csp 또는 플랫폼에서 설정 권장)
// ============================================================================

/**
 * 헤더가 없을 때만 설정
 */
function setIfMissing(headers: Headers, name: string, value: string): void {
	if (!headers.has(name)) headers.set(name, value);
}

/**
 * Vary 헤더에 값을 안전하게 추가 (중복/wildcard 처리)
 */
function appendVary(headers: Headers, value: string): void {
	const existing = headers.get('Vary');
	if (!existing) {
		headers.set('Vary', value);
		return;
	}

	// Vary: * 는 모든 변형을 의미하므로 그대로 둠
	if (existing.trim() === '*') return;

	const parts = existing
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);
	const has = parts.some((p) => p.toLowerCase() === value.toLowerCase());
	if (!has) headers.set('Vary', `${parts.join(', ')}, ${value}`);
}

const handleSecurityHeaders: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	const headers = response.headers;

	// 기본 보안 헤더들
	setIfMissing(headers, 'X-Content-Type-Options', 'nosniff');
	setIfMissing(headers, 'Referrer-Policy', 'strict-origin-when-cross-origin');
	setIfMissing(headers, 'X-Frame-Options', 'DENY');
	setIfMissing(headers, 'X-Permitted-Cross-Domain-Policies', 'none');
	setIfMissing(headers, 'Origin-Agent-Cluster', '?1');

	// 불필요한 브라우저 기능 차단
	setIfMissing(
		headers,
		'Permissions-Policy',
		'geolocation=(), microphone=(), camera=(), payment=(), usb=()'
	);

	// HTTPS에서만 HSTS (1년, 서브도메인 포함)
	if (event.url.protocol === 'https:') {
		setIfMissing(headers, 'Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
	}

	// CSP는 사이트별로 설정 권장:
	// - SvelteKit: svelte.config.js의 kit.csp 옵션
	// - Vercel/Cloudflare: 대시보드 또는 설정 파일
	// - Netlify: netlify.toml의 [[headers]] 섹션

	// [Smart Cache Control]
	// Set-Cookie가 있는 응답은 민감한 세션 정보를 포함할 가능성이 높으므로 캐시를 금지합니다.
	// 스타터 템플릿의 안전한 기본값(Safe Defaults)입니다.
	if (response.headers.has('set-cookie')) {
		response.headers.set('Cache-Control', 'no-store, private');
	}

	// [Vary: Cookie for HTML]
	// 쿠키(테마, 폰트 크기)로 HTML을 커스터마이징하므로, CDN 공유 캐시 오염 방지
	// 같은 URL이라도 쿠키가 다르면 다른 응답으로 취급하도록 지시
	const contentType = headers.get('content-type')?.toLowerCase() || '';
	if (contentType.includes('text/html')) {
		appendVary(headers, 'Cookie');
	}

	return response;
};

// ============================================================================
// 5. Request ID 핸들러
// 모든 요청에 고유 ID를 부여하여 로그 추적 및 디버깅 용이성 확보
// ============================================================================

const handleRequestId: Handle = async ({ event, resolve }) => {
	// 외부(로드밸런서 등)에서 전달된 ID가 있으면 재사용, 없으면 새로 생성
	// 로그 인젝션 방지를 위해 형태와 길이 제한 (UUID 형태 또는 영숫자+하이픈, 최대 64자)
	const incoming = event.request.headers.get('x-request-id') || '';
	const safe = /^[A-Za-z0-9-]{1,64}$/.test(incoming) ? incoming : '';
	const requestId = safe || crypto.randomUUID();
	event.locals.requestId = requestId;

	const response = await resolve(event);
	response.headers.set('x-request-id', requestId);

	return response;
};

// ============================================================================
// 6. Request Size Limit 핸들러 (Content-Length 검사)
// 대용량 본문 공격(DoS)을 방지하기 위해 헤더를 미리 검사하여 차단합니다.
// ============================================================================

const handleBodySizeLimit: Handle = async ({ event, resolve }) => {
	const { method, headers } = event.request;
	if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
		const raw = headers.get('content-length');
		if (raw != null) {
			// 로그 인젝션 방지: 줄바꿈 제거 + 양끝 공백 제거
			const safeRaw = raw.replaceAll('\r', '').replaceAll('\n', '').trim();
			// 로그 값 길이 제한: 비정상적으로 긴 값이 로그를 오염시키는 것 방지
			const rawForLog = safeRaw.length > 80 ? `${safeRaw.slice(0, 80)}...` : safeRaw;

			// Content-Length는 순수 10진수 숫자만 허용 (RFC 9110, RFC 9112)
			// 비정상적으로 긴 값은 정규식 검사 전에 차단 (32자 = 10^32 bytes, 현실 불가)
			// Number()의 관대한 파싱(빈 문자열→0, 0x10→16 등) 우회 방지
			if (safeRaw.length > 32 || !/^\d+$/.test(safeRaw)) {
				if (!import.meta.env.DEV) {
					console.warn(
						`[SizeLimit] Invalid Content-Length (ID: ${event.locals.requestId}) - ${method} ${event.url.pathname} - raw=${rawForLog}`
					);
				}
				return new Response('Bad Request', {
					status: 400,
					headers: {
						'Content-Type': 'text/plain; charset=utf-8',
						'Cache-Control': 'private, no-store'
					}
				});
			}

			const len = Number(safeRaw);
			if (len > policy.maxBodySize) {
				console.warn(
					`[SizeLimit] Blocked ${method} request (ID: ${event.locals.requestId}) - Size: ${len} > ${policy.maxBodySize}`
				);
				return new Response('Payload Too Large', {
					status: 413,
					headers: {
						'Content-Type': 'text/plain; charset=utf-8',
						'Cache-Control': 'private, no-store'
					}
				});
			}
		}
	}
	return resolve(event);
};

// ============================================================================
// 7. 핸들러 병합 및 내보내기
// 순서: Request ID → 보안 헤더 → Size Limit → Rate Limit → 루트 리다이렉트 → Paraglide(테마/폰트 통합)
// Request ID가 맨 앞이어야 모든 로그와 에러 처리에 ID를 연결할 수 있음
// ============================================================================
export const handle: Handle = sequence(
	handleRequestId,
	handleSecurityHeaders,
	handleBodySizeLimit,
	handleRateLimit,
	handleRootRedirect,
	handleParaglide
);

// ============================================================================
// 8. 서버 에러 핸들링
// isHttpError를 사용해 의도된 에러(4xx)와 예기치 못한 에러(5xx)를 구분합니다.
// ============================================================================

/**
 * SvelteKit error(status, body)에서 body가 문자열 또는 객체일 수 있으므로
 * 두 경우 모두 안전하게 메시지를 추출합니다.
 */
function pickHttpMessage(error: unknown): string | undefined {
	if (!error || typeof error !== 'object') return undefined;
	if (!('body' in error)) return undefined;

	const body = (error as { body?: unknown }).body;
	// body가 문자열인 경우 (예: error(401, 'Unauthorized'))
	if (typeof body === 'string' && body.trim()) return body;
	// body가 객체인 경우 (예: error(401, { message: 'Unauthorized' }))
	if (body && typeof body === 'object' && 'message' in body) {
		const msg = (body as { message?: unknown }).message;
		if (typeof msg === 'string' && msg.trim()) return msg;
	}
	return undefined;
}

export const handleError: HandleServerError = ({ error, event }) => {
	const requestId = event.locals.requestId || 'unknown';

	// 에러 객체에서 status 추출 (Safe Duck Typing + NaN/0 방어)
	const rawStatus =
		error && typeof error === 'object' && 'status' in error
			? (error as { status: unknown }).status
			: 500;
	const status =
		typeof rawStatus === 'number' && Number.isFinite(rawStatus) && rawStatus > 0 ? rawStatus : 500;

	const clientMsg = pickHttpMessage(error);

	// 1. 의도된 HTTP 에러 (400대: Not Found, Unauthorized 등)
	// 500 이상은 isHttpError()와 무관하게 항상 내부 메시지 숨김 (보안)
	if (status >= 400 && status < 500) {
		// 404는 로그를 남기지 않거나, 필요하다면 access log 수준으로 처리
		if (status !== 404) {
			console.warn(`[${requestId}] HTTP Error ${status}:`, clientMsg || 'Unknown error');
		}

		return {
			message: clientMsg || 'Error',
			requestId
		};
	}

	// 2. 예기치 못한 서버 시스템 에러 (500)
	console.error(`[${requestId}] Server Error:`, error);

	// 보안상 상세 에러 내용은 숨기고 일반적인 메시지 반환
	return {
		message: 'Internal Server Error',
		requestId
	};
};
