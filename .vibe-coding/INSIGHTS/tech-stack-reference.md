# 기술 스택 레퍼런스

인디해커/1인 개발자를 위한 기술 스택 의사결정 가이드.
각 카테고리에서 "언제 무엇을 선택할지"에 초점을 맞춤.

> 실제 채택된 도구는 [stack.manifest.toml](../stack.manifest.toml)에 기록됨.

---

## 🎯 선택 원칙

1. **벤더 락인 최소화** - 언제든 갈아탈 수 있는 구조
2. **설정보다 관례** - 설정 파일 지옥 피하기
3. **무료 티어 우선** - 트래픽 터질 때까지 비용 0원 유지
4. **재사용 모듈화** - 한 번 만들면 100개 사이트에서 재활용

---

## 1. 런타임 & 빌드

### 핵심 선택

| 상황 | 선택 | 이유 |
|------|------|------|
| 기본값 | Bun | 패키지 매니저/테스트 러너 내장, 압도적 속도 |
| 호환성 문제 | Node.js | 모든 라이브러리 100% 동작 |
| 설정 없이 바로 실행 | Deno | 보안 중심, TS 네이티브 |
| AI/ML, 데이터 분석 | Python | 생태계 최강 (pandas, torch, langchain 등) |
| 고성능 백엔드 | Go / Rust | 동시성(Go) 또는 극한 성능(Rust) |

### 코드 품질

| 도구 | 역할 |
|------|------|
| TypeScript | 정적 타입으로 런타임 오류 방지 |
| Biome | ESLint+Prettier 대체. Rust 기반 초고속 |

### 모노레포

| 상황 | 선택 |
|------|------|
| 가장 단순 | Native Workspaces (pnpm/bun) |
| 캐싱 필요 | Turborepo |
| 대규모/복잡 | Nx |

### Git 훅

| 도구 | 역할 |
|------|------|
| Husky | 커밋/푸시 시 자동 스크립트 실행 |
| lint-staged | 스테이징된 파일만 린트/포맷 |

---

## 2. 프론트엔드 & 풀스택

### 프레임워크 선택

| 용도 | 추천 | 대안 |
|------|------|------|
| 1인 개발 생산성 | SvelteKit | SolidStart |
| 콘텐츠/SEO | Astro | Fresh (Deno) |
| 초기 로딩 최적화 | QwikCity | - |
| 브라우저 확장 | WXT | CRXJS |

> SvelteKit은 내장 API 라우트로 백엔드 겸용 가능. 별도 백엔드 불필요한 경우 많음.

### 스타일링

| 전략 | 선택 |
|------|------|
| 생태계 최대 | Tailwind CSS |
| 빠르고 가벼움 | UnoCSS |
| 커스텀 자유도 | shadcn-ui (복붙 방식) |
| 타입 안전 | Panda CSS |

### 애니메이션

| 수준 | 도구 |
|------|------|
| 자동 (한 줄) | AutoAnimate |
| 페이지 전환 | View Transitions API |
| 세밀한 제어 | Motion / Anime.js |

### UI 컴포넌트

| 용도 | 도구 |
|------|------|
| 코드 하이라이팅 | Shiki |
| 마크다운 파싱 | Marked |
| 리치 텍스트 에디터 | TipTap / Lexical |

### 디자인 리소스

| 용도 | 도구 | 특징 |
|------|------|------|
| 아이콘 | Lucide / Phosphor | SVG 기반, 가볍고 일관된 디자인 |
| 스톡 이미지 | Unsplash / Pexels | 저작권 무료 |
| 일러스트 | Undraw | 색상 커스텀 가능 SVG |
| 로고 제작 | LogoFast | AI 기반 빠른 로고 생성 |

### 차트/시각화

| 상황 | 선택 | 특징 |
|------|------|------|
| 기본 | Chart.js | 문서 풍부, 가장 무난 |
| 대용량 고성능 | uPlot | 10만 포인트도 부드럽게 |
| 인터랙티브 | ECharts | 다양한 차트 타입 |
| 지리 데이터 | Leaflet | 가볍고 커스텀 용이 |

### 폼 처리

| 전략 | 선택 | 특징 |
|------|------|------|
| Svelte 최적화 | Felte | 매우 가볍고 반응형 |
| 타입 안전성 | TanStack Form | 엄격한 타입 추론 |
| Progressive Enhancement | Conform | SSR 폼 처리 강점 |

### 이미지 최적화

| 전략 | 도구 | 특징 |
|------|------|------|
| 실시간 변환 | Unpic | CDN 종류 무관 자동 반응형 |
| 빌드 타임 | Sharp + vite-imagetools | 정적 사이트 최적화 |
| 동영상 | Mux / Cloudflare Stream | 스트리밍 부담 없애기 |

### OG 이미지 생성

| 도구 | 특징 |
|------|------|
| Satori | React 컴포넌트로 OG 이미지 생성 |
| Vercel OG | Edge에서 동적 생성, 무료 티어 |
| Cloudinary | URL 파라미터로 동적 변환 |

---

## 3. 백엔드 & API

### 백엔드 프레임워크

| 상황 | 선택 |
|------|------|
| SvelteKit 쓸 때 | SvelteKit 내장 API 라우트 |
| Bun 전용 최고 성능 | Elysia |
| 어디서든 (Edge/Node) | Hono |
| 고성능 마이크로서비스 | Axum (Rust) / Gin (Go) |

### 데이터 유효성 검사

| 전략 | 선택 |
|------|------|
| 고속 + JSON 스키마 | TypeBox |
| 생태계 호환성 | Zod |
| 번들 최적화 | Valibot |
| 최고 런타임 속도 | ArkType |

### 실시간 통신

| 상황 | 선택 | 특징 |
|------|------|------|
| 단방향 스트림 | Server-Sent Events (SSE) | 구현 간단, 재연결 자동 |
| 양방향 채팅 | Socket.IO | 폴백 지원, 방(Room) 개념 |
| 최소 의존성 | ws (WebSocket) | 가볍고 직접 제어 |

---

## 4. 데이터베이스

### 선택 전략

```text
┌─────────────────────────────────────────────────────┐
│  "Postgres vs SQLite" 가 핵심 분기점                │
│                                                     │
│  Postgres: 복잡한 쿼리, 대용량, 확장성              │
│  SQLite: 단순함, 엣지 배포, 파일 기반               │
└─────────────────────────────────────────────────────┘
```

### 관리형 DB (BaaS)

| 서비스 | 기반 | 특징 | 추천 상황 |
|--------|------|------|-----------|
| Supabase | Postgres | Auth+DB+Storage 올인원 | 가장 무난한 시작점 |
| Neon | Postgres | 브랜치 기능, scale-to-zero | 개발/운영 분리 필요 시 |
| Turso | LibSQL | 엣지 레이턴시 극도로 낮음 | 글로벌 사용자 |
| Cloudflare D1 | SQLite | Workers와 궁합 | Cloudflare 생태계 |
| PocketBase | SQLite | 단일 파일에 다 있음 | MVP/프로토타입 최적 |

### ORM

| 전략 | 선택 |
|------|------|
| 서버리스 친화 + 경량 | Drizzle |
| SQL 직접 작성 선호 | Kysely |
| DX 최고 (무거움) | Prisma |

### 캐시

| 상황 | 선택 |
|------|------|
| 서버리스 환경 | Upstash Redis |
| Cloudflare 생태계 | Cloudflare KV |
| VPS 직접 운영 | Redis |

### 분석/OLAP

| 도구 | 특징 | 추천 상황 |
|------|------|-----------|
| DuckDB-WASM | 브라우저/엣지에서 분석 쿼리 실행 | 로그 분석, 대시보드 |

### SQLite 백업

| 도구 | 특징 |
|------|------|
| Litestream | 실시간 S3 백업, 비용 $0 |

### 클라이언트 캐싱

| 전략 | 선택 | 특징 |
|------|------|------|
| 백엔드 상태 동기화 | TanStack Query | 복잡한 의존성 처리 |
| 단순 GET 캐싱 | SWR | Next.js와 궁합 좋음 |
| PocketBase 사용 시 | PocketBase SDK | 자동 실시간 구독 |

---

## 5. 검색 & AI

### 텍스트 검색

| 도구 | 특징 | 추천 상황 |
|------|------|-----------|
| Meilisearch | 오타 보정 강력, 설정 쉬움 | 인디해커 기본값 |
| Typesense | 인메모리, 극도로 빠름 | 속도 우선 |

### 벡터 검색 (RAG)

| 도구 | 특징 |
|------|------|
| pgvector | 기존 Postgres에 확장으로 추가 |
| Qdrant | Rust 기반, 필터링 강력 |
| Weaviate | 자동 벡터화 내장 |
| LanceDB | 파일 기반, 서버리스/로컬 RAG 최적 |

### AI SDK

| 도구 | 특징 |
|------|------|
| Vercel AI SDK | 스트리밍 처리 표준 |
| OpenRouter SDK | 다양한 LLM 저렴하게 스위칭 |
| LlamaIndex TS | RAG 전문 |

### AI 접근 제어

| 파일 표준 | 역할 |
|------|------|
| robots.txt | 전통적 검색 엔진 크롤러 제어 |
| llms.txt | LLM에게 사이트 정보 요약 제공 (마크다운) |
| ai.txt | AI 봇의 데이터 수집 허용/거부 명시 |

### 로컬 AI 실행

| 도구 | 특징 | 요구 사양 |
|------|------|------|
| Ollama | 로컬 LLM 최적화, CLI 간편 | 8GB+ RAM |
| LM Studio | GUI 제공, 모델 테스트 용이 | 16GB+ RAM |
| llama.cpp | 가장 경량화 | 4GB+ RAM 가능 |

### 접근성(A11y) 테스트

| 도구 | 특징 | 추천 상황 |
|------|------|------|
| Lighthouse | Chrome 내장, 성능+접근성+SEO 통합 | 기본 점검 |
| Axe DevTools | 실시간 코드 레벨 검사 | 개발 단계 |
| Pa11y | CI/CD 통합 자동화 | 릴리스 전 검증 |

---

## 6. 인증 & 보안

### 인증

| 전략 | 선택 | 특징 |
|------|------|------|
| BaaS 올인원 | Supabase Auth | 가장 무난, 소셜 로그인 쉬움 |
| 데이터 주권 | Better-Auth | TS 최적화, 플러그인 강력 |
| 세션 보안 특화 | SuperTokens | 토큰 탈취 방지 |

### 보안

| 도구 | 용도 |
|------|------|
| Cap | PoW 방식 봇 차단 캡차 (쿠키/추적 없음) |

### Rate Limiting

| 도구 | 특징 | 추천 상황 |
|------|------|-----------|
| Upstash Ratelimit | 서버리스 최적, 무료 티어 | 엣지/서버리스 |
| @hono/rate-limiter | Hono/Elysia 미들웨어 | Bun 백엔드 |
| express-rate-limit | Express 전통적 강자 | Node.js |

---

## 7. 인프라 & 배포

### 배포 플랫폼

| 전략 | 선택 | 비용 |
|------|------|------|
| 인디해커 추천 (VPS) | Coolify | 월 $5 VPS로 무한 배포 |
| VPS 1줄 배포 | Kamal | Docker만 있으면 롤백/제로다운 |
| 프론트엔드 SSR | Vercel / Netlify | 무료→트래픽 터지면 비쌈 |
| 엣지 컴퓨팅 | Cloudflare Workers | 저렴 |
| 백엔드 PaaS | Railway / Fly.io | 소규모에 적합 |
| 로컬/VPS | Docker Compose | 환경 일관성 |

### CI/CD

| 도구 | 용도 |
|------|------|
| GitHub Actions | 코드 푸시 시 자동 배포/테스트 |

### 모니터링

| 용도 | 도구 |
|------|------|
| 에러 추적 | Sentry / GlitchTip (오픈소스) |
| 업타임 감시 | Uptime Kuma |
| 제품 분석 | PostHog / Umami / Plausible |

### 도메인 & DNS

| 전략 | 선택 | 특징 |
|------|------|------|
| 투명한 가격 | Porkbun | 갱신 비용 장난 없음, UI 깔끔 |
| 인프라 통합 | Cloudflare | 도메인 구매부터 DNS 관리까지 |
| 프라이버시 | Njalla | 익명 도메인 구매 |
| Reverse Proxy | Caddy | Nginx 대안, 자동 HTTPS |

---

## 8. 테스트 & API

### 테스트

| 용도 | 도구 |
|------|------|
| 유닛/통합 | Vitest |
| E2E 브라우저 | Playwright |
| Bun 백엔드 | Bun test |

### API 문서화

| 도구 | 특징 |
|------|------|
| Swagger UI | 전통적인 강자 |
| Scalar | 모던 UI, Hono/Elysia와 궁합 좋음 |

### API 클라이언트

| 도구 | 특징 |
|------|------|
| Bruno | Git 버전 관리 가능, 오프라인 |
| Hoppscotch | 웹에서 바로 테스트 |

### 로컬 터널링

| 도구 | 특징 | 추천 상황 |
|------|------|-----------|
| ngrok | 업계 표준, 무료 티어 | 웹훅 테스트/데모 |
| Cloudflare Tunnel | 무료, 보안 강력 | 장기 사용 |
| LocalTunnel | 오픈소스, 간단 | 빠른 테스트 |

---

## 9. 비즈니스 & 수익화

### 결제

| 상황 | 선택 |
|------|------|
| 글로벌 SaaS (세금 자동) | Lemon Squeezy / Paddle |
| 오픈소스/SaaS 최적 | Polar (GitHub 기반, 수수료 4%) |
| 국내 결제 | 포트원 / 부트페이 |
| 암호화폐 | BTCPay Server |

### 인앱 결제 (모바일)

| 도구 | 특징 |
|------|------|
| RevenueCat | 업계 표준. 월 $2,500까지 무료 |
| Adapty.io | 페이월 A/B 테스트 강력 |

### 해외 수익 수취

| 서비스 | 특징 |
|--------|------|
| Wise | 환율 우대 최고, 실제 현지 계좌 제공 |
| Payoneer | 주요 플랫폼 공식 파트너 |

### 후원

| 서비스 | 특징 |
|--------|------|
| Ko-fi | 수수료 0% 옵션 |
| GitHub Sponsors | 오픈소스 개발자용, 수수료 0% |
| Buy Me a Coffee | 가장 유명함 |

### SEO & 마케팅

| 도구 | 용도 |
|------|------|
| Google Search Console | 검색 노출 필수 연동 |
| Ahrefs Webmaster Tools | 내 사이트 SEO 상태 무료 진단 |
| Dub.co | 오픈소스 링크 단축 및 클릭 분석 |

---

## 10. 운영 기능

### 이메일

| 도구 | 특징 |
|------|------|
| Resend | DX 최고, React-Email 지원 |
| React Email | 이메일 템플릿 코딩 (위와 함께 사용) |
| AWS SES | 최저가, 설정 복잡 |
| Mailpit | 로컬 SMTP 서버 (개발 테스트용) |

### 알림 (푸시/SMS)

| 도구 | 특징 |
|------|------|
| Novu | 오픈소스 통합 알림 인프라 |
| OneSignal | 마케팅 푸시, 세그먼트 |
| ntfy | HTTP 한 줄로 폰에 알림 |

### 백그라운드 작업

| 상황 | 선택 |
|------|------|
| 서버리스 친화 | Trigger.dev / Inngest |
| Node.js + Redis | BullMQ |
| Go | Asynq |

### 로그 관리

| 상황 | 선택 | 특징 |
|------|------|------|
| 구조화 로그 | pino | JSON 출력, 성능 좋음 |
| 로그 수집/전송 | Vector | 다양한 소스→목적지 파이프라인 |
| 로컬 검색/시각화 | ZincSearch | Elasticsearch 경량 대안 |

### 피처 플래그 & A/B

| 도구 | 특징 |
|------|------|
| PostHog | 분석 + 플래그 통합 |
| GrowthBook | A/B 테스트 시각화 |
| Flagsmith | 심플, 온프레미스 |

### 다국어 (i18n)

| 전략 | 선택 |
|------|------|
| SvelteKit 전용 | Paraglide JS |
| 타입 안전 | typesafe-i18n |
| 번역가 협업 | Tolgee / inlang |

---

## 11. 고객 소통

### 라이브 채팅 / 지원

| 도구 | 특징 |
|------|------|
| Crisp | 인디해커 국룰, 무료 티어 혜자 |
| Chatwoot | 오픈소스 Intercom 대안 |

### 피드백 & 로드맵

| 도구 | 특징 |
|------|------|
| Sleekplan | 피드백 + 로드맵 + 변경로그 통합 |
| Upvoty | 유저 투표 기능 강력 |

### 문서 & 위키

| 용도 | 도구 |
|------|------|
| API/제품 문서 | Docusaurus / Nextra |
| 내부 위키 | Outline / BookStack |

### 헤드리스 CMS

| 도구 | 특징 | 추천 상황 |
|------|------|-----------|
| Payload | 자체 호스팅, TypeScript 네이티브 | 완전한 제어 필요 시 |
| Strapi | 플러그인 생태계 풍부 | 빠른 프로토타입 |
| Sanity | 실시간 협업, 무료 티어 | 콘텐츠 팀 협업 |

### 댓글 & 커뮤니티

| 전략 | 선택 |
|------|------|
| GitHub 연동 (무료) | Giscus |
| 자체 호스팅 | Remark42 / Cusdis |
| 포럼 필요 시 | Flarum / Talkyard |

---

## 12. 크로스 플랫폼

| 용도 | 도구 |
|------|------|
| 웹→데스크탑 | Tauri |
| 네이티브 모바일 | Flutter |
| 임베디드/경량 GUI | Slint |
| 2D 웹 게임 | Phaser |
| Flutter 게임 | Flame |

---

## 13. Web3

| 체인 | 프레임워크 |
|------|------------|
| Solana | Anchor (Rust) |
| Aptos/Sui | Move |
| Polkadot | ink! (Rust) |
| Flow | Cadence |

---

## 14. 광고 수익화

### 광고 네트워크 (Money IN)

| 티어 | 네트워크 | 조건 |
|------|----------|------|
| 진입 | AdSense | 승인만 나면 |
| 중급 | Ezoic | AI 최적화, 월 1만 뷰+ |
| 상위 | Mediavine / Raptive | 월 5만+ PV |
| 크립토 | Coinzilla / A-ADS | 암호화폐 사이트 |
| 모바일 게임 | AppLovin / Unity Ads | 보상형 비디오 |

### 광고 집행 (Money OUT)

| 플랫폼 | 특징 |
|--------|------|
| Google Ads | 검색/유튜브 압도적 1위 |
| Meta Ads | 정교한 타겟팅 |
| X Ads | 크립토/Web3 친화적 |
| StackAdapt | 구글 거절 시 대안 DSP |

---

## 15. 스토리지

| 전략 | 선택 |
|------|------|
| 대역폭 무료 | Cloudflare R2 |
| 저렴한 저장 | Backblaze B2 |
| 업계 표준 | Amazon S3 |

---

## 16. 프로젝트 타입별 추천 스택

> "그래서 뭘 써야 하는데?" → 타입별 프리셋

| 타입 | 예시 | 최소 스택 | 확장 시 추가 |
|------|------|----------|------------|
| 콘텐츠/블로그 | 기술 블로그, 튜토리얼 | Astro + UnoCSS + Cloudflare Pages + R2 | Meilisearch, PostHog, Resend |
| 소형 SaaS | 단일 기능 도구, 위젯 | SvelteKit + Better-Auth + Turso + Vercel | PostHog, Novu, Lemon Squeezy, Trigger.dev |
| 정보 허브 | 다국어 정보 사이트 | SvelteKit + Paraglide JS + Meilisearch + D1 | pgvector, PostHog, 광고 네트워크 |
| 어드민 툴 | 개인 대시보드, 관리 콘솔 | SvelteKit + PocketBase + shadcn-ui | Sentry, Uptime Kuma, Docker Compose |

---

## 17. 성장 단계별 업그레이드 가이드

> "지금은 안 바꿔도 됨" vs "이 시점엔 바꿔야 함"

| 단계 | 트래픽/상태 | 권장 스택 변화 |
|------|------------|--------------|
| 0단계 (실험) | 친구 10명 수준 | SQLite + SvelteKit API + PocketBase, 모니터링 없이 시작 |
| 1단계 (MVP) | 월 1천~1만 PV | Supabase/Turso 이전 검토, Sentry 도입, GitHub Actions CI |
| 2단계 (초기 성장) | 월 1만~10만 PV | Upstash 캐시, PostHog 도입, Coolify/Kamal 배포, 로그 파이프라인 |
| 3단계 (안정 운영) | 매출 발생 | 분석 DB(DuckDB), 정식 백업 전략, Novu 알림 자동화 |

---

## 18. 벤더 락인 탈출 전략

> 선택 원칙 1번 "언제든 갈아탈 수 있는 구조" 실천 가이드

| 영역 | 예시 벤더 | 위험도 | 탈출 전략 |
|------|----------|:------:|----------|
| DB | Supabase | 4 | 순수 Postgres, SQL/스키마 관리하면 Neon/RDS로 이사 가능 |
| 인증 | Supabase Auth | 7 | 유저 ID·프로바이더 ID 표준화 저장, Better-Auth로 이행 대비 |
| 결제 | Lemon Squeezy | 8 | 플랜·구독 상태를 내 DB에 미러링, 전환 시 매핑 용이하게 |
| 이메일 | Resend | 3 | React Email로 템플릿 관리, 발송 드라이버만 SES로 교체 가능 |
| 분석 | PostHog | 5 | Raw 이벤트 스키마 문서화, S3/R2에 로그 복제 |

> **위험도 7~9**: 깊게 박히기 전에 추상화 레이어 필수

---

## 19. 백업·복구 전략

> "망했을 때 어떻게 복구할 건지"

| 자산 | 기본 선택 | 백업 전략 | RPO/RTO 목표 |
|------|----------|----------|-------------|
| Postgres (Supabase/Neon) | 플랫폼 스냅샷 | 주기적 스냅샷 확인, 마이그레이션 전 수동 백업 | RPO 1일, RTO 4시간 |
| SQLite (D1/PocketBase) | Litestream | R2/B2에 실시간 복제 | RPO 10분, RTO 1시간 |
| 객체 스토리지 (R2/S3) | 버저닝 | 버전 관리 + 라이프사이클 정책 | RPO 1일, RTO 24시간 |
| 설정 파일 | Git 리포지토리 | `.vibe-coding`, 설정 파일 모두 Git에 | RPO 0, RTO 즉시 |

> **RPO** (Recovery Point Objective): 얼마나 많은 데이터 손실을 감수할 것인가  
> **RTO** (Recovery Time Objective): 복구까지 얼마나 걸릴 것인가
