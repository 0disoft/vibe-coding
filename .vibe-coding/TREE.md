# TREE

프로젝트 핵심 파일과 컴포넌트를 폴더 구조별로 요약합니다.
새 파일을 추가할 때는 아래 기존에 작성된 규칙을 따라 TREE를 갱신하세요.

## 구조

```plaintext
/
├── vite.config.ts
├── svelte.config.js
├── tsconfig.json
├── uno.config.ts
├── playwright.config.ts
├── bun.lock
├── e2e/                            # E2E 테스트 (Playwright)
├── messages/
├── project.inlang/
│   └── settings.json
└── src/
    ├── app.html
    ├── app.css
    ├── app.d.ts
    ├── hooks.ts
    ├── hooks.client.ts
    ├── hooks.server.ts
    ├── service-worker.ts
    ├── content/                   # 콘텐츠 디렉토리 (Markdown 등)
    ├── scripts/                   # 빌드 스크립트
    ├── styles/
    │   ├── tokens.css
    │   ├── base.css
    │   ├── scrollbar.css
    │   ├── prose.css
    │   └── transitions.css
    ├── routes/                    # SvelteKit 페이지 라우트
    └── lib/
        ├── index.ts
        ├── constants/
        │   ├── index.ts
        │   ├── cookies.ts
        │   ├── site.ts
        │   └── policy.ts
        ├── stores/
        │   ├── index.ts
        │   ├── persisted-state.svelte.ts
        │   ├── theme.svelte.ts
        │   └── font-size.svelte.ts
        ├── paraglide/             # Paraglide 자동 생성 파일
        │   ├── messages.js
        │   ├── messages/          # 언어별 메시지 파일
        │   ├── registry.js
        │   ├── runtime.js
        │   └── server.js
        ├── components/
        │   ├── CodeBlock.svelte
        │   ├── Footer.svelte
        │   ├── Header.svelte
        │   ├── header-actions/
        │   │   ├── FontSizePicker.svelte
        │   │   ├── LanguagePicker.svelte
        │   │   ├── ThemeToggle.svelte
        │   │   └── UserMenu.svelte
        │   └── ui/
        │       └── index.ts
        └── types/
            └── index.ts
```

## 파일 설명

### 루트 (/)

| 파일                   | 역할                                            |
| ---------------------- | ----------------------------------------------- |
| `vite.config.ts`       | Vite 번들링 설정과 플러그인 구성                |
| `svelte.config.js`     | SvelteKit 설정 (어댑터, 프리프로세서)           |
| `tsconfig.json`        | TypeScript 컴파일러 설정                        |
| `uno.config.ts`        | UnoCSS 테마 토큰, 프리셋, 디자인 시스템 설정    |
| `playwright.config.ts` | Playwright E2E 테스트 설정 (webServer, testDir) |
| `bun.lock`             | Bun 패키지 버전 고정 잠금 파일                  |

### e2e/

| 파일             | 역할                                       |
| ---------------- | ------------------------------------------ |
| `layout.spec.ts` | 레이아웃 테스트 (헤더/푸터 요소 표시 검증) |

### messages/

| 폴더        | 역할                                        |
| ----------- | ------------------------------------------- |
| `messages/` | Paraglide i18n 메시지 파일 (20개 언어 지원) |

### project.inlang/

| 파일            | 역할                                              |
| --------------- | ------------------------------------------------- |
| `settings.json` | Inlang 다국어 설정, 로케일 목록, 메시지 경로 패턴 |

### src/

| 파일                | 역할                                                         |
| ------------------- | ------------------------------------------------------------ |
| `app.html`          | 루트 HTML 템플릿. `data-theme`, `%paraglide.lang%` 속성 주입 |
| `app.css`           | 스타일 모듈 진입점. styles/ 폴더의 CSS 파일들을 import       |
| `app.d.ts`          | SvelteKit 전역 타입 확장 (Locals, PageData 등)               |
| `hooks.ts`          | locale 프리픽스 제거 reroute 훅                              |
| `hooks.client.ts`   | 클라이언트 전용 훅 (브라우저 API, 분석 등)                   |
| `hooks.server.ts`   | 서버 훅 (테마 쿠키 주입, Paraglide 미들웨어)                 |
| `service-worker.ts` | PWA 서비스 워커 (캐싱, 오프라인 지원)                        |

### src/styles/

| 파일              | 역할                                                      |
| ----------------- | --------------------------------------------------------- |
| `tokens.css`      | CSS 변수: 색상 팔레트, 폰트 스택, 사이즈 스케일, 다크모드 |
| `base.css`        | 기본 HTML 요소 스타일 (body, h1-h3, code, pre)            |
| `scrollbar.css`   | 얇은 스크롤바 스타일 (Svelte 공식 사이트 스타일)          |
| `prose.css`       | .prose 마크다운 콘텐츠 타이포그래피                       |
| `transitions.css` | View Transitions API 기반 페이지 전환 효과                |

### src/lib/

| 파일                                              | 역할                                                           |
| ------------------------------------------------- | -------------------------------------------------------------- |
| `index.ts`                                        | $lib 배럴 export (스토어, 상수 통합)                           |
| `constants/index.ts`                              | 상수 배럴 export                                               |
| `constants/cookies.ts`                            | 쿠키 키 상수 (THEME_COOKIE, FONT_SIZE_COOKIE)                  |
| `constants/site.ts`                               | 사이트 기본 정보 (name, description, email, links)             |
| `constants/policy.ts`                             | 정책 설정 (effectiveDate, cpoName, dataProcessors)             |
| `stores/index.ts`                                 | 스토어 배럴 export                                             |
| `stores/persisted-state.svelte.ts`                | 쿠키+DOM 동기화 퍼시스턴스 스토어 팩토리                       |
| `stores/theme.svelte.ts`                          | 라이트/다크 테마 상태 관리, FOUC 방지                          |
| `stores/font-size.svelte.ts`                      | 글자 크기 1~9단계 관리                                         |
| `paraglide/`                                      | Paraglide 자동 생성 폴더 (messages, runtime, registry, server) |
| `components/CodeBlock.svelte`                     | Shiki 기반 코드 하이라이팅 + 복사 버튼 컴포넌트                |
| `components/Header.svelte`                        | 공통 헤더 컴포넌트 (사이트명, 네비게이션, Action 슬롯)         |
| `components/Footer.svelte`                        | 공통 푸터 컴포넌트 (카피라이트, 약관 링크)                     |
| `components/header-actions/ThemeToggle.svelte`    | 테마 토글 버튼                                                 |
| `components/header-actions/LanguagePicker.svelte` | 언어 변경 버튼 및 모달                                         |
| `components/header-actions/FontSizePicker.svelte` | 폰트 크기 조절 버튼 및 모달                                    |
| `components/header-actions/UserMenu.svelte`       | 사용자 메뉴 (프로필, 로그인/로그아웃)                          |
| `components/ui/index.ts`                          | UI 컴포넌트 배럴 파일                                          |
| `types/index.ts`                                  | 타입 배럴 export ($lib/types용)                                |
