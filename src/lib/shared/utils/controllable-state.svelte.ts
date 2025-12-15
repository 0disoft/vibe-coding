/**
 * Controlled/Uncontrolled 상태 관리 유틸
 *
 * React의 useControllableState 패턴을 Svelte 5 runes로 구현.
 * Dropdown, Tooltip 등에서 open/onOpenChange 패턴을 간소화합니다.
 *
 * @example
 * ```ts
 * // Props에서 controlled value와 callback 받음
 * let { open, onOpenChange } = $props();
 *
 * // 유틸 사용
 * let openState = createControllableState({
 *   value: () => open,
 *   onChange: onOpenChange,
 *   defaultValue: false
 * });
 *
 * // 사용
 * openState.value = true; // 열기
 * if (openState.value) { ... } // 읽기
 * ```
 */

type ControllableStateOptions<T> = {
  /** 외부에서 제공하는 controlled value (undefined면 uncontrolled) */
  value: () => T | undefined;
  /** 값 변경 시 호출되는 콜백 */
  onChange?: (value: T) => void;
  /** uncontrolled 모드의 초기값 */
  defaultValue: T;
};

type ControllableStateReturn<T> = {
  /** 현재 값 (controlled면 외부값, uncontrolled면 내부값) */
  value: T;
  /** controlled 모드 여부 */
  readonly isControlled: boolean;
};

/**
 * Controlled/Uncontrolled 상태를 통합 관리하는 객체 생성
 */
export function createControllableState<T>(
  options: ControllableStateOptions<T>
): ControllableStateReturn<T> {
  let internal = $state(options.defaultValue);

  return {
    get value(): T {
      const external = options.value();
      return external !== undefined ? external : internal;
    },
    set value(newValue: T) {
      const external = options.value();
      if (external === undefined) {
        internal = newValue;
      }
      options.onChange?.(newValue);
    },
    get isControlled(): boolean {
      return options.value() !== undefined;
    }
  };
}
