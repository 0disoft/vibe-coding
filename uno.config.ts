import presetTypography from '@unocss/preset-typography';
import presetWebFonts from '@unocss/preset-web-fonts';
import presetWind4 from '@unocss/preset-wind4';
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  transformerVariantGroup,
} from 'unocss';

// 반복되는 OKLCH 색상 정의를 자동화하기 위한 헬퍼
// CSS 변수명과 UnoCSS 유틸리티 이름을 매핑
const colors = [
  'background',
  'foreground',
  'card',
  'card-foreground',
  'popover',
  'popover-foreground',
  'primary',
  'primary-foreground',
  'secondary',
  'secondary-foreground',
  'muted',
  'muted-foreground',
  'accent',
  'accent-foreground',
  'destructive',
  'destructive-foreground',
  'success',
  'success-foreground',
  'warning',
  'warning-foreground',
  'border',
  'input',
  'ring',
] as const;

// 테마 색상 객체 생성
const themeColors = colors.reduce((acc, name) => {
  acc[name] = `oklch(var(--${name}) / <alpha-value>)`;
  return acc;
}, {} as Record<string, string>);

export default defineConfig({
  presets: [
    presetWind4({
      reset: true,
    }),
    presetAttributify(),
    presetIcons({
      collections: {
        lucide: () =>
          import('@iconify-json/lucide/icons.json').then((m) => m.default),
      },
      scale: 1.2,
      cdn: 'https://esm.sh/',
    }),
    presetWebFonts({
      provider: 'google',
      themeKey: 'font',
      fonts: {
        sans: 'Inter:400,500,600,700',
        mono: 'JetBrains Mono:400,600',
      },
    }),
    presetTypography(),
  ],
  theme: {
    colors: themeColors,
  },
  transformers: [transformerVariantGroup()],
});