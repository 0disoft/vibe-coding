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
  - 출처: .vibe-coding/KNOWLEDGE/ 폴더의 파일 전체, .vibe-coding/TROUBLE/SOLVED.md
  - 행동: KNOWLEDGE 폴더의 최신 기술 변경사항과 SOLVED.md의 트러블슈팅 내역을 정독하여 학습한다.
  - 목표: 구버전 문법(Deprecated) 사용을 피하고, 과거와 동일한 시행착오(Known Issues) 반복을 원천 차단한다.

---

## 1단계: 프로젝트 기초 공사

SPEC 내용이 확정된 후 진행합니다.

- [ ] [SCAF-001] 베이스 프로젝트 생성
  - 행동: `bun x sv create ./` 명령어를 실행하여 최신 SvelteKit 프로젝트를 스캐폴딩한다.
    - 주의: 구버전 명령어인 `bun create svelte@latest`는 사용하지 않는다.
  - 옵션 선택 가이드:
    1. 템플릿: Skeleton Project 선택, TypeScript 활성화
    2. 툴링(Add-ons): Prettier, ESLint, Vitest, Playwright, ParaglideJS 반드시 선택
    3. 어댑터: `stack.manifest.toml`의 배포 타깃에 맞는 어댑터 선택
  - 후속: 설치 완료 직후 `bun install` 실행

- [ ] [SCAF-002] 추가 스택 주입 및 설정 (UnoCSS)
  - 행동:
    1. 패키지 설치  
       `bun add -D unocss @unocss/preset-wind4 @unocss/preset-web-fonts @iconify-json/lucide`
       - 설명:  
         - unocss → 유틸리티 엔진 및 Vite 플러그인  
         - @unocss/preset-wind4 → Tailwind v4 스타일 프리셋 및 reset 담당  
         - @unocss/preset-web-fonts → 구글 폰트 연동용 프리셋  
         - @iconify-json/lucide → 아이콘 컬렉션
    2. 설정 파일 생성  
       루트에 `uno.config.ts`를 생성하고 다음 구성을 기본값으로 사용한다.
       - Presets
         - presetWind4  
           - 패키지: `@unocss/preset-wind4`  
           - 옵션: `preflights.reset = true`, `preflights.theme.mode = 'on-demand'`  
           - 역할: reset과 Tailwind v4 스타일 유틸리티 제공  
         - presetAttributify  
           - 패키지: `unocss`  
           - 역할: `text="sm primary"` 형식의 속성 기반 문법 활성화  
         - presetIcons  
           - 패키지: `unocss`  
           - 역할: 아이콘 유틸리티 제공  
         - presetWebFonts  
           - 패키지: `@unocss/preset-web-fonts`  
           - 옵션 예시:
             - provider: `google`  
             - fonts.sans: `Inter`와 시스템 폰트 스택을 함께 등록  
             - fonts.mono: `JetBrains Mono`와 기본 모노스페이스 스택 등록
       - Transformers
         - transformerVariantGroup 사용
       - Icons 설정
         - collections:  
           - lucide 컬렉션을 비동기 로드로 연결  
           - 예시: `lucide: () => import('@iconify-json/lucide/icons.json').then(m => m.default)`
         - scale: 1.2  
         - cdn: `https://esm.sh/` (아이콘 폴백용)
    3. reset 관련 주의사항  
       - 별도의 `@unocss/reset` 패키지는 설치하지 않는다.  
       - 초기화는 presetWind4의 `preflights.reset`에 일임한다.

## 2단계: 구현 및 개발

이 단계부터는 각 작업을 수행할 때 아래 **[개발 전략]**과 **[작업 루틴]**을 반드시 준수해야 합니다.

> **🎨 개발 전략: 화면 우선 (Visual First Strategy)**
>
> - **Rule:** 모든 기능 구현은 반드시 **프론트엔드 화면(UI)**부터 시작한다. DB 설계나 백엔드 로직은 나중이다.
> - **Why:** 눈에 보이는 결과물이 없으면 방향을 잃기 쉽다.
> - **How:** 복잡한 로직 대신 **하드코딩된 목업(Mock) 데이터**를 사용하여 UI를 먼저 완성하고, 시각적으로 확정된 후에 실제 데이터를 연동한다.
>
> **⚡ 작업 루틴 (Cycle Protocol)**
>
> 1. **업데이트 (Pre-work):** 작업 시작 전 `bun update`를 실행하여 모든 패키지를 최신 상태로 동기화한다.
> 2. **현행화 (Sync):** 업데이트된 패키지 버전을 확인하고 `.vibe-coding/SPEC.md`의 `Technical Architecture` 섹션에 변경 사항을 즉시 반영한다.
> 3. **구현 (Coding):** 위 [개발 전략]에 따라 **목업 데이터 기반의 UI**를 우선 구현한다.
> 4. **검수 (Post-work):** 구현 완료 직후 `.vibe-coding/REVIEW.md` 파일을 로드하여 체크리스트를 점검하고, 통과 시 완료 처리한다.

- [ ] (1단계 완료 후 생성될 세부 작업 목록)
