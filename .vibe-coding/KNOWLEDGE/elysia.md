# ElysiaJS v1.1.25 ~ v1.4.16 핵심 마이그레이션 리포트

2024년 말부터 2025년 11월까지 ElysiaJS는 단순한 버전 업그레이드를 넘어 \*\*런타임 호환성 강화(Universal Runtime)\*\*와 \*\*타입 시스템의 엄격화(Type Safety)\*\*를 중심으로 진화했습니다. 특히 v1.4.0은 API 디자인 패턴을 재정립하는 'Soft Major' 성격의 업데이트이므로, 해당 버전을 기점으로 한 코드베이스 점검이 필수적입니다.

본 리포트는 이 기간의 변경 사항 중 프로덕션 코드에 직접적인 영향을 주는 핵심 변화만을 분석하여, 안전한 마이그레이션 경로를 제시합니다.

---

## 1. Executive Summary: 버전별 핵심 아키텍처 변화

| 버전       | 릴리즈 시기 | 핵심 아키텍처 변화 (Paradigm Shift)                                                                   |
| :--------- | :---------- | :---------------------------------------------------------------------------------------------------- |
| **v1.2.0** | '24.12      | **Adapter Pattern:** Node/Bun/Web Standard 간의 경계를 명확히 하는 어댑터 패턴 정립.                  |
| **v1.3.0** | '25.05      | **Type Ref:** `Elysia.Ref` 도입으로 모델 참조의 타입 안전성과 자동완성 경험 개선.                     |
| **v1.3.8** | '25.08      | **Response Isolation:** 파일 응답(`ElysiaFile`)이 전역 헤더 상속을 중단하고 독립적인 컨텍스트를 가짐. |
| **v1.4.0** | '25.09      | **Standard Validator:** 매크로 시스템 전면 개편(v1 삭제) 및 에러 처리 API 표준화(`status()`).         |
| **v1.4.7** | '25.09      | **Cloudflare Support:** 실험적 어댑터를 통해 Cloudflare Workers 환경을 공식 지원 범위로 편입.         |

---

## 2. Critical Breaking Changes & Migration Guide

### 2-1. 에러 및 응답 제어 API 표준화 (v1.4.0)

가장 큰 변화입니다. 기존 `error()` 헬퍼와 `mapResponse` 훅의 시그니처가 변경되었습니다.

- **Status Code:** `return error(404, 'Msg')` 패턴은 deprecated 되었습니다. `return status(404, 'Msg')`로 전면 교체하십시오.
- **Hook Interface:** `mapResponse`, `afterResponse`에서 사용하던 `response` 속성은 deprecate 예정입니다. 값 자체에 접근하려면 `responseValue`를 사용해야 합니다.

  ```ts
  // Legacy
  app.mapResponse(({ response }) => { ... })

  // Modern
  app.mapResponse(({ responseValue }) => { ... })
  ```

- **Macro v1 제거:** 기존 매크로 시스템은 타입 안정성 문제로 제거되었습니다. 스키마 기반의 Macro v2로 리팩토링이 필수입니다.

### 2-2. 타입 시스템 및 모델 참조 (v1.3.0, v1.4.5)

모델 정의와 참조 방식이 더 엄격해졌습니다.

- **`Elysia.Ref` 표준화:** `t.Ref` 대신 `Elysia.Ref` 사용을 권장합니다. 특히 v1.4.5부터 `.model` 정의 시 `t.Ref`의 자동 타입 변환(Coercion)이 중단되었으므로, 모델 참조 코드를 전수 조사하여 수정해야 합니다.

  ```ts
  // Recommended Pattern
  const app = new Elysia().model('User', t.Object({ id: t.String() }));

  // Type Level Reference
  type User = Elysia.Ref<'User'>;
  ```

### 2-3. 파일 응답 헤더 분리 (v1.3.8)

`ElysiaFile` 반환 시 더 이상 `set.headers`의 값이 자동 병합되지 않습니다.

- **Impact:** 모든 파일 응답에 공통 헤더(예: CORS, Custom Metadata)를 강제로 주입하던 로직이 있다면 동작하지 않을 수 있습니다.
- **Action:** 파일 응답 생성 시 필요한 헤더를 `new Response(file, { headers })` 형태로 명시하거나, 파일 응답 전용 미들웨어 로직을 재검토하십시오.

### 2-4. 검증 로직 강화 (v1.2.x, v1.4.13)

- **Strict Date:** 유효하지 않은 날짜 문자열(Invalid Date)에 대한 검증이 강화되어, 기존에 느슨하게 허용되던 요청이 실패할 수 있습니다.
- **Production Safety:** `ValidationError`가 너무 많은 디버그 정보를 노출하는 것을 막기 위해 `allowUnsafeValidationDetails` 옵션이 도입되었습니다. 프로덕션 환경에서는 `false`로 설정하여 보안을 강화하십시오.

---

## 3. Strategic Action Plan: 마이그레이션 체크리스트

1. **v1.2.0 점검:** 프로젝트가 멀티 런타임(Node/Bun 혼용) 환경이라면 어댑터 설정을 명시적으로 지정하십시오.
2. **v1.4.0 리팩토링:** `error()` -\> `status()` 치환 작업을 우선 수행하고, 커스텀 매크로 사용처를 파악하여 v2 문법으로 전환하십시오.
3. **타입 전수 조사:** `t.Ref` 사용처를 찾아 `Elysia.Ref` 패턴으로 변경하고, `t.NumericEnum` 등 신규 타입으로 복잡한 유니온 타입을 단순화하십시오.
4. **Cloudflare 확장:** Edge 배포가 필요하다면 v1.4.7의 Cloudflare 어댑터를 도입하여 인프라 유연성을 확보하십시오.

ElysiaJS는 이제 단순한 속도 중심의 프레임워크를 넘어, 엔터프라이즈급 안정성과 타입 시스템을 갖춘 표준 솔루션으로 성숙했습니다. 이번 업데이트들은 다소 번거로울 수 있으나, 장기적인 코드베이스의 건전성을 위해 반드시 수행해야 할 과제입니다.
