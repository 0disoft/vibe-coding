import { siteConfig } from '$lib/config';
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
  const contentDir = path.resolve('src/content/terms');
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
    .replace(/\{\{SITE_NAME\}\}/g, siteConfig.name)
    .replace(/\{\{EMAIL\}\}/g, siteConfig.email)
    .replace(/\{\{CPO_NAME\}\}/g, siteConfig.policy.cpoName)
    .replace(/\{\{LAST_UPDATED\}\}/g, new Intl.DateTimeFormat(actualLang, { dateStyle: 'long' }).format(new Date(siteConfig.policy.effectiveDate.terms)));

  // 마크다운을 HTML로 변환
  const content = await marked(markdown);

  return {
    content,
    lang: actualLang,
    isFallback: actualLang !== lang
  };
};
