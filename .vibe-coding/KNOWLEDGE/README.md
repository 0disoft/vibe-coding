# KNOWLEDGE

이 디렉토리는 프로젝트에서 사용하는 주요 라이브러리 및 도구들의 **버전별 변경 사항, Deprecated된 메서드, 최신 API 패턴** 등을 관리하는 기술 참조 문서들을 보관합니다. 에이전트는 코드를 작성할 때 버전 불일치나 구식 문법 사용을 방지하기 위해 이 문서들을 우선적으로 참고합니다.

## 📂 전체 지식 문서 목록

에이전트에게 관련 기술 스택에 대한 심도 있는 구현을 요청할 때 아래 파일들을 참고하도록 지시하십시오.

### 🏗️ 핵심 프레임워크 & 런타임

- [`svelte5_sveltekit2.md`](./svelte5_sveltekit2.md): Svelte 5 (Runes) 및 SvelteKit 2 핵심 분석
- [`typescript.md`](./typescript.md): TypeScript 5.7+ 최신 기능 및 모범 사례
- [`bun.md`](./bun.md): Bun 런타임 및 패키지 관리
- [`rust.md`](./rust.md): Rust 프로그래밍 언어 가이드
- [`go.md`](./go.md): Go 프로그래밍 언어 가이드
- [`python.md`](./python.md): Python 프로그래밍 언어 가이드

### 🎨 디자인 시스템 & UI

- [`unocss.md`](./unocss.md): UnoCSS v65+ (Wind4 프리셋) 가이드
- [`shiki.md`](./shiki.md): 코드 하이라이팅 설정
- [`view_transitions_api.md`](./view_transitions_api.md): 뷰 전환 애니메이션 가이드
- [`echarts.md`](./echarts.md): Apache ECharts 라이브러리
- [`tiptap.md`](./tiptap.md): Tiptap 리치 텍스트 에디터
- [`markedjs.md`](./markedjs.md): Markdown 파서

### 🔐 인증 및 보안

- [`better_auth.md`](./better_auth.md): Better Auth 인증 프레임워크
- [`capjs.md`](./capjs.md): CAP.js (보안/암호화 등)

### 💾 데이터베이스 및 스무딩

- [`postgresql.md`](./postgresql.md): PostgreSQL 데이터베이스
- [`sqlite.md`](./sqlite.md): SQLite 데이터베이스
- [`drizzle.md`](./drizzle.md): Drizzle ORM
- [`pgvector.md`](./pgvector.md): PostgreSQL 벡터 익스텐션
- [`turso.md`](./turso.md): Turso (LibSQL 환경)
- [`qdrant.md`](./qdrant.md): Qdrant 벡터 데이터베이스
- [`upstash_redis.md`](./upstash_redis.md): Upstash Redis
- [`meilisearch.md`](./meilisearch.md): Meilisearch 검색 엔진

### ☁️ 클라우드 및 인프라 (SaaS/Self-hosted)

- [`cloudflare_d1.md`](./cloudflare_d1.md): Cloudflare D1 SQL 데이터베이스
- [`cloudflare_kv.md`](./cloudflare_kv.md): Cloudflare KV 저장소
- [`cloudflare_r2.md`](./cloudflare_r2.md): Cloudflare R2 객체 저장소
- [`coolify.md`](./coolify.md): Coolify 셀프 호스팅 PaaS
- [`vercel_ai_sdk.md`](./vercel_ai_sdk.md): Vercel AI SDK
- [`outline.md`](./outline.md): Outline 지식 관리 위키
- [`directus.md`](./directus.md): Directus 가로 관리형 CMS
- [`uptime_kuma.md`](./uptime_kuma.md): Uptime Kuma 모니터링
- [`glitch_tip.md`](./glitch_tip.md): GlitchTip 에러 추적 시스템

### 📞 통신 및 자동화

- [`hono.md`](./hono.md): Hono HTTP 프레임워크
- [`elysia.md`](./elysia.md): ElysiaJS 웹 프레임워크
- [`n8n.md`](./n8n.md): n8n 워크플로우 자동화
- [`trigger.md`](./trigger.md): Trigger.dev 백그라운드 작업
- [`novu.md`](./novu.md): Novu 알림 인프라
- [`ntfy.md`](./ntfy.md): ntfy 푸시 알림

### 💸 결제 및 수익화

- [`port_one.md`](./port_one.md): 포트원(Portone) 결제 연동
- [`btcpay_server.md`](./btcpay_server.md): BTCPay Server (비트코인 결제)
- [`wise.md`](./wise.md): Wise 대금 결제
- [`ko-fi.md`](./ko-fi.md): Ko-fi 후원 플랫폼
- [`revenue_cat.md`](./revenue_cat.md): RevenueCat 인앱 결제 관리

### 💬 커뮤니케이션 & 댓글

- [`chatwoot.md`](./chatwoot.md): Chatwoot 고객 지원 플랫폼
- [`giscus.md`](./giscus.md): giscus (GitHub Discussions 기반 댓글)
- [`remark42.md`](./remark42.md): Remark42 댓글 엔진

### 🛠️ 기타 도구 및 라이브러리

- [`biome.md`](./biome.md): Biome 린터 및 포매터 규칙
- [`turborepo.md`](./turborepo.md): 모노레포 빌드 시스템
- [`wxt.md`](./wxt.md): WXT 브라우저 확장 프로그램 프레임워크
- [`tauri.md`](./tauri.md): Tauri 데스크톱 앱 프레임워크
- [`slint.md`](./slint.md): Slint UI 툴킷
- [`flutter.md`](./flutter.md): Flutter 크로스 플랫폼 프레임워크
- [`paraglide_js.md`](./paraglide_js.md): Inlang Paraglide-JS (i18n)
- [`openrouter_ts_sdk.md`](./openrouter_ts_sdk.md): OpenRouter TS SDK
- [`typebox.md`](./typebox.md): TypeBox 스키마 검증
- [`bruno.md`](./bruno.md): Bruno (API 클라이언트)
- [`anchor.md`](./anchor.md): Solana Anchor 프레임워크
- [`resned.md`](./resned.md): Resend 이메일 발송 관련 (오타 가능성: Resend)

## 사용 방법

새로운 코드를 작성하거나 기존 코드를 마이그레이션할 때, 특정 기술의 **최신 권장 패턴**이나 **삭제된 기능**이 있는지 확인하기 위해 지식 파일을 참고하도록 지시하십시오.

예:

- "KNOWLEDGE/svelte5_sveltekit2.md 파일을 참고해서 Svelte 5에서 변경된 Runes 문법이 제대로 적용되었는지 확인해줘."
- "KNOWLEDGE/unocss.md 가이드를 보고 v65+에서 Deprecated된 클래스가 쓰이지 않았는지 검토해줘."
