# OpenRouter TypeScript SDK 실무 가이드

OpenRouter TypeScript SDK는 릴리스별 변경 사항을 공개적으로 정리해 두지 않으며, GitHub 릴리스는 Speakeasy 자동 생성 로그만 포함합니다. 따라서 **버전별로 정확히 어떤 필드/메서드가 `deprecated` 되었는지 공식 자료만으로는 추적할 수 없습니다.**

하지만 현재 SDK의 핵심 기능과 구조적인 제약을 분석하여, 코딩 시 반드시 고려해야 할 실무 포인트를 아래와 같이 정리합니다.

-----

## 1. SDK 구조 및 제약 사항

OpenRouter SDK는 **ESM(ECMAScript Module) 전용**이며, OpenRouter의 Chat Completion HTTP API를 얇게 감싸는 **Thin Wrapper** 구조를 가집니다.

### 1-1. ESM 강제 및 초기화 패턴

* **제약:** `@openrouter/sdk`는 **ESM 전용**이므로, CommonJS 환경에서는 `require()` 대신 동적 `import()`를 사용해야 합니다.
* **초기화:** 모든 버전에서 `new OpenRouter({ apiKey: process.env.OPENROUTER_API_KEY })` 패턴을 일관되게 사용합니다.

### 1-2. 스트리밍 패턴

* **사용법:** `openRouter.chat.send()` 호출 시 `stream: true` 옵션을 사용하며, 결과 객체는 **비동기 이터레이터**입니다.
* **Action:** 스트림 결과를 처리할 때 `Promise`가 아닌 **`for await ... of`** 문법을 사용하여 청크(Chunk)를 순차적으로 읽어야 합니다.

<!-- end list -->

```ts
// Streaming Pattern
for await (const chunk of result) {
  console.log(chunk.choices[0].delta.content);
}
```

-----

## 2. 코딩 시 핵심 기능 및 파라미터 구조

버전별 변화는 없지만, OpenRouter HTTP API의 기능이 SDK를 통해 노출되는 방식은 다음과 같습니다. 이 구조는 **OpenAI API와의 유사성**을 띠며, 복잡한 AI 기능을 구현할 때 중요합니다.

### 2-1. 고급 파라미터 (High-Level Parameters)

| 기능 | SDK 파라미터 | 용도 |
| :--- | :--- | :--- |
| **Reasoning** | `reasoning: { effort: 'high' }` | 모델에게 중간 추론 과정에 더 많은 컴퓨팅 파워를 할당하도록 지시하여 결과 품질 향상. |
| **Structured Output** | `response_format: { type: 'json_schema', json_schema: {...} }` | 응답 형식을 JSON 스키마에 맞춰 강제. (RAG, 툴 호출 결과 처리 시 필수) |
| **Tool Calling** | `tools: [{ type: 'function', function: {...} }]` | 함수 호출(Tool Calling) 기능을 정의하고 모델이 사용할 수 있도록 활성화. |

### 2-2. 멀티모달 입력 구조

멀티모달 입력은 메시지 배열 내부의 `content` 필드에 **객체 배열** 형태로 정의됩니다.

* **Action:** 텍스트, 이미지, 오디오 등 여러 입력을 동시에 전달할 경우, 아래와 같이 `type` 필드를 명시하여 구조화해야 합니다.

<!-- end list -->

```ts
// Multimodal Input Pattern
messages: [{
  role: "user",
  content: [
    { type: "input_text", text: "What is in this image?" },
    { type: "input_image", image: { data: base64Image, format: "jpeg" } },
  ],
}]
```

-----

## 3. 실무 버전 관리 전략 제안

OpenRouter SDK는 상세한 `CHANGELOG`가 부재하므로, 업그레이드 시 다음의 **보수적인 전략**을 권장합니다.

1. **버전 고정 (Pinning):** `package.json`에서 SemVer 범위(`^0.1.x`) 대신 특정 버전(예: `"@openrouter/sdk": "0.1.20"`)을 사용해 예상치 못한 **자동 Breaking Change**를 방지하십시오.
2. **API 문서 우선:** SDK 코드가 아닌 **OpenRouter HTTP API 문서**를 기준으로 기능과 필드 구조를 파악하는 것을 최우선으로 합니다.
3. **마이그레이션 검증:** 새로운 SDK 버전으로 업데이트할 때마다 `chat.send` 호출부의 **타입 에러 유무**를 확인하고, 핵심 로직이 예상대로 동작하는지 검증하십시오.

OpenRouter SDK는 **안정적인 HTTP API**를 사용하므로, 코어 로직 자체는 버전이 바뀌어도 비교적 안정적일 가능성이 높습니다.
