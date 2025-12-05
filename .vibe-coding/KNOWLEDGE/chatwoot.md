# Chatwoot: 2024년 11월 ~ 2025년 11월 주요 아키텍처 변화 및 마이그레이션 가이드

Chatwoot은 2024년 11월부터 2025년 11월까지 **v4.x 메이저 릴리스**를 통해 **'AI 기반 운영 자동화(Captain)'**와 **'엔터프라이즈급 통합(SAML, 2FA, ElasticSearch)'**에 집중했습니다. 이 과정에서 **PostgreSQL `pgvector` 의존성이 강제**되었고, **v3 UI가 완전히 제거**되어 기존 설치 환경에 대규모 마이그레이션 압박을 가했습니다.

---

## 1. Executive Summary: 핵심 아키텍처 변화 (v4.0.0 → v4.8.0)

| 버전 | 핵심 마일스톤 | 아키텍처 영향 (Architectural Impact) | 영향도 |
| :--- | :--- | :--- | :--- |
| **v4.0.0 (pre)** | **pgvector Mandatory** | **[DB Layer]** AI 기능 도입을 위해 Postgres에 `pgvector` 확장이 필수화. (인프라 변경 필수) | 매우 높음 |
| **v4.4.0** | **v3 UI Removal** | **[Breaking Change]** v3 레거시 UI 코드가 완전히 제거. 모든 사용자 정의 스크립트 무효화. | 매우 높음 |
| **v4.5.0** | **External Integration** | **[Automation]** `conversation_resolved` 트리거, Slack 다중 첨부, Captain OpenAI 커스텀 엔드포인트 지원. | 높음 |
| **v4.6.0** | **Compliance** | **[Security/Auth]** 2FA, SAML 지원 도입 및 ElasticSearch 기반 고급 검색 활성화. | 중간 |
| **v4.7.0** | **Widget Security** | **[Security/Deploy]** 위젯 허용 도메인 관리 UI 추가. (프론트 배포 보안 강화) | 중간 |
| **v4.8.0** | **Email Ingress** | **[Channel Ops]** SES `email ingress` 지원. 인바운드 이메일 수신 경로 단순화. | 중간 |

---

## 2. Critical Action Items: 인프라 및 통합 필수 점검

### 2-1. 인프라 마이그레이션 (v4.0.0+)

* **pgvector 설치 의무화:** Chatwoot v4 이상을 사용하려면 **PostgreSQL에 `pgvector` 확장**이 설치되어 있어야 합니다. Cloud/RDS 환경 또는 자체 호스팅 DB에서 해당 확장 설치를 확인하거나 `CREATE EXTENSION IF NOT EXISTS vector;`를 실행하십시오.
* **v3 UI 폐기 대응 (v4.4.0):** v4.3.0 이후 v3 UI는 완전히 제거되었습니다. v3 DOM 구조에 의존하여 작성된 **커스텀 CSS, JavaScript, 브라우저 확장** 등은 모두 v4 UI 기준으로 재작성해야 합니다.

### 2-2. 메시지 및 이벤트 통합

* **단일 스레드 옵션 (v3.16.0):** API 채널로 메시지를 보낼 때, 채널 설정에서 **단일 스레드 옵션**을 활성화하여 동일 발신자의 여러 이벤트가 하나의 Conversation으로 묶이도록 라우팅 전략을 변경하십시오.
* **위젯 이벤트 후킹 (v4.2.0):** 웹 위젯이 열리고 닫힐 때 발생하는 `chatwoot:opened`, `chatwoot:closed` 이벤트를 프론트엔드 코드에서 후킹하여 **분석 이벤트 전송**이나 **프론트엔드 UI 연동** 로직을 구현하십시오.
* **Message Status API (v4.2.0):** 메시지의 배달/읽음 상태를 외부 시스템에서 Chatwoot으로 동기화해야 할 경우, 신규 Message Status 업데이트 API를 활용하여 통합 로직을 구현하십시오.

### 2-3. 운영 및 자동화 강화

* **Automation Rule 확장:** `conversation_resolved` 이벤트(v4.5.0)를 트리거로 사용하여, 대화 종료 시 고객 설문 발송, CRM 상태 업데이트 등 후처리 자동화 로직을 구성하십시오.
* **LLM 엔드포인트 커스텀 (v4.5.0):** Captain의 LLM 백엔드를 자체 호스팅 LLM이나 Azure OpenAI 등 **OpenAI 호환 API**로 변경하여, AI 운영 전략을 유연하게 가져갈 수 있습니다.

---

## 3. Strategic Adoption: 도입해야 할 신규 패턴

* **Captain Custom Instructions (v4.2.0):** Captain 설정에 **대화 톤, 정책, 응답 규칙** 등을 정의하는 커스텀 인스트럭션을 추가하여 AI 응답의 품질과 일관성을 확보하십시오.
* **SES Ingress (v4.8.0):** AWS SES를 사용하는 경우, Inbound E-mail Flow를 SES → Chatwoot 엔드포인트로 직접 연결하는 **SES email ingress** 방식을 도입하여 SMTP 설정의 복잡성을 줄이고 수신 안정성을 높이십시오.
* **위젯 보안 설정 (v4.7.0):** 위젯 허용 도메인 관리 UI를 활용하여, 위젯 SDK가 로드될 수 있는 도메인 리스트를 명시적으로 관리함으로써 **위젯 스크래핑**과 **오용**을 방지하십시오.

---

## 4. Conclusion

Chatwoot v4.x는 **pgvector 의무화**를 통한 AI 기능의 기반 마련과 **v3 UI 제거**를 통한 아키텍처 정리가 핵심입니다. **pgvector 설치**를 최우선으로 완료하고, **위젯 이벤트 및 Message Status API**를 활용하여 Chatwoot과 외부 애플리케이션 간의 통합 완성도를 높이십시오.
