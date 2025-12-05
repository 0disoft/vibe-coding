# SOLVED ISSUES ARCHIVE

프로젝트 진행 중 발생했던 문제들과 검증된 해결책을 모아둔 데이터베이스입니다.
같은 문제가 발생하면 이 문서를 가장 먼저 참조하십시오.

---

## [SvelteKit / Bun]

### 1. Legacy CLI Deprecation (2025-12-05)

- **증상:** `bun create svelte@latest` 실행 시 `'npm create svelte' has been replaced with 'npx sv create'` 메시지가 뜨며 설치가 진행되지 않음.
- **원인:** Svelte 공식 CLI가 `create-svelte`에서 `sv`로 변경됨. Bun의 `create` 명령어는 구버전 패키지를 참조하고 있음.
- **해결:** 구버전 명령어 대신 `bun x sv create ./` (또는 `npx sv create ./`) 명령어를 사용하여 프로젝트를 생성해야 함.
