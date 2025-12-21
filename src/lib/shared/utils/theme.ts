import {
	DEFAULT_THEME_MODE,
	DEFAULT_THEME_PALETTE,
	THEME_MODES,
	THEME_PALETTES,
	type ThemeMode,
	type ThemePalette
} from '$lib/constants/theme';

export { DEFAULT_THEME_MODE, DEFAULT_THEME_PALETTE, THEME_MODES, THEME_PALETTES };
export type { ThemeMode, ThemePalette };

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
