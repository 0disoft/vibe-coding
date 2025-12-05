import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

function createTheme() {
  let current = $state<Theme>('light');

  // 쿠키 설정 헬퍼 함수
  function setCookie(name: string, value: string, days: number) {
    if (!browser) return;
    let expires = '';
    if (days) {
      // eslint-disable-next-line svelte/prefer-svelte-reactivity
      const date = new Date(); // ESLint 경고 방지: 이 Date 객체는 반응성 상태가 아닌 단순 유틸리티 용도임
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = '; expires=' + date.toUTCString();
    }
    // path=/ 는 사이트 전체에서 쿠키가 유효하도록 함
    document.cookie = name + '=' + (value || '') + expires + '; path=/; SameSite=Lax';
  }

  // 쿠키에서 테마 값을 읽어오는 헬퍼 함수
  function getCookie(name: string): string | null {
    if (!browser) return null;
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  function init() {
    if (!browser) return;

    // 1. 서버가 HTML에 심어둔 data-theme 속성 값 확인
    // 이 값이 있으면 SSR 시점에 이미 테마가 적용된 것이므로 깜빡임이 없습니다.
    const serverAttr = document.documentElement.getAttribute('data-theme') as Theme | null;

    if (serverAttr) {
      // 서버에서 성공적으로 테마를 적용했다면, 그 값을 현재 상태로 동기화만 하고
      // DOM 조작은 건너뛰어 미세한 깜빡임을 방지합니다.
      current = serverAttr;
      return;
    }

    // 2. 서버가 data-theme을 못 찾은 경우 (쿠키가 없는 첫 방문 등)
    const storedCookie = getCookie('theme') as Theme | null;

    let initialTheme: Theme;

    if (storedCookie) {
      initialTheme = storedCookie;
    } else {
      // 3. 쿠키도 없으면 시스템 설정 확인 (다크 모드 선호 여부)
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      initialTheme = prefersDark ? 'dark' : 'light';
    }

    // 4. 상태 및 DOM에 적용 (서버 처리 실패 시 fallback)
    current = initialTheme;
    document.documentElement.setAttribute('data-theme', current);
    setCookie('theme', current, 365);
  }

  function set(value: Theme) {
    current = value;
    if (browser) {
      // 테마 변경 버튼을 눌렀을 때만 DOM과 쿠키를 업데이트합니다.
      document.documentElement.setAttribute('data-theme', value);
      setCookie('theme', value, 365);
    }
  }

  function toggle() {
    set(current === 'light' ? 'dark' : 'light');
  }

  return {
    get current() { return current; },
    init,
    set,
    toggle
  };
}

// 전역 싱글톤으로 내보내기
export const theme = createTheme();