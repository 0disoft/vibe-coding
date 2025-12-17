import { AsyncLocalStorage } from 'node:async_hooks';

import type { Handle } from '@sveltejs/kit';

import { configureUseIdProvider, runWithIdContext } from '$lib/shared/utils/use-id';

type IdStore = {
	counter: number;
};

const als = new AsyncLocalStorage<IdStore>();

// 서버 프로세스 내에서 1회 등록 (요청 단위 store는 runWithIdContext로 설정)
configureUseIdProvider({
	get: () => als.getStore(),
	run: (fn) => als.run({ counter: 0 }, fn)
});

export const handleIdContext: Handle = async ({ event, resolve }) =>
	runWithIdContext(() => resolve(event));
