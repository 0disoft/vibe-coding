# Cloudflare D1 Architecture Report: 2024-2025

2024년 말부터 2025년 말까지 Cloudflare D1의 발전 방향은 \*\*'글로벌 스케일의 읽기 성능 최적화'\*\*와 \*\*'엔터프라이즈급 권한 및 데이터 통제 강화'\*\*로 정의됩니다. 알파 단계의 잔재를 청산하고, 글로벌 서비스 운영에 필수적인 복제(Replication)와 데이터 주권(Data Residency) 기능을 완성했습니다.

본 리포트는 해당 기간의 변경 사항을 분석하여, 실무에서 즉시 적용해야 할 아키텍처 전략과 운영 가이드를 제시합니다.

-----

## 1. Executive Summary: 핵심 아키텍처 변화

| 시기 | 핵심 마일스톤 | 아키텍처 영향 (Architectural Impact) |
| :--- | :--- | :--- |
| **'25.04** | **Global Read Replication** | **[Performance]** 읽기 트래픽을 사용자 근거리 리전으로 분산. `Sessions API`를 통해 분산 환경에서의 정합성(Consistency) 문제 해결. |
| **'25.05** | **Strict Permission Model** | **[Security]** `D1:Read` 권한의 쓰기 허용 버그 수정. HTTP API 및 UI 접근 제어 모델이 문서와 일치하도록 엄격화. |
| **'25.11** | **Jurisdiction Control** | **[Compliance]** 데이터 저장 및 실행 위치를 특정 지역(EU 등)으로 강제할 수 있는 `jurisdiction` 옵션 도입. |

-----

## 2. Critical Action Items: 운영 및 코드 필수 점검

### 2-1. 권한 및 보안 (Permissions & Security)

* **API 토큰 전수 조사:** 2025년 5월 패치로 인해, `D1:Edit` 권한 없이 쓰기 작업을 수행하던 기존 토큰은 모두 차단됩니다. CI/CD 파이프라인이나 백엔드 서비스에서 사용하는 토큰 권한을 확인하고, 쓰기 작업이 필요하다면 명시적으로 `Edit` 권한을 부여하십시오.
* **알파 백업 폐기:** 2025년 7월부로 알파 DB 백업에 대한 접근이 완전히 차단되었습니다. 레거시 마이그레이션 스크립트를 정리하고, GA 버전 DB를 기준으로 백업 정책을 재수립하십시오.

### 2-2. 글로벌 아키텍처 및 성능 (Global Scale & Performance)

* **Read Replication 도입:** 읽기 중심의 글로벌 서비스라면 Read Replication을 활성화하십시오. 단, 데이터 정합성이 중요한 로직(예: 장바구니, 결제 직후 조회)에서는 `withSession` API와 북마크(Bookmark) 패턴을 사용하여 순차 일관성을 보장해야 합니다.

    ```ts
    // Bookmark Pattern Example
    const bookmark = req.headers.get("x-d1-bookmark");
    const session = env.DB.withSession(bookmark);
    const result = await session.prepare("SELECT ...").run();
    res.headers.set("x-d1-bookmark", session.getBookmark());
    ```

* **자동 재시도 전략 수정:** 2025년 9월부터 읽기 쿼리는 D1 레벨에서 자동 재시도됩니다. 클라이언트 측의 과도한 재시도 로직은 오히려 장애를 악화시킬 수 있으므로, 재시도 정책을 완화하고 `total_attempts` 메타데이터를 모니터링하여 인프라 상태를 파악하십시오.

### 2-3. 데이터 관리 및 규제 (Data Ops & Compliance)

* **Jurisdiction 설정:** GDPR 등 데이터 주권 요구사항이 있는 경우, DB 생성 시 `jurisdiction` 옵션을 사용하여 데이터가 물리적으로 저장될 위치를 고정하십시오. 이는 법적 리스크를 해소하는 아키텍처적 장치입니다.
* **Schema 최적화:** 대규모 데이터 변경이나 인덱스 작업 후에는 `PRAGMA optimize` 실행을 자동화된 마이그레이션 파이프라인의 마지막 단계로 추가하여 쿼리 플래너 통계를 최신화하십시오.

-----

## 3. Strategic Recommendations: 요금 및 운영 전략

* **Free Tier 모니터링:** 2025년 1월부터 무료 플랜 한도 초과 시 쿼리가 차단됩니다. 초기 스타트업이라도 트래픽 급증(Spike)에 대비해 최소 유료 플랜($5/mo)으로 시작하는 것이 서비스 가용성 측면에서 안전합니다.
* **스토리지 확장:** 유료 플랜의 스토리지 한도가 1TB로 상향되었습니다. 기존의 데이터베이스 샤딩(Sharding) 전략을 재검토하고, 불필요한 분할을 줄여 아키텍처 단순화를 꾀하십시오.

Cloudflare D1은 이제 단순한 서버리스 DB가 아닌, **위치 투명성과 데이터 주권을 동시에 보장하는 글로벌 데이터 계층**으로 진화했습니다. 이번 업데이트들을 통해 애플리케이션의 성능과 안정성을 한 단계 높일 수 있는 기회로 삼으십시오.
