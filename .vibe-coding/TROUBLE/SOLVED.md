# SOLVED ISSUES ARCHIVE

프로젝트 진행 중 발생했던 문제들과 검증된 해결책을 모아둔 데이터베이스입니다.
같은 문제가 발생하면 이 문서를 가장 먼저 참조하십시오.

---

## [SvelteKit / Bun]

### 1. Legacy CLI Deprecation (2025-12-05)

- **증상:** `bun create svelte@latest` 실행 시 `'npm create svelte' has been replaced with 'npx sv create'` 메시지가 뜨며 설치가 진행되지 않음.
- **원인:** Svelte 공식 CLI가 `create-svelte`에서 `sv`로 변경됨. Bun의 `create` 명령어는 구버전 패키지를 참조하고 있음.
- **해결:** 구버전 명령어 대신 `bun x sv create ./` (또는 `npx sv create ./`) 명령어를 사용하여 프로젝트를 생성해야 함.

---

## [UnoCSS / preset-wind4]

### 1. OKLCH CSS 변수 색상이 적용 안 됨 (2025-12-06)

- **증상:** `app.css`에 OKLCH 형식으로 CSS 변수(`--primary: 65% 0.18 155;`)를 정의하고, `uno.config.ts`의 `theme.colors`에서 `oklch(var(--primary))`로 참조했으나 색상이 전혀 적용되지 않음. 흰색/검은색만 표시됨.

- **시도했으나 실패한 방법들:**
  1. `oklch(var(--name) / <alpha-value>)` 문자열 형태 → 작동 안 함
  2. 함수 형태 `({ alpha }) => oklch(...)` → 작동 안 함
  3. `var(--color-name)` 형태 → 작동 안 함

- **원인:** `preset-wind4`의 `theme.colors`는 OKLCH CSS 변수를 포함한 문자열을 제대로 파싱하지 못함. 내부적으로 색상 값을 다른 방식으로 처리하기 때문.

- **해결:** `theme.colors` 대신 **커스텀 `rules`**로 유틸리티 클래스를 직접 정의:

```typescript
// uno.config.ts
const semanticColors = ['primary', 'background', 'foreground', ...] as const;

const colorRules: [RegExp, (match: RegExpMatchArray) => Record<string, string>][] = [];

for (const color of semanticColors) {
  // bg-{color}, bg-{color}/50 지원
  colorRules.push([
    new RegExp(`^bg-${color}(?:\\/(\\d+))?$`),
    ([, opacity]) => ({
      'background-color': opacity
        ? `oklch(var(--${color}) / ${Number(opacity) / 100})`
        : `oklch(var(--${color}))`,
    }),
  ]);
  // text-{color}, border-{color}, ring-{color}도 동일하게 추가
}

export default defineConfig({
  // theme.colors 사용하지 않음!
  rules: colorRules,
  // ...
});
```

- **핵심 포인트:**
  - `preset-wind4`에서 OKLCH CSS 변수 기반 시맨틱 색상을 쓰려면 **rules로 직접 정의**해야 함
  - opacity modifier(`/50`)도 rules에서 직접 파싱해서 처리해야 함
  - `app.css`의 CSS 변수 형식은 그대로 유지: `--primary: 65% 0.18 155;`
