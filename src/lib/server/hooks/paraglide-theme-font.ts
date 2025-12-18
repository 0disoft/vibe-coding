import type { Handle } from '@sveltejs/kit';

import { FONT_SIZE_COOKIE, THEME_COOKIE, THEME_PALETTE_COOKIE } from '$lib/constants';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { getDirForLocale } from '$lib/shared/utils/locale';
import {
	isThemeMode,
	isThemePalette,
	type ThemeMode,
	type ThemePalette
} from '$lib/shared/utils/theme';

/**
 * html 태그에 속성을 안전하게 설정/추가하는 헬퍼
 * - 속성이 있으면 값만 교체
 * - 속성이 없으면 새로 추가
 */
function setAttrOnTag(tag: string, name: string, value: string): string {
	const needle = `${name}="`;
	const i = tag.indexOf(needle);
	if (i >= 0) {
		const j = tag.indexOf('"', i + needle.length);
		if (j >= 0) return `${tag.slice(0, i)}${needle}${value}"${tag.slice(j + 1)}`;
		return tag;
	}
	// 속성이 없으면 > 앞에 새로 추가
	const k = tag.lastIndexOf('>');
	if (k < 0) return tag;
	return `${tag.slice(0, k)} ${name}="${value}"${tag.slice(k)}`;
}

/**
 * HTML 문서의 <html> 태그에만 테마/폰트 속성을 주입
 * - 정규식 대신 문자열 파싱으로 예측 가능성 향상
 * - 대소문자 안전 처리 (앞부분만 lowercase 비교로 성능 최적화)
 * - 다른 엘리먼트의 동일 속성에 영향 주지 않음
 *
 * 참고: setAttrOnTag는 name="만 찾으므로, SSR 출력에서 속성이
 * 큰따옴표(")를 사용한다는 전제가 있습니다 (SvelteKit 기본 동작).
 */
function patchHtmlRoot(
	html: string,
	theme: string | null,
	themeMode: ThemeMode | null,
	themePalette: ThemePalette | null,
	fontSize: string | null,
	dir: string
): string {
	// 성능 최적화: 전체 HTML 대신 앞 8KB만 lowercase 처리
	const HEAD_LIMIT = 8192;
	const head = html.slice(0, HEAD_LIMIT);
	const lowerHead = head.toLowerCase();
	const start = lowerHead.indexOf('<html');
	if (start < 0) return html;

	// 다음 문자 검사를 위한 범위 확인
	if (start + 5 >= lowerHead.length) return html;

	// <htmlx> 같은 오탐 방지: 다음 문자가 공백/>/개행인지 확인
	const nextChar = lowerHead[start + 5];
	if (nextChar && ![' ', '>', '\n', '\r', '\t'].includes(nextChar)) return html;

	// 스캔 비용 상한: start부터 최대 1024자 범위 안에서만 > 찾기
	const TAG_MAX_LEN = 1024;
	const endLimit = Math.min(HEAD_LIMIT, start + TAG_MAX_LEN);
	const endRel = html.slice(start, endLimit).indexOf('>');
	if (endRel < 0) return html;

	const end = start + endRel;
	let tag = html.slice(start, end + 1);

	// dir 속성 주입 (항상 존재해야 함)
	tag = setAttrOnTag(tag, 'dir', dir);

	if (theme) tag = setAttrOnTag(tag, 'data-theme', theme);
	if (themeMode) tag = setAttrOnTag(tag, 'data-theme-mode', themeMode);
	if (themePalette) tag = setAttrOnTag(tag, 'data-theme-palette', themePalette);
	if (fontSize) tag = setAttrOnTag(tag, 'data-font-size', fontSize);

	return html.slice(0, start) + tag + html.slice(end + 1);
}

export const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		// 테마 모드 쿠키 읽기 (light/dark/system)
		const rawTheme = event.cookies.get(THEME_COOKIE);
		const themeMode = isThemeMode(rawTheme) ? (rawTheme as ThemeMode) : null;
		const theme = themeMode === 'light' || themeMode === 'dark' ? themeMode : null;

		// 팔레트 쿠키 읽기
		const rawPalette = event.cookies.get(THEME_PALETTE_COOKIE);
		const themePalette = isThemePalette(rawPalette) ? (rawPalette as ThemePalette) : null;

		// 폰트 크기 쿠키 읽기 (1~9만 허용)
		const rawFontSize = event.cookies.get(FONT_SIZE_COOKIE);
		const fontSize = rawFontSize && /^[1-9]$/.test(rawFontSize) ? rawFontSize : null;

		// 서버 로드/액션에서 접근 가능하도록 locals에도 동기화
		event.locals.theme = theme;
		// no-js fallback을 위해 모드/팔레트도 기록
		event.locals.themeMode = themeMode;
		event.locals.themePalette = themePalette;
		event.locals.fontSize = fontSize;

		return resolve(event, {
			transformPageChunk: ({ html }) => {
				// 언어 속성 주입 (중복 등장 대비 replaceAll 사용)
				html = html.replaceAll('%paraglide.lang%', locale);

				const dir = getDirForLocale(locale);

				// <html> 태그에만 테마/폰트/방향 속성 주입
				html = patchHtmlRoot(html, theme, themeMode, themePalette, fontSize, dir);

				return html;
			}
		});
	});
