/// <reference lib="webworker" />

export type CacheMatchKind = 'navigation' | 'asset' | 'other';

export function createMatchFromMyCache(args: {
	cacheName: string;
	origin: string;
	stripBase: (pathname: string) => string;
	addBase: (pathname: string) => string;
}): (request: Request | string, kind: CacheMatchKind) => Promise<Response | undefined> {
	return async (request, kind) => {
		const cache = await caches.open(args.cacheName);

		const matchOptions =
			kind === 'navigation'
				? undefined
				: kind === 'asset'
					? { ignoreVary: true, ignoreSearch: true }
					: { ignoreVary: true };

		const first = await cache.match(request, matchOptions);
		if (first) return first;

		const url = typeof request === 'string' ? new URL(request, args.origin) : new URL(request.url);
		const pathname = url.pathname;
		const noBase = args.stripBase(pathname);
		const withBase = args.addBase(pathname);

		async function matchPath(p: string): Promise<Response | undefined> {
			if (p === pathname) return undefined;
			const u = new URL(url.toString());
			u.pathname = p;
			const matched = await cache.match(u.toString(), matchOptions);
			return matched || undefined;
		}

		return (await matchPath(noBase)) ?? (await matchPath(withBase));
	};
}
