/**
 * $lib/shared Barrel Export (프론트엔드/백엔드 공유 코드)
 *
 * 이 폴더는 클라이언트와 서버 양쪽에서 사용할 수 있는 코드를 모아두는 곳입니다.
 * 나중에 모노레포로 전환 시 packages/shared 로 이동하면 됩니다.
 *
 * 사용 예시:
 * import { formatDate, validateEmail } from '$lib/shared';
 * import type { ApiResponse, PaginatedResult } from '$lib/shared';
 *
 * 포함할 것:
 * - 유틸리티 함수 (date, string, validation)
 * - 공용 타입/인터페이스
 * - 상수 (에러 코드, 상태 코드)
 * - Zod/TypeBox 스키마 (API 요청/응답 검증용)
 *
 * ⚠️ 브라우저 API(window, document)나 서버 API(fs, process)에 의존하면 안 됩니다.
 * ⚠️ 순수 TypeScript/JavaScript 코드만 작성하세요.
 */

// ─────────────────────────────────────────────────────────────
// 유틸리티 함수
// ─────────────────────────────────────────────────────────────
// export { formatDate, formatCurrency } from './utils/format';
// export { validateEmail, validatePhone } from './utils/validate';

// ─────────────────────────────────────────────────────────────
// 공용 타입
// ─────────────────────────────────────────────────────────────
// export type { ApiResponse, ApiError } from './types/api';
// export type { PaginatedResult, PaginationParams } from './types/pagination';

// ─────────────────────────────────────────────────────────────
// 스키마 (TypeBox)
// ─────────────────────────────────────────────────────────────
// export { UserSchema, CreateUserSchema } from './schemas/user';
