import { json } from "@sveltejs/kit";

import type { RequestHandler } from "./$types";

import { cap } from "$lib/server/cap/cap-server";

export const POST: RequestHandler = async () => {
	try {
		const challenge = await cap.createChallenge();
		return json(challenge);
	} catch {
		return json({ message: "Failed to create challenge." }, { status: 500 });
	}
};
