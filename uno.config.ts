import presetTypography from '@unocss/preset-typography';
import presetWebFonts from '@unocss/preset-web-fonts';
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
    presetWebFonts({
      provider: 'google',
      fonts: {
        // UI 전반에서 쓸 기본 글꼴
        sans: [
          'Inter:400,500,600,700', // 라틴
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          // 아래는 CJK·한글 시스템 폰트 후보들
          '"Apple SD Gothic Neo"',
          '"Noto Sans CJK KR"',
          '"Malgun Gothic"',
          '"Noto Sans JP"',
          '"Noto Sans SC"',
          'sans-serif',
        ],

        // 코드, 숫자 많이 나오는 곳
        mono: [
          'JetBrains Mono:400,600',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace',
        ],
      },
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

      card: 'oklch(var(--card) / <alpha-value>)',
      'card-foreground': 'oklch(var(--card-foreground) / <alpha-value>)',

      popover: 'oklch(var(--popover) / <alpha-value>)',
      'popover-foreground': 'oklch(var(--popover-foreground) / <alpha-value>)',

      accent: 'oklch(var(--accent) / <alpha-value>)',
      'accent-foreground': 'oklch(var(--accent-foreground) / <alpha-value>)',

      border: 'oklch(var(--border) / <alpha-value>)',
      input: 'oklch(var(--input) / <alpha-value>)',
      ring: 'oklch(var(--ring) / <alpha-value>)',
    }
  },
  transformers: [
    transformerVariantGroup(),
  ],
});
