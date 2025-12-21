<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  import { DsIcon } from "$lib/components/design-system";
  import { createControllableState } from "$lib/shared/utils/controllable-state.svelte";

  type SegmentedSize = "sm" | "md" | "lg";

  export type SegmentedItem = {
    value: string;
    label: string;
    icon?: string;
    disabled?: boolean;
  };

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    items: ReadonlyArray<SegmentedItem>;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    size?: SegmentedSize;
    disabled?: boolean;
    ariaLabel?: string;
    ariaLabelledby?: string;
    ariaDescribedby?: string;
  }

  let {
    items,
    value,
    defaultValue,
    onValueChange,
    size = "md",
    disabled = false,
    ariaLabel,
    ariaLabelledby,
    ariaDescribedby,
    class: className = "",
    ...rest
  }: Props = $props();

  let valueState = createControllableState<string>({
    value: () => value,
    onChange: (next) => onValueChange?.(next),
    defaultValue: () => defaultValue ?? items[0]?.value ?? "",
  });

  let currentValue = $derived(valueState.value);
  let itemRefs = $state<Array<HTMLButtonElement | null>>([]);
  let rootEl = $state<HTMLDivElement | null>(null);
  let isRtl = $state(false);

  $effect(() => {
    if (valueState.isControlled) return;
    if (!items.length) return;
    const fallback = defaultValue ?? items[0].value;
    if (!currentValue) {
      if (currentValue !== fallback) valueState.value = fallback;
      return;
    }
    const exists = items.some((item) => item.value === currentValue);
    if (!exists && currentValue !== fallback) valueState.value = fallback;
  });

  $effect(() => {
    if (!rootEl) return;
    isRtl = getComputedStyle(rootEl).direction === "rtl";
  });

  function setValue(next: string) {
    if (next === currentValue) return;
    valueState.value = next;
  }

  function nextEnabledIndex(start: number, delta: number) {
    if (!items.length) return start;
    let idx = start;
    for (let i = 0; i < items.length; i += 1) {
      idx = (idx + delta + items.length) % items.length;
      if (!items[idx]?.disabled) return idx;
    }
    return start;
  }

  function moveFocus(currentIndex: number, delta: number) {
    const nextIndex = nextEnabledIndex(currentIndex, delta);
    const nextItem = items[nextIndex];
    if (!nextItem) return;
    setValue(nextItem.value);
    itemRefs[nextIndex]?.focus();
  }

  function focusBoundary(toEnd: boolean) {
    const indices = items
      .map((_, idx) => idx)
      .filter((idx) => !items[idx]?.disabled);
    if (!indices.length) return;
    const nextIndex = toEnd ? indices[indices.length - 1] : indices[0];
    setValue(items[nextIndex].value);
    itemRefs[nextIndex]?.focus();
  }

  function onItemKeyDown(e: KeyboardEvent, idx: number) {
    if (disabled) return;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const delta = e.key === "ArrowRight" ? (isRtl ? -1 : 1) : isRtl ? 1 : -1;
      moveFocus(idx, delta);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      moveFocus(idx, 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveFocus(idx, -1);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusBoundary(false);
    } else if (e.key === "End") {
      e.preventDefault();
      focusBoundary(true);
    }
  }
</script>

<div
  {...rest}
  bind:this={rootEl}
  class={["ds-segmented", className].filter(Boolean).join(" ")}
  role="radiogroup"
  aria-label={ariaLabel}
  aria-labelledby={ariaLabelledby}
  aria-describedby={ariaDescribedby}
  aria-disabled={disabled || undefined}
  data-ds-size={size}
  data-ds-disabled={disabled ? "true" : undefined}
>
  {#each items as item, idx (item.value)}
    {@const isDisabled = disabled || item.disabled}
    {@const isActive = currentValue === item.value}
    <button
      type="button"
      class={[
        "ds-segmented-item ds-focus-ring",
        isActive ? "is-active" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      role="radio"
      aria-checked={isActive}
      aria-disabled={isDisabled || undefined}
      aria-describedby={ariaDescribedby}
      tabindex={isActive ? 0 : -1}
      disabled={isDisabled}
      onkeydown={(e) => onItemKeyDown(e, idx)}
      onclick={() => {
        if (!isDisabled) setValue(item.value);
      }}
      bind:this={itemRefs[idx]}
    >
      {#if item.icon}
        <DsIcon name={item.icon} size="sm" class="ds-segmented-icon" />
      {/if}
      <span class="ds-segmented-label">{item.label}</span>
    </button>
  {/each}
</div>
