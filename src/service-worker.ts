/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

import { base, build, files, prerendered, version } from '$service-worker';

// ─────────────────────────────────────────────────────────────────────────────
// 상수 정의
// ─────────────────────────────────────────────────────────────────────────────

/** 캐시 이름 (빌드 버전 포함) */
const CACHE = `cache-${version}`;

/** Range 요청이 필요한 미디어 파일 확장자 */
const MEDIA_EXTENSIONS = /\.(mp4|webm|ogg|mov|mp3|wav|m4a)$/i;

/** 오프라인 폴백 경로 (base path 지원) */
const OFFLINE_PATH = `${base}/offline`;

/** 캐싱 대상 자산 목록 (미디어 파일 제외) */
const ASSETS = [
	...build, // SvelteKit 빌드 결과물 (JS, CSS)
	...files.filter((path) => !MEDIA_EXTENSIONS.test(path)), // 미디어 제외
	...prerendered // 프리렌더링된 HTML 페이지 (offline 포함)
];

/** 빌드 자산 Set (빠른 조회용) */
const ASSET_SET = new Set([...build, ...files.filter((path) => !MEDIA_EXTENSIONS.test(path))]);

/** ServiceWorkerGlobalScope 타입 캐스팅 */
const sw = self as unknown as ServiceWorkerGlobalScope;

// ─────────────────────────────────────────────────────────────────────────────
// 헬퍼 함수
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 서비스 워커가 처리해야 할 요청인지 판별
 * - GET 요청만 처리
 * - http/https 스키마만 처리 (chrome-extension 등 제외)
 * - 동일 origin만 처리 (외부 리소스 제외)
 * - 미디어 파일은 Range 요청 문제로 제외 (Safari 비디오 탐색 호환성)
 */
function shouldHandleRequest(request: Request): boolean {
	if (request.method !== 'GET') return false;
	if (!request.url.startsWith('http')) return false;

	const url = new URL(request.url);
	if (url.origin !== sw.location.origin) return false;

	// 미디어 파일은 Range 헤더 처리 문제로 제외
	if (MEDIA_EXTENSIONS.test(url.pathname)) return false;

	return true;
}

/**
 * 캐시 우선 전략 (Cache First)
 * - 캐시에 있으면 캐시 반환
 * - 없으면 네트워크 요청
 */
async function cacheFirst(request: Request): Promise<Response> {
	const cachedResponse = await caches.match(request);
	return cachedResponse || fetch(request);
}

/**
 * 네트워크 우선 전략 (Network First)
 * - 네트워크 요청 시도
 * - 실패 시 캐시 반환
 * - 네비게이션 요청 성공 시 캐시에 저장
 */
async function networkFirst(request: Request): Promise<Response> {
	const isNavigation = request.mode === 'navigate';

	try {
		const response = await fetch(request);

		// HTML 페이지 응답만 캐시에 저장 (API 응답, 에러 페이지 제외)
		// 보안 강화: Cache-Control: no-store가 설정된 응답은 캐시하지 않음
		const isHtml = response.headers.get('content-type')?.includes('text/html');
		const cacheControl = response.headers.get('cache-control') || '';
		const isNoStore = cacheControl.includes('no-store');

		if (isNavigation && response.ok && isHtml && !isNoStore) {
			const cache = await caches.open(CACHE);
			await cache.put(request, response.clone());
		}

		return response;
	} catch {
		// 오프라인: 캐시된 데이터 반환 시도
		const cachedResponse = await caches.match(request);
		if (cachedResponse) return cachedResponse;

		// 네비게이션 요청이면 오프라인 폴백 페이지 반환
		if (isNavigation) {
			return getOfflineFallback();
		}

		// 네비게이션이 아닌 요청은 503 응답
		return new Response('Offline', { status: 503 });
	}
}

/**
 * 오프라인 폴백 페이지 반환
 * - 캐시된 오프라인 페이지가 있으면 반환
 * - 없으면 최소한의 HTML 응답 (완전한 무응답 방지)
 */
async function getOfflineFallback(): Promise<Response> {
	const cached = await caches.match(OFFLINE_PATH);
	if (cached) return cached;

	// 최후의 안전망: 캐시된 오프라인 페이지가 없을 경우
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

/**
 * 요청 URL이 빌드 자산인지 확인
 * - Set을 사용한 O(1) 조회
 * - /_app/ 경로는 무조건 자산 취급 (해시 변경 대응)
 */
function isAssetRequest(url: URL): boolean {
	const pathname = url.pathname;

	// Set에서 정확히 일치하는지 확인
	if (ASSET_SET.has(pathname)) return true;

	// /_app/ 하위는 모두 빌드 자산으로 취급 (immutable assets)
	if (pathname.startsWith('/_app/')) return true;

	return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// 이벤트 핸들러
// ─────────────────────────────────────────────────────────────────────────────

// 1. 설치 (Install) - 자산 미리 캐싱
sw.addEventListener('install', (event) => {
	async function addFilesToCache() {
		const cache = await caches.open(CACHE);
		await cache.addAll(ASSETS);
	}

	sw.skipWaiting(); // 대기 없이 즉시 활성화
	event.waitUntil(addFilesToCache());
});

// 2. 활성화 (Activate) - 이전 캐시 정리
sw.addEventListener('activate', (event) => {
	async function deleteOldCaches() {
		const keys = await caches.keys();
		await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)));
	}

	event.waitUntil(Promise.all([deleteOldCaches(), sw.clients.claim()]));
});

// 3. 요청 가로채기 (Fetch)
sw.addEventListener('fetch', (event) => {
	if (!shouldHandleRequest(event.request)) return;

	const url = new URL(event.request.url);

	// 빌드 자산: 캐시 우선 전략
	if (isAssetRequest(url)) {
		event.respondWith(cacheFirst(event.request));
		return;
	}

	// 그 외: 네트워크 우선 전략
	event.respondWith(networkFirst(event.request));
});

// FORCE SW UPDATE: 2025-12-10 23:31
