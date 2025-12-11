# 접근성 및 UX 패턴 가이드

접근성(Accessibility, a11y)과 사용자 경험(UX) 향상을 위한 패턴 모음입니다. 웹, 모바일, 데스크톱 등 플랫폼에 관계없이 적용할 수 있습니다.

## 드롭다운 메뉴 패턴

WAI-ARIA 명세에 기반한 접근 가능한 메뉴 패턴입니다.

> [!TIP]
> **사이트 내비게이션**(링크 모음)에는 `role="menu"` 없이 단순 `ul > li > a` 구조를 권장합니다.
> **앱형 메뉴**(설정, 계정, 컨텍스트 메뉴)에는 아래 `role="menu"` / `role="menuitem"` 패턴을 사용하세요.

### 필수 ARIA 속성

```svelte
<!-- 메뉴 트리거 버튼 -->
<button
  type="button"
  id="menu-button"
  aria-label="메뉴 설명"
  aria-haspopup="menu"
  aria-expanded={isOpen}
  aria-controls="menu-id"
>

<!-- 메뉴 컨테이너 -->
<div
  id="menu-id"
  role="menu"
  aria-labelledby="menu-button"
  tabindex="-1"
>
  <a role="menuitem">항목 1</a>
  <a role="menuitem">항목 2</a>
</div>
```

| 속성 | 용도 |
|------|------|
| `aria-label` | 스크린 리더에 버튼 용도 설명 |
| `aria-haspopup="menu"` | 메뉴가 열린다는 것을 알림 |
| `aria-expanded` | 현재 메뉴 열림/닫힘 상태 |
| `aria-controls` | 버튼이 제어하는 요소 ID |
| `aria-labelledby` | 메뉴가 속한 버튼 ID |
| `role="menu"` | 메뉴 컨테이너임을 명시 |
| `role="menuitem"` | 메뉴 항목임을 명시 |

### 키보드 탐색 구현

```typescript
function handleMenuKeyDown(event: KeyboardEvent) {
  if (!menuRef) return;

  const items = Array.from(
    menuRef.querySelectorAll<HTMLElement>('[role="menuitem"]')
  );
  if (items.length === 0) return; // 빈 배열 가드

  const active = document.activeElement;
  const currentIndex = active ? items.indexOf(active as HTMLElement) : -1;

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      items[(currentIndex + 1) % items.length]?.focus();
      break;
    case 'ArrowUp':
      event.preventDefault();
      items[(currentIndex - 1 + items.length) % items.length]?.focus();
      break;
    case 'Home':
      event.preventDefault();
      items[0]?.focus();
      break;
    case 'End':
      event.preventDefault();
      items[items.length - 1]?.focus();
      break;
    case 'Escape':
      event.stopPropagation();
      closeMenu({ focusButton: true });
      break;
  }
}
```

| 키 | 동작 |
|---|---|
| `↑` / `↓` | 메뉴 항목 이동 (순환) |
| `Home` | 첫 번째 항목으로 이동 |
| `End` | 마지막 항목으로 이동 |
| `Escape` | 메뉴 닫기 + 버튼 포커스 복귀 |
| `Enter` / `Space` | 항목 선택 (네이티브) |

### 메뉴 열림/닫힘 로직

```typescript
// 닫기 헬퍼: 키보드 닫기 시에만 버튼에 포커스 복귀
function closeMenu(options?: { focusButton?: boolean }) {
  if (!showMenu) return;
  showMenu = false;
  if (options?.focusButton) {
    buttonRef?.focus();
  }
}

// 열기: 첫 항목에 자동 포커스
async function openMenu() {
  showMenu = true;
  await tick(); // DOM 업데이트 대기
  const firstItem = menuRef?.querySelector('[role="menuitem"]');
  firstItem?.focus();
}

// ESC 키로 닫기
function handleKeyDown(event: KeyboardEvent) {
  if (showMenu && event.key === 'Escape') {
    event.stopPropagation();
    closeMenu({ focusButton: true });
  }
}

// 외부 클릭 닫기
function handleOutsideClick(event: MouseEvent) {
  const target = event.target;
  if (!(target instanceof Node)) return; // 타입 가드

  if (
    showMenu &&
    !menuRef?.contains(target) &&
    !buttonRef?.contains(target)
  ) {
    closeMenu(); // 마우스 클릭: 포커스 이동 없음
  }
}

// 포커스 이탈 닫기
function handleFocusOut(event: FocusEvent) {
  const newTarget = event.relatedTarget;
  if (!(newTarget instanceof Node)) {
    closeMenu(); // 포커스가 완전히 사라진 경우
    return;
  }

  if (menuRef?.contains(newTarget) || buttonRef?.contains(newTarget)) {
    return;
  }
  closeMenu();
}
```

> [!TIP]
> `focusButton` 옵션은 키보드 닫기 시에만 `true`로 설정합니다. 마우스 클릭 닫기 시에는 사용자가 다른 곳을 클릭한 것이므로 포커스를 강제 이동하면 오히려 방해됩니다.

## RTL(Right-to-Left) 언어 지원

아랍어 등 RTL 언어를 위한 CSS 논리적 속성 사용 패턴입니다.

### 물리적 속성 → 논리적 속성

| 물리적 (사용 금지) | 논리적 (권장) |
|---|---|
| `left` / `right` | `start` / `end` |
| `margin-left` | `margin-inline-start` |
| `border-right` | `border-inline-end` |
| `text-align: left` | `text-align: start` |

### UnoCSS 유틸리티

```html
<!-- ❌ RTL에서 깨짐 -->
<div class="absolute right-0 border-l">

<!-- ✅ RTL 자동 대응 -->
<div class="absolute end-0 border-s">
```

### 실제 사례: 드롭다운 메뉴 위치

**문제:** 드롭다운 메뉴에 `right-0` 사용 시, 아랍어에서 메뉴가 **왼쪽**으로 열리면서 화면 밖으로 사라짐

```svelte
<!-- ❌ 레거시: 아랍어에서 메뉴가 왼쪽 끝으로 붙어 잘림 -->
<div class="absolute right-0 bottom-full ...">

<!-- ✅ 수정: 모든 언어에서 버튼 옆에 정상 표시 -->
<div class="absolute end-0 bottom-full ...">
```

| 언어 | `right-0` | `end-0` |
|------|-----------|---------|
| LTR (한국어, 영어) | 화면 오른쪽 ✅ | 텍스트 끝(오른쪽) ✅ |
| RTL (아랍어) | 화면 오른쪽 ❌ | 텍스트 끝(왼쪽) ✅ |

> [!NOTE]
> `right-0`는 항상 화면 오른쪽에 붙고, `end-0`는 언어별 "끝 방향"에 맞춰 LTR에서는 오른쪽, RTL에서는 왼쪽에 붙습니다.
>
> [!IMPORTANT]
> 드롭다운, 팝오버, 사이드바 등 **위치 지정이 필요한 UI**는 반드시 논리적 속성(`start`/`end`)을 사용하세요.
>
> [!WARNING]
> 단순히 `end-0`만 쓰면 화면 경계에서 여전히 잘릴 수 있습니다.
> [Floating UI](https://floating-ui.com/), Popper 등 라이브러리의 자동 flip + shift 기능을 활용하세요.

```typescript
import { computePosition, flip, shift, offset, type Placement } from '@floating-ui/dom';

const DROPDOWN_PLACEMENT = 'bottom-end' as const satisfies Placement;

async function positionDropdown(button: HTMLElement, menu: HTMLElement) {
  const { x, y } = await computePosition(button, menu, {
    placement: DROPDOWN_PLACEMENT,
    middleware: [offset(8), flip(), shift({ padding: 8 })],
  });
  Object.assign(menu.style, { left: `${x}px`, top: `${y}px` });
}
```

### 코드 블록 LTR 고정

RTL 언어에서도 코드는 항상 LTR로 표시해야 합니다.

```css
html:lang(ar) pre,
html:lang(ar) code {
  direction: ltr;
  text-align: left;
  unicode-bidi: embed;
}
```

### Bidi 격리 (Unicode Isolation)

**문제:** `Resend Inc.`가 아랍어에서 `.Resend Inc`로 렌더링됨 (마침표가 RTL 흐름에 휩쓸림)

**해결:** Unicode 격리 문자로 LTR 텍스트를 감싸기

```typescript
// Unicode LRI (U+2066) + PDI (U+2069)로 영어 회사명을 RTL 컨텍스트와 격리
const isolatedName = `\u2066${processor.name}\u2069`;
```

| 유니코드 | 이름 | 역할 |
|----------|------|------|
| `U+2066` | LRI (Left-to-Right Isolate) | LTR 텍스트 시작 격리 |
| `U+2067` | RLI (Right-to-Left Isolate) | RTL 텍스트 시작 격리 |
| `U+2068` | FSI (First Strong Isolate) | 자동 방향 감지 격리 |
| `U+2069` | PDI (Pop Directional Isolate) | 격리 종료 |

> [!TIP]
> CSS `unicode-bidi: isolate`보다 **특정 텍스트 조각만** 정밀하게 격리할 수 있어 마크다운 테이블, 동적 문자열 등에서 유용합니다.

## 프라이버시 보호 패턴

스트리머/방송인의 개인정보가 노출되지 않도록 하는 패턴입니다.

### 이메일 마스킹

```typescript
function maskEmail(email: string): string {
  if (!email.includes('@')) return '***'; // Early return

  const [local, domain] = email.split('@');
  if (!local || !domain) return '***';

  const maskedLocal = local.length > 1 ? `${local[0]}***` : '***';
  const maskedDomain = domain
    .split('.')
    .map((part) => part.length > 1 ? `${part[0]}${'*'.repeat(part.length - 1)}` : part)
    .join('.');

  return `${maskedLocal}@${maskedDomain}`; // 예: t***@e******.c**
}
```

### 보기 토글 UI

```svelte
<script>
  import * as m from '$lib/paraglide/messages.js';
</script>

<p>{showEmail ? user.email : maskEmail(user.email)}</p>
<button
  onclick={() => showEmail = !showEmail}
  aria-label={showEmail ? m.hide_email() : m.show_email()}
>
  {#if showEmail}
    <span class="i-lucide-eye-off" />
  {:else}
    <span class="i-lucide-eye" />
  {/if}
</button>
```

> [!IMPORTANT]
> 메뉴가 닫힐 때 `showEmail = false`로 리셋하여 다음에 열릴 때 항상 마스킹 상태로 시작합니다.

## 포커스 스타일 가이드

키보드 사용자를 위한 포커스 표시 패턴입니다.

### 기본 포커스 스타일

```css
/* 기본 포커스 링 */
:focus-visible {
  outline: 2px solid oklch(var(--ring));
  outline-offset: 2px;
}

/* 메뉴 항목 포커스 (배경색 변경) */
.menu-item:focus {
  background-color: oklch(var(--accent));
  color: oklch(var(--accent-foreground));
}
```

### 포커스와 호버 통합

```html
<a
  class="hover:bg-accent hover:text-accent-foreground
         focus:bg-accent focus:text-accent-foreground"
  role="menuitem"
>
```

> [!TIP]
> 호버와 포커스 스타일을 동일하게 적용하면 마우스/키보드 사용자 모두에게 일관된 경험을 제공합니다.

## 사용자 선호도 기반 접근성

사용자의 시스템 설정을 존중하는 미디어 쿼리 패턴입니다.

### 모션 감소 (Reduced Motion)

전정기관 장애, 편두통 등 애니메이션에 민감한 사용자를 위한 설정입니다.

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 고대비 모드 (High Contrast)

저시력 사용자를 위한 대비 강화 설정입니다.

```css
@media (prefers-contrast: more) {
  :root {
    --border: 0% 0 0; /* 검은색 테두리 */
    --ring: 0% 0 0;
  }
}

/* Windows 고대비 모드 */
@media (forced-colors: active) {
  button,
  a {
    forced-color-adjust: none; /* 스타일 유지 필요한 경우 */
  }
}
```

### 투명도 감소 (Reduced Transparency)

유리 효과, 블러 등 반투명 요소가 시각적으로 불편한 사용자를 위한 설정입니다. Safari 15.4+, Chrome 118+ 지원.

```css
@media (prefers-reduced-transparency: reduce) {
  .glass,
  .backdrop-blur {
    background: Canvas !important;
    backdrop-filter: none !important;
  }
}

## 랜드마크 (Landmarks)

스크린 리더 사용자가 페이지 구조를 빠르게 파악하고 이동할 수 있도록 합니다.

### 필수 랜드마크 요소

```html
<header>사이트 헤더</header>
<nav aria-label="주 메뉴">네비게이션</nav>
<main>메인 콘텐츠 (페이지당 하나)</main>
<aside aria-label="관련 링크">사이드바</aside>
<footer>사이트 푸터</footer>
```

| 요소 | 암묵적 role | 용도 |
|------|-------------|------|
| `<header>` | banner | 사이트 로고, 제목 |
| `<nav>` | navigation | 주요 링크 모음 |
| `<main>` | main | 페이지 핵심 콘텐츠 |
| `<aside>` | complementary | 보조 콘텐츠 |
| `<footer>` | contentinfo | 저작권, 약관 등 |

> [!TIP]
> 동일한 역할의 랜드마크가 여러 개면 `aria-label`로 구분하세요.
> 예: `<nav aria-label="주 메뉴">`, `<nav aria-label="푸터 링크">`

## 모달/다이얼로그 패턴

모달 열릴 때 배경 콘텐츠를 비활성화하는 패턴입니다.

### 기본 구조

```html
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
>
  <h2 id="dialog-title">제목</h2>
  <!-- 내용 -->
  <button aria-label="닫기">×</button>
</div>

<!-- 배경 오버레이 -->
<div class="fixed inset-0 bg-black/50" />
```

### inert 속성으로 배경 비활성화

모달 뒤 콘텐츠를 스크린 리더와 키보드 탐색에서 제외합니다. Chrome 102+, Safari 15.5+, Firefox 112+ 지원.

```html
<!-- 모달이 열려 있으면 배경 비활성화 -->
<main inert={isModalOpen}>
  ...메인 콘텐츠
</main>

<dialog open={isModalOpen}>
  ...모달 내용
</dialog>
```

> [!IMPORTANT]
> `inert` 없이 `aria-modal="true"`만 쓰면 일부 스크린 리더가 배경 콘텐츠를 읽습니다.

### 네이티브 dialog 태그 (권장)

`<dialog>` 태그와 `showModal()` 메서드 사용 시 포커스 트랩, ESC 닫기가 브라우저 레벨에서 자동 지원됩니다.

```svelte
<script lang="ts">
  let dialogRef = $state<HTMLDialogElement | null>(null);

  function openModal() {
    dialogRef?.showModal();
  }
</script>

<button type="button" onclick={openModal}>모달 열기</button>

<dialog
  bind:this={dialogRef}
  class="backdrop:bg-black/50 rounded-lg p-6"
>
  <h2>제목</h2>
  <p>내용</p>
  <button type="button" onclick={() => dialogRef?.close()}>닫기</button>
</dialog>
```

## 색상 대비 기준 (WCAG AA)

| 요소 | 최소 대비 비율 | 대형 텍스트 (18pt+ 또는 14pt 볼드+) |
|------|----------------|-------------------------------------|
| 일반 텍스트 | 4.5:1 | 3:1 |
| UI 컴포넌트 및 그래픽 | 3:1 | - |
| 비활성화 상태 텍스트 | 예외 (기준 없음) | - |

> [!TIP]
> 색상 대비 검사 도구: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/), [Colour Contrast Analyser (CCA)](https://www.tpgi.com/color-contrast-checker/)

## 스크린 리더 전용 텍스트 (sr-only)

아이콘만 있는 버튼이나 시각적으로 표현하기 힘든 정보를 전달할 때 사용합니다.

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

> [!TIP]
> UnoCSS/Tailwind에는 이미 `sr-only` 유틸리티가 포함되어 있습니다.

## 건너뛰기 링크 (Skip Navigation)

키보드/스크린 리더 사용자가 반복되는 헤더를 건너뛰고 메인 콘텐츠로 바로 이동할 수 있습니다. **WCAG 2.4.1 필수 요소.**

```html
<body>
  <a
    href="#main-content"
    class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-50 focus:p-2 focus:bg-white focus:text-black"
  >
    본문으로 바로가기
  </a>

  <header>...</header>
  <nav>...</nav>

  <main id="main-content" tabindex="-1">
    ...
  </main>
</body>
```

> [!TIP]
> 이동 타겟(`main`)에 `tabindex="-1"`을 주어야 포커스가 정확히 이동합니다.

## 폼 유효성 검사 및 에러 연결

입력 필드와 에러 메시지를 프로그램적으로 연결해야 스크린 리더가 오류를 함께 읽어줍니다.

```svelte
<label for="email">이메일</label>
<input
  id="email"
  type="email"
  aria-invalid={!!errorMessage}
  aria-describedby={errorMessage ? "email-error" : undefined}
/>

{#if errorMessage}
  <p id="email-error" role="alert" class="text-destructive">
    {errorMessage}
  </p>
{/if}
```

| 속성 | 역할 |
|------|------|
| `aria-invalid` | "오류 있음" 상태를 알림 |
| `aria-describedby` | 포커스 시 에러 메시지 내용을 함께 읽음 |
| `role="alert"` | 메시지 나타나는 즉시 스크린 리더가 읽음 |

## 동적 알림 (Live Regions)

화면의 시각적 변화(저장 완료, 로딩 끝)를 스크린 리더 사용자에게 전달합니다.

```html
<div role="status" aria-live="polite" class="fixed bottom-4 end-4">
  {#if showToast}
    <div class="bg-card p-4 rounded shadow">저장이 완료되었습니다.</div>
  {/if}
</div>
```

| 값 | 동작 | 사용 예시 |
|---|---|---|
| `aria-live="polite"` | 현재 낭독 끝나면 읽음 (권장) | 저장 완료, 검색 결과 갱신 |
| `aria-live="assertive"` | 즉시 말을 끊고 읽음 | 서버 오류, 세션 만료 경고 |

## SPA 페이지 이동 시 접근성 (SvelteKit)

SPA는 페이지 이동 시 브라우저 새로고침이 없어 스크린 리더가 변경을 인지하지 못할 수 있습니다.

```svelte
<script>
  import { afterNavigate } from '$app/navigation';

  afterNavigate(() => {
    document.getElementById('main-content')?.focus();
  });
</script>
```

## 터치 타겟 크기 (모바일)

모바일 사용자가 실수로 다른 버튼을 누르지 않도록 충분한 크기와 간격을 확보합니다.

| 항목 | 권장 값 |
|------|---------|
| 터치 타겟 최소 크기 | 44×44px (WCAG 2.5.8) |
| 버튼 간 최소 간격 | 8px 이상 |

> [!TIP]
> 아이콘 크기가 작아도, 터치 영역(`padding`)을 확보하면 됩니다.

## 줌 차단 금지

저시력 사용자에게 핀치 줌은 필수 기능입니다. 뷰포트 메타 태그에서 줌을 차단하지 마세요.

```html
<!-- ✅ 권장 -->
<meta name="viewport" content="width=device-width, initial-scale=1">

<!-- ❌ 비권장 (줌 차단) -->
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
```

## 참고 자료

- [WAI-ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/)
- [MDN: ARIA Menu Role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/menu_role)
- [Inclusive Components](https://inclusive-components.design/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
