# Work In Progress

> 복잡한 작업의 세부 계획을 기록하고 추적하는 공간입니다.
> `AGENTS.md`의 [기본 운영 원칙]에 따라 복잡한 요청 시 이 문서를 활용합니다.

## 현재 작업

- i18n 메타(타이틀/설명) 국제화 정리
- GitHub Actions 유닛 테스트 실패 원인 점검

## 작업 후보 목록 (다음 액션)

### 1) i18n 메타(타이틀/설명) 국제화 정리

**목표:**

- 전역 `<title>`/`meta description`이 20개 언어에서 일관되게 로케일 기반으로 렌더링되게 한다.
- 정책/약관 페이지의 “한국어/영어만 분기”를 메시지 기반으로 정리한다.

### 1-1. i18n 현황 파악 (Status)

- [ ] `src/routes/+layout.svelte`가 `site.name`, `site.description`만 사용(로케일 무관)
- [ ] 홈(`src/routes/+page.svelte`) 카피가 하드코딩(메시지 키 미사용)
- [ ] 정책/약관(`src/routes/[[lang]]/*`) 일부는 `ko` vs `en` 하드코딩 분기
- [ ] `messages/*.json`에는 홈 메타(타이틀/설명)용 키가 아직 없음

### 1-2. i18n 실행 계획 (Plan)

1. `messages/en.json`에 홈/전역 메타 키 추가 (예: `meta_site_title`, `meta_site_description`, `meta_home_title`, `meta_home_description`)
1. 19개 언어 파일에 동일 키 추가(초기값은 en 복사 → 이후 번역 교체)
1. `src/routes/+layout.svelte`에서 `getLocale()` + messages로 `<title>`/`description`을 로케일 기반으로 설정
1. `src/routes/+page.svelte`의 랜딩 카피를 messages 키로 치환(최소 1차 범위만)
1. 정책/약관 페이지의 `ko` vs `en` 분기를 messages로 치환(점진 적용)

### 1-3. i18n 진행 상황 (Progress)

- [ ] (대기)

### 2) GitHub Actions 유닛 테스트 실패 점검(.temporary.txt 기반)

**목표:**

- CI에서 “유닛 테스트”가 실패하지 않도록 원인을 재현/수정한다.

### 2-1. CI 현황 파악 (Status)

- [ ] `.vibe-coding/.temporary.txt`의 실패 로그 확인
- [ ] 로컬에서 `bun test:unit` 재현 여부 확인

### 2-2. CI 실행 계획 (Plan)

1. `.vibe-coding/.temporary.txt` 로그에서 최초 실패 원인(스택트레이스) 추출
1. 실패가 환경 의존(Windows/Linux, Playwright 설치 여부, Paraglide 산출물 여부)인지 분류
1. 필요한 경우 스크립트/워크플로우/테스트를 최소 수정으로 안정화
1. 원인/해결을 `.vibe-coding/TROUBLE/SOLVED.md`에 기록

### 2-3. CI 진행 상황 (Progress)

- [ ] (대기)

### 3) 문서 동기화(TREE 등)

**목표:**

- 실제 라우트/컴포넌트 구조가 `.vibe-coding/TREE.md`에 반영되게 한다.

### 3-1. TREE 현황 파악 (Status)

- [ ] `.vibe-coding/TREE.md`의 `src/routes` 섹션이 `lab`만 언급하고 `[[lang]]` 하위 라우트(terms/privacy/gdpr/cookie/security/bug-bounty)를 누락

### 3-2. TREE 실행 계획 (Plan)

1. `src/routes/[[lang]]/*` 라우트 목록을 `TREE.md`에 추가
1. 디자인 시스템 관련 파일/경로가 변경된 경우 함께 갱신

### 3-3. TREE 진행 상황 (Progress)

- [ ] (대기)
