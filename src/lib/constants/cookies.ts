/** 쿠키 기본 만료일 (일) */
export const DEFAULT_COOKIE_DAYS = 365;

/** 로케일 쿠키 기본 만료 (초) */
export const DEFAULT_LOCALE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

/**
 * 쿠키 키 상수
 *
 * 네이밍 전략:
 * - 이 템플릿은 도메인별로 독립된 사이트를 만드는 것을 전제로 함
 * - 따라서 단순한 이름(theme, fontSize)을 사용해도 도메인 간 쿠키 충돌 없음
 * - 만약 같은 도메인에 여러 앱을 둘 경우, 'myapp-theme' 식으로 prefix 추가 필요
 */
export const THEME_COOKIE = 'theme';
export const FONT_SIZE_COOKIE = 'fontSize';
export const THEME_PALETTE_COOKIE = 'themePalette';
