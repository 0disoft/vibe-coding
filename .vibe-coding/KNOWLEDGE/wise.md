# Wise 주요 변경 사항 요약 및 대응 전략 (2024-11 ~ 2025-11)

Wise Platform API는 **엔드포인트 버전(V2, V3)** 및 **규제 컴플라이언스(SCA, KYC)**를 중심으로 끊임없이 진화하고 있습니다. 2024년 11월부터 2025년 11월까지의 핵심 변화는 **프로필 및 카드 관리 기능의 모듈화**와 **규제 플로우의 표준화**에 집중되었습니다.

---

## 1. Executive Summary: 핵심 아키텍처 변화

| 영역 | 핵심 변경 (Critical Change) | 영향도 | 대체 전략 |
| :--- | :--- | :--- | :--- |
| **인증/SCA** | **SCA Enrolment & Verification 엔드포인트 Deprecated** (2025-10) | 매우 높음 | 새 **SCA Session** 기반 플로우로 전면 마이그레이션. |
| **프로필/카드** | **V1/V2 엔드포인트 V2/V3로 전환 강제** (2024-12~) | 높음 | 개인/비즈니스 프로필 수정 호출을 V2로 전환. 카드 전화번호 관리를 **프로필** 리소스로 이관. |
| **웹훅/상태** | `cards#transaction-state-change`에 **잔액 변동**(`balance_movements`) 필드 추가 (2024-12) | 중간 | 카드 거래 파싱 로직 및 DB 스키마 업데이트 필수. |
| **데이터 모델** | `KYC Review` 리소스 `triggerReference` → `triggerReferences`로 필드 이름 변경 (2025-03) | 중간 | 웹훅 파서의 **필드명 업데이트** 및 복수 레퍼런스 처리 로직 구현. |
| **규제/테스트** | **KYC/Profile 시뮬레이션 엔드포인트** 추가 (2025-07) | 중간 | 온보딩/KYC 플로우 자동 테스트 파이프라인 구축. |

---

## 2. Critical Action Items: 마이그레이션 필수 점검

### 2-1. SCA (강력한 고객 인증) 플로우 전환 (2025-10-10)

기존의 복잡했던 SCA 인롤먼트 및 검증 엔드포인트가 **단일 SCA Session 플로우**로 통합되었습니다.

* **Deprecated:** 기존 SCA enrolment, verification 엔드포인트 일체.
* **Replacement:** 새로운 `Create SCA session` 엔드포인트를 SCA 시작점으로 사용.
* **Action:** 고위험 API 호출 전에 **One-Time Token**을 발행하고, PIN, Face Map 등 챌린지 플로우를 통합하는 새로운 SCA 설계 기준으로 백엔드 로직을 전면 재작성해야 합니다.

### 2-2. 프로필/카드 관리 모듈화 (2024-12월, 2025-03월)

카드 관련 정보 관리가 **프로필 리소스**로 이관되며 API 간 경계가 명확해졌습니다.

* **프로필 엔드포인트 전환:** 개인/비즈니스 프로필 업데이트 호출(V1)을 **V2 엔드포인트**(`update personal/business profiles` V2)로 마이그레이션하십시오.
* **카드 전화번호 관리 분리:** 카드 리소스에서 전화번호를 직접 수정하던 API(`update-phone-number`)가 폐기되었습니다. 카드 소지자 연락처는 **프로필 리소스 엔드포인트**를 통해 관리하십시오.
* **카드 주문 필드 정리:** `/card-order` 요청의 `billingAddress` 필드를 **`address`** 필드로 변경하십시오.

### 2-3. 웹훅 스키마 업데이트 (2024-12월, 2025-03월)

웹훅 페이로드에 새로운 필드가 추가되거나 기존 필드가 교체되었습니다.

* **새 필드 처리:** `cards#transaction-state-change` 웹훅의 **`balance_movements`** 필드를 처리하도록 파서를 업데이트하십시오. 잔액 이동 기록을 저장하여 내부 원장 검증(Reconciliation)을 강화하십시오.
* **Deprecation 처리:** `cards#transaction-state-change` 웹훅의 `purge_timestamp` 필드를 **`data.purge_time`** 필드로 교체하십시오.

### 2-4. 규제 준수 및 테스트 강화

* **Originator Legal Entity Type:** 송금 시 송신자의 법적 주체(개인/법인)를 명시하는 `originatorLegalEntityType` 필드를 송금 요청에 추가하십시오. (2025-09-08)
* **테스트 자동화:** **KYC/Profile 시뮬레이션 엔드포인트**를 활용하여 온보딩 및 검증 플로우에 대한 자동화된 E2E 테스트 시나리오를 구축하십시오. (2025-07-24)

---

## 3. Strategic Adoption: 도입해야 할 신규 패턴

* **`externalCustomerId`:** 프로필 생성 시 자체 고객 ID를 `externalCustomerId` 필드에 저장하십시오. Wise 프로필과 내부 DB 레코드를 연결하는 공식 매핑 키로 활용하여 향후 감사 및 동기화 작업을 단순화할 수 있습니다. (2025-02-14)
* **가격 비교:** `/v4/comparisons` 엔드포인트에 `includeWise` 파라미터를 활용하여 Wise 자체 환율을 비교 목록에 포함하거나 제외하는 로직을 제어하십시오. (2025-03-17)

---

## 4. Conclusion

Wise Platform API는 **고도화된 카드 제어**와 **SCA 표준 플로우의 강제**를 통해 금융 서비스 플랫폼으로서의 안정성을 높였습니다. **SCA 엔드포인트 마이그레이션**과 **프로필/카드 관리 기능의 분리**를 최우선 과제로 진행하고, **KYC 시뮬레이션**을 활용하여 규제 플로우에 대한 자동화된 검증 시스템을 구축하십시오.
