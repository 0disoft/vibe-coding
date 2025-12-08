// 사용법
// 1) 루트 레이아웃의 클라이언트 진입 지점에서 단 한 번 theme.init()을 호출한다.
// 2) 테마 토글 버튼에서는 theme.toggle() 또는 theme.set('light' | 'dark')만 사용한다.
// 3) theme.current를 직접 바꾸지 말고 항상 set, toggle을 거친다.

import { THEME_COOKIE } from '$lib/constants';
import { createPersistedState } from './persisted-state.svelte';

type Theme = 'light' | 'dark';

const store = createPersistedState<Theme>(
  THEME_COOKIE,
  'light',
  ['light', 'dark'],
  (v) => {
    if (!document?.documentElement) return;
    document.documentElement.setAttribute('data-theme', v);
  },
);

export const theme = {
  get current() {
    return store.current;
  },
  init: store.init,
  set: store.set,
  toggle() {
    store.set(store.current === 'light' ? 'dark' : 'light');
  },
};
