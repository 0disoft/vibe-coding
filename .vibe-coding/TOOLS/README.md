# TOOLS

프로젝트에서 반복적으로 필요한 작업을 자동화하는 스크립트 모음입니다.

## 도구 목록

| 도구 | 용도 | 빠른 실행 |
|------|------|-----------|
| [api-catalog](#api-catalog) | Public API 카탈로그 뷰어 | `bun .vibe-coding/TOOLS/api-catalog/server.ts` |
| [a11y-ux-patterns.ts](#a11y-ux-patternsts) | 접근성 및 UX 패턴 검사 | `bun .vibe-coding/TOOLS/a11y-ux-patterns.ts` |
| [fix-bold-issues.ts](#fix-bold-issuests) | 마크다운 볼드 파싱 오류 수정 | `bun .vibe-coding/TOOLS/fix-bold-issues.ts` |
| [lint-patterns.ts](#lint-patternsts) | 타입스크립트 안티패턴 감지 | `bun .vibe-coding/TOOLS/lint-patterns.ts` |
| [security-patterns.ts](#security-patternsts) | 보안 취약점 패턴 탐지 | `bun .vibe-coding/TOOLS/security-patterns.ts` |

---

## a11y-ux-patterns.ts

Svelte/HTML/CSS 파일에서 접근성 및 UX 패턴을 검사합니다.

### a11y-ux-patterns 실행 방법

```bash
# 기본: src 전체 스캔
bun .vibe-coding/TOOLS/a11y-ux-patterns.ts

# 특정 디렉토리
bun .vibe-coding/TOOLS/a11y-ux-patterns.ts src/lib/components

# 오류만 표시
bun .vibe-coding/TOOLS/a11y-ux-patterns.ts --errors-only

# 회귀 방지 테스트 실행
bun .vibe-coding/TOOLS/a11y-ux-patterns.ts --self-test
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

## fix-bold-issues.ts

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
bun .vibe-coding/TOOLS/fix-bold-issues.ts
```

#### 특정 폴더만 검사

```bash
# 특정 디렉토리 지정 (첫 번째 인자)
bun .vibe-coding/TOOLS/fix-bold-issues.ts src/content/blog
bun .vibe-coding/TOOLS/fix-bold-issues.ts src/content/docs
bun .vibe-coding/TOOLS/fix-bold-issues.ts src/content/bug-bounty
```

#### 단일 파일 검사

```bash
# 단일 .md 또는 .mdx 파일 지정
bun .vibe-coding/TOOLS/fix-bold-issues.ts test-bold.md
bun .vibe-coding/TOOLS/fix-bold-issues.ts src/content/blog/my-post.mdx
```

#### 미리보기 (Dry Run)

실제 파일을 수정하지 않고 변경 대상만 확인합니다:

```bash
bun .vibe-coding/TOOLS/fix-bold-issues.ts --dry-run
bun .vibe-coding/TOOLS/fix-bold-issues.ts src/content/blog --dry-run
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
bun .vibe-coding/TOOLS/fix-bold-issues.ts --verbose

# 회귀 방지 테스트 실행
bun .vibe-coding/TOOLS/fix-bold-issues.ts --self-test
```

### 지원 문자

한글, 한자, 히라가나, 가타카나 앞에서만 ZWS를 삽입합니다.

---

## lint-patterns.ts

타입스크립트, Svelte 코드에서 안티패턴을 감지합니다. `elegant-typescript-patterns.md` 문서 기반.

### lint-patterns 실행 방법

```bash
# 기본: src 디렉토리 전체 스캔
bun .vibe-coding/TOOLS/lint-patterns.ts

# 특정 디렉토리
bun .vibe-coding/TOOLS/lint-patterns.ts src/lib

# 단일 파일
bun .vibe-coding/TOOLS/lint-patterns.ts src/lib/utils.ts

# 오류만 표시 (경고, 정보 제외)
bun .vibe-coding/TOOLS/lint-patterns.ts --errors-only
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

## security-patterns.ts

SvelteKit 2, Svelte 5, TypeScript, UnoCSS, Bun, HTML, CSS 스택에서 보안 취약점 패턴을 탐지합니다.

### 빠른 시작

```bash
# 기본: src 전체 스캔
bun .vibe-coding/TOOLS/security-patterns.ts

# 특정 경로 스캔
bun .vibe-coding/TOOLS/security-patterns.ts src/routes

# 오류만 표시
bun .vibe-coding/TOOLS/security-patterns.ts --errors-only

# 리포트 파일 생성 끄기
bun .vibe-coding/TOOLS/security-patterns.ts --no-report
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

# 2. 로컬 서버 시작 (http://localhost:3333)
bun .vibe-coding/TOOLS/api-catalog/server.ts
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
