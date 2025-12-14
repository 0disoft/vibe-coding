import type { Handle } from '@sveltejs/kit';

import { policy } from '$lib/constants';

export const handleBodySizeLimit: Handle = async ({ event, resolve }) => {
  const { method, headers } = event.request;
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const raw = headers.get('content-length');
    if (raw != null) {
      // 로그 인젝션 방지: 줄바꿈 제거 + 양끝 공백 제거
      const safeRaw = raw.replaceAll('\r', '').replaceAll('\n', '').trim();
      // 로그 값 길이 제한: 비정상적으로 긴 값이 로그를 오염시키는 것 방지
      const rawForLog = safeRaw.length > 80 ? `${safeRaw.slice(0, 80)}...` : safeRaw;

      // Content-Length는 순수 10진수 숫자만 허용 (RFC 9110, RFC 9112)
      // 비정상적으로 긴 값은 정규식 검사 전에 차단 (32자 = 10^32 bytes, 현실 불가)
      // Number()의 관대한 파싱(빈 문자열→0, 0x10→16 등) 우회 방지
      if (safeRaw.length > 32 || !/^\d+$/.test(safeRaw)) {
        if (!import.meta.env.DEV) {
          console.warn(
            `[SizeLimit] Invalid Content-Length (ID: ${event.locals.requestId}) - ${method} ${event.url.pathname} - raw=${rawForLog}`
          );
        }
        return new Response('Bad Request', {
          status: 400,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'private, no-store'
          }
        });
      }

      const len = Number(safeRaw);
      if (len > policy.maxBodySize) {
        console.warn(
          `[SizeLimit] Blocked ${method} request (ID: ${event.locals.requestId}) - Size: ${len} > ${policy.maxBodySize}`
        );
        return new Response('Payload Too Large', {
          status: 413,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'private, no-store'
          }
        });
      }
    }
  }
  return resolve(event);
};

