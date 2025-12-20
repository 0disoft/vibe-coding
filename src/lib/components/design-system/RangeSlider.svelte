<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  type RangeValue = [number, number];

  interface Props
    extends Omit<
      HTMLInputAttributes,
      "type" | "value" | "min" | "max" | "step" | "id"
    > {
    value?: RangeValue;
    min?: number;
    max?: number;
    step?: number;
    /** aria-label (최소/최대) */
    minLabel?: string;
    maxLabel?: string;
    id?: string;
    describedBy?: string;
  }

  let {
    value = $bindable<RangeValue>([0, 0]),
    min = 0,
    max = 100,
    step = 1,
    minLabel = "Minimum",
    maxLabel = "Maximum",
    id: idProp,
    describedBy,
    class: className = "",
    ...rest
  }: Props = $props();

  const generatedId = $props.id();
  let id = $derived(idProp ?? generatedId);

  function clamp(n: number) {
    if (max <= min) return min;
    return Math.min(max, Math.max(min, n));
  }

  function setLow(next: number) {
    const low = clamp(next);
    const high = clamp(value[1]);
    value = [Math.min(low, high), high];
  }

  function setHigh(next: number) {
    const low = clamp(value[0]);
    const high = clamp(next);
    value = [low, Math.max(low, high)];
  }

  let low = $derived(clamp(Math.min(value[0], value[1])));
  let high = $derived(clamp(Math.max(value[0], value[1])));

  let percentLow = $derived.by(() => {
    if (max <= min) return 0;
    return ((low - min) / (max - min)) * 100;
  });

  let percentHigh = $derived.by(() => {
    if (max <= min) return 0;
    return ((high - min) / (max - min)) * 100;
  });

  // thumbs overlap 시 조작 가능한 thumb가 위로 오도록
  let zLow = $derived(low >= max - step ? 3 : 2);
  let zHigh = $derived(low >= max - step ? 2 : 3);
</script>

<div class={["ds-range-slider", className].filter(Boolean).join(" ")}>
  <div class="ds-slider-track" aria-hidden="true">
    <div
      class="ds-slider-fill"
      style={`inset-inline-start: ${percentLow}%; width: ${Math.max(0, percentHigh - percentLow)}%;`}
    ></div>
  </div>

  <div class="ds-range-slider-input">
    <input
      {...rest}
      id={`${id}-min`}
      type="range"
      class="ds-slider-input"
      min={min}
      max={max}
      step={step}
      value={low}
      aria-label={minLabel}
      aria-describedby={describedBy}
      style={`z-index: ${zLow};`}
      oninput={(e) => setLow(Number((e.currentTarget as HTMLInputElement).value))}
    />
    <input
      {...rest}
      id={`${id}-max`}
      type="range"
      class="ds-slider-input"
      min={min}
      max={max}
      step={step}
      value={high}
      aria-label={maxLabel}
      aria-describedby={describedBy}
      style={`z-index: ${zHigh};`}
      oninput={(e) => setHigh(Number((e.currentTarget as HTMLInputElement).value))}
    />
  </div>
</div>
