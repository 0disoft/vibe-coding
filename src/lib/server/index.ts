/**
 * $lib/server Barrel Export (서버 전용 코드)
 *
 * 이 폴더는 서버에서만 실행되는 코드를 모아두는 곳입니다.
 * 나중에 Elysia 등 별도 백엔드로 분리할 때 이 폴더 전체를 이동하면 됩니다.
 *
 * 사용 예시:
 * import { db, userService } from '$lib/server';
 *
 * 포함할 것:
 * - 데이터베이스 연결/쿼리
 * - 인증/권한 로직
 * - 외부 API 호출
 * - 비즈니스 서비스 레이어
 *
 * ⚠️ 이 폴더의 코드는 +page.svelte, +layout.svelte 등 클라이언트에서 import 하면 안 됩니다.
 * ⚠️ +page.server.ts, +server.ts, hooks.server.ts 에서만 사용하세요.
 */

// 아래에 서버 전용 모듈 export 추가
// export { db } from './db';
// export { authService } from './services/auth';
// export { userService } from './services/user';
