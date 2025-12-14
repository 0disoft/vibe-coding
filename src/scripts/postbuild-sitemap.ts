import { spawnSync } from 'node:child_process';
import { statSync } from 'node:fs';

import { site } from '../lib/constants/site';

type OriginResolution =
	| { ok: true; origin: string; hostname: string }
	| { ok: false; reason: 'missing' | 'invalid' | 'not_http' };

function resolveOrigin(raw: string): OriginResolution {
	const trimmed = raw.trim();
	if (!trimmed) return { ok: false, reason: 'missing' };

	let url: URL;
	try {
		url = new URL(trimmed);
	} catch {
		return { ok: false, reason: 'invalid' };
	}

	if (url.protocol !== 'http:' && url.protocol !== 'https:') {
		return { ok: false, reason: 'not_http' };
	}

	// path/query/hash가 포함되어 있어도 origin만 사용 (svelte-sitemap은 domain만 필요)
	return { ok: true, origin: url.origin, hostname: url.hostname };
}

function isExistingDirectory(path: string): boolean {
	try {
		return statSync(path).isDirectory();
	} catch {
		return false;
	}
}

function isPlaceholderHostname(hostname: string): boolean {
	const h = hostname.toLowerCase();
	if (h === 'localhost' || h === '127.0.0.1' || h === '0.0.0.0') return true;
	return (
		h === 'yoursite.com' ||
		h.endsWith('.yoursite.com') ||
		h === 'example.com' ||
		h.endsWith('.example.com')
	);
}

function main(): void {
	const strict = process.env.SITEMAP_STRICT === '1';

	const outDir = (process.env.SITEMAP_OUT_DIR ?? 'build').trim() || 'build';
	if (!isExistingDirectory(outDir)) {
		console.warn(`Skipping sitemap (no ${outDir}/ folder). Set SITEMAP_OUT_DIR if needed.`);
		if (strict) process.exitCode = 1;
		return;
	}

	const envOrigin = process.env.PUBLIC_SITE_ORIGIN ?? process.env.PUBLIC_SITE_URL ?? '';
	const resolved = resolveOrigin(envOrigin || site.origin);

	if (!resolved.ok) {
		const msg =
			resolved.reason === 'missing'
				? 'Skipping sitemap (missing origin). Set PUBLIC_SITE_ORIGIN to enable.'
				: resolved.reason === 'not_http'
					? 'Skipping sitemap (invalid origin). Must start with http(s)://'
					: 'Skipping sitemap (invalid origin). Must be a valid absolute URL, e.g. https://myapp.com';
		console.warn(msg);
		if (strict) process.exitCode = 1;
		return;
	}

	if (isPlaceholderHostname(resolved.hostname)) {
		console.warn(
			`Skipping sitemap (placeholder origin: ${resolved.origin}). Set PUBLIC_SITE_ORIGIN to enable.`
		);
		if (strict) process.exitCode = 1;
		return;
	}

	// bun으로 실행되는 스크립트이므로 execPath를 쓰는 것이 PATH/shell 의존도가 가장 낮습니다.
	const bunBin = process.execPath || 'bun';
	const r = spawnSync(
		bunBin,
		['x', 'svelte-sitemap', '--out-dir', outDir, '--domain', resolved.origin],
		{ stdio: 'inherit' }
	);
	if (r.error) {
		console.error('Failed to run svelte-sitemap:', r.error);
		process.exit(1);
	}
	process.exit(r.status ?? 1);
}

main();
