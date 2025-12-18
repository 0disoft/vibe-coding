import { THEME_PALETTE_COOKIE } from '$lib/constants';
import { DEFAULT_THEME_PALETTE, isThemePalette, type ThemePalette } from '$lib/shared/utils/theme';

import { createPersistedState } from './persisted-state.svelte';

const store = createPersistedState<ThemePalette>(THEME_PALETTE_COOKIE, DEFAULT_THEME_PALETTE, {
	allowedValues: ['classic', 'linen', 'sage', 'midnight'] as const,
	domUpdater: (v) => {
		if (!document?.documentElement) return;
		document.documentElement.setAttribute('data-theme-palette', v);
	}
});

export const themePalette = {
	get current() {
		return store.current;
	},
	init: store.init,
	set(next: ThemePalette) {
		if (!isThemePalette(next)) return;
		store.set(next);
	}
};
