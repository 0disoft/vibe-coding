import type { Handle } from '@sveltejs/kit';

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

export const handleSecurityHeaders: Handle = async ({ event, resolve }) => {
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
