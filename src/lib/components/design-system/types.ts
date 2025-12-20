/**
 * 디자인 시스템 공통 타입 정의
 *
 * 모든 DS 컴포넌트에서 사용하는 Size, Intent, Variant 타입을 중앙 관리.
 */

// ─────────────────────────────────────────────────────────────
// Size
// ─────────────────────────────────────────────────────────────

/** 공통 사이즈 */
export const SIZES = ['xs', 'sm', 'md', 'lg'] as const;
export type Size = (typeof SIZES)[number];

const SIZE_SET = new Set<Size>(SIZES);

export function isSize(value: unknown): value is Size {
	return typeof value === 'string' && SIZE_SET.has(value as Size);
}

// ─────────────────────────────────────────────────────────────
// Intent (의도/목적)
// ─────────────────────────────────────────────────────────────

/**
 * 공통 Intent
 * - `danger`는 API에서 허용하지만 CSS에서는 `error`로 변환됨
 */
export const INTENT_TO_CSS = {
	primary: 'primary',
	secondary: 'secondary',
	danger: 'error',
	success: 'success',
	warning: 'warning'
} as const;

export type Intent = keyof typeof INTENT_TO_CSS;
export type IntentCss = (typeof INTENT_TO_CSS)[Intent];

export const INTENTS = Object.keys(INTENT_TO_CSS) as Intent[];
export const INTENTS_CSS = Object.values(INTENT_TO_CSS) as IntentCss[];

const INTENT_SET = new Set<Intent>(INTENTS);
const INTENT_CSS_SET = new Set<IntentCss>(INTENTS_CSS);

/** neutral을 포함한 Intent (IconButton 등) */
export type IntentWithNeutral = Intent | 'neutral';

/** neutral을 포함한 CSS Intent */
export type IntentCssWithNeutral = IntentCss | 'neutral';

const INTENT_WITH_NEUTRAL_SET = new Set<IntentWithNeutral>([...INTENTS, 'neutral']);
const INTENT_CSS_WITH_NEUTRAL_SET = new Set<IntentCssWithNeutral>([...INTENTS_CSS, 'neutral']);

export function isIntent(value: unknown): value is Intent {
	return typeof value === 'string' && INTENT_SET.has(value as Intent);
}

export function isIntentWithNeutral(value: unknown): value is IntentWithNeutral {
	return typeof value === 'string' && INTENT_WITH_NEUTRAL_SET.has(value as IntentWithNeutral);
}

export function isIntentCss(value: unknown): value is IntentCss {
	return typeof value === 'string' && INTENT_CSS_SET.has(value as IntentCss);
}

export function isIntentCssWithNeutral(value: unknown): value is IntentCssWithNeutral {
	return (
		typeof value === 'string' && INTENT_CSS_WITH_NEUTRAL_SET.has(value as IntentCssWithNeutral)
	);
}

/**
 * API Intent를 CSS Intent로 변환
 * - `danger` → `error`
 */
export function toIntentCss(intent: Intent): IntentCss;
export function toIntentCss(intent: IntentWithNeutral): IntentCssWithNeutral;
export function toIntentCss(intent: Intent | IntentWithNeutral): IntentCss | IntentCssWithNeutral {
	if (intent === 'neutral') return 'neutral';

	return INTENT_TO_CSS[intent];
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
