/// <reference lib="webworker" />

export function createShouldHandleRequest(args: {
	origin: string;
	mediaExtensions: RegExp;
}): (request: Request) => boolean {
	return (request) => {
		if (request.method !== 'GET') return false;
		if (!request.url.startsWith('http')) return false;

		// 크롬 예외 케이스 방어: only-if-cached + same-origin 아닌 경우 fetch 예외 발생
		if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') return false;

		// Range 요청은 캐시 로직에 태우지 않음 (비디오 탐색 등 호환성 문제 방지)
		if (request.headers.has('range')) return false;

		const url = new URL(request.url);
		if (url.origin !== args.origin) return false;

		// 미디어 파일은 Range 헤더 처리 문제로 제외
		if (args.mediaExtensions.test(url.pathname)) return false;

		return true;
	};
}

export function createIsAssetRequest(args: {
	assetSet: Set<string>;
	safeBase: string;
	stripBase: (pathname: string) => string;
}): (url: URL) => boolean {
	return (url) => {
		const pathname = url.pathname;
		const noBase = args.stripBase(pathname);

		if (args.assetSet.has(pathname)) return true;
		if (args.assetSet.has(noBase)) return true;

		const appPrefix = args.safeBase ? `${args.safeBase}/_app/` : '/_app/';
		if (pathname.startsWith(appPrefix)) return true;
		if (noBase.startsWith('/_app/')) return true;

		return false;
	};
}
