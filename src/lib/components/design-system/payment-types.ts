import type { IntentWithNeutral } from "./types";

export type PaymentMethodType =
	| "card"
	| "bank"
	| "crypto"
	| "wallet"
	| "mobile"
	| "virtual"
	| "transfer"
	| "other";

export type PaymentOptionAvailability = {
	regions?: string[];
	currencies?: string[];
	requireLogin?: boolean;
};

export type PaymentContext = {
	region?: string;
	currency?: string;
	loggedIn?: boolean;
};

export type PaymentOption = {
	id: string;
	label: string;
	description?: string;
	provider?: string;
	methodType?: PaymentMethodType;
	icon?: string;
	badge?: string;
	badgeIntent?: IntentWithNeutral;
	meta?: string[];
	details?: string[];
	disabled?: boolean;
	recommended?: boolean;
	availability?: PaymentOptionAvailability;
	availabilityNote?: string;
};

export type PaymentSummaryItem = {
	label: string;
	value: string | number | null | undefined;
};

export function isPaymentOptionAvailable(
	option: PaymentOption,
	context?: PaymentContext,
): boolean {
	if (!option.availability) return true;
	if (!context) return true;
	const { regions, currencies, requireLogin } = option.availability;

	if (requireLogin && context.loggedIn !== true) return false;
	if (regions?.length) {
		const region = context.region?.toLowerCase();
		if (!region) return false;
		const match = regions.some((r) => r.toLowerCase() === region);
		if (!match) return false;
	}
	if (currencies?.length) {
		const currency = context.currency?.toUpperCase();
		if (!currency) return false;
		const match = currencies.some((c) => c.toUpperCase() === currency);
		if (!match) return false;
	}
	return true;
}
