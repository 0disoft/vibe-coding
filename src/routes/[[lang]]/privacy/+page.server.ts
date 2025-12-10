import { error } from '@sveltejs/kit';
import { marked } from 'marked';

import { policy, site } from '$lib/constants';
import * as m from '$lib/paraglide/messages';
import { extractLocaleFromUrl } from '$lib/paraglide/runtime';

import type { PageServerLoad } from './$types';

// 빌드 타임에 모든 마크다운 파일을 문자열로 포함 (서버리스 환경 호환)
const privacyFiles = import.meta.glob('/src/content/privacy/*.md', {
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
	const getFilePath = (locale: string) => `/src/content/privacy/${locale}.md`;

	let markdown = privacyFiles[getFilePath(lang)];
	let actualLang = lang;

	// 해당 언어 파일이 없으면 영어로 fallback
	if (!markdown) {
		markdown = privacyFiles[getFilePath('en')];
		actualLang = 'en';

		// 영어 파일조차 없으면 500 에러
		if (!markdown) {
			throw error(500, 'Privacy policy content not found');
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
				new Date(policy.effectiveDate.privacy)
			)
		);

	// 수탁업체 테이블 생성
	const tableHeaders = `| ${m.privacy_table_processor({}, { locale: actualLang })} | ${m.privacy_table_purpose({}, { locale: actualLang })} | ${m.privacy_table_country({}, { locale: actualLang })} | ${m.privacy_table_items({}, { locale: actualLang })} | ${m.privacy_table_retention({}, { locale: actualLang })} |`;
	const tableSeparator = '|---|---|---|---|---|';

	/* eslint-disable @typescript-eslint/no-explicit-any */
	const tableRows = policy.dataProcessors
		.map((processor) => {
			// ID를 기반으로 메시지 키 생성
			const id = processor.id;
			// 동적 키 접근을 위해 any로 캐스팅 (m은 모듈 네임스페이스)
			// biome-ignore lint/suspicious/noExplicitAny: Paraglide 동적 메시지 키 접근에 필요
			const messages = m as any;

			const purposeKey = `privacy_processor_${id}_purpose`;
			const countryKey = `privacy_processor_${id}_country`;
			const itemsKey = `privacy_processor_${id}_items`;
			const retentionKey = `privacy_processor_${id}_retention`;

			const purpose =
				typeof messages[purposeKey] === 'function'
					? messages[purposeKey]({}, { locale: actualLang })
					: '-';
			const country =
				typeof messages[countryKey] === 'function'
					? messages[countryKey]({}, { locale: actualLang })
					: '-';
			const items =
				typeof messages[itemsKey] === 'function'
					? messages[itemsKey]({}, { locale: actualLang })
					: '-';
			const retention =
				typeof messages[retentionKey] === 'function'
					? messages[retentionKey]({}, { locale: actualLang })
					: '-';

			// Unicode LRI (U+2066) + PDI (U+2069)로 영어 회사명을 RTL 컨텍스트와 격리
			const isolatedName = `\u2066${processor.name}\u2069`;
			return `| ${isolatedName} | ${purpose} | ${country} | ${items} | ${retention} |`;
		})
		.join('\n');

	const processorsTable = `${tableHeaders}\n${tableSeparator}\n${tableRows}`;

	markdown = markdown.replace(/\{\{DATA_PROCESSORS_TABLE\}\}/g, processorsTable);

	// 마크다운을 HTML로 변환 (marked는 동기 함수)
	const content = marked.parse(markdown) as string;

	return {
		content,
		lang: actualLang,
		isFallback: actualLang !== lang
	};
};
