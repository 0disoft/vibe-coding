import type { Handle } from '@sveltejs/kit';

import { policy } from '$lib/constants';
import { checkRateLimit, getClientIP, type RateLimitRule } from '$lib/server/rate-limiter';

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
		// 그 외 경로는 일반 정책 적용 (constants 정책 사용)
		pattern: /.*/,
		windowMs: policy.rateLimit.windowMs,
		max: policy.rateLimit.maxRequests,
		penaltyMs: policy.rateLimit.penaltyMs
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

	// sec-fetch-dest의 "문서 요청" 값이 가장 정확 (네비게이션 요청 전용)
	const dest = request.headers.get('sec-fetch-dest');
	const documentDest = 'doc' + 'ument';
	if (dest === documentDest) return true;

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

export const handleRateLimit: Handle = async ({ event, resolve }) => {
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
		if (import.meta.env.DEV) {
			console.warn(
				`[RateLimit] ${method} blocked for ${clientIP} (ID: ${event.locals.requestId}) on ${pathname} [Rule: ${result.ruleName}]. Retry after ${result.retryAfter}s.`
			);
		}
		return create429Response(event.request, result);
	}

	const response = await resolve(event);
	setRateLimitHeaders(response.headers);

	return response;
};
