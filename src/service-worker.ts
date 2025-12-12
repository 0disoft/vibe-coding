/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

import { base, build, files, prerendered, version } from '$service-worker';

// ─────────────────────────────────────────────────────────────────────────────
// 상수 정의
// ─────────────────────────────────────────────────────────────────────────────

/** 캐시 이름 prefix (다른 앱/런타임 캐시와 충돌 방지) */
// __APP_NAME__은 vite.config.ts의 define에서 site.name으로 주입됨
declare const __APP_NAME__: string;
// 특수문자 정제: 공백/슬래시 등이 섞여도 안전한 캐시 키 생성
// 한글 등 비라틴 문자만 있으면 'app'으로 폴백
const SAFE_APP_NAME =
	__APP_NAME__
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '') || 'app';
const CACHE_PREFIX = `${SAFE_APP_NAME}-sw-`;

/** 캐시 이름 (빌드 버전 포함) */
const CACHE = `${CACHE_PREFIX}${version}`;

/** Range 요청이 필요한 미디어 파일 확장자 */
const MEDIA_EXTENSIONS = /\.(mp4|webm|ogg|mov|mp3|wav|m4a)$/i;

/** 오프라인 폴백 경로 (base path 지원, base === '/' 방어) */
const SAFE_BASE = base && base !== '/' ? base : '';
const OFFLINE_PATH = `${SAFE_BASE}/offline`;

/** 정적 파일 목록 (미디어 파일 제외) - 중복 필터링 방지 */
const STATIC_FILES = files.filter((path) => !MEDIA_EXTENSIONS.test(path));

/** 캐싱 대상 자산 목록 (미디어 파일 제외, 중복 제거) */
const ASSETS = Array.from(new Set([
	...build, // SvelteKit 빌드 결과물 (JS, CSS)
	...STATIC_FILES, // 미디어 제외된 정적 파일
	...prerendered // 프리렌더링된 HTML 페이지 (offline 포함)
]));

/** ServiceWorkerGlobalScope 타입 캐스팅 */
const sw = self as unknown as ServiceWorkerGlobalScope;

/**
 * 빌드 자산 Set (빠른 조회용)
 * pathname으로 정규화하여 환경별 형태 차이를 무력화
 */
const ASSET_SET = new Set(
	[...build, ...STATIC_FILES].map((path) => {
		// 이미 pathname 형태면 그대로, URL 형태면 pathname만 추출
		if (path.startsWith('/')) return path;
		try {
			return new URL(path, sw.location.origin).pathname;
		} catch {
			return path;
		}
	})
);

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

	// 크롬 예외 케이스 방어: only-if-cached + same-origin 아닌 경우 fetch 예외 발생
	if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') return false;

	// Range 요청은 캐시 로직에 태우지 않음 (비디오 탐색 등 호환성 문제 방지)
	if (request.headers.has('range')) return false;

	const url = new URL(request.url);
	if (url.origin !== sw.location.origin) return false;

	// 미디어 파일은 Range 헤더 처리 문제로 제외
	if (MEDIA_EXTENSIONS.test(url.pathname)) return false;

	return true;
}

/**
 * base path를 제거한 경로 반환
 * - 프리캐시와 실제 요청 경로의 base 차이 방어
 */
function stripBase(pathname: string): string {
	if (!base || base === '/') return pathname;
	const prefix = `${base}/`;
	if (pathname.startsWith(prefix)) return pathname.slice(base.length);
	if (pathname === base) return '/';
	return pathname;
}

/**
 * base path를 추가한 경로 반환
 * - 캐시에 base 포함 경로로 저장됐는데 요청이 base 없이 들어오는 경우 방어
 */
function addBase(pathname: string): string {
	if (!base || base === '/') return pathname;
	if (pathname === '/') return base;
	if (pathname === base) return pathname;
	if (pathname.startsWith(`${base}/`)) return pathname;
	if (!pathname.startsWith('/')) pathname = `/${pathname}`;
	return `${base}${pathname}`;
}

/** 캐시 매칭 요청 종류 */
type CacheMatchKind = 'navigation' | 'asset' | 'other';

/**
 * 현재 앱의 캐시에서만 매칭 (전역 캐시 오염 방지)
 * - caches.match()는 오리진의 모든 캐시를 뒤지므로
 * - 다른 앱/런타임 캐시와 충돌할 수 있음
 * - base 포함/제거 경로 모두 매칭 시도
 *
 * @param request 요청 객체 또는 URL 문자열
 * @param kind 요청 종류 (navigation: Vary 존중, asset: 쿼리스트링 무시, other: Vary만 무시)
 */
async function matchFromMyCache(
	request: Request | string,
	kind: CacheMatchKind
): Promise<Response | undefined> {
	const cache = await caches.open(CACHE);

	// 요청 종류별 캐시 매칭 옵션
	// - navigation: Vary 규칙 존중 (인증 페이지 등 캐시 분리)
	// - asset: ignoreVary + ignoreSearch (쿼리스트링 붙은 자산 구제)
	// - other: ignoreVary만 (API 캐싱 도입 시 쿼리 섞임 방지)
	const matchOptions =
		kind === 'navigation'
			? undefined
			: kind === 'asset'
				? { ignoreVary: true, ignoreSearch: true }
				: { ignoreVary: true };

	// 1. 원본 요청으로 매칭 시도
	const first = await cache.match(request, matchOptions);
	if (first) return first;

	// 2. pathname 변환으로 추가 매칭 시도 (base 미스매치 방어)
	const url = typeof request === 'string'
		? new URL(request, sw.location.origin)
		: new URL(request.url);

	const pathname = url.pathname;
	const noBase = stripBase(pathname);
	const withBase = addBase(pathname);

	// pathname만 바꾼 URL로 매칭 시도
	async function matchPath(p: string): Promise<Response | undefined> {
		if (p === pathname) return undefined;
		const u = new URL(url.toString());
		u.pathname = p;
		const matched = await cache.match(u.toString(), matchOptions);
		return matched || undefined;
	}

	return (await matchPath(noBase)) ?? (await matchPath(withBase));
}

/**
 * 캐시 우선 전략 (Cache First)
 * - 캐시에 있으면 캐시 반환
 * - 없으면 네트워크 요청
 * - 오프라인 + 캐시 미스 시 503 반환 (에러 방지)
 */
async function cacheFirst(request: Request): Promise<Response> {
	const cachedResponse = await matchFromMyCache(request, 'asset');
	if (cachedResponse) return cachedResponse;

	try {
		return await fetch(request);
	} catch {
		// 오프라인 + 캐시 미스: 안전한 503 응답
		return new Response('Offline', {
			status: 503,
			headers: { 'Content-Type': 'text/plain; charset=utf-8' }
		});
	}
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
		// 캐시 금지 조건:
		// - no-store: 저장 자체 금지
		// - private: 인증된 사용자 전용 콘텐츠
		// - no-cache/must-revalidate: 재검증 필수 (SW가 저장하면 오래된 콘텐츠 위험)
		const contentType = response.headers.get('content-type')?.toLowerCase() || '';
		const isHtml = contentType.includes('text/html');
		const cacheControl = response.headers.get('cache-control')?.toLowerCase() || '';
		const shouldSkipCache =
			cacheControl.includes('no-store') ||
			cacheControl.includes('private') ||
			cacheControl.includes('no-cache') ||
			cacheControl.includes('must-revalidate');

		if (isNavigation && response.ok && isHtml && !shouldSkipCache) {
			const cache = await caches.open(CACHE);
			await cache.put(request, response.clone());
		}

		return response;
	} catch {
		// 오프라인: 현재 앱 캐시에서 데이터 반환 시도
		const cachedResponse = await matchFromMyCache(request, isNavigation ? 'navigation' : 'other');
		if (cachedResponse) return cachedResponse;

		// 네비게이션 요청이면 오프라인 폴백 페이지 반환
		if (isNavigation) {
			return getOfflineFallback();
		}

		// 네비게이션이 아닌 요청은 503 응답
		return new Response('Offline', {
			status: 503,
			headers: { 'Content-Type': 'text/plain; charset=utf-8' }
		});
	}
}

/**
 * 오프라인 폴백 페이지 반환
 * - 캐시된 오프라인 페이지가 있으면 반환
 * - 없으면 최소한의 HTML 응답 (완전한 무응답 방지)
 */
async function getOfflineFallback(): Promise<Response> {
	// matchFromMyCache가 base 포함/제거 경로 모두 시도함
	const cached = await matchFromMyCache(OFFLINE_PATH, 'navigation');
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
	const noBase = stripBase(pathname);

	// Set에서 정확히 일치하는지 확인 (base 포함/제거 모두)
	if (ASSET_SET.has(pathname)) return true;
	if (ASSET_SET.has(noBase)) return true;

	// /_app/ 하위는 모두 빌드 자산으로 취급 (immutable assets)
	// base 경로 지원: base가 /foo인 경우 /foo/_app/로 판정 (base === '/' 방어)
	const appPrefix = SAFE_BASE ? `${SAFE_BASE}/_app/` : '/_app/';
	if (pathname.startsWith(appPrefix)) return true;
	// base 없이 /_app/로 들어오는 경우도 방어
	if (noBase.startsWith('/_app/')) return true;

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

// 2. 활성화 (Activate) - 이전 캐시 정리 (내 캐시만)
sw.addEventListener('activate', (event) => {
	async function deleteOldCaches() {
		const keys = await caches.keys();
		// prefix로 필터하여 내 앱의 캐시만 정리 (다른 앱/런타임 캐시 보호)
		await Promise.all(
			keys
				.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE)
				.map((key) => caches.delete(key))
		);
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
