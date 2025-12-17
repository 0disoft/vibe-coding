/**
 * Unique ID generator (Universal)
 *
 * 목표:
 * - SSR에서 요청 단위로 카운터를 분리해 동시성 안전성을 확보합니다.
 * - 클라이언트에서는 모듈 단위 카운터로 충분합니다.
 *
 * 구현:
 * - 서버 훅에서 AsyncLocalStorage 기반 Provider를 등록하면, SSR 렌더링 중 `useId()`가 요청 컨텍스트를 사용합니다.
 * - Provider가 없으면 fallback 카운터를 사용합니다(클라이언트/테스트 환경).
 */

type IdStore = { counter: number };

type IdProvider = {
	get: () => IdStore | undefined;
	run: <T>(fn: () => T) => T;
};

let provider: IdProvider | null = null;
let fallbackCounter = 0;

/**
 * 서버에서만 사용: 요청 컨텍스트 Provider 주입 (서버 훅에서 1회 등록)
 */
export function configureUseIdProvider(next: IdProvider | null) {
	provider = next;
}

export function useId(prefix = 'ds'): string {
	const store = provider?.get();
	if (store) {
		store.counter += 1;
		return `${prefix}-${store.counter}`;
	}

	fallbackCounter += 1;
	return `${prefix}-${fallbackCounter}`;
}

export function runWithIdContext<T>(fn: () => T): T {
	if (provider) return provider.run(fn);
	return fn();
}

export function resetIdCounter(): void {
	fallbackCounter = 0;
	const store = provider?.get();
	if (store) store.counter = 0;
}
