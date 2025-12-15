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

### 2. localizeUrl() 반환 타입이 URL 객체라 href에 할당 불가

- **증상:** `Type 'URL' is not assignable to type 'string'` 오류가 `<a href={localizeUrl('/')}>` 사용 시 발생.
- **원인:** Paraglide의 `localizeUrl()` 함수가 `string`이 아닌 `URL` 객체를 반환함.
- **해결:**

  ```svelte
  <!-- Before (오류) -->
  <a href={localizeUrl('/')}>Home</a>

  <!-- After (해결) -->
  <a href={localizeUrl('/').href}>Home</a>
  ```

- **적용 시점:** Paraglide `localizeUrl()`을 사용하여 다국어 링크를 생성할 때.

### 3. 옵션 파라미터 함수를 onclick 핸들러로 직접 전달 시 타입 에러

- **증상:** `Type '(options?: { focusButton?: boolean; }) => void' is not assignable to type 'MouseEventHandler<HTMLAnchorElement>'.` 오류 발생.
- **원인:** `onclick={myFunction}`처럼 함수를 직접 전달하면, 브라우저가 MouseEvent를 첫 번째 인자로 넘기는데, 함수 시그니처가 `(options?: {...})` 형태일 경우 타입 불일치 발생.
- **해결:**

  ```svelte
  <!-- Before (오류) -->
  <a href="/profile" onclick={closeUserMenu}>Profile</a>

  <!-- After (해결) - 화살표 함수로 래핑 -->
  <a href="/profile" onclick={() => closeUserMenu()}>Profile</a>
  ```

- **원리:** 화살표 함수가 MouseEvent를 받아서 무시하고, 내부에서 인자 없이 함수를 호출하므로 타입이 일치함.
- **적용 시점:** 옵션 파라미터를 가진 함수(예: `closeModal({ animate: true })`)를 이벤트 핸들러로 사용할 때.

### 4. 접근성: role="menuitem"에서 aria-pressed 미지원 오류

- **증상:** `The attribute 'aria-pressed' is not supported by the role 'menuitem'` 린트 에러 발생.
- **원인:** ARIA 명세상 `menuitem` 역할은 토글 상태(`aria-pressed`)를 가질 수 없음.
- **해결:**
  - 다중 선택(체크박스) 성격: `role="menuitemcheckbox"` + `aria-checked`
  - 단일 선택(라디오) 성격: `role="menuitemradio"` + `aria-checked`
- **적용 시점:** 폰트 크기 선택, 테마 선택 등 메뉴 내에서 옵션을 선택하는 UI 구현 시.

---

## [Biome / Linter]

### 1. Node.js 내장 모듈 import 시 node: 프로토콜 필수

- **증상:** `A Node.js builtin module should be imported with the node: protocol.` 경고 발생.
- **원인:** Biome의 `lint/style/useNodejsImportProtocol` 규칙이 Node.js 내장 모듈에 `node:` 접두사를 요구함.
- **해결:**

  ```typescript
  // Before (경고)
  import fs from 'fs/promises';
  import path from 'path';

  // After (해결)
  import fs from 'node:fs/promises';
  import path from 'node:path';
  ```

- **적용 시점:** Node.js 내장 모듈(`fs`, `path`, `os`, `crypto` 등)을 import할 때.

### 2. Biome organizeImports 규칙: Import 정렬 순서

- **증상:** `The imports and exports are not sorted.` 경고 발생.
- **원인:** Biome의 `assist/source/organizeImports` 규칙이 특정 정렬 순서를 요구함.
- **해결 - 올바른 정렬 순서:**

  ```typescript
  // 1. Node.js 내장 모듈 (node: 접두사)
  import fs from 'node:fs/promises';
  import path from 'node:path';

  // 2. 외부 패키지 (scoped 패키지 포함)
  import { error } from '@sveltejs/kit';
  import { marked } from 'marked';

  // 3. 프로젝트 내부 경로 별칭 ($lib 등)
  import { policy, site } from '$lib/constants';
  import { extractLocaleFromUrl } from '$lib/paraglide/runtime';

  // 4. 상대 경로 (type import 포함)
  import type { PageServerLoad } from './$types';
  ```

- **주의사항:**
  - 각 그룹 사이에 빈 줄을 추가해야 함
  - 같은 그룹 내에서는 알파벳 순서로 정렬
  - `bunx biome check --write <파일경로>`로 자동 수정 가능
- **적용 시점:** Biome을 린터로 사용하고 `organizeImports` 규칙이 활성화된 프로젝트에서.

### 3. Biome formatter 규칙: 파일 끝의 불필요한 빈 줄(추가 개행)로 인한 포맷 실패

- **증상:** `bun run lint`(= `biome check .`) 실행 시 아래와 유사한 에러가 발생하며 실패함.

```plaintext
format ━━━━━━━━━━━━━━━━━━━━━━━
× Formatter would have printed the following content:
```

- **원인:** 파일이 **마지막에 빈 줄이 2개 이상** 들어간 상태(“추가 개행”)여서 Biome 포매터 결과와 불일치함.
- **해결:** 파일 끝의 불필요한 빈 줄을 제거하고, **마지막은 개행 1개로만** 종료되도록 정리.
  - 예: `src/lib/components/design-system/index.ts`의 마지막 “빈 줄 1개”를 삭제하여 포매터 일치시킴.
- **검증:** `bun run lint` 재실행 시 통과.

### 4. Biome formatter 규칙: export 블록 들여쓰기(탭) 불일치로 인한 포맷 실패

- **증상:** `bun run lint` 실행 시 `format` 섹션에서 `Formatter would have printed the following content` 에러가 발생하며 실패함.
- **원인:** 프로젝트의 포매팅 규칙상 `.ts` 파일의 멀티라인 `export { ... }` 블록 들여쓰기는 **탭**을 사용해야 하는데, 공백(스페이스)으로 작성되어 Biome 출력과 불일치함.
- **해결:** 멀티라인 export 블록의 들여쓰기를 탭으로 맞추고, 포매터가 제안한 형태로 수정.
- **검증:** `bun run lint` 재실행 시 통과.

---

## [Playwright / E2E]

### 1. webServer 빌드 타임아웃으로 E2E 실행 실패

- **증상:** `bun run test:e2e` 실행 시 `Error: Timed out waiting ... from config.webServer.` 에러로 실패함.
- **원인:** Playwright의 `webServer`가 `bun run build` + `bun run preview`를 준비하는 동안, 설정된 timeout 안에 준비가 완료되지 못함. (Windows/초기 캐시/빌드 부하 등에 따라 편차가 큼)
- **해결:** `playwright.config.ts`의 `webServer.timeout`을 늘려 빌드 준비 시간을 확보함.
- **적용 시점:** E2E가 “서버 기동 단계”에서 간헐적으로 타임아웃 나는 경우.

### 2. 라벨 중복으로 인한 잘못된 요소 선택 (Selector 충돌)

- **증상:** `aria-haspopup="menu"` 등 특정 ARIA 계약을 기대했는데, 실제로는 빈 값/다른 값이 잡히며 테스트가 실패함.
- **원인:** 같은 accessible name(예: `Open menu`)을 가진 버튼이 헤더/본문에 동시에 존재할 때, `getByRole(...).first()`가 의도하지 않은 요소(예: 헤더의 모바일 메뉴 버튼)를 선택할 수 있음.
- **해결:** 테스트 selector를 lab 영역으로 스코프하거나(예: `data-ds-theme="light"`), 고유한 식별자(test id 등)를 부여해 충돌을 제거함.
- **적용 시점:** 라벨이 중복될 수 있는 페이지에서 role/name 기반 selector를 사용할 때.

### 3. Hydration/준비 이전 실행으로 인한 플래키(간헐 실패)

- **증상:** 클릭/호버를 했는데 `dialog[open]`이 나타나지 않거나, tooltip이 열리지 않는 등 테스트가 간헐적으로 실패함.
- **원인:** lab 페이지의 일부 로직이 `onMount` 이후에만 동작하는데, E2E가 hydration 완료 전에 상호작용을 시작하면 이벤트/상태가 기대대로 반영되지 않을 수 있음.
- **해결:** `onMount` 시점에 `html[data-ds-lab-ready="1"]` 같은 준비 플래그를 세팅하고, 테스트는 해당 플래그를 기다린 뒤 상호작용을 수행함.
- **적용 시점:** SvelteKit/Svelte 5에서 `onMount` 기반 초기화가 있는 페이지를 E2E로 안정적으로 검증해야 할 때.

---

## [CI / GitHub Actions]

### 1. Paraglide 생성 산출물 미생성으로 typecheck 실패

- **증상:** GitHub Actions에서 `bun run check` 실행 시 `Cannot find module '$lib/paraglide/...` 오류가 다수 발생하며 `svelte-check`가 실패함.
- **원인:** `src/lib/paraglide/`는 Vite 플러그인(`@inlang/paraglide-js`)이 생성하는 **자동 생성 디렉터리**이고 Git에 커밋되지 않음. 로컬에서는 `vite dev/build` 등으로 생성된 상태였지만, CI에서는 `svelte-check` 전에 생성이 되어 있지 않아 모듈 해석이 실패함.
- **해결:** typecheck 전에 `paraglide-js compile`을 실행해 `src/lib/paraglide/`를 생성한 뒤 `svelte-check`를 수행함.
  - 예: `bunx paraglide-js compile --project ./project.inlang --outdir ./src/lib/paraglide --strategy url cookie preferredLanguage baseLocale`
- **적용 시점:** Paraglide 산출물을 Git에 커밋하지 않고, CI에서 타입체크를 돌릴 때.

### 2. Vitest browser 프로젝트에서 Playwright 브라우저 미설치로 유닛 테스트 실패

- **증상:** GitHub Actions에서 `bun run test:unit -- --run` 실행 시 `browserType.launch: Executable doesn't exist ...` 오류가 발생하며 실패함.
- **원인:** Vitest 설정에서 `@vitest/browser-playwright` 기반의 browser 프로젝트(client)가 포함되어 있는데, CI 환경에 Playwright Chromium 바이너리가 설치되어 있지 않아 브라우저 런치가 실패함.
- **해결:** 유닛 테스트 실행 전에 Playwright 브라우저를 설치함.
  - 예: `bunx playwright install --with-deps chromium`
- **적용 시점:** Vitest browser 프로젝트(client)를 CI에서 실행할 때.

---

## [UI / UX / RTL]

### 1. 모바일 메뉴 RTL(아랍어) 호환성 및 유령 레이어 버그

- **증상:**
  1. 아랍어(RTL) 모드에서 창 너비를 조절하면 모바일 메뉴가 자동으로 튀어나옴 (Pop-in).
  2. RTL에서 메뉴가 닫힌 상태에서도 X 버튼이 눌리지 않거나, 열렸을 때 애니메이션 방향이 반대임.
  3. 메뉴가 닫혀 있어도 화면 오른쪽에 보이지 않는 공간(Scrollbar)이 생김.
- **원인:**
  - `translate-x-full`은 LTR/RTL에 관계없이 무조건 요소를 오른쪽으로 이동시킴.
  - 메뉴를 `display: none`하거나 DOM에서 제거하지 않고, 단순히 화면 밖으로 밀어두기만(`transform`) 했기 때문에 레이아웃 엔진이 "보이지 않는 요소"의 위치를 계속 계산함.
  - RTL 환경에서는 메뉴가 왼쪽에서 시작해야 하는데, `translate-x-full`(오른쪽 이동)이 적용되어 화면 안으로 들어오거나 엉뚱한 위치에 배치됨.
- **해결 패턴:**
  - **조건부 렌더링 사용:** `{#if open}` 블록으로 감싸서, 닫혔을 때는 DOM에서 아예 제거함. (가장 확실한 방법)
  - **논리적 속성 사용:** `left/right` 대신 `start/end`, `translate-x` 대신 `translate-inline` (브라우저 지원 확인 필요) 등을 고려하되, Svelte에서는 `{#if}`가 가장 깔끔함.
- **적용된 코드:**

  ```svelte
  <!-- Before (버그 발생): 항상 렌더링하고 CSS로만 숨김 -->
  <div class="fixed ... {open ? 'translate-x-0' : 'translate-x-full'}">...</div>

  <!-- After (해결): 열릴 때만 렌더링 (RTL 이슈 원천 차단) -->
  {#if open}
    <div class="fixed ... translate-x-0">...</div>
  {/if}
  ```

- **적용 시점:** 다국어(RTL)를 지원하는 웹사이트의 모바일 메뉴, 사이드바, 슬라이드 패널 구현 시.
