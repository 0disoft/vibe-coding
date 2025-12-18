# Design System Components

이 폴더는 프로젝트 전반에서 재사용하는 **디자인 시스템(UI) 컴포넌트** 모음입니다.

- 컴포넌트 소스: `src/lib/components/design-system/`
- 배럴 export: `src/lib/components/design-system/index.ts`
- 토큰(SSOT): `src/styles/design-system.tokens.css`
- 스타일: `src/styles/design-system.css`
- 쇼케이스: `/design-system` (소스: `src/routes/design-system/_sections/`)

## 사용 규칙

- 가능하면 HTML 태그보다 `Ds*` 컴포넌트를 우선 사용합니다.
- 색/상태 표현은 유틸 클래스보다 `intent` / `variant` props를 우선 사용합니다.
- 외부에서는 되도록 `src/lib/components/design-system/index.ts` 경유 import만 사용합니다.

## 설치/적용(스타일 로딩)

이 프로젝트는 `src/app.css` 에서 DS 스타일을 로드합니다.

```css
@import "./styles/design-system.tokens.css";
@import "./styles/design-system.css";
```

## Import 예시

```svelte
<script lang="ts">
  import { DsButton, DsDialog } from "$lib/components/design-system";
  import type { Intent, Size } from "$lib/components/design-system";
</script>
```

## 공통 Props / 패턴

### `size`, `intent`, `variant`

- `Size`: `'sm' | 'md' | 'lg'`
- `Intent`: `'primary' | 'secondary' | 'danger' | 'success' | 'warning'` (`danger`는 CSS에서 `error`로 매핑)
- `variant`: 컴포넌트별로 다릅니다(예: Button/LinkButton/IconButton).

### Controlled/Uncontrolled

Overlay/Selection 계열은 보통 아래 패턴을 지원합니다.

- Controlled: `open` / `value` 를 주고, `onOpenChange` / `onValueChange` 로 동기화
- Uncontrolled: `open` / `value` 를 생략하면 내부 상태로 동작

### Svelte 5 Snippet API

여러 컴포넌트가 `children`, `trigger`, `footer` 같은 Snippet을 받습니다.

```svelte
<DsDialog title="제목">
  {#snippet children()}
    <p class="text-body">내용</p>
  {/snippet}
  {#snippet footer()}
    <DsButton intent="primary">확인</DsButton>
  {/snippet}
</DsDialog>
```

> 주의: Svelte 5에서 `{#snippet children()}` 같은 이름과 `$props()`로 꺼낸 변수명이 겹치면 SSR에서 재귀 렌더가 발생할 수 있습니다. 이 경우 `$props()` destructuring에서 alias를 써서 이름 충돌을 피하세요.

## 컴포넌트 레퍼런스(요약)

아래 Props 목록은 “주요 Props 빠른 파악”을 위한 요약이며, 세부 타입/설명은 각 파일 상단의 `Props` 타입 정의를 기준으로 합니다.

### Foundations

#### `DsIcon`

- 파일: `src/lib/components/design-system/Icon.svelte`
- 역할: Lucide 아이콘 렌더링(장식용/의미용 분리)
- Props: `name`, `size`, `label`, `title`, `flipInRtl`

#### `DsInlineIcon`

- 파일: `src/lib/components/design-system/InlineIcon.svelte`
- 역할: 텍스트와 아이콘을 한 컴포넌트로 묶기(아이콘 위치/의미 처리)
- Props: `name`, `side`, `size`, `label`, `children`

#### `DsSeparator`

- 파일: `src/lib/components/design-system/Separator.svelte`
- 역할: 구분선(수평/수직, decorative 지원)
- Props: `orientation`, `decorative`, `label`

#### `DsVisuallyHidden`

- 파일: `src/lib/components/design-system/VisuallyHidden.svelte`
- 역할: 스크린리더 전용 텍스트(sr-only) 래퍼
- Props: `as`, `class`, `children`

### A11y

#### `DsSkipLink`

- 파일: `src/lib/components/design-system/SkipLink.svelte`
- 역할: “본문으로 건너뛰기” 스킵 링크(키보드 포커스 시 노출)
- Props: `href`, `label`, `class`

#### `DsLiveRegion`

- 파일: `src/lib/components/design-system/LiveRegion.svelte`
- 역할: 스크린리더용 상태 안내(aria-live) + `announce()` API
- Props: `politeness`, `class`

### Internationalization

#### `DsDirectionProvider`

- 파일: `src/lib/components/design-system/DirectionProvider.svelte`
- 역할: locale 기반 LTR/RTL 규칙을 중앙화하고, `<html lang/dir>`를 클라이언트 내비게이션에서도 동기화
- Props: `locale`, `applyToDocument`, `children`
- 내부 로직(SSOT): `src/lib/shared/utils/locale.ts`

#### `DsLocaleSwitcher`

- 파일: `src/lib/components/design-system/LocaleSwitcher.svelte`
- 역할: 언어 전환 “규칙 엔진” + 기본 UI(검색/리스트, URL 유지, 쿠키 저장)
- Props: `label`, `value`, `onValueChange`, `showSearch`, `searchPlaceholder`, `disableCurrent`, `announce`
- 내부 로직(SSOT): `src/lib/shared/utils/locale.ts`

### Theme

#### `DsThemeControlCenter`

- 파일: `src/lib/components/design-system/ThemeControlCenter.svelte`
- 역할: 테마 모드/팔레트 선택 UI(DS 컴파운드)
- Props: `mode`, `onModeChange`, `palette`, `onPaletteChange`, `label`, `triggerTestId`, `title`
- 내부 규칙(SSOT): `src/lib/shared/utils/theme.ts` (+ SSR 주입: `src/lib/server/hooks/paraglide-theme-font.ts`)

### Buttons

#### `DsButton`

- 파일: `src/lib/components/design-system/Button.svelte`
- 역할: 기본 버튼(로딩/아이콘 슬롯 포함)
- Props: `size`, `variant`, `intent`, `loading`, `fullWidth`, `loadingLabel`, `ref`, `children`, `start`, `end`

#### `DsIconButton`

- 파일: `src/lib/components/design-system/IconButton.svelte`
- 역할: 아이콘 전용 버튼(pressed/로딩/툴팁 표시 지원)
- Props: `label`, `icon`, `size`, `variant`, `intent`, `pressed`, `disabled`, `loading`, `flipInRtl`, `showTitle`, `loadingLabel`, `ref`, `children`

#### `DsLinkButton`

- 파일: `src/lib/components/design-system/LinkButton.svelte`
- 역할: 링크처럼 보이는 버튼(variant/intent/로딩)
- Props: `size`, `variant`, `intent`, `disabled`, `fullWidth`, `loading`, `loadingLabel`, `children`, `start`, `end`

#### `DsCopyButton`

- 파일: `src/lib/components/design-system/CopyButton.svelte`
- 역할: 클립보드 복사 버튼(복사 성공 시 상태 전환)
- Props: `text`, `label`, `copiedLabel`, `icon`, `copiedIcon`, `resetMs`, `onCopied`, `onCopyError` (+ IconButton 공통 props)

### Forms

#### `DsField`

- 파일: `src/lib/components/design-system/Field.svelte`
- 역할: 라벨/헬프/에러 메시지 및 aria 연결 패턴
- Props: `id`, `label`, `hideLabel`, `helpText`, `errorText`, `invalid`, `required`, `announceError`, `children`

#### `DsErrorSummary`

- 파일: `src/lib/components/design-system/ErrorSummary.svelte`
- 역할: 폼 에러 요약(0→N으로 바뀌는 순간 자동 포커스) + 항목 클릭 시 해당 필드로 스크롤/포커스 이동
- Props: `id`, `title`, `errors`, `autoFocus`, `role`
- `errors` 아이템: `message`, `fieldId`(id 기반 포커스 이동), `href`(직접 링크)

#### `DsInput`

- 파일: `src/lib/components/design-system/Input.svelte`
- 역할: 텍스트 입력(아이콘 슬롯/clearable)
- Props: `size`, `variant`, `invalid`, `clearable`, `value`, `ref`, `start`, `end`, `clearLabel`

#### `DsTextarea`

- 파일: `src/lib/components/design-system/Textarea.svelte`
- 역할: 멀티라인 입력(autoResize 옵션)
- Props: `variant`, `invalid`, `autoResize`, `maxHeight`, `ref`

#### `DsCheckbox`

- 파일: `src/lib/components/design-system/Checkbox.svelte`
- 역할: 체크박스(checked/indeterminate)
- Props: `checked`, `indeterminate`, `label`, `ref`, `children`

#### `DsSwitch`

- 파일: `src/lib/components/design-system/Switch.svelte`
- 역할: 스위치 토글
- Props: `checked`, `size`, `label`, `ref`, `children`

#### `DsRadioGroup` / `DsRadioItem`

- 파일: `src/lib/components/design-system/RadioGroup.svelte`, `src/lib/components/design-system/RadioItem.svelte`
- 역할: 라디오 선택 그룹
- `DsRadioGroup` Props: `value`, `onValueChange`, `name`, `disabled`, `required`, `describedBy`, `id`, `children`
- `DsRadioItem` Props: `value`, `disabled`, `label`, `description`, `ref`, `children`

#### `DsSelect`

- 파일: `src/lib/components/design-system/Select.svelte`
- 역할: select 대체(드롭다운 기반)
- Props: `options`, `value`, `placeholder`, `name`, `disabled`, `invalid`, `required`, `id`, `describedBy`, `class`

#### `DsMultiSelect`

- 파일: `src/lib/components/design-system/MultiSelect.svelte`
- 역할: 다중 선택(드롭다운 기반)
- Props: `options`, `values`, `placeholder`, `name`, `disabled`, `invalid`, `required`, `id`, `describedBy`, `class`, `maxChips`

#### `DsTagInput`

- 파일: `src/lib/components/design-system/TagInput.svelte`
- 역할: 태그 입력(Enter/Tab/Comma 추가, Backspace 삭제, Paste 분해)
- Props: `values`, `name`, `placeholder`, `disabled`, `readonly`, `invalid`, `required`, `id`, `describedBy`, `addOnBlur`, `allowDuplicates`, `maxTags`, `allowedPattern`

#### `DsCombobox`

- 파일: `src/lib/components/design-system/Combobox.svelte`
- 역할: 검색 가능한 선택(옵션 목록)
- Props: `options`, `value`, `onValueChange`, `placeholder`, `disabled`, `label`

#### `DsNumberInput`

- 파일: `src/lib/components/design-system/NumberInput.svelte`
- 역할: 숫자 입력(키보드 ArrowUp/Down 증감 + +/- 버튼)
- Props: `size`, `variant`, `invalid`, `value`, `name`, `min`, `max`, `step`, `showStepper`, `clampOnBlur`, `ref`, `decrementLabel`, `incrementLabel`

#### `DsPasswordInput`

- 파일: `src/lib/components/design-system/PasswordInput.svelte`
- 역할: 비밀번호 입력(표시/숨김, 강도 표시 옵션)
- Props: `size`, `variant`, `invalid`, `clearable`, `value`, `ref`, `start`, `showStrength`, `revealable`, `revealLabel`, `hideLabel`, `clearLabel`

#### `DsOtpInput`

- 파일: `src/lib/components/design-system/OtpInput.svelte`
- 역할: OTP 입력 슬롯
- Props: `length`, `value`, `onComplete`, `disabled`, `numeric`, `name`, `label`, `ref`

#### `DsFileUpload`

- 파일: `src/lib/components/design-system/FileUpload.svelte`
- 역할: 파일 업로드(accept/size/maxFiles, 목록 표시)
- Props: `files`, `onFilesChange`, `label`, `description`, `accept`, `multiple`, `disabled`, `required`, `name`, `maxFiles`, `maxSizeBytes`, `showList`, `clearable`

#### `DsTimePicker`

- 파일: `src/lib/components/design-system/TimePicker.svelte`
- 역할: 시간 입력(단계/범위/clearable)
- Props: `value`, `onValueChange`, `label`, `placeholder`, `clearable`, `id`, `name`, `disabled`, `readonly`, `required`, `min`, `max`, `step`, `autocomplete`, `class`

### Editor

#### `DsEditorToolbar`

- 파일: `src/lib/components/design-system/EditorToolbar.svelte`
- 역할: “구조 중심” 편집 툴바(블록 타입 + 9개 커맨드)
- 기본 커맨드: `bold`, `italic`, `link`, `bulletList`, `orderedList`, `codeBlock`
- 추가 커맨드: `insertImages`, `blockquote`, `callout`, `clearFormatting`
- Props: `blockType`, `onBlockTypeChange`, `defaultBlockType`, `active`, `disabled`, `onCommand`, `blockLabel`, `labels`, `imageLabel`, `imageAccept`, `imageMultiple`, `imageMaxFiles`, `imageMaxSizeBytes`, `imageInsertLabel`, `imageCancelLabel`

#### `DsEditorImagesButton`

- 파일: `src/lib/components/design-system/EditorImagesButton.svelte`
- 역할: 이미지 삽입용 버튼 + 팝오버(파일 선택 UI 포함)
- Props: `disabled`, `pressed`, `label`, `accept`, `multiple`, `maxFiles`, `maxSizeBytes`, `insertLabel`, `cancelLabel`, `onInsert`

#### `DsEditorInlineControls`

- 파일: `src/lib/components/design-system/EditorInlineControls.svelte`
- 역할: 선택 영역 기반 인라인 포맷 툴바(굵게/기울임/링크)
- Props: `open`, `anchorRect`, `placement`, `offset`, `active`, `disabled`, `onCommand`, `labels`

### Overlays & Popups

#### `DsDialog`

- 파일: `src/lib/components/design-system/Dialog.svelte`
- 역할: 모달 다이얼로그(포커스/ESC/외부 클릭)
- Props: `id`, `title`, `description`, `open`, `onOpenChange`, `size`, `scrollable`, `closeOnOutsideClick`, `closeOnEscape`, `returnFocusTo`, `initialFocus`, `closeLabel`, `children`, `footer`

#### `DsSheet`

- 파일: `src/lib/components/design-system/Sheet.svelte`
- 역할: 측면 패널(모바일 메뉴 등)
- Props: `id`, `title`, `description`, `open`, `onOpenChange`, `side`, `size`, `closeOnOutsideClick`, `closeOnEscape`, `returnFocusTo`, `initialFocus`, `closeLabel`, `children`, `footer`

#### `DsDrawer`

- 파일: `src/lib/components/design-system/Drawer.svelte`
- 역할: Drawer(하단/측면 형태의 overlay)
- Props: `id`, `title`, `description`, `open`, `onOpenChange`, `size`, `closeOnOutsideClick`, `closeOnEscape`, `returnFocusTo`, `initialFocus`, `closeLabel`, `children`, `footer`

#### `DsPopover`

- 파일: `src/lib/components/design-system/Popover.svelte`
- 역할: 트리거 기준 위치 고정 팝오버(포커스/외부 클릭)
- Props: `open`, `onOpenChange`, `disabled`, `side`, `align`, `offset`, `closeOnOutsideClick`, `closeOnEscape`, `initialFocus`, `returnFocusTo`, `label`, `trigger`, `children`, `panelClass`

#### `DsDropdown` / `DsDropdownItem`

- 파일: `src/lib/components/design-system/Dropdown.svelte`, `src/lib/components/design-system/DropdownItem.svelte`
- 역할: 메뉴/리스트박스 드롭다운 + 메뉴 아이템
- `DsDropdown` Props: `label`, `items`, `onSelect`, `open`, `onOpenChange`, `align`, `haspopup`, `disabled`, `trigger`, `children`, `header`, `footer`, `menuClass`, `itemSelector`
- `DsDropdownItem` Props: `href`, `type`, `role`, `intent`, `children`

#### `DsTooltip`

- 파일: `src/lib/components/design-system/Tooltip.svelte`
- 역할: 툴팁(지연, coarse pointer 비활성화 옵션)
- Props: `content`, `disabled`, `delayMs`, `closeDelayMs`, `placement`, `arrow`, `disableOnCoarsePointer`, `children`, `tooltip`

#### `DsCommandPalette`

- 파일: `src/lib/components/design-system/CommandPalette.svelte`
- 역할: 커맨드 팔레트(검색/선택)
- Props: `open`, `onOpenChange`, `title`, `description`, `placeholder`, `items`, `onSelect`, `emptyText`, `children`

#### `DsContextMenu`

- 파일: `src/lib/components/design-system/ContextMenu.svelte`
- 역할: 우클릭 컨텍스트 메뉴(단일 레벨, 키보드 이동 포함)
- Props: `items`, `open`, `onOpenChange`, `disabled`, `label`, `align`, `offset`, `trigger`, `children`

### Disclosure

#### `DsAccordion` / `DsAccordionItem` / `DsAccordionTrigger` / `DsAccordionContent`

- 파일: `src/lib/components/design-system/Accordion.svelte`, `src/lib/components/design-system/AccordionItem.svelte`, `src/lib/components/design-system/AccordionTrigger.svelte`, `src/lib/components/design-system/AccordionContent.svelte`
- 역할: 아코디언(단일/다중 열림, 키보드 내비 포함)
- `DsAccordion` Props: `type`, `value`, `onValueChange`, `collapsible`, `id`, `children`
- `DsAccordionItem` Props: `value`, `disabled`, `children`
- `DsAccordionTrigger` Props: `value`, `disabled`, `children` (+ button props)
- `DsAccordionContent` Props: `value`, `children`

### Navigation

#### `DsBreadcrumb`

- 파일: `src/lib/components/design-system/Breadcrumb.svelte`
- 역할: breadcrumb
- Props: `items`, `label`

#### `DsTabs` / `DsTabsList` / `DsTabsTrigger` / `DsTabsContent`

- 파일: `src/lib/components/design-system/Tabs.svelte`, `src/lib/components/design-system/TabsList.svelte`, `src/lib/components/design-system/TabsTrigger.svelte`, `src/lib/components/design-system/TabsContent.svelte`
- 역할: 탭 UI(키보드 내비 포함)
- `DsTabs` Props: `value`, `onValueChange`, `orientation`, `activationMode`, `id`, `children`
- `DsTabsList` Props: `children`
- `DsTabsTrigger` Props: `value`, `disabled`, `children`
- `DsTabsContent` Props: `value`, `children`

#### `DsPagination`

- 파일: `src/lib/components/design-system/Pagination.svelte`
- 역할: 페이지네이션
- Props: `page`, `pageCount`, `onPageChange`, `siblingCount`, `boundaryCount`, `disabled`, `label`

#### `DsSidebar`

- 파일: `src/lib/components/design-system/Sidebar.svelte`
- 역할: 사이드바 컨테이너(타이틀/푸터 슬롯)
- Props: `title`, `children`, `footer`

#### `DsAppShell`

- 파일: `src/lib/components/design-system/AppShell.svelte`
- 역할: 좌측 sidebar + 본문 + action 슬롯 패턴
- Props: `title`, `description`, `sidebarTitle`, `sidebar`, `actions`, `children`, `openSidebarLabel`

#### `DsNavigationMenu`

- 파일: `src/lib/components/design-system/NavigationMenu.svelte`
- 역할: 헤더 내비용 메가 메뉴(팝오버 기반)
- Props: `label`, `items`, `openId`, `onOpenIdChange`, `align`, `offset`, `panelClass`, `triggerClass`, `linkClass`, `renderItem`

#### `DsTreeView`

- 파일: `src/lib/components/design-system/TreeView.svelte`
- 역할: 계층 내비/목록(접기/펼치기 + 키보드 내비)
- Props: `nodes`, `selectedId`, `onSelectedIdChange`, `defaultSelectedId`, `expandedIds`, `onExpandedIdsChange`, `defaultExpandedIds`, `showToggle`, `showIcons`, `renderNode`, `onSelectNode`

### Content

#### `DsContentCard`

- 파일: `src/lib/components/design-system/ContentCard.svelte`
- 역할: 블로그/가이드/커뮤니티 같은 “콘텐츠 카드” 조립(이미지/메타/태그/액션 포함)
- Props: `title`, `href`, `excerpt`, `imageSrc`, `imageAlt`, `status`, `author`, `category`, `date`, `readingMinutes`, `tags`, `actions`, `children`

#### `DsContentMeta`

- 파일: `src/lib/components/design-system/ContentMeta.svelte`
- 역할: 작성자/카테고리/읽기시간/날짜 등 메타 라인
- Props: `items`, `author`, `category`, `readingMinutes`, `date`, `dateTime`, `separator`, `compact`

#### `DsTagList`

- 파일: `src/lib/components/design-system/TagList.svelte`
- 역할: 태그 리스트(링크 옵션/overflow 처리)
- Props: `tags`, `maxVisible`, `intent`, `variant`, `size`, `getHref`, `overflowLabel`

#### `DsStatusBadge`

- 파일: `src/lib/components/design-system/StatusBadge.svelte`
- 역할: draft/published/archived 상태 배지 프리셋
- Props: `status`, `label`

#### `DsContentActions`

- 파일: `src/lib/components/design-system/ContentActions.svelte`
- 역할: 링크 복사/북마크/열기 같은 “콘텐츠 액션” 프리셋
- Props: `url`, `copyLabel`, `copiedLabel`, `bookmarkLabel`, `bookmarked`, `onBookmarkedChange`, `showOpen`

#### `DsFilterBar`

- 파일: `src/lib/components/design-system/FilterBar.svelte`
- 역할: 검색 + 정렬 + 필터 슬롯 + 액션 영역
- Props: `query`, `onQueryChange`, `placeholder`, `sort`, `onSortChange`, `sortOptions`, `sortPlaceholder`, `showClear`, `clearLabel`, `children`, `actions`

#### `DsFacetFilter`

- 파일: `src/lib/components/design-system/FacetFilter.svelte`
- 역할: 패싯(그룹/체크 옵션) 필터 UI
- Props: `groups`, `values`, `onValuesChange`, `defaultValues`, `renderOption`

#### `DsMediaPicker`

- 파일: `src/lib/components/design-system/MediaPicker.svelte`
- 역할: 이미지 파일 업로드 + 썸네일 프리뷰 + 제거
- Props: `files`, `onFilesChange`, `label`, `description`, `accept`, `multiple`, `maxFiles`, `maxSizeBytes`, `disabled`

#### `DsQuote`

- 파일: `src/lib/components/design-system/Quote.svelte`
- 역할: 인용문 블록(시맨틱 blockquote)
- Props: `cite`, `children`

#### `DsCallout`

- 파일: `src/lib/components/design-system/Callout.svelte`
- 역할: 문서/콘텐츠용 콜아웃(= `DsAlert` 래퍼)
- Props: `intent`, `title`, `children`

### Flow

#### `DsSteps`

- 파일: `src/lib/components/design-system/Steps.svelte`
- 역할: 단계 표시(완료/현재/예정, 선택적으로 클릭 이동)
- Props: `steps`, `currentId`, `onCurrentIdChange`, `defaultCurrentId`, `completedIds`, `allowNavigation`, `renderStep`

#### `DsWizard`

- 파일: `src/lib/components/design-system/Wizard.svelte`
- 역할: Steps + 본문 + 기본 Prev/Next footer로 흐름 구성
- Props: `steps`, `currentId`, `onCurrentIdChange`, `defaultCurrentId`, `allowNavigation`, `onFinish`, `children`, `footer`

### Data & Display

#### `DsCard`

- 파일: `src/lib/components/design-system/Card.svelte`
- 역할: 카드 컨테이너(헤더/푸터 슬롯, 링크 카드 지원)
- Props: `variant`, `padding`, `motion`, `tag`, `href`, `header`, `children`, `footer`

#### `DsCarousel`

- 파일: `src/lib/components/design-system/Carousel.svelte`
- 역할: 스크롤 스냅 기반 캐러셀(Prev/Next + 도트 + 키보드)
- Props: `items`, `index`, `onIndexChange`, `defaultIndex`, `showArrows`, `showDots`, `keyboard`, `slide`

#### `DsChartFrame`

- 파일: `src/lib/components/design-system/ChartFrame.svelte`
- 역할: 차트 컨테이너(제목/설명/액션/범례 + “데이터 표 토글”)
- Props: `title`, `description`, `actions`, `legend`, `table`, `tableToggleLabel`, `showTable`, `onShowTableChange`, `defaultShowTable`, `children`

#### `DsSparkline`

- 파일: `src/lib/components/design-system/Sparkline.svelte`
- 역할: SVG 기반 미니 라인 차트(가벼운 KPI/목록용)
- Props: `values`, `width`, `height`, `padding`, `strokeWidth`, `intent`, `label`

#### `DsBadge` / `DsTag`

- 파일: `src/lib/components/design-system/Badge.svelte`, `src/lib/components/design-system/Tag.svelte`
- 역할: 상태/라벨 표시
- `DsBadge` Props: `intent`, `variant`, `size`, `start`, `end`, `children`
- `DsTag` Props: `intent`, `variant`, `size`, `start`, `end`, `children`

#### `DsAvatar`

- 파일: `src/lib/components/design-system/Avatar.svelte`
- 역할: 아바타(이미지/이니셜 fallback)
- Props: `src`, `alt`, `name`, `size`, `fallback`

#### `DsProgress`

- 파일: `src/lib/components/design-system/Progress.svelte`
- 역할: 진행률 표시(불확정 indeterminate)
- Props: `value`, `max`, `size`, `indeterminate`, `label`

#### `DsSlider` / `DsRangeSlider`

- 파일: `src/lib/components/design-system/Slider.svelte`, `src/lib/components/design-system/RangeSlider.svelte`
- 역할: 슬라이더(단일/범위)
- `DsSlider` Props: `value`, `min`, `max`, `step`, `label`, `id`, `describedBy`
- `DsRangeSlider` Props: `value`, `min`, `max`, `step`, `minLabel`, `maxLabel`, `id`, `describedBy`

#### `DsSkeleton`

- 파일: `src/lib/components/design-system/Skeleton.svelte`
- 역할: 로딩 스켈레톤
- Props: `width`, `height`, `variant`, `animate`

#### `DsSkeletonCard` / `DsSkeletonList` / `DsSkeletonTable`

- 파일: `src/lib/components/design-system/SkeletonCard.svelte`, `src/lib/components/design-system/SkeletonList.svelte`, `src/lib/components/design-system/SkeletonTable.svelte`
- 역할: 자주 쓰는 로딩 프리셋(카드/리스트/테이블)
- `DsSkeletonCard` Props: `showMedia`, `showAvatar`, `lines`
- `DsSkeletonList` Props: `rows`, `showAvatar`
- `DsSkeletonTable` Props: `columns`, `rows`, `showHeader`

#### `DsSpinner`

- 파일: `src/lib/components/design-system/Spinner.svelte`
- 역할: 로딩 스피너
- Props: `size`, `label`

#### `DsDataTable`

- 파일: `src/lib/components/design-system/DataTable.svelte`
- 역할: 테이블(컬럼/행, 정렬, empty 슬롯)
- Props: `columns`, `rows`, `getValue`, `cell`, `empty`, `sort`, `onSortChange`, `label`, `stickyHeader`

#### `DsTable`

- 파일: `src/lib/components/design-system/Table.svelte`
- 역할: 문서/정책 페이지 등에서 쓰는 시맨틱 테이블 래퍼(스크롤/캡션)
- Props: `caption`, `captionSide`, `stickyHeader`, `scroll`, `children`

#### `DsDefinitionList`

- 파일: `src/lib/components/design-system/DefinitionList.svelte`
- 역할: 시맨틱 정의 목록(dl/dt/dd) 래퍼(약관/정책/SLA 용)
- Props: `items`, `variant`, `children`

#### `DsTableToolbar`

- 파일: `src/lib/components/design-system/TableToolbar.svelte`
- 역할: 테이블 상단 툴바(검색/카운트/좌우 슬롯)
- Props: `title`, `description`, `count`, `query`, `onQueryChange`, `placeholder`, `start`, `end`

#### `DsCalendar`

- 파일: `src/lib/components/design-system/Calendar.svelte`
- 역할: 달력(단일 날짜)
- Props: `value`, `onValueChange`, `locale`, `label`, `disabled`, `min`, `max`, `weekStartsOn`, `showOutsideDays`, `isDateDisabled`

#### `DsDatePicker` / `DsDateRangePicker`

- 파일: `src/lib/components/design-system/DatePicker.svelte`, `src/lib/components/design-system/DateRangePicker.svelte`
- 역할: 날짜/기간 선택 UI
- `DsDatePicker` Props: `value`, `onValueChange`, `disabled`, `label`, `placeholder`, `locale`, `min`, `max`, `name`, `closeOnSelect`, `clearable`
- `DsDateRangePicker` Props: `value`, `onValueChange`, `disabled`, `label`

#### `DsRating`

- 파일: `src/lib/components/design-system/Rating.svelte`
- 역할: 별점 입력/표시
- Props: `value`, `onValueChange`, `max`, `readOnly`, `size`, `label`

#### `DsTimeline`

- 파일: `src/lib/components/design-system/Timeline.svelte`
- 역할: 타임라인 리스트
- Props: `items`, `label`

#### `DsKpi` / `DsStatCard`

- 파일: `src/lib/components/design-system/Kpi.svelte`, `src/lib/components/design-system/StatCard.svelte`
- 역할: KPI/지표 카드
- `DsKpi` Props: `label`, `value`, `helper`, `delta`, `trend`, `size`, `icon`, `iconLabel`
- `DsStatCard` Props: `label`, `value`, `helper`, `delta`, `trend`, `icon`, `action`, `bottom`, `href`, `target`, `rel`

#### `DsPricingTable`

- 파일: `src/lib/components/design-system/PricingTable.svelte`
- 역할: 요금제 비교 테이블
- Props: `plans`, `onSelect`, `cta`

#### `DsSearchPanel`

- 파일: `src/lib/components/design-system/SearchPanel.svelte`
- 역할: 검색 결과 패널(목록/선택)
- Props: `query`, `onQueryChange`, `items`, `onSelect`, `label`, `placeholder`, `emptyText`, `maxResults`, `showCount`

### Feedback

#### `DsInlineAlert`

- 파일: `src/lib/components/design-system/InlineAlert.svelte`
- 역할: 필드 바로 아래에 붙이는 인라인 메시지(힌트/경고/에러)
- Props: `intent`, `role`, `icon`, `message`

#### `DsNotificationCenter`

- 파일: `src/lib/components/design-system/NotificationCenter.svelte`
- 역할: 알림 목록 UI(필터 + 읽음 처리 + dismiss)
- Props: `items`, `filter`, `onFilterChange`, `defaultFilter`, `onOpen`, `onMarkRead`, `onDismiss`, `onMarkAllRead`, `emptyText`, `action`

#### `DsAlert`

- 파일: `src/lib/components/design-system/Alert.svelte`
- 역할: 인라인 알림 박스
- Props: `intent`, `title`, `description`, `role`, `icon`, `children`, `actions`

#### `DsBanner`

- 파일: `src/lib/components/design-system/Banner.svelte`
- 역할: 상단 공지/유지보수 안내 등 “가로형 공지” (닫기 + 쿠키 기억 지원)
- Props: `intent`, `title`, `description`, `role`, `icon`, `children`, `actions`, `dismissible`, `dismissLabel`, `dismissKey`, `dismissDays`, `dismissed`, `onDismissedChange`
- SSR에서 “처음 렌더부터 숨김”이 필요하면 `dismissed`를 `+layout.server.ts`/`+page.server.ts`에서 쿠키로 계산해서 넘기는 방식을 권장합니다.

#### `DsEmptyState`

- 파일: `src/lib/components/design-system/EmptyState.svelte`
- 역할: 빈 상태(아이콘/타이틀/설명/액션 슬롯)
- Props: `icon`, `title`, `description`, `children`, `actions`

#### `DsToastRegion`

- 파일: `src/lib/components/design-system/ToastRegion.svelte`
- 역할: 토스트 영역(목록/해제/일시정지)
- Props: `toasts`, `onDismiss`, `onPause`, `onResume`, `position`, `class`, `action`, `regionLabel`, `dismissLabel`, `assertiveIntents`

## 토큰/스타일 확장 가이드(새 컴포넌트 추가 시)

1. 토큰을 먼저 추가합니다: `src/styles/design-system.tokens.css`
   - 컴포넌트 토큰이면 `/* Component: X */`, 패턴 토큰이면 `/* Pattern: X */` 헤더 아래에 배치합니다.
2. 스타일을 추가합니다: `src/styles/design-system.css`
3. 컴포넌트를 추가합니다: `src/lib/components/design-system/*.svelte`
4. export를 추가합니다: `src/lib/components/design-system/index.ts`
5. 쇼케이스에 데모를 추가합니다: `src/routes/design-system/_sections/`
