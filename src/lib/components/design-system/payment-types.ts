import type { IntentWithNeutral } from "./types";

/**
 * ISO 4217 Currency Code (e.g., "USD", "KRW")
 */
export type CurrencyCode = string;

/**
 * ISO 3166-1 Alpha-2 Region Code (e.g., "US", "KR")
 */
export type RegionCode = string;

export type PaymentMethodType =
	| "card"
	| "bank"
	| "crypto"
	| "wallet"
	| "mobile"
	| "virtual"
	| "transfer"
	| "other";

export type UnavailabilityReason =
	| "LOGIN_REQUIRED"
	| "UNSUPPORTED_REGION"
	| "UNSUPPORTED_CURRENCY"
	| "DISABLED"
	| "OTHER";

export type PaymentAvailabilityResult = {
	available: boolean;
	reason?: UnavailabilityReason;
	message?: string;
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
	description?: string;
	provider?: string;
	methodType?: PaymentMethodType;
	icon?: string;
	badge?: string;
	badgeIntent?: IntentWithNeutral;
	/** Metadata for display (e.g., ["Fast", "No Fee"]) */
	meta?: string[];
	/** Detailed information (e.g., ["Min: $1", "Max: $1000"]) */
	details?: string[];
	disabled?: boolean;
	recommended?: boolean;
	availability?: PaymentOptionAvailability;
	/** Fixed note for availability (e.g., "Currently under maintenance") */
	availabilityNote?: string;
};

export type PaymentSummaryItem = {
	label: string;
	value: string | number | null | undefined;
};

/**
 * Validates if a payment option is available based on the provided context.
 * Returns a detailed result including the reason if unavailable.
 */
export function checkPaymentOptionAvailability(
	option: PaymentOption,
	context?: PaymentContext,
): PaymentAvailabilityResult {
	const note = option.availabilityNote;

	if (option.disabled) {
		return { available: false, reason: "DISABLED", message: note };
	}

	if (!option.availability) return { available: true };
	if (!context) return { available: true };

	const { regions, currencies, requireLogin } = option.availability;

	// 1. Login check
	if (requireLogin && context.loggedIn !== true) {
		return { available: false, reason: "LOGIN_REQUIRED", message: note };
	}

	// 2. Region check
	if (regions?.length) {
		const region = context.region?.toUpperCase();
		if (!region) {
			return { available: false, reason: "UNSUPPORTED_REGION", message: note };
		}
		const match = regions.some((r) => r.toUpperCase() === region);
		if (!match) {
			return { available: false, reason: "UNSUPPORTED_REGION", message: note };
		}
	}

	// 3. Currency check
	if (currencies?.length) {
		const currency = context.currency?.toUpperCase();
		if (!currency) {
			return { available: false, reason: "UNSUPPORTED_CURRENCY", message: note };
		}
		const match = currencies.some((c) => c.toUpperCase() === currency);
		if (!match) {
			return { available: false, reason: "UNSUPPORTED_CURRENCY", message: note };
		}
	}

	return { available: true };
}

/**
 * Legacy wrapper for checkPaymentOptionAvailability
 * @deprecated Use checkPaymentOptionAvailability for more detailed results
 */
export function isPaymentOptionAvailable(
	option: PaymentOption,
	context?: PaymentContext,
): boolean {
	return checkPaymentOptionAvailability(option, context).available;
}
