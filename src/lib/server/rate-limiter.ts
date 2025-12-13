import type { RequestEvent } from '@sveltejs/kit';

export interface RateLimitRule {
	name: string;
	pattern: RegExp;
	windowMs: number;
	max: number;
	penaltyMs?: number; // 차단 시 페널티 기간 (기본값: windowMs)
}

interface RateLimitRecord {
	count: number;
	resetTime: number;
	blocked: boolean;
	blockedUntil: number;
}

// In-memory storage
// 운영 환경에서는 Redis 등으로 교체 권장
const storage = new Map<string, RateLimitRecord>();

let lastSweep = Date.now();
const SWEEP_INTERVAL = 60 * 1000; // 1분마다 정리

// Helper to get robust Client IP
export function getClientIP(event: RequestEvent): string {
	const h = event.request.headers;
	return (
		h.get('cf-connecting-ip') ||
		h.get('x-real-ip') ||
		h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
		event.getClientAddress() ||
		'unknown'
	);
}

function sweep(now: number) {
	if (now - lastSweep < SWEEP_INTERVAL) return;
	lastSweep = now;

	for (const [key, record] of storage.entries()) {
		// 차단되지 않았고, 리셋 시간이 지났으면 삭제
		if (!record.blocked && now > record.resetTime) {
			storage.delete(key);
		}
	}
}

export function checkRateLimit(
	event: RequestEvent,
	rules: RateLimitRule[]
): {
	blocked: boolean;
	retryAfter: number;
	ruleName?: string;
	limit: number;
	remaining: number;
	reset: number;
} {
	const now = Date.now();
	sweep(now);

	const { pathname } = event.url;
	const clientIP = getClientIP(event);

	// 1. 매칭되는 규칙 찾기 (순서대로 검사)
	const rule = rules.find((r) => r.pattern.test(pathname));

	// 매칭되는 규칙이 없으면 제한 없음
	if (!rule) {
		return {
			blocked: false,
			retryAfter: 0,
			limit: 0,
			remaining: 0,
			reset: 0
		};
	}

	// 2. 식별자 생성 (Identifier Generation)
	const identifier = `i:${clientIP}:${rule.name}`;
	let record = storage.get(identifier);

	// 3. 차단 상태 확인
	if (record?.blocked && now < record.blockedUntil) {
		const retryAfter = Math.ceil((record.blockedUntil - now) / 1000);
		// 차단된 상태여도 limit 정보 반환 (remaining 0)
		return {
			blocked: true,
			retryAfter,
			ruleName: rule.name,
			limit: rule.max,
			remaining: 0,
			reset: Math.ceil(record.blockedUntil / 1000)
		};
	}

	// 4. 기록 초기화 또는 갱신
	if (!record || now >= record.resetTime) {
		// 새 윈도우 시작
		storage.set(identifier, {
			count: 1,
			resetTime: now + rule.windowMs,
			blocked: false,
			blockedUntil: 0
		});
		// 새 레코드이므로 remaining = max - 1
		return {
			blocked: false,
			retryAfter: 0,
			ruleName: rule.name,
			limit: rule.max,
			remaining: Math.max(0, rule.max - 1),
			reset: Math.ceil((now + rule.windowMs) / 1000)
		};
	} else {
		// 기존 윈도우 카운트 증가
		record.count++;

		// 5. 제한 초과 확인
		if (record.count > rule.max) {
			const penaltyMs = rule.penaltyMs ?? rule.windowMs; // 설정된 페널티, 없으면 윈도우 시간
			record.blocked = true;
			record.blockedUntil = now + penaltyMs;
			record.resetTime = record.blockedUntil; // 윈도우 동기화
			record.count = 0; // 카운트 리셋

			const retryAfter = Math.ceil((record.blockedUntil - now) / 1000);
			return {
				blocked: true,
				retryAfter,
				ruleName: rule.name,
				limit: rule.max,
				remaining: 0,
				reset: Math.ceil(record.blockedUntil / 1000)
			};
		}

		// 정상 통과
		const remaining = rule.max - record.count;
		const reset = Math.ceil(record.resetTime / 1000);
		return {
			blocked: false,
			retryAfter: 0,
			ruleName: rule.name,
			limit: rule.max,
			remaining: Math.max(0, remaining),
			reset
		};
	}
}
