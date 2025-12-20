import { json } from '@sveltejs/kit';

import { cap } from '$lib/server/cap/cap-server';
import type { RequestHandler } from './$types';

type RedeemPayload = {
	token: string;
	solutions: number[];
};

const MAX_BODY_BYTES = 8_192;

function isRedeemPayload(value: unknown): value is RedeemPayload {
	if (!value || typeof value !== 'object') return false;
	const payload = value as Record<string, unknown>;
	if (typeof payload.token !== 'string' || payload.token.trim().length === 0) return false;
	if (!Array.isArray(payload.solutions) || payload.solutions.length === 0) return false;
	return payload.solutions.every((item) => Number.isFinite(item));
}

function getBodyBytes(text: string) {
	return new TextEncoder().encode(text).length;
}

export const POST: RequestHandler = async ({ request }) => {
	const contentLength = request.headers.get('content-length');
	if (contentLength) {
		const length = Number.parseInt(contentLength, 10);
		if (Number.isFinite(length) && length > MAX_BODY_BYTES) {
			return json(
				{ success: false, code: 'payload_too_large', message: 'Payload too large.' },
				{ status: 413 }
			);
		}
	}

	let bodyText = '';
	try {
		bodyText = await request.text();
	} catch {
		bodyText = '';
	}

	if (!bodyText) {
		return json(
			{ success: false, code: 'invalid_payload', message: 'Invalid payload.' },
			{ status: 400 }
		);
	}

	if (getBodyBytes(bodyText) > MAX_BODY_BYTES) {
		return json(
			{ success: false, code: 'payload_too_large', message: 'Payload too large.' },
			{ status: 413 }
		);
	}

	let payload: unknown = null;
	try {
		payload = JSON.parse(bodyText);
	} catch {
		payload = null;
	}

	if (!isRedeemPayload(payload)) {
		return json(
			{ success: false, code: 'invalid_payload', message: 'Invalid payload.' },
			{ status: 400 }
		);
	}

	const { token, solutions } = payload;

	try {
		const result = await cap.redeemChallenge({ token, solutions });
		return json(result, { status: result.success ? 200 : 400 });
	} catch {
		return json(
			{ success: false, code: 'redeem_failed', message: 'Failed to redeem challenge.' },
			{ status: 500 }
		);
	}
};
