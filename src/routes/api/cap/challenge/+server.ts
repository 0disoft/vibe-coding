import { json } from '@sveltejs/kit';

import { applyRateLimitHeaders, checkCapRateLimit } from '$lib/server/cap/cap-rate-limit';
import { cap } from '$lib/server/cap/cap-server';

import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
	const rateLimit = checkCapRateLimit(event, 'challenge');
	const respond = (data: unknown, init?: ResponseInit) => {
		const response = json(data, init);
		applyRateLimitHeaders(response.headers, rateLimit);
		return response;
	};

	if (rateLimit.blocked) {
		const response = respond(
			{ success: false, code: 'rate_limited', retryAfter: rateLimit.retryAfter },
			{ status: 429 }
		);
		response.headers.set('Retry-After', String(rateLimit.retryAfter));
		return response;
	}

	try {
		const challenge = await cap.createChallenge();
		return respond(challenge);
	} catch {
		return respond({ message: 'Failed to create challenge.' }, { status: 500 });
	}
};
