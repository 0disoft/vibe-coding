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
  let safeValue = $derived(Math.max(0, Math.min(max, value)));
  let starEls = $state<(HTMLButtonElement | null)[]>([]);

  function set(next: number) {
    if (readOnly) return;
    const nextValue = Math.max(0, Math.min(max, next));
    value = nextValue;
    onValueChange?.(nextValue);
  }

  function moveFocus(nextIndex: number) {
    starEls[nextIndex]?.focus();
  }

  function onStarKeyDown(e: KeyboardEvent, index: number) {
    if (readOnly) return;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      if (index === 0) {
        set(0);
        moveFocus(0);
        return;
      }
      const nextIndex = index - 1;
      set(nextIndex + 1);
      moveFocus(nextIndex);
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      const nextIndex = index < max - 1 ? index + 1 : max - 1;
      set(nextIndex + 1);
      moveFocus(nextIndex);
    } else if (e.key === "Home") {
      e.preventDefault();
      set(0);
      moveFocus(0);
    } else if (e.key === "End") {
      e.preventDefault();
      set(max);
      moveFocus(max - 1);
    }
  }
</script>

<div
  {...rest}
  class={["ds-rating", className].filter(Boolean).join(" ")}
  role={readOnly ? "img" : "radiogroup"}
  aria-label={readOnly ? `${label}: ${safeValue} out of ${max} stars` : label}
  data-ds-size={size}
  onmouseleave={() => (hoverValue = null)}
>
  {#if readOnly}
    <div>
      {#each Array.from({ length: Math.max(1, max) }, (_, i) => i + 1) as n (n)}
        <span class="ds-rating-star" data-active={safeValue >= n ? "true" : undefined}>
          <span class="i-lucide-star h-4 w-4"></span>
        </span>
      {/each}
    </div>
  {:else}
    {#each Array.from({ length: Math.max(1, max) }, (_, i) => i + 1) as n, index (n)}
      <button
        bind:this={starEls[index]}
        type="button"
        class="ds-rating-star"
        role="radio"
        aria-checked={value === n}
        aria-label={`${n} star${n > 1 ? "s" : ""}`}
        tabindex={value === n || (value === 0 && n === 1) ? 0 : -1}
        data-active={effective >= n ? "true" : undefined}
        onclick={() => set(n)}
        onmousemove={() => {
          if (!readOnly) hoverValue = n;
        }}
        onkeydown={(e) => onStarKeyDown(e, index)}
      >
        <span class="i-lucide-star h-4 w-4"></span>
      </button>
    {/each}
  {/if}
</div>

