import type { HandleServerError } from '@sveltejs/kit';
import { building } from '$app/environment';

/**
 * SvelteKit error(status, body)에서 body가 문자열 또는 객체일 수 있으므로
 * 두 경우 모두 안전하게 메시지를 추출합니다.
 */
function pickHttpMessage(error: unknown): string | undefined {
	if (!error || typeof error !== 'object') return undefined;
	if (!('body' in error)) return undefined;

	const body = (error as { body?: unknown }).body;
	// body가 문자열인 경우 (예: error(401, 'Unauthorized'))
	if (typeof body === 'string' && body.trim()) return body;
	// body가 객체인 경우 (예: error(401, { message: 'Unauthorized' }))
	if (body && typeof body === 'object' && 'message' in body) {
		const msg = (body as { message?: unknown }).message;
		if (typeof msg === 'string' && msg.trim()) return msg;
	}
	return undefined;
}

export const handleError: HandleServerError = ({ error, event }) => {
	const requestId = event.locals.requestId || 'unknown';
	const shouldLogInternal =
		import.meta.env.DEV || building || process.env.VIBE_LOG_SERVER_ERRORS === '1';

	// 에러 객체에서 status 추출 (Safe Duck Typing + NaN/0 방어)
	const rawStatus =
		error && typeof error === 'object' && 'status' in error
			? (error as { status: unknown }).status
			: 500;
	const status =
		typeof rawStatus === 'number' && Number.isFinite(rawStatus) && rawStatus > 0 ? rawStatus : 500;

	const clientMsg = pickHttpMessage(error);

	// 1. 의도된 HTTP 에러 (400대: Not Found, Unauthorized 등)
	// 500 이상은 isHttpError()와 무관하게 항상 내부 메시지 숨김 (보안)
	if (status >= 400 && status < 500) {
		// 404는 로그를 남기지 않거나, 필요하다면 access log 수준으로 처리
		if (status !== 404) {
			if (shouldLogInternal) {
				console.warn(`[${requestId}] HTTP Error ${status}:`, clientMsg || 'Unknown error'); // security-ignore: no-console-outside-dev
			}
		}

		return {
			message: clientMsg || 'Error',
			requestId
		};
	}

	// 2. 예기치 못한 서버 시스템 에러 (500)
	// PROD에서도 "에러 발생 사실"은 남기되, 상세(error 객체)는 opt-in(DEV/building/VIBE_LOG_SERVER_ERRORS)에서만 출력합니다.
	if (shouldLogInternal) {
		console.error(`[${requestId}] Server Error:`, error); // security-ignore: no-console-outside-dev
	} else {
		const brief =
			error instanceof Error
				? `${error.name}: ${error.message}`
				: typeof error === 'string'
					? error
					: 'Unknown error';
		console.error(`[${requestId}] Server Error: ${brief}`); // security-ignore: no-console-outside-dev — PROD 에러 로깅 의도적
	}

	// 보안상 상세 에러 내용은 숨기고 일반적인 메시지 반환
	return {
		message: 'Internal Server Error',
		requestId
	};
};
