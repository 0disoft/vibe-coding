/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

import { base, build, files, prerendered, version } from '$service-worker';

import { createSwConfig } from './service-worker/config';
import { registerServiceWorker } from './service-worker/register';

// __APP_NAME__은 vite.config.ts의 define에서 site.name으로 주입됨
declare const __APP_NAME__: string;

const sw = self as unknown as ServiceWorkerGlobalScope;

const config = createSwConfig({
	appName: __APP_NAME__,
	base,
	build,
	files,
	prerendered,
	version,
	origin: sw.location.origin
});

registerServiceWorker(sw, config);

// FORCE SW UPDATE: 2025-12-10 23:31

