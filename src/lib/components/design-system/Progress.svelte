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
    hideLabel?: boolean;
    showValue?: boolean;
    formatValue?: (value: number, percent: number) => string;
  }

  let {
    value = null,
    max = 100,
    size = "md",
    indeterminate = false,
    label,
    hideLabel = false,
    showValue = false,
    formatValue = (_value, percent) => `${Math.round(percent)}%`,
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
  aria-valuetext={indeterminate ? "Loading" : `${Math.round(percent)}%`}
>
  {#if label || showValue}
    <div class="ds-progress-meta">
      {#if label}
        <span class={["ds-progress-label", hideLabel ? "sr-only" : ""].join(" ")}>
          {label}
        </span>
      {:else}
        <span class="ds-progress-label" aria-hidden="true"></span>
      {/if}

      {#if showValue && !indeterminate}
        <span class="ds-progress-value">{formatValue(safeValue ?? 0, percent)}</span>
      {/if}
    </div>
  {/if}

  <div class="ds-progress-track">
    <div
      class={["ds-progress-indicator", indeterminate ? "is-indeterminate" : ""]
        .filter(Boolean)
        .join(" ")}
      style={indeterminate ? undefined : `transform: translateX(-${100 - percent}%)`}
    ></div>
  </div>
</div>

