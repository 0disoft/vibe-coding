# Trigger.dev v4.x 실무 대응 전략 리포트 (2024.11 - 2025.12)

2024년 11월부터 2025년 12월까지 Trigger.dev는 **v4.0.0 메이저 릴리스**를 통해 백그라운드 태스크의 아키텍처를 근본적으로 재설계했습니다. 이 과정에서 **Streams API의 세대교체(v2)**, **Queue 정의의 명시적 강제**, 그리고 **Prisma 연동 방식의 복잡화**가 발생하여 기존 코드와 운영 환경에 직접적인 마이그레이션 압박을 가했습니다.

---

## 1. Executive Summary: 핵심 아키텍처 변화 (v4.0.0, v4.1.0)

| 버전            | 릴리즈 시기 | 핵심 아키텍처 변화 (Architectural Impact)                                                                            |
| :-------------- | :---------- | :------------------------------------------------------------------------------------------------------------------- |
| **v4.0.0 (GA)** | '25.08      | **Engine & Control:** Run Engine 2, **Waitpoints** 도입. Queue 정의를 코드로 강제(동적 Queue 생성 차단).             |
|                 |             | **DevOps:** Telemetry(OTLP), Middleware/Locals, init.ts 기반 글로벌 훅 지원.                                         |
| **v4.1.0**      | '25.11      | **Realtime API Shift:** Streams v2 공개. **`metadata.stream()` 방식이 사실상 퇴역**하고, Streams v2 API로 전환 강제. |
| **v4.1.1**      | '25.11      | **Prisma 6/7 Support:** `prismaExtension`의 재설계 및 `mode` 기반 전략 선택 요구. (브레이킹 변경)                    |

---

## 2. Critical Action Items: 코드 및 설계 필수 점검

### 2-1. Queue 및 훅 시그니처 변경 (v4.0.0)

v4로 넘어갈 때 가장 먼저 발생하는 브레이킹 변경입니다.

- **Queue 명시적 정의:** 더 이상 `trigger()` 호출 시 문자열만으로 Queue를 동적 생성할 수 없습니다. `/trigger` 디렉터리 안에 `queue({...})`를 호출하여 Queue를 명시적으로 선언하십시오. 이는 동시성(Concurrency) 관리의 안정성을 높입니다.
- **Lifecycle Hook 수정:** 태스크 훅의 인자 구조가 변경되었습니다.
  - **Legacy:** `tasks.onStart(payload, { ctx })`
  - **Replacement:** **`tasks.onStart(({ payload, ctx }) => { ... })`** (인자 구조 변경)
  - **Global Hooks:** `init.ts` 파일을 생성하여 공통 로깅 및 트레이싱 코드를 모든 태스크에 적용하십시오.

### 2-2. Realtime Streams 세대 교체 (v4.1.0)

Realtime 기능을 사용하는 프로젝트는 Streams v2로의 전환이 필수적입니다.

- **Stream API 전환:** 기존 `metadata.stream()` API는 더 이상 권장되지 않습니다. Streams v2 가이드를 따라 **스트림 스키마를 정의**하고, `streams.pipe(...)` 계열 API를 사용하여 태스크 실행과 프론트엔드 구독 로직을 분리하십시오.
- **React Hook 업데이트:** 프론트엔드 코드에서 `useRealtimeRunWithStreams` 훅 대신 **`useRealtimeStream`** 훅으로 교체하십시오.

### 2-3. 데이터베이스 확장 통합 (v4.1.1)

Prisma를 사용하는 프로젝트는 Trigger.dev의 빌드 확장 설정이 변경됩니다.

- **Prisma Extension Mode:** `prismaExtension` 호출 시 **`mode`** 옵션을 명시하여, 로컬 개발, 원격 Data Proxy, Prisma Accelerate 등 현재 환경에 맞는 빌드 및 런타임 전략을 선택하십시오. (Prisma 6/7 호환성 확보 목적)

---

## 3. Strategic Adoption: 도입해야 할 신규 패턴

- **Waitpoints 도입:** 긴 비동기 흐름(Long-running process)을 외부 입력(External Event) 기준으로 "일시 중지"하고 "재개"해야 할 때 `Waitpoints` 원시 기능을 활용하십시오. 기존의 복잡한 폴링(Polling) 로직을 제거할 수 있습니다.
- **Observability 통합:** `defineConfig`의 `telemetry` 섹션에서 OTLP(OpenTelemetry Protocol) Exporter를 설정하십시오. Trigger.dev 내부의 트레이스 및 로그를 Datadog, Axiom 등 외부 Observability 스택으로 내보내 **분산 트레이싱**을 구현하십시오.
- **멀티 런타임:** `runtime: "node-22" | "bun"` 옵션을 활용하여 특정 태스크를 Node.js 22나 Bun에서 실행하도록 지정하십시오. 필요하다면 `@trigger.dev/python`을 통해 Python 워크로드를 통합할 수 있습니다.

---

## 4. Conclusion

Trigger.dev v4는 **Realtime Streams v2** 및 **Queue의 명시적 정의**를 통해 백그라운드 태스크의 안정성과 관리 용이성을 극대화했습니다. **v4.0.0으로의 업그레이드** 시에는 **Hook 시그니처**와 **Prisma 모드**를 최우선으로 검토하고, **OTLP 통합**을 통해 엔터프라이즈 환경에서의 관측성을 확보하십시오.
