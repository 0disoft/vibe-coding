# Vibe Coding

SvelteKit 2 + Svelte 5 기반 현대적 웹 스타터입니다.

## 주요 특징

- **스타일링**: UnoCSS (Wind4) + OKLCH 시맨틱 색상 (`bg-primary`, `text-link` 등)
- **테마/폰트**: 라이트/다크 테마 + 9단계 폰트 스케일, 쿠키 + SSR 동기화로 FOUC 방지
- **i18n**: Paraglide JS로 20개 언어 지원 (한국어 기본)
- **코드 하이라이팅**: Shiki v3 기반 VS Code급 구문 강조
- **PWA 지원**: 서비스 워커 기반 오프라인 지원 및 캐싱
- **인증**: better-auth 통합

## 빠른 시작

```bash
# 설치
bun install

# 개발 서버
bun dev

# 타입/린트/테스트
bun check && bun lint && bun test:unit
```

### 템플릿으로 새 프로젝트 시작

```bash
bun x degit 0disoft/vibe-coding ./my-new-app
cd my-new-app && bun install && bun dev
```

## 프로젝트 구조

```plaintext
src/
├── lib/
│   ├── components/
│   │   ├── Header.svelte           # 모바일 메뉴 포함
│   │   ├── Footer.svelte           # 약관/정책 링크
│   │   ├── CodeBlock.svelte        # Shiki 코드 하이라이팅
│   │   └── header-actions/         # 헤더 액션 컴포넌트
│   ├── stores/
│   │   ├── theme.svelte.ts         # 테마 상태 관리
│   │   ├── font-size.svelte.ts     # 폰트 크기 관리
│   │   └── persisted-state.svelte.ts # 쿠키 동기화 스토어
│   ├── constants/                  # 상수 (쿠키 키, 사이트 정보)
│   └── paraglide/                  # i18n 자동 생성 파일
├── styles/
│   ├── tokens.css                  # CSS 변수 (색상, 폰트)
│   ├── base.css                    # 기본 HTML 스타일
│   ├── scrollbar.css               # 스크롤바 스타일
│   ├── prose.css                   # 마크다운 타이포그래피
│   └── transitions.css             # 페이지 전환 효과
├── hooks.server.ts                 # SSR 테마/언어 쿠키 주입
└── service-worker.ts               # PWA 오프라인 지원
```

자세한 구조는 `.vibe-coding/TREE.md` 참조.

## 프리퍼런스

| 설정              | 저장소          | SSR 속성         |
| ----------------- | --------------- | ---------------- |
| 테마 (light/dark) | 쿠키 `theme`    | `data-theme`     |
| 폰트 크기 (1~9)   | 쿠키 `fontSize` | `data-font-size` |

## 테스트

```bash
bun test:unit     # Vitest 유닛 테스트
bun test:e2e      # Playwright E2E 테스트
bun check         # svelte-check 타입 검사
bun lint          # ESLint + Prettier
```

## 문서

- `.vibe-coding/TREE.md` - 프로젝트 구조 상세
- `.vibe-coding/SPEC.md` - 프로젝트 스펙
- `.vibe-coding/KNOWLEDGE/` - 기술 지식 베이스
- `.vibe-coding/TROUBLE/SOLVED.md` - 문제 해결 기록

---

MIT License | [0disoft](https://github.com/0disoft)
