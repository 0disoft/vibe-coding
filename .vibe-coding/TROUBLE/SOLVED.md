# SOLVED ISSUES ARCHIVE

프로젝트 진행 중 발생했던 문제들과 검증된 해결책을 모아둔 데이터베이스입니다.
같은 문제가 발생하면 이 문서를 가장 먼저 참조하십시오.

> **📝 작성 가이드**
> 이슈를 기록할 때는 특정 상황에 국한되지 않도록 **일반화된 증상과 원인**으로 다듬어서 작성하십시오. 이를 통해 향후 유사한 문제 발생 시 범용적인 데이터베이스로 활용될 수 있도록 합니다.

---

## [SvelteKit / Bun / Package Managers]

### 1. 패키지 매니저별 SvelteKit 프로젝트 생성 오류 (CLI 불일치)

- **증상:** `bun create svelte@latest` 또는 `npm create svelte@latest` 실행 시 `'npm create svelte' has been replaced with 'npx sv create'` 메시지가 뜨며 설치가 진행되지 않음.
- **원인:** Svelte 공식 CLI가 `create-svelte`에서 `sv`로 변경되었으나, 패키지 매니저의 `create` 명령어는 구버전 패키지를 참조함.
- **해결:** 새로운 `sv` CLI 명령어 사용:

```bash
# Bun
bun x sv create ./

# npm
npx sv create ./

# pnpm
pnpm dlx sv create ./
```

---

## [UnoCSS / preset-wind4]

### 1. UnoCSS와 CSS 변수(OKLCH/HSL) 연동 시 색상 미적용 해결

- **증상:** CSS 파일에 색상 변수(`--primary: 65% 0.18 155;`)를 정의하고, `uno.config.ts`의 `theme.colors`에서 참조했으나 색상이 적용되지 않음.
- **원인:** `preset-wind4`의 `theme.colors`가 CSS 변수를 포함한 복잡한 색상 문자열(OKLCH, HSL 등)을 파싱하지 못함.
- **해결:** `theme.colors` 대신 **커스텀 `rules`**로 유틸리티 클래스를 직접 정의 (상세 코드 생략, 원본 참조).
- **적용 시점:** `preset-wind4` 하에서 CSS 변수 기반의 동적 테마 색상을 구현할 때.

---

## [Svelte 5 / TypeScript]

### 1. Svelte 컴포넌트 내 코드 예시 표시 시 파싱 오류 방지

- **증상:** 코드 예시나 문서를 Svelte 컴포넌트에 표시할 때 템플릿 리터럴(`` `${variable}` ``) 또는 중괄호(`{}`)가 Svelte 표현식으로 해석되어 타입 오류 발생.
- **해결 방법들:**
  1. 전체 배틱 문자열을 `<script>` 내 변수로 분리하여 `{variable}`로 사용
  2. HTML 엔티티(`&#123;`, `&#125;`, `&#96;`)로 이스케이프
  3. `{@html ...}` 사용 (XSS 주의 필요)
- **적용 시점:** 코드 하이라이팅, 기술 문서화, 튜토리얼 컴포넌트 작성 시.

### 2. Svelte 5 마이그레이션: Deprecated Slot을 Snippet으로 전환

- **증상:** `<slot name="...">` 사용 시 `slot_element_deprecated` 경고 발생.
- **원인:** Svelte 5에서 `<slot>` 문법이 deprecated되고 Snippet 패턴(`{#snippet ...}`)으로 대체됨.
- **해결 Pattern:**
  - **정의:** `interface Props { slotName?: Snippet; }` & `{@render slotName()}`
  - **사용:** `<Component>{#snippet slotName()}...{/snippet}</Component>`
- **적용 시점:** Svelte 5 프로젝트에서 컴포넌트 슬롯을 구현할 때.

### 3. TypeScript: Svelte 반복문 내 리터럴 타입 추론 좁히기 (`as const`)

- **증상:** `{#each ...}` 루프 변수가 넓은 타입(`number`, `string`)으로 추론되어, 좁은 리터럴 타입을 요구하는 곳에서 오류 발생.
- **해결:** `{#each [...] as const as item}` 구문 사용.
- **적용 시점:** 루프 변수를 좁은 타입(`1|2|3`, `'sm'|'md'`)을 요구하는 함수/컴포넌트에 전달할 때.

### 4. Svelte 5: $app/stores 'page' Deprecated 해결 ($app/state)

- **증상:** `warnings: 'page' is deprecated.` 및 `Use page from $app/state instead` 메시지.
- **원인:** Svelte 5 (Runes) 도입으로 인해 SvelteKit의 `$app/stores`가 점진적으로 레거시 처리됨.
- **해결:**
  - `import { page } from '$app/stores'` → `import { page } from '$app/state'`
  - `$page.url` → `page.url` (스토어 구독 `$` 접두사 제거)
- **적용 시점:** SvelteKit + Svelte 5 환경에서 `page` 데이터 접근 시.

---

## [Paraglide / i18n]

### 1. Paraglide 모듈 타입 인식 오류 및 API 버전 불일치

- **증상:** `TS2305: Module '"$lib/paraglide/runtime"' has no exported member...`
- **원인:**
  1. Paraglide 1.x → 2.x API 변경 (`languageTag` → `getLocale` 등)으로 인한 멤버 이름 불일치.
  2. Paraglide가 생성하는 가상 모듈을 IDE가 실시간으로 인식하지 못함.
- **해결 패턴:**
  1. **Vite 설정:** `virtual modules` 활성화

     ```ts
     // vite.config.ts
     paraglideVitePlugin({ ..., experimentalUseVirtualModules: true }) 
     ```

  2. **API 호환성 확보:** 안전한 import 및 우회

     ```ts
     import * as runtime from '$lib/paraglide/runtime';
     const getLocale = (runtime as any).getLocale ?? (runtime as any).languageTag;
     ```

  3. **재컴파일:** `vite.config.ts` 플러그인 순서 (`paraglide` -> `sveltekit`) 조정 후 재빌드.
- **적용 시점:** 최신 Paraglide 라이브러리 연동 시 타입 오류가 발생할 때.
