# Design System Specs (Lab)

이 문서는 `src/lib/components/lab/design-system/*`의 “실행 가능한 명세”입니다.
프로덕션 UI 컴포넌트가 아니며, 디자인 시스템의 API/토큰/상태 규칙을 검증하기 위한 스펙입니다.

## 공통 원칙

- 변형 축은 2~3개 이하를 유지합니다. (예: `size` + `variant` + `intent`)
- `disabled`, `loading`, `invalid` 같은 상태는 변형 축에서 분리합니다.
- 레이아웃(마진/포지션)은 컴포넌트 외부(부모)에서 제어합니다.
- 컴포넌트는 전역 상태/비즈니스 로직에 접근하지 않습니다.

## DsButton

- 구현: `src/lib/components/lab/design-system/Button.svelte`

### Props

| Prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `size` | `sm \| md \| lg` | `md` | 버튼 크기 축 |
| `variant` | `solid \| outline \| ghost \| link` | `solid` | 스타일 변형 축 |
| `intent` | `primary \| secondary \| danger \| success \| warning` | `primary` | 의미/색상 축 (`danger`는 내부적으로 `destructive` 토큰 사용) |
| `disabled` | `boolean` | `false` | 비활성 상태 (variant와 분리) |
| `loading` | `boolean` | `false` | 로딩 상태 (disabled와 분리, `aria-busy` 적용) |
| `class` | `string` | `''` | 추가 클래스 |
| `children` | `Snippet` | - | 버튼 내용 |
| `...rest` | HTML button attrs | - | `type`, `name`, `value`, `aria-*` 등 전달 |

### 토큰 의존성

- 터치 타깃: `--touch-target-min`
- 라운드: `--button-radius`
- 패딩: `--button-padding-*`
- 포커스 링: `--focus-ring-*` (CSS 유틸 `.ds-focus-ring`)

### 접근성 체크

- `loading`일 때 `aria-busy="true"`가 적용되는가
- 키보드 포커스가 항상 보이는가 (forced-colors에서도)
- `link` variant는 링크로 인지 가능(밑줄/색상)한가

### 상태 스토리(검증용)

lab 페이지에서는 `data-ds-state="hover|focus|active"` 속성으로 의사 상태를 고정 표시할 수 있습니다.
(`default`, `disabled`는 각각 기본 렌더/`disabled`로 확인)

## DsInput

- 구현: `src/lib/components/lab/design-system/Input.svelte`

### Props

| Prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `size` | `sm \| md \| lg` | `md` | 입력 높이 축 |
| `variant` | `outline \| filled` | `outline` | 배경 변형 |
| `invalid` | `boolean` | `false` | 오류 상태 (border + `aria-invalid`) |
| `class` | `string` | `''` | 추가 클래스 |
| `...rest` | HTML input attrs | - | `type`, `placeholder`, `name`, `autocomplete`, `aria-*` 등 전달 |

### 토큰 의존성

- 라운드: `--input-radius`
- 패딩: `--input-padding-*`
- 포커스 링: `--focus-ring-*` (CSS 유틸 `.ds-focus-ring`)

### 접근성 체크

- `invalid`일 때 `aria-invalid="true"`가 적용되는가
- 라벨은 컴포넌트 외부에서 제공되는가 (label 연결 책임은 상위)

## DsField (Pattern)

- 구현: `src/lib/components/lab/design-system/Field.svelte`

`Label + Control + Help/Error`를 합친 “폼 패턴” 컴포넌트입니다.
컨트롤(Input 등)은 `children` 스니펫으로 주입하며, Field가 생성한 `id/aria-describedby/required/invalid`를 전달받아 적용합니다.

### Props

| Prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `id` | `string` | - | label 연결 및 메시지 id 생성용 (필수) |
| `label` | `string` | - | 라벨 텍스트 (필수) |
| `helpText` | `string` | - | 도움말 텍스트 (선택) |
| `errorText` | `string` | - | 에러 텍스트 (선택, `invalid`일 때만 표시) |
| `invalid` | `boolean` | `false` | 오류 상태 |
| `required` | `boolean` | `false` | 필수 입력 표시 및 `children`에 전달 |
| `children` | `Snippet<[ControlProps]>` | - | 컨트롤 렌더링 스니펫 |
| `...rest` | HTML div attrs | - | `id`, `role`, `aria-*` 등 전달 |

### children(ControlProps)

Field는 아래 값을 스니펫 인자로 전달합니다.

| 필드 | 타입 | 의미 |
| --- | --- | --- |
| `id` | `string` | 컨트롤에 적용할 id |
| `describedBy` | `string \| undefined` | help/error를 연결할 `aria-describedby` |
| `invalid` | `boolean` | 컨트롤에 적용할 invalid |
| `required` | `boolean` | 컨트롤에 적용할 required |

### 토큰 의존성

- 간격: `--field-gap` (기본 `--spacing-2`)
- 라벨/메시지 색상: `--field-label-color`, `--field-help-color`, `--field-error-color`

### 접근성 체크

- label이 `for={id}`로 컨트롤과 연결되는가
- `helpText`/`errorText`가 있을 때 `aria-describedby`가 올바른 id를 포함하는가
- `invalid` + `errorText`일 때 에러 영역이 `role="alert"`로 읽히는가

## DsCard

- 구현: `src/lib/components/lab/design-system/Card.svelte`

### Props

| Prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `motion` | `boolean` | `false` | 모션 기본값 적용(hover에서 transform 또는 reduced-motion에서 대체) |
| `class` | `string` | `''` | 추가 클래스 |
| `children` | `Snippet` | - | 카드 내용 |
| `...rest` | HTML div attrs | - | `id`, `role`, `aria-*` 등 전달 |

### 토큰/유틸 의존성

- 모션: `--motion-*` (CSS 유틸 `.ds-motion`)
- 표면/경계: `--card`, `--border` (UnoCSS 유틸 통해 반영)

## DsIcon

- 구현: `src/lib/components/lab/design-system/Icon.svelte`

Lucide 아이콘을 UnoCSS `presetIcons` 기반(`i-lucide-*`)으로 렌더링하는 lab용 래퍼입니다.
기본은 장식용(aria-hidden)이며, `label`을 주면 의미 있는 아이콘으로 취급합니다.

### Props

| Prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `name` | `string` | - | Lucide 아이콘 이름 (예: `heart`, `settings`) |
| `size` | `sm \| md \| lg` | `md` | 아이콘 크기 토큰 선택 |
| `label` | `string` | - | 접근성 라벨(있으면 `role="img"`, 없으면 `aria-hidden="true"`) |
| `class` | `string` | `''` | 추가 클래스 |
| `style` | `string` | `''` | 추가 스타일 |

### 토큰 의존성

- 크기: `--size-icon-sm`, `--size-icon-md`, `--size-icon-lg`
- 스트로크: `--icon-stroke-width`

### 접근성 체크

- 장식용일 때 `aria-hidden="true"`가 적용되는가
- 의미 아이콘일 때 `role="img"` + `aria-label`이 적용되는가

## DsIconButton (Pattern)

- 구현: `src/lib/components/lab/design-system/IconButton.svelte`

아이콘 버튼 패턴입니다. `aria-label`을 필수로 받아 접근성 계약을 고정합니다.

### Props

| Prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `icon` | `string` | - | 아이콘 이름 (Lucide) |
| `label` | `string` | - | 버튼 `aria-label` (필수) |
| `size` | `sm \| md \| lg` | `md` | 버튼/아이콘 크기 |
| `variant` | `solid \| outline \| ghost` | `ghost` | 버튼 스타일 |
| `intent` | `primary \| secondary \| error \| success \| warning` | `secondary` | 의미/색상 축 |
| `disabled` | `boolean` | `false` | 비활성 상태 |
| `loading` | `boolean` | `false` | 로딩 상태 (`aria-busy`) |

### 토큰 의존성

- 버튼: `--button-radius`, `--button-padding-*`, `--opacity-disabled`
- 아이콘: `--size-icon-*`, `--icon-stroke-width`
- 포커스 링: `--focus-ring-*`

## DsInlineIcon (Pattern)

- 구현: `src/lib/components/lab/design-system/InlineIcon.svelte`

텍스트 라인 안에서 아이콘을 자연스럽게 배치하는 패턴입니다.

### Props

| Prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `name` | `string` | - | 아이콘 이름 |
| `size` | `sm \| md \| lg` | `sm` | 아이콘 크기 |
| `label` | `string` | - | 의미 아이콘일 때만 사용(선택) |

### 토큰 의존성

- 간격: `--icon-gap`

## DsDialog (Pattern)

- 구현: `src/lib/components/lab/design-system/Dialog.svelte`

`<dialog>` 기반 모달 패턴입니다. `open` 상태를 상위에서 제어하고, 내부 이벤트(ESC/닫기/바깥 클릭)로 `onOpenChange(false)`를 호출합니다.

### Props

| Prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `id` | `string` | - | title/description id 생성용 (필수) |
| `title` | `string` | - | 다이얼로그 제목 |
| `description` | `string` | - | 설명(선택) |
| `open` | `boolean` | - | 열림 상태 |
| `onOpenChange` | `(next: boolean) => void` | - | 상태 변경 콜백 |
| `children` | `Snippet` | - | 본문 내용 |
| `footer` | `Snippet` | - | 하단 액션 영역(선택) |

### 토큰 의존성

- 스크림: `--color-scrim`
- 표면/경계/그림자: `--dialog-surface`, `--dialog-border`, `--dialog-shadow`
- 간격/라운드: `--dialog-padding`, `--dialog-gap`, `--dialog-radius`
- z-index: `<dialog>` 자체가 top-layer지만, 내부 레이어 토큰도 유지 권장

### 접근성 체크

- `aria-labelledby`, `aria-describedby`가 올바르게 연결되는가
- ESC로 닫히는가(취소 이벤트) / 닫힐 때 상태가 동기화되는가

## DsDropdown (Pattern)

- 구현: `src/lib/components/lab/design-system/Dropdown.svelte`

트리거 버튼 + 메뉴 리스트 패턴입니다. 기본 제공 items 렌더링 또는 `children`으로 커스터마이즈할 수 있습니다.

### Props

| Prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `label` | `string` | - | 트리거 텍스트 및 메뉴 aria-label |
| `items` | `{ id: string; label: string; disabled?: boolean }[]` | - | 메뉴 아이템 |
| `onSelect` | `(id: string) => void` | - | 선택 콜백 |
| `open` | `boolean` | - | (선택) 제어형 오픈 상태 |
| `onOpenChange` | `(next: boolean) => void` | - | (선택) 오픈 상태 콜백 |

### 키보드 계약(최소)

- 트리거에서 `Enter`/`Space`/`ArrowDown`으로 열기
- 메뉴에서 `ArrowUp/Down`으로 이동, `Escape`로 닫기

### 토큰 의존성

- 표면/경계: `--dropdown-surface`, `--dropdown-border`
- 간격/라운드: `--dropdown-padding-*`, `--dropdown-radius`, `--dropdown-item-padding-*`
- hover: `--dropdown-item-hover`
- z-index: `--z-dropdown`

## DsToastRegion (Pattern)

- 구현: `src/lib/components/lab/design-system/ToastRegion.svelte`

우측 하단에 쌓이는 토스트 영역 패턴입니다. 포커스를 훔치지 않고, `aria-live`로 알림을 전달합니다.

### Props

| Prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `toasts` | `{ id; title; message?; intent? }[]` | - | 토스트 목록 |
| `onDismiss` | `(id: string) => void` | - | 닫기 콜백 |

### 토큰 의존성

- 표면/경계: `--toast-surface`, `--toast-border`
- 간격/라운드/폭: `--toast-padding-*`, `--toast-radius`, `--toast-width`
- z-index: `--z-toast`
