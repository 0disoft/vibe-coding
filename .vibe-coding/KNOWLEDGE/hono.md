# Hono v4.6 - v4.10 마이그레이션 리포트

2024년 말부터 2025년 말까지 Hono는 단순한 '빠른 웹 프레임워크'를 넘어 **엔터프라이즈급 미들웨어 생태계**와 **표준화된 개발 패턴**을 확립하는 데 집중했습니다. 특히 v4.7.0과 v4.8.0은 기존의 수동 구현 패턴(Proxy, Auth, Validation)을 공식 헬퍼로 대체하고, API 설계를 정교화하는 분기점이므로 코드베이스의 현대화가 필요합니다.

본 리포트는 해당 기간의 핵심 변경 사항을 분석하여, 실무 개발자가 즉시 적용해야 할 아키텍처 및 코드 변경 전략을 제시합니다.

-----

## 1. Executive Summary: 버전별 핵심 아키텍처 변화

| 버전 | 핵심 키워드 | 아키텍처 영향도 (Impact) |
| :--- | :--- | :--- |
| **v4.6.x** | **Context & Security** | **[Global State]** `Context Storage` 도입으로 요청 스코프 데이터(Trace ID, User 등)의 전역 접근이 가능해져, 'Prop Drilling' 문제를 근본적으로 해결. |
| **v4.7.0** | **Standardization** | **[Helper First]** `Proxy`, `JWK`, `Language`, `Standard Validator` 등 핵심 기능을 공식 미들웨어로 제공. 직접 구현한 유틸리티 코드의 제거(Deprecation) 신호. |
| **v4.8.0** | **API Refinement** | **[Refactoring]** `Hono#fire` 폐기 및 `Route Helper` 도입으로 내부 API 접근 방식 변경. SSG 플러그인 시스템 도입으로 빌드 로직 모듈화. |
| **v4.9.0** | **RPC & SSG** | **[Client Experience]** RPC 클라이언트의 에러 핸들링(`parseResponse`) 표준화 및 SSG 훅의 플러그인화 완료. |
| **v4.10.x** | **Type Safety** | **[Reliability]** RPC 타입 추론 강화 및 `cloneRawRequest` 등 엣지 케이스 대응 유틸리티 추가. |

-----

## 2. Critical Deprecations & Action Plan

다음 3가지 항목은 코드 수정 없이는 장기적인 유지보수나 버전 업그레이드 시 문제가 발생할 수 있는 '필수 수정' 대상입니다.

### 2-1. 라우트 정보 접근 방식 변경 (v4.8.0)

`c.req` 객체의 속성으로 접근하던 방식이 독립된 헬퍼 함수로 변경되었습니다. 타입 안전성을 위해 즉시 교체하십시오.

* **Deprecated:** `c.req.routePath`, `c.req.matchedRoutes`
* **Replacement:**

    ```ts
    import { routePath, matchedRoutes } from 'hono/route'
    // ...
    const path = routePath(c)
    ```

### 2-2. Service Worker 진입점 변경 (v4.8.0)

Cloudflare Workers 등 엣지 환경에서 사용하던 `app.fire()` 메서드가 제거되었습니다.

* **Deprecated:** `app.fire(event)`
* **Replacement:**

    ```ts
    import { fire } from 'hono/service-worker'
    // ...
    event.respondWith(fire(app, event))
    ```

### 2-3. SSG 훅 옵션 폐기 (v4.9.0)

`toSSG()` 함수의 인라인 훅 옵션들이 플러그인 시스템으로 이관되었습니다.

* **Deprecated:** `beforeRequestHook`, `afterResponseHook` 등
* **Replacement:** `plugins: [myCustomPlugin()]` 형태로 훅 로직을 별도 플러그인 객체로 분리하여 주입하십시오.

-----

## 3. Strategic Adoption: 도입해야 할 신규 패턴

### 3-1. 수동 구현 코드 제거 (Boilerplate Removal)

다음 기능들을 직접 구현해 사용하고 있다면, Hono 공식 미들웨어로 교체하여 코드 양을 줄이고 안정성을 확보하십시오.

* **Reverse Proxy:** `fetch` 기반의 수동 프록시 로직 → `hono/proxy`
* **i18n:** 헤더/쿠키 파싱 로직 → `hono/language`
* **Auth:** JWT/JWKS 검증 로직 → `hono/jwk` (Auth0, Clerk 연동 시 필수)
* **Validation:** 개별 Zod 미들웨어 → `@hono/standard-validator` (스키마 라이브러리 교체 용이성 확보)

### 3-2. Context Storage 활용 (Architecture Upgrade)

로그, 트레이싱, 멀티테넌시 정보를 다루는 대규모 앱이라면 `contextStorage()` 미들웨어를 최상단에 적용하십시오. 비즈니스 로직 깊은 곳에서 `getContext()`를 호출함으로써, 불필요한 인자 전달을 제거하고 코드 결합도를 낮출 수 있습니다.

### 3-3. 보안 강화 (Security Hardening)

v4.10.x의 보안 기능을 기본 템플릿에 포함시키십시오.

* `secureHeaders`에 **CSP Nonce** 및 **Permissions-Policy** 설정 추가.
* `csrf` 미들웨어와 `Sec-Fetch-Site` 검사를 결합하여 방어 수준 상향.

-----

## 4. Conclusion

Hono v4.6\~4.10 기간의 변화는 "더 적은 코드로, 더 표준화된 방법으로" 개발하도록 유도하고 있습니다. 기존 프로젝트에서는 **v4.8.0의 Deprecated API 제거**를 최우선 과제로 삼고, 신규 프로젝트에서는 **Context Storage와 공식 헬퍼 미들웨어**를 적극 활용하여 'Hono Native'한 아키텍처를 설계하십시오.
