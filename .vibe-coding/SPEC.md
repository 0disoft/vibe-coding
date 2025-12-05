# SPECIFICATION

## 1. Project Overview
>
> ⚠️ 상태: `project.meta.toml` 분석 대기 중
> AI: `TODO.md` 파일에서 [CTX-002] 작업을 수행하며 이 섹션에 요약해 채우십시오.

## 2. Technical Architecture
>
> ⚠️ 상태: `stack.manifest.toml` 분석 대기 중
> AI: `TODO.md` 파일에서 [CTX-003] 작업을 수행하며 카테고리, 기술스택, 버전의 3열 표로 정리하십시오.
> 버전 정보를 명확히 알 수 없는 경우, 억지로 추측하지 말고 해당 칸을 비워두십시오.

## 3. Core Features & Route Map
>
> ⚠️ 상태: 구현 진행 시 지속적 업데이트
> (AI: 기능을 구현할 때마다, 해당 페이지의 URL과 핵심 관련 파일 경로를 아래 형식으로 기록하여 '기능'과 '코드'를 1:1로 매핑하십시오.)

### [예시1] 기능 이름

- **URL:** `/기능-경로`
- **Page Dir:** `src/routes/해당/폴더`
- **Key Modules:**
  - `src/lib/components/관련_컴포넌트.svelte`
  - `src/lib/utils/관련_로직.ts`

### [예시2] 단위 변환기 (Unit Converter)

- **URL:** `/[lang]/tools/converter`
- **Page Dir:** `src/routes/[lang]/tools/converter`
- **Key Modules:**
  - `src/lib/components/inputs/MetricInput.svelte`
  - `src/lib/i18n/ko/index.ts` (한국어 번역 데이터)
  - `src/lib/engine/physics/conversion-tables.ts`
