# Resend Node SDK: 2024년 11월 ~ 2025년 12월 주요 아키텍처 변화 및 마이그레이션 가이드

2024년 11월부터 2025년 12월까지 Resend Node SDK는 **v6.x 메이저 라인**을 통해 **'API 관리 기능의 SDK 통합'**과 **'첨부 파일 및 응답 타입의 정교화'**에 집중했습니다. 특히 v5.0.0과 v6.0.0은 첨부 파일 필드와 React Email 의존성 설계에 브레이킹 체인지를 유발한 핵심 분기점입니다.

---

## 1. Executive Summary: 핵심 아키텍처 변화 (v4.x → v6.x)

| 버전 | 릴리즈 시기 | 핵심 아키텍처 변화 (Architectural Impact) | 영향도 |
| :--- | :--- | :--- | :--- |
| **v5.0.0** | '25.08 | **Dependency:** `@react-email/render`를 필수 peerDependency에서 선택적으로 변경. | 높음 |
| **v6.0.0** | '25.08 | **Breaking Naming:** 첨부 파일 `inlineContentId` → **`contentId`**로 이름 변경. | 높음 |
| **v6.1.0** | '25.09 | **Ops API:** `emails.list` 및 pagination 지원. Batch Permissive Mode 추가. | 중간 |
| **v6.2.0** | '25.10 | **Security:** **Webhook 검증(verify)** 기능 SDK에 통합. `suspended_api_key` 등 에러 타입 확장. | 높음 |
| **v6.4.0** | '25.10 | **Observability:** 모든 응답에 HTTP 헤더 반환. Contact/Domain 관리 API 정돈. | 중간 |

---

## 2. Critical Action Items: 코드 및 의존성 필수 점검

### 2-1. 첨부 파일 필드 이름 변경 (v6.0.0)

인라인 첨부 파일을 사용하는 코드는 반드시 필드 이름을 변경해야 합니다.

* **Deprecated:** 첨부 파일 객체의 **`inlineContentId`**
* **Replacement:** **`contentId`**
* **Action:** v6.0.0 이상으로 업그레이드할 때 첨부 파일을 전송하는 모든 코드를 찾아 `contentId`로 일괄 치환해야 합니다.

### 2-2. Webhook 검증 로직 통합 (v6.2.0, v6.3.0)

Webhook의 위변조 방지(Integrity)를 위해 SDK의 내장 검증 기능을 사용해야 합니다.

* **Action:** Webhook 핸들러 로직에서 외부 라이브러리나 수동 로직 대신, SDK의 **`resend.webhooks.verify({ body, signature, secret })`** 메서드를 사용하여 서명을 검증하십시오. 이는 보안을 강화하고 코드를 표준화합니다.

### 2-3. React Email 의존성 정리 (v5.0.0)

* **React 미사용 프로젝트:** `react` 템플릿을 사용하지 않는 경우, v5.0.0 이후 `resend`를 재설치하여 `@react-email/render`에 대한 불필요한 의존성 흔적을 **lockfile에서 제거**하십시오.
* **React 사용 프로젝트:** `@react-email/render`를 **명시적으로 설치**하십시오. v6.1.2 이후로 특정 버전에 묶이지 않아 호환성이 개선되었습니다.

### 2-4. 운영 및 에러 핸들링 강화

* **Emails List 및 Pagination (v6.1.0):** 관리자 패널이나 백엔드 시스템에서 메일 발송 내역을 조회하는 코드를 `emails.list({ page, limit })` 기반으로 리팩토링하여 페이징을 구현하십시오.
* **에러 타입 분기:** `ErrorResponse` 타입에 `statusCode` 필드(v6.2.1)가 추가되었습니다. 에러 핸들링 로직에서 상태 코드를 타입 안전하게 사용하여, `suspended_api_key` 등 새로운 에러 타입에 대한 분기 처리를 구현하십시오.

---

## 3. Strategic Adoption: 도입해야 할 신규 패턴

* **Batch Permissive Mode (v6.1.0):** 대량 메일 발송(batch) 시 `permissive` 옵션을 활성화하여, 일부 잘못된 수신자가 있어도 나머지 발송은 계속 진행되도록 제어할 수 있습니다.
* **Contacts 세그먼트 (v6.4.2):** `contacts.list({ segmentId })` API를 활용하여 특정 세그먼트의 연락처만 조회하십시오. CRM 및 마케팅 자동화 파이프라인에서 고객 목록 관리가 효율화됩니다.
* **도메인 Capability (v6.5.0):** 멀티 테넌트 SaaS 환경에서 고객의 도메인 상태(DNS, DKIM, SPF 등)를 SDK를 통해 조회/관리하는 기능을 구현하여, 고객 대시보드에 **도메인 연결 상태**를 실시간으로 제공하십시오.

---

## 4. Conclusion

Resend SDK v6.x 시대의 핵심은 **Webhook 검증의 통합**과 **운영 관찰 기능의 강화**입니다. **`contentId`로의 필드명 변경**과 **Webhook verify**를 최우선으로 반영하고, **contacts 및 도메인 관리 API**를 활용하여 메일 인프라의 관리 용이성을 극대화하십시오.
