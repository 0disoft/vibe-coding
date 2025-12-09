# Vibe Coding

SvelteKit 2 + Svelte 5 기반 현대적 웹 스타터입니다.

## 주요 특징

- **스타일링**: UnoCSS (Wind4) + OKLCH 시맨틱 색상 (`bg-primary`, `text-link` 등)
- **테마/폰트**: 라이트/다크 테마 + 9단계 폰트 스케일, 쿠키 + SSR 동기화로 FOUC 방지
- **i18n**: Paraglide JS로 20개 언어 지원 (한국어 기본)
- **코드 하이라이팅**: Shiki v3 기반 VS Code급 구문 강조
- **컴포넌트**: Header (모바일 햄버거 메뉴), Footer, CodeBlock

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

```
src/
├── lib/
│   ├── components/
│   │   ├── Header.svelte      # 모바일 메뉴 포함
│   │   ├── Footer.svelte      # 약관/정책 링크
│   │   └── CodeBlock.svelte   # Shiki 코드 하이라이팅
│   ├── theme.svelte.ts        # 테마 상태 관리
│   └── font-size.svelte.ts    # 폰트 크기 관리
├── styles/
│   ├── tokens.css            # CSS 변수 정의
│   └── base.css              # 기본 스타일
└── hooks.server.ts           # SSR 쿠키 주입
```

자세한 구조는 `.vibe-coding/TREE.md` 참조.

## 프리퍼런스

| 설정              | 저장소          | SSR 속성         |
| ----------------- | --------------- | ---------------- |
| 테마 (light/dark) | 쿠키 `theme`    | `data-theme`     |
| 폰트 크기 (1~9)   | 쿠키 `fontSize` | `data-font-size` |

## 테스트

```bash
bun test:unit     # 유닛 테스트
bun test:e2e      # Playwright e2e
bun check         # 타입 체크
bun lint          # ESLint
```

## 문서

- `.vibe-coding/TREE.md` - 프로젝트 구조
- `.vibe-coding/KNOWLEDGE/` - 기술 지식 베이스
- `.vibe-coding/TROUBLE/SOLVED.md` - 문제 해결 기록

---

MIT License | [0disoft](https://github.com/0disoft)
