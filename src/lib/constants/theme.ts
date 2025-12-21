export const THEME_MODES = ['light', 'dark', 'system'] as const;
export type ThemeMode = (typeof THEME_MODES)[number];

export const THEME_PALETTES = ['airy-blue', 'misty-lavender', 'sage-breeze', 'cozy-coral'] as const;
export type ThemePalette = (typeof THEME_PALETTES)[number];

export const DEFAULT_THEME_MODE: ThemeMode = 'light';
export const DEFAULT_THEME_PALETTE: ThemePalette = 'airy-blue';
