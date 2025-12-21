import { error } from '@sveltejs/kit';
import { marked } from 'marked';

import { policy, site } from '$lib/constants';
import { extractLocaleFromUrl } from '$lib/paraglide/runtime';
import { stripPolicyFrontMatter } from '$lib/shared/utils/policy-markdown';

import type { PageServerLoad } from './$types';

// 빌드 타임에 모든 마크다운 파일을 문자열로 포함
const bugBountyFiles = import.meta.glob('/src/content/bug-bounty/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

// 정적 문서이므로 빌드 타임에 프리렌더
export const prerender = true;

/**
 * 버그 바운티 마크다운 파일을 로드하고 HTML로 변환
 */
export const load: PageServerLoad = ({ url }) => {
	const lang = extractLocaleFromUrl(url.href) || 'en';
	const getFilePath = (locale: string) => `/src/content/bug-bounty/${locale}.md`;

	let markdown = bugBountyFiles[getFilePath(lang)];
	let actualLang = lang;

	// 해당 언어 파일이 없으면 영어로 fallback
	if (!markdown) {
		markdown = bugBountyFiles[getFilePath('en')];
		actualLang = 'en';

		if (!markdown) {
			throw error(500, 'Bug Bounty content not found');
		}
	}

	markdown = stripPolicyFrontMatter(markdown);

	// 템플릿 변수 치환
	markdown = markdown
		.replace(/\{\{SITE_NAME\}\}/g, site.name)
		.replace(/\{\{EMAIL\}\}/g, site.email)
		.replace(
			/\{\{LAST_UPDATED\}\}/g,
			new Intl.DateTimeFormat(actualLang, { dateStyle: 'long' }).format(
				new Date(policy.effectiveDate.bugBounty)
			)
		);

	const content = marked.parse(markdown) as string;

	return {
		content,
		lang: actualLang
	};
};
