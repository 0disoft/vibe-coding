import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetWind4,
  transformerVariantGroup,
} from 'unocss';

export default defineConfig({
  presets: [
    presetWind4(),
    presetAttributify(),
    presetIcons({
      collections: {
        lucide: () =>
          import('@iconify-json/lucide/icons.json').then(m => m.default),
      },
      scale: 1.2,
      cdn: 'https://esm.sh/',
    }),
  ],
  theme: {
    colors: {
      background: 'oklch(var(--background) / <alpha-value>)',
      foreground: 'oklch(var(--foreground) / <alpha-value>)',
      primary: 'oklch(var(--primary) / <alpha-value>)',
    }
  },
  transformers: [
    transformerVariantGroup(),
  ],
});
