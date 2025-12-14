/// <reference lib="webworker" />

export interface SwConfig {
  base: string;
  safeBase: string;
  origin: string;
  offlinePath: string;
  cachePrefix: string;
  cacheName: string;
  assets: string[];
  assetSet: Set<string>;
  mediaExtensions: RegExp;
}

function sanitizeAppName(appName: string): string {
  const safe =
    appName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'app';
  return safe;
}

export function createSwConfig(args: {
  appName: string;
  base: string;
  build: string[];
  files: string[];
  prerendered: string[];
  version: string;
  origin: string;
}): SwConfig {
  const mediaExtensions = /\.(mp4|webm|ogg|mov|mp3|wav|m4a)$/i;

  const safeAppName = sanitizeAppName(args.appName);
  const cachePrefix = `${safeAppName}-sw-`;
  const cacheName = `${cachePrefix}${args.version}`;

  const safeBase = args.base && args.base !== '/' ? args.base : '';
  const offlinePath = `${safeBase}/offline`;

  const staticFiles = args.files.filter((path) => !mediaExtensions.test(path));
  const assets = Array.from(
    new Set([
      ...args.build, // SvelteKit 빌드 결과물 (JS, CSS)
      ...staticFiles, // 미디어 제외된 정적 파일
      ...args.prerendered // 프리렌더링된 HTML 페이지 (offline 포함)
    ])
  );

  const assetSet = new Set(
    [...args.build, ...staticFiles].map((path) => {
      if (path.startsWith('/')) return path;
      try {
        return new URL(path, args.origin).pathname;
      } catch {
        return path;
      }
    })
  );

  return {
    base: args.base,
    safeBase,
    origin: args.origin,
    offlinePath,
    cachePrefix,
    cacheName,
    assets,
    assetSet,
    mediaExtensions
  };
}

