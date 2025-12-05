# GlitchTip v5.x 실무 대응 전략 리포트 (2024.11 - 2025.12)

요청 기간(2024-11-13 ~ 2025-12-03) 동안 GlitchTip은 **v5.0** 및 **v5.2** 메이저 릴리스를 통해 **'보안 및 컴플라이언스 강화'**와 **'운영 토폴로지의 유연화'**에 집중했습니다. 특히 Postgres 버전 요구사항 상향과 Strict CSP 기본 적용은 기존 self-host 환경에 직접적인 마이그레이션 압박을 가했습니다.

---

## 1. Executive Summary: 핵심 아키텍처 변화 (v5.0, v5.1, v5.2)

| 버전 | 릴리스 시기 | 핵심 아키텍처 변화 (Architectural Impact) |
| :--- | :--- | :--- |
| **v5.0** | '25.05 | **Postgres 14 Mandatory:** Postgres 13 지원 종료 및 Django 5.2로의 업그레이드. (브레이킹 변경) |
| | | **Data Integrity:** 이슈 병합 기능 도입. 다수의 근본 원인 이슈 관리 단순화. |
| **v5.1** | '25.08 | **Strict CSP Default:** `unsafe-inline` 제거. Strict CSP 기본 적용으로 XSS 공격 표면 최소화. |
| | | **Security Hardening:** DB 사용자 롤 하드닝 지원. (운영 보안 강화) |
| **v5.2** | '25.11 | **Micro-Topology:** **Postgres-only 모드** 지원. Valkey(Redis) 없이 DB 단일 구성 가능. |
| | | **Auth Control:** 소셜 로그인 전용 회원가입 설정(`ENABLE_SOCIAL_APPS_USER_REGISTRATION`) 추가. |

---

## 2. Critical Action Items: 인프라 및 보안 점검

### 2-1. 데이터베이스 마이그레이션 (v5.0)

* **Postgres 14+ 업그레이드 필수:** GlitchTip 5.0 이상을 사용하려면 운영 데이터베이스를 **Postgres 14 이상**으로 업그레이드해야 합니다. 기존 Postgres 13 환경은 DB 덤프/복원 절차가 요구됩니다.
* **마이그레이션 경로:** GlitchTip 3.x 버전을 사용 중이라면, **최소 4.x 버전을 거친 후 5.0으로 단계적 업그레이드**가 필수입니다. 3.x → 5.0 직행은 지원되지 않습니다.

### 2-2. 보안 및 프록시 설정 (v5.1)

* **Strict CSP 대응:** GlitchTip UI에 인라인 스타일이나 스크립트를 주입하는 **브랜딩/커스텀 코드가 있다면 차단**될 수 있습니다. `5.1` 업그레이드 후 브라우저 개발자 도구에서 CSP 위반이 발생하는지 확인하고, 외부 CSS/JS 파일 로딩으로 전환하십시오.
* **DB Role 최소화:** 인프라 관리 코드(Terraform, Helm values)에서 DB 연결 계정의 권한을 최소화(least privilege)하여, 읽기/쓰기/마이그레이션 전용 롤로 분리하는 작업을 검토하십시오.

### 2-3. 운영 토폴로지 유연화 (v5.2)

* **Postgres-only 모드 검토:** 저사양 서버(VPS)에 GlitchTip을 셀프 호스트하는 경우, `VALKEY_URL`을 비워두는 **Postgres-only 모드**를 활용하여 메모리 사용량을 최소화할 수 있습니다. (단, 고부하 프로덕션 환경에서는 Valkey를 사용하는 것이 성능상 유리합니다.)
* **인증 채널 분리:** 소셜 로그인(SSO)만 허용하고 이메일 가입을 차단하는 `ENABLE_SOCIAL_APPS_USER_REGISTRATION` 옵션을 활용하여, 사내 보안 정책에 맞는 회원가입 플로우를 강제하십시오.

---

## 3. Strategic Recommendations

* **이슈 병합 활용 (v5.0):** 여러 관련 이슈를 하나로 묶는 기능을 도입하여 알림 중복을 줄이고, 근본 원인에 대한 집중적인 분석을 용이하게 하십시오.
* **운영 환경 설정:** Helm 차트 v6.0에서는 Postgres/Valkey의 Bitnami 차트 의존성이 제거되었습니다. Helm을 사용하는 경우, 차트 업그레이드 시 DB 의존성 목록을 반드시 확인하십시오.

GlitchTip v5.0+는 보안과 운영 효율성 측면에서 큰 도약을 이뤘습니다. **Postgres 14+로의 업그레이드**를 최우선으로 완료하고, **Strict CSP**를 기본 방어선으로 설정하는 것이 이번 마이그레이션의 핵심 목표입니다.
