# Vercel AI SDK v4.0.0 - v5.0.0 아키텍처 리포트: 멀티모달 에이전트 시대 준비

2024년 말부터 2025년 말까지 Vercel AI SDK는 **'코어 API의 표준화(v4.0)'**와 **'멀티모달 및 에이전트 아키텍처 지원(v4.2, v5.0)'**을 목표로 빠르게 진화했습니다. 특히 v4.0에서 발생한 대규모 API 변경과 v4.2의 `useChat` 메시지 구조 개편은 기존 코드베이스에 직접적인 마이그레이션 압박을 가했습니다.

본 리포트는 해당 기간의 변경 사항을 분석하여, 실무에서 필수적으로 대응해야 할 아키텍처 전략과 코드 마이그레이션 포인트를 제시합니다.

---

## 1. Executive Summary: 버전별 핵심 아키텍처 변화

| 버전 | 릴리즈 시기 | 핵심 아키텍처 변화 (Architectural Impact) |
| :--- | :--- | :--- |
| **v4.0** | '24.11 | **Core Standardization:** `baseUrl` → `baseURL`, Facade 클래스 제거, `roundtrips` → `steps` 등 코어 API의 대규모 정리. |
| **v4.1** | '25.01 | **Enhancement:** `generateImage` 및 `smoothStream` 도입. 툴 호출에 컨텍스트(ID, 메시지) 제공. |
| **v4.2** | '25.03 | **UI Data Model:** `useChat` 메시지 구조가 **`message.parts[]` 기반**으로 재설계. 멀티모달 응답 렌더링 표준화. |
| **v5.0** | '25.07 | **Advanced Agenting:** 차세대 에이전트 루프 제어, 음성 합성/인식 API, 강화된 툴 복구 기능 추가. |

---

## 2. Critical Action Items: 마이그레이션 필수 점검

### 2-1. 코어 API 및 Provider 계층 변경 (v4.0)

v4.0으로의 전환은 가장 큰 파괴적 변경을 포함하며, 다음 API를 수정해야 합니다.

* **Provider 초기화:** `new OpenAI(...)` 같은 **Facade 클래스 생성자** 사용을 중단하고, **`createOpenAI(...)` 팩토리 함수**로 전환하십시오.
* **URL/옵션:** `baseUrl` 옵션을 **`baseURL`** 로 변경하고, provider별 `topK` 옵션을 `generateText`의 **공통 옵션**으로 옮겨야 합니다.
* **스트림 처리:** `streamText` 호출 시 더 이상 `await`를 사용하지 마십시오. 결과 객체에서 **`toAIStream` 계열 메서드** 대신 **`toDataStream()`** 계열 메서드를 사용하여 응답을 처리하십시오.

### 2-2. `useChat` UI 구조 개편 (v4.2)

에이전트의 복합 응답(텍스트, 추론, 툴 호출, 이미지)을 클라이언트에서 효율적으로 렌더링하기 위해 메시지 구조가 근본적으로 변경되었습니다.

* **Legacy:** `message.content`, `message.reasoning`, `message.toolInvocations`와 같은 개별 필드에 의존.
* **Replacement:** **`message.parts[]`** 배열을 순회하며 각 파트의 `type`(`text`, `reasoning`, `tool-invocation`, `file` 등)을 기준으로 렌더링 로직을 분기하십시오. 이는 **멀티모달 응답의 순서 보존**을 위해 필수적입니다.

### 2-3. 툴 호출 및 디버깅 강화 (v4.1)

* **툴 실행 컨텍스트:** 툴 함수의 `execute` 메서드는 이제 `toolCallId`, `messages`, `abortSignal` 등의 컨텍스트를 두 번째 인자로 받습니다. 툴 호출 로직을 재설계하여 이 컨텍스트를 활용한 **정밀한 추적 및 취소 로직**을 구현하십시오.
* **Zod 의존성:** v4.2부터 **Zod가 필수적인 `peerDependency`**로 강제됩니다. Zod를 사용하여 툴 스키마 및 구조화 출력의 타입을 정의하십시오.

---

## 3. Strategic Adoption: 도입해야 할 신규 패턴

* **이미지 생성 통합:** `generateImage` API를 도입하여 DALL-E, Replicate 등 여러 공급자의 이미지 생성 기능을 단일 클라이언트 API로 추상화하십시오.
* **스트림 UX 개선:** `smoothStream` 변환을 활용하여, LLM의 들쭉날쭉한 청크 스트림을 최종 사용자에게 부드럽게 전달하여 응답 체감 속도를 개선하십시오.
* **에이전트 아키텍처 (v5.0):** 복잡한 다단계 툴 사용 워크플로우를 구축할 경우, v5.0의 에이전트 루프 제어 기능과 강화된 툴 복구 옵션을 활용하여 **자체적인 에이전트 프레임워크** 구축을 검토하십시오.

---

## 4. Conclusion

AI SDK의 v4.0~v5.0 구간은 **코어 API를 안정화**하고 **멀티모달 에이전트 시대에 대비**하는 준비 기간이었습니다. **v4.2의 `message.parts[]` 구조로의 전환**을 최우선 과제로 수행하고, **v5.0의 고급 툴 제어 기능**을 활용하여 다음 세대 LLM 기반 애플리케이션의 아키텍처를 구축하십시오.
