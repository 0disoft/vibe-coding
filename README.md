# Vibe Coding

SvelteKit 2 + Svelte 5 런타임에 UnoCSS(Wind4) 테마/폰트 토큰을 얹은 스타터입니다. 라이트/다크 테마와 전역 폰트 스케일(1~9단계)을 쿠키로 유지하고 SSR 시 data-* 속성으로 주입해 FOUC를 최소화합니다.

## 주요 특징

- UnoCSS 커스텀 룰: OKLCH 기반 시맨틱 색상(`bg-primary`, `text-link`, `outline-...`)과 타이포(`text-body`, `text-code`) 유틸 제공, safelist 기본 등록.
- 테마/폰트 프리퍼런스: 쿠키 + DOM data-* 동기화 스토어(`theme`, `fontSize`)와 슬라이더 UI(`FontSizeSlider.svelte`).
- 접근성/안정성: 쿠키 값 화이트리스트 검증, SSR 시 정규식 치환으로 data-* 주입 안전화.
- 프리셋: preset-wind4 + webfonts/typography, Paraglide i18n 포함.

## 빠른 시작

```bash
# 설치 (bun 권장, npm도 가능)
bun install  # 또는 npm install

# 개발 서버
bun run dev  # 또는 npm run dev

# 타입/린트/테스트
bun run check
bun run lint
bun run test:unit
```

### 템플릿으로 새 프로젝트 시작

```bash
bun x degit 0disoft/vibe-coding ./my-new-app
cd my-new-app
bun install
bun run dev
```

## 프리퍼런스 동작

- 테마(`light`/`dark`), 폰트 크기(1~9)는 쿠키(`theme`, `fontSize`)에 저장되고 SSR에서 `data-theme`, `data-font-size`로 주입됩니다.
- 스토어 위치: `src/lib/theme.svelte.ts`, `src/lib/font-size.svelte.ts` (공용 팩토리: `src/lib/stores/persisted-state.svelte.ts`).
- 슬라이더 UI: `src/lib/components/FontSizeSlider.svelte`.

## 색상·타이포 토큰

- 정의: `src/app.css`의 CSS 변수와 `uno.config.ts`의 `semanticColors`/`typographyRules`가 1:1 매핑됩니다.
- 새 토큰 추가 시 두 파일을 함께 수정하세요(주석 참고).
- 링크 전용 색상: `--link`, `--link-foreground`.

## 유용한 경로

- 훅: `src/hooks.server.ts`, `src/hooks.ts`, `src/hooks.client.ts`
- 테마/폰트 상수: `src/lib/prefs/constants.ts`
- 공용 스토어 팩토리: `src/lib/stores/persisted-state.svelte.ts`
- 문서 체크리스트/구조: `.vibe-coding/REVIEW.md`, `.vibe-coding/TREE.md`

## 테스트

- 유닛: `bun run test:unit`
- e2e(Playwright): `bun run test:e2e`
- 타입/린트: `bun run check`, `bun run lint`

## 배포 전 확인

- `.vibe-coding/REVIEW.md` 체크리스트 준수 (SPEC/API/TODO/TREE 업데이트 포함)
- UnoCSS safelist에 동적 클래스가 필요한지 검토
- 테마/폰트 쿠키가 올바르게 검증되는지 확인

---

문의나 개선 아이디어가 있으면 자유롭게 업데이트하세요.
