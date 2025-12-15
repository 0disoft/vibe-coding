# TOOLS

프로젝트에서 반복적으로 필요한 작업을 자동화하는 스크립트 모음입니다.

## 도구 목록

| 도구 | 용도 | 빠른 실행 |
|------|------|-----------|
| [00-run-tools](#00-run-tools) | 주요 도구 순차 실행 (권장 파이프라인) | `bun .vibe-coding/TOOLS/00-run-tools.ts` |
| [api-catalog](#api-catalog) | Public API 카탈로그 뷰어 | `bun .vibe-coding/TOOLS/api-catalog/server.ts` |
| [webnovel-viewer](#webnovel-viewer) | 웹소설 등장요소 뷰어 | `bun .vibe-coding/TOOLS/webnovel-viewer/server.ts` |
| [a11y-ux-patterns](#a11y-ux-patterns) | 접근성 및 UX 패턴 검사 | `bun .vibe-coding/TOOLS/04-a11y-ux-patterns.ts` |
| [file-size-patterns](#file-size-patterns) | 파일 크기 및 복잡도 검사 | `bun .vibe-coding/TOOLS/05-file-size-patterns.ts` |
| [find-word](#find-word) | 프로젝트 단어/패턴 검색 | `bun .vibe-coding/TOOLS/find-word.ts <패턴>` |
| [fix-bold-issues](#fix-bold-issues) | 마크다운 볼드 파싱 오류 수정 | `bun .vibe-coding/TOOLS/06-fix-bold-issues.ts` |
| [lint-patterns](#lint-patterns) | 타입스크립트 안티패턴 감지 | `bun .vibe-coding/TOOLS/02-lint-patterns.ts` |
| [security-patterns](#security-patterns) | 보안 취약점 패턴 탐지 | `bun .vibe-coding/TOOLS/01-security-patterns.ts` |
| [route-audit](#route-audit) | 라우트/내부 링크 정적 점검 | `bun .vibe-coding/TOOLS/03-route-audit.ts` |
| [design-system](design-system/README.md) | 디자인 시스템 lab 운영/검증 가이드 | `bun dev` 후 `/lab/design-system` |
| [design-system dtcg](design-system/README.md#dtcgssot--css-토큰-동기화) | DTCG(SSOT) → CSS 토큰 동기화/검증 | `bun .vibe-coding/TOOLS/design-system/dtcg-sync.ts --verify` |
| [design-system tokens](design-system/README.md#토큰-매니페스트-생성) | 디자인 시스템 토큰 매니페스트 생성 | `bun .vibe-coding/TOOLS/design-system/tokens-manifest.ts` |

---

## 리포트 저장 규칙

모든 도구의 리포트는 `.vibe-coding/TOOLS/reports/`에 **고정 파일명**으로 저장되며, 기존 파일이 있으면 **덮어쓰기**로 저장됩니다.

예시:

- `a11y-ux-report.txt`
- `file-size-report.txt`
- `find-word-report.txt`
- `fix-bold-report.txt`
- `lint-report.txt`
- `route-audit-report.txt`
- `security-report.txt`

---

## 00-run-tools

`.vibe-coding/TOOLS/`의 주요 점검 도구들을 권장 순서로 단계 실행합니다.

```bash
# 전체 파이프라인 실행
bun .vibe-coding/TOOLS/00-run-tools.ts

# 한 단계라도 실패하면 즉시 중단
bun .vibe-coding/TOOLS/00-run-tools.ts --stop-on-fail

# 각 단계에 동일 옵션 전달 (예: 리포트 생략)
bun .vibe-coding/TOOLS/00-run-tools.ts --no-report

# 옵션 충돌을 피하고 싶다면 -- 구분자도 사용 가능
bun .vibe-coding/TOOLS/00-run-tools.ts -- --no-report
```

단계별 실행 도구:

- `01-security-patterns.ts`
- `02-lint-patterns.ts`
- `03-route-audit.ts`
- `04-a11y-ux-patterns.ts`
- `05-file-size-patterns.ts`
- `06-fix-bold-issues.ts`

`06-fix-bold-issues.ts`는 기본 동작이 파일을 수정하므로, `00-run-tools.ts`에서는 기본적으로 `--dry-run`으로 실행됩니다.
실제 수정까지 포함하려면 `00-run-tools.ts`에 `--fix-bold-write`를 추가하세요.

---

## a11y-ux-patterns

Svelte/HTML/CSS 파일에서 접근성 및 UX 패턴을 검사합니다.

### a11y-ux-patterns 실행 방법

```bash
# 기본: src 전체 스캔
bun .vibe-coding/TOOLS/04-a11y-ux-patterns.ts

# 특정 디렉토리
bun .vibe-coding/TOOLS/04-a11y-ux-patterns.ts src/lib/components

# 오류만 표시
bun .vibe-coding/TOOLS/04-a11y-ux-patterns.ts --errors-only

# 회귀 방지 테스트 실행
bun .vibe-coding/TOOLS/04-a11y-ux-patterns.ts --self-test
```

### a11y-ux-patterns 감지 규칙

#### 접근성 (a11y)

| ID | 심각도 | 설명 |
|----|--------|------|
| `a11y-img-alt-missing` | ❌ 오류 | `<img>` alt 속성 누락 |
| `a11y-empty-link` | ❌ 오류 | 빈 `<a>` 태그 |
| `a11y-button-type` | ⚠️ 경고 | `<button>` type 속성 누락 |
| `a11y-icon-only-interactive` | 💡 정보 | 아이콘만 있는 버튼/링크 (aria-label 필요) |
| `a11y-input-missing-label` | 💡 정보 | Input 레이블 누락 의심 |
| `a11y-tabindex-positive` | ⚠️ 경고 | 양수 tabindex 사용 |
| `a11y-popup-no-expanded` | ⚠️ 경고 | aria-haspopup에 aria-expanded 누락 |
| `a11y-multiple-main` | ❌ 오류 | `<main>` 요소 중복 |

#### RTL 대응

| ID | 심각도 | 설명 |
|----|--------|------|
| `rtl-position-class` | ⚠️ 경고 | `left-0`, `right-0` → `start-0`, `end-0` |
| `rtl-margin-class` | 💡 정보 | `ml-*`, `mr-*` → `ms-*`, `me-*` |
| `rtl-padding-class` | 💡 정보 | `pl-*`, `pr-*` → `ps-*`, `pe-*` |
| `rtl-text-align-class` | 💡 정보 | `text-left`, `text-right` → `text-start`, `text-end` |

#### 모바일/PWA

| ID | 심각도 | 설명 |
|----|--------|------|
| `mobile-no-zoom` | ❌ 오류 | `user-scalable=no`, `maximum-scale=1` 금지 |
| `mobile-tap-highlight-global` | ⚠️ 경고 | 전역 tap-highlight 제거 비권장 |

---

## file-size-patterns

파일 크기 및 복잡도를 검사합니다. `AGENTS.md`의 '파일 크기 및 분리 기준'에 따라 분석합니다.

### file-size-patterns 실행 방법

```bash
# 기본: src 전체 스캔
bun .vibe-coding/TOOLS/05-file-size-patterns.ts

# 특정 디렉토리
bun .vibe-coding/TOOLS/05-file-size-patterns.ts src/lib

# 모든 이슈 파일 표시 (기본: 상위 20개)
bun .vibe-coding/TOOLS/05-file-size-patterns.ts --all

# JSON 형식 출력
bun .vibe-coding/TOOLS/05-file-size-patterns.ts --json

# 리포트 파일 생성 생략
bun .vibe-coding/TOOLS/05-file-size-patterns.ts --no-report
```

### file-size-patterns 검사 기준

| 줄 수 | 상태 | 행동 |
|-------|------|------|
| ~150 | 🟡 경고 | 책임이 2개 이상 섞였는지 점검 |
| ~300 | 🟠 권장 | 모듈 경계를 잡고 파일 분리 |
| ~600 | 🔴 필수 | 리뷰·테스트 비용 급증, 즉시 분리 |
| 1000+ | 💀 리스크 | 진입 파일은 조립만 남기고 로직 이동 |

### file-size-patterns 추가 검사

- **import 개수**: 20개 초과 시 경고
- **진입 파일**: `hooks.server.ts`, `vite.config.ts` 등은 더 엄격한 기준 (50~150줄 목표)
- **최적화**: 4KB 이하 파일은 줄 수 검사 생략 (150줄 미달 확실)

### file-size-patterns 리포트 저장

이슈가 발견되면 `.vibe-coding/TOOLS/reports/file-size-report.txt`에 자동 저장됩니다.
`--no-report` 옵션으로 생략할 수 있습니다.

### file-size-patterns 종료 코드

- `0`: 모든 파일이 기준 충족 또는 경고/권장 수준만 존재
- `1`: 필수(🔴) 또는 리스크(💀) 수준 파일 존재

---

## find-word

프로젝트에서 특정 단어나 패턴을 검색합니다.

### find-word 실행 방법

```bash
# 단일 단어 검색
bun .vibe-coding/TOOLS/find-word.ts TODO

# OR 검색 (따옴표 필수)
bun .vibe-coding/TOOLS/find-word.ts "TODO|FIXME|HACK"

# 특정 경로에서 검색
bun .vibe-coding/TOOLS/find-word.ts "console\\.log" src/lib

# 정규식 사용
bun .vibe-coding/TOOLS/find-word.ts "function\\s+\\w+"
```

### find-word 옵션

| 옵션 | 설명 |
|------|------|
| `--case-sensitive, -s` | 대소문자 구분 검색 (기본: 무시) |
| `--no-color` | 색상 하이라이트 없이 출력 |
| `--no-report` | 리포트 파일 생성 생략 |
| `--json` | JSON 형식으로 출력 |
| `--help` | 도움말 표시 |

### find-word 검색 대상

- TypeScript/JavaScript: `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`
- 프레임워크: `.svelte`, `.vue`, `.html`
- 스타일: `.css`, `.scss`, `.sass`
- 설정: `.json`, `.yaml`, `.yml`, `.toml`
- 문서: `.md`, `.mdx`

### find-word 출력 예시

```plaintext
🔍 패턴: TODO|FIXME
대소문자: 무시

검색: 42개 파일 | 매치: 5개 | 파일: 3개

📄 src/lib/utils.ts (2)
    15: // TODO: 리팩터링 필요
    28: // FIXME: 엣지 케이스 처리

📄 src/routes/+page.svelte (3)
     8: <!-- TODO: 반응형 개선 -->
```

---

## fix-bold-issues

마크다운 파일에서 볼드 파싱 오류를 자동으로 수정합니다.

### 문제 상황

`**볼드:**` 뒤에 한글 조사가 바로 붙으면 마크다운 파서가 볼드를 제대로 닫지 못합니다:

```markdown
❌ **무료:**로 시작하세요  → "**무료:**로" 그대로 노출
✅ **무료:**&#8203;로 시작하세요  → "무료:" 가 볼드로 정상 렌더링
```

### 사용법

```bash
# 기본: src/content 전체 스캔 및 수정
bun .vibe-coding/TOOLS/06-fix-bold-issues.ts
```

#### 특정 폴더만 검사

```bash
# 특정 디렉토리 지정 (첫 번째 인자)
bun .vibe-coding/TOOLS/06-fix-bold-issues.ts src/content/blog
bun .vibe-coding/TOOLS/06-fix-bold-issues.ts src/content/docs
bun .vibe-coding/TOOLS/06-fix-bold-issues.ts src/content/bug-bounty
```

#### 단일 파일 검사

```bash
# 단일 .md 또는 .mdx 파일 지정
bun .vibe-coding/TOOLS/06-fix-bold-issues.ts test-bold.md
bun .vibe-coding/TOOLS/06-fix-bold-issues.ts src/content/blog/my-post.mdx
```

#### 미리보기 (Dry Run)

실제 파일을 수정하지 않고 변경 대상만 확인합니다:

```bash
bun .vibe-coding/TOOLS/06-fix-bold-issues.ts --dry-run
bun .vibe-coding/TOOLS/06-fix-bold-issues.ts src/content/blog --dry-run
```

### 동작 방식

1. 대상 디렉토리에서 `.md`, `.mdx` 파일을 재귀 탐색
2. 펜스 코드블록(` ``` `, `~~~`)과 인라인 코드(`` ` ``)는 건너뜀
3. 닫히지 않은 백틱이 있는 라인은 안전을 위해 스킵 (리포트에 표시)
4. 구두점(`:`, `.`, `;`, `!`, `?`, `)`)으로 끝나는 볼드 뒤에 CJK 문자가 오면 Zero-Width Space 삽입
5. 멱등성 보장: 여러 번 실행해도 결과가 누적되지 않음

### 추가 옵션

```bash
# 스킵된 줄번호 상세 표시
bun .vibe-coding/TOOLS/06-fix-bold-issues.ts --verbose

# 회귀 방지 테스트 실행
bun .vibe-coding/TOOLS/06-fix-bold-issues.ts --self-test
```

### 지원 문자

한글, 한자, 히라가나, 가타카나 앞에서만 ZWS를 삽입합니다.

---

## lint-patterns

타입스크립트, Svelte 코드에서 안티패턴을 감지합니다. `elegant-typescript-patterns.md` 문서 기반.

### lint-patterns 실행 방법

```bash
# 기본: src 디렉토리 전체 스캔
bun .vibe-coding/TOOLS/02-lint-patterns.ts

# 특정 디렉토리
bun .vibe-coding/TOOLS/02-lint-patterns.ts src/lib

# 단일 파일
bun .vibe-coding/TOOLS/02-lint-patterns.ts src/lib/utils.ts

# 오류만 표시 (경고, 정보 제외)
bun .vibe-coding/TOOLS/02-lint-patterns.ts --errors-only
```

### lint-patterns 감지 규칙

#### TypeScript (script scope)

| ID | 심각도 | 설명 |
|----|--------|------|
| `no-ts-ignore` | ❌ 오류 | `@ts-ignore`, `@ts-nocheck` 주석 |
| `no-non-null-assertion` | 💡 정보 | `obj!.prop`, `arr![0]`, `fn!()` 형태 |
| `prefer-isdef-filter` | 💡 정보 | `filter` 내 `!= null` → `isDef` 권장 |
| `no-console-outside-dev` | ⚠️ 경고 | DEV 가드 없는 `console.*` 호출 |
| `prefer-set-over-includes` | 💡 정보 | 상수 배열 `.includes()` 대신 `Set.has()` 권장 |

#### Svelte 5 / SvelteKit 2

| ID | 심각도 | scope | 설명 |
|----|--------|-------|------|
| `no-app-stores` | ⚠️ 경고 | script | `$app/stores` → `$app/state` 마이그레이션 |
| `no-legacy-store` | 💡 정보 | script | `svelte/store` → runes 권장 |
| `no-on-directive` | 💡 정보 | **markup** | `on:click` → `onclick` 권장 |
| `no-reactive-statement` | 💡 정보 | script | `$:` → `$derived`, `$effect` 권장 |

#### SvelteKit 보안

| ID | 심각도 | 설명 |
|----|--------|------|
| `no-private-env-client` | ❌ 오류 | 클라이언트에서 `$env/*/private` import |
| `no-browser-globals-server` | ❌ 오류 | 서버 파일에서 `window`, `document` 등 사용 |

---

## security-patterns

SvelteKit 2, Svelte 5, TypeScript, UnoCSS, Bun, HTML, CSS 스택에서 보안 취약점 패턴을 탐지합니다.

### 빠른 시작

```bash
# 기본: src 전체 스캔
bun .vibe-coding/TOOLS/01-security-patterns.ts

# 특정 경로 스캔
bun .vibe-coding/TOOLS/01-security-patterns.ts src/routes

# 오류만 표시
bun .vibe-coding/TOOLS/01-security-patterns.ts --errors-only

# 리포트 파일 생성 끄기
bun .vibe-coding/TOOLS/01-security-patterns.ts --no-report
```

### 탐지 카테고리

#### XSS (Cross-Site Scripting)

| ID | 심각도 | 설명 |
|----|--------|------|
| `xss-innerhtml` | ❌ 오류 | `innerHTML`, `outerHTML` 사용 |
| `xss-document-write` | ❌ 오류 | `document.write` 사용 |
| `xss-target-blank` | ⚠️ 경고 | `target="_blank"` without `noopener` |
| `xss-svelte-html` | ⚠️ 경고 | `{@html}` 태그 사용 |

#### 코드 인젝션

| ID | 심각도 | 설명 |
|----|--------|------|
| `injection-eval` | ❌ 오류 | `eval()` 사용 |
| `injection-new-function` | ❌ 오류 | `new Function()` 사용 |
| `injection-setinterval-string` | ❌ 오류 | 타이머에 문자열 코드 전달 |

#### 프로토타입 오염

| ID | 심각도 | 설명 |
|----|--------|------|
| `prototype-pollution-proto` | ❌ 오류 | `__proto__` 동적 접근 |
| `prototype-pollution-constructor` | ⚠️ 경고 | `constructor` 동적 접근 |

#### SvelteKit

| ID | 심각도 | 설명 |
|----|--------|------|
| `sveltekit-private-env` | ❌ 오류 | 클라이언트에서 `$env/*/private` import |
| `sveltekit-browser-globals-server` | ❌ 오류 | 서버에서 브라우저 전역 객체 |
| `sveltekit-searchparams-iterate` | ⚠️ 경고 | `searchParams` 키 전체 순회 (CVE-2025-29920) |
| `sveltekit-open-redirect` | ❌ 오류 | Open Redirect 취약점 (사용자 입력 리다이렉트) |
| `sveltekit-cors-wildcard-credentials` | ⚠️ 경고 | CORS `*` + credentials 조합 |

#### 입력 검증

| ID | 심각도 | 설명 |
|----|--------|------|
| `input-request-json` | 💡 정보 | `request.json()` 사용 (스키마 검증 필요) |
| `input-request-formdata` | 💡 정보 | `request.formData()` 사용 (길이 제한 필요) |
| `input-request-text-arraybuffer` | ⚠️ 경고 | `request.text/arrayBuffer` (대용량 공격 위험) |

#### 기타

| ID | 심각도 | 설명 |
|----|--------|------|
| `session-localstorage-token` | ⚠️ 경고 | localStorage에 토큰 저장 |
| `ssrf-fetch-user-url` | ⚠️ 경고 | 사용자 URL로 fetch 호출 |
| `unocss-runtime-mode` | ⚠️ 경고 | UnoCSS 런타임 모드 사용 |
| `crypto-hardcoded-secret` | ❌ 오류 | 하드코딩된 비밀 의심 |

#### CSS 보안

| ID | 심각도 | 설명 |
|----|--------|------|
| `css-import-external` | 💡 정보 | 외부 CSS `@import` (공급망 위험) |

#### TypeScript 타입 안전성

| ID | 심각도 | 설명 |
|----|--------|------|
| `ts-any-cast` | ⚠️ 경고 | `as any` 캐스팅 사용 |

---

## api-catalog

`.vibe-coding/PUBLIC_APIS/README.md`의 Public API 카탈로그를 브라우저에서 필터링/정렬할 수 있는 인터랙티브 뷰어입니다.

### api-catalog 실행 방법

```bash
# 1. README.md → SQLite 동기화
bun .vibe-coding/TOOLS/api-catalog/sync.ts

# 2. 로컬 서버 시작 (http://127.0.0.1:3333)
bun .vibe-coding/TOOLS/api-catalog/server.ts

# 포트/호스트 변경 (PowerShell/Git Bash 공통)
bun .vibe-coding/TOOLS/api-catalog/server.ts --port 3334 --host 127.0.0.1
```

### api-catalog 주요 기능

- **필터링**: 카테고리, 인증 방식, CORS, 통합 방식
- **검색**: API명, 용도, 태그 키워드 검색
- **정렬**: 추천도, 이름, 카테고리 기준 정렬
- **UI**: 다크/라이트 테마, 반응형 디자인

### api-catalog API 엔드포인트

| 엔드포인트 | 설명 |
|------------|------|
| `GET /api/apis` | API 목록 (쿼리 파라미터로 필터/정렬) |
| `GET /api/categories` | 카테고리 목록 |
| `GET /api/stats` | 통계 (총 개수, 카테고리별 개수) |
| `GET /api/options` | 필터 드롭다운 옵션 |

### api-catalog 쿼리 파라미터

```bash
# 필터 예시
curl "http://localhost:3333/api/apis?category=보안·리스크"
curl "http://localhost:3333/api/apis?auth=No&cors=Yes"
curl "http://localhost:3333/api/apis?q=날씨"

# 정렬 예시
curl "http://localhost:3333/api/apis?sort=rating&order=desc"
curl "http://localhost:3333/api/apis?sort=name&order=asc"
```

### api-catalog 파일 구조

| 파일 | 역할 |
|------|------|
| `db.ts` | SQLite 스키마 및 초기화 |
| `sync.ts` | README.md → SQLite 동기화 |
| `server.ts` | Bun.serve 기반 API 서버 |
| `viewer.html` | 프론트엔드 뷰어 |
| `api-catalog.sqlite` | 데이터베이스 파일 (gitignore) |

---

## webnovel-viewer

`.vibe-coding/WEBNOVEL/` 폴더의 캐릭터, 사물, 현상 등 등장요소를 브라우저에서 조회하는 인터랙티브 뷰어입니다.

### webnovel-viewer 실행 방법

```bash
# 1. 마크다운 → SQLite 동기화
bun .vibe-coding/TOOLS/webnovel-viewer/sync.ts

# 2. 로컬 서버 시작 (http://localhost:3334)
bun .vibe-coding/TOOLS/webnovel-viewer/server.ts

# 포트/호스트 변경 (PowerShell/Git Bash 공통)
bun .vibe-coding/TOOLS/webnovel-viewer/server.ts --port 3335 --host 127.0.0.1
```

> **주의**: `sync.ts`는 엄격 모드로 동작합니다. `characters/`, `objects/`, `phenomena/` 폴더 중 하나라도 없으면 에러로 중단됩니다.

### webnovel-viewer 환경변수

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `WEBNOVEL_VIEWER_PORT` | `3334` | 서버 포트 |
| `WEBNOVEL_VIEWER_HOST` | `127.0.0.1` | 바인딩 주소 (보안상 localhost 고정) |

### webnovel-viewer 주요 기능

- **필터링**: 유형(캐릭터/사물/현상), 역할, 태그, 등장화
- **검색**: 이름, 태그, 원본 내용 키워드 검색
- **정렬**: 등장순, 이름순, 유형순
- **상세 보기**: 기본 정보 + 원본 마크다운 (복사 버튼 포함)
- **UI**: 다크/라이트 테마, 반응형 디자인

### webnovel-viewer API 엔드포인트

| 엔드포인트 | 설명 |
|------------|------|
| `GET /api/elements` | 요소 목록 (필터/정렬/페이지네이션 지원) |
| `GET /api/elements/:slug` | 요소 상세 |
| `GET /api/episodes` | 에피소드 목록 |
| `GET /api/stats` | 통계 (총 개수, 유형별 개수) |
| `GET /api/options` | 필터 드롭다운 옵션 |

### webnovel-viewer 쿼리 파라미터

`/api/elements` 엔드포인트는 다음 파라미터를 지원합니다:

| 파라미터 | 설명 | 예시 |
|------------|------|------|
| `type` | 유형 필터 | `?type=character` |
| `role` | 역할 필터 | `?role=주연` |
| `first_appear` | 등장화 필터 | `?first_appear=1` |
| `tag` | 태그 필터 (정확 매칭) | `?tag=태그1` |
| `q` | 키워드 검색 (200자 제한) | `?q=검색어` |
| `sort` | 정렬 기준 | `?sort=display_name` |
| `order` | 정렬 방향 | `?order=desc` |
| `limit` | 최대 개수 (기본 1000, 상한 2000) | `?limit=50` |
| `offset` | 오프셋 | `?offset=100` |

### webnovel-viewer 파일 구조

| 파일 | 역할 |
|------|------|
| `db.ts` | SQLite 스키마 및 초기화 |
| `sync.ts` | 마크다운 → SQLite 동기화 |
| `server.ts` | Bun.serve 기반 API 서버 |
| `viewer.html` | 프론트엔드 뷰어 |
| `webnovel.sqlite` | 데이터베이스 파일 (gitignore) |

---

## route-audit

SvelteKit의 `src/routes` 라우트 정의와 프로젝트 내 내부 링크(`/...`)를 비교하여 깨진 링크/라우트 충돌을 탐지합니다.

### route-audit 실행 방법

```bash
# 기본: 라우트 + 내부 링크 점검 (src/, e2e/)
bun .vibe-coding/TOOLS/03-route-audit.ts

# 라우트 수집/충돌만
bun .vibe-coding/TOOLS/03-route-audit.ts --routes-only

# 내부 링크 스캔만
bun .vibe-coding/TOOLS/03-route-audit.ts --links-only

# 링크 스캔 대상 디렉토리 추가 (예: 콘텐츠 폴더까지 포함)
bun .vibe-coding/TOOLS/03-route-audit.ts --scan src/content

# base path가 있는 앱 (예: /myapp 하위에 배포)
bun .vibe-coding/TOOLS/03-route-audit.ts --base /myapp

# 특정 prefix 무시 (예: 백엔드 프록시/외부 라우팅)
bun .vibe-coding/TOOLS/03-route-audit.ts --ignore-prefix /api --ignore-prefix /products

# JSON 출력
bun .vibe-coding/TOOLS/03-route-audit.ts --json

# 디버그 로그 포함 (파일 접근 실패 등)
bun .vibe-coding/TOOLS/03-route-audit.ts --verbose
```

### ignore 파일

`.vibe-coding/TOOLS/route-audit.ignore`에 라인 단위로 prefix를 추가하면 내부 링크 검사에서 제외됩니다.

### 상대 링크 지원

`./foo`, `../bar` 형태의 상대 링크는 `src/routes/**` 내부 파일에서만 제한적으로 해석하여 검사합니다.
