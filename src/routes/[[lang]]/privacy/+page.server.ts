import { policy, site } from '$lib/constants';
import * as m from '$lib/paraglide/messages';
import { extractLocaleFromUrl } from '$lib/paraglide/runtime';
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

	// 마크다운 파일 경로 설정
	// CWD가 프로젝트 루트라고 가정
	const contentDir = path.resolve('src/content/privacy');
	let filePath = path.join(contentDir, `${lang}.md`);

	// 해당 언어 파일이 없으면 영어로 fallback
	let actualLang = lang;
	try {
		await fs.access(filePath);
	} catch {
		// Fallback to English
		filePath = path.join(contentDir, 'en.md');
		actualLang = 'en';
	}

	// 마크다운 파일 읽기
	let markdown: string;
	try {
		markdown = await fs.readFile(filePath, 'utf-8');
	} catch {
		throw error(500, 'Failed to load content');
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

			return `| ${processor.name} | ${purpose} | ${country} | ${items} | ${retention} |`;
		})
		.join('\n');

	const processorsTable = `${tableHeaders}\n${tableSeparator}\n${tableRows}`;

	markdown = markdown.replace(/\{\{DATA_PROCESSORS_TABLE\}\}/g, processorsTable);

	// 마크다운을 HTML로 변환
	const content = await marked(markdown);

	return {
		content,
		lang: actualLang,
		isFallback: actualLang !== lang
	};
};
