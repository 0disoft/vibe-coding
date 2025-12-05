import presetTypography from '@unocss/preset-typography';
import presetWind4 from '@unocss/preset-wind4';
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  transformerVariantGroup,
} from 'unocss';


export default defineConfig({
  presets: [
    presetWind4({
      preflights: {
        reset: true,
        theme: { mode: 'on-demand' },
      },
    }),
    presetAttributify(),
    presetIcons({
      collections: {
        lucide: () =>
          import('@iconify-json/lucide/icons.json').then(m => m.default),
      },
      scale: 1.2,
      cdn: 'https://esm.sh/',
    }),
    presetTypography(),
  ],
  theme: {
    colors: {
      background: 'oklch(var(--background) / <alpha-value>)',
      foreground: 'oklch(var(--foreground) / <alpha-value>)',

      primary: 'oklch(var(--primary) / <alpha-value>)',
      'primary-foreground': 'oklch(var(--primary-foreground) / <alpha-value>)',

      secondary: 'oklch(var(--secondary) / <alpha-value>)',
      'secondary-foreground': 'oklch(var(--secondary-foreground) / <alpha-value>)',

      muted: 'oklch(var(--muted) / <alpha-value>)',
      'muted-foreground': 'oklch(var(--muted-foreground) / <alpha-value>)',

      destructive: 'oklch(var(--destructive) / <alpha-value>)',
      'destructive-foreground': 'oklch(var(--destructive-foreground) / <alpha-value>)',

      success: 'oklch(var(--success) / <alpha-value>)',
      'success-foreground': 'oklch(var(--success-foreground) / <alpha-value>)',

      warning: 'oklch(var(--warning) / <alpha-value>)',
      'warning-foreground': 'oklch(var(--warning-foreground) / <alpha-value>)',

      border: 'oklch(var(--border) / <alpha-value>)',
      input: 'oklch(var(--input) / <alpha-value>)',
      ring: 'oklch(var(--ring) / <alpha-value>)',
    }
  },
  transformers: [
    transformerVariantGroup(),
  ],
});
