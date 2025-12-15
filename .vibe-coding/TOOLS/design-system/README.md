# Design System Lab

프로젝트 전체 UI를 바꾸지 않고, 토큰/유틸리티/상태 UI를 **실제 앱 환경**에서 검증하기 위한 lab 가이드입니다.

## 어디에 무엇이 있나

- 토큰(스코프, generated): `src/styles/design-system-lab.tokens.css`
- 토큰(전역, generated): `src/styles/design-system.tokens.css`
- 토큰 SSOT(DTCG-ish): `.vibe-coding/TOOLS/design-system/tokens.dtcg.json`
- 토큰 동기화 도구: `.vibe-coding/TOOLS/design-system/dtcg-sync.ts`
- 검증 페이지: `src/routes/lab/design-system/+page.svelte`
- DEV 전용 가드: `src/routes/lab/+layout.server.ts`
- 디자인 시스템 컴포넌트(프로덕션 기준): `src/lib/components/design-system/*`
- lab 컴포넌트 엔트리(re-export 전용): `src/lib/components/lab/design-system/index.ts`
- 공통 패턴 스타일(프로덕션 기준): `src/styles/design-system.css`
- lab 전용 데모/레이아웃 스타일: `src/styles/design-system-lab.css`
- 토큰 매니페스트 생성기: `.vibe-coding/TOOLS/design-system/tokens-manifest.ts`
- 생성 산출물: `.vibe-coding/TOOLS/design-system/TOKENS.md`, `.vibe-coding/TOOLS/design-system/tokens.manifest.json`
- 컴포넌트 스펙: `.vibe-coding/TOOLS/design-system/SPECS.md`

## 실행 방법

1. 개발 서버 실행

   ```bash
    bun dev
   ```

2. 브라우저에서 확인

   ```bash
    /lab/design-system
   ```

> 이 라우트는 기본적으로 DEV 환경에서만 열립니다.
> 예외적으로 `LAB_ENABLED=1`이면 DEV가 아니어도 열리도록 허용합니다. (`src/routes/lab/+layout.server.ts` 기준)

## 시각 회귀 테스트(선택)

`/lab/design-system`을 스냅샷으로 고정해, 토큰/포커스/모션 변경이 깨졌는지 PR에서 빠르게 확인할 수 있습니다.

> 기본 `bun run test:e2e`에서는 실행되지 않으며, `VISUAL=1`일 때만 활성화됩니다.

### 시각 테스트 실행

```bash
# 1) 최초 1회: 스냅샷 생성/갱신
VISUAL=1 bun run test:e2e -- e2e/design-system-lab.visual.spec.ts --project=Desktop --update-snapshots

# 2) 이후: 비교(회귀 감지)
VISUAL=1 bun run test:e2e -- e2e/design-system-lab.visual.spec.ts --project=Desktop
```

## A11y 스모크 테스트(선택)

폼 패턴(`DsField`)처럼 “접근성 연결(라벨/설명/에러)”이 핵심인 부분만 최소한으로 자동 검증합니다.

> 기본 `bun run test:e2e`에서는 실행되지 않으며, `A11Y=1`일 때만 활성화됩니다.

### A11y 테스트 실행

```bash
A11Y=1 bun run test:e2e -- e2e/design-system-lab.a11y.spec.ts --project=Desktop
```

## 운영 원칙

- lab 토큰은 **`.ds-lab` 컨테이너 내부에서만** 적용합니다.
- 값(OKLCH)은 실험용입니다. 합의/검증이 끝난 뒤에만 전역 토큰(`src/styles/design-system.tokens.css`) 또는 기존 토큰 레이어로 승격합니다.
- 시맨틱 컬러 유틸(예: `bg-primary`)은 `uno.config.ts`의 매핑을 통해 **canonical(`--color-*`)** 을 참조합니다. (클래스 이름은 유지, 내부 참조 변수만 통일)
- lab 컴포넌트는 “실험용 구현”이 아니라 “검증 UI에서 쓰기 위한 엔트리”입니다. 구현은 `src/lib/components/design-system/`를 단일 소스로 둡니다.

## 토큰 계층 / 규칙(요약)

`design-system-guide.md`의 핵심 규칙을 최소만 요약합니다.

- 원시(Primitive): `--raw-*` 등, 리터럴에 가까운 값 (팔레트/기본 값)
- 시맨틱(Semantic): `--color-*`, `--font-size-*` 등, 역할 기반 값 (테마 전환은 여기서 처리)
- 컴포넌트(Component): `--button-*`, `--input-*` 등, 내부 미세 조정용 (필요할 때만)

규칙:

- 컴포넌트는 원시 토큰을 직접 참조하지 않고, 시맨틱/컴포넌트 토큰만 사용합니다.
- 오버라이드 우선순위는 “테마(시맨틱 값) → 컴포넌트 토큰 → 인스턴스(style)” 순으로 제한합니다.
- 원시 토큰 값 변경은 영향이 크므로, 합의/RFC 성격의 작업으로 취급합니다.

## 체크리스트 (최소)

- 색상 대비: `text-foreground` / `bg-background`, `text-muted-foreground` 등 기본 대비가 무너지지 않는가
- 포커스 링: 키보드 탭 이동 시 `ring`이 항상 보이는가
- 버튼 상태: hover/active/disabled에서 의미와 대비가 유지되는가
- 입력 상태: 정상/포커스/에러(`aria-invalid`)에서 경계/메시지가 일관적인가
- 링크: 기본/hover에서 링크임이 분명한가(밑줄/색상)

## 승격(프로모션) 절차

1. lab 토큰을 `src/styles/tokens.css`(또는 별도 토큰 레이어)로 이동
2. 필요한 경우 `uno.config.ts` 시맨틱 토큰 유틸리티 목록 동기화
3. 기존 화면 중 1~2곳에만 점진 적용 후 회귀 확인
4. 컴포넌트 승격 시 `src/lib/components/design-system/`에 구현을 두고, lab 엔트리는 re-export만 남깁니다.

## 토큰 매니페스트 생성

CSS 토큰을 추출해 사람이 읽기 좋은 `TOKENS.md`와 기계가 읽기 좋은 `tokens.manifest.json`을 생성합니다.

## DTCG(SSOT) → CSS 토큰 동기화

`tokens.dtcg.json`을 **단일 진실원천(SSOT)** 으로 두고, `src/styles/design-system-lab.tokens.css`를 생성/검증합니다.

### 실행

```bash
# 생성/갱신
bun .vibe-coding/TOOLS/design-system/dtcg-sync.ts

# 검증(불일치 시 exit 1)
bun .vibe-coding/TOOLS/design-system/dtcg-sync.ts --verify
```

### 전역(:root) 토큰 생성

실제 템플릿 UI에 토큰을 “전체 적용”할 때는 `:root` 프리셋을 사용합니다.

```bash
# 생성/갱신
bun .vibe-coding/TOOLS/design-system/dtcg-sync.ts --preset root

# 검증
bun .vibe-coding/TOOLS/design-system/dtcg-sync.ts --preset root --verify
```

### 실행

```bash
bun .vibe-coding/TOOLS/design-system/tokens-manifest.ts
```

### CI/리뷰용(권장)

출력물이 Git diff에 잘 걸리도록 생성 시간을 고정하고, 현재 저장된 산출물이 최신인지 검증할 수 있습니다.

```bash
# 생성(안정 출력)
bun .vibe-coding/TOOLS/design-system/tokens-manifest.ts --stable

# 검증(불일치/진단 이슈 시 exit 1)
bun .vibe-coding/TOOLS/design-system/tokens-manifest.ts --stable --verify
```

### 출력만 보고 싶을 때

```bash
bun .vibe-coding/TOOLS/design-system/tokens-manifest.ts --print
```

## 동기화 규칙 (언제/무엇/명령)

디자인 시스템은 “코드가 자동으로 만드는 산출물”이 많아서, 변경을 하면 함께 갱신해야 하는 파일들이 있습니다.
아래 규칙을 기준으로 동기화를 유지합니다.

### 1) 토큰(SSOT) 변경 시

대상 변경:

- `.vibe-coding/TOOLS/design-system/tokens.dtcg.json`

해야 할 일:

1. 토큰 CSS 재생성

   ```bash
   bun .vibe-coding/TOOLS/design-system/dtcg-sync.ts
   bun .vibe-coding/TOOLS/design-system/dtcg-sync.ts --preset root
   ```

2. 토큰 매니페스트 재생성(문서/리뷰용)

   ```bash
   bun .vibe-coding/TOOLS/design-system/tokens-manifest.ts --stable
   ```

3. 검증(권장)

   ```bash
   bun .vibe-coding/TOOLS/design-system/dtcg-sync.ts --verify
   bun .vibe-coding/TOOLS/design-system/dtcg-sync.ts --preset root --verify
   bun .vibe-coding/TOOLS/design-system/tokens-manifest.ts --stable --verify
   ```

### 2) 토큰 생성기/동기화 로직 변경 시

대상 변경:

- `.vibe-coding/TOOLS/design-system/dtcg-sync.ts`
- `.vibe-coding/TOOLS/design-system/tokens-manifest.ts`

해야 할 일:

1. 관련 산출물 재생성(출력 형식이 바뀔 수 있음)

   ```bash
   bun .vibe-coding/TOOLS/design-system/dtcg-sync.ts
   bun .vibe-coding/TOOLS/design-system/dtcg-sync.ts --preset root
   bun .vibe-coding/TOOLS/design-system/tokens-manifest.ts --stable
   ```

2. 검증(권장)

   ```bash
   bun .vibe-coding/TOOLS/design-system/dtcg-sync.ts --verify
   bun .vibe-coding/TOOLS/design-system/dtcg-sync.ts --preset root --verify
   bun .vibe-coding/TOOLS/design-system/tokens-manifest.ts --stable --verify
   ```

### 3) lab UI/패턴 변경 시

대상 변경:

- `src/lib/components/lab/design-system/*`
- `src/styles/design-system-lab.css`
- `src/routes/lab/design-system/+page.svelte`
- `.vibe-coding/TOOLS/design-system/SPECS.md`

해야 할 일:

1. 스펙(`SPECS.md`)이 변경을 따라가는지 확인
2. 시각 회귀/접근성 테스트는 필요 시 opt-in으로 실행

   ```bash
   VISUAL=1 bun run test:e2e -- e2e/design-system-lab.visual.spec.ts --project=Desktop
   A11Y=1 bun run test:e2e -- e2e/design-system-lab.a11y.spec.ts --project=Desktop
   ```

### 4) 템플릿(전역 UI)까지 토큰을 “전체 적용”할 때

대상 변경:

- `src/styles/design-system.tokens.css` (generated)
- `src/app.css` import 순서

해야 할 일:

1. 전역 토큰 생성/검증을 항상 포함

   ```bash
   bun .vibe-coding/TOOLS/design-system/dtcg-sync.ts --preset root
   bun .vibe-coding/TOOLS/design-system/dtcg-sync.ts --preset root --verify
   ```
