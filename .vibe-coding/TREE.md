# TREE

프로젝트 핵심 파일과 컴포넌트를 폴더 구조별로 요약합니다.
새 파일을 추가할 때는 아래 기존에 작성된 규칙을 따라 TREE를 갱신하세요.

## /

- `vite.config.ts`: Vite 번들링 설정과 플러그인 구성을 관리합니다.
- `uno.config.ts`: UnoCSS 테마 토큰, 프리셋, 디자인 시스템 설정을 정의합니다.
- `bun.lock`: Bun 패키지 버전 고정 및 재현 가능한 설치를 위한 잠금 파일입니다.

## project.inlang/

- `settings.json`: Inlang 프로젝트 설정으로 메시지 포맷 플러그인, 로케일 목록, `./messages/{locale}.json` 경로 패턴을 정의합니다.

## src/

- `app.html`: SvelteKit 루트 HTML 템플릿. 서버 훅이 `data-theme`와 언어(`%paraglide.lang%`) 속성을 주입하며 `%sveltekit.head%`와 `%sveltekit.body%` 슬롯을 제공합니다.
- `app.css`: 전역 스타일과 CSS 변수 정의를 포함해 테마 색상, 폰트, 레이아웃 기본값을 관리합니다.
- `hooks.ts`: 클라이언트 사이드에서 locale 프리픽스를 제거해 기본 경로로 리라우팅하는 `reroute` 훅을 제공합니다.
- `hooks.client.ts`: 클라이언트 전용 훅; 브라우저 API 의존 초기화, 라우트 가드, 분석/서비스워커 등 CSR 전용 로직을 배치할 수 있습니다.
- `hooks.server.ts`: SvelteKit 서버 훅을 `sequence`로 묶어 테마 쿠키를 `data-theme` 속성에 주입하고, Paraglide 미들웨어로 언어별 `lang` 설정과 라우팅을 처리합니다.

### lib/

- `theme.svelte.ts`: 라이트/다크 테마 상태를 관리하고, SSR의 `data-theme` 값과 쿠키·시스템 설정을 동기화해 FOUC 없이 테마를 초기화합니다.
- `font-size.svelte.ts`: 글자 크기 1~9 단계를 쿠키와 `data-font-size` 속성으로 동기화해 전역 폰트 스케일을 관리합니다.
- `stores/persisted-state.svelte.ts`: 쿠키와 DOM data-* 속성을 동기화하는 공용 퍼시스턴스 스토어 팩토리입니다.
- components/
  - `FontSizeSlider.svelte`: 폰트 크기 1~9 단계를 슬라이더로 제어하며 `font-size` 스토어를 업데이트합니다.
  - ui/
    - `index.ts`: UI 컴포넌트 배럴 파일로 이 디렉터리나 상위의 UI 컴포넌트들을 모아 export합니다.
- prefs/
  - `constants.ts`: 쿠키 키(테마, 폰트 크기 등)와 공통 프리퍼런스 상수를 중앙 관리합니다.

## Types

- src/app.d.ts: SvelteKit 전역 타입 확장(Locals: paraglide, theme, fontSize 등).
