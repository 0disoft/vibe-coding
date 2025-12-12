# TOOLS

프로젝트에서 반복적으로 필요한 작업을 자동화하는 스크립트 모음입니다.

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
