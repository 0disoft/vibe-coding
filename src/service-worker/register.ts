/// <reference lib="webworker" />

import { createMatchFromMyCache } from './cache';
import type { SwConfig } from './config';
import { createBasePathHelpers } from './path';
import { createIsAssetRequest, createShouldHandleRequest } from './predicates';
import { createStrategies } from './strategies';

export function registerServiceWorker(sw: ServiceWorkerGlobalScope, config: SwConfig): void {
	const { stripBase, addBase } = createBasePathHelpers(config.base);

	const matchFromMyCache = createMatchFromMyCache({
		cacheName: config.cacheName,
		origin: config.origin,
		stripBase,
		addBase
	});

	const { cacheFirst, networkFirst } = createStrategies({
		cacheName: config.cacheName,
		offlinePath: config.offlinePath,
		matchFromMyCache
	});

	const shouldHandleRequest = createShouldHandleRequest({
		origin: config.origin,
		mediaExtensions: config.mediaExtensions
	});

	const isAssetRequest = createIsAssetRequest({
		assetSet: config.assetSet,
		safeBase: config.safeBase,
		stripBase
	});

	sw.addEventListener('install', (event) => {
		async function addFilesToCache() {
			const cache = await caches.open(config.cacheName);
			await cache.addAll(config.assets);
		}

		sw.skipWaiting();
		event.waitUntil(addFilesToCache());
	});

	sw.addEventListener('activate', (event) => {
		async function deleteOldCaches() {
			const keys = await caches.keys();
			await Promise.all(
				keys
					.filter((key) => key.startsWith(config.cachePrefix) && key !== config.cacheName)
					.map((key) => caches.delete(key))
			);
		}

		event.waitUntil(Promise.all([deleteOldCaches(), sw.clients.claim()]));
	});

	sw.addEventListener('fetch', (event) => {
		if (!shouldHandleRequest(event.request)) return;

		const url = new URL(event.request.url);

		if (isAssetRequest(url)) {
			event.respondWith(cacheFirst(event.request));
			return;
		}

		event.respondWith(networkFirst(event.request));
	});
}
