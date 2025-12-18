import { describe, expect, it } from 'vitest';

import { buildLocalizedUrl, getDirForLocale, getLocaleFromUrl } from './locale';

describe('shared/utils/locale', () => {
	it('getDirForLocale: ar은 rtl', () => {
		expect(getDirForLocale('ar')).toBe('rtl');
		expect(getDirForLocale('ko')).toBe('ltr');
	});

	it('buildLocalizedUrl: 쿼리/해시 보존 + prefix 중복 방어', () => {
		const url = new URL('https://example.com/ko/ko/docs?x=1#h');
		const out = buildLocalizedUrl(url, 'ja');
		expect(out.pathname).toBe('/ja/docs');
		expect(out.search).toBe('?x=1');
		expect(out.hash).toBe('#h');
	});

	it('getLocaleFromUrl: prefix가 없으면 baseLocale', () => {
		expect(getLocaleFromUrl(new URL('https://example.com/ja/docs'))).toBe('ja');
		expect(getLocaleFromUrl(new URL('https://example.com/docs'))).toBe('en');
	});
});
