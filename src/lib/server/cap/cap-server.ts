import Cap from '@cap.js/server';

type ChallengeEntry = {
	challenge: {
		c: number;
		s: number;
		d: number;
	};
	expires: number;
};

const challenges = new Map<string, ChallengeEntry>();
const tokens = new Map<string, number>();

function pruneExpiredChallenges() {
	const now = Date.now();
	for (const [key, value] of challenges) {
		if (value.expires <= now) {
			challenges.delete(key);
		}
	}
}

function pruneExpiredTokens() {
	const now = Date.now();
	for (const [key, expires] of tokens) {
		if (expires <= now) {
			tokens.delete(key);
		}
	}
}

export const cap = new Cap({
	noFSState: true,
	state: {
		challengesList: {},
		tokensList: {}
	},
	storage: {
		challenges: {
			async store(token, challengeData) {
				challenges.set(token, challengeData);
			},
			async read(token) {
				const data = challenges.get(token);
				if (!data) return null;
				if (data.expires <= Date.now()) {
					challenges.delete(token);
					return null;
				}
				return data;
			},
			async delete(token) {
				challenges.delete(token);
			},
			async deleteExpired() {
				pruneExpiredChallenges();
			}
		},
		tokens: {
			async store(tokenKey, expires) {
				tokens.set(tokenKey, expires);
			},
			async get(tokenKey) {
				const expires = tokens.get(tokenKey);
				if (!expires) return null;
				if (expires <= Date.now()) {
					tokens.delete(tokenKey);
					return null;
				}
				return expires;
			},
			async delete(tokenKey) {
				tokens.delete(tokenKey);
			},
			async deleteExpired() {
				pruneExpiredTokens();
			}
		}
	}
});

export async function validateCapToken(token: string) {
	if (!token) return { success: false };
	return cap.validateToken(token);
}
