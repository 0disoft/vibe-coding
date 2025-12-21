/**
 * 상수 배럴 파일
 *
 * 모든 상수를 $lib/constants에서 import할 수 있도록 re-export합니다.
 *
 * @example
 * import { THEME_COOKIE, site, policy } from '$lib/constants';
 */

// 쿠키 관련 상수
export {
	DEFAULT_COOKIE_DAYS,
	DEFAULT_LOCALE_COOKIE_MAX_AGE_SECONDS,
	FONT_SIZE_COOKIE,
	THEME_COOKIE,
	THEME_PALETTE_COOKIE
} from './cookies';
// 헤더 관련 상수
export {
	HEADER_CONTENT_TYPE_OPTIONS,
	HEADER_FRAME_OPTIONS,
	HEADER_PERMITTED_CROSS_DOMAIN_POLICIES,
	HEADER_RATE_LIMIT_LIMIT,
	HEADER_RATE_LIMIT_REMAINING,
	HEADER_RATE_LIMIT_RESET,
	HEADER_REQUEST_ID
} from './headers';
// i18n 관련 상수
export { RTL_LOCALES } from './i18n';
// 라우트/페이지 레지스트리
export { pages } from './pages';
// 정책 관련 설정
export { POLICY_NAV_IDS, type PolicyNavId, policy } from './policy';
// 사이트 기본 정보
export { site } from './site';
// 테마 관련 상수
export {
	DEFAULT_THEME_MODE,
	DEFAULT_THEME_PALETTE,
	THEME_MODES,
	THEME_PALETTES,
	type ThemeMode,
	type ThemePalette
} from './theme';
