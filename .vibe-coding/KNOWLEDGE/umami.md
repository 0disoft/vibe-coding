# Umami v3.0.0 실무 대응 전략 리포트 (2024.11 - 2025.12)

Umami는 2024년 11월부터 2025년 12월까지 **v3.0.0 메이저 릴리스**를 통해 **'데이터베이스의 PostgreSQL 강제 전환'**과 **'마케팅 자동화 기능(Segments, Pixels, Links)의 도입'**이라는 대규모 아키텍처 변화를 단행했습니다. v3.0.0을 기점으로 MySQL 지원이 종료되고, 리포트 구조가 URL 쿼리스트링 기반으로 통합되는 등 기존 v2 사용 환경에 직접적인 마이그레이션 압박이 가해졌습니다.

---

## 1. Executive Summary: v3.0.0 마이그레이션 핵심 (2025년 11월)

| 버전 | 핵심 아키텍처 변화 (Architectural Impact) | 영향도 |
| :--- | :--- | :--- |
| **v2.14.0** | **Hash Routing Support:** 해시 기반 라우팅 지원. SPA의 페이지뷰 정확성 향상. | 중간 |
| **v2.17.0** | **Privacy & Filtering:** DNT(Do Not Track) 존중 및 URL 해시 제외 옵션 도입. | 중간 |
| **v2.19.0** | **Data Preparation:** Revenue 전용 테이블 스키마 도입. v3 마이그레이션 기반 마련. | 높음 |
| **v3.0.0** | **Postgres Mandatory:** **MySQL 지원 공식 종료.** Postgres로 데이터베이스 전환 강제. | 매우 높음 |
| | **BI Integration:** Segments, Cohorts, Filters의 **URL 쿼리스트링 통합**. 딥링크 자동화. | 높음 |
| | **Marketing Tools:** Links(단축 URL), Pixels(이메일/외부 트래킹) 엔티티 추가. | 중간 |

---

## 2. Critical Action Items: 인프라 및 코드 필수 점검

### 2-1. 데이터베이스 전환 (v3.0.0)

* **MySQL EOL (End-of-Life):** Umami v3 이상을 사용하려면 **반드시 PostgreSQL**로 데이터베이스를 전환해야 합니다. 공식 `scripts/data-migrations`를 따라 데이터를 마이그레이션하십시오. 장기적인 운영 안정성을 위해 v3.0.1 이상 사용을 권장합니다.
* **`DATABASE_URL` 수정:** 환경 변수의 포맷을 `postgresql://...`로 변경하고, 마이그레이션 스크립트를 통해 v2에서 쌓인 revenue 데이터(v2.19.0)를 새 스키마에 이관해야 합니다.

### 2-2. 트래킹 및 프라이버시 (Tracker & Privacy)

* **프라이버시 옵션 적용:** 개인 정보 보호 정책을 준수하는 서비스라면 v2.17.0 이상에서 도입된 다음 옵션을 트래킹 스니펫에 추가하십시오.
  * `data-do-not-track="true"`: 브라우저 DNT 설정을 존중하여 트래킹 동작을 제어.
  * `data-exclude-hash="true"`: SPA의 해시 라우팅(`/#/path`)으로 인한 페이지뷰 폭발을 방지.
* **Revenue 이벤트 일관성:** 커스텀 이벤트 속성(properties)을 기반으로 Revenue 리포트(v2.14.0)를 활용할 경우, `revenue`, `currency` 등 속성 네이밍을 일관되게 유지하여 BI 분석의 정확성을 확보하십시오.

### 2-3. 자동화 및 리포트 공유

* **URL 기반 필터 활용 (v3.0.0):** v3의 모든 필터는 URL 쿼리스트링으로 표현됩니다. 내부 관리 툴이나 슬랙 봇 등에서 Umami 리포트 링크를 생성할 때, 쿼리 파라미터를 조합하여 **정확히 필터링된 리포트**를 공유하도록 자동화하십시오.
* **픽셀 트래킹 도입:** 이메일 마케팅이나 외부 CMS 환경에 `Pixels` 엔티티의 URL을 삽입하여, 웹사이트 스크립트 삽입 없이도 트래킹 범위를 확장하십시오.

---

## 3. Strategic Adoption: 도입해야 할 신규 패턴

* **Segments & Cohorts:** 필터 프리셋(Segment)과 사용자 집단 분석(Cohort) 기능을 활용하여, 데이터 추출을 자동화하고 마케팅 효율성 분석에 집중하십시오.
* **Channels 리포트:** 트래커에 `utm_source`, `utm_medium` 등 **UTM 파라미터**를 일관되게 적용하여, Umami의 Channels 리포트(v2.18.0)에서 트래픽 채널별 성과를 정확하게 측정하십시오.

---

## 4. Conclusion

Umami v3.0.0은 **Postgres 강제 전환**이라는 큰 비용을 요구하지만, 그 대가로 **Segments, Cohorts, Links**와 같은 강력한 마케팅 및 분석 기능을 제공합니다. 기존 MySQL 사용자는 **v2.19.0에서 데이터 마이그레이션을 준비**하고, v3.0.1 이상으로 업데이트하여 리포트 자동화 및 프라이버시 강화 옵션을 즉시 활용하십시오.
