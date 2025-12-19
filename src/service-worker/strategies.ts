/// <reference lib="webworker" />

import type { CacheMatchKind } from './cache';

export function createStrategies(args: {
	cacheName: string;
	offlinePath: string;
	matchFromMyCache: (
		request: Request | string,
		kind: CacheMatchKind
	) => Promise<Response | undefined>;
}): {
	cacheFirst: (request: Request) => Promise<Response>;
	networkFirst: (request: Request) => Promise<Response>;
} {
	async function getOfflineFallback(): Promise<Response> {
		const cached = await args.matchFromMyCache(args.offlinePath, 'navigation');
		if (cached) return cached;

		return new Response(
			`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #1a1a2e; color: #eee; }
    .container { text-align: center; padding: 2rem; }
    h1 { font-size: 1.5rem; margin-bottom: 1rem; }
    p { color: #aaa; }
  </style>
</head>
<body>
  <div class="container">
    <h1>You are offline</h1>
    <p>Please check your internet connection and try again.</p>
  </div>
</body>
</html>`,
			{
				status: 503,
				headers: { 'Content-Type': 'text/html; charset=utf-8' }
			}
		);
	}

	async function cacheFirst(request: Request): Promise<Response> {
		const cachedResponse = await args.matchFromMyCache(request, 'asset');
		if (cachedResponse) return cachedResponse;

		try {
			const res = await fetch(request);

			const cacheControl = res.headers.get('cache-control')?.toLowerCase() || '';
			const noStore = cacheControl.includes('no-store');

			if (res.ok && !noStore) {
				const cache = await caches.open(args.cacheName);
				await cache.put(request, res.clone());
			}

			return res;
		} catch {
			return new Response('Offline', {
				status: 503,
				headers: { 'Content-Type': 'text/plain; charset=utf-8' }
			});
		}
	}

	async function networkFirst(request: Request): Promise<Response> {
		const isNavigation = request.mode === 'navigate';

		try {
			const response = await fetch(request);

			// NOTE:
			// Navigation(HTML) 응답은 캐시하지 않습니다.
			// - 언어/로그인/AB 등 쿠키 기반 변형이 있는 앱에서, SW가 URL만으로 HTML을 캐싱하면
			//   F5(일반 새로고침) 시 이전 언어의 문서가 재사용되는 문제가 발생할 수 있습니다.
			// - 오프라인 UX는 offlinePath(프리캐시)로 커버합니다.

			return response;
		} catch {
			const cachedResponse = await args.matchFromMyCache(
				request,
				isNavigation ? 'navigation' : 'other'
			);
			if (cachedResponse) return cachedResponse;

			if (isNavigation) {
				return getOfflineFallback();
			}

			return new Response('Offline', {
				status: 503,
				headers: { 'Content-Type': 'text/plain; charset=utf-8' }
			});
		}
	}

	return { cacheFirst, networkFirst };
}
