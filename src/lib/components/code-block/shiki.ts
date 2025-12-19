import type { BundledLanguage, BundledTheme, Highlighter } from "shiki";

const INITIAL_LANGUAGES: BundledLanguage[] = [
  "typescript",
  "javascript",
  "json",
  "html",
  "css",
  "svelte",
  "bash",
  "markdown",
];

const THEMES: BundledTheme[] = ["catppuccin-mocha"];

const loadedLanguages = new Set<string>();
let highlighterPromise: Promise<Highlighter> | null = null;

async function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    const { createHighlighter } = await import("shiki");
    highlighterPromise = createHighlighter({
      themes: THEMES,
      langs: INITIAL_LANGUAGES,
    });
    INITIAL_LANGUAGES.forEach((lang) => {
      loadedLanguages.add(lang);
    });
  }
  return highlighterPromise;
}

export async function getHighlighterForLanguage(
  lang: BundledLanguage,
): Promise<Highlighter> {
  const highlighter = await getHighlighter();
  if (!loadedLanguages.has(lang)) {
    await highlighter.loadLanguage(lang);
    loadedLanguages.add(lang);
  }
  return highlighter;
}

