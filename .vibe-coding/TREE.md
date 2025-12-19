# TREE

프로젝트 핵심 파일과 컴포넌트를 폴더 구조별로 요약합니다.
새 파일을 추가할 때는 아래 기존에 작성된 규칙을 따라 TREE를 갱신하세요.

## 구조

```plaintext
/
├── vite.config.ts
├── svelte.config.js
├── tsconfig.json
├── tsconfig.scripts.json
├── uno.config.ts
├── playwright.config.ts
├── bun.lock
├── .vibe-coding/
│   ├── INSIGHTS/
│   ├── KNOWLEDGE/
│   ├── PUBLIC_APIS/
│   ├── SOS/
│   ├── TOOLS/
│   ├── TROUBLE/
│   ├── WEBNOVEL/
│   └── TREE.md
├── e2e/                            # E2E 테스트 (Playwright)
│   ├── a11y-skiplink-errorsummary.spec.ts
│   └── markdown-rendering.spec.ts
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
    ├── service-worker/            # 서비스 워커 로직 모듈 (service-worker.ts 조립용)
    ├── content/                   # 콘텐츠 디렉토리 (Markdown 등)
    ├── scripts/                   # 빌드 스크립트
    ├── styles/
    │   ├── typography.css          # CSS 변수 (폰트, 언어별 설정)
    │   ├── design-system.tokens.css # 디자인 시스템 전역 토큰(:root 스코프, SSOT)
    │   ├── design-system.css       # 디자인 시스템 컴포넌트/패턴 스타일
    │   ├── base.css
    │   ├── scrollbar.css
    │   ├── prose.css
    │   └── transitions.css
    ├── routes/                    # SvelteKit 페이지 라우트
    │   ├── offline/
    │   ├── design-system/          # DS/Docs 컴포넌트 쇼케이스 (임시)
    │   │   ├── +page.server.ts
    │   │   ├── +page.svelte
    │   │   └── _sections/          # 섹션 컴포넌트 (조립용)
    │   ├── [[lang]]/
    │   ├── +error.svelte
    │   ├── +layout.svelte
    │   ├── +layout.server.ts
    │   ├── +page.server.ts
    │   └── +page.svelte
    └── lib/
        ├── index.ts
        ├── assets/                # 정적 에셋 (이미지, 아이콘 등)
        ├── i18n/                  # i18n 테스트 및 유틸리티
        │   └── messages.test.ts
        ├── server/                # 서버 전용 코드 (모노레포 전환 시 apps/api로 이동)
        │   ├── index.ts
        │   ├── rate-limiter.ts
        │   ├── hooks/             # SvelteKit 서버 훅 구성 요소 (hooks.server.ts 조립용)
        │   │   ├── request-id.ts
        │   │   ├── security-headers.ts
        │   │   ├── body-size-limit.ts
        │   │   ├── rate-limit.ts
        │   │   ├── root-redirect.ts
        │   │   ├── paraglide-theme-font.ts
        │   │   └── error-handler.ts
        │   └── services/          # 비즈니스 서비스 레이어
        ├── shared/                # 프론트/백 공유 코드 (모노레포 전환 시 packages/shared로 이동)
        │   ├── index.ts
        │   ├── types/             # 공용 타입 정의
        │   ├── utils/             # 공용 유틸리티 함수
        │   └── schemas/           # API 스키마 (TypeBox)
        ├── constants/
        │   ├── index.ts
        │   ├── cookies.ts
        │   ├── site.ts
        │   └── policy.ts
        ├── stores/
        │   ├── index.ts
        │   ├── persisted-state.svelte.ts
        │   ├── theme.svelte.ts
        │   ├── theme-palette.svelte.ts
        │   ├── toast.svelte.ts
        │   ├── toast-store.svelte.ts
        │   ├── toast.types.ts
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
        │   ├── docs/              # 문서/가이드/API 문서 전용 컴포넌트
        │   ├── design-system/     # 디자인 시스템 UI 컴포넌트 (Button/Input/Card 등)
        │   │   └── README.md      # DS 컴포넌트 레퍼런스 (Props/예제/패턴 요약)
        │   ├── footer-actions/
        │   │   └── FooterMenu.svelte
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
| `tsconfig.scripts.json`| 스크립트 전용 TypeScript 설정 (JS 체크 포함)    |
| `uno.config.ts`        | UnoCSS 테마 토큰, 프리셋, 디자인 시스템 설정    |
| `playwright.config.ts` | Playwright E2E 테스트 설정 (webServer, testDir) |
| `bun.lock`             | Bun 패키지 버전 고정 잠금 파일                  |
| `.env`                 | 환경변수 (API 키 등, gitignore 포함)            |
| `.env.example`         | 환경변수 템플릿 (버전 관리용)                   |

### .vibe-coding/

| 파일/폴더              | 역할                                                       |
| ---------------------- | ---------------------------------------------------------- |
| `TREE.md`              | 프로젝트 핵심 파일/컴포넌트 구조 문서                      |
| `SPEC.md`              | 프로젝트 스펙 문서                                         |
| `TODO.md`              | 할 일 목록 및 진행 상황                                    |
| `WIP.md`               | 세부 실행 계획 및 작업 분해 (임시 저장소)                  |
| `API.md`               | API 엔드포인트 문서                                        |
| `REVIEW.md`            | 코드 리뷰 가이드라인                                       |
| `.temporary.txt`       | 긴 질문/응답 임시 저장 스크래치패드 (항상 덮어쓰기 저장)   |
| `.suggestions.txt`     | 코드 개선 제안 임시 저장 스크래치패드 (항상 덮어쓰기 저장) |
| `.questions.txt`       | 추가 질문 임시 저장 스크래치패드 (항상 덮어쓰기 저장)      |
| `.reports.txt`         | 수정 보고 임시 저장 스크래치패드 (항상 덮어쓰기 저장)      |
| `stack.manifest.toml`  | 기술 스택 매니페스트                                       |
| `INSIGHTS/`            | 전략적 인사이트, 아키텍처 결정, 레퍼런스 문서 모음         |
| `KNOWLEDGE/`           | 기술 지식 베이스 (언어별 가이드 등)                        |
| `PUBLIC_APIS/`         | Public API 카탈로그(Provider별 연동 메모/레시피)           |
| `TROUBLE/`             | 문제 해결 기록 (SOLVED.md 등)                              |
| `SOS/`                 | 긴급 이슈 및 디버깅 로그                                   |
| `TOOLS/README.md`      | 자동화 스크립트 사용법 문서 (개별 도구는 이 파일 참조)     |
| `TOOLS/design-system/` | 디자인 시스템 운영/문서화 (토큰 매니페스트/스펙 포함)        |
| `WEBNOVEL/`            | 웹소설 집필 템플릿 (캐릭터, 사물, 현상, 에피소드 관리)     |

### e2e/

| 파일 | 역할 |
| --- | --- |
| `a11y-skiplink-errorsummary.spec.ts` | a11y 패턴 회귀 테스트(SkipLink, ErrorSummary) |
| `markdown-rendering.spec.ts` | 마크다운 렌더링 품질(볼드 표식 잔존) 회귀 테스트 |

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
| `service-worker.ts` | PWA 서비스 워커 엔트리 (캐싱, 오프라인 지원)                 |
| `service-worker/`   | 서비스 워커 로직 모듈 (캐시 전략, 요청 판별, 경로 보정)       |

### src/styles/

| 파일              | 역할                                                      |
| ----------------- | --------------------------------------------------------- |
| `typography.css`    | CSS 변수: 폰트 패밀리, 언어별 타이포그래피 설정           |
| `design-system.tokens.css` | 디자인 시스템 전역 토큰(:root 스코프, SSOT) |
| `design-system.css` | 디자인 시스템 컴포넌트/패턴 스타일                        |
| `base.css`        | 기본 HTML 요소 스타일 (body, h1-h3, code, pre)            |
| `scrollbar.css`   | 얇은 스크롤바 스타일 (Svelte 공식 사이트 스타일)          |
| `prose.css`       | .prose 마크다운 콘텐츠 타이포그래피                       |
| `transitions.css` | View Transitions API 기반 페이지 전환 효과                |

### src/routes/

| 파일/폴더 | 역할 |
| --- | --- |
| `routes/offline/+page.svelte` | 오프라인 폴백 페이지 |
| `routes/design-system/+page.svelte` | DS/Docs 컴포넌트 쇼케이스 (조립용, 임시) |
| `routes/design-system/_sections/` | `/design-system` 섹션 컴포넌트 모음 |
| `routes/[[lang]]/` | i18n 로케일 파라미터 루트 (Optional) |
| `routes/+layout.server.ts` | 라우팅 옵션(예: trailingSlash) 등 서버 전용 설정 |
| `routes/[[lang]]/terms/+page.svelte` | 이용약관 페이지 |
| `routes/[[lang]]/privacy/+page.svelte` | 개인정보 처리방침 페이지 |
| `routes/[[lang]]/cookie/+page.svelte` | 쿠키 정책 페이지 |
| `routes/[[lang]]/gdpr/+page.svelte` | GDPR 및 개인정보 권리 페이지 |
| `routes/[[lang]]/security/+page.svelte` | 보안 정책 페이지 |
| `routes/[[lang]]/bug-bounty/+page.svelte` | 버그 바운티 프로그램 안내 페이지 |

### src/scripts/

빌드·유지보수용 스크립트 모음입니다.

| 파일 | 역할 |
| --- | --- |
| `postbuild-sitemap.ts` | `postbuild` 훅에서 sitemap 생성(도메인/출력폴더 안전가드 포함) |
| `postbuild-preview-manifest.ts` | preview 환경에서 manifest 관련 이슈를 줄이기 위한 후처리(shim) |
| `scaffold-pages.ts` | `src/lib/constants/pages.ts` 기반으로 `routes/[[lang]]/**/+page.svelte` 스텁 페이지 자동 생성 |

### src/lib/

| 파일                                              | 역할                                                           |
| ------------------------------------------------- | -------------------------------------------------------------- |
| `index.ts`                                        | $lib 배럴 export (스토어, 상수 통합)                           |
| `assets/`                                         | 정적 에셋 폴더 (이미지, 아이콘 등)                             |
| `i18n/messages.test.ts`                           | i18n 메시지 테스트                                             |
| `server/index.ts`                                 | 서버 전용 코드 진입점 (모노레포 전환 시 apps/api로 이동)       |
| `server/rate-limiter.ts`                          | IP 기반 Rate Limit 유틸리티                                   |
| `server/hooks/`                                   | SvelteKit 서버 훅 핸들러 모듈 (hooks.server.ts 조립용)         |
| `server/services/`                                | 비즈니스 서비스 레이어 (auth, user, payment 등)                |
| `shared/index.ts`                                 | 프론트/백 공유 코드 진입점 (모노레포 시 packages/shared로 이동)|
| `shared/types/`                                   | 공용 타입 정의 (ApiResponse, User 등)                          |
| `shared/utils/`                                   | 공용 유틸리티 함수 (format, validate 등)                       |
| `shared/schemas/`                                 | API 스키마 (TypeBox 검증용)                                    |
| `constants/index.ts`                              | 상수 배럴 export                                               |
| `constants/cookies.ts`                            | 쿠키 키 상수 (THEME_COOKIE, FONT_SIZE_COOKIE)                  |
| `constants/site.ts`                               | 사이트 기본 정보 (name, description, origin, email, links)     |
| `constants/policy.ts`                             | 정책 설정 (effectiveDate, cpoName, dataProcessors)             |
| `constants/pages.ts`                              | 페이지 레지스트리(스캐폴딩/링크 목록용)                         |
| `stores/index.ts`                                 | 스토어 배럴 export                                             |
| `stores/persisted-state.svelte.ts`                | 쿠키+DOM 동기화 퍼시스턴스 스토어 팩토리                       |
| `stores/theme.svelte.ts`                          | 라이트/다크 테마 상태 관리, FOUC 방지                          |
| `stores/toast.svelte.ts`                          | 전역 토스트 Public API(export 재노출)                          |
| `stores/toast-store.svelte.ts`                    | 전역 토스트 스토어 구현(큐/중복 방지/업데이트/pause-resume)     |
| `stores/toast.types.ts`                           | Toast 타입(ToastItem/Options 등)                               |
| `stores/font-size.svelte.ts`                      | 글자 크기 1~9단계 관리                                         |
| `paraglide/`                                      | Paraglide 자동 생성 파일 (messages, runtime, registry, server) |
| `components/CodeBlock.svelte`                     | Shiki 기반 코드 하이라이팅 + 복사 버튼 컴포넌트                |
| `components/code-block/shiki.ts`                  | Shiki 하이라이터 싱글톤/언어 로더                              |
| `components/Header.svelte`                        | 공통 헤더 컴포넌트 (사이트명, 네비게이션, Action 슬롯)         |
| `components/Footer.svelte`                        | 공통 푸터 컴포넌트 (카피라이트, 약관 링크)                     |
| `components/docs/`                                | 문서/가이드/API 문서 전용 패턴 컴포넌트                        |
| `components/design-system/`                       | 디자인 시스템 UI 컴포넌트 폴더 (세부 목록/사용법은 README 참조) |
| `components/design-system/README.md`              | DS 컴포넌트 레퍼런스 (Props/예제/패턴 요약)                    |
| `components/marketing/`                           | 마케팅 전용 조립 컴포넌트                                      |
| `components/marketing/MarketingHero.svelte`       | 랜딩 히어로 섹션 컴포넌트                                      |
| `components/policy/`                              | 정책/컴플라이언스 전용 컴포넌트                               |
| `components/policy/PolicyLayout.svelte`           | 정책 페이지 레이아웃(타이틀/메타/콘텐츠 래퍼)                  |
| `components/search/`                              | 검색 경험 전용 컴포넌트                                        |
| `components/search/SearchPanelSection.svelte`     | 검색 패널 섹션 컴포넌트                                        |
| `components/header-actions/ThemeToggle.svelte`    | 테마 토글 버튼                                                 |
| `components/header-actions/LanguagePicker.svelte` | 언어 변경 버튼 및 모달                                         |
| `components/header-actions/FontSizePicker.svelte` | 폰트 크기 조절 버튼 및 모달                                    |
| `components/header-actions/UserMenu.svelte`       | 사용자 메뉴 (프로필, 로그인/로그아웃)                          |
| `components/footer-actions/FooterMenu.svelte`     | 푸터 더보기 메뉴 (후원, 정책, 사이트맵 등)                     |
| `components/ui/index.ts`                          | UI 컴포넌트 배럴 파일                                          |
| `types/index.ts`                                  | 타입 배럴 export ($lib/types용)                                |
