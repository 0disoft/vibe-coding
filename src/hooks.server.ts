import { paraglideMiddleware } from '$lib/paraglide/server';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks'; // 여러 핸들을 묶기 위해 가져옵니다.

// 1. 테마 처리 핸들러
// 쿠키를 확인하여 HTML에 data-theme 속성을 주입하는 역할을 합니다.
const handleTheme: Handle = async ({ event, resolve }) => {
	const theme = event.cookies.get('theme');

	// resolve 함수는 페이지 렌더링을 계속 진행시킵니다.
	// transformPageChunk를 이용해 HTML이 브라우저로 전송되기 직전에 수정합니다.
	return resolve(event, {
		transformPageChunk: ({ html }) => {
			// 쿠키에 저장된 테마가 있다면 html 태그의 data-theme 속성을 해당 값으로 교체합니다.
			if (theme) {
				return html.replace('data-theme=""', `data-theme="${theme}"`);
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

// 3. 핸들러 병합 및 내보내기
// sequence를 사용하면 나열된 순서대로 미들웨어가 실행됩니다.
// 순서는 크게 상관없으나, 일반적으로 전역 설정인 테마를 먼저 처리하고
// 라우팅과 관련된 다국어 처리를 뒤에 두는 것이 구조상 깔끔합니다.
export const handle: Handle = sequence(handleTheme, handleParaglide);