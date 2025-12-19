/**
 * 디자인 시스템 공통 타입 정의
 *
 * 모든 DS 컴포넌트에서 사용하는 Size, Intent, Variant 타입을 중앙 관리.
 */

// ─────────────────────────────────────────────────────────────
// Size
// ─────────────────────────────────────────────────────────────

/** 공통 사이즈 */
export type Size = 'xs' | 'sm' | 'md' | 'lg';

// ─────────────────────────────────────────────────────────────
// Intent (의도/목적)
// ─────────────────────────────────────────────────────────────

/**
 * 공통 Intent
 * - `danger`는 API에서 허용하지만 CSS에서는 `error`로 변환됨
 */
export type Intent = 'primary' | 'secondary' | 'danger' | 'success' | 'warning';

/** neutral을 포함한 Intent (IconButton 등) */
export type IntentWithNeutral = Intent | 'neutral';

/**
 * CSS에서 사용하는 Intent (data-ds-intent 속성값)
 * - `danger` 대신 `error` 사용
 */
export type IntentCss = 'primary' | 'secondary' | 'error' | 'success' | 'warning';

/** neutral을 포함한 CSS Intent */
export type IntentCssWithNeutral = IntentCss | 'neutral';

/**
 * API Intent를 CSS Intent로 변환
 * - `danger` → `error`
 */
export function toIntentCss(intent: Intent): IntentCss;
export function toIntentCss(intent: IntentWithNeutral): IntentCssWithNeutral;
export function toIntentCss(intent: Intent | IntentWithNeutral): IntentCss | IntentCssWithNeutral {
	return intent === 'danger' ? 'error' : intent;
}

// ─────────────────────────────────────────────────────────────
// Variant (스타일 변형)
// ─────────────────────────────────────────────────────────────

/** Button/LinkButton Variant */
export type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'link';

/** IconButton Variant (link 제외) */
export type IconButtonVariant = 'solid' | 'outline' | 'ghost';

/** Input Variant */
export type InputVariant = 'outline' | 'filled';
