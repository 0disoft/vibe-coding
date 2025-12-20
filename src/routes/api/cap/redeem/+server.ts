import { json } from "@sveltejs/kit";

import type { RequestHandler } from "./$types";

import { cap } from "$lib/server/cap/cap-server";

type RedeemPayload = {
	token?: string;
	solutions?: number[];
};

export const POST: RequestHandler = async ({ request }) => {
	let payload: RedeemPayload | null = null;

	try {
		payload = (await request.json()) as RedeemPayload;
	} catch {
		payload = null;
	}

	const token = typeof payload?.token === "string" ? payload.token : null;
	const solutions = Array.isArray(payload?.solutions)
		? payload?.solutions.filter((value) => Number.isFinite(value))
		: null;

	if (!token || !solutions || solutions.length === 0) {
		return json({ success: false, message: "Invalid payload." }, { status: 400 });
	}

	try {
		const result = await cap.redeemChallenge({ token, solutions });
		return json(result, { status: result.success ? 200 : 400 });
	} catch {
		return json({ success: false, message: "Failed to redeem challenge." }, { status: 500 });
	}
};
