import type { IntentWithNeutral } from './types';

type Brand<T, TBrand> = T & { readonly __brand: TBrand };

/**
 * ISO 4217 Currency Code (e.g., "USD", "KRW")
 */
export type CurrencyCode = Brand<string, 'CurrencyCode'>;

/**
 * ISO 3166-1 Alpha-2 Region Code (e.g., "US", "KR")
 */
export type RegionCode = Brand<string, 'RegionCode'>;

export type PaymentMethodType =
	| 'card'
	| 'bank'
	| 'crypto'
	| 'wallet'
	| 'mobile'
	| 'virtual'
	| 'transfer'
	| 'other';

export type PaymentMethodLabelKey =
	| 'payment_method_card'
	| 'payment_method_bank'
	| 'payment_method_crypto'
	| 'payment_method_wallet'
	| 'payment_method_mobile'
	| 'payment_method_virtual'
	| 'payment_method_transfer'
	| 'payment_method_other';

export type PaymentMethodMeta = {
	labelKey: PaymentMethodLabelKey;
	icon?: string;
};

export const PAYMENT_METHOD_META: Record<PaymentMethodType, PaymentMethodMeta> = {
	card: { labelKey: 'payment_method_card', icon: 'credit-card' },
	bank: { labelKey: 'payment_method_bank', icon: 'landmark' },
	crypto: { labelKey: 'payment_method_crypto', icon: 'coins' },
	wallet: { labelKey: 'payment_method_wallet', icon: 'wallet' },
	mobile: { labelKey: 'payment_method_mobile', icon: 'smartphone' },
	virtual: { labelKey: 'payment_method_virtual', icon: 'qr-code' },
	transfer: { labelKey: 'payment_method_transfer', icon: 'arrow-left-right' },
	other: { labelKey: 'payment_method_other', icon: 'help-circle' }
};

export const getPaymentMethodMeta = (
	type?: PaymentMethodType
): PaymentMethodMeta | undefined => (type ? PAYMENT_METHOD_META[type] : undefined);

export type UnavailabilityReason =
	| 'LOGIN_REQUIRED'
	| 'UNSUPPORTED_REGION'
	| 'UNSUPPORTED_CURRENCY'
	| 'DISABLED'
	| 'OTHER';

export type PaymentAvailabilityRemedy =
	| 'LOGIN'
	| 'SWITCH_CURRENCY'
	| 'SWITCH_REGION'
	| 'CONTACT_SUPPORT'
	| 'TRY_LATER';

export type PaymentAvailabilityResult = {
	available: boolean;
	reason?: UnavailabilityReason;
	message?: string;
	remedy?: PaymentAvailabilityRemedy;
};

export type PaymentOptionAvailability = {
	regions?: RegionCode[];
	currencies?: CurrencyCode[];
	requireLogin?: boolean;
};

export type PaymentContext = {
	region?: RegionCode;
	currency?: CurrencyCode;
	loggedIn?: boolean;
};

export type PaymentOption = {
	id: string;
	label: string;
	/** Screen reader only label for better accessibility */
	ariaLabel?: string;
	/** Additional screen reader hint for complex availability cases */
	ariaHint?: string;
	description?: string;
	provider?: string;
	methodType?: PaymentMethodType;
	icon?: string;
	badge?: string;
	badgeIntent?: IntentWithNeutral;
	/** Metadata for display (e.g., [{ text: "Fast", intent: "success" }]) */
	meta?: PaymentMetaItem[];
	/** Detailed information (e.g., ["Min: $1", "Max: $1000"]) */
	details?: string[];
	disabled?: boolean;
	recommended?: boolean;
	availability?: PaymentOptionAvailability;
	/** Fixed note for availability (e.g., "Currently under maintenance") */
	availabilityNote?: string;
};

export type PaymentMetaDescriptor = {
	text: string;
	intent?: IntentWithNeutral;
	icon?: string;
};

export type PaymentMetaItem = string | PaymentMetaDescriptor;

export const normalizePaymentMeta = (
	items?: PaymentMetaItem[] | null
): PaymentMetaDescriptor[] =>
	(items ?? [])
		.map((item) =>
			typeof item === 'string' ? { text: item } : item
		)
		.filter((item) => item.text?.trim());

export type PaymentSummaryItem = {
	label: string;
	value: string | number | null | undefined;
};

export type PaymentAvailabilityRule = (
	option: PaymentOption,
	context?: PaymentContext
) => PaymentAvailabilityResult | null | undefined;

export type PaymentAvailabilityRuleMode = 'append' | 'prepend' | 'replace';

export type PaymentAvailabilityConfig = {
	rules?: PaymentAvailabilityRule[];
	mode?: PaymentAvailabilityRuleMode;
};

const getRemedyByReason = (
	reason: UnavailabilityReason
): PaymentAvailabilityRemedy | undefined => {
	switch (reason) {
		case 'LOGIN_REQUIRED':
			return 'LOGIN';
		case 'UNSUPPORTED_REGION':
			return 'SWITCH_REGION';
		case 'UNSUPPORTED_CURRENCY':
			return 'SWITCH_CURRENCY';
		case 'DISABLED':
			return 'TRY_LATER';
		default:
			return 'CONTACT_SUPPORT';
	}
};

const buildUnavailableResult = (
	reason: UnavailabilityReason,
	note?: string
): PaymentAvailabilityResult => ({
	available: false,
	reason,
	message: note,
	remedy: getRemedyByReason(reason)
});

export const DEFAULT_PAYMENT_AVAILABILITY_RULES: PaymentAvailabilityRule[] = [
	(option) => {
		if (!option.disabled) return null;
		return buildUnavailableResult('DISABLED', option.availabilityNote);
	},
	(option, context) => {
		if (!option.availability?.requireLogin) return null;
		if (!context) return null;
		if (context?.loggedIn === true) return null;
		return buildUnavailableResult('LOGIN_REQUIRED', option.availabilityNote);
	},
	(option, context) => {
		if (!context) return null;
		const regions = option.availability?.regions;
		if (!regions?.length) return null;
		const region = context?.region?.toUpperCase();
		if (!region) {
			return buildUnavailableResult('UNSUPPORTED_REGION', option.availabilityNote);
		}
		const match = regions.some((item) => item.toUpperCase() === region);
		if (match) return null;
		return buildUnavailableResult('UNSUPPORTED_REGION', option.availabilityNote);
	},
	(option, context) => {
		if (!context) return null;
		const currencies = option.availability?.currencies;
		if (!currencies?.length) return null;
		const currency = context?.currency?.toUpperCase();
		if (!currency) {
			return buildUnavailableResult(
				'UNSUPPORTED_CURRENCY',
				option.availabilityNote
			);
		}
		const match = currencies.some((item) => item.toUpperCase() === currency);
		if (match) return null;
		return buildUnavailableResult('UNSUPPORTED_CURRENCY', option.availabilityNote);
	}
];

const resolveAvailabilityRules = (
	config?: PaymentAvailabilityConfig | PaymentAvailabilityRule[]
): PaymentAvailabilityRule[] => {
	if (Array.isArray(config)) return config;
	const mode = config?.mode ?? 'append';
	const customRules = config?.rules ?? [];
	if (mode === 'replace') return customRules;
	if (mode === 'prepend') return [...customRules, ...DEFAULT_PAYMENT_AVAILABILITY_RULES];
	return [...DEFAULT_PAYMENT_AVAILABILITY_RULES, ...customRules];
};

const runAvailabilityRules = (
	rules: PaymentAvailabilityRule[],
	option: PaymentOption,
	context?: PaymentContext
): PaymentAvailabilityResult | null => {
	for (const rule of rules) {
		const result = rule(option, context);
		if (result) return result;
	}
	return null;
};

/**
 * Validates if a payment option is available based on the provided context.
 * Returns a detailed result including the reason if unavailable.
 */
export function checkPaymentOptionAvailability(
	option: PaymentOption,
	context?: PaymentContext,
	config?: PaymentAvailabilityConfig | PaymentAvailabilityRule[]
): PaymentAvailabilityResult {
	const rules = resolveAvailabilityRules(config);
	const result = runAvailabilityRules(rules, option, context);
	return result ?? { available: true };
}

/**
 * Legacy wrapper for checkPaymentOptionAvailability
 * @deprecated Use checkPaymentOptionAvailability for more detailed results
 */
export function isPaymentOptionAvailable(option: PaymentOption, context?: PaymentContext): boolean {
	return checkPaymentOptionAvailability(option, context).available;
}
