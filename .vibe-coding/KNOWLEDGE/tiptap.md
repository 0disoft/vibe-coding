# TipTap 주요 변경 사항 요약 및 대응 전략 (2024-11 ~ 2025-11)

2024년 11월부터 2025년 11월까지 TipTap은 **v3.0.0 메이저 릴리스**를 통해 아키텍처를 전면 개편하고, **Markdown 공식 지원(v3.7.0)** 및 **이미지 리사이즈(v3.10.0)** 기능을 코어에 통합했습니다. 이 기간은 TipTap이 \*\*"WYSIWYG 엔진"\*\*에서 \*\*"Markdown 기반 협업 및 미디어 처리 허브"\*\*로 진화한 분기점입니다.

---

## 1. Executive Summary: 핵심 아키텍처 변화 (v3.0.0, v3.7.0, v3.10.0)

| 버전        | 릴리즈 시기 | 핵심 아키텍처 변화 (Architectural Impact)                                                                    | 영향도    |
| :---------- | :---------- | :----------------------------------------------------------------------------------------------------------- | :-------- |
| **v3.0.0**  | '25.07      | **API Breaking:** `History` → **`UndoRedo`** 이름 변경, `editor.getCharacterCount()` 제거, 패키지 구조 통합. | 매우 높음 |
| **v3.7.0**  | '25.10      | **Markdown Native:** `@tiptap/markdown` 확장 및 `contentType: 'markdown'` 옵션 도입.                         | 높음      |
| **v3.10.0** | '25.10      | **Media UX:** **`ResizableNodeView`** 코어 통합 및 `Image` 확장에 `resize` 옵션 추가.                        | 높음      |
| **v3.9.0**  | '25.10      | **Integrity:** Markdown Hard Break 처리 수정, `UniqueId`에 `updateDocument: false` 옵션 추가.                | 중간      |

---

## 2. Critical Action Items: v2 → v3 마이그레이션 필수 항목

### 2-1. 패키지 구조 및 API 교체

- **`History` → `UndoRedo`:** 모든 곳에서 `History` 확장을 **`UndoRedo`** 로 교체하고, `StarterKit.configure()` 내의 옵션 이름도 `history: false`에서 **`undoRedo: false`** 로 변경해야 합니다.
- **패키지 경로 통합:** 개별 패키지(`@tiptap/extension-*`)로 import 하던 다수의 확장을 **`@tiptap/extensions`** 번들에서 구조 분해(Destructuring)하여 가져오도록 수정하십시오.
- **캐릭터 카운트:** `editor.getCharacterCount()`가 제거되었습니다. 대신 `CharacterCount` 확장을 설치하고 `editor.storage.characterCount.characters()`를 사용하십시오.

### 2-2. React 성능 및 NodeView 안전성

- **React Re-render:** `@tiptap/react`의 기본 동작이 **트랜잭션마다 리렌더하지 않도록** 변경되었습니다. `useEditor` 호출 시 `shouldRerenderOnTransaction: true`를 명시하거나, `onTransaction` 훅을 활용해 필요한 상태만 업데이트하여 성능을 최적화하십시오.
- **NodeView 안전성:** 커스텀 NodeView에서 위치를 가져올 때 `getPos()`의 반환값이 `undefined`일 수 있습니다. **Nullish Coalescing이나 조건문**을 사용하여 `pos`가 정의되었는지 확인하는 방어 코드를 추가해야 합니다.

  ```ts
  // Replacement: Check for undefined
  const pos = nodeViewProps.getPos();
  if (pos !== undefined) {
  	/* ... */
  }
  ```

---

## 3. Strategic Adoption: 도입해야 할 신규 패턴

### 3-1. Markdown 및 IO 표준화 (v3.7.0+)

- **마크다운 입출력:** `@tiptap/markdown` 확장을 추가하고 `editor.getMarkdown()`과 `editor.commands.setContent(string, { contentType: 'markdown' })` 패턴을 표준화하십시오. 이는 LLM 응답 처리 및 저장소의 형식을 Markdown으로 통일하는 데 필수적입니다.
- **Markdown 정합성:** v3.9.0 이후 하드 브레이크(Hard Break) 처리 로직이 개선되었습니다. Markdown을 사용하는 경우 3.9.0 이상 버전을 사용하여 줄바꿈 및 인라인 스타일링의 정합성을 확보하십시오.

### 3-2. 고급 편집기 UX (v3.10.0)

- **이미지 리사이즈:** `Image.configure({ resize: true })` 옵션만으로 코어에 통합된 **`ResizableNodeView`** 기능을 활성화하십시오. 외부 라이브러리 없이 직관적인 이미지 크기 조절 핸들을 제공할 수 있습니다.
- **조건부 뷰:** `addNodeView` 훅에서 `null`을 반환하여, 특정 기능 플래그나 권한에 따라 NodeView의 렌더링을 비활성화하는 동적 UI 설계를 구현하십시오.

### 3-3. ID 관리 전략 (v3.8.0)

협업 환경에서 ID 충돌을 방지하려면 `UniqueId.configure({ updateDocument: false })` 옵션을 사용하십시오. 이 설정은 문서 로드 시 ID를 재할당하는 동작을 막고, 서버가 제공한 ID를 고정하여 **문서 전체 리라이트를 방지**하고 성능 및 ID 일관성을 확보합니다.

---

## 4. Conclusion

TipTap v3.0.0은 단순히 버전업이 아니라 **협업 및 AI 시대에 맞는 새로운 API 기준**을 제시했습니다. **`UndoRedo`로의 교체**와 **`@tiptap/extensions`로의 import 경로 통합**을 최우선으로 진행하고, **Markdown** 및 **ResizableNodeView** 기능을 도입하여 최종 편집기 경험을 대폭 향상시키십시오.
