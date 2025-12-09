/**
 * [hooks.server.ts] 서버 사이드 전용 훅
 * 실행 환경: 서버 (Node.js, Bun, Cloudflare Workers 등)
 * 핵심 역할: 보안 통제, 데이터 제어, 백엔드 로직 수행
 *
 * [주요 활용 예시 7가지]
 * 1. [인증 및 세션] 쿠키에서 세션 ID를 검증하고 event.locals에 유저 정보를 주입하여 서버 전역에서 사용
 * 2. [보안 헤더] CSP, CORS 등 보안 관련 헤더를 강제로 주입하여 외부 공격 방어
 * 3. [DB 연결] 요청이 들어올 때마다 데이터베이스 연결을 확인하거나 커넥션 풀 초기화
 * 4. [접근 제어] 관리자(/admin) 등 특정 경로 접근 시 권한을 확인하고 차단 또는 리다이렉트
 * 5. [API 프록시] 프론트엔드의 요청을 가로채 서버에 숨겨진 비밀 API 키를 헤더에 붙여서 외부로 전송
 * 6. [에러 모니터링] 서버 내부에서 발생한 500 에러 등을 포착하여 슬랙, 디스코드, Sentry 등으로 알림 전송
 * 7. [테마 감지] 초기 요청 시 쿠키를 읽어 다크/라이트 모드를 판별하고 깜빡임 없는 HTML 렌더링 지원
 */

import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks'; // 여러 핸들을 묶기 위해 가져옵니다.
import { FONT_SIZE_COOKIE, THEME_COOKIE } from '$lib/constants';
import { paraglideMiddleware } from '$lib/paraglide/server';

// 1. 테마/폰트 크기 처리 핸들러
// 쿠키를 확인하여 HTML에 data-theme, data-font-size 속성을 주입하는 역할을 합니다.
const handleThemeAndFont: Handle = async ({ event, resolve }) => {
	const rawTheme = event.cookies.get(THEME_COOKIE);
	const theme = rawTheme === 'light' || rawTheme === 'dark' ? rawTheme : null;
	const fontSize = event.cookies.get(FONT_SIZE_COOKIE); // 기대값: '1' ~ '9'

	// resolve 함수는 페이지 렌더링을 계속 진행시킵니다.
	// transformPageChunk를 이용해 HTML이 브라우저로 전송되기 직전에 수정합니다.
	return resolve(event, {
		transformPageChunk: ({ html }) => {
			// 쿠키에 저장된 테마가 있다면 html 태그의 data-theme 속성을 해당 값으로 교체합니다.
			if (theme) {
				html = html.replace(/data-theme="[^"]*"/, `data-theme="${theme}"`);
			}
			// 폰트 크기 쿠키가 1~9 사이라면 data-font-size 기본값(5)을 교체합니다.
			if (fontSize && /^[1-9]$/.test(fontSize)) {
				html = html.replace(/data-font-size="[^"]*"/, `data-font-size="${fontSize}"`);
			}
			// 테마 쿠키가 없다면 HTML을 수정하지 않고 그대로 둡니다.
			return html;
		}
	});
};

// 2. 다국어 처리 핸들러 (기존 코드 유지)
// 언어 설정에 따라 HTML의 lang 속성을 변경하고 라우팅을 제어합니다.
const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});

// 3. Accept-Language 기반 lang 보정
// 기본 로케일이 en이라도 한국어 브라우저이면 lang="ko"로 교체하여 Pretendard 적용 범위가 작동하게 함
const handleLangFallback: Handle = ({ event, resolve }) => {
	const accept = event.request.headers.get('accept-language') ?? '';

	// 매우 단순한 파서: q값 고려, ko 우선 매칭
	const pickKo = (() => {
		return accept
			.split(',')
			.map((part) => part.trim())
			.some((part) => part.toLowerCase().startsWith('ko'));
	})();

	return resolve(event, {
		transformPageChunk: ({ html }) => {
			if (pickKo) {
				// [의도] 한국어 사용자에게는 영어 페이지도 Pretendard(Inter 베이스)로 보여주어
				// 한글/영어가 섞여도 이질감 없는 디자인 일관성을 유지합니다.
				// 단, 일본어(ja) 등 확실한 다른 언어 페이지에서는 폰트 충돌을 막기 위해
				// 오직 기본 언어(en)일 때만 한국어(ko)로 설정을 덮어씁니다.
				html = html.replace(/lang="en"/, 'lang="ko"');
			}
			return html;
		}
	});
};

// 4. 핸들러 병합 및 내보내기
// 순서: 테마/폰트 → Paraglide(lang 치환) → Accept-Language 기반 lang 보정
export const handle: Handle = sequence(handleThemeAndFont, handleParaglide, handleLangFallback);
