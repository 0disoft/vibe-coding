# TOOLS

프로젝트에서 반복적으로 필요한 작업을 자동화하는 스크립트 모음입니다.

## 도구 목록

| 도구 | 용도 | 빠른 실행 |
|------|------|-----------|
| [fix-bold-issues.ts](#fix-bold-issuests) | 마크다운 볼드 파싱 오류 수정 | `bun .vibe-coding/TOOLS/fix-bold-issues.ts` |
| [lint-patterns.ts](#lint-patternsts) | 타입스크립트 안티패턴 감지 | `bun .vibe-coding/TOOLS/lint-patterns.ts` |

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
3. 구두점(`:`, `.`, `;`, `!`, `?`, `)`)으로 끝나는 볼드 뒤에 CJK 문자가 오면 Zero-Width Space 삽입
4. 멱등성 보장: 여러 번 실행해도 결과가 누적되지 않음

### 지원 문자

한글, 한자, 히라가나, 가타카나 앞에서만 ZWS를 삽입합니다.

---

## lint-patterns.ts

타입스크립트 코드에서 안티패턴을 감지합니다. `elegant-typescript-patterns.md` 문서 기반.

### 실행 방법

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

### 감지 규칙

#### TypeScript (script scope)

| ID | 심각도 | 설명 |
|----|--------|------|
| `no-explicit-any` | ❌ 오류 | `: any` 또는 `as any` 사용 |
| `no-ts-ignore` | ❌ 오류 | `@ts-ignore`, `@ts-nocheck` 주석 |
| `no-non-null-assertion` | 💡 정보 | `obj!.prop`, `arr![0]`, `fn!()` 형태 |
| `prefer-isdef-filter` | 💡 정보 | `filter` 내 `!= null` → `isDef` 권장 |
| `no-console-outside-dev` | ⚠️ 경고 | DEV 가드 없는 `console.*` 호출 |
| `prefer-set-over-includes` | 💡 정보 | 상수 배열 `.includes()` 대신 `Set.has()` 권장 |

#### Svelte 5 / SvelteKit 2

| ID | 심각도 | scope | 설명 |
|----|--------|-------|------|
| `no-app-stores` | ⚠️ 경고 | script | `$app/stores` → `$app/state` 마이그레이션 |
| `no-html-tag` | ⚠️ 경고 | **markup** | `{@html}` 사용 (XSS 위험) |
| `no-legacy-store` | 💡 정보 | script | `svelte/store` → runes 권장 |
| `no-on-directive` | 💡 정보 | **markup** | `on:click` → `onclick` 권장 |
| `no-reactive-statement` | 💡 정보 | script | `$:` → `$derived`, `$effect` 권장 |

#### SvelteKit 보안

| ID | 심각도 | 설명 |
|----|--------|------|
| `no-private-env-client` | ❌ 오류 | 클라이언트에서 `$env/*/private` import |
| `no-browser-globals-server` | ❌ 오류 | 서버 파일에서 `window`, `document` 등 사용 |
