import { browser } from '$app/environment';

export type FontSize = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

function createFontSize() {
  let current = $state<FontSize>(5);

  const isValid = (num: number): num is FontSize => num >= 1 && num <= 9;

  function setCookie(name: string, value: string, days: number) {
    if (!browser) return;
    let expires = '';
    if (days) {
      const date = new Date(); // eslint-disable-line svelte/prefer-svelte-reactivity -- 단순 유틸 계산용
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = '; expires=' + date.toUTCString();
    }
    const secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = name + '=' + value + expires + '; path=/; SameSite=Lax' + secure;
  }

  function readCookie(): FontSize | null {
    if (!browser) return null;
    const found = document.cookie
      .split(';')
      .map((item) => item.trim())
      .find((item) => item.startsWith('fontSize='));
    if (!found) return null;
    const num = Number(found.split('=')[1]);
    return isValid(num) ? (num as FontSize) : null;
  }

  function setDom(value: FontSize) {
    if (!browser) return;
    document.documentElement.setAttribute('data-font-size', String(value));
    setCookie('fontSize', String(value), 365);
  }

  function init() {
    if (!browser) return;

    const attr = document.documentElement.getAttribute('data-font-size');
    const attrNum = attr ? Number(attr) : NaN;

    if (isValid(attrNum)) {
      current = attrNum as FontSize;
      return;
    }

    const fromCookie = readCookie();
    if (fromCookie) {
      current = fromCookie;
      setDom(fromCookie);
      return;
    }

    current = 5;
    setDom(5);
  }

  function set(value: FontSize) {
    if (!isValid(value)) return;
    current = value;
    setDom(value);
  }

  return {
    get current() {
      return current;
    },
    init,
    set,
  };
}

export const fontSize = createFontSize();
