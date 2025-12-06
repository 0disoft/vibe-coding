import { browser } from '$app/environment';

// Note: 이 파일은 Svelte runes($state)을 사용하므로 .svelte.ts 확장자를 유지하세요.

/**
 * 쿠키와 DOM data-* 속성에 동기화되는 영속 스토어를 생성합니다.
 *
 * @param key 쿠키/DOM 속성 이름 (예: 'theme', 'fontSize')
 * @param initial 기본값
 * @param allowedValues 허용되는 값 목록. 지정하면 유효성 검증에 사용됨.
 * @param domUpdater DOM 업데이트 커스터마이저 (기본: html data-{key} 속성 설정)
 */
export function createPersistedState<T extends string | number>(
  key: string,
  initial: T,
  allowedValues?: readonly T[],
  domUpdater?: (value: T) => void,
) {
  let current = $state<T>(initial);

  const isValid = (val: unknown): val is T =>
    allowedValues ? (allowedValues as readonly unknown[]).includes(val) : true;

  const attrKey = `data-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;

  function setCookie(value: T, days = 365) {
    if (!browser) return;
    let expires = '';
    if (days) {
      const date = new Date(); // eslint-disable-line svelte/prefer-svelte-reactivity -- 단순 쿠키 만료 계산용
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = '; expires=' + date.toUTCString();
    }
    const secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${key}=${value}${expires}; path=/; SameSite=Lax${secure}`;
  }

  function updateDom(value: T) {
    if (!browser) return;
    if (domUpdater) {
      domUpdater(value);
    } else {
      document.documentElement.setAttribute(attrKey, String(value));
    }
    setCookie(value);
  }

  function init() {
    if (!browser) return;

    // 1) SSR이 심어둔 data-* 우선
    const attr = document.documentElement.getAttribute(attrKey);
    const parsedAttr =
      typeof initial === 'number' && attr !== null ? Number(attr) : attr;
    if (isValid(parsedAttr)) {
      current = parsedAttr as T;
      return;
    }

    // 2) 쿠키 fallback
    const found = document.cookie
      .split(';')
      .map((item) => item.trim())
      .find((item) => item.startsWith(`${key}=`));

    if (found) {
      const raw = found.split('=')[1];
      const parsed =
        typeof initial === 'number' ? Number(raw) : (raw as unknown);
      if (isValid(parsed)) {
        current = parsed as T;
        updateDom(current); // DOM에 값이 없었으면 동기화
        return;
      }
    }

    // 3) 기본값
    current = initial;
    updateDom(initial);
  }

  function set(value: T) {
    if (!isValid(value)) return;
    current = value;
    updateDom(value);
  }

  return {
    get current() {
      return current;
    },
    init,
    set,
  };
}
