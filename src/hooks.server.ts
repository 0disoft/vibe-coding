/**
 * [hooks.server.ts] 서버 사이드 전용 훅 (조립 파일)
 * - 정책/흐름만 선언하고, 로직은 $lib/server/hooks/*로 분리합니다.
 */

import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

import { handleBodySizeLimit } from '$lib/server/hooks/body-size-limit';
import { handleError } from '$lib/server/hooks/error-handler';
import { handleParaglide } from '$lib/server/hooks/paraglide-theme-font';
import { handleRateLimit } from '$lib/server/hooks/rate-limit';
import { handleRequestId } from '$lib/server/hooks/request-id';
import { handleRootRedirect } from '$lib/server/hooks/root-redirect';
import { handleSecurityHeaders } from '$lib/server/hooks/security-headers';

export const handle: Handle = sequence(
	handleRequestId,
	handleSecurityHeaders,
	handleBodySizeLimit,
	handleRateLimit,
	handleRootRedirect,
	handleParaglide
);

export { handleError };
