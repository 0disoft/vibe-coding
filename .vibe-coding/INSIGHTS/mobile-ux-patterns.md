# PWA 네이티브 경험 패턴 가이드

웹앱 기반에서 모바일 환경을 감지하여 **점진적으로 향상(Progressive Enhancement)**되는 UX 패턴 모음입니다. 데스크톱에서는 기본 기능으로, 모바일/PWA에서는 네이티브 앱 수준의 경험을 제공합니다.

## 모바일 환경 감지

CSS와 JS를 함께 사용하여 터치 환경을 정확하게 감지합니다.

```css
/* CSS - 터치 환경 스타일 */
@media (pointer: coarse) {
  .touch-only { display: block; }
  .mouse-only { display: none; }
}
```

```typescript
// JS - 터치 환경 체크
const isTouch = matchMedia('(pointer: coarse)').matches;
```

> [!NOTE]
> `pointer: coarse`는 "대략적인 포인터 장치"를 의미하며, 완벽한 모바일 감지 방법이 아닙니다.
> 터치스크린 노트북도 잡히므로, 필요시 `navigator.maxTouchPoints > 0`과 조합해 사용하세요.

## 제스처 패턴

> [!IMPORTANT]
> **제스처로만 접근 가능한 기능은 만들지 마세요.**
> 스와이프, 롱프레스 등은 "빠른 단축키"일 뿐이며, 동일한 기능은 항상 버튼/메뉴로도 제공해야 합니다.

### 스와이프 제스처

화면 양옆 스와이프로 네비게이션이나 퀵 액션 패널을 구현합니다.

- **왼쪽 → 오른쪽**: 뒤로가기, 최근 본 페이지
- **오른쪽 → 왼쪽**: 퀵 액션 패널
- **아래 → 위**: Bottom Sheet 열기

```typescript
const SWIPE_THRESHOLD = 50 as const;

let startX = 0;
let startY = 0;

function handlePointerDown(e: PointerEvent) {
  startX = e.clientX;
  startY = e.clientY;
}

function handlePointerUp(e: PointerEvent) {
  const deltaX = e.clientX - startX;
  const deltaY = e.clientY - startY;

  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_THRESHOLD) {
    if (deltaX > 0) onSwipeRight();
    else onSwipeLeft();
  }
}
```

### 제스처 영역 CSS 설정

브라우저 기본 동작(뒤로가기, 새로고침)과 충돌을 방지합니다.

```css
/* 탭 하이라이트 제거 (인터랙티브 요소에만 적용 권장) */
.interactive {
  -webkit-tap-highlight-color: transparent;
}

.gesture-area {
  overscroll-behavior-x: none;  /* 좌우 스와이프 시 브라우저 뒤로가기 차단 */
  -webkit-touch-callout: none;  /* 이미지 롱프레스 팝업 차단 */
  user-select: none;
  touch-action: pan-y;          /* 수직 스크롤만 허용, 수평은 JS로 처리 */
}

/* 버튼 클릭 시 네이티브 앱처럼 눌리는 효과 */
button:active {
  transform: scale(0.96);
  opacity: 0.8;
  transition: transform 0.1s;
}
```

> [!WARNING]
> `* { -webkit-tap-highlight-color: transparent; }` 전역 적용은 키보드/보조기기 사용자의 포커스 힌트를 제거하므로 지양하세요.
> 대신 `.interactive` 클래스로 제한하고, `:focus-visible` 스타일을 강화하세요.
>
> [!TIP]
> 스와이프 시 스크롤을 막으려면 `e.preventDefault()`를 호출해야 하며, 이 경우 이벤트 리스너에 `{ passive: false }` 옵션이 필요합니다.

### 길게 누르기 (Long Press)

카드나 게시글을 길게 눌러 빠른 메뉴(북마크, 공유, 신고 등)를 띄웁니다. 손가락이 움직이면 취소됩니다.

```typescript
const LONG_PRESS_DELAY = 500 as const;
const MOVE_THRESHOLD = 10 as const;

let pressTimer: ReturnType<typeof setTimeout> | null = null;

function handlePointerDown(e: PointerEvent) {
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;

  const startX = e.clientX;
  const startY = e.clientY;

  const moveHandler = (moveE: PointerEvent) => {
    if (Math.abs(moveE.clientX - startX) > MOVE_THRESHOLD ||
        Math.abs(moveE.clientY - startY) > MOVE_THRESHOLD) {
      if (pressTimer) clearTimeout(pressTimer);
      target.removeEventListener('pointermove', moveHandler);
    }
  };

  pressTimer = setTimeout(() => {
    showContextMenu();
    if ('vibrate' in navigator) navigator.vibrate(50);
  }, LONG_PRESS_DELAY);

  target.addEventListener('pointermove', moveHandler);
}

function handlePointerUp() {
  if (pressTimer) {
    clearTimeout(pressTimer);
    pressTimer = null;
  }
}
```

## 햅틱 피드백

미세한 진동으로 "앱 같은" 촉각 피드백을 제공합니다. 안드로이드에서 잘 작동하며, iOS Safari는 미지원입니다.

```typescript
const HAPTIC_PATTERNS = {
  tap: 20,
  swipe: 30,
  success: [50, 30, 50],
  error: [100, 50, 100],
} as const;

type HapticType = keyof typeof HAPTIC_PATTERNS;

function vibrate(type: HapticType = 'tap') {
  if ('vibrate' in navigator) {
    navigator.vibrate(HAPTIC_PATTERNS[type]);
  }
}

// 사용 예시
vibrate('tap');      // 짧은 탭 피드백
vibrate('success');  // 성공 패턴 (진동-멈춤-진동)
```

| 상황 | 진동 패턴 |
|------|-----------|
| 버튼 탭 | `20` (짧게) |
| 스와이프 인식 | `30` |
| 성공 | `[50, 30, 50]` |
| 에러/경고 | `[100, 50, 100]` |

## Web Share API

OS 네이티브 공유 시트(카카오톡, 메시지, 에어드롭 등)를 호출합니다.

```typescript
type ShareResult =
  | { success: true; method: 'native' | 'clipboard' }
  | { success: false; error: Error };

async function share(data: { title: string; text?: string; url?: string }): Promise<ShareResult> {
  try {
    if (navigator.share) {
      await navigator.share(data);
      return { success: true, method: 'native' };
    } else {
      // PC 폴백: 클립보드 복사
      await navigator.clipboard.writeText(data.url ?? location.href);
      return { success: true, method: 'clipboard' };
    }
  } catch (e) {
    return { success: false, error: e as Error };
  }
}

// 사용 예시
const result = await share({ title: '제목', url: 'https://...' });
if (!result.success && result.error.name !== 'AbortError') {
  console.error(result.error);
}
```

## 화면 꺼짐 방지 (Wake Lock)

레시피, 긴 글 읽기, QR코드 표시 등에서 화면이 꺼지지 않게 유지합니다.

```typescript
let wakeLock: WakeLockSentinel | null = null;

async function requestWakeLock(): Promise<{ success: boolean; error?: Error }> {
  if (!('wakeLock' in navigator)) {
    return { success: false, error: new Error('Wake Lock API not supported') };
  }

  try {
    wakeLock = await navigator.wakeLock.request('screen');
    return { success: true };
  } catch (e) {
    return { success: false, error: e as Error };
  }
}

function releaseWakeLock() {
  wakeLock?.release();
  wakeLock = null;
}
```

> [!WARNING]
> Wake Lock은 브라우저가 임의로 해제할 수 있습니다.
> `visibilitychange` 이벤트나 `wakeLock.addEventListener('release', ...)`로 감시하고 필요시 재요청하세요.

## PWA 설치 감지

홈 화면에 설치된 상태인지 확인하여 전용 기능을 제공합니다.

```typescript
const isInstalled =
  matchMedia('(display-mode: standalone)').matches ||
  (navigator as any).standalone === true;
```

**설치 PWA 전용 기능 예:**

- 오프라인 전용 유틸 (계산기, 노트)
- 자동 로그인 유지
- 실험적 기능 메뉴

## 기기 기울기 효과 (Tilt)

폰을 기울이면 UI 요소가 3D로 반응하는 시차 효과입니다.

```typescript
interface TiltOptions {
  max: number;
  scale: number;
}

const DEFAULT_TILT_OPTIONS = {
  max: 15,
  scale: 1.05,
} as const satisfies TiltOptions;

// Svelte Action
export function tilt(node: HTMLElement, options: Partial<TiltOptions> = {}) {
  const opts = { ...DEFAULT_TILT_OPTIONS, ...options };
  let initialBeta: number | null = null;
  let initialGamma: number | null = null;

  function handleOrientation(event: DeviceOrientationEvent) {
    const { beta, gamma } = event;
    if (beta === null || gamma === null) return;

    if (initialBeta === null) initialBeta = beta;
    if (initialGamma === null) initialGamma = gamma;

    const x = Math.min(Math.max((gamma - initialGamma) / 30, -1), 1);
    const y = Math.min(Math.max((beta - initialBeta) / 30, -1), 1);

    node.style.transform = `
      perspective(1000px)
      rotateX(${y * opts.max * -1}deg)
      rotateY(${x * opts.max}deg)
      scale3d(${opts.scale}, ${opts.scale}, ${opts.scale})
    `;
  }

  window.addEventListener('deviceorientation', handleOrientation);

  return {
    destroy() {
      window.removeEventListener('deviceorientation', handleOrientation);
    }
  };
}
```

```svelte
<div use:tilt class="card">기울여 보세요!</div>
```

> [!NOTE]
> iOS 13+에서는 `DeviceOrientationEvent.requestPermission()` 권한 요청이 필요합니다.

## 한 손 전용 레이아웃

엄지 손가락이 닿기 쉬운 화면 하단에 주요 UI를 배치합니다.

```css
@media (pointer: coarse) {
  /* 모바일: 하단 탭바 */
  .nav { position: fixed; bottom: 0; }
  .header { display: none; }
}

@media (pointer: fine) {
  /* PC: 상단 헤더 */
  .nav { display: none; }
  .header { display: flex; }
}
```

## 배터리 상태 반응

배터리가 부족할 때 무거운 애니메이션을 끄거나 다크 모드로 전환합니다.

```typescript
async function checkBattery() {
  if ('getBattery' in navigator) {
    const battery = await (navigator as any).getBattery();
    if (battery.level < 0.15 && !battery.charging) {
      enablePowerSaveMode();
    }
  }
}
```

> [!WARNING]
> Battery Status API는 Chrome에서만 지원되며, 개인정보 이슈로 비권장 추세입니다. 필수가 아닌 부가 기능으로만 사용하세요.

## Safe Area 대응 (노치, 홈바)

아이폰의 노치, 하단 홈 인디케이터 영역을 침범하지 않도록 설정합니다.

```html
<!-- viewport-fit=cover 필수 -->
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

```css
:root {
  --sat: env(safe-area-inset-top);
  --sab: env(safe-area-inset-bottom);
  --sal: env(safe-area-inset-left);
  --sar: env(safe-area-inset-right);
}

.header { padding-top: var(--sat); }
.bottom-nav { padding-bottom: var(--sab); }
```

## 가상 키보드 대응

모바일에서 입력창 포커스 시 키보드가 올라오면서 레이아웃이 깨지는 것을 방지합니다.

### Android 키보드 오버레이 설정

```html
<!-- Android: 키보드가 화면을 리사이즈하지 않고 콘텐츠 위에 오버레이 -->
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content">
```

### iOS 입력 폼 자동 확대 방지

iOS에서는 `font-size`가 16px 미만인 `input` 요소에 포커스 시 화면이 자동 확대됩니다.

```css
/* 모바일에서 16px 미만이면 iOS가 자동 확대함 */
@media (max-width: 768px) {
  input, textarea, select {
    font-size: 16px !important;
  }
}
```

> [!TIP]
> `maximum-scale=1` 메타 태그는 접근성 이슈로 권장되지 않습니다. CSS로 해결하세요.

### VirtualKeyboard API (권장)

Chrome 94+, Firefox, Safari에서 지원하는 최신 API입니다.

```css
/* 키보드가 올라올 때 자동으로 safe-area 업데이트 */
.bottom-nav {
  padding-bottom: max(16px, env(keyboard-inset-height, 0px));
  transition: padding-bottom 0.2s ease-out;
}

.chat-input-wrapper {
  padding-bottom: max(12px, env(keyboard-inset-height, 0px));
}
```

```typescript
// 키보드가 콘텐츠 위에 오버레이되도록 설정 (필수)
if ('virtualKeyboard' in navigator) {
  (navigator as any).virtualKeyboard.overlaysContent = true;
}
```

> [!NOTE]
> VirtualKeyboard API가 작동하려면 JavaScript에서 `overlaysContent = true` 설정이 필요합니다.
> Android WebView에서는 `keyboard-inset-height`가 `0px`를 반환할 수 있습니다.

### Visual Viewport API (폴백)

VirtualKeyboard API를 지원하지 않는 환경을 위한 폴백입니다.

```typescript
// Svelte Action
export function keyboardAdjust(node: HTMLElement) {
  function onResize() {
    if (!window.visualViewport) return;
    node.style.height = `${window.visualViewport.height}px`;
  }

  window.visualViewport?.addEventListener('resize', onResize);
  return {
    destroy() {
      window.visualViewport?.removeEventListener('resize', onResize);
    }
  };
}
```

## 당겨서 새로고침 비활성화

앱처럼 보이려면 브라우저의 Pull-to-Refresh를 비활성화하고 직접 구현합니다.

```css
/* 최상위에서 브라우저 기본 Pull-to-Refresh 차단 */
html, body {
  height: 100%;
  overscroll-behavior-y: none;
}

/* 내부 스크롤 컨테이너는 체인 스크롤 허용 (모달 등) */
.scroll-container {
  overscroll-behavior-y: contain;
}
```

> [!TIP]
> `none`을 전역에만 적용하고 내부 스크롤 영역에는 `contain`을 사용하세요.
> 그렇지 않으면 모달 내부 스크롤이 바깥으로 튕기는 자연스러운 동작이 사라집니다.

## App Badge (알림 뱃지)

PWA 설치 시 홈 화면 아이콘에 알림 숫자를 표시합니다.

```typescript
async function setBadge(count: number): Promise<{ success: boolean }> {
  if (!('setAppBadge' in navigator)) return { success: false };

  try {
    if (count > 0) await navigator.setAppBadge(count);
    else await navigator.clearAppBadge();
    return { success: true };
  } catch {
    return { success: false };
  }
}
```

## 앱 이탈 감지 (Visibility Change)

사용자가 앱을 백그라운드로 보냈을 때 미디어 정지, 데이터 동기화 등을 처리합니다.

```typescript
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    pauseMedia();      // 앱 백그라운드
  } else {
    refreshData();     // 앱 복귀
  }
});
```

## 동적 테마 컬러 동기화

다크 모드 전환 시 상단 상태 표시줄 배경색도 동기화해야 자연스럽습니다.

```typescript
// 테마 변경 시 호출
function updateThemeColor(isDark: boolean) {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', isDark ? '#000000' : '#ffffff');
  }
}
```

## 스크롤 복원 제어 (History Restoration)

뒤로 가기 시 스크롤 위치를 직접 제어해야 할 때 사용합니다.

```typescript
if ('scrollRestoration' in history) {
  // 브라우저 기본 복원 끄기 (수동 제어 필요 시)
  history.scrollRestoration = 'manual';
}
```

## 모달 배경 스크롤 잠금

모달이나 바텀 시트가 열려 있을 때 배경 스크롤을 방지합니다.

```typescript
// Svelte Action
export function lockScroll(node: HTMLElement, open: boolean) {
  function update(isOpen: boolean) {
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  update(open);

  return {
    update,
    destroy() {
      document.body.style.overflow = '';
    }
  };
}
```

```svelte
<div use:lockScroll={isModalOpen}>...</div>
```

## 이미지 보호 (드래그/저장 방지)

네이티브 앱처럼 이미지 드래그와 롱프레스 저장을 방지합니다.

```css
.protected-image {
  -webkit-user-drag: none;
  -webkit-touch-callout: none;
  user-select: none;
}
```

> [!NOTE]
> `pointer-events: none`은 클릭 이벤트도 차단하므로 필요한 경우에만 사용하세요.

## iOS Safari PWA 대응

iOS는 Android보다 제약이 많으므로 추가 설정이 필요합니다.

```html
<!-- iOS 전용 메타태그 -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="apple-touch-startup-image" href="/splash.png">
```

| 제약 사항 | 내용 |
|----------|------|
| 캐시 용량 | 50MB 초과 시 자동 삭제 → IndexedDB 사용 권장 |
| localStorage | 5MB 제한, 종료 시 초기화 가능 |
| Pull-to-Refresh | 브라우저 기본 새로고침 제대로 차단 안 됨 |

## 접근성 고려사항

모바일 UX 구현 시 접근성도 함께 고려해야 합니다.

- **제스처 대체 수단**: 모든 스와이프 기능에 키보드/버튼 대체 수단 제공
- **모션 감수성**: `prefers-reduced-motion` 미디어 쿼리 존중
- **터치 타겟**: WCAG 2.1 기준 최소 44x44px

> [!NOTE]
> 자세한 접근성 패턴은 [accessibility-ux-patterns.md](./accessibility-ux-patterns.md)를 참고하세요.

## 참고 자료

- [Web APIs - MDN](https://developer.mozilla.org/en-US/docs/Web/API)
- [What Web Can Do Today](https://whatwebcando.today/)
- [Patterns - web.dev](https://web.dev/patterns/)
