# TREE

프로젝트 핵심 파일과 컴포넌트를 폴더 구조별로 요약합니다.
새 파일을 추가할 때는 아래 기존에 작성된 규칙을 따라 TREE를 갱신하세요.

## 구조

```plaintext
/
├── vite.config.ts
├── uno.config.ts
├── bun.lock
├── project.inlang/
│   └── settings.json
└── src/
    ├── app.html
    ├── app.css
    ├── app.d.ts
    ├── hooks.ts
    ├── hooks.client.ts
    ├── hooks.server.ts
    └── lib/
        ├── index.ts
        ├── theme.svelte.ts
        ├── font-size.svelte.ts
        ├── stores/
        │   └── persisted-state.svelte.ts
        ├── components/
        │   ├── FontSizeSlider.svelte
        │   └── ui/
        │       └── index.ts
        ├── prefs/
        │   └── constants.ts
        └── types/
            └── index.ts
```

## 파일 설명

### 루트 (/)

| 파일 | 역할 |
|------|------|
| `vite.config.ts` | Vite 번들링 설정과 플러그인 구성 |
| `uno.config.ts` | UnoCSS 테마 토큰, 프리셋, 디자인 시스템 설정 |
| `bun.lock` | Bun 패키지 버전 고정 잠금 파일 |

### project.inlang/

| 파일 | 역할 |
|------|------|
| `settings.json` | Inlang 다국어 설정, 로케일 목록, 메시지 경로 패턴 |

### src/

| 파일 | 역할 |
|------|------|
| `app.html` | 루트 HTML 템플릿. `data-theme`, `%paraglide.lang%` 속성 주입 |
| `app.css` | 전역 스타일, CSS 변수, 테마 색상, 폰트 정의 |
| `app.d.ts` | SvelteKit 전역 타입 확장 (Locals, PageData 등) |
| `hooks.ts` | locale 프리픽스 제거 reroute 훅 |
| `hooks.client.ts` | 클라이언트 전용 훅 (브라우저 API, 분석 등) |
| `hooks.server.ts` | 서버 훅 (테마 쿠키 주입, Paraglide 미들웨어) |

### src/lib/

| 파일 | 역할 |
|------|------|
| `index.ts` | $lib 배럴 export (런타임 코드용) |
| `theme.svelte.ts` | 라이트/다크 테마 상태 관리, FOUC 방지 |
| `font-size.svelte.ts` | 글자 크기 1~9단계 관리 |
| `stores/persisted-state.svelte.ts` | 쿠키+DOM 동기화 퍼시스턴스 스토어 팩토리 |
| `components/FontSizeSlider.svelte` | 폰트 크기 슬라이더 UI |
| `components/CodeBlock.svelte` | 코드 하이라이팅 + 복사 버튼 재사용 컴포넌트 |
| `components/ui/index.ts` | UI 컴포넌트 배럴 파일 |
| `prefs/constants.ts` | 쿠키 키 등 프리퍼런스 상수 |
| `types/index.ts` | 타입 배럴 export ($lib/types용) |
