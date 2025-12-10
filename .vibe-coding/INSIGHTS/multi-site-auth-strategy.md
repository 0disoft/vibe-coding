# 100개+ 사이트 운영 시 회원 정보 관리 전략

템플릿 기반으로 100개 이상의 웹사이트를 운영할 때 회원 관리 아키텍처 옵션입니다.

> ⚠️ **현실 주의**: 아래 전략들은 교과서적으로는 맞지만, 실제 운영 시 드러나는 문제점을 반드시 고려해야 합니다.
> 💡 **인디해커 주의**: 1인 개발자라면 **오버엔지니어링 리스크**를 경계하세요. PlanetScale + Neon + Cloudflare + Vercel 같은 4중 이종 구조는 서비스 개발보다 인프라 관리에 시간을 다 뺏길 수 있습니다.

---

## 왜 중앙 회원 관리가 힘인가

이메일 발송, 로그인 폼 같은 건 어디서나 만들 수 있다. 진짜 힘은 **"내 네트워크 전체를 관통하는 그래프"**를 쥐는 데서 나온다.

이 문서에서 설계하는 중앙 Auth는:

1. **사람의 신분증** - 한 번 가입하면 전 네트워크에서 식별
2. **사이트 간 이동 경로** - 어떤 유저가 어디서 왔는지 추적
3. **각 사이트의 지갑·플랜 정보** - 결제/구독 상태를 한 군데에서 관리

---

## 핵심 원칙: 벤더 단일화 전략

너무 많은 벤더가 섞이면 네트워크 홉이 늘어나고 관리 포인트가 분산됩니다.
**하나의 생태계 안에서 모든 것을 끝내는 구조**를 권장합니다.

---

## 추천 아키텍처: Cloudflare 올인원 ⭐⭐⭐ (인디해커 최적)

```plaintext
┌───────────────────────────────────────────────┐
│              Cloudflare Workers               │
│         (Auth Server + Gateway)               │
│          [better-auth on Hono]                │
└──────────────────────┬────────────────────────┘
                       │
           ┌───────────┴───────────┐
           ▼                       ▼
   ┌───────────────┐       ┌───────────────┐
   │ Cloudflare D1 │       │ Cloudflare KV │
   │ (Auth DB)     │       │ (Session/Cache)│
   └───────────────┘       └───────────────┘
           │
           │ JWT (Stateless)
           ▼
   ┌───────────────────────────────────┐
   │      Individual SvelteKit App     │
   │      (Site A, B, C...)            │
   │      [Adapter Cloudflare]         │
   └─────────────────┬─────────────────┘
                     ▼
             ┌───────────────┐
             │ Cloudflare D1 │
             │ (Site DB)     │
             └───────────────┘
```

### 핵심 변경점

1. **PlanetScale/Neon 제거**: Cloudflare D1(SQLite)으로 대체. 텍스트 위주면 충분, 비용 압도적 저렴
2. **벤더 통일**: DNS, CDN, 컴퓨팅(Workers), DB(D1), 스토리지(R2) 모두 Cloudflare 한 곳에서 관리
3. **지연 시간 최소화**: 다른 클라우드 벤더로 나가는 네트워크 홉 0, 모든 요청이 Cloudflare 네트워크 안에서 끝나서 지연과 장애 지점을 크게 줄임

### D1 한계와 탈출 경로

D1은 기본값이지만, 장기 운영에서 이런 케이스에서 균열이 날 수 있습니다:

- 특정 몇 개 사이트만 데이터가 비정상적으로 커질 때
- 리포트/통계용 조인 쿼리가 많아질 때
- 규제 이슈로 특정 국가 데이터만 따로 빼야 할 때

**D1 실제 제한 (Paid 기준):**

- DB당 최대 10GB
- 계정당 최대 5만 개 DB (추가 확장 가능)

**탈출 시나리오:**

- 한 사이트가 10GB 넘어갈 것 같다 → 그 사이트만 Turso/Neon으로 탈출
- 사이트 수가 미쳐 돌아간다 → D1 다중 DB 전략 유지, 대신 read-heavy 쿼리는 별도 분석 DB로 미러링
- 읽기/분석이 과하게 무거워지면 → 읽기 전용 레플리카 분리

---

## 멀티테넌트 스키마 구조

`site_id` 컬럼만으로는 부족합니다. 실제로는 최소 4개 엔티티가 필요합니다:

### D1 스키마 초안

> ⚠️ **Better-Auth 스키마 주의**: Better-Auth는 `user`, `session`, `account`, `verification` 네 개의 필수 코어 테이블을 요구합니다.
> 아래 스키마는 **비즈니스 로직용 확장 테이블**이며, Better-Auth 필수 테이블과 병행 사용합니다.
> 실제 구현 시 [better-auth 공식 스키마](https://www.better-auth.com/docs/concepts/database)를 먼저 생성하고, 아래 테이블로 확장하세요.

```sql
-- 어떤 사이트들이 있는지
CREATE TABLE sites (
  id TEXT PRIMARY KEY,        -- 내부용 UUID
  slug TEXT NOT NULL,         -- "site-a", "site-b"
  domain TEXT NOT NULL,       -- "site-a.example.com"
  group_id TEXT,              -- 패밀리 사이트 묶음 (SSO용)
  created_at INTEGER NOT NULL,
  FOREIGN KEY (group_id) REFERENCES site_groups(id)
);
CREATE INDEX idx_sites_slug ON sites(slug);
CREATE INDEX idx_sites_domain ON sites(domain);

-- 패밀리 사이트 그룹 (SSO 정책용)
CREATE TABLE site_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,         -- "OOO Network"
  auto_join_policy TEXT       -- "all" | "none" | "same_group"
);

-- 네트워크 공통 유저
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  deleted_at INTEGER,         -- 소프트 삭제용
  meta TEXT                   -- 소셜 로그인 등 추가 정보
);
CREATE INDEX idx_users_email ON users(email);

-- 어떤 유저가 어떤 사이트의 회원인지 + 플랜/기능 토글
CREATE TABLE site_memberships (
  site_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',  -- "owner", "admin", "member"
  plan_id TEXT,                         -- 사이트별 플랜 (nullable)
  feature_flags TEXT,                   -- JSON: { "can_post": true, "can_comment": false }
  PRIMARY KEY (site_id, user_id),
  FOREIGN KEY (site_id) REFERENCES sites(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX idx_site_memberships_user ON site_memberships(user_id);

-- 세션 (디바이스/로그인 이력 관리용, 강제 로그아웃/다중 디바이스 관리)
-- 주의: 인증은 기본적으로 JWT로 처리, 세션 테이블은 보안 감사/강제 로그아웃용
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  revoked_at INTEGER,         -- 강제 로그아웃 시 설정
  ip TEXT,
  user_agent TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX idx_sessions_user ON sessions(user_id);

-- 감사 로그 (로그인/권한변경/비밀번호 리셋 등 추적)
-- 주의: D1 용량 관리를 위해 expires_at 활용, Cron Worker로 주기적 정리
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  site_id TEXT,
  event_type TEXT NOT NULL,   -- "login", "logout", "role_changed", "password_reset" 등
  metadata TEXT,              -- JSON string
  created_at INTEGER NOT NULL,
  expires_at INTEGER          -- 생성일 + 1년 등으로 설정, Cron으로 자동 삭제
);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_site ON audit_logs(site_id);
CREATE INDEX idx_audit_event ON audit_logs(event_type);
CREATE INDEX idx_audit_expires ON audit_logs(expires_at);
```

### 핵심 포인트

- **users는 네트워크 공통** (한 번 가입하면 전체 네트워크에서 식별)
- **site_memberships에 site_id를 걸어 멀티테넌트 표현** + `plan_id`/`feature_flags`로 플랜 관리
- **site_groups로 SSO 정책을 DB 레벨에서 표현**
- **sessions 테이블은 인증용이 아님** - 강제 로그아웃, 보안 감사, 다중 디바이스 관리용
- **audit_logs로 운영/법적 요구사항 대비** - 로그인 이력, 권한 변경, 비밀번호 리셋 등 기록

### SSO 정책 예시

- Site A, Site B, Site C 세 개를 same group으로 묶음
- 어느 쪽에서든 가입하면 세 사이트에서 기본 member 권한 부여

> ⚠️ **크로스 도메인 제약**: 위 구조는 **"사이트별 개별 로그인(DB만 공유)"** 기준입니다.
> 진정한 SSO(한 번 로그인으로 site-b.com도 자동 로그인)를 원한다면, 중앙 도메인에서 쿠키를 곅는 과정이나 토큰을 쿼리 파라미터로 넘겨주는 핸드쉐이크 로직이 필요합니다.
> 1단계에서는 이 문서대로 "사이트별 개별 로그인"으로 시작하고, 2단계에서 진정한 SSO를 도입하는 것이 현실적입니다.

---

## 중앙 인증 서버 보일러플레이트

### Workers + Hono 구조

> 📌 **참고**: Better Auth + Cloudflare D1 연동의 실제 코드는 [better-auth-cloudflare README](https://github.com/zpg6/better-auth-cloudflare)를 참고하세요.
> Drizzle ORM으로 D1을 래핑하고 `withCloudflare` 옵션을 사용하는 것이 권장 패턴입니다.

**핵심 구조:**

- 라우트에 `:siteSlug`를 넣어 **같은 Auth 서버로 100개 사이트를 모두 처리**
- JWT에는 `user_id`, `site_id`, `roles`만 포함
- 나머지 프로필은 필요할 때 중앙 서버에서 별도 조회
- **모든 인증 이벤트는 `audit_logs`에 기록**

### Rate Limit 및 봇 방어 정책

> 로그인 API는 기본적으로 Better-Auth의 `rateLimit` 옵션 + Cloudflare Turnstile 조합으로 보호한다.
> 단순 인증 실패가 아니라 **"어느 IP가 어느 이메일에 몇 번 시도했는지"**를 기준으로 제한한다.

- 이메일/비밀번호 로그인 시도: IP + 이메일 기준 레이트 리밋
- `/sign-in/email`, `/sign-in/social` 같은 핫 라우트에 별도 빡센 규칙
- Turnstile CAPTCHA는 "실패 횟수 N회 이상 시 활성화"

### Stateless JWT 검증 전략

> 💡 **검증 전략**: 모든 사이트가 중앙 DB를 찌르면 병목이 온다.
> 각 SvelteKit 사이트는 `BETTER_AUTH_SECRET`을 공유받아, **DB 조회 없이 로컬에서 CPU 연산만으로 JWT 위변조를 검증**하여 인증 부하를 0으로 만든다.

### SvelteKit 사이트 연동

```ts
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { verifyJwt } from '$lib/auth/jwt'; // jose 또는 jsonwebtoken 사용
import { BETTER_AUTH_SECRET } from '$env/static/private';

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get('auth_token');

  if (token) {
    try {
      // 핵심: DB 호출 없이 Secret 키로 로컬 검증 (Stateless)
      const payload = await verifyJwt(token, BETTER_AUTH_SECRET);
      event.locals.user = {
        id: payload.sub,      // Better-Auth 표준 user.id
        siteId: payload.siteId,
        roles: payload.roles
      };
    } catch {
      // 토큰 만료 또는 위변조 시 쿠키 삭제
      event.cookies.delete('auth_token', { path: '/' });
      event.locals.user = null;
    }
  } else {
    event.locals.user = null;
  }

  return resolve(event);
};
```

### 로그인 액션 예시

```ts
// src/routes/login/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';

export const actions = {
  default: async ({ request, cookies, fetch }) => {
    const data = await request.formData();
    const email = data.get('email');
    const password = data.get('password');

    const siteSlug = SITE_SLUG; // 빌드 타임 상수 (환경변수 또는 svelte.config.js)
    const res = await fetch(
      `${process.env.AUTH_BASE_URL}/auth/${siteSlug}/sign-in/email`,
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: { 'content-type': 'application/json' }
      }
    );

    if (!res.ok) {
      return fail(400, { error: 'invalid_credentials' });
    }

    const { token } = await res.json();

    cookies.set('auth_token', token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true
    });

    throw redirect(302, '/');
  }
};
```

---

## 아키텍처 옵션 비교 (인디해커 기준)

**평가 기준** (1: 매우 나쁨 ~ 9: 매우 우수)

- **생산성**: 혼자서 구축/유지보수 용이성 **(가중치 x2)**
- **비용 효율**: 트래픽 없을 때 0원, 스케일링 시 비용 선형성
- **확장성**: 100개 사이트 트래픽 감당 여부
- **락인 위험**: 플랫폼 탈출 용이성

| 아키텍처 모델 | 생산성 (x2) | 비용 효율 | 확장성 | 락인 위험 | 종합 점수 |
|-------------|:-----------:|:---------:|:------:|:---------:|:---------:|
| **Cloudflare 올인원 (D1 + Workers)** | **9 (18)** | 9 | 7 | 4 | **38** |
| Supabase 중앙 관리 | 8 (16) | 7 | 8 | 3 | 34 |
| 전통적 VPS (Coolify) | 5 (10) | 9 | 5 | 9 | 33 |
| 이종 구조 (PlanetScale+Neon+CF) | 4 (8) | 5 | 9 | 6 | 28 |

---

## 단계별 실행 전략

### Phase 1: 1~10개 사이트 (MVP 단계)

- **전략**: 멀티테넌트 (단일 D1 DB)
- **구조**: `site_id` 컬럼으로 한 DB에 다 넣기
- **도구**: SvelteKit + Better-Auth (D1 어댑터)

### Phase 2: 10~30개 사이트 (성장 단계)

- **전략**: 중앙 인증 + 사이트별 DB 분리
- **구조**: 인증 서버 분리, 각 사이트는 독립된 D1 데이터베이스
- **이유**: 사이트 매각(Exit) 또는 폐기 시 떼어내기 쉬움

> 💡 **D1 설계 철학**: D1은 기본적으로 "여러 개의 작은 DB를 많이 쓰는" per-tenant 설계를 권장한다.
> 사이트별 D1 분리는 단순한 취향이 아니라, D1이 의도한 스케일 전략과도 맞물린다.

### Phase 3: 30개 이상 (확장 단계)

- **전략**: Stateless JWT + 엣지 캐싱
- **구조**: 중앙 DB 부하 줄이고 읽기는 KV/엣지 캐시로 처리

---

## 놓치기 쉬운 운영 디테일

### 1. 통합 어드민 대시보드 (필수)

- `super-admin.your-domain.com` 하나에서 100개 사이트 현황 관리
- sites, users, memberships 리스트가 한 화면에서 보여야 함
- **이것 안 만들면 유지보수 지옥**

### 2. 공통 약관 및 정책 관리

- 정책 문서는 **중앙 마크다운으로 관리 → API로 배포**

### 3. SSO 정책 (site_groups)

- 패밀리 사이트를 same group으로 묶어 트래픽 순환
- 어느 사이트에서든 가입하면 그룹 내 모든 사이트에서 member 권한 부여

### 4. 데이터 생명주기 및 탈퇴 정책

중앙 Auth가 있는 순간, 탈퇴/삭제 정책이 복잡해집니다:

- **사이트 탈퇴**: `site_memberships`에서만 제거, 다른 사이트 멤버십은 유지
- **네트워크 탈퇴**: `users.deleted_at` 설정, 이메일 해시만 남기고 나머지는 익명화
- **Audit log 보관**: 법적 보관 기간 동안 user_id를 해시로 대체해 "누군지는 모르는 사용자의 행동 기록" 형태로만 남김

---

## 구축 전 체크리스트

| 순서 | 작업 |
|:----:|------|
| 1 | Auth 전용 D1 데이터베이스 정의 (sites, users, site_memberships) |
| 2 | Auth Worker 하나 만들고 better-auth를 D1에 붙인 뒤 Postman으로 검증 |
| 3 | 기존 SvelteKit 사이트 중 하나에 hooks.server.ts JWT 검증 붙이기 |
| 4 | 어드민 대시보드 사이트 (`super-admin.your-domain.com`) 구축 |

**여기까지 되면 "100개 사이트 회원 관리 아키텍처"가 문서가 아니라 돌아가는 시스템이 됩니다.**

---

## 설계 목표

> "로그인은 전 세계 어디서든 50ms 안에 끝나고,  
> 한 사이트가 해킹당해도 다른 99개 사이트는 멀쩡하며,  
> 중앙 서버 터져도 최소 10분은 버티는 구조"

---

## 결론

### 1인 개발자라면

**"Better-Auth + Cloudflare D1/Workers"** 조합으로 기술 스택을 단순화하여, **운영의 복잡도를 낮추는 것**을 최우선으로 하세요.

### 마이그레이션 경로 요약

| 사이트 수 | 권장 전략 |
|----------|----------|
| 1~10개 | 멀티테넌트 (단일 D1 + site_id) |
| 10~30개 | 중앙 인증 분리 + 사이트별 D1 |
| 30개+ | Stateless JWT + 엣지 캐싱 (Cloudflare 통일) |
