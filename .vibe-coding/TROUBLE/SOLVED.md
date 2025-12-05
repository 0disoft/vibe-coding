# SOLVED ISSUES ARCHIVE

프로젝트 진행 중 발생했던 문제들과 검증된 해결책을 모아둔 데이터베이스입니다.
같은 문제가 발생하면 이 문서를 가장 먼저 참조하십시오.

---

## [SvelteKit / Bun]

### 1. Hydration Mismatch (2025-12-05)

- **증상:** `bun run dev` 시 서버/클라이언트 텍스트 불일치 경고 다수 발생.
- **원인:** `detect_browser_locale = true` 설정 시 SSR(기본값)과 CSR(브라우저값)의 언어 설정 차이.
- **해결:** `hooks.server.ts`에서 쿠키 값을 최우선으로 언어 감지하도록 수정.
- **참조:** (원래 로그 파일은 삭제됨, 필요시 커밋 로그 #a1b2c3 참조)

## [Database / D1]

### 1. Schema Push Fail (2025-12-07)

- **증상:** 로컬 마이그레이션 파일이 적용되지 않고 충돌 에러.
- **원인:** 로컬 `.wrangler/state` 파일이 꼬임.
- **해결:** 로컬 DB 파일 삭제 후 `wrangler d1 migrations apply` 재실행.
