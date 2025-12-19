# Svelte 5 & SvelteKit 2 (문서 갱신: 2025-12-19)

---

## 1. Executive Summary: 변화의 두 축

1. **Svelte 5 (Runes & Stability):** 문법의 유연성을 확보하고 런타임 에러 제어 능력을 강화했습니다. 특히 `<svelte:boundary>`와 `$props.id()`의 도입은 대규모 앱에서의 안정성(Stability)을 보장하는 필수 요소가 되었습니다.
2. **SvelteKit 2 (Server-First & State):** `$app/stores`가 `$app/state`로 대체되며 상태 관리의 패러다임이 이동했습니다. 또한 `init` 훅과 `transport` 도입으로 서버 초기화 및 데이터 직렬화의 표준 패턴이 확립되었습니다.

---

## 2. Svelte 5.x Core: 런타임 및 문법 고도화

### 2-1. 주요 문법 및 API 변경

| 시기      | 버전   | 기능                    | 기술적 함의 및 도입 전략                                                                                              |
| :-------- | :----- | :---------------------- | :-------------------------------------------------------------------------------------------------------------------- |
| **24.12** | 5.2.5  | DOM 타입 확장           | `ContentVisibilityAutoStateChangeEvent` 등 최신 DOM 이벤트의 타입 안전성 확보.                                        |
| **25.01** | 5.3.0  | **`<svelte:boundary>`** | **[핵심]** 컴포넌트 단위 에러 격리(Isolation) 가능. 렌더링 단계의 치명적 오류가 전체 앱을 중단시키는 현상을 방지.     |
| **25.01** | 5.4.0  | `#each` 문법 완화       | `as` 키워드 생략 가능. 코드 간결성은 증대되나, 팀 내 가독성 컨벤션 합의 필요.                                         |
| **25.01** | 5.5.0  | Snippet Export          | Module script에서 Snippet export 지원. UI 패턴의 모듈화 및 재사용성 강화.                                             |
| **25.01** | 5.9.0  | Bind Getter/Setter      | 복잡한 데이터 변환 로직이 필요한 폼 바인딩에서 보일러플레이트 제거.                                                   |
| **25.01** | 5.11.0 | Window Reactivity       | `svelte/reactivity/window`를 통해 `scroll`, `resize` 등을 선언적(Declarative) 상태로 관리.                            |
| **25.03** | 5.20.0 | **`$props.id()`**       | **[필수]** SSR/CSR 간 ID 불일치(Hydration Mismatch) 해결. 접근성(A11y) 구현 시 표준 ID 생성 방식으로 채택 요망.       |
| **25.04** | 5.25.x | Writable `$derived`     | 파생 상태의 양방향 바인딩 지원. 제한적으로 사용해야 하며, 남용 시 데이터 흐름 추적 난이도 상승 주의.                  |
| **25.11** | 5.41.0 | `$state.eager`          | Promise 해결 전 UI를 선제적으로 갱신(Optimistic UI). 지연 시간(Latency) 체감 감소에 효과적.                           |
| **25.11** | 5.42.0 | `fork` API (Exp)        | 상태 변경을 격리된 샌드박스에서 시뮬레이션. 폼 검증 및 트랜잭션 UI의 사전 테스트 용도로 활용 가능.                    |
| **25.12** | 5.45.6 | `<video>` a11y 완화     | `src` 없는 `<video>`에 캡션 경고 미발생. SSR 시 비워두고 클라이언트에서 채우는 패턴에서 불필요한 경고 제거.           |
| **25.12** | 5.45.6 | `srcObject` 속성 허용   | `<audio>`, `<video>`에 `srcObject` 허용. WebRTC/MediaStream 스트림 바인딩 시 타입/검사 측면에서 자연스러운 사용 가능. |

### 2-2. 리액티비티 및 개발 도구

- **표준화된 구독 모델 (5.7.0):** `createSubscriber`와 `MediaQuery` 클래스 도입으로, 커스텀 스토어 구현 없이도 외부 이벤트를 Svelte 리액티비티 시스템에 통합할 수 있습니다.
- **타입 시스템 강화:** `ClassValue` export(5.19.0) 및 `createContext`의 제네릭 타입 지원(5.40.0)으로 TypeScript 환경에서의 개발 경험(DX)과 타입 추론 정확도가 향상되었습니다.

---

## 3. SvelteKit 2.x: 인프라 및 아키텍처 최적화

### 3-1. 런타임 아키텍처 및 훅(Hooks)

| 시기      | 버전   | 기능                    | 아키텍처 영향 및 권장 사항                                                                                                                |
| :-------- | :----- | :---------------------- | :---------------------------------------------------------------------------------------------------------------------------------------- |
| **25.01** | 2.10.0 | **`init` Hook**         | **[성능]** 서버 시작 시 단 1회 실행 보장. DB 연결, 캐시 웜업 등 고비용 초기화 로직을 `handle` 훅에서 분리하여 요청 처리 지연 제거.        |
| **25.01** | 2.11.0 | `transport` Hook        | 비 POJO 데이터(Date, Map 등)의 직렬화/역직렬화 표준화. 데이터 무결성 보장.                                                                |
| **25.01** | 2.12.0 | **State Migration**     | **[중요]** `$app/stores`는 deprecated이며 SvelteKit 3에서 제거 예정. 신규/유지보수 관점에서 `$app/state`로 조기 전환 권장.                  |
| **25.01** | 2.13+  | `bundleStrategy`        | Edge/Serverless 환경에 맞춰 번들링 전략(Split/Single/Inline) 세분화 제어 가능.                                                            |
| **25.03** | 2.17.0 | Server Route Resolution | 라우팅 로직을 서버로 위임하여 클라이언트 초기 JS 페이로드 감소. 대규모 앱의 초기 로딩 성능 최적화 옵션.                                   |
| **25.03** | Pre    | Native WebSocket        | SvelteKit 내장 WebSocket 지원 **(실험/프리뷰로 테스트 가능)**. 정식 포함 여부는 릴리스 노트 기준 확인 필요.                               |
| **25.04** | 2.18+  | Async `reroute`         | 리다이렉트 로직의 비동기 처리 허용. 복잡한 인증/권한 검사 로직을 라우팅 단계에서 효율적으로 처리 가능.                                    |
| **25.11** | 2.44.0 | Remote Func Context     | Remote function 내 `event.route`, `event.url` 접근 허용. 호출 컨텍스트 기반의 정밀한 로깅 및 보안 검사 가능.                              |
| **25.11** | 2.47.0 | `request.signal`        | `AbortSignal` 연동을 통해 요청 취소 시 백엔드 리소스 점유 즉시 해제(Resource Cleanup).                                                    |
| **25.12** | 2.49.2 | (Latest)                | 2.47.0 이후 패치 릴리스들이 추가됨. 안정성 및 버그 수정 포함.                                                                             |

### 3-2. 인프라 및 어댑터

- **Cloudflare 통합 (25.05):** Pages와 Workers 어댑터가 `adapter-cloudflare@7.0.0`으로 단일화되었습니다. 배포 파이프라인의 단순화가 가능합니다.
- **Vercel Observability (25.05):** `adapter-vercel` 업데이트로 라우트별 함수 심볼릭 링크 생성을 지원, Cold Start 분석 및 로그 모니터링의 정확도가 개선되었습니다.
- **패키지 매니저 호환성:** pnpm 10 지원을 위해 `postinstall` 의존성을 제거하고 `prepare: svelte-kit sync` 스크립트 추가가 필요해졌습니다.

---

## 4. Action Plan: 실전 적용 가이드

프로젝트 단계별로 즉시 적용해야 할 기술적 지침입니다.

### 4-1. 신규 프로젝트 (Greenfield)

- **상태 관리:** `$app/stores`는 deprecated(SvelteKit 3에서 제거 예정)이므로 `$app/state` 기반 설계를 채택하십시오.
- **에러 제어:** 최상위 레이아웃 및 주요 컴포넌트 래퍼에 `<svelte:boundary>`를 적용하여 장애 전파를 차단하십시오.
- **초기화 최적화:** DB 연결 등 전역 리소스는 반드시 `init` 훅에 배치하여 요청 당 오버헤드를 제거하십시오.
- **보안 및 식별:** SSR 환경에서의 ID 충돌 방지를 위해 `$props.id()` 사용을 표준화하십시오.

### 4-2. 운영 중인 프로젝트 (Legacy Migration)

1. **스토어 점검:** `$app/stores`는 deprecated이며 SvelteKit 3에서 제거 예정이므로, CLI 마이그레이션 도구를 활용하여 `$app/state`로 전환 계획을 수립하십시오.
2. **배포 환경 업데이트:**
   - **Cloudflare:** 레거시 어댑터를 제거하고 통합 어댑터(`adapter-cloudflare`)로 교체하십시오.
   - **Vercel:** 모니터링 가시성 확보를 위해 최신 어댑터로 업데이트하십시오.
3. **CI/CD 수정:** pnpm 10 도입 시 `package.json`의 scripts 섹션에 `"prepare": "svelte-kit sync"`가 누락되지 않았는지 검증하십시오.

본 리포트는 불확실한 예측을 배제하고 검증된 변경 사항만을 다루었습니다. Svelte 5와 SvelteKit 2는 더 이상 실험적인 프레임워크가 아니며, 명확한 아키텍처 원칙을 요구하는 성숙한 플랫폼으로 진화했습니다. 지금이 바로 기술 부채를 청산하고 모던 아키텍처로 전환할 적기입니다.

---

## 5. 버전 정보 (2025-12-19 기준)

| 패키지    | 최신 버전 |
| :-------- | :-------- |
| Svelte    | 5.45.10   |
| SvelteKit | 2.49.2    |

> **참조:** [Svelte Releases](https://github.com/sveltejs/svelte/releases), [SvelteKit Releases](https://github.com/sveltejs/kit/releases)
