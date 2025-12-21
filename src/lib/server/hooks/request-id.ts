import type { Handle } from '@sveltejs/kit';

import { HEADER_REQUEST_ID } from '$lib/constants/headers';

export const handleRequestId: Handle = async ({ event, resolve }) => {
	// 외부(로드밸런서 등)에서 전달된 ID가 있으면 재사용, 없으면 새로 생성
	// 로그 인젝션 방지를 위해 형태와 길이 제한 (UUID 형태 또는 영숫자+하이픈, 최대 64자)
	const incoming = event.request.headers.get(HEADER_REQUEST_ID) || '';
	const safe = /^[A-Za-z0-9-]{1,64}$/.test(incoming) ? incoming : '';
	const requestId = safe || crypto.randomUUID();
	event.locals.requestId = requestId;

	const response = await resolve(event);
	response.headers.set(HEADER_REQUEST_ID, requestId);

	return response;
};
