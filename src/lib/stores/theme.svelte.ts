// 사용법
// 1) 루트 레이아웃의 클라이언트 진입 지점에서 단 한 번 theme.init()을 호출한다.
// 2) UI에서는 theme.set('light' | 'dark' | 'system')만 사용한다.
// 3) theme.current를 직접 바꾸지 말고 항상 set, toggle을 거친다.

import { THEME_COOKIE } from '$lib/constants';
import {
	DEFAULT_THEME_MODE,
	isThemeMode,
	resolveThemeFromMode,
	type ThemeMode
} from '$lib/shared/utils/theme';
import { createPersistedState } from './persisted-state.svelte';

type Theme = ThemeMode;

function applyThemeModeToDom(mode: ThemeMode): void {
	const root = document?.documentElement;
	if (!root) return;

	root.setAttribute('data-theme-mode', mode);

	const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false;
	const resolved = resolveThemeFromMode(mode, prefersDark);
	root.setAttribute('data-theme', resolved);
}

let mq: MediaQueryList | null = null;
let onMqChange: ((e: MediaQueryListEvent) => void) | null = null;

function detachSystemListener(): void {
	if (!mq || !onMqChange) return;
	if (mq.removeEventListener) mq.removeEventListener('change', onMqChange);
	else
		(
			mq as unknown as { removeListener: (fn: (e: MediaQueryListEvent) => void) => void }
		).removeListener(onMqChange);
	mq = null;
	onMqChange = null;
}

function attachSystemListener(): void {
	detachSystemListener();
	mq = window.matchMedia?.('(prefers-color-scheme: dark)') ?? null;
	if (!mq) return;
	onMqChange = () => {
		const mode = store.current;
		if (mode !== 'system') return;
		applyThemeModeToDom(mode);
	};
	if (mq.addEventListener) mq.addEventListener('change', onMqChange);
	else
		(mq as unknown as { addListener: (fn: (e: MediaQueryListEvent) => void) => void }).addListener(
			onMqChange
		);
}

const store = createPersistedState<Theme>(THEME_COOKIE, DEFAULT_THEME_MODE, {
	allowedValues: ['light', 'dark', 'system'],
	domAttrKey: 'data-theme-mode',
	domUpdater: (v) => {
		if (!document?.documentElement) return;
		const mode = isThemeMode(v) ? v : DEFAULT_THEME_MODE;
		applyThemeModeToDom(mode);

		if (mode === 'system') attachSystemListener();
		else detachSystemListener();
	}
});

export const theme = {
	get current() {
		return store.current;
	},
	init: store.init,
	set(next: ThemeMode) {
		if (!isThemeMode(next)) return;
		store.set(next);
	},
	toggle() {
		// system 모드에서는 명시 모드로 전환하도록 단순화
		if (store.current === 'system') {
			store.set('dark');
			return;
		}
		store.set(store.current === 'light' ? 'dark' : 'light');
	}
};
