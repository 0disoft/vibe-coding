import {
	baseLocale,
	cookieName,
	deLocalizeUrl,
	isLocale,
	locales,
	localizeUrl
} from '$lib/paraglide/runtime.js';

export type Locale = (typeof locales)[number];
export type Direction = 'ltr' | 'rtl';

export { baseLocale, cookieName, locales };

const RTL_LOCALES = new Set<string>(['ar']);

export const DEFAULT_LOCALE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function getDirForLocale(locale: string): Direction {
	return RTL_LOCALES.has(locale) ? 'rtl' : 'ltr';
}

export type LocaleCookieSetOptions = {
	path: string;
	sameSite: 'lax';
	secure: boolean;
	maxAge: number;
	httpOnly: false;
};

export function getLocaleCookieSetOptions(url: URL): LocaleCookieSetOptions {
	return {
		path: '/',
		sameSite: 'lax',
		secure: url.protocol === 'https:',
		maxAge: DEFAULT_LOCALE_COOKIE_MAX_AGE_SECONDS,
		httpOnly: false
	};
}

type LocaleCookieStringOptions = {
	path?: string;
	sameSite?: 'Lax' | 'Strict' | 'None';
	secure?: boolean;
	maxAge?: number;
};

export function buildLocaleCookieString(
	locale: Locale,
	options: LocaleCookieStringOptions = {}
): string {
	const path = options.path ?? '/';
	const sameSite = options.sameSite ?? 'Lax';
	const secure =
		options.secure ?? (typeof location !== 'undefined' ? location.protocol === 'https:' : false);
	const maxAge = options.maxAge ?? DEFAULT_LOCALE_COOKIE_MAX_AGE_SECONDS;

	let cookie = `${cookieName}=${encodeURIComponent(locale)}; Path=${path}; SameSite=${sameSite}; Max-Age=${maxAge}`;
	if (secure) cookie += '; Secure';
	return cookie;
}

export function writeLocaleCookie(locale: Locale, options: LocaleCookieStringOptions = {}): void {
	if (typeof document === 'undefined') return;
	// biome-ignore lint/suspicious/noDocumentCookie: Locale 선호를 쿠키로 고정(SSR-safe 가드 포함)
	document.cookie = buildLocaleCookieString(locale, options);
}

export function getLocaleFromUrl(url: URL): Locale {
	// Paraglide 기본 URL 패턴( /:locale/* ) 규칙과 동일하게 맞춤:
	// - 첫 세그먼트가 locale이면 해당 locale
	// - 아니면 baseLocale (URL이 항상 우선권을 가짐)
	const first = url.pathname.split('/').filter(Boolean)[0];
	if (first && isLocale(first)) return first as Locale;
	return baseLocale;
}

function deLocalizeUrlFully(url: URL): URL {
	let current = new URL(url);
	for (let i = 0; i < 4; i++) {
		const first = current.pathname.split('/').filter(Boolean)[0];
		if (!first || !isLocale(first)) break;
		current = deLocalizeUrl(current);
	}
	return current;
}

export function buildLocalizedUrl(url: URL, targetLocale: Locale): URL {
	// prefix가 이미 들어있는 경우(또는 /ko/ko 같은 오염)에도 안전하게 base로 내린 뒤 localize
	const baseUrl = deLocalizeUrlFully(url);
	const localized = localizeUrl(baseUrl, { locale: targetLocale });
	localized.search = baseUrl.search;
	localized.hash = baseUrl.hash;
	return localized;
}

export type LocaleInfo = {
	locale: Locale;
	selfName: string;
	englishName: string;
	dir: Direction;
};

function safeDisplayName(displayLocale: string, targetLocale: string): string | null {
	const DisplayNames = Intl.DisplayNames as
		| (new (
				locales: ReadonlyArray<string>,
				options: { type: 'language' }
		  ) => Intl.DisplayNames)
		| undefined;

	if (!DisplayNames) return null;

	try {
		const dn = new DisplayNames([displayLocale], { type: 'language' });
		return dn.of(targetLocale) ?? null;
	} catch {
		return null;
	}
}

export function getLocaleInfo(locale: Locale): LocaleInfo {
	const selfName = safeDisplayName(locale, locale) ?? locale.toUpperCase();
	const englishName = safeDisplayName('en', locale) ?? locale.toUpperCase();

	return {
		locale,
		selfName,
		englishName,
		dir: getDirForLocale(locale)
	};
}
