# 100개+ 사이트 운영 시 회원 정보 관리 전략

템플릿 기반으로 100개 이상의 웹사이트를 운영할 때 회원 관리 아키텍처 옵션입니다.

> ⚠️ **현실 주의**: 아래 전략들은 교과서적으로는 맞지만, 실제 운영 시 드러나는 문제점을 반드시 고려해야 합니다.
> 💡 **인디해커 주의**: 1인 개발자라면 **오버엔지니어링 리스크**를 경계하세요. PlanetScale + Neon + Cloudflare + Vercel 같은 4중 이종 구조는 서비스 개발보다 인프라 관리에 시간을 다 뺏길 수 있습니다.

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
3. **지연 시간 최소화**: 모든 데이터가 Cloudflare 네트워크 내부에서 처리 → 외부 DB 레이턴시 0

### D1 한계와 탈출 경로

D1은 기본값이지만, 장기 운영에서 이런 케이스에서 균열이 날 수 있습니다:

- 특정 몇 개 사이트만 데이터가 비정상적으로 커질 때
- 리포트/통계용 조인 쿼리가 많아질 때
- 규제 이슈로 특정 국가 데이터만 따로 빼야 할 때

**탈출 시나리오:**

- D1이 버티지 못하면 → **Turso/Neon으로 일부 워크로드 분리** (세컨더리 DB)
- 읽기/분석이 과하게 무거워지면 → 읽기 전용 레플리카 분리

---

## 멀티테넌트 스키마 구조

`site_id` 컬럼만으로는 부족합니다. 실제로는 최소 4개 엔티티가 필요합니다:

### D1 스키마 초안

```sql
-- 어떤 사이트들이 있는지
CREATE TABLE sites (
  id TEXT PRIMARY KEY,        -- 내부용 UUID
  slug TEXT NOT NULL,         -- "pettopia", "skymachina"
  domain TEXT NOT NULL,       -- "pettopia.club"
  group_id TEXT,              -- 패밀리 사이트 묶음 (SSO용)
  created_at INTEGER NOT NULL
);

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
  meta TEXT                   -- 소셜 로그인 등 추가 정보
);

-- 어떤 유저가 어떤 사이트의 회원인지
CREATE TABLE site_memberships (
  site_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',  -- "owner", "admin", "member"
  PRIMARY KEY (site_id, user_id)
);

-- 세션 또는 리프레시 토큰
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  ip TEXT,
  user_agent TEXT
);
```

### 핵심 포인트

- **users는 네트워크 공통** (한 번 가입하면 전체 네트워크에서 식별)
- **site_memberships에 site_id를 걸어 멀티테넌트 표현**
- **site_groups로 SSO 정책을 DB 레벨에서 표현**

### SSO 정책 예시

- Pettopia, HistoryWiki, ToolHub 세 개를 same group으로 묶음
- 어느 쪽에서든 가입하면 세 사이트에서 기본 member 권한 부여

---

## 중앙 인증 서버 보일러플레이트

### Workers + Hono 구조

```ts
// src/auth-worker.ts
import { Hono } from 'hono';
import { createAuth } from 'better-auth-cloudflare';
import { d1Adapter } from 'better-auth-d1';

type Env = {
  AUTH_DB: D1Database;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Env }>();

const auth = createAuth({
  adapter: d1Adapter((env) => env.AUTH_DB),
  // providers, password policy, session, jwt 설정 등
});

// 사이트별 로그인
app.post('/auth/:siteSlug/sign-in/email', async (c) => {
  const { siteSlug } = c.req.param();
  const body = await c.req.json();

  // 1) siteSlug → site_id 조회
  // 2) better-auth로 로그인 처리
  // 3) site_memberships에 없으면 자동 생성 여부 정책에 따라 처리
  // 4) JWT 발급 (payload: user_id, site_id, roles)

  const jwt = await issueJwt(c.env.JWT_SECRET, {
    userId: '...',
    siteId: '...',
    roles: ['member']
  });

  return c.json({ token: jwt });
});

// JWT에서 현재 세션 정보 조회
app.get('/auth/session', async (c) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return c.json({ user: null }, 401);

  const payload = await verifyJwt(c.env.JWT_SECRET, token);
  return c.json({ user: payload });
});

export default app;
```

**핵심 포인트:**

- 라우트에 `:siteSlug`를 넣어 **같은 Auth 서버로 100개 사이트를 모두 처리**
- JWT에는 `user_id`, `site_id`, `roles`만 포함
- 나머지 프로필은 필요할 때 중앙 서버에서 별도 조회

### SvelteKit 사이트 연동

```ts
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { verifyJwt } from '$lib/auth/jwt';

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get('auth_token');

  if (token) {
    try {
      const payload = await verifyJwt(token);
      event.locals.user = {
        id: payload.userId,
        siteId: payload.siteId,
        roles: payload.roles
      };
    } catch {
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

    const siteSlug = 'pettopia'; // 빌드 타임 상수
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
