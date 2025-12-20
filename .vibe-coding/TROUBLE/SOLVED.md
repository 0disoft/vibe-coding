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

### 5. svelte:element에서 href 속성 전달 시 타입 오류

- **증상:** `svelte:element`에 `{href}` 속성을 직접 전달하면 `Object literal may only specify known properties, and 'href' does not exist in type 'HTMLAttributes<any>'.` 오류 발생.

### 6. Svelte 5: `state_referenced_locally` 경고 (prop을 `$state` 초기값에서 참조)

- **증상:** `This reference only captures the initial value of 'type'. Did you mean to reference it inside a derived instead?` 경고 발생.
- **원인:** `$state` 초기값 계산에 props(`type`)를 직접 사용하면 이후 props 변경이 반영되지 않아 경고가 뜸.
- **해결:** `$state`는 안전한 기본값으로 두고, props 기반 정규화는 `$effect`나 `$derived`에서 수행.
- **적용 시점:** props 값에 따라 초기 상태를 맞추려는 Svelte 5 컴포넌트.

### 7. DataTable: `SortState` null 타입 오류 & 스크롤 영역 tabindex 경고

- **증상:** `Type 'null' is not assignable to type 'SortState'` 타입 오류와 `a11y_no_noninteractive_tabindex` 경고 발생.
- **원인:** `sort = $bindable(null)`인데 `SortState`가 null을 허용하지 않았고, 비상호작용 요소에 `tabindex="0"` 사용으로 lint 경고가 발생.
- **해결:** `SortState`를 `null` 허용 타입으로 변경하고, 스크롤 영역은 `tabindex="0"` 유지 + `svelte-ignore` 주석과 `aria-label`로 의도 명시.
- **적용 시점:** 테이블 정렬 상태가 `null`을 갖는 컴포넌트와 가로 스크롤 접근성 확보가 필요한 경우.

### 8. DataTable: `sort` null 경고(`sortAnnouncement` 내부)

- **증상:** `sort`가 `null`일 수 있다는 TS 경고가 `columns.find((c) => c.id === sort.columnId)` 라인에서 발생.
- **원인:** 함수 스코프에서 `sort`가 변경될 수 있다고 분석되어 null 체크 이후에도 경고가 남음.
- **해결:** `const currentSort = sort;`로 로컬 캡처 후 null 체크하여 안정화.
- **적용 시점:** `$bindable` 상태를 참조하는 함수에서 null 가능성 경고가 반복될 때.
- **원인:** `HTMLAttributes<HTMLElement>`에는 `href`가 정의되어 있지 않음. `href`는 `HTMLAnchorElement`에만 존재하는 속성임.
- **해결:**

  ```svelte
  <!-- Before (오류) -->
  <svelte:element
    this={elementTag}
    {href}
    {...rest}
  >

  <!-- After (해결) - 조건부 spread로 전달 -->
  <svelte:element
    this={elementTag}
    {...rest}
    {...(href ? { href } : {})}
  >
  ```

- **적용 시점:** `svelte:element`로 동적 태그(`div` ↔ `a`)를 렌더링하면서 `href`를 조건부로 전달할 때.

### 6. 옵션 파라미터 함수를 onclick 핸들러로 직접 전달 시 타입 에러

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

### 7. 접근성: role="menuitem"에서 aria-pressed 미지원 오류

- **증상:** `The attribute 'aria-pressed' is not supported by the role 'menuitem'` 린트 에러 발생.
- **원인:** ARIA 명세상 `menuitem` 역할은 토글 상태(`aria-pressed`)를 가질 수 없음.
- **해결:**
  - 다중 선택(체크박스) 성격: `role="menuitemcheckbox"` + `aria-checked`
  - 단일 선택(라디오) 성격: `role="menuitemradio"` + `aria-checked`
- **적용 시점:** 폰트 크기 선택, 테마 선택 등 메뉴 내에서 옵션을 선택하는 UI 구현 시.

### 8. 이벤트 핸들러 래퍼 함수에서 currentTarget 타입 불일치 오류

- **증상:** 이벤트 핸들러를 래퍼 함수로 감쌀 때 다음과 같은 타입 오류 발생:

  ```plaintext
  Argument of type 'MouseEvent' is not assignable to parameter of type
  'MouseEvent & { currentTarget: EventTarget & HTMLButtonElement; }'.
  Type 'null' is not assignable to type 'EventTarget & HTMLButtonElement'.
  ```

- **원인:** Svelte 5의 `HTMLButtonAttributes`에서 `onclick`/`onkeydown` 핸들러는 `{ currentTarget: EventTarget & HTMLButtonElement }` 타입을 요구하지만, 래퍼 함수의 파라미터 타입(`MouseEvent`, `KeyboardEvent`)은 `currentTarget`이 `EventTarget | null`이라 타입이 호환되지 않음.
- **해결:**

  ```svelte
  <!-- Before (오류) -->
  function handleClick(e: MouseEvent) {
    if (loading) { e.preventDefault(); return; }
    onclick?.(e);
  }

  <!-- After (해결) - as any로 캐스팅 -->
  function handleClick(e: MouseEvent) {
    if (loading) { e.preventDefault(); return; }
    onclick?.(e as any);
  }
  ```

- **원리:** 런타임에는 실제 버튼 요소에서 발생한 이벤트가 그대로 전달되므로 동작에는 문제가 없음. `as any` 캐스팅으로 타입 검사만 우회.
- **적용 시점:** `HTMLButtonAttributes` 등을 확장한 Props에서 이벤트 핸들러를 받아 래퍼 함수 내에서 호출할 때.

### 9. DsDropdown 커스텀 itemSelector 키보드 탐색 미작동

- **증상:** `DsDropdown`에 `itemSelector='[role="menuitemradio"]'`를 지정했는데 키보드(화살표 키)로 아이템 탐색이 안 됨.
- **원인:**
  1. `DsDropdown`의 `getItems()` 함수가 `role="menuitem"`만 쿼리하고 `itemSelector` prop을 무시함.
  2. `onMenuKeyDown`에서도 `role="menuitem"`만 탐색 대상으로 인식.
- **해결:**

  ```typescript
  // getItems()에서 itemSelector 사용
  function getItems(): HTMLElement[] {
    const selector = itemSelector || '[role="menuitem"]:not([disabled])';
    return Array.from(rootEl.querySelectorAll<HTMLElement>(selector))
      .filter(el => !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true');
  }

  // onMenuKeyDown에서도 itemSelector 사용
  const itemRole = itemSelector ? itemSelector : '[role="menuitem"]';
  const item = target.closest<HTMLElement>(itemRole);
  ```

- **주의사항:** `el.disabled`는 `HTMLElement` 타입에 없으므로 `el.hasAttribute('disabled')`를 사용해야 함.
- **적용 시점:** `DsDropdown`에서 `menuitemradio`, `menuitemcheckbox` 등 커스텀 role을 사용할 때.

### 10. 그리드 레이아웃 드롭다운에서 stopPropagation으로 인한 ESC 키 미작동

- **증상:** 3x3 그리드 형태의 드롭다운(예: 폰트 크기 선택기)에서 ESC 키로 닫히지 않음.
- **원인:** 그리드 탐색을 위해 `onkeydown` 핸들러에서 `event.stopPropagation()`을 함수 시작 부분에서 무조건 호출하여 ESC 이벤트가 `DsDropdown`에 전달되지 않음.
- **해결:** 조건부 stopPropagation 적용 - 화살표 키 등 실제 처리하는 키에만 `stopPropagation()` 호출.

  ```typescript
  function handleMenuKeyDown(event: KeyboardEvent) {
    let handled = false;
    switch (event.key) {
      case "ArrowDown": /* ... */ handled = true; break;
      case "ArrowUp": /* ... */ handled = true; break;
      // ESC, Tab, Enter, Space는 처리 안 함
    }
    if (handled) {
      event.preventDefault();
      event.stopPropagation();
      items[nextIndex]?.focus();
    }
  }
  ```

- **적용 시점:** 그리드 레이아웃의 드롭다운 메뉴에서 커스텀 키보드 탐색을 구현할 때.

### 11. Svelte 5: `$derived` vs `$derived.by` 혼동으로 인한 타입 에러

- **증상:** `$derived(() => ...)` 형태로 정의한 변수를 사용할 때 `Argument of type '() => string | undefined' is not assignable to parameter of type 'string'` 타입 에러 발생.
- **원인:** `$derived(expression)`은 표현식의 결과를 반환하지만, `$derived(() => ...)`처럼 화살표 함수를 전달하면 **함수 자체**가 $derived의 결과가 됨. 즉, `$derived(() => value)`의 타입은 () => T이지 T가 아님.
- **해결:** 복잡한 계산이 필요하면 `$derived.by(() => ...)`를 사용해야 함. `.by`가 함수를 실행하고 그 반환값을 반응형 값으로 만듦.

  ```svelte
  <!-- Before (오류): 함수 자체가 반환됨 -->
  let activeId = $derived(() => {
    const item = items[index];
    return item ? item.id : undefined;
  });
  // activeId의 타입: () => string | undefined

  <!-- After (해결): 함수 실행 결과가 반환됨 -->
  let activeId = $derived.by(() => {
    const item = items[index];
    return item ? item.id : undefined;
  });
  // activeId의 타입: string | undefined
  ```

- **적용 시점:** `$derived` 내에서 조건문, 변수 할당 등 복잡한 로직이 필요할 때.

### 12. DsDropdown trigger snippet의 ref 콜백과 컴포넌트 bindable ref 타입 불일치

- **증상:** `DsDropdown`의 `trigger` snippet에 `DsIconButton`을 사용할 때 다음과 같은 타입 오류 발생:

  ```plaintext
  Type '{ ...; ref: (node: HTMLElement) => void; ... }' is not assignable to type 'Props'.
  Types of property 'ref' are incompatible.
  Type '(node: HTMLElement) => void' is not assignable to type 'HTMLButtonElement'.
  ```

- **원인:** `DsDropdown`의 `trigger` snippet이 전달하는 `props` 객체에는 `ref: (node: HTMLElement) => void` 형태의 **콜백 함수**가 포함되어 있음. 그러나 `DsIconButton`의 `Props`에서는 `ref?: HTMLButtonElement | null` 형태의 **bindable 요소 참조**를 기대함. 두 타입이 호환되지 않아 오류 발생.
- **해결:** `props`에서 `ref`를 분리(destructuring)하고, `use:` 액션 디렉티브를 통해 래퍼 요소에 적용.

  ```svelte
  <!-- Before (오류) -->
  {#snippet trigger(props)}
    <DsIconButton {...props} label="Menu">
      <span class="i-lucide-menu"></span>
    </DsIconButton>
  {/snippet}

  <!-- After (해결) -->
  {#snippet trigger({ ref, ...props })}
    <span class="contents" use:ref>
      <DsIconButton {...props} label="Menu">
        <span class="i-lucide-menu"></span>
      </DsIconButton>
    </span>
  {/snippet}
  ```

- **원리:**
  - `{ ref, ...props }` 구문으로 `ref` 콜백을 분리하여 `DsIconButton`에 전달되지 않게 함.
  - `<span class="contents">` 래퍼에 `use:ref`로 콜백을 적용. `display: contents`는 레이아웃에 영향을 주지 않으면서 DOM 노드를 제공.
  - `DsDropdown`은 해당 노드를 통해 포지셔닝 등 필요한 작업을 수행할 수 있음.
- **적용 시점:** `DsDropdown` 등 snippet으로 `ref` 콜백을 전달하는 컴포넌트에서, bindable ref를 사용하는 자식 컴포넌트를 트리거로 사용할 때.

### 13. Union 타입 반환 함수의 타입 추론 불일치 (Intent 타입)

- **증상:** `Intent`와 같은 유니온 타입을 기대하는 prop에 helper 함수의 반환값을 전달할 때 `Type 'string' is not assignable to type 'Intent...'` 오류 발생.
- **원인:** helper 함수가 문자열 리터럴을 반환하더라도, 명시적 반환 타입이 없으면 TS가 넓은 `string`으로 추론하여 엄격한 유니온 타입과 호환되지 않음.
- **해결:** helper 함수에 명시적 반환 타입(예: `: IntentWithNeutral`)을 추가하여 TS가 정확한 유니온 타입을 보장하게 함.
- **적용 시점:** 문자열 리터럴을 반환하여 유니온 타입 prop에 전달하는 helper 함수 작성 시.

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

---

## [UI / CSS / Components]

### 1. 다크 모드 토글 버튼의 "눌림(Pressed)" 상태 고착 현상

- **증상:** 다크 모드 상태일 때, 테마 토글 버튼이 항상 호버되거나 선택된(active) 것처럼 배경색이 적용되어 보임.
- **원인:** `ThemeToggle` 컴포넌트가 `DsIconButton`에 `pressed={theme.current === 'dark'}`를 전달하고 있었음. 디자인 시스템 CSS에서 `[aria-pressed="true"]`인 경우 배경색을 강제로 적용(`background-color: var(--color-surface-hover)`)하기 때문에 발생.
- **해결:** `ThemeToggle.svelte`에서 `pressed` 속성 제거. 테마 토글은 상태 표시보다는 단순 액션 트리거이므로 `pressed` 상태가 불필요함.
- **적용 시점:** 토글 버튼이 상태(On/Off)를 시각적으로 유지할 필요가 없을 때.

### 2. 드롭다운 메뉴 텍스트 세로 깨짐 및 너비 문제

- **증상:** 언어 선택 드롭다운 메뉴에서 "English", "한국어" 등 텍스트가 가로로 나열되지 않고 한 글자씩 세로로 렌더링됨.
- **원인:**
  1. `DsDropdown`의 메뉴 컨테이너(`menuClass`)에 `min-w-fit`만 적용되어 있고, 텍스트 줄바꿈 방지 스타일이 없음.
  2. 플렉스나 그리드 아이템이 공간 부족 시 자동으로 줄바꿈을 시도함.
- **해결:**
  - 메뉴 컨테이너에 `w-max` 추가 (내용물 크기에 맞춰 너비 확장).
  - 아이템(`<a>`)에 `whitespace-nowrap` 추가 (텍스트 줄바꿈 강제 방지).
- **적용 시점:** 드롭다운 내용이 텍스트 위주이며, 절대 줄바꿈되면 안 되는 경우.

### 3. 카드(Card) 컴포넌트 내부 타이포그래피와 폼 필드 간 간격 부족

- **증상:** `DsCard` 내부에 제목(H3)과 폼 필드(Input)를 배치했을 때, 둘 사이의 간격이 너무 좁아 보임.
- **원인:** `DsCard` 컴포넌트 자체에 `class="space-y-4"`를 주었으나, Svelte 컴포넌트(`DsCard`)의 최상위 요소가 아닌 내부 슬롯이나 구조 탓에 `space-y-4`가 자식 요소들 간의 간격으로 정확히 전달되지 않음.
- **해결:** `DsCard` 바로 안쪽에 `div` 래퍼를 두고, 그 `div`에 `class="space-y-4"`를 적용하여 자식 요소(제목, 폼, 필드 등) 간의 수직 간격을 제어함.
- **적용 시점:** 컴포넌트의 루트 클래스가 내부 슬롯 아이템의 레이아웃(간격)에 직접 영향을 주기 어려운 경우, 명시적인 레이아웃 다이브(div) 사용.

---

## [Svelte / Parser]

### 1. 템플릿 리터럴 내 `</script>` 문자열로 인한 파싱 오류

- **증상:** Svelte 컴포넌트 내 문자열(예: 코드 블록 예시)에 `</script>`를 포함하면, 컴파일러나 IDE가 이를 실제 스크립트 닫는 태그로 오인하여 "Unexpected token", "Cannot find name 'script'" 등 치명적인 문법 오류 발생.
- **원인:** HTML 파서는 문자열 컨텍스트(`"..."` 또는 `` `...` ``)와 상관없이 `</script>`를 만나면 즉시 스크립트 블록을 종료시킴.
- **해결:** 문자열 분리 기법(String Splitting) 사용.

  ```svelte
  <!-- Before (오류) -->
  code={`<script>...</script>`}

  <!-- After (해결) -->
  code={`<script>...</` + `script>`}
  ```

- **적용 시점:** `<script>` 태그 자체를 문자열로 다뤄야 하는 문서화 페이지나 예제 코드 작성 시.

---

## [Tools / Scripts]

### 1. 정의되지 않은 메서드 호출로 인한 TypeScript 에러 (Dead Code)

- **증상:** `'LintScanner' 형식에 'analyzeDevGuard' 속성이 없습니다.` TypeScript 에러 발생.
- **원인:** `02-lint-patterns.ts`에서 리팩토링 과정에서 `this.analyzeDevGuard()` 메서드 호출이 남아있었지만, 실제 구현은 `this.checkDevGuardOnLine()`으로 대체됨. 호출부만 제거되지 않은 dead code.
- **해결:** 미사용 `analyzeDevGuard` 호출 및 관련 주석(14줄) 제거.
- **적용 시점:** 리팩토링 후 사용하지 않는 코드가 남아있을 때.

### 2. 정규식 리터럴 문법 오류 (`///+$/`)

- **증상:** `'let' 이름을 찾을 수 없습니다`, `','이(가) 필요합니다`, `'src' 이름을 찾을 수 없습니다` 등 연쇄적인 TypeScript 파싱 에러 발생.
- **원인:** `03-route-audit.ts`에서 정규식 리터럴이 `///+$/`로 작성되어 있었는데, 이는 `/` 문자가 이스케이프되지 않아 정규식이 조기 종료됨. 결과적으로 `//+$/`가 주석으로 해석되고 이후 코드가 완전히 깨짐.
- **해결:**

  ```typescript
  // Before (오류)
  .replace(///+$/, '')

  // After (해결)
  .replace(/\/+$/, '')
  ```

- **적용 시점:** 정규식에서 슬래시(`/`)를 매칭해야 할 때 반드시 `\/`로 이스케이프.

### 3. 정의되지 않은 변수 참조 (`VALID_EXTENSIONS`)

- **증상:** `bun .../01-security-patterns.ts src/app.css` 실행 시 `VALID_EXTENSIONS is not defined` 런타임 에러 발생.
- **원인:** `01-security-patterns.ts`에서 `VALID_EXTENSIONS.includes(ext)` 호출이 있었지만, 실제 변수명은 `CONFIG.validExtensions`와 `VALID_EXTENSIONS_SET`으로 정의되어 있었음.
- **해결:**

  ```typescript
  // Before (오류)
  if (!VALID_EXTENSIONS.includes(ext)) {
    console.log(`Error: 지원 확장자는 ${VALID_EXTENSIONS.join(', ')} 입니다.`);

  // After (해결)
  if (!VALID_EXTENSIONS_SET.has(ext)) {
    console.log(`Error: 지원 확장자는 ${CONFIG.validExtensions.join(', ')} 입니다.`);
  ```

- **적용 시점:** 리팩토링으로 변수명이 변경되었을 때, 모든 참조가 업데이트되었는지 확인.

### 4. RangeSlider 썸(Thumb) 수직 정렬 어긋남 (Floating Issue)

- **증상:** `RangeSlider`에서 썸(동그라미)이 트랙 트랙 중앙에 위치하지 않고, 미묘하게 위쪽으로 붕 떠서 비대칭적으로 보임.
- **원인:**
  1. 트랙과 입력(Input) 요소를 `flexbox`와 `absolute`로 혼용하여 배치함에 따라, 브라우저가 height를 계산하고 정렬하는 기준점이 미세하게 어긋남.
  2. 트랙(`height: 6px`)과 썸(`height: 18px`)의 높이 차이를 고려한 `margin-top` 보정이 정확하지 않음(특히 WebKit 계열).
- **해결:** **완전한 절대 위치(Absolute Positioning) 모델**로 전환.
  1. 컨테이너(`ds-range-slider`)에 썸 크기만큼 높이 할당.
  2. 트랙(`ds-slider-track`)을 `absolute`, `top: 50%`, `transform: translateY(-50%)`로 강제 중앙 정렬.
  3. 입력(`ds-slider-input`)을 `inset: 0`으로 컨테이너를 가득 채우게 하여 트랙과 동일한 무게중심 공유.
  4. WebKit 썸에 `calc((var(--slider-track-height) - var(--slider-thumb-size)) / 2)` 마진 적용.
- **적용 시점:** 커스텀 슬라이더 구현 시 트랙과 썸의 높이가 다르고, 미세한 픽셀 단위 정렬이 필요할 때.

### 5. EditorToolbar: `DsSelect`의 `onValueChange` 타입 오류 (Svelte 5 반응성 패턴)

- **증상:** `EditorToolbar.svelte`에서 `DSSelect`에 `onValueChange`를 전달할 때 `Object literal may only specify known properties` 오류 발생.
- **원인:** `DsSelect`는 `bind:value`를 통해 양방향 바인딩을 지원하며, 별도의 이벤트 핸들러(`onValueChange`) prop을 정의하지 않음.
- **해결:** `untrack`을 사용하여 안전한 양방향 동기화 패턴 구현.

  ```typescript
  // Before (오류)
  <DsSelect bind:value={selectValue} onValueChange={handleBlockChange} />

  // After (해결)
  // 1. prop 제거
  <DsSelect bind:value={selectValue} />

  // 2. untrack으로 순환 참조 없는 양방향 동기사 구현
  $effect(() => {
    const sv = selectValue;
    untrack(() => {
      if (sv !== blockType) handleBlockChange(sv);
    });
  });
  ```

- **적용 시점:** Svelte 5에서 `bindable` prop과 내부 상태를 동기화할 때, 이벤트 핸들러 대신 `$effect`와 `untrack`을 사용해야 하는 경우.

### 6. Svelte 5 Runes: `export type` 및 `$bindable` 문법 오류

- **증상:**
  1. `Modifiers cannot appear here` (일반 `<script>`에서 `export type` 사용 시)
  2. `$bindable() can only be used inside a $props() declaration` (중간 변수를 거쳐 구조분해 시)
  3. `context="module" is deprecated` 경고
- **원인:** Svelte 5의 엄격해진 룬(Runes) 규칙 및 모듈 스크립트 문법 변경.
- **해결:**

  ```svelte
  <!-- Before (오류) -->
  <script context="module"> ... </script> <!-- Deprecated -->
  <script>
    export type MyType = ...; // Error: Modifiers cannot appear here
    let props = $props();
    let { value = $bindable() } = props; // Error: bindable location
  </script>

  <!-- After (해결) -->
  <script module>
    export type MyType = ...; // OK
  </script>

  <script>
    let { value = $bindable() } = $props(); // OK
  </script>
  ```

- **적용 시점:** Svelte 5 컴포넌트 마이그레이션 또는 신규 작성 시.

### 7. Wizard 완료 시 마지막 단계 체크 표시 미적용

- **증상:** `Wizard`에서 마지막 단계(Done)에서 `Finish`를 눌러 `onFinish`가 호출되어도, 단계 표시기(Steps)의 숫자가 체크 표시(Completed)로 바뀌지 않음.
- **원인:**
  1. `Wizard`의 `completedIds` 로직이 `currentIndex` 이전의 단계들만 포함(`slice(0, currentIndex)`)하고 있어서, 현재 단계(마지막 단계)는 "진행 중"으로만 간주됨.
  2. `Steps` 컴포넌트가 "현재 단계" 상태를 "완료됨" 상태보다 우선하여 렌더링함.
- **해결:**
  - `Wizard`: `isFinished` 상태를 도입하여 `onFinish` 호출 시 `true`로 설정하고, 이때는 모든 단계를 `completedIds`에 포함시킴.
  - `Steps`: `stateFor` 함수에서 `isCompleted` 체크를 `activeId` 체크보다 우선순위를 높여, 현재 단계라도 완료 목록에 있다면 체크 표시가 뜨도록 변경.
- **적용 시점:** Wizard나 Step 프로세스 UI에서 "완료" 상태를 시각적으로 명확히 표현해야 할 때.

### 8. 기본 Table의 정렬 기능 부재로 인한 DataTable로의 업그레이드

- **증상:** 데이터 테이블을 클릭하여 데이터를 확인하는 UI에서, 사용자가 컬럼(Month, Value)을 클릭해 정렬하고 싶어하지만 기본 `DsTable`은 이를 지원하지 않음.
- **해결:** `DsTable`을 정렬 기능 `sortable`을 지원하는 `DsDataTable`로 교체. 이를 위해 `chartValues` 배열을 객체 배열(`{id, month, value}`)로 변환하고, `DsDataTable`에 `caption` 속성을 추가하여 디자인 정합성 유지.
- **적용 시점:** 단순 데이터 나열에서 정렬/필터 등 인터랙션이 필요한 경우 `DsDataTable` 사용 권장.

### 9. 라이트 모드에서 Semantic Text Color 가독성 개선

- **증상:** 라이트 모드에서 `text-success`, `text-warning` 등의 시맨틱 컬러가 배경색(버튼 등)으로 쓰일 때와 동일한 밝기(파스텔톤, L=82~85%)를 사용하여, 흰 배경 위의 텍스트/아이콘으로 쓰일 때 가독성이 떨어짐.
- **해결:**
  1. `design-system.tokens.css`에 텍스트 전용 시맨틱 변수(`--raw-color-success-text` 등)를 추가. 라이트 모드에서는 기존보다 명도(Lightness)를 낮춰(L=50~60%) 가독성을 높이고, 다크 모드에서는 기존 색상을 유지.
  2. `uno.config.ts`에서 `text-{color}` 유틸리티 생성 시, `bg-{color}`와 달리 텍스트 전용 변수(`--color-success-text`)를 참조하도록 매핑(`semanticTextColorVarMap`)을 분리하여 적용.
- **적용 시점:** `text-success`, `text-warning`, `text-destructive` 유틸리티 사용 시 자동으로 적용됨. 버튼 배경색(`bg-success` 등)은 기존 파스텔톤 유지.

### 10. 기본 테마(Mode) 및 팔레트(Palette) 변경 (Cozy Coral)

- **증상:** 초기 방문 사용자에게 기본적으로 적용되는 테마가 `system` 모드, `airy-blue` 팔레트로 설정되어 있어, 원하는 브랜드 분위기(따뜻함/친근함)를 바로 전달하지 못함.
- **해결:** `src/lib/shared/utils/theme.ts`의 `DEFAULT_THEME_MODE`를 `light`로, `DEFAULT_THEME_PALETTE`를 `cozy-coral`로 변경.
- **적용 시점:** 신규 방문자 또는 쿠키/로컬스토리지에 테마 설정이 없는 사용자에게 적용됨.

### 11. Locale Switcher 아이콘 크기 불일치 수정

- **증상:** Header에서 `ThemeToggle`, `UserMenu` 아이콘은 16px(`h-4 w-4`)로 렌더링되나, `LocaleSwitcher`만 `icon` prop을 사용하여 기본 `md` 사이즈(20px)로 렌더링되어 크기가 튐.
- **해결:** `LocaleSwitcher`도 다른 헤더 액션 컴포넌트(`ThemeToggle` 등)와 동일하게 `DsIconButton` 내부에서 직접 `<span class="h-4 w-4 ...">` 스니펫을 사용하여 아이콘 크기를 16px로 통일.
- **적용 시점:** 헤더 영역의 아이콘 크기 일관성 확보.

### 12. 부드러운 스크롤 (Lenis) 적용

- **증상:** 기본 브라우저 휠 스크롤이 단계별로 끊겨서(Instant) 부자연스러운 느낌("0.1초만에 순간이동"). 사용자 요청: "0.25초 정도로 부드럽게".
- **해결:** `Lenis` 라이브러리를 도입하여 Inertia Scroll(관성 스크롤) 적용.
  - `src/lib/interaction/SmoothScroll.svelte`: Lenis 초기화 및 RAF 루프 관리 컴포넌트 생성.
  - `src/routes/+layout.svelte`: 전역 레이아웃에 `<SmoothScroll duration={0.6} />` 추가. (0.25s는 너무 빨라 효과가 미미하므로, 0.6s로 설정하여 "빠르면서도 부드러운" 프리미엄 감도 구현)
- **적용 시점:** 사이트 전역 스크롤 경험 개선.

### 13. Combobox 비활성화 항목 선택 문제

- **증상:** `disabled: true`인 항목("Casey")이 흐리게 보이지 않고, 선택 불가능해야 하는데 클릭되는 것처럼 보임(실제로는 선택 안 됨).
- **원인:** `design-system.css`에서 `.ds-combobox-option:disabled` 선택자를 사용했으나, 해당 요소는 `<div>`이므로 `:disabled` 의사 클래스가 적용되지 않음.
- **해결:** `.ds-combobox-option[aria-disabled="true"]` 속성 선택자로 변경하여 스타일 적용.

### 14. FilterBar 검색어 입력 불가 (Focus/Input Reset)

- **증상:** "Search posts" 입력창을 클릭하고 타이핑하려 하면 입력값이 즉시 초기화되어 입력이 불가능함.
- **원인:** `FilterBar.svelte` 내의 `$effect`가 `query`와 `inputValue`를 동기화하는 과정에서, `query` 변화가 디바운스되는 동안 타자 입력으로 변한 `inputValue`가 이전 `query` 값으로 덮어씌워지는 무한 루프 발생.
- **해결:** `$effect` 내부에서 `inputValue`를 읽을 때 `untrack(() => inputValue)`를 사용하여 의존성을 제거, 내부 입력에 의한 재실행을 방지.

### 15. 북마크 아이콘 깨짐 (네모로 표시)

- **증상:** `DsContentCard` 등에서 북마크 아이콘(`i-lucide-bookmark`)이 네모박스로 표시됨.
- **원인:** `ContentActions.svelte`에서 `icon={bookmarked ? ...}` 형태로 동적 할당하여 UnoCSS 정적 분석기가 아이콘 이름을 감지하지 못함.
- **해결:** `uno.config.ts`의 `safelist`에 `i-lucide-bookmark`, `i-lucide-bookmark-check` 명시적 추가.

### 16. 드롭다운 스크롤 연쇄 (Scroll Chaining) 방지

- **증상:** 언어 변경 메뉴나 콤보박스 목록 스크롤이 끝에 도달하면 부모 페이지(body)가 스크롤됨.
- **해결:**
  - `LocaleSwitcher.svelte`: `menuClass`에 `overscroll-contain` 유틸리티 추가.
  - `design-system.css`: `.ds-combobox-list` 클래스에 `overscroll-behavior: contain` CSS 속성 추가.

### 17. FilterBar 검색창 초기화(X) 버튼 추가

- **증상:** `LocaleSwitcher` 검색창과 달리 `FilterBar` 검색창에는 입력값 일괄 삭제(X) 버튼이 없음.
- **해결:** `FilterBar.svelte` 내부 `DsInput` 컴포넌트에 `clearable={true}` 속성 추가.

### 18. 코드 블록 복사 버튼 위치 오류

- **증상:** 코드 블록 위에 마우스를 올리면 나타나는 "Copy code" 버튼이 블록 내부가 아닌 왼쪽 화면 밖(또는 엉뚱한 위치)에 표시됨.
- **원인:** `DsTooltip` 컴포넌트(`span` wrapper) 내부에 `absolute`로 위치한 버튼이 배치되는데, `DsTooltip` wrapper 자체가 정적(static) 위치를 가지거나 인라인 요소여서 위치 기준점(containing block) 설정이 꼬임 (특히 LTR/RTL 및 인라인 컨텍스트).
- **해결:** `CodeBlock.svelte` 컨테이너에 `w-full`을 명시하고, `DsTooltip` wrapper(as="div")에 **인라인 스타일**(`style="position: absolute; right: 1rem; top: 1rem; z-index: 10;"`)을 적용하여 CSS 유틸리티 로드 우선순위나 방향성 설정(RTL/LTR) 관련 문제를 원천 차단. 또한 `focus` 트리거를 `focus-within`으로 변경하여 접근성 유지.

### 19. 체크박스 선택 시 크기 변화 (Layout Shift)

- **증상:** 체크박스를 선택(Checked)하면 박스 크기가 미세하게 커지거나 주변 레이아웃이 밀림.
- **원인:** 체크박스 크기가 `1.1rem`(~17.6px)로 설정되어 있는데, 내부 아이콘(`check`) 크기는 `1rem`(16px)임. `border-width`(1px * 2)를 제외한 내부 공간은 약 15.6px이고, 아이콘(16px)이 더 크기 때문에 박스가 강제로 늘어남.
- **해결:** `design-system.css`에서 `.ds-checkbox-control`의 크기를 `1.25rem`(~20px)으로 증가시켜, 아이콘이 내부 여백 안에 안전하게 배치되도록 수정.

### 20. 로케일 변경 직후 랜딩 CTA 링크가 기본 경로로 남음

- **증상:** 언어를 변경해도 랜딩 페이지 CTA(Design System/Coverage) 링크가 `/design-system`처럼 기본 경로로 유지되어, `/ko/design-system` 등 로케일이 반영되지 않음.
- **원인:** `localizeUrl()` 호출에 현재 로케일을 명시하지 않아, locale 변경 후에도 기본 로케일 기준으로 링크가 생성됨.
- **해결:** `page.url`에서 현재 로케일을 파생한 뒤, `localizeUrl(path, { locale })`로 링크를 생성하도록 변경.

### 21. SearchPanel 검색 결과 레이아웃 흔들림 및 텍스트 상단 정렬 문제

- **증상:**
  1. 검색어 길이에 따라 입력창이 줄어들거나 늘어나는 지터링 발생.
  2. "21,875 results"와 같이 결과 수가 많아질 때 줄바꿈되어 레이아웃이 깨짐.
  3. "88 results" 텍스트가 검색 입력창보다 미세하게 위쪽으로 치우쳐 보임(Top-aligned).
  4. 검색 결과가 0개일 때 "0 results" 배지가 사라져서 상태 파악이 어려움.
- **원인:**
  1. `flex-1`이 적용된 입력창 컨테이너에 `min-w-0`이 없어 내부 콘텐츠(placeholder 등)에 의해 크기가 간섭받음.
  2. 결과 수 표시에 `whitespace-nowrap`이 없고, 숫자가 포맷팅(`toLocaleString`)되지 않음.
  3. `.ds-search-header` 클래스명이 다른 전역 스타일이나 내부 flex 설정과 충돌하여 `items-center`가 제대로 적용되지 않음.
  4. 조건부 렌더링(`filtered.length > 0`)으로 인해 0개일 때 DOM이 제거됨.
- **해결:**
  - **입력창 고정:** 입력 필드 래퍼에 `flex-1 min-w-0` 적용.
  - **텍스트 안정화:** 결과 수 컨테이너에 `whitespace-nowrap` 적용 및 숫자 포맷팅(`toLocaleString()`) 추가. 라벨을 동적("results for ...")에서 정적("results")으로 변경.
  - **정렬 수정:** 클래스명을 `.ds-search-panel-header`로 변경하여 충돌 회피 및 `items-center` 적용 보장.
  - **상태 일관성:** 0개일 때도 배지가 보이도록 조건문 제거.
- **적용 시점:** 검색 필드와 결과 카운트가 한 줄에 배치되는 UI에서 레이아웃 안정성이 필요할 때.

### 22. Slider(Single) 포커스 시 트랙 전체에 파란 테두리 발생

- **증상:** `RangeSlider`는 조정 시 썸(Thumb)에만 포커스 링이 생기는데, 단일 `Slider`는 조정하려고 클릭하면 트랙 전체(타원형 배경)에 파란색 테두리가 생김.
- **원인:** `design-system.css`에 **`.ds-slider:focus-within .ds-slider-track { box-shadow: ... }`** 규칙이 있어서, 슬라이더 내부 Input이 포커스를 얻으면 부모 컨테이너(`.ds-slider`)의 `:focus-within`이 트리거되어 트랙 전체에 `box-shadow` 포커스 링이 적용됨.
- **해결:** **해당 규칙을 주석 처리(REMOVED)**함. 포커스 링은 썸(Thumb)에만 `:focus-visible::-webkit-slider-thumb`를 통해 적용하는 것이 올바른 방식임.

### 23. Svelte 5: `$props.id()` 사용 위치 오류

- **증상:** `$props.id()` can only be used at the top level of components as a variable declaration initializer 에러 발생.
- **원인:** `$props.id()`를 `$props()` destructuring 내부에서 기본값으로 사용함 (예: `id = $props.id()`).
- **해결:**

  ```svelte
  <!-- Before (오류) -->
  let {
    id = $props.id(),
    ...rest
  }: Props = $props();

  <!-- After (해결) -->
  const generatedId = $props.id();

  let {
    id: idProp,
    ...rest
  }: Props = $props();

  let id = $derived(idProp ?? generatedId);
  ```

- **주의사항:** `idProp`은 reactive prop이므로 `const`가 아닌 `$derived`를 사용해야 `state_referenced_locally` 경고가 발생하지 않음.
- **적용 시점:** Svelte 5 컴포넌트에서 자동 생성 ID와 사용자 제공 ID를 병합해야 할 때.

### 24. Svelte 5: `{@const}` 배치 위치 오류

- **증상:** `{@const}` must be the immediate child of `{#snippet}`, `{#if}`, `{:else if}`, `{:else}`, `{#each}`, `{:then}`, `{:catch}`, `<svelte:fragment>`, `<svelte:boundary>` or `<Component>` 에러 발생.
- **원인:** `{@const}`를 `<div>`, `<li>` 등 HTML 요소 안에 배치했을 때 발생. Svelte의 `{@const}`는 블록 디렉티브(`{#each}`, `{#if}` 등)의 **직접 자식**으로만 사용 가능.
- **해결:**

  ```svelte
  <!-- Before (오류) -->
  {#each items as item}
    <li>
      <div>
        {@const computed = calculate(item)}
        {computed}
      </div>
    </li>
  {/each}

  <!-- After (해결) -->
  {#each items as item}
    {@const computed = calculate(item)}
    <li>
      <div>
        {computed}
      </div>
    </li>
  {/each}
  ```

- **적용 시점:** `{#each}` 루프 내에서 파생값을 계산하여 여러 곳에서 사용할 때, 반드시 블록 디렉티브 바로 아래에 배치.

### 25. MediaQueryList 레거시 API(`addListener`/`removeListener`) 타입 에러

- **증상:** `Property 'addListener' does not exist on type 'never'` 타입 에러 발생.
- **원인:** `MediaQueryList`의 레거시 API(`addListener`/`removeListener`)는 Safari 13 이전에만 필요한 deprecated API. TypeScript가 `"addEventListener" in mq` 체크 후 `else` 분기에서 `mq`를 `never`로 추론.
- **해결:** 레거시 폴백을 제거하고 현대 API만 사용.

  ```typescript
  // Before (타입 에러)
  if ("addEventListener" in mq) mq.addEventListener("change", onChange);
  else mq.addListener(onChange); // Error: 'never' has no property 'addListener'

  // After (해결)
  mq.addEventListener("change", onChange);
  ```

- **적용 시점:** `matchMedia()` 이벤트 리스너 등록 시. IE 미지원 프로젝트에서는 레거시 폴백 불필요.

### 26. Biome: `The imports and exports are not sorted` 경고

- **증상:** `The imports and exports are not sorted` 경고 발생.
- **원인:** Biome의 `organizeImports` 규칙에 따라 import/export가 정해진 순서로 정렬되어야 함.
- **해결:** `biome check --write` 명령으로 자동 수정.

  ```bash
  bunx biome check --write <파일경로>
  ```

- **주의사항:**
  - `biome format --write`는 코드 스타일만 정리하며, import/export 정렬은 수정하지 않음.
  - `biome check --write`를 사용해야 lint 규칙 + 포맷팅 모두 적용됨.
- **정렬 규칙 (기본값):**
  - `export type`이 `export { default as ... }`보다 먼저
  - 같은 모듈의 export는 그룹화
