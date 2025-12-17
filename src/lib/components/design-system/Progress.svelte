<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type Size = "sm" | "md";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    value?: number | null;
    max?: number;
    size?: Size;
    /** indeterminate 모드 */
    indeterminate?: boolean;
    label?: string;
  }

  let {
    value = null,
    max = 100,
    size = "md",
    indeterminate = false,
    label,
    class: className = "",
    ...rest
  }: Props = $props();

  let safeMax = $derived(Math.max(1, max));
  let safeValue = $derived(
    value === null || value === undefined ? null : Math.min(Math.max(value, 0), safeMax),
  );
  let percent = $derived(safeValue === null ? 0 : (safeValue / safeMax) * 100);
  let rootClass = $derived(["ds-progress", className].filter(Boolean).join(" "));
</script>

<div
  {...rest}
  class={rootClass}
  data-ds-size={size}
  role="progressbar"
  aria-label={label}
  aria-valuemin={indeterminate ? undefined : 0}
  aria-valuemax={indeterminate ? undefined : safeMax}
  aria-valuenow={indeterminate ? undefined : safeValue ?? undefined}
  aria-valuetext={indeterminate ? "Loading" : undefined}
>
  <div class="ds-progress-track">
    <div
      class={["ds-progress-indicator", indeterminate ? "is-indeterminate" : ""]
        .filter(Boolean)
        .join(" ")}
      style={indeterminate ? undefined : `width: ${percent}%`}
    ></div>
  </div>
</div>

