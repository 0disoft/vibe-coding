# TODO List

현재 상태: 🛑 부트스트랩 (초기화 대기 중)
당면 목표: 설정 파일(.toml)을 분석하고 SPEC.md를 구체화하여 프로젝트 방향성 확정

---

## 0단계: 컨텍스트 동기화 (필수)

프로젝트 시작 시 AI가 가장 먼저 수행해야 하는 고정 절차입니다.

- [ ] **[CTX-001] 에이전트 프로토콜 숙지**
  - 행동: 루트의 AGENTS.md 파일을 정독한다.
  - 목표: 바이브 코딩을 위한 기본 지침을 이해하고 준비 상태로 전환한다.

- [ ] **[CTX-002] 프로젝트 정체성 주입**
  - 출처: .vibe-coding/project.meta.toml
  - 대상: .vibe-coding/SPEC.md -> 1. 프로젝트 개요
  - 행동: 출처의 파일을 분석해 대상 파일의 `프로젝트 개요` 섹션을 작성한다.

- [ ] **[CTX-003] 기술 스택 확정**
  - 출처: .vibe-coding/stack.manifest.toml
  - 대상: .vibe-coding/SPEC.md -> 2. 기술 아키텍처
  - 행동: true로 설정된 항목만 추출해 `기술 아키텍처` 섹션을 작성한다.

- [ ] **[CTX-004] 지식 및 경험 데이터베이스 로드**
  - 출처: .vibe-coding/KNOWLEDGE/ 폴더 전체, .vibe-coding/TROUBLE/SOLVED.md
  - 행동: KNOWLEDGE 폴더의 최신 기술 변경사항과 SOLVED.md의 트러블슈팅 내역을 정독하여 학습한다.
  - 목표: 구버전 문법(Deprecated) 사용을 피하고, 과거와 동일한 시행착오(Known Issues) 반복을 원천 차단한다.

---

## 1단계: 프로젝트 기초 공사

SPEC 내용이 확정된 후 진행합니다.

- [ ] **[SCAF-001] 베이스 프로젝트 생성**
  - 행동: 확정된 스택에 맞춰 초기 명령어 실행 (bun create, bun install 등)
  - 확인: package.json 생성 여부

- [ ] **[SCAF-002] 핵심 설정 적용**
  - 행동: svelte.config.js, vite.config.ts, uno.config.ts 등 기본 설정 파일 작성
  - 참고: SPEC.md의 아키텍처 섹션 준수

## 2단계: 구현 및 개발

이 단계부터는 각 작업을 수행할 때 아래 **[작업 루틴]**을 반드시 준수해야 합니다.

> **⚡ 작업 루틴 (Cycle Protocol)**
>
> 1. **업데이트 (Pre-work):** 작업 시작 전 `bun update`를 실행하여 모든 패키지를 최신 상태로 동기화한다.
> 2. **현행화 (Sync):** 업데이트된 패키지 버전을 확인하고 `.vibe-coding/SPEC.md`의 `Technical Architecture` 섹션에 변경 사항을 즉시 반영한다.
> 3. **구현 (Coding):** 할 일 목록의 기능을 구현한다.
> 4. **검수 (Post-work):** 구현 완료 직후 `.vibe-coding/REVIEW.md` 파일을 로드하여 체크리스트를 점검하고, 통과 시 완료 처리한다.

- [ ] (1단계 완료 후 생성될 세부 작업 목록)
