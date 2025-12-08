import { FONT_SIZE_COOKIE } from '$lib/constants';
import { createPersistedState } from './persisted-state.svelte';

export type FontSize = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

const store = createPersistedState<FontSize>(FONT_SIZE_COOKIE, 5, [1, 2, 3, 4, 5, 6, 7, 8, 9] as const, (v) => {
  if (!document?.documentElement) return;
  document.documentElement.setAttribute('data-font-size', String(v));
});

export const fontSize = {
  get current() {
    return store.current;
  },
  init: store.init,
  set: store.set,
};
