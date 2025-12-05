# PostgreSQL Architecture Report: 18.0 & Security Hardening (2024-2025)

2024년 말부터 2025년 말까지 PostgreSQL의 진화 방향은 명확합니다. **'보안 및 권한 모델의 엄격화'**와 **'비동기 I/O 및 시간 기반 기능(Temporal/UUIDv7)의 내재화'**입니다.

특히 v18.0은 단순한 기능 추가를 넘어, 데이터베이스 엔진의 핵심 메커니즘(I/O, 인증, 트리거 실행 컨텍스트)을 재정의하는 메이저 업데이트이므로, 신규 프로젝트 및 마이그레이션 시 면밀한 아키텍처 검토가 요구됩니다.

---

## 1. Executive Summary: 핵심 변경 사항의 전략적 의미

1. **Strict Security Posture:** MD5 인증 폐기 예고 및 libpq quoting 함수의 무관용 정책(Zero-Tolerance) 도입은 레거시 시스템의 보안 부채 청산을 강제합니다.
2. **Engine Modernization (v18.0):** 비동기 I/O(AIO) 도입과 `uuidv7` 내장으로 대용량 트랜잭션 및 시계열 데이터 처리 성능의 구조적 개선을 이뤘습니다.
3. **Developer Experience:** `RETURNING OLD/NEW` 구문과 Virtual Generated Column 기본화는 애플리케이션 레벨의 복잡성을 DB 엔진으로 이관하여 코드 간소화를 돕습니다.

---

## 2. Critical Action Items: 마이그레이션 필수 점검

### 2-1. 인증 및 클라이언트 보안 (Authentication & Client)

* **MD5 퇴출:** v18부터 MD5 인증 설정 시 경고가 발생하며 향후 제거될 예정입니다. 모든 사용자 계정을 `scram-sha-256`으로 전환하고, 클라이언트 드라이버 호환성을 확인하십시오.
* **libpq Quoting Hardening:** `PQescapeString` 등의 함수가 잘못된 입력에 대해 에러를 반환하도록 변경되었습니다(CVE-2025-1094 대응). C 레벨 클라이언트 코드에서 해당 함수의 리턴값을 반드시 검증하도록 수정하거나, `PQexecParams` 사용을 표준화하십시오.

### 2-2. 권한 및 관리 스크립트 (Permissions & Ops)

* **스키마 권한 강화:** `CREATE STATISTICS` 실행 시 스키마에 대한 `CREATE` 권한이 필수화되었습니다. 자동화된 DDL 스크립트나 CI/CD 파이프라인의 권한 설정을 점검하십시오.
* **덤프 보안:** `pg_dump` 생성 스크립트에 `\restrict`가 포함되어 악의적인 메타 커맨드 실행을 차단합니다. 덤프 파일을 수동으로 조작하여 복원하는 워크플로우가 있다면 재검토가 필요합니다.

### 2-3. 쿼리 및 트랜잭션 로직 (Query & Transaction)

* **트리거 실행 컨텍스트 (v18.0):** `AFTER` 트리거가 커밋 시점이 아닌 큐 등록 시점의 ROLE 권한으로 실행됩니다. 복잡한 권한 위임(`SET ROLE`)을 사용하는 로직에서 의도치 않은 권한 오류가 발생할 수 있으므로 테스트가 필수적입니다.
* **VACUUM 동작 변경 (v18.0):** 상속 테이블에 대한 `VACUUM`이 자식 테이블까지 기본 포함됩니다. 특정 부모 테이블만 관리하려면 `VACUUM (ONLY)` 구문으로 명시적 변경이 필요합니다.

---

## 3. v18.0 New Capabilities: 아키텍처 개선 기회

### 3-1. 데이터 모델링 최적화

* **Temporal Constraints:** 기간(Period) 중복 방지 로직을 애플리케이션에서 DB 제약 조건(`EXCLUDE USING gist`)으로 이관하여 데이터 무결성을 보장하십시오.
* **Virtual Generated Columns:** 계산 비용이 낮고 읽기 빈도가 높은 파생 데이터는 Virtual 컬럼으로 정의하여 디스크 공간을 절약하십시오. (저장 공간 최적화 vs CPU 사용량 트레이드오프 고려)
* **UUIDv7:** 시계열 데이터의 인덱스 성능 향상을 위해 별도 라이브러리 없이 내장 `uuidv7()` 함수를 PK 생성 전략으로 채택하십시오.

### 3-2. 쿼리 패턴 단순화

* **RETURNING OLD/NEW:** `UPDATE/DELETE` 후 변경 전후 데이터를 동시에 조회해야 하는 감사(Audit) 로직이나 이벤트 소싱 패턴 구현 시, 불필요한 트리거 생성을 제거하고 단일 쿼리로 처리하십시오.

---

## 4. Conclusion

PostgreSQL 18.0 및 관련 마이너 버전들은 "더 엄격하고, 더 똑똑한" 데이터베이스로의 전환을 요구합니다. 기존의 느슨한 권한 관리나 레거시 인증 방식을 버리고, 엔진이 제공하는 신규 기능을 적극 활용하여 데이터 레이어의 안정성과 효율성을 동시에 확보하는 전략이 필요합니다.
