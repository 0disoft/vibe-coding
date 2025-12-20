# PROMPT

이 디렉토리는 다양한 상황에서 LLM에게 일관된 지침을 제공하기 위한 **재사용 가능한 프롬프트 스니펫**을 관리합니다.

## 폴더 구조

- `README.md`: 프롬프트 시스템 사용 가이드
- `REFACTORING_SUGGESTION.md`: 코드 품질 분석 및 리팩토링 제안용
- `BATCH_TASK_PROCESSOR.md`: REQUESTS.md의 미완료 작업을 묶어서 처리할 때 사용

## 사용 방법

에이전트에게 작업을 요청할 때는 이 디렉토리의 프롬프트 파일을 불러와 가이드라인으로 사용하도록 지시하십시오.
예: "PROMPT/CODE_SCANNER.md 프롬프트 규칙에 따라 이 파일의 보안 취약점을 점검해줘."
