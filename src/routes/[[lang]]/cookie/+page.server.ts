import { policy, site } from '$lib/constants';
import * as m from '$lib/paraglide/messages.js';
import { extractLocaleFromUrl } from '$lib/paraglide/runtime';
import { setLocale } from '$lib/paraglide/runtime.js';
import { error } from '@sveltejs/kit';
import fs from 'fs/promises';
import { marked } from 'marked';
import path from 'path';
import type { PageServerLoad } from './$types';

/**
 * 마크다운 파일을 로드하고 HTML로 변환
 * 해당 언어 파일이 없으면 영어(en)로 fallback
 */
export const load: PageServerLoad = async ({ url }) => {
	// Paraglide를 사용하여 URL에서 locale 추출
	const lang = extractLocaleFromUrl(url.href) || 'en';
	// 파라글라이드 언어 설정 (메시지 함수 사용을 위해 필요)
	setLocale(lang);

	// 마크다운 파일 경로 설정
	const contentDir = path.resolve('src/content/cookie');
	let filePath = path.join(contentDir, `${lang}.md`);

	// 해당 언어 파일이 없으면 영어로 fallback
	let actualLang = lang;
	try {
		await fs.access(filePath);
	} catch {
		// Fallback to English
		filePath = path.join(contentDir, 'en.md');
		actualLang = 'en';
		setLocale('en'); // Fallback 시 언어 설정도 변경
	}

	// 마크다운 파일 읽기
	let markdown: string;
	try {
		markdown = await fs.readFile(filePath, 'utf-8');
	} catch {
		throw error(500, 'Failed to load content');
	}

	// 제3자 서비스 목록 생성 (policy 기반 동적 생성)
	let thirdPartyServicesHtml = '';
	if (policy.cookieServices) {
		const categories = policy.cookieServices;

		// 카테고리별 메시지 키 매핑
		const categoryTitles: Record<string, () => string> = {
			infrastructure: m.cookie_cat_infrastructure,
			payments: m.cookie_cat_payments,
			social: m.cookie_cat_social
		};

		// 카테고리별 설명 메시지 키 매핑
		const categoryDescriptions: Record<string, () => string> = {
			infrastructure: m.cookie_cat_desc_infrastructure,
			payments: m.cookie_cat_desc_payments,
			social: m.cookie_cat_desc_social
		};

		for (const [category, serviceIds] of Object.entries(categories)) {
			const title = categoryTitles[category] ? categoryTitles[category]() : category;
			const description = categoryDescriptions[category] ? categoryDescriptions[category]() : '';
			const services = serviceIds
				.map((id) => {
					const processor = policy.dataProcessors.find((p) => p.id === id);
					return processor ? processor.name : id;
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

	// 마크다운을 HTML로 변환
	const content = await marked(markdown);

	return {
		content,
		lang: actualLang,
		isFallback: actualLang !== lang
	};
};
