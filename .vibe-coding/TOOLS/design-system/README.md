# Design System Operations

디자인 시스템 토큰(DTCG) 관리 및 동기화 가이드입니다.

## 어디에 무엇이 있나

- 토큰(전역, generated): `src/styles/design-system.tokens.css`
- 토큰 SSOT(DTCG-ish): `.vibe-coding/TOOLS/design-system/tokens.dtcg.json`
- 토큰 동기화 도구: `.vibe-coding/TOOLS/design-system/dtcg-sync.ts`
- 디자인 시스템 컴포넌트: `src/lib/components/design-system/*`
- 공통 패턴 스타일: `src/styles/design-system.css`
- 토큰 매니페스트 생성기: `.vibe-coding/TOOLS/design-system/tokens-manifest.ts`
- 생성 산출물: `.vibe-coding/TOOLS/design-system/TOKENS.md`, `.vibe-coding/TOOLS/design-system/tokens.manifest.json`
- 컴포넌트 스펙: `.vibe-coding/TOOLS/design-system/SPECS.md`

## 토큰 계층 / 규칙(요약)

`design-system-guide.md`의 핵심 규칙을 최소만 요약합니다.

- 원시(Primitive): `--raw-*` 등, 리터럴에 가까운 값 (팔레트/기본 값)
- 시맨틱(Semantic): `--color-*`, `--font-size-*` 등, 역할 기반 값 (테마 전환은 여기서 처리)
- 컴포넌트(Component): `--button-*`, `--input-*` 등, 내부 미세 조정용 (필요할 때만)

규칙:

- 컴포넌트는 원시 토큰을 직접 참조하지 않고, 시맨틱/컴포넌트 토큰만 사용합니다.
- 오버라이드 우선순위는 “테마(시맨틱 값) → 컴포넌트 토큰 → 인스턴스(style)” 순으로 제한합니다.
- 원시 토큰 값 변경은 영향이 크므로, 합의/RFC 성격의 작업으로 취급합니다.

## DTCG(SSOT) → CSS 토큰 동기화

`tokens.dtcg.json`을 **단일 진실원천(SSOT)** 으로 두고, `src/styles/design-system.tokens.css`를 생성/검증합니다.

### 실행 (생성/갱신)

```bash
# 생성/갱신 (기본: root 프리셋)
bun .vibe-coding/TOOLS/design-system/dtcg-sync.ts

# 검증(불일치 시 exit 1)
bun .vibe-coding/TOOLS/design-system/dtcg-sync.ts --verify
```

## 토큰 매니페스트 생성

CSS 토큰을 추출해 사람이 읽기 좋은 `TOKENS.md`와 기계가 읽기 좋은 `tokens.manifest.json`을 생성합니다.

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
   ```

2. 토큰 매니페스트 재생성(문서/리뷰용)

   ```bash
   bun .vibe-coding/TOOLS/design-system/tokens-manifest.ts --stable
   ```

3. 검증(권장)

   ```bash
   bun .vibe-coding/TOOLS/design-system/dtcg-sync.ts --verify
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
   bun .vibe-coding/TOOLS/design-system/tokens-manifest.ts --stable
   ```

2. 검증(권장)

   ```bash
   bun .vibe-coding/TOOLS/design-system/dtcg-sync.ts --verify
   bun .vibe-coding/TOOLS/design-system/tokens-manifest.ts --stable --verify
   ```

### 3) 컴포넌트/패턴 변경 시

대상 변경:

- `src/lib/components/design-system/*`
- `.vibe-coding/TOOLS/design-system/SPECS.md`

해야 할 일:

1. 스펙(`SPECS.md`)이 변경을 따라가는지 확인
