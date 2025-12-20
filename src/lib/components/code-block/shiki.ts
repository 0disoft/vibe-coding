import type { BundledLanguage, BundledTheme, Highlighter } from 'shiki';

const INITIAL_LANGUAGES: BundledLanguage[] = [
	'typescript',
	'javascript',
	'json',
	'html',
	'css',
	'svelte',
	'bash',
	'markdown'
];

const THEMES: BundledTheme[] = ['catppuccin-mocha'];

const LANGUAGE_ALIASES: Record<string, BundledLanguage> = {
	ts: 'typescript',
	js: 'javascript',
	py: 'python',
	rs: 'rust',
	yml: 'yaml',
	md: 'markdown',
	toml: 'toml',
	json: 'json',
	jsonc: 'jsonc',
	html: 'html',
	css: 'css',
	scss: 'scss',
	svelte: 'svelte',
	astro: 'astro',
	jsx: 'jsx',
	tsx: 'tsx',
	sh: 'bash',
	bash: 'bash',
	shell: 'bash',
	sql: 'sql',
	c: 'c',
	cpp: 'cpp',
	'c++': 'cpp',
	go: 'go',
	java: 'java',
	zig: 'zig',
	asm: 'asm',
	julia: 'julia',
	elixir: 'elixir',
	gleam: 'gleam'
};

const loadedLanguages = new Set<BundledLanguage>(INITIAL_LANGUAGES);
const languageInFlight = new Map<BundledLanguage, Promise<void>>();
let highlighterPromise: Promise<Highlighter> | null = null;

async function createSingletonHighlighter(): Promise<Highlighter> {
	const { createHighlighter } = await import('shiki');
	return createHighlighter({
		themes: THEMES,
		langs: INITIAL_LANGUAGES
	});
}

async function getHighlighter(): Promise<Highlighter> {
	if (!highlighterPromise) {
		highlighterPromise = createSingletonHighlighter().catch((error) => {
			highlighterPromise = null;
			throw error;
		});
	}
	return highlighterPromise;
}

async function ensureLanguage(highlighter: Highlighter, lang: BundledLanguage): Promise<void> {
	if (loadedLanguages.has(lang)) return;

	const existing = languageInFlight.get(lang);
	if (existing) return existing;

	const inFlight = highlighter
		.loadLanguage(lang)
		.then(() => {
			loadedLanguages.add(lang);
		})
		.finally(() => {
			languageInFlight.delete(lang);
		});

	languageInFlight.set(lang, inFlight);
	return inFlight;
}

export async function getHighlighterForLanguage(lang: BundledLanguage): Promise<Highlighter> {
	const highlighter = await getHighlighter();
	await ensureLanguage(highlighter, lang);
	return highlighter;
}

export async function resolveLanguageOrText(
	input: string | undefined | null
): Promise<BundledLanguage | 'text'> {
	const raw = (input ?? '').trim().toLowerCase();
	if (!raw) return 'text';

	const normalized = LANGUAGE_ALIASES[raw] ?? raw;
	const { bundledLanguages } = await import('shiki');

	return normalized in bundledLanguages ? (normalized as BundledLanguage) : 'text';
}
