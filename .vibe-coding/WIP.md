# Work In Progress

> 복잡한 작업의 세부 계획을 기록하고 추적하는 공간입니다.
> `AGENTS.md`의 [기본 운영 원칙]에 따라 복잡한 요청 시 이 문서를 활용합니다.
> 참고: `.vibe-coding/.suggestions.txt`의 제안 사항이 반영되었습니다.

## 작업 배경 및 목적

이 프로젝트는 현재 **디자인 시스템(DS) 고도화 및 전면 적용** 단계에 있습니다. 초기 개발 단계에서 파편화된 UI 구현체들을 표준 DS 컴포넌트로 통합하고, DS 컴포넌트 자체의 품질(접근성, SSR 안전성, 확장성)을 강화하는 것이 핵심 목표입니다.

**왜 이 작업을 하는가?**

1. **일관성 (Consistency)**: `header-actions`, `footer` 등에서 개별적으로 구현된 커스텀 드롭다운/버튼을 DS 컴포넌트로 교체하여 UI/UX 통일성을 확보합니다.
2. **품질 (Quality)**: 개별 구현체에서 놓치기 쉬운 **웹 접근성(A11y)**, **키보드 네비게이션**, **SSR ID 안정성** 등을 DS 수준에서 보장합니다.
3. **생산성 (Productivity)**: 강력하고 유연한 기초 컴포넌트(`DsDropdown`, `DsInput` 등)를 제공하여 향후 기능 개발 시 UI 구현 비용을 절감합니다.
4. **유지보수 (Maintainability)**: 스타일과 동작 로직을 중앙에서 관리하여, 디자인 변경이나 버그 수정 시 전역 반영이 용이하도록 합니다.

## 현재 작업: 디자인 시스템 컴포넌트 개선

전체 13개 DS 컴포넌트를 검토하여 기능 추가 및 개선이 필요한 부분을 정리합니다.

## 0. 공통 아키텍처 및 정책 개선 (우선순위 높음)

- [x] **SSR/하이드레이션 안전한 ID 정책**: `useId` 패턴 도입 (`$lib/shared/utils/use-id.ts`)
  - Dropdown, Tooltip 적용 완료
- [x] **제어형 상태 유틸**: `createControllableState` 유틸 도입 (`$lib/shared/utils/controllable-state.svelte.ts`)
  - Dropdown, Tooltip 적용 완료 (Dialog는 기존 제어형 유지)
- [x] **타입/Intent 통일**: `types.ts` 생성 (`$lib/components/design-system/types.ts`)
  - Size, Intent, IntentWithNeutral, IntentCss, ButtonVariant, IconButtonVariant, InputVariant 정의
  - `toIntentCss()` 변환 함수 제공 (danger → error)
  - Button, IconButton, LinkButton 적용 완료
- [x] **스니펫 네이밍 표준화**: 현재 상태 유지 (DsDropdown 확장 시 `trigger` 슬롯 도입 예정)

---

## 1. DsDropdown 확장 ⭐ (우선순위 높음)

커스텀 드롭다운 4개를 DS로 마이그레이션하기 위한 확장.

### Phase 1: 핵심 확장 (안전성 및 계약)

- [x] `trigger` 슬롯 구현 - `TriggerProps` (id, aria-controls, aria-expanded, handlers) 제공 계약 명시
- [x] `itemSelector` prop - 키보드 탐색 대상 커스터마이징 (기본값 하드코딩 상태, prop화 필요)
- [x] `align` prop - `start` | `end`. CSS `data-ds-align` 속성으로 처리 추천
- [x] `disabled` prop - 트리거 비활성화 처리
- [x] **SSR ID 안정화** - triggerId/menuId 생성 로직 개선

### Phase 2: 레이아웃 및 모드

- [x] `items` vs `children` 모드 분리 - Union Props로 명확한 타입 정의
- [x] `maxHeight` prop - `menuClass` prop으로 대체하여 스타일 제어 가능
- [x] `menuClass` prop - 메뉴 컨테이너 스타일링 (Grid 등)

### Phase 3: 동작 및 역할

- [x] `close` 헬퍼 전달 - `children` 스니펫에 `close` 함수 제공 (커스텀 아이템 클릭 시 닫기용)
- [x] `haspopup` prop - `menu` (액션) vs `listbox` (선택) 역할 분리
  - *참고: 폼 선택 목적은 별도 `DsSelect` 컴포넌트로 분리 권장*

### Phase 4: 슬롯 확장

- [x] `header` / `footer` 슬롯

---

## 2. DsButton / IconButton / LinkButton 개선

### 기능 확장

- [x] `leftIcon` / `rightIcon` 대신 `start` / `end` 스니펫 지원 (확장성 확보)
- [x] `fullWidth` prop - `data-ds-full-width="true"` 속성으로 처리
- [x] **Loading UX 개선** - `loadingText` 외에 스피너 아이콘(`loader-circle`) 기본 제공 옵션 추가, `aria-disabled` 유지

---

## 3. DsDialog 개선

### 정책 분리 및 접근성

- [x] `closeOnOutsideClick` / `closeOnEscape` 독립 옵션화
- [x] **닫힘 후 포커스 복귀** - `returnFocusTo` 옵션 또는 이전 `activeElement` 자동 복귀 로직 구현
- [x] `scrollable` prop - Header/Footer 고정, Body만 스크롤 구조 (`max-height` 토큰 활용)
- [x] `size` prop

---

## 4. DsTooltip 개선

### 구조 개선

- [x] `placement` 세분화 - 정렬 축(`side`, `align`) 분리 고려 또는 `top-start` 등 조합형 지원
- [x] `arrow` prop - CSS 변수(`--tooltip-arrow-size`) 기반 토큰화
- [ ] **Interactive Tooltip** - 툴팁 내 상호작용 필요 시 `DsPopover`로 분리 검토

---

## 5. DsCard 개선

- [x] `padding`, `radius` 토큰화 - `data-ds-padding` 등을 통해 CSS 변수 제어 (`--card-padding`)
- [x] `variant` prop
- [x] `header` / `footer` 슬롯

---

## 6. DsToast 개선

- [x] **Store 분리** - `duration` 등 로직은 Store에서 관리, `DsToastRegion`은 뷰만 담당
- [x] `position` 토큰화 - `data-ds-position` 속성으로 CSS 제어
- [x] `action` 슬롯 - 커스텀 액션 지원

---

## 7. DsInput / DsField 개선

### 기능 보강

- [x] `start` / `end` 슬롯 - 아이콘, 단위, 버튼 등 (`div.relative` 래퍼 구조 도입)
- [x] **Ref 노출** - 버튼과 일관되게 `ref` prop 제공 (포커싱 제어 등)
- [x] `clearable` prop - 접근성(ESC clear, 포커스 순서) 고려하여 구현
- [x] 패딩 계산 토큰화 - 아이콘 유무에 따른 패딩 자동 계산 (`--input-padding-start` 등)

---

## 8. 신규 컴포넌트 후보

### 우선 검토

- [x] **DsSelect** - `DsDropdown`과 역할 분리. Form 연동, Native Select 유사 동작
- [x] **DsTextarea** - `DsInput` 스타일 공유
- [x] **DsSkeleton** - Layout Shift 방지용 로딩 플레이스홀더

### 추후 검토

- [x] **DsCheckbox** / **DsRadioGroup** / **DsSwitch**
- [x] **DsAvatar** / **DsBadge**
- [x] **DsTabs** / **DsAccordion**
- [x] **DsPopover** (Interactive Tooltip 대체재)

---

## 문서 및 테스트 (신설)

- [ ] **접근성 테스트 보강** - Dropdown 완료, Dialog/Popover 등 추가 필요
- [ ] **시각 회귀 테스트** - `toMatchScreenshot` 기반으로 도입 검토

---

## 작업 우선순위

1. **DsDropdown 확장** (Phase 1, 2 집중) -> 4개 커스텀 드롭다운 마이그레이션
2. **DsButton / DsInput 개선** (사용 빈도 높음)
3. **DsDialog 접근성 개선** (포커스 복귀 등)
4. 신규 컴포넌트 (`DsSelect`, `DsSkeleton`) 도입

## 다음 액션 (테스트 및 마무리)

- [x] 공통 유틸(`createControllableState`) 및 SSR Safe ID 로직 준비
- [x] Phase 1 (Trigger Slot, Align, Disabled) 구현
- [x] 커스텀 드롭다운 3종(Language, User, FontSize) 마이그레이션 완료
- [x] **DsButton / IconButton / LinkButton** `start` / `end` 슬롯 및 Loading UX 개선
- [x] **DsDialog** 접근성(Focus Trap, Return Focus) 및 옵션 분리 개선
- [x] **DsTooltip** placement 세분화 및 Arrow 구현
- [x] **DsCard** Variant/Padding 토큰화 및 Header/Footer 슬롯 추가
- [x] **DsToast** Store 분리 및 Position 토큰화
- [x] **DsInput** start/end 슬롯 및 Clearable 구현
- [x] **DsSelect** 컴포넌트 신규 구현
- [x] **DsTextarea / DsSkeleton** 컴포넌트 신규 구현
- [x] **README.md** DS 운영 규칙(권장) 정리
- [x] **접근성 테스트(드롭다운)** 추가
- [ ] **접근성 테스트** 및 **시각 회귀 테스트** 수행 및 검증

## 웹페이지 구축용 DS 확장 로드맵 (P0/P1/P2)

요구된 페이지 범위(마케팅 + 문서 + 대시보드 + 정책/지원 + 결제/청구) 구현을 위해, DS를 다음 3단계로 확장합니다.

### P0 (필수: 구현 차질 방지)

- 폼/설정
  - `DsCheckbox`, `DsRadioGroup`, `DsSwitch` (약관 동의, 설정 토글, 플랜/옵션 선택)
  - `DsPasswordInput` (보기/숨기기, CapsLock, strength 옵션)
  - `DsOtpInput` (PW 재설정/2FA 코드 입력)
- 네비/콘텐츠
  - `DsTabs` (문서/설정/대시보드)
  - `DsAccordion` (FAQ/헬프 센터)
  - `DsBadge`, `DsTag` (상태/태그/아카이브)
  - `DsAlert` / `DsCallout` (정책/공지/경고/성공/정보)
- 데이터 표현(최소)
  - `DsEmptyState` (검색/데이터 없음/권한 없음)
  - `DsSpinner` / `DsProgress` (로딩/진행률)
  - `DsPagination` (리스트/아카이브/검색)

### P1 (고도화: 앱급 UX)

- 데이터/대시보드
  - `DsDataTable` (정렬/필터/선택/컬럼 숨김/빈 상태/로딩)
  - `DsStatCard` / `DsKpi` (성과 지표/ROI 결과)
  - `DsDateRangePicker` (분석/대시보드 기간 필터)
- 문서/개발자 경험
  - `DocsToc`, `DocsSteps`, `DocsCodeTabs`, `ApiEndpointCard` (DS 바깥 “사이트 컴포넌트”로 관리)
  - `DsCommandPalette` (문서/대시보드 검색 및 빠른 이동)

### P2 (감성/완성도: shadcn 급 디테일)

- 오버레이/모바일
  - `DsPopover` (인터랙티브 툴팁 대체)
  - `DsSheet` / `DsDrawer` (모바일 필터/설정/네비)
- 커머스/신뢰
  - `DsTimeline` (로드맵/변경 로그)
  - `DsRating` (후기/고객 사례)
  - `DsPricingTable` (가격/비교 페이지 전용 패턴)
