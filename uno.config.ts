import presetTypography from '@unocss/preset-typography';
import presetWind4 from '@unocss/preset-wind4';
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  transformerVariantGroup,
  type Rule,
} from 'unocss';

// 시맨틱 색상 이름들
// semanticColors에 이름을 추가/삭제할 때는 src/app.css의 대응 CSS 변수(--{color})도 함께 유지보수할 것.
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
  const gradientColor = (opacity?: string) => {
    const alpha = toAlpha(opacity);
    return alpha ? `oklch(var(--${color}) / ${alpha})` : `oklch(var(--${color}))`;
  };

  // bg-{color}, bg-{color}/50 형태 지원
  colorRules.push([
    new RegExp(`^bg-${color}(?:\\/(\\d+))?$`),
    ([, opacity]) => ({
      'background-color': gradientColor(opacity),
    }),
  ]);

  // text-{color}, text-{color}/50 형태 지원
  colorRules.push([
    new RegExp(`^text-${color}(?:\\/(\\d+))?$`),
    ([, opacity]) => ({
      color: gradientColor(opacity),
    }),
  ]);

  // border-{color}, border-{color}/50 형태 지원
  colorRules.push([
    new RegExp(`^border-${color}(?:\\/(\\d+))?$`),
    ([, opacity]) => ({
      'border-color': gradientColor(opacity),
    }),
  ]);

  // ring-{color}, ring-{color}/50 형태 지원
  colorRules.push([
    new RegExp(`^ring-${color}(?:\\/(\\d+))?$`),
    ([, opacity]) => ({
      '--un-ring-color': gradientColor(opacity),
    }),
  ]);

  // outline-{color}, outline-{color}/50 형태 지원
  colorRules.push([
    new RegExp(`^outline-${color}(?:\\/(\\d+))?$`),
    ([, opacity]) => ({
      'outline-color': gradientColor(opacity),
    }),
  ]);

  // 그라디언트 from-/via-/to-
  colorRules.push([
    new RegExp(`^from-${color}(?:\\/(\\d+))?$`),
    ([, opacity]) => ({
      '--un-gradient-from': gradientColor(opacity),
      '--un-gradient-stops': `var(--un-gradient-from), var(--un-gradient-to, ${gradientColor()})`,
    }),
  ]);

  colorRules.push([
    new RegExp(`^via-${color}(?:\\/(\\d+))?$`),
    ([, opacity]) => ({
      '--un-gradient-stops': `var(--un-gradient-from, ${gradientColor()}), ${gradientColor(opacity)}, var(--un-gradient-to, ${gradientColor()})`,
    }),
  ]);

  colorRules.push([
    new RegExp(`^to-${color}(?:\\/(\\d+))?$`),
    ([, opacity]) => ({
      '--un-gradient-to': gradientColor(opacity),
    }),
  ]);

  // 그림자 색상 shadow-{color}
  colorRules.push([
    new RegExp(`^shadow-${color}(?:\\/(\\d+))?$`),
    ([, opacity]) => ({
      '--un-shadow-color': gradientColor(opacity),
      'box-shadow': `var(--un-shadow, 0 10px 15px -3px var(--un-shadow-color), 0 4px 6px -4px var(--un-shadow-color))`,
    }),
  ]);
}

/**
 * 타이포그래피 유틸리티 룰 (UI용)
 * 
 * 사용 철학:
 * - 일반 UI 컴포넌트(버튼, 카드, 네비게이션 등)는 이 유틸리티 사용 (text-body, text-h1 등)
 * - 긴 글(블로그, 문서)은 presetTypography의 prose 클래스 사용
 * - prose 영역에서 OKLCH 토큰 색상이 필요하면 app.css에서 .prose 오버라이드 추가
 */
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
      // ⚠️ 이 템플릿에서는 UnoCSS의 dark: 유틸리티를 사용하지 않음.
      // 다크 모드는 data-theme 속성과 OKLCH 시맨틱 토큰(bg-background, text-foreground 등)으로만 처리.
      // 따라서 dark:bg-black 같은 클래스는 쓰지 말 것.
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
    // prose 클래스 제공 (블로그, 문서 등 긴 글용). UI에는 typographyRules 유틸 사용.
    presetTypography(),
  ],
  theme: {
    fontFamily: {
      sans: 'var(--font-sans)',
      mono: 'var(--font-mono)',
    },
  },
  // 커스텀 룰로 시맨틱 색상 유틸리티 직접 정의
  rules: [...colorRules, ...typographyRules],
  // 동적 클래스 사용 대비(예: CMS에서 bg-primary 문자열 주입)
  safelist: [
    ...semanticColors.flatMap((c) => [
      `bg-${c}`,
      `text-${c}`,
      `border-${c}`,
      `ring-${c}`,
      `outline-${c}`,
      `from-${c}`,
      `via-${c}`,
      `to-${c}`,
      `shadow-${c}`,
    ]),
    // 구조적 기본값
    'bg-card',
    'text-card-foreground',
    'bg-popover',
    'text-popover-foreground',
    'bg-muted',
    'text-muted-foreground',
    'border-border',
  ],
  transformers: [transformerVariantGroup()],
});
