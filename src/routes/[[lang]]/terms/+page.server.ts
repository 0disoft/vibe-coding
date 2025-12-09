import { error } from '@sveltejs/kit';
import { marked } from 'marked';

import { policy, site } from '$lib/constants';
import { extractLocaleFromUrl } from '$lib/paraglide/runtime';

import type { PageServerLoad } from './$types';

// 빌드 타임에 모든 마크다운 파일을 문자열로 포함 (서버리스 환경 호환)
const termsFiles = import.meta.glob('/src/content/terms/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

// 정적 문서이므로 빌드 타임에 프리렌더
export const prerender = true;

/**
 * 마크다운 파일을 로드하고 HTML로 변환
 * 해당 언어 파일이 없으면 영어(en)로 fallback
 */
export const load: PageServerLoad = ({ url }) => {
	// Paraglide를 사용하여 URL에서 locale 추출
	const lang = extractLocaleFromUrl(url.href) || 'en';

	// 파일 경로 매칭 (import.meta.glob 키 형식)
	const getFilePath = (locale: string) => `/src/content/terms/${locale}.md`;

	let markdown = termsFiles[getFilePath(lang)];
	let actualLang = lang;

	// 해당 언어 파일이 없으면 영어로 fallback
	if (!markdown) {
		markdown = termsFiles[getFilePath('en')];
		actualLang = 'en';

		// 영어 파일조차 없으면 500 에러
		if (!markdown) {
			throw error(500, 'Terms of service content not found');
		}
	}

	// 템플릿 변수 치환
	markdown = markdown
		.replace(/\{\{SITE_NAME\}\}/g, site.name)
		.replace(/\{\{EMAIL\}\}/g, site.email)
		.replace(/\{\{CPO_NAME\}\}/g, policy.cpoName)
		.replace(
			/\{\{LAST_UPDATED\}\}/g,
			new Intl.DateTimeFormat(actualLang, { dateStyle: 'long' }).format(
				new Date(policy.effectiveDate.terms)
			)
		);

	// 마크다운을 HTML로 변환 (marked는 동기 함수)
	const content = marked.parse(markdown) as string;

	return {
		content,
		lang: actualLang,
		isFallback: actualLang !== lang
	};
};
