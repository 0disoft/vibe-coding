import presetTypography from '@unocss/preset-typography';
import presetWind4 from '@unocss/preset-wind4';
import {
	defineConfig,
	presetAttributify,
	presetIcons,
	type Extractor,
	type Rule,
	transformerVariantGroup
} from 'unocss';

const dsLucideIconExtractor: Extractor = {
	name: 'ds-lucide-icon-props',
	order: 0,
	extract(code) {
		const tokens = new Set<string>();

		const add = (raw: string) => {
			const v = raw.trim();
			if (!v) return;
			if (v.startsWith('i-')) {
				tokens.add(v);
				return;
			}
			tokens.add(`i-lucide-${v}`);
		};

		// Component props -> icon classes
		for (const re of [
			/<DsIcon\b[^>]*\bname=["']([a-z0-9-]+)["']/g,
			/<DsInlineIcon\b[^>]*\bname=["']([a-z0-9-]+)["']/g,
			/<DsIconButton\b[^>]*\bicon=["']([a-z0-9-]+)["']/g,
			/<DsIconButton\b[^>]*\bcopiedIcon=["']([a-z0-9-]+)["']/g
		]) {
			let m: RegExpExecArray | null;
			while ((m = re.exec(code))) add(m[1]);
		}

		// Object literals / config -> icon names
		for (const re of [
			/\bicon\s*:\s*["']([a-z0-9-]+|i-[a-z0-9-]+)["']/g,
			/\bcopiedIcon\s*:\s*["']([a-z0-9-]+|i-[a-z0-9-]+)["']/g
		]) {
			let m: RegExpExecArray | null;
			while ((m = re.exec(code))) add(m[1]);
		}

		return Array.from(tokens);
	}
};

// 시맨틱 색상 이름들
// semanticColors에 이름을 추가/삭제할 때는 아래 semanticColorVarMap도 함께 유지보수할 것.
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
	'selected',
	'selected-foreground',
	'border',
	'input',
	'ring',
	'sidebar',
	'sidebar-foreground',
	'overlay'
] as const;

// UnoCSS 유틸(bg-*, text-* 등)은 이 맵을 통해 canonical 디자인 시스템 토큰(--color-*)을 참조합니다.
// 목적: "클래스 이름은 유지"하면서 "내부 참조 변수는 --color-*로 통일".
const semanticColorVarMap: Record<(typeof semanticColors)[number], string> = {
	background: '--color-background',
	foreground: '--color-text',
	card: '--color-surface',
	'card-foreground': '--color-on-surface',
	popover: '--color-surface',
	'popover-foreground': '--color-on-surface',
	primary: '--color-primary',
	'primary-foreground': '--color-on-primary',
	secondary: '--color-secondary',
	'secondary-foreground': '--color-on-secondary',
	muted: '--color-surface',
	'muted-foreground': '--color-text-muted',
	accent: '--color-accent',
	'accent-foreground': '--color-on-accent',
	link: '--color-link',
	'link-foreground': '--color-on-link',
	destructive: '--color-error',
	'destructive-foreground': '--color-on-error',
	success: '--color-success',
	'success-foreground': '--color-on-success',
	warning: '--color-warning',
	'warning-foreground': '--color-on-warning',
	selected: '--color-selected',
	'selected-foreground': '--color-on-selected',
	border: '--color-border',
	input: '--color-input',
	ring: '--focus-ring-color',
	sidebar: '--color-sidebar',
	'sidebar-foreground': '--color-on-sidebar',
	overlay: '--color-overlay'
};

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
		const cssVar = semanticColorVarMap[color];
		return alpha ? `oklch(var(${cssVar}) / ${alpha})` : `oklch(var(${cssVar}))`;
	};

	// bg-{color}, bg-{color}/50 형태 지원
	colorRules.push([
		new RegExp(`^bg-${color}(?:\\/(\\d+))?$`),
		([, opacity]) => ({
			'background-color': gradientColor(opacity)
		})
	]);

	// text-{color}, text-{color}/50 형태 지원
	colorRules.push([
		new RegExp(`^text-${color}(?:\\/(\\d+))?$`),
		([, opacity]) => ({
			color: gradientColor(opacity)
		})
	]);

	// border-{color}, border-{color}/50 형태 지원
	colorRules.push([
		new RegExp(`^border-${color}(?:\\/(\\d+))?$`),
		([, opacity]) => ({
			'border-color': gradientColor(opacity)
		})
	]);

	// ring-{color}, ring-{color}/50 형태 지원
	colorRules.push([
		new RegExp(`^ring-${color}(?:\\/(\\d+))?$`),
		([, opacity]) => ({
			'--un-ring-color': gradientColor(opacity)
		})
	]);

	// outline-{color}, outline-{color}/50 형태 지원
	colorRules.push([
		new RegExp(`^outline-${color}(?:\\/(\\d+))?$`),
		([, opacity]) => ({
			'outline-color': gradientColor(opacity)
		})
	]);

	// 그라디언트 from-/via-/to-
	colorRules.push([
		new RegExp(`^from-${color}(?:\\/(\\d+))?$`),
		([, opacity]) => ({
			'--un-gradient-from': gradientColor(opacity),
			'--un-gradient-stops': `var(--un-gradient-from), var(--un-gradient-to, ${gradientColor()})`
		})
	]);

	colorRules.push([
		new RegExp(`^via-${color}(?:\\/(\\d+))?$`),
		([, opacity]) => ({
			'--un-gradient-stops': `var(--un-gradient-from, ${gradientColor()}), ${gradientColor(opacity)}, var(--un-gradient-to, ${gradientColor()})`
		})
	]);

	colorRules.push([
		new RegExp(`^to-${color}(?:\\/(\\d+))?$`),
		([, opacity]) => ({
			'--un-gradient-to': gradientColor(opacity)
		})
	]);

	// 그림자 색상 shadow-{color}
	colorRules.push([
		new RegExp(`^shadow-${color}(?:\\/(\\d+))?$`),
		([, opacity]) => ({
			'--un-shadow-color': gradientColor(opacity),
			'box-shadow': `var(--un-shadow, 0 10px 15px -3px var(--un-shadow-color), 0 4px 6px -4px var(--un-shadow-color))`
		})
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
	// Tailwind 호환 타이포 유틸도 DS 토큰을 참조하도록 오버라이드
	// 목적: Docs/마케팅 영역에서 text-sm 같은 유틸을 써도 토큰 기반으로 일관성 유지
	[
		'text-xs',
		{
			'font-size': 'var(--font-size-xs)',
			'line-height': '1.4'
		}
	],
	[
		'text-sm',
		{
			'font-size': 'var(--font-size-sm)',
			'line-height': '1.4'
		}
	],
	[
		'text-base',
		{
			'font-size': 'var(--font-size-base)',
			'line-height': 'var(--line-height-body)'
		}
	],
	[
		'text-lg',
		{
			'font-size': 'var(--font-size-lg)',
			'line-height': 'var(--line-height-body)'
		}
	],
	[
		'text-xl',
		{
			'font-size': 'var(--font-size-xl)',
			'line-height': 'var(--line-height-heading)'
		}
	],
	[
		'text-2xl',
		{
			'font-size': 'var(--font-size-2xl)',
			'line-height': 'var(--line-height-heading)'
		}
	],
	[
		'text-3xl',
		{
			'font-size': 'var(--font-size-3xl)',
			'line-height': 'var(--line-height-heading)'
		}
	],
	[
		'text-4xl',
		{
			'font-size': 'var(--font-size-4xl)',
			'line-height': 'var(--line-height-heading)'
		}
	],
	[
		'text-body',
		{
			'font-size': 'var(--font-size-body)',
			'line-height': 'var(--line-height-body)'
		}
	],
	[
		'text-body-secondary',
		{
			'font-size': 'var(--font-size-body-secondary)',
			'line-height': 'var(--line-height-body)'
		}
	],
	[
		'text-comment',
		{
			'font-size': 'var(--font-size-comment)',
			'line-height': 'var(--line-height-body)'
		}
	],
	[
		'text-code',
		{
			'font-size': 'var(--font-size-code)',
			'line-height': '1.5'
		}
	],
	[
		'text-h1',
		{
			'font-size': 'var(--font-size-h1)',
			'line-height': 'var(--line-height-heading)'
		}
	],
	[
		'text-h2',
		{
			'font-size': 'var(--font-size-h2)',
			'line-height': 'var(--line-height-heading)'
		}
	],
	[
		'text-h3',
		{
			'font-size': 'var(--font-size-h3)',
			'line-height': 'var(--line-height-heading)'
		}
	],
	[
		'text-h4',
		{
			'font-size': 'var(--font-size-h4)',
			'line-height': 'var(--line-height-heading)'
		}
	],
	[
		'text-caption',
		{
			'font-size': 'var(--font-size-caption)',
			'line-height': '1.4'
		}
	],
	// 메뉴 폰트 크기 (3단계)
	[
		'text-menu-lg',
		{
			'font-size': 'var(--font-size-menu-lg)',
			'line-height': '1.4'
		}
	],
	[
		'text-menu',
		{
			'font-size': 'var(--font-size-menu)',
			'line-height': '1.4'
		}
	],
	[
		'text-menu-sm',
		{
			'font-size': 'var(--font-size-menu-sm)',
			'line-height': '1.4'
		}
	],
	// 로고/브랜드용
	[
		'text-logo',
		{
			'font-size': 'var(--font-size-logo)',
			'line-height': '1.2'
		}
	],
	[
		'text-brand',
		{
			'font-size': 'var(--font-size-brand)',
			'line-height': '1.3'
		}
	],
	[
		'text-xs-resp',
		{
			'font-size': 'var(--font-size-xs-resp)',
			'line-height': '1.4'
		}
	],
	// 버튼용
	[
		'text-btn',
		{
			'font-size': 'var(--font-size-btn)',
			'line-height': '1.4'
		}
	],
	[
		'text-btn-sm',
		{
			'font-size': 'var(--font-size-btn-sm)',
			'line-height': '1.4'
		}
	],
	[
		'text-btn-lg',
		{
			'font-size': 'var(--font-size-btn-lg)',
			'line-height': '1.4'
		}
	],
	// 라벨/폼 요소용
	[
		'text-label',
		{
			'font-size': 'var(--font-size-label)',
			'line-height': '1.4'
		}
	],
	[
		'text-helper',
		{
			'font-size': 'var(--font-size-helper)',
			'line-height': '1.4'
		}
	],
	[
		'text-placeholder',
		{
			'font-size': 'var(--font-size-placeholder)',
			'line-height': '1.4'
		}
	],
	// 배지/태그용
	[
		'text-badge',
		{
			'font-size': 'var(--font-size-badge)',
			'line-height': '1.2'
		}
	],
	[
		'text-tag',
		{
			'font-size': 'var(--font-size-tag)',
			'line-height': '1.3'
		}
	],
	// 기타 UI
	[
		'text-tooltip',
		{
			'font-size': 'var(--font-size-tooltip)',
			'line-height': '1.2'
		}
	],
	[
		'text-toast',
		{
			'font-size': 'var(--font-size-toast)',
			'line-height': '1.4'
		}
	],
	[
		'text-breadcrumb',
		{
			'font-size': 'var(--font-size-breadcrumb)',
			'line-height': '1.4'
		}
	],
	// 인라인 코드/숫자/타임스탬프
	[
		'text-inline-code',
		{
			'font-size': 'var(--font-size-inline-code)',
			'line-height': '1.5'
		}
	],
	[
		'text-stat',
		{
			'font-size': 'var(--font-size-stat)',
			'line-height': '1.2'
		}
	],
	[
		'text-price',
		{
			'font-size': 'var(--font-size-price)',
			'line-height': '1.3'
		}
	],
	[
		'text-timestamp',
		{
			'font-size': 'var(--font-size-timestamp)',
			'line-height': '1.4'
		}
	]
];

export default defineConfig({
	presets: [
		presetWind4({
			reset: true
			// ⚠️ 이 템플릿에서는 UnoCSS의 dark: 유틸리티를 사용하지 않음.
			// 다크 모드는 data-theme 속성과 OKLCH 시맨틱 토큰(bg-background, text-foreground 등)으로만 처리.
			// 따라서 dark:bg-black 같은 클래스는 쓰지 말 것.
		}),
		presetAttributify(),
		presetIcons({
			collections: {
				lucide: () => import('@iconify-json/lucide/icons.json').then((m) => m.default)
			},
			scale: 1.2,
			cdn: 'https://esm.sh/'
		}),
		// prose 클래스 제공 (블로그, 문서 등 긴 글용). UI에는 typographyRules 유틸 사용.
		presetTypography()
	],
	theme: {
		fontFamily: {
			sans: 'var(--font-family-base)',
			mono: 'var(--font-family-mono)'
		},
		fontSize: {
			xs: ['var(--font-size-xs)', { lineHeight: '1.4' }],
			sm: ['var(--font-size-sm)', { lineHeight: '1.4' }],
			base: ['var(--font-size-base)', { lineHeight: '1.5' }],
			lg: ['var(--font-size-lg)', { lineHeight: '1.4' }],
			xl: ['var(--font-size-xl)', { lineHeight: '1.3' }],
			'2xl': ['var(--font-size-2xl)', { lineHeight: '1.2' }],
			'3xl': ['var(--font-size-3xl)', { lineHeight: '1.2' }],
			'4xl': ['var(--font-size-4xl)', { lineHeight: '1.1' }]
		}
	},
	// 커스텀 룰로 시맨틱 색상 유틸리티 직접 정의
	rules: [...colorRules, ...typographyRules],
	extractors: [dsLucideIconExtractor],
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
			`shadow-${c}`
		]),
		// 구조적 기본값
		'bg-card',
		'text-card-foreground',
		'bg-popover',
		'text-popover-foreground',
		'bg-muted',
		'text-muted-foreground',
		'border-border'
	],
	transformers: [transformerVariantGroup()]
});
