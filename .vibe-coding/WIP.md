# Work In Progress (WIP)

현재 진행 중인 작업의 **세부 실행 계획**입니다.

---

## 코드베이스 리팩토링 계획

INSIGHTS 문서(`elegant-typescript-patterns.md`, `accessibility-ux-patterns.md`, `mobile-ux-patterns.md`)에 정의된 패턴과 현재 코드를 비교 분석한 결과입니다.

### 분석 요약

| 구분 | 상태 |
|------|------|
| 스토어 패턴 | ✅ 우수 (팩토리+Getter, as const, Cascading Fallback 적용됨) |
| 접근성 패턴 | ⚠️ 개선 필요 (타입 가드 누락, Home/End 키 미지원 컴포넌트 있음) |
| 코드 중복 | ⚠️ 개선 필요 (드롭다운 로직 반복, 스크롤바 스타일 중복) |
| 타입 안전성 | ⚠️ 개선 가능 (일부 타입 가드 누락, PersistedState 인터페이스 미정의) |

---

## 1단계: 타입 안전성 강화 (우선순위: 높음)

접근성 패턴 문서에 정의된 타입 가드를 적용하여 런타임 안정성을 높입니다.

### 1-1. LanguagePicker.svelte 타입 가드 추가

**파일:** `src/lib/components/header-actions/LanguagePicker.svelte`

**문제:**

- `handleOutsideClick`에서 `event.target as Node` 직접 캐스팅 (타입 안전하지 않음)

**수정 내용:**

```typescript
// Before
function handleOutsideClick(event: MouseEvent) {
  if (
    showLanguageModal &&
    modalRef &&
    !modalRef.contains(event.target as Node) && // 위험한 캐스팅
    ...
  )
}

// After
function handleOutsideClick(event: MouseEvent) {
  const target = event.target;
  if (!(target instanceof Node)) return; // 타입 가드

  if (
    showLanguageModal &&
    modalRef &&
    !modalRef.contains(target) && // 안전
    ...
  )
}
```

- [x] `handleOutsideClick`에 `instanceof Node` 타입 가드 추가
- [x] `handleMenuKeyDown`에 `items.length === 0` 빈 배열 가드 추가

---

### 1-2. FontSizePicker.svelte 타입 가드 추가

**파일:** `src/lib/components/header-actions/FontSizePicker.svelte`

- [x] `handleOutsideClick`에 `instanceof Node` 타입 가드 추가
- [x] `handleMenuKeyDown`에 빈 배열 가드 추가

---

### 1-3. UserMenu.svelte 타입 가드 추가

**파일:** `src/lib/components/header-actions/UserMenu.svelte`

- [x] `handleOutsideClick`에 `instanceof Node` 타입 가드 추가
- [x] `handleMenuKeyDown`에 빈 배열 가드 추가
- [x] `maskEmail` 함수에 early return 개선 (이미 부분적 적용됨)

---

### 1-4. persisted-state.svelte.ts 인터페이스 정의

**파일:** `src/lib/stores/persisted-state.svelte.ts`

**문제:** 반환 타입 인터페이스가 명시되지 않아 자동완성이 약함.

**수정 내용:**

```typescript
// 추가할 인터페이스
interface PersistedState<T> {
  get current(): T;
  init(): void;
  set(value: T): void;
}

// 반환 타입 명시
export function createPersistedState<T extends string | number>(
  ...
): PersistedState<T> { // 명시적 반환 타입
  ...
}
```

- [x] `PersistedState<T>` 인터페이스 추가
- [x] `createPersistedState` 함수에 반환 타입 명시

---

## 2단계: 접근성 개선 (우선순위: 중간)

### 2-1. LanguagePicker.svelte Home/End 키 지원

**파일:** `src/lib/components/header-actions/LanguagePicker.svelte`

**문제:** `handleMenuKeyDown`에서 Home/End 키가 지원되지 않음 (접근성 패턴 문서 권장사항)

**수정 내용:**

```typescript
function handleMenuKeyDown(event: KeyboardEvent) {
  // ...기존 코드...
  switch (event.key) {
    // ...ArrowUp, ArrowDown...
    case 'Home':
      event.preventDefault();
      items[0]?.focus();
      break;
    case 'End':
      event.preventDefault();
      items[items.length - 1]?.focus();
      break;
  }
}
```

- [ ] Home/End 키 핸들링 추가

---

### 2-2. UserMenu.svelte Home/End 키 지원

**파일:** `src/lib/components/header-actions/UserMenu.svelte`

- [ ] Home/End 키 핸들링 추가

---

### 2-3. Header.svelte 모바일 메뉴 Home/End 키 지원

**파일:** `src/lib/components/Header.svelte`

- [ ] `handleMobileMenuKeyDown`에 Home/End 키 핸들링 추가

---

## 3단계: 코드 중복 제거 (우선순위: 중간)

### 3-1. 스크롤바 스타일 중복 제거

**문제:** `LanguagePicker.svelte`와 `UserMenu.svelte`에 동일한 `.thin-scrollbar` 스타일이 중복됨.

**해결:** 이미 `src/styles/scrollbar.css`가 있으므로 해당 파일에 `.thin-scrollbar` 클래스를 추가하고, 컴포넌트 내부 스타일 제거.

- [ ] `src/styles/scrollbar.css`에 `.thin-scrollbar` 클래스 추가
- [ ] `LanguagePicker.svelte` 내부 `<style>` 블록 제거
- [ ] `UserMenu.svelte` 내부 `<style>` 블록 제거

---

### 3-2. 드롭다운 메뉴 공통 로직 검토

**현황:** 4개 컴포넌트(LanguagePicker, FontSizePicker, UserMenu, FooterMenu)에서 거의 동일한 드롭다운 로직 반복.

**판단:** 현재 각 컴포넌트가 140~260줄 수준으로 관리 가능하며, 추상화 시 오히려 복잡도가 증가할 수 있음. **우선순위: 낮음 (현 상태 유지)**

> 💡 향후 드롭다운이 더 추가되거나 로직이 복잡해지면 Svelte Action + Composable 패턴으로 추출 검토.

---

## 4단계: 추가 패턴 적용 (우선순위: 낮음)

### 4-1. site.ts에 satisfies 적용

**파일:** `src/lib/constants/site.ts`

**현재:** `as const`만 사용 중

**개선:** `satisfies`로 타입 검증 추가

```typescript
// Before
export const site = {
  name: 'Vibe',
  // ...
} as const;

// After
interface SiteConfig {
  name: string;
  description: string;
  keywords: string[];
  email: string;
  links: { github: string };
}

export const site = {
  name: 'Vibe',
  // ...
} as const satisfies SiteConfig;
```

- [ ] `SiteConfig` 인터페이스 정의
- [ ] `satisfies` 적용

---

## 작업 순서 요약

| 순서 | 작업 | 파일 수 | 예상 시간 |
|------|------|---------|-----------|
| 1 | 타입 가드 추가 | 4개 | 15분 |
| 2 | Home/End 키 지원 | 3개 | 10분 |
| 3 | 스크롤바 스타일 중복 제거 | 3개 | 5분 |
| 4 | satisfies 패턴 적용 | 1개 | 5분 |

총 예상 시간: **35분**

---

> **참고:** 작업이 완료되면 이 파일의 내용은 초기화되거나 다음 작업을 위해 덮어씌워질 수 있습니다.
