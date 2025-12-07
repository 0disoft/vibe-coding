/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

import { build, files, prerendered, version } from '$service-worker';

// 캐시 이름 정의 (빌드 버전 포함)
const CACHE = `cache-${version}`;

const ASSETS = [
  ...build, // SvelteKit 빌드 결과물 (JS, CSS)
  ...files, // static 폴더 내 정적 파일
  ...prerendered // 프리렌더링된 HTML 페이지 (offline 포함)
];

// self를 ServiceWorkerGlobalScope로 캐스팅
const sw = self as unknown as ServiceWorkerGlobalScope;

// 1. 설치 (Install)
sw.addEventListener('install', (event) => {
  // 새로운 서비스 워커 설치 시 자산 미리 캐싱
  async function addFilesToCache() {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
  }

  // 대기 상태 없이 즉시 새 서비스 워커를 활성화 (빠른 업데이트)
  sw.skipWaiting();
  event.waitUntil(addFilesToCache());
});

// 2. 활성화 (Activate)
sw.addEventListener('activate', (event) => {
  // 활성화 시 이전 버전 캐시 삭제
  async function deleteOldCaches() {
    const keys = await caches.keys();
    for (const key of keys) {
      if (key !== CACHE) await caches.delete(key);
    }
  }

  // 현재 열려있는 모든 탭의 제어권을 즉시 가져옴
  event.waitUntil(Promise.all([deleteOldCaches(), sw.clients.claim()]));
});

// 3. 요청 가로채기 (Fetch)
sw.addEventListener('fetch', (event) => {
  // GET 요청이 아니거나, http/https 스키마가 아니면 무시 (chrome-extension 등 제외)
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) return;

  const url = new URL(event.request.url);

  // 동일 origin이 아닌 요청은 건드리지 않는다 (외부 리소스 캐싱 방지)
  if (url.origin !== sw.location.origin) return;

  // 캐시 우선 전략 (Cache First) - 빌드 자산인 경우
  if (ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((cacheRes) => {
        return cacheRes || fetch(event.request);
      })
    );
    return;
  }

  // 네트워크 우선 전략 (Network First) - 그 외 HTML 등
  event.respondWith(
    (async () => {
      const isNavigation = event.request.mode === 'navigate';

      try {
        const response = await fetch(event.request);

        // 페이지 이동(HTML) 요청이고 정상 응답이면 캐시에 저장
        if (isNavigation && response.status === 200) {
          const cache = await caches.open(CACHE);
          cache.put(event.request, response.clone());
        }
        return response;
      } catch {
        // 오프라인 상태라면 캐시된 데이터라도 반환
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) return cachedResponse;

        // 오프라인이고 캐시도 없는데 페이지 이동 요청인 경우, 오프라인 전용 페이지 반환
        if (isNavigation) {
          // /offline 라우트 (prerendered) 반환
          const offlineFallback = await caches.match('/offline');
          if (offlineFallback) return offlineFallback;
        }

        throw new Error('Offline and no cache available');
      }
    })()
  );
});
// FORCE SW UPDATE: 2025-12-07 06:45
