<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type Size = "sm" | "md" | "lg";

  interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    value?: number;
    onValueChange?: (next: number) => void;
    max?: number;
    readOnly?: boolean;
    size?: Size;
    label?: string;
  }

  let {
    value = $bindable(0),
    onValueChange,
    max = 5,
    readOnly = false,
    size = "md",
    label = "Rating",
    class: className = "",
    ...rest
  }: Props = $props();

  let hoverValue = $state<number | null>(null);
  let effective = $derived(hoverValue ?? value);

  function set(next: number) {
    if (readOnly) return;
    value = next;
    onValueChange?.(next);
  }

  function onKeyDown(e: KeyboardEvent) {
    if (readOnly) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      set(Math.max(0, value - 1));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      set(Math.min(max, value + 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      set(0);
    } else if (e.key === "End") {
      e.preventDefault();
      set(max);
    }
  }
</script>

<div
  {...rest}
  class={["ds-rating", className].filter(Boolean).join(" ")}
  role="radiogroup"
  aria-label={label}
  data-ds-size={size}
  onkeydown={onKeyDown}
  onmouseleave={() => (hoverValue = null)}
>
  {#each Array.from({ length: Math.max(1, max) }, (_, i) => i + 1) as n (n)}
    <button
      type="button"
      class="ds-rating-star"
      role="radio"
      aria-checked={value === n}
      aria-label={`${n} / ${max}`}
      disabled={readOnly}
      data-active={effective >= n ? "true" : undefined}
      onclick={() => set(n)}
      onmousemove={() => {
        if (!readOnly) hoverValue = n;
      }}
    >
      <span class="i-lucide-star h-4 w-4"></span>
    </button>
  {/each}
</div>

