/**
 * SSR-safe unique ID generator
 *
 * 서버와 클라이언트에서 동일한 순서로 ID를 생성하여
 * 하이드레이션 불일치를 방지합니다.
 *
 * @example
 * ```ts
 * // 컴포넌트 스크립트 최상단에서 호출
 * const id = useId('ds-dropdown');
 * // 결과: 'ds-dropdown-1', 'ds-dropdown-2', ...
 * ```
 */
let counter = 0;

/**
 * 고유 ID 생성 (SSR-safe)
 * 컴포넌트 인스턴스당 한 번만 호출해야 합니다.
 */
export function useId(prefix = 'ds'): string {
  counter += 1;
  return `${prefix}-${counter}`;
}

/**
 * ID 카운터 리셋 (테스트용)
 * @internal
 */
export function resetIdCounter(): void {
  counter = 0;
}
