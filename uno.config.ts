import presetTypography from '@unocss/preset-typography';
import presetWebFonts from '@unocss/preset-web-fonts';
import presetWind4 from '@unocss/preset-wind4';
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  transformerVariantGroup,
  type Rule,
} from 'unocss';

// 시맨틱 색상 이름들
const semanticColors = [
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
  'link',
  'link-foreground',
  'destructive',
  'destructive-foreground',
  'success',
  'success-foreground',
  'warning',
  'warning-foreground',
  'border',
  'input',
  'ring',
  'sidebar',
  'sidebar-foreground',
  'overlay',
] as const;

// 커스텀 룰 생성: bg-primary, text-primary 등
// preset-wind4의 기본 색상 시스템을 우회하여 직접 OKLCH CSS 변수 사용
const colorRules: Rule<object>[] = [];

const toAlpha = (opacity?: string) => {
  if (!opacity) return '';
  const n = Number(opacity);
  if (Number.isNaN(n)) return '';
  const clamped = Math.min(100, Math.max(0, n));
  return String(clamped / 100);
};

for (const color of semanticColors) {
  // bg-{color}, bg-{color}/50 형태 지원
  colorRules.push([
    new RegExp(`^bg-${color}(?:\\/(\\d+))?$`),
    ([, opacity]) => ({
      'background-color': toAlpha(opacity)
        ? `oklch(var(--${color}) / ${toAlpha(opacity)})`
        : `oklch(var(--${color}))`,
    }),
  ]);

  // text-{color}, text-{color}/50 형태 지원
  colorRules.push([
    new RegExp(`^text-${color}(?:\\/(\\d+))?$`),
    ([, opacity]) => ({
      color: toAlpha(opacity)
        ? `oklch(var(--${color}) / ${toAlpha(opacity)})`
        : `oklch(var(--${color}))`,
    }),
  ]);

  // border-{color}, border-{color}/50 형태 지원
  colorRules.push([
    new RegExp(`^border-${color}(?:\\/(\\d+))?$`),
    ([, opacity]) => ({
      'border-color': toAlpha(opacity)
        ? `oklch(var(--${color}) / ${toAlpha(opacity)})`
        : `oklch(var(--${color}))`,
    }),
  ]);

  // ring-{color}, ring-{color}/50 형태 지원
  colorRules.push([
    new RegExp(`^ring-${color}(?:\\/(\\d+))?$`),
    ([, opacity]) => ({
      '--un-ring-color': toAlpha(opacity)
        ? `oklch(var(--${color}) / ${toAlpha(opacity)})`
        : `oklch(var(--${color}))`,
    }),
  ]);

  // outline-{color}, outline-{color}/50 형태 지원
  colorRules.push([
    new RegExp(`^outline-${color}(?:\\/(\\d+))?$`),
    ([, opacity]) => ({
      'outline-color': toAlpha(opacity)
        ? `oklch(var(--${color}) / ${toAlpha(opacity)})`
        : `oklch(var(--${color}))`,
    }),
  ]);
}

const typographyRules: Rule<object>[] = [
  [
    'text-body',
    {
      'font-size': 'var(--fs-body)',
      'line-height': 'var(--lh-body)',
    },
  ],
  [
    'text-body-secondary',
    {
      'font-size': 'var(--fs-body-secondary)',
      'line-height': 'var(--lh-body)',
    },
  ],
  [
    'text-comment',
    {
      'font-size': 'var(--fs-comment)',
      'line-height': 'var(--lh-body)',
    },
  ],
  [
    'text-code',
    {
      'font-size': 'var(--fs-code)',
      'line-height': '1.5',
    },
  ],
  [
    'text-h1',
    {
      'font-size': 'var(--fs-h1)',
      'line-height': 'var(--lh-heading)',
    },
  ],
  [
    'text-h2',
    {
      'font-size': 'var(--fs-h2)',
      'line-height': 'var(--lh-heading)',
    },
  ],
  [
    'text-h3',
    {
      'font-size': 'var(--fs-h3)',
      'line-height': 'var(--lh-heading)',
    },
  ],
  [
    'text-caption',
    {
      'font-size': 'var(--fs-caption)',
      'line-height': '1.4',
    },
  ],
];

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
  // 커스텀 룰로 시맨틱 색상 유틸리티 직접 정의
  rules: [...colorRules, ...typographyRules],
  transformers: [transformerVariantGroup()],
});
