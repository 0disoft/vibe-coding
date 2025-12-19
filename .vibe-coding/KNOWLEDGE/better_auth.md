# Better Auth (문서 갱신: 2025-12-19)

---

## 1. Executive Summary: 버전별 핵심 아키텍처 변화

| 버전            | 릴리즈 시기 | 핵심 아키텍처 변화 (Architecture Shift)                                                                   |
| :-------------- | :---------- | :-------------------------------------------------------------------------------------------------------- |
| **v1.1.x**      | '24.12      | **Security Hardening:** 오픈 리다이렉트 취약점 해결을 위한 `callbackURL` 검증 로직 강제화.                |
| **v1.2.0**      | '25.03      | **Enterprise Features:** 멀티 테넌시(조직/팀), API 키 관리, Captcha, Stripe 플러그인(베타) 도입.         |
| **v1.3.0**      | '25.07      | **SSO & SaaS:** SSO(@better-auth/sso)가 별도 패키지로 이동(OIDC/SAML 지원). Stripe 플러그인 안정화. |
| **v1.3.26**     | '25.10      | **API Security:** API 키 요청 출처(client/server) 검증 강화 및 발급 조건 수정.                    |
| **v1.4.0**      | '25.11.22   | **Core Redesign:** Stateless Auth(DB없는 세션), @standard-schema/spec 적용, JWE 세션 쿠키 기본화.     |
| **v1.4.7**      | '25.12.14   | **최신 안정 버전:** SAML signature validation 보안 패치 포함.                                  |

---

## 2. Critical Security Actions: 필수 보안 조치

다음 항목들은 서비스의 보안을 위해 반드시 점검하고 수정해야 할 사항입니다.

### 2-1. 오픈 리다이렉트 방어 (v1.1.6+)

`callbackURL`을 통한 피싱 공격을 막기 위해 도메인 검증이 엄격해졌습니다.

- **Impact:** 외부 도메인이나 스키마 없는 URL(`//evil.com`)로의 리다이렉트가 차단됩니다.
- **Action:**
  - `callbackURL` 파라미터를 사용자 입력값으로 직접 구성하지 마십시오.
  - 허용된 리다이렉트 경로를 화이트리스트로 관리하고, 설정 파일에 명시하십시오.

### 2-2. API 키 발급 로직 서버 이관 (v1.3.26)

인증되지 않은 상태에서의 API 키 생성을 차단하기 위해 검증 로직이 강화되었습니다.

- **Impact:** 클라이언트 사이드에서 API 키를 생성하거나 관리하던 기존 코드는 실패합니다.
- **Action:** API 키의 생성(Create), 회전(Rotate), 삭제(Delete) 로직을 전적으로 서버 사이드(Route Handler 등)로 이동시키십시오. 브라우저는 키의 메타데이터 조회만 수행해야 합니다.

---

## 3. Strategic Adoption: 도입해야 할 신규 패턴

### 3-1. SaaS 인프라 내재화 (v1.2, v1.3)

자체 구현한 조직 관리나 Stripe 연동 로직을 Better Auth의 공식 플러그인으로 대체하십시오.

- **Multi-Tenancy:** `organization` 플러그인을 도입하여 팀 초대, 권한 관리 로직의 복잡성을 제거하십시오.
- **SSO:** v1.3부터 `@better-auth/sso` 별도 패키지로 OIDC/SAML 2.0을 지원합니다.
- **Billing:** Stripe 플러그인(v1.3부터 안정화)을 사용하여 인증 상태와 구독 상태를 동기화하고, 결제 관련 웹훅 처리를 표준화하십시오.

### 3-2. 스키마 및 세션 전략 (v1.4.0)

차기 버전을 대비하여 데이터 검증 및 세션 관리 전략을 유연하게 가져가십시오.

- **Schema Agnostic:** Zod에 대한 강한 의존성 대신 `@standard-schema/spec` 호환성을 고려하여 검증 로직을 설계하십시오.
- **Session Security:** JWE(Encrypted JWT) 기반 세션 쿠키가 기본값이 되었습니다. 세션 데이터를 클라이언트에서 직접 복호화하는 로직을 지양하십시오.
- **Stateless Auth:** v1.4부터 DB 없이 세션을 관리할 수 있는 Stateless 모드를 지원합니다.

---

## 4. Conclusion

Better Auth v1.1~1.4 구간은 "보안 취약점 제거"와 "SaaS 기능의 통합"이라는 두 가지 목표를 달성했습니다. 기존 시스템의 안전을 위해 **v1.4.7 이상의 보안 패치**를 최우선으로 적용하고, 장기적으로는 **공식 플러그인 기반의 SaaS 아키텍처**로 전환하여 개발 생산성을 높이십시오.

---

## 5. 버전 정보 (2025-12-19 기준)

| 항목              | 버전  |
| :---------------- | :---- |
| Better Auth Latest | 1.4.7 |

> **참조:** [Better Auth Changelogs](https://www.better-auth.com/changelogs)
