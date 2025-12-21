import type { RequestEvent } from '@sveltejs/kit';

import { policy } from '$lib/constants';
import {
	HEADER_RATE_LIMIT_LIMIT,
	HEADER_RATE_LIMIT_REMAINING,
	HEADER_RATE_LIMIT_RESET
} from '$lib/constants/headers';
import { checkRateLimit, type RateLimitRule } from '$lib/server/rate-limiter';

export type CapRateLimitAction = 'challenge' | 'redeem';

type CapRateLimitResult = ReturnType<typeof checkRateLimit>;

const CAP_RATE_LIMIT_RULES: Record<CapRateLimitAction, RateLimitRule[]> = {
	challenge: [
		{
			name: 'cap-challenge',
			pattern: /^\/api\/cap\//,
			windowMs: policy.capRateLimit.challenge.windowMs,
			max: policy.capRateLimit.challenge.max,
			penaltyMs: policy.capRateLimit.challenge.penaltyMs
		}
	],
	redeem: [
		{
			name: 'cap-redeem',
			pattern: /^\/api\/cap\//,
			windowMs: policy.capRateLimit.redeem.windowMs,
			max: policy.capRateLimit.redeem.max,
			penaltyMs: policy.capRateLimit.redeem.penaltyMs
		}
	]
};

export function checkCapRateLimit(event: RequestEvent, action: CapRateLimitAction) {
	return checkRateLimit(event, CAP_RATE_LIMIT_RULES[action]);
}

export function applyRateLimitHeaders(headers: Headers, result: CapRateLimitResult) {
	if (result.limit > 0) {
		headers.set(HEADER_RATE_LIMIT_LIMIT, String(result.limit));
		headers.set(HEADER_RATE_LIMIT_REMAINING, String(result.remaining));
		headers.set(HEADER_RATE_LIMIT_RESET, String(result.reset));
	}
}
