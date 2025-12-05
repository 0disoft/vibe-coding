# Drizzle ORM 아키텍처 리포트: v0.36 - v0.44

2024년 말부터 2025년 말까지 Drizzle ORM은 **'복잡한 SQL 패턴의 내재화'**와 **'프로덕션 운영 기능(캐시/에러/복제)의 강화'**라는 두 가지 축으로 발전했습니다. 단순히 쿼리를 쉽게 짜는 도구를 넘어, 엔터프라이즈 환경에서 필수적인 인프라스트럭처 통합 기능을 ORM 레벨로 흡수한 것이 특징입니다.

본 리포트는 해당 기간의 변경 사항을 분석하여, 실무에서 즉시 적용 가능한 아키텍처 전략과 마이그레이션 포인트를 제시합니다.

---

## 1. Executive Summary: 버전별 핵심 아키텍처 변화

| 버전 | 릴리즈 시기 | 핵심 아키텍처 변화 (Paradigm Shift) |
| :--- | :--- | :--- |
| **v0.36.x** | '24.11 | **SQL Completeness:** `UPDATE FROM`, `INSERT SELECT` 등 복잡한 DML 패턴을 지원하여 Raw SQL 의존도 감소. |
| **v0.43.0** | '25.04 | **Join Strategy:** `CROSS/LATERAL JOIN` 공식 지원 및 MySQL `FULL JOIN` API 제거를 통한 엄격한 스펙 준수. |
| **v0.44.0** | '25.05 | **Ops Integration:** 표준화된 에러 객체(`DrizzleQueryError`)와 내장 캐시 인터페이스 도입. |
| **v0.44.6** | '25.10 | **Scale-Out:** 읽기 전용 복제본(Read Replica) 라우팅을 위한 `$replicas` API 추가. |

---

## 2. Critical Action Items: 마이그레이션 필수 점검

### 2-1. 쿼리 패턴 리팩토링 (Query Refactoring)

* **MySQL `FULL JOIN` 제거 대응 (v0.43.0):** MySQL 드라이버 사용 시 `.fullJoin()` 호출 코드는 런타임 에러를 유발할 수 있습니다. `LEFT JOIN` + `UNION` 패턴으로 변경하거나 애플리케이션 로직으로 조인을 처리하도록 수정하십시오.
* **복잡한 DML의 ORM 이관 (v0.36.3):** 데이터 마이그레이션이나 배치 작업에서 Raw SQL로 작성하던 `INSERT ... SELECT` 또는 `UPDATE ... FROM` 구문을 Drizzle API로 전환하여 타입 안전성을 확보하십시오.

### 2-2. 운영 안정성 확보 (Operational Stability)

* **에러 핸들링 표준화 (v0.44.0):** `try-catch` 블록에서 드라이버별 에러(PostgresError 등)를 잡던 로직을 `DrizzleQueryError`를 처리하도록 변경하십시오. 실행된 SQL과 파라미터 정보까지 포함되므로 디버깅 효율이 비약적으로 상승합니다.
* **캐시 전략 도입 (v0.44.0):** 반복적인 읽기 쿼리에 대해 `drizzle-orm/cache` 모듈을 적용하십시오. Upstash 등의 외부 캐시와 연동하여 DB 부하를 줄이는 아키텍처를 ORM 설정만으로 구현할 수 있습니다.

### 2-3. 인프라 확장 대응 (Infrastructure Scaling)

* **Read Replica 라우팅 (v0.44.6):** 읽기 부하 분산이 필요한 경우, 별도의 프록시나 복잡한 커넥션 풀 설정 대신 `$replicas` API를 활용하여 코드 레벨에서 읽기 트래픽을 제어하십시오.

---

## 3. Strategic Adoption: 도입해야 할 신규 패턴

### 3-1. Identity 컬럼 제어

데이터 이관 시 `GENERATED ALWAYS AS IDENTITY` 컬럼에 값을 강제로 주입해야 한다면 `overridingSystemValue()` 메서드를 사용하십시오. (v0.36.4)

### 3-2. Per-Request 인증

Neon 등의 서버리스 DB 사용 시, 요청마다 다른 인증 토큰을 사용해야 한다면 `.$withAuth(token)` 메서드를 활용하여 멀티 테넌트 환경에서의 보안을 강화하십시오. (v0.36.4)

---

## 4. Conclusion

Drizzle ORM v0.36~0.44 구간은 "SQL 빌더에서 완전한 데이터 접근 계층(DAL) 솔루션"으로의 도약을 보여줍니다. 기존 시스템의 안정성을 위해 v0.43.0의 Breaking Change(MySQL Full Join)를 우선 점검하고, **캐시 및 에러 핸들링 기능**을 적극 도입하여 운영 효율성을 높이는 전략을 수립하십시오.
