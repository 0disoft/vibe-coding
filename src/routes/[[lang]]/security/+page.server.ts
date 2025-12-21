import { error } from '@sveltejs/kit';
import { marked } from 'marked';

import { policy, site } from '$lib/constants';
import { extractLocaleFromUrl } from '$lib/paraglide/runtime';
import { stripPolicyFrontMatter } from '$lib/shared/utils/policy-markdown';

import type { PageServerLoad } from './$types';

// 빌드 타임에 모든 마크다운 파일을 문자열로 포함
const securityFiles = import.meta.glob('/src/content/security/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

// 정적 문서이므로 빌드 타임에 프리렌더
export const prerender = true;

/**
 * 마크다운 파일을 로드하고 HTML로 변환
 */
export const load: PageServerLoad = ({ url }) => {
	const lang = extractLocaleFromUrl(url.href) || 'en';
	const getFilePath = (locale: string) => `/src/content/security/${locale}.md`;

	let markdown = securityFiles[getFilePath(lang)];
	let actualLang = lang;

	// 해당 언어 파일이 없으면 영어로 fallback
	if (!markdown) {
		markdown = securityFiles[getFilePath('en')];
		actualLang = 'en';

		if (!markdown) {
			throw error(500, 'Security policy content not found');
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
				new Date(policy.effectiveDate.security)
			)
		)
		.replace(/\{\{ENC_ALGO_PASSWORD\}\}/g, policy.securityStandards.password)
		.replace(/\{\{ENC_ALGO_DATA\}\}/g, policy.securityStandards.data)
		.replace(/\{\{ENC_ALGO_KDF\}\}/g, policy.securityStandards.kdf)
		.replace(/\{\{ENC_ALGO_INTEGRITY\}\}/g, policy.securityStandards.integrity)
		.replace(/\{\{ENC_ALGO_TRANSPORT\}\}/g, policy.securityStandards.transport)
		.replace(
			/\{\{ENC_REASON_PASSWORD\}\}/g,
			policy.securityReasons[actualLang as keyof typeof policy.securityReasons].password
		)
		.replace(
			/\{\{ENC_REASON_DATA\}\}/g,
			policy.securityReasons[actualLang as keyof typeof policy.securityReasons].data
		)
		.replace(
			/\{\{ENC_REASON_KDF\}\}/g,
			policy.securityReasons[actualLang as keyof typeof policy.securityReasons].kdf
		)
		.replace(
			/\{\{ENC_REASON_INTEGRITY\}\}/g,
			policy.securityReasons[actualLang as keyof typeof policy.securityReasons].integrity
		)
		.replace(
			/\{\{ENC_REASON_TRANSPORT\}\}/g,
			policy.securityReasons[actualLang as keyof typeof policy.securityReasons].transport
		)
		.replace(/\{\{THIRD_PARTY_PROVIDERS\}\}/g, policy.thirdPartyProviders.join(', '));

	const content = marked.parse(markdown) as string;

	return {
		content,
		lang: actualLang
	};
};
