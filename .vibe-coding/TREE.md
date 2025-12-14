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
├── .vibe-coding/
│   └── PUBLIC_APIS/
│       └── README.md               # Public API 카탈로그 (하위 구조는 이 파일 참조)
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
        ├── assets/                # 정적 에셋 (이미지, 아이콘 등)
        ├── i18n/                  # i18n 테스트 및 유틸리티
        │   └── messages.test.ts
        ├── server/                # 서버 전용 코드 (모노레포 전환 시 apps/api로 이동)
        │   ├── index.ts
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
| `WEBNOVEL/`            | 웹소설 집필 템플릿 (캐릭터, 사물, 현상, 에피소드 관리)     |

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

### src/scripts/

빌드·유지보수용 일회성 스크립트 모음입니다. i18n 메시지 일괄 업데이트, 쿠키 정책 마크다운 생성, 날짜 갱신 등 자동화 작업에 사용합니다.

### src/lib/

| 파일                                              | 역할                                                           |
| ------------------------------------------------- | -------------------------------------------------------------- |
| `index.ts`                                        | $lib 배럴 export (스토어, 상수 통합)                           |
| `assets/`                                         | 정적 에셋 폴더 (이미지, 아이콘 등)                             |
| `i18n/messages.test.ts`                           | i18n 메시지 테스트                                             |
| `server/index.ts`                                 | 서버 전용 코드 진입점 (모노레포 전환 시 apps/api로 이동)       |
| `server/services/`                                | 비즈니스 서비스 레이어 (auth, user, payment 등)                |
| `shared/index.ts`                                 | 프론트/백 공유 코드 진입점 (모노레포 시 packages/shared로 이동)|
| `shared/types/`                                   | 공용 타입 정의 (ApiResponse, User 등)                          |
| `shared/utils/`                                   | 공용 유틸리티 함수 (format, validate 등)                       |
| `shared/schemas/`                                 | API 스키마 (TypeBox 검증용)                                    |
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
| `components/footer-actions/FooterMenu.svelte`     | 푸터 더보기 메뉴 (후원, 정책, 사이트맵 등)                     |
| `components/ui/index.ts`                          | UI 컴포넌트 배럴 파일                                          |
| `types/index.ts`                                  | 타입 배럴 export ($lib/types용)                                |
