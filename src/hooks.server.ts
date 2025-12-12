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

import { FONT_SIZE_COOKIE, THEME_COOKIE, policy } from '$lib/constants';
import { paraglideMiddleware } from '$lib/paraglide/server';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks'; // 여러 핸들을 묶기 위해 가져옵니다.

// ============================================================================
// 0. Rate Limiting 핸들러
// IP별 요청 횟수를 추적하여 초당 최대 요청 수를 초과하면 429 응답 반환
// ============================================================================

// 인메모리 Rate Limit 저장소 (서버리스에서는 인스턴스별로 초기화되지만 기본 방어 가능)
const rateLimitMap = new Map<string, { count: number; resetTime: number; blocked: boolean; blockedUntil: number; }>();
let sweepTick = 0;

/**
 * 다양한 프록시/CDN 환경에서 실제 클라이언트 IP 추출
 * 플랫폼이 보증하는 헤더를 우선 사용 (Cloudflare 뒤에서 getClientAddress가 프록시 IP 줄 수 있음)
 */
function getClientIP(event: { request: Request; getClientAddress: () => string; }): string {
	const h = event.request.headers;

	// 플랫폼 보증 헤더 우선 (CDN/프록시가 설정)
	const cf = h.get('cf-connecting-ip');
	if (cf) return cf;

	const real = h.get('x-real-ip');
	if (real) return real;

	const xff = h.get('x-forwarded-for')?.split(',')[0]?.trim();
	if (xff) return xff;

	// 헤더 없으면 SvelteKit 어댑터 사용
	try {
		const addr = event.getClientAddress();
		if (addr) return addr;
	} catch {
		// 어댑터에 따라 실패할 수 있음
	}

	return 'unknown';
}

/**
 * 정적 파일 요청인지 확인 (Rate Limit 제외 대상)
 */
function isStaticRequest(pathname: string): boolean {
	const p = pathname.toLowerCase();
	return (
		p.startsWith('/_app/') || // SvelteKit 빌드 출력
		p.startsWith('/favicon') ||
		p === '/robots.txt' ||
		p === '/sitemap.xml'
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
	if (dest === 'document') return true; // security-ignore: sveltekit-browser-globals-server

	// 폴백: navigate 모드 또는 HTML Accept 헤더
	const mode = request.headers.get('sec-fetch-mode');
	const accept = request.headers.get('accept') || '';
	return mode === 'navigate' || accept.includes('text/html');
}

// Map 사이즈 제한 (메모리 보호 최후 안전장치)
const MAX_RATE_LIMIT_ENTRIES = 20000;

/**
 * 오래된 Rate Limit 기록 정리 (메모리 누수 방지)
 */
function maybeSweep(now: number): void {
	sweepTick++;

	// 사이즈가 너무 커지면 즉시 정리
	if (rateLimitMap.size > MAX_RATE_LIMIT_ENTRIES) {
		for (const [key, rec] of rateLimitMap) {
			if (now >= rec.resetTime && (!rec.blocked || now >= rec.blockedUntil)) {
				rateLimitMap.delete(key);
			}
		}
		// 그래도 너무 크면 최후의 안전장치
		if (rateLimitMap.size > MAX_RATE_LIMIT_ENTRIES) rateLimitMap.clear();
		return;
	}

	if (sweepTick % 512 !== 0) return; // 512 요청마다 한 번

	for (const [key, rec] of rateLimitMap) {
		// 차단 해제됐고 윈도우도 만료된 기록 삭제
		if (now >= rec.resetTime && (!rec.blocked || now >= rec.blockedUntil)) {
			rateLimitMap.delete(key);
		}
	}
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

const handleRateLimit: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;

	// 정적 파일은 Rate Limit 제외
	if (isStaticRequest(pathname)) {
		return resolve(event);
	}

	// 문서 네비게이션 요청만 Rate Limit 적용 (내부 fetch, 프리로드 제외)
	if (!isDocumentNavigation(event.request)) {
		return resolve(event);
	}

	const clientIP = getClientIP(event);

	// unknown IP는 Rate Limit 건너뛰기 (모두가 같은 바구니 문제 방지)
	if (clientIP === 'unknown') {
		return resolve(event);
	}

	const now = Date.now();
	const { maxRequests, windowMs, penaltyMs } = policy.rateLimit;

	// 주기적으로 오래된 기록 정리
	maybeSweep(now);

	// 현재 IP의 요청 기록 조회
	let record = rateLimitMap.get(clientIP);

	// 차단 상태 확인
	if (record?.blocked && now < record.blockedUntil) {
		const retryAfter = Math.ceil((record.blockedUntil - now) / 1000);
		return new Response(
			render429Html(retryAfter),
			{
				status: 429,
				headers: {
					'Content-Type': 'text/html; charset=utf-8',
					'Retry-After': String(retryAfter),
					'Cache-Control': 'private, no-store'
				}
			}
		);
	}

	// 차단 해제 또는 새 윈도우 시작
	if (!record || now >= record.resetTime) {
		rateLimitMap.set(clientIP, { count: 1, resetTime: now + windowMs, blocked: false, blockedUntil: 0 });
	} else {
		// 기존 윈도우에서 카운트 증가
		record.count++;

		if (record.count > maxRequests) {
			// Rate Limit 초과 - 페널티 적용
			record.blocked = true;
			record.blockedUntil = now + penaltyMs;
			// 차단이 끝나는 시점에 윈도우도 끝나게 고정 (설정값 변경 시에도 안전)
			record.resetTime = record.blockedUntil;
			// 카운트 리셋으로 차단 해제 후 새 윈도우 시작 보장
			record.count = 0;
			const retryAfter = Math.ceil((record.blockedUntil - now) / 1000);
			return new Response(
				render429Html(retryAfter),
				{
					status: 429,
					headers: {
						'Content-Type': 'text/html; charset=utf-8',
						'Retry-After': String(retryAfter),
						'Cache-Control': 'private, no-store'
					}
				}
			);
		}
	}

	return resolve(event);
};

// 1. 테마/폰트 크기 처리 핸들러
// 쿠키를 확인하여 HTML에 data-theme, data-font-size 속성을 주입하는 역할을 합니다.
const handleThemeAndFont: Handle = async ({ event, resolve }) => {
	const rawTheme = event.cookies.get(THEME_COOKIE);
	const theme = rawTheme === 'light' || rawTheme === 'dark' ? rawTheme : null;
	const fontSize = event.cookies.get(FONT_SIZE_COOKIE); // 기대값: '1' ~ '9'

	// resolve 함수는 페이지 렌더링을 계속 진행시킵니다.
	// transformPageChunk를 이용해 HTML이 브라우저로 전송되기 직전에 수정합니다.
	return resolve(event, {
		transformPageChunk: ({ html }) => {
			// 쿠키에 저장된 테마가 있다면 html 태그의 data-theme 속성을 해당 값으로 교체합니다.
			if (theme) {
				html = html.replace(/data-theme="[^"]*"/, `data-theme="${theme}"`);
			}
			// 폰트 크기 쿠키가 1~9 사이라면 data-font-size 기본값(5)을 교체합니다.
			if (fontSize && /^[1-9]$/.test(fontSize)) {
				html = html.replace(/data-font-size="[^"]*"/, `data-font-size="${fontSize}"`);
			}
			// 테마 쿠키가 없다면 HTML을 수정하지 않고 그대로 둡니다.
			return html;
		}
	});
};

// 2. 다국어 처리 핸들러 (기존 코드 유지)
// 언어 설정에 따라 HTML의 lang 속성을 변경하고 라우팅을 제어합니다.
const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});

// 3. 루트 경로 자동 리다이렉트 (언어 감지)
// Paraglide의 URL 전략이 루트('/')를 기본 언어(en)로 인식하여 preferredLanguage가 무시되는 문제를 해결
// 쿠키가 없는 첫 방문자에게만 적용됨
import { baseLocale, extractLocaleFromHeader, isLocale } from '$lib/paraglide/runtime.js';

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
					headers: { Location: `/${cookie}` }
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
			return new Response(null, {
				status: 302, // 307(임시) 또는 302(Found) 사용. 
				// 검색엔진은 보통 루트의 302/307을 보고 로컬라이즈된 페이지를 인덱싱함.
				headers: { Location: `/${preferredLocale}` }
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

	return response;
};

// 5. 핸들러 병합 및 내보내기
// 순서: 보안 헤더 → Rate Limit → 테마/폰트 → 루트 리다이렉트 → Paraglide
// 보안 헤더가 맨 앞이어야 모든 응답(429 포함)에 헤더가 붙음
export const handle: Handle = sequence(handleSecurityHeaders, handleRateLimit, handleThemeAndFont, handleRootRedirect, handleParaglide);
