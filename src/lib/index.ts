/**
 * $lib Barrel Export (런타임 코드용)
 *
 * 이 파일은 $lib 경로로 import 할 수 있는 모든 것의 진입점입니다.
 * 유틸리티 함수, 스토어, 헬퍼 등 런타임 코드를 여기서 re-export 하세요.
 *
 * @example
 * import { theme, fontSize, site, policy } from '$lib';
 *
 * ⚠️ 타입 전용 export는 $lib/types/index.ts 를 사용하세요.
 */

// 스토어 (테마, 폰트 크기)
export { fontSize, theme } from './stores';
export type { FontSize } from './stores';

// 상수 (사이트 정보, 정책, 쿠키)
export { FONT_SIZE_COOKIE, THEME_COOKIE, policy, site } from './constants';
