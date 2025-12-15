# Design System Specs (Lab)

이 문서는 `src/lib/components/lab/design-system/*`의 “실행 가능한 명세”입니다.
프로덕션 UI 컴포넌트가 아니며, 디자인 시스템의 API/토큰/상태 규칙을 검증하기 위한 스펙입니다.

## 공통 원칙

- 변형 축은 2~3개 이하를 유지합니다. (예: `size` + `variant` + `intent`)
- `disabled`, `loading`, `invalid` 같은 상태는 변형 축에서 분리합니다.
- 레이아웃(마진/포지션)은 컴포넌트 외부(부모)에서 제어합니다.
- 컴포넌트는 전역 상태/비즈니스 로직에 접근하지 않습니다.

## DsButton

- 구현: `src/lib/components/design-system/Button.svelte`

### DsButton Props

| Prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `size` | `sm \| md \| lg` | `md` | 버튼 크기 축 |
| `variant` | `solid \| outline \| ghost \| link` | `solid` | 스타일 변형 축 |
| `intent` | `primary \| secondary \| danger \| success \| warning` | `primary` | 의미/색상 축 (`danger`는 내부적으로 `destructive` 토큰 사용) |
| `disabled` | `boolean` | `false` | 비활성 상태 (variant와 분리) |
| `loading` | `boolean` | `false` | 로딩 상태 (disabled와 분리, `aria-busy` 적용, 스피너 자동 표시) |
| `fullWidth` | `boolean` | `false` | 가로 채움 (`w-full`) |
| `class` | `string` | `''` | 추가 클래스 |
| `children` | `Snippet` | - | 버튼 내용 |
| `start` | `Snippet` | - | 앞쪽 콘텐츠(아이콘 등) |
| `end` | `Snippet` | - | 뒤쪽 콘텐츠(아이콘 등) |
| `...rest` | HTML button attrs | - | `type`, `name`, `value`, `aria-*` 등 전달 |

### DsButton 토큰 의존성

- 터치 타깃: `--touch-target-min`
- 라운드: `--button-radius`
- 패딩: `--button-padding-*`
- 포커스 링: `--focus-ring-*` (CSS 유틸 `.ds-focus-ring`)

### DsButton 접근성 체크

- `loading`일 때 `aria-busy="true"`가 적용되는가
- 키보드 포커스가 항상 보이는가 (forced-colors에서도)
- `link` variant는 링크로 인지 가능(밑줄/색상)한가

## DsInput

- 구현: `src/lib/components/design-system/Input.svelte`

### DsInput Props

| Prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `size` | `sm \| md \| lg` | `md` | 입력 높이 축 |
| `variant` | `outline \| filled` | `outline` | 배경 변형 |
| `invalid` | `boolean` | `false` | 오류 상태 (border + `aria-invalid`) |
| `clearable` | `boolean` | `false` | 값 초기화 버튼 표시 여부 |
| `ref` | `HTMLInputElement` | - | input 요소 ref |
| `class` | `string` | `''` | 추가 클래스 |
| `start` | `Snippet` | - | 앞쪽 콘텐츠(아이콘 등) |
| `end` | `Snippet` | - | 뒤쪽 콘텐츠(단위 등) |
| `...rest` | HTML input attrs | - | `type`, `placeholder`, `name`, `autocomplete`, `aria-*` 등 전달 |

### DsInput 토큰 의존성

- 라운드: `--input-radius`
- 패딩: `--input-padding-*` (start/end 슬롯 유무에 따라 자동 계산)
- 포커스 링: `--focus-ring-*` (CSS 유틸 `.ds-focus-ring`)

### DsInput 접근성 체크

- `invalid`일 때 `aria-invalid="true"`가 적용되는가
- `clearable` 버튼이 키보드 접근 가능하고 ESC로 동작하는가
- 라벨은 컴포넌트 외부에서 제공되는가 (label 연결 책임은 상위)

## DsTextarea

- 구현: `src/lib/components/design-system/Textarea.svelte`

### DsTextarea Props

| Prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `variant` | `outline \| filled` | `outline` | 배경 변형 |
| `invalid` | `boolean` | `false` | 오류 상태 (border + `aria-invalid`) |
| `ref` | `HTMLTextAreaElement` | - | textarea 요소 ref |
| `class` | `string` | `''` | 추가 클래스 |
| `...rest` | HTML textarea attrs | - | `placeholder`, `rows`, `aria-*` 등 전달 |

## DsField (Pattern)

- 구현: `src/lib/components/design-system/Field.svelte`

`Label + Control + Help/Error`를 합친 “폼 패턴” 컴포넌트입니다.
컨트롤(Input 등)은 `children` 스니펫으로 주입하며, Field가 생성한 `id/aria-describedby/required/invalid`를 전달받아 적용합니다.

### DsField Props

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

## DsCard

- 구현: `src/lib/components/design-system/Card.svelte`

### DsCard Props

| Prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `variant` | `outline \| filled \| elevated \| ghost` | `outline` | 스타일 변형 |
| `padding` | `none \| sm \| md \| lg` | `md` | 내부 패딩 |
| `motion` | `boolean` | `false` | 모션 적용 여부 |
| `class` | `string` | `''` | 추가 클래스 |
| `header` | `Snippet` | - | 헤더 영역 |
| `children` | `Snippet` | - | 본문 영역 |
| `footer` | `Snippet` | - | 푸터 영역 |

### 토큰/유틸 의존성

- 모션: `--motion-*` (CSS 유틸 `.ds-motion`)
- 표면/경계: `--card`, `--border`
- 패딩: `--card-padding` (variant에 따라 자동 설정)

## DsIcon / DsInlineIcon

- 구현: `src/lib/components/design-system/Icon.svelte`
- 구현: `src/lib/components/design-system/InlineIcon.svelte`

### DsIcon Props

| Prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `name` | `string` | - | Lucide 아이콘 이름 (예: `heart`, `settings`) |
| `size` | `sm \| md \| lg` | `md` | 아이콘 크기 토큰 선택 |
| `label` | `string` | - | 접근성 라벨(있으면 `role="img"`, 없으면 `aria-hidden="true"`) |

### DsIcon 토큰 의존성

- 크기: `--size-icon-sm`, `--size-icon-md`, `--size-icon-lg`
- 스트로크: `--icon-stroke-width`

## DsIconButton (Pattern)

- 구현: `src/lib/components/design-system/IconButton.svelte`

아이콘 버튼 패턴입니다. `aria-label`을 필수로 받아 접근성 계약을 고정합니다.

### DsIconButton Props

| Prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `icon` | `string` | - | 아이콘 이름 (Lucide) |
| `label` | `string` | - | 버튼 `aria-label` (필수) |
| `size` | `sm \| md \| lg` | `md` | 버튼/아이콘 크기 |
| `variant` | `solid \| outline \| ghost` | `ghost` | 버튼 스타일 |
| `intent` | `primary \| secondary \| error \| success \| warning` | `secondary` | 의미/색상 축 |
| `loading` | `boolean` | `false` | 로딩 상태 (아이콘이 스피너로 교체됨) |

## DsDialog (Pattern)

- 구현: `src/lib/components/design-system/Dialog.svelte`

`<dialog>` 기반 모달 패턴입니다.

### DsDialog Props

| Prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `id` | `string` | - | title/description id 생성용 (필수) |
| `title` | `string` | - | 다이얼로그 제목 |
| `description` | `string` | - | 설명(선택) |
| `open` | `boolean` | - | 열림 상태 |
| `onOpenChange` | `(next: boolean) => void` | - | 상태 변경 콜백 |
| `size` | `sm \| md \| lg \| xl \| full` | `md` | 다이얼로그 너비 |
| `scrollable` | `boolean` | `false` | 헤더/푸터 고정 및 바디 스크롤 여부 |
| `closeOnOutsideClick` | `boolean` | `true` | 배경 클릭 시 닫기 |
| `closeOnEscape` | `boolean` | `true` | ESC 키로 닫기 |
| `returnFocusTo` | `HTMLElement` | `null` | 닫힌 후 포커스 복귀 대상 (기본: 열기 전 요소) |
| `children` | `Snippet` | - | 본문 내용 |
| `footer` | `Snippet` | - | 하단 액션 영역(선택) |

## DsDropdown (Pattern)

- 구현: `src/lib/components/design-system/Dropdown.svelte`

트리거 버튼 + 메뉴 리스트 패턴입니다. 기본 제공 items 렌더링 또는 `children`으로 커스터마이즈할 수 있습니다.

### DsDropdown Props

| Prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `label` | `string` | - | 트리거 텍스트 및 메뉴 aria-label |
| `items` | `{ id: string; label: string; disabled?: boolean }[]` | - | 메뉴 아이템 |
| `onSelect` | `(id: string) => void` | - | 선택 콜백 |
| `align` | `start \| end` | `start` | 메뉴 정렬 |
| `menuClass` | `string` | `''` | 메뉴 컨테이너 추가 클래스 (너비, 스크롤 등) |
| `itemSelector` | `string` | `[data-ds-dropdown-item="true"]` | 키보드 탐색 대상 선택자 |
| `trigger` | `Snippet<[TriggerProps]>` | - | 커스텀 트리거 스니펫 |
| `children` | `Snippet<[{ close }]>` | - | 커스텀 메뉴 콘텐츠 스니펫 |

### 키보드 계약(최소)

- 트리거에서 `Enter`/`Space`/`ArrowDown`으로 열기
- 메뉴에서 `ArrowUp/Down`으로 이동, `Escape`로 닫기
- `children` 모드에서도 `itemSelector` 기반 키보드 탐색 지원

## DsSelect (New)

- 구현: `src/lib/components/design-system/Select.svelte`

`DsDropdown`을 활용한 폼 선택 컴포넌트입니다. Native Select와 유사한 UX를 제공합니다.

### DsSelect Props

| Prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `options` | `{ value; label; disabled? }[]` | - | 옵션 목록 |
| `value` | `string` | - | 선택된 값 (bindable) |
| `name` | `string` | - | hidden input name |
| `placeholder` | `string` | - | 선택 전 표시 텍스트 |
| `disabled` | `boolean` | `false` | 비활성화 |
| `invalid` | `boolean` | `false` | 에러 상태 |

## DsToastRegion (Pattern)

- 구현: `src/lib/components/design-system/ToastRegion.svelte`

우측 하단에 쌓이는 토스트 영역 패턴입니다. 포커스를 훔치지 않고, `aria-live`로 알림을 전달합니다.

### DsToastRegion Props

| Prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `toasts` | `ToastItem[]` | - | 토스트 목록 (store 구독 결과) |
| `onDismiss` | `(id: string) => void` | - | 닫기 콜백 |
| `position` | `top-right` 등 6종 | `bottom-right` | 토스트 표시 위치 |

## DsTooltip (Pattern)

- 구현: `src/lib/components/design-system/Tooltip.svelte`

짧은 힌트/보조 설명을 **hover + focus** 컨텍스트에서 제공하고, 접근성 연결(`aria-describedby`)을 명확히 하는 패턴입니다.

### DsTooltip Props

| Prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `content` | `string` | - | 간단 tooltip 텍스트 |
| `tooltip` | `Snippet` | - | 복잡 tooltip 콘텐츠(선택) |
| `placement` | `top` 등 12종 | `top` | 툴팁 위치 |
| `arrow` | `boolean` | `false` | 화살표 표시 여부 |
| `delayMs` | `number` | `500` | hover open 지연 |

## DsSkeleton (New)

- 구현: `src/lib/components/design-system/Skeleton.svelte`

로딩 상태를 위한 플레이스홀더입니다.

### DsSkeleton Props

| Prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `width` | `string` | - | 너비 (CSS 값) |
| `height` | `string` | - | 높이 (CSS 값) |
| `circle` | `boolean` | `false` | 원형 여부 |