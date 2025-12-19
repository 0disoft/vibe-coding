# TypeBox (문서 갱신: 2025-12-19)

---

## 1. Executive Summary: 0.34.x 라인의 핵심 전략

| 패키지               | 최신 버전  | 릴리즈 시기 | 비고                                       |
| :------------------- | :--------- | :---------- | :----------------------------------------- |
| `@sinclair/typebox`  | **0.34.41** | '25.08     | 레거시 호환 유지, 비파괴적 패치 지속       |
| `typebox`            | **1.0.64**  | '25.12     | 신규 패키지, v1.0 안정화 라인              |

1. **Standard Alignment:** JSON Schema 표준 스펙(Draft 2019-09 등)을 준수하지 않는 독자적인 확장을 제거하거나 표준 방식으로 대체합니다. (`Dict` → `Record`)
2. **Explicit Definition:** '마법'처럼 동작하던 묵시적 타입 변환(`Date`, `Uint8Array`)을 지양하고, 명시적인 커스텀 타입 정의(`Unsafe`)를 권장하는 방향으로 선회했습니다.
3. **Preparation for v1.0:** API 서명을 정리하고 네임스페이스 구조를 다듬어, v1.0으로의 마이그레이션 충격을 최소화하도록 유도합니다.

---

## 2. Critical Deprecations & Action Plan

다음 항목들은 코드베이스에서 점검하거나 리팩토링을 고려해야 할 목록입니다.

### 2-1. `Type.Dict` Deprecated → `Type.Record` 전환

`Type.Dict`는 **deprecated** 상태이며 `Type.Record`로 대체가 권장됩니다. `Type.Record`는 JSON Schema의 `patternProperties`를 활용합니다.

- **Impact:** 구버전 코드 사용 시 향후 경고나 호환성 문제가 발생할 수 있습니다.
- **Action:**

  ```ts
  // Legacy (deprecated)
  Type.Dict(Type.String());

  // Modern
  Type.Record(Type.String(), Type.String());
  ```

### 2-2. `Type.Date`, `Type.Uint8Array` — 비표준 확장 타입 주의

이 타입들은 TypeBox의 **JavaScript Extended Types**로, 표준 JSON Schema validator(Ajv 등)와 함께 사용할 수 없습니다.

> [!WARNING]
> "지원 중단 예고"로 공식 발표된 것은 아니지만, 표준 JSON Schema 검증기와의 호환성이 보장되지 않습니다. JSON 직렬화가 필요한 API 경계에서는 사용을 지양하십시오.

- **Action:** 표준 `string` 타입(`format: date-time`)으로 전환하고 애플리케이션 레벨에서 파싱하거나, `Type.Unsafe`를 사용하여 명시적으로 정의하십시오.

  ```ts
  // Recommended Pattern for Date
  Type.Unsafe<Date>({ type: 'string', format: 'date-time' });
  ```

### 2-3. 재귀 타입(`Type.Rec`) 서명 — 프로젝트 컨벤션 통일 권장

`$id`를 첫 번째 인자로 받는 구형 서명과 옵션 객체로 받는 신형 서명이 혼재할 수 있습니다.

- **Action:** 프로젝트 내에서 한 가지 스타일(예: 옵션 객체 `{ $id: '...' }`)로 통일하여 가독성과 유지보수성을 확보하십시오.

### 2-4. 포맷 등록 방식

`TypeSystem.Format()` 또는 `FormatRegistry` 등 여러 경로가 존재합니다.

- **Action:** 사용하는 검증기(TypeCompiler, Value 등)에 맞는 등록 API를 확인하고, 레거시 방식이 있다면 일관되게 정리하십시오.

---

## 3. v1.0 마이그레이션 전망

`@sinclair/typebox`(0.34.x)와 `typebox`(1.0.x)는 **점진적 마이그레이션**을 위해 전략적으로 분리되었습니다.

- **New Project:** v1.0을 지원하는 프레임워크(Fastify 등)를 사용한다면 `typebox` 1.0.x 패키지로 시작하는 것을 검토하십시오.
- **Legacy Project:** `@sinclair/typebox` 0.34.41까지 업데이트하여 안정성을 확보한 후, [migration guide](https://github.com/sinclairzx81/typebox)를 참고하여 v1.0 마이그레이션을 계획하십시오.

---

## 4. Conclusion

TypeBox 0.34.x는 새로운 기능 추가보다 **'표준 준수'** 와 **'안정성'** 에 방점을 두고 있습니다. 0.34.4x 패치 업데이트는 비교적 안전하지만, **deprecated API(Type.Dict)** 사용 여부와 **비표준 확장 타입(Date, Uint8Array)** 의존성을 점검하고 미리 정리해두는 것이 v1.0 시대를 대비하는 현명한 전략입니다.

---

## 5. References

- [GitHub: sinclairzx81/typebox](https://github.com/sinclairzx81/typebox)
- [NPM: @sinclair/typebox](https://www.npmjs.com/package/@sinclair/typebox)
- [README (0.34.41)](https://app.unpkg.com/@sinclair/typebox@0.34.41/files/readme.md)
