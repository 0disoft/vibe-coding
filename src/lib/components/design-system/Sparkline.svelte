<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  import type { IntentWithNeutral } from "./types";
  import { toIntentCss } from "./types";

  type Props = Omit<HTMLAttributes<SVGSVGElement>, "children"> & {
    values: number[];
    width?: number;
    height?: number;
    padding?: number;
    strokeWidth?: number;
    intent?: IntentWithNeutral;
    label?: string;
  };

  let {
    values,
    width = 140,
    height = 36,
    padding = 3,
    strokeWidth = 2,
    intent = "neutral",
    label,
    class: className = "",
    ...rest
  }: Props = $props();

  let intentCss = $derived(toIntentCss(intent));

  function safeNumber(n: number) {
    return Number.isFinite(n) ? n : 0;
  }

  let min = $derived.by(() => {
    if (values.length === 0) return 0;
    return Math.min(...values.map(safeNumber));
  });
  let max = $derived.by(() => {
    if (values.length === 0) return 0;
    return Math.max(...values.map(safeNumber));
  });
  let range = $derived.by(() => {
    const r = max - min;
    return r <= 0 ? 1 : r;
  });

  function pointAt(i: number) {
    const v = safeNumber(values[i] ?? 0);
    const n = values.length;
    const xSpan = Math.max(1, width - padding * 2);
    const ySpan = Math.max(1, height - padding * 2);

    const x = n <= 1 ? width / 2 : padding + (i / (n - 1)) * xSpan;
    const yNorm = (v - min) / range;
    const y = padding + (1 - yNorm) * ySpan;
    return { x, y };
  }

  let d = $derived.by(() => {
    if (values.length === 0) return "";
    const pts = values.map((_, i) => pointAt(i));
    const first = pts[0];
    if (!first) return "";
    return [`M ${first.x} ${first.y}`, ...pts.slice(1).map((p) => `L ${p.x} ${p.y}`)].join(" ");
  });

  let ariaHidden = $derived(label ? undefined : true);
  let role = $derived(label ? "img" : undefined);
</script>

<svg
  {...rest}
  class={["ds-sparkline", className].filter(Boolean).join(" ")}
  viewBox={`0 0 ${width} ${height}`}
  width={width}
  height={height}
  {role}
  aria-hidden={ariaHidden}
  aria-label={label}
  data-ds-intent={intentCss}
>
  {#if label}
    <title>{label}</title>
    <desc>min {min}, max {max}</desc>
  {/if}
  <path
    d={d}
    fill="none"
    stroke="currentColor"
    stroke-width={strokeWidth}
    stroke-linecap="round"
    stroke-linejoin="round"
    vector-effect="non-scaling-stroke"
  />
</svg>

