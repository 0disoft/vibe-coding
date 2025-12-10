import { error } from '@sveltejs/kit';
import { marked } from 'marked';

import { policy, site } from '$lib/constants';
import * as m from '$lib/paraglide/messages.js';
import { extractLocaleFromUrl, setLocale } from '$lib/paraglide/runtime';

import type { PageServerLoad } from './$types';

// 빌드 타임에 모든 마크다운 파일을 문자열로 포함 (서버리스 환경 호환)
const cookieFiles = import.meta.glob('/src/content/cookie/*.md', {
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
	// 파라글라이드 언어 설정 (메시지 함수 사용을 위해 필요)
	setLocale(lang);

	// 파일 경로 매칭 (import.meta.glob 키 형식)
	const getFilePath = (locale: string) => `/src/content/cookie/${locale}.md`;

	let markdown = cookieFiles[getFilePath(lang)];
	let actualLang = lang;

	// 해당 언어 파일이 없으면 영어로 fallback
	if (!markdown) {
		markdown = cookieFiles[getFilePath('en')];
		actualLang = 'en';
		setLocale('en'); // Fallback 시 언어 설정도 변경

		// 영어 파일조차 없으면 500 에러
		if (!markdown) {
			throw error(500, 'Cookie policy content not found');
		}
	}

	// 제3자 서비스 목록 생성 (policy 기반 동적 생성)
	let thirdPartyServicesHtml = '';
	if (policy.cookieServices) {
		const categories = policy.cookieServices;

		// 카테고리별 메시지 키 매핑
		const categoryTitles: Record<string, () => string> = {
			infrastructure: m.cookie_cat_infrastructure,
			analytics: m.cookie_cat_analytics,
			payments: m.cookie_cat_payments,
			social: m.cookie_cat_social,
			support: m.cookie_cat_support,
			ai: m.cookie_cat_ai
		};

		// 카테고리별 설명 메시지 키 매핑
		const categoryDescriptions: Record<string, () => string> = {
			infrastructure: m.cookie_cat_desc_infrastructure,
			analytics: m.cookie_cat_desc_analytics,
			payments: m.cookie_cat_desc_payments,
			social: m.cookie_cat_desc_social,
			support: m.cookie_cat_desc_support,
			ai: m.cookie_cat_desc_ai
		};

		for (const [category, serviceIds] of Object.entries(categories)) {
			const title = categoryTitles[category] ? categoryTitles[category]() : category;
			const description = categoryDescriptions[category] ? categoryDescriptions[category]() : '';
			const services = serviceIds
				.map((id) => {
					const processor = policy.dataProcessors.find((p) => p.id === id);
					// Unicode LRI (U+2066) + PDI (U+2069)로 RTL에서 영어 회사명 격리
					return processor ? `\u2066${processor.name}\u2069` : id;
				})
				.join(', ');

			thirdPartyServicesHtml += `- **${title}:** ${services}\n  ${description}\n`;
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
				new Date(policy.effectiveDate.cookie)
			)
		)
		.replace(/\{\{THIRD_PARTY_SERVICES\}\}/g, thirdPartyServicesHtml);

	// 마크다운을 HTML로 변환 (marked는 동기 함수)
	const content = marked.parse(markdown) as string;

	return {
		content,
		lang: actualLang,
		isFallback: actualLang !== lang
	};
};
