import type { Handle } from '@sveltejs/kit';

import { baseLocale, extractLocaleFromHeader, isLocale } from '$lib/paraglide/runtime.js';

export const handleRootRedirect: Handle = async ({ event, resolve }) => {
	// 루트 경로이고, 쿼리 파라미터가 없는 경우에만 수행 (보수적 접근)
	// 주의: prerendering 중에는 event.url.search 접근이 금지될 수 있으므로 request.url로 판별합니다.
	const hasQuery = event.request.url.includes('?');
	if (event.url.pathname === '/' && !hasQuery) {
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
