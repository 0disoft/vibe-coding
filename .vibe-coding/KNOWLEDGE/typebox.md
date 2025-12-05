# TypeBox 0.34.x 아키텍처 리포트: 안정성과 1.0 준비

TypeBox는 0.34.x 라인에서 API 안정성과 표준 JSON Schema 호환성에 집중하고 있습니다. 특히, `Type.Dict`와 같은 비표준 확장을 제거하고 `Type.Record`로 대체하는 등, **v1.0으로의 매끄러운 전환을 위한 기반 작업**이 진행 중입니다.

본 문서는 공식 Changelog 접근이 제한적인 상황에서, GitHub 이슈 및 주변 생태계(Elysia, Fastify 등)의 변경 사항을 역추적하여 핵심 아키텍처 변화를 재구성했습니다.

-----

## 1. Executive Summary: 0.34.x 라인의 핵심 전략

1. **Standard Alignment:** JSON Schema 표준 스펙(Draft 2019-09 등)을 준수하지 않는 독자적인 확장을 제거하거나 표준 방식으로 대체합니다. (`Dict` -\> `Record`)
2. **Explicit Definition:** '마법'처럼 동작하던 묵시적 타입 변환(`Date`, `Uint8Array`)을 지양하고, 명시적인 커스텀 타입 정의(`Unsafe`)를 권장하는 방향으로 선회했습니다.
3. **Preparation for v1.0:** API 서명을 정리하고 네임스페이스 구조를 다듬어, v1.0으로의 마이그레이션 충격을 최소화하도록 유도합니다.

-----

## 2. Critical Deprecations & Action Plan

다음 항목들은 코드베이스에서 즉시 제거하거나 리팩토링해야 할 **'기술 부채'** 목록입니다.

### 2-1. `Type.Dict` 폐기 및 `Type.Record` 전환

`Type.Dict`는 더 이상 지원되지 않습니다. 이는 JSON Schema의 `patternProperties`를 활용하는 `Type.Record`로 완전히 대체되었습니다.

* **Impact:** 구버전 코드를 그대로 복사할 경우 런타임 경고나 타입 에러가 발생합니다.
* **Action:**

    ```ts
    // Legacy
    Type.Dict(Type.String())

    // Modern
    Type.Record(Type.String(), Type.String())
    ```

### 2-2. `Type.Date`, `Type.Uint8Array` 지원 중단 예고

라이브러리 레벨에서 제공하던 비표준 타입(`Date`, `Binary`)에 대한 지원이 축소될 예정입니다.

* **Impact:** 해당 타입에 의존하던 검증 로직이 향후 버전에서 실패할 수 있습니다.
* **Action:** `Type.Unsafe`를 사용하여 명시적으로 스키마와 검증 로직을 정의하거나, 표준 `string` 타입(`format: date-time`)으로 전환하고 애플리케이션 레벨에서 파싱하십시오.

    ```ts
    // Recommended Pattern for Date
    Type.Unsafe<Date>({ type: 'string', format: 'date-time' })
    ```

### 2-3. 재귀 타입(`Type.Rec`) 서명 통일

`$id`를 첫 번째 인자로 받는 구형 서명과 옵션 객체로 받는 신형 서명이 혼재되어 있습니다.

* **Action:** 옵션 객체(`{ $id: '...' }`)를 사용하는 방식으로 코드 스타일을 통일하여 가독성을 높이고 향후 호환성을 확보하십시오.

### 2-4. 포맷 등록 방식 중앙화

`TypeSystem.Format()`을 통한 포맷 등록이 표준이 되었습니다.

* **Action:** 레거시 포맷 등록 API를 사용하는 코드를 찾아 `TypeSystem.Format()`으로 교체하십시오.

-----

## 3. v1.0 마이그레이션 전망

`@sinclair/typebox` 패키지는 v0.34.x 라인을 유지하고 있지만, 별도의 `typebox` 패키지는 v1.0.x 라인으로 배포되고 있습니다. 이는 \*\*'점진적 마이그레이션'\*\*을 위한 전략적 분리입니다.

* **New Project:** 이미 v1.0을 지원하는 프레임워크(Fastify 등)를 사용한다면 `typebox` v1.0 패키지로 시작하는 것을 적극 검토하십시오.
* **Legacy Project:** 0.34.x의 최신 패치 버전까지 업데이트하여 안정성을 확보한 후, 여유를 두고 v1.0 마이그레이션을 계획하십시오.

## 4. Conclusion

TypeBox 0.34.x는 새로운 기능 추가보다는 \*\*'표준 준수'\*\*와 \*\*'안정성'\*\*에 방점을 두고 있습니다. 따라서 0.34.3x에서 0.34.4x로의 패치 업데이트는 비교적 안전합니다. 하지만 위에서 언급된 **Deprecated API 사용 여부를 점검**하고 미리 리팩토링해두는 것이, 향후 v1.0 시대를 대비하는 가장 현명한 전략입니다.
