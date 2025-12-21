import { createHash, webcrypto } from 'node:crypto';
import Cap from '@cap.js/server';

type ChallengeEntry = {
	challenge: {
		c: number;
		s: number;
		d: number;
	};
	expires: number;
};

type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export type CapValidationErrorCode =
	| 'missing_token'
	| 'invalid_format'
	| 'expired'
	| 'invalid_token';

export type CapValidationError = {
	code: CapValidationErrorCode;
	message: string;
};

export type CapValidationResult = Result<{ token: string }, CapValidationError>;

export type ValidateCapTokenOptions = {
	keepToken?: boolean;
};

const SWEEP_INTERVAL_MS = 60 * 1000;

async function sha256(value: string) {
	if (webcrypto?.subtle) {
		const encoder = new TextEncoder();
		const hash = await webcrypto.subtle.digest('SHA-256', encoder.encode(value));
		return Buffer.from(hash).toString('hex');
	}

	return createHash('sha256').update(value).digest('hex');
}

function createInMemoryCapStore() {
	const challenges = new Map<string, ChallengeEntry>();
	const tokens = new Map<string, number>();
	let lastSweep = 0;

	const sweep = (now: number) => {
		if (now - lastSweep < SWEEP_INTERVAL_MS) return;
		lastSweep = now;

		for (const [key, value] of challenges) {
			if (value.expires <= now) {
				challenges.delete(key);
			}
		}

		for (const [key, expires] of tokens) {
			if (expires <= now) {
				tokens.delete(key);
			}
		}
	};

	const getTokenStatus = (tokenKey: string) => {
		const now = Date.now();
		sweep(now);

		const expires = tokens.get(tokenKey);
		if (!expires) return { status: 'missing' as const };
		if (expires <= now) {
			tokens.delete(tokenKey);
			return { status: 'expired' as const };
		}

		return { status: 'active' as const };
	};

	return {
		storage: {
			challenges: {
				async store(token: string, challengeData: ChallengeEntry) {
					const now = Date.now();
					sweep(now);
					challenges.set(token, challengeData);
				},
				async read(token: string) {
					const now = Date.now();
					sweep(now);

					const data = challenges.get(token);
					if (!data) return null;
					if (data.expires <= now) {
						challenges.delete(token);
						return null;
					}
					return data;
				},
				async delete(token: string) {
					challenges.delete(token);
				},
				async deleteExpired() {
					sweep(Date.now());
				}
			},
			tokens: {
				async store(tokenKey: string, expires: number) {
					const now = Date.now();
					sweep(now);
					tokens.set(tokenKey, expires);
				},
				async get(tokenKey: string) {
					const now = Date.now();
					sweep(now);

					const expires = tokens.get(tokenKey);
					if (!expires) return null;
					if (expires <= now) {
						tokens.delete(tokenKey);
						return null;
					}
					return expires;
				},
				async delete(tokenKey: string) {
					tokens.delete(tokenKey);
				},
				async deleteExpired() {
					sweep(Date.now());
				}
			}
		},
		getTokenStatus
	};
}

const capStore = createInMemoryCapStore();

export const cap = new Cap({
	noFSState: true,
	state: {
		challengesList: {},
		tokensList: {}
	},
	storage: capStore.storage
});

type ParsedToken =
	| { ok: true; token: string; id: string; vertoken: string }
	| { ok: false; code: 'missing_token' | 'invalid_format' };

function parseToken(token: string): ParsedToken {
	if (!token || typeof token !== 'string') {
		return { ok: false, code: 'missing_token' };
	}

	const trimmed = token.trim();
	if (!trimmed) {
		return { ok: false, code: 'missing_token' };
	}

	const [id, vertoken, ...rest] = trimmed.split(':');
	if (!id || !vertoken || rest.length > 0) {
		return { ok: false, code: 'invalid_format' };
	}

	return { ok: true, token: trimmed, id, vertoken };
}

const CAP_TOKEN_ERROR_MESSAGES: Record<CapValidationErrorCode, string> = {
	missing_token: 'Token is missing.',
	invalid_format: 'Token format is invalid.',
	expired: 'Token has expired.',
	invalid_token: 'Token is invalid.'
};

export async function validateCapToken(
	token: string,
	options: ValidateCapTokenOptions = {}
): Promise<CapValidationResult> {
	const parsed = parseToken(token);
	if (!parsed.ok) {
		return {
			ok: false,
			error: {
				code: parsed.code,
				message: CAP_TOKEN_ERROR_MESSAGES[parsed.code]
			}
		};
	}

	const tokenKey = `${parsed.id}:${await sha256(parsed.vertoken)}`;
	const status = capStore.getTokenStatus(tokenKey);

	if (status.status === 'expired') {
		return {
			ok: false,
			error: {
				code: 'expired',
				message: CAP_TOKEN_ERROR_MESSAGES.expired
			}
		};
	}

	if (status.status === 'missing') {
		return {
			ok: false,
			error: {
				code: 'invalid_token',
				message: CAP_TOKEN_ERROR_MESSAGES.invalid_token
			}
		};
	}

	const result = await cap.validateToken(
		parsed.token,
		options.keepToken ? { keepToken: true } : undefined
	);

	if (result.success) {
		return { ok: true, value: { token: parsed.token } };
	}

	return {
		ok: false,
		error: {
			code: 'invalid_token',
			message: CAP_TOKEN_ERROR_MESSAGES.invalid_token
		}
	};
}
