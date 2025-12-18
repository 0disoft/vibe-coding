export const THEME_MODES = ['light', 'dark', 'system'] as const;
export type ThemeMode = (typeof THEME_MODES)[number];

export const THEME_PALETTES = ['classic', 'paper', 'forest', 'nordic'] as const;
export type ThemePalette = (typeof THEME_PALETTES)[number];

export const DEFAULT_THEME_MODE: ThemeMode = 'system';
export const DEFAULT_THEME_PALETTE: ThemePalette = 'classic';

export function isThemeMode(value: string | null | undefined): value is ThemeMode {
	return THEME_MODES.includes(value as ThemeMode);
}

export function isThemePalette(value: string | null | undefined): value is ThemePalette {
	return THEME_PALETTES.includes(value as ThemePalette);
}

export type ResolvedTheme = 'light' | 'dark';

export function resolveThemeFromMode(mode: ThemeMode, prefersDark: boolean): ResolvedTheme {
	if (mode === 'dark') return 'dark';
	if (mode === 'light') return 'light';
	return prefersDark ? 'dark' : 'light';
}
