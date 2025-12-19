# Drizzle ORM (문서 갱신: 2025-12-19)

---

## 1. Executive Summary: 버전별 핵심 아키텍처 변화

| 버전        | 릴리즈 시기 | 핵심 아키텍처 변화 (Paradigm Shift)                                                                       |
| :---------- | :---------- | :-------------------------------------------------------------------------------------------------------- |
| **v0.36.x** | '24.11      | **SQL Completeness:** `UPDATE FROM`, `INSERT SELECT` 등 복잡한 DML 패턴을 지원하여 Raw SQL 의존도 감소.   |
| **v0.43.0** | '25.04      | **Join Strategy:** `CROSS/LATERAL JOIN` 공식 지원 및 MySQL `FULL JOIN` API 제거를 통한 엄격한 스펙 준수.  |
| **v0.44.0** | '25.05      | **Ops Integration:** 표준화된 에러 객체(`DrizzleQueryError`)와 내장 캐시 인터페이스 도입.                 |
| **v0.44.6** | '25.10      | **API Surface:** `$replicas` 레퍼런스 추가로 기존 `withReplicas()` 기반 Read Replica 접근성 개선.         |
| **v0.45.1** | '25.12      | **Latest:** 최신 안정 버전 (npm 기준 2025-12-10 배포). 0.44.7 이후 버그 픽스 및 안정화 포함.              |

> [!NOTE]
> Read Replica 라우팅의 핵심은 `withReplicas()` + `$primary` 패턴이며, v0.44.6의 `$replicas`는 해당 기능의 표면 확장입니다.

---

## 2. Critical Action Items: 마이그레이션 필수 점검

### 2-1. 쿼리 패턴 리팩토링 (Query Refactoring)

- **MySQL `FULL JOIN` 제거 대응 (v0.43.0):** MySQL 드라이버 사용 시 `.fullJoin()` 호출 코드는 TypeScript에서 빌드/타입 에러(메서드 미존재)로 차단됩니다. JavaScript나 `any` 타입 우회 시에는 런타임 에러가 발생할 수 있으므로 `LEFT JOIN` + `UNION` 패턴으로 변경하거나 애플리케이션 로직으로 조인을 처리하도록 수정하십시오.
- **복잡한 DML의 ORM 이관 (v0.36.3):** 데이터 마이그레이션이나 배치 작업에서 Raw SQL로 작성하던 `INSERT ... SELECT` 또는 `UPDATE ... FROM` 구문을 Drizzle API로 전환하여 타입 안전성을 확보하십시오.

### 2-2. 운영 안정성 확보 (Operational Stability)

- **에러 핸들링 표준화 (v0.44.0):** `try-catch` 블록에서 드라이버별 에러(PostgresError 등)를 잡던 로직을 `DrizzleQueryError`를 처리하도록 변경하십시오. 실행된 SQL과 파라미터 정보까지 포함되므로 디버깅 효율이 비약적으로 상승합니다.
- **캐시 전략 도입 (v0.44.0):** 반복적인 읽기 쿼리에 대해 `drizzle-orm/cache` 모듈을 적용하십시오. Upstash 등의 외부 캐시와 연동하여 DB 부하를 줄이는 아키텍처를 ORM 설정만으로 구현할 수 있습니다.

### 2-3. 인프라 확장 대응 (Infrastructure Scaling)

- **Read Replica 라우팅 (v0.44.6+):** 읽기 부하 분산이 필요한 경우, 기존 `withReplicas()` 패턴과 함께 `$replicas` 레퍼런스를 활용하여 코드 레벨에서 읽기 트래픽을 제어하십시오. 강제 primary 접근 시에는 `$primary`를 사용합니다.

---

## 3. Strategic Adoption: 도입해야 할 신규 패턴

### 3-1. Identity 컬럼 제어

데이터 이관 시 `GENERATED ALWAYS AS IDENTITY` 컬럼에 값을 강제로 주입해야 한다면 `overridingSystemValue()` 메서드를 사용하십시오. (v0.36.4)

### 3-2. Per-Request 인증

Neon 등의 서버리스 DB 사용 시, 요청마다 다른 인증 토큰을 사용해야 한다면 `.$withAuth(token)` 메서드를 활용하여 멀티 테넌트 환경에서의 보안을 강화하십시오. (v0.36.4)

---

## 4. Conclusion

Drizzle ORM v0.36~0.45 구간은 "SQL 빌더에서 완전한 데이터 접근 계층(DAL) 솔루션"으로의 도약을 보여줍니다. 기존 시스템의 안정성을 위해 v0.43.0의 Breaking Change(MySQL Full Join)를 우선 점검하고, **캐시 및 에러 핸들링 기능**을 적극 도입하여 운영 효율성을 높이는 전략을 수립하십시오.

---

## 5. References

- [GitHub Releases: drizzle-orm](https://github.com/drizzle-team/drizzle-orm/releases)
- [Drizzle ORM Docs: Read Replicas](https://orm.drizzle.team/docs/read-replicas)
