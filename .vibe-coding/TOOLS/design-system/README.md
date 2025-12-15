# Design System Lab

프로젝트 전체 UI를 바꾸지 않고, 토큰/유틸리티/상태 UI를 **실제 앱 환경**에서 검증하기 위한 lab 가이드입니다.

## 어디에 무엇이 있나

- 토큰(스코프): `src/styles/design-system-lab.css`
- 검증 페이지: `src/routes/lab/design-system/+page.svelte`
- DEV 전용 가드: `src/routes/lab/+layout.server.ts`
- lab UI 컴포넌트: `src/lib/components/lab/design-system/*`
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

> 이 라우트는 DEV 환경에서만 열립니다. 프로덕션에서는 404가 나도록 막혀 있습니다.

## 시각 회귀 테스트(선택)

`/lab/design-system`을 스냅샷으로 고정해, 토큰/포커스/모션 변경이 깨졌는지 PR에서 빠르게 확인할 수 있습니다.

> 기본 `bun run test:e2e`에서는 실행되지 않으며, `VISUAL=1`일 때만 활성화됩니다.

### Git Bash 예시

```bash
# 1) 최초 1회: 스냅샷 생성/갱신
VISUAL=1 bun run test:e2e -- e2e/design-system-lab.visual.spec.ts --project=Desktop --update-snapshots

# 2) 이후: 비교(회귀 감지)
VISUAL=1 bun run test:e2e -- e2e/design-system-lab.visual.spec.ts --project=Desktop
```

## A11y 스모크 테스트(선택)

폼 패턴(`DsField`)처럼 “접근성 연결(라벨/설명/에러)”이 핵심인 부분만 최소한으로 자동 검증합니다.

> 기본 `bun run test:e2e`에서는 실행되지 않으며, `A11Y=1`일 때만 활성화됩니다.

### Git Bash 예시

```bash
A11Y=1 bun run test:e2e -- e2e/design-system-lab.a11y.spec.ts --project=Desktop
```

## 운영 원칙

- lab 토큰은 **`.ds-lab` 컨테이너 내부에서만** 적용합니다.
- 값(OKLCH)은 실험용입니다. 합의/검증이 끝난 뒤에만 `src/styles/tokens.css`로 승격합니다.
- 가이드 네이밍을 우선으로 **`--color-*`를 canonical**로 두고, 기존 프로젝트/UnoCSS 호환을 위해 **`--primary` 같은 변수는 alias**로 유지합니다.
- 시맨틱 컬러 유틸(예: `bg-primary`)이 기대하는 변수는 현재 `uno.config.ts` 기준 `--primary` 형태입니다. 전역 네이밍을 바꿀 때는 `uno.config.ts`와 함께 변경하거나, alias 레이어를 유지해야 합니다.

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
