# Work In Progress

> 복잡한 작업의 세부 계획을 기록하고 추적하는 공간입니다.
> `AGENTS.md`의 [기본 운영 원칙]에 따라 복잡한 요청 시 이 문서를 활용합니다.

## [작업명]

**목표:**

### 1. 현황 파악 (Status)

- [ ]

### 2. 실행 계획 (Plan)

- [ ]

### 3. 진행 상황 (Progress)

- [ ]

## 디자인 시스템 lab 구축 (DEV 전용)

**목표:**

- 프로젝트 전체 UI를 바꾸지 않고, “토큰/규칙”과 “실물(웹 검증 페이지)”을 분리해 안전하게 검증한다.
- 앱 내부에서 실제 UnoCSS/SSR 테마/폰트 환경 그대로 디자인 시스템을 확인한다.
- `.vibe-coding/TOOLS`에는 정의/운영/체크리스트 같은 “검증 도구”를 남긴다.

### 1. 현황 파악 (Status)

- [x] 색상/타이포 토큰이 `src/styles/tokens.css`에 이미 존재하며, UnoCSS는 `uno.config.ts`에서 OKLCH CSS 변수를 기반으로 유틸리티를 생성한다.
- [x] 현재 루트 페이지가 “타이포그래피 유틸 테스트”로 사용되고 있어, 추가 검증 페이지를 별도 라우트로 두는 편이 안전하다.

### 2. 실행 계획 (Plan)

- [ ] DEV 전용 lab 라우트 `src/routes/lab/*` 추가 (프로덕션에서는 404)
- [ ] lab 컨테이너 스코프 토큰 CSS 추가 (`.ds-lab` 내부에서만 시맨틱 토큰 오버라이드)
- [ ] lab 검증 페이지에서 색상/타이포/폼/상태(hover/focus/disabled/error) 스냅샷성 UI를 제공
- [ ] `.vibe-coding/TOOLS/design-system/`에 정의/체크리스트 문서 추가
- [ ] `.vibe-coding/TREE.md`에 신규 경로/역할 반영

### 3. 진행 상황 (Progress)

- [x] DEV 전용 lab 라우트 `src/routes/lab/*` 추가 (프로덕션에서는 404)
- [x] lab 컨테이너 스코프 토큰 CSS 추가 (`.ds-lab` 내부에서만 시맨틱 토큰 오버라이드)
- [x] lab 검증 페이지에서 토큰/상태 UI(hover/focus/disabled/error) 제공
- [x] `.vibe-coding/TOOLS/design-system/`에 운영/체크리스트 문서 추가
- [x] `.vibe-coding/TREE.md`에 신규 경로/역할 반영
