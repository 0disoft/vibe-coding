<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  import { getTabsContext } from "./tabs-context";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    children?: Snippet;
  }

  let {
    class: className = "",
    children,
    ...rest
  }: Props = $props();

  const tabs = getTabsContext();
  let listEl = $state<HTMLDivElement | null>(null);

  $effect(() => {
    if (!listEl) return;
    queueMicrotask(() => {
      const hasSelected = !!listEl?.querySelector('[role="tab"][aria-selected="true"]');
      if (hasSelected) return;

      const first = listEl?.querySelector<HTMLElement>(
        '[role="tab"]:not([aria-disabled="true"])',
      );
      const firstValue = first?.getAttribute("data-value") ?? "";
      if (firstValue) tabs.setValue(firstValue);
    });
  });

  function enabledTabs(container: HTMLElement) {
    return Array.from(
      container.querySelectorAll<HTMLElement>('[role="tab"]:not([aria-disabled="true"])'),
    );
  }

  function onKeyDown(e: KeyboardEvent) {
    const container = e.currentTarget as HTMLElement;
    const items = enabledTabs(container);
    if (!items.length) return;

    const current = document.activeElement as HTMLElement | null;
    const currentIndex = current ? items.indexOf(current) : -1;

    const isHorizontal = tabs.orientation === "horizontal";
    const nextKey = isHorizontal ? "ArrowRight" : "ArrowDown";
    const prevKey = isHorizontal ? "ArrowLeft" : "ArrowUp";

    let nextIndex = currentIndex;
    if (e.key === nextKey) nextIndex = (currentIndex + 1 + items.length) % items.length;
    else if (e.key === prevKey) nextIndex = (currentIndex - 1 + items.length) % items.length;
    else if (e.key === "Home") nextIndex = 0;
    else if (e.key === "End") nextIndex = items.length - 1;
    else return;

    e.preventDefault();
    const nextEl = items[nextIndex];
    nextEl?.focus();

    if (tabs.activationMode === "automatic") {
      const value = nextEl?.getAttribute("data-value");
      if (value) tabs.setValue(value);
    }
  }

  let rootClass = $derived(["ds-tabs-list", className].filter(Boolean).join(" "));
</script>

<div
  {...rest}
  bind:this={listEl}
  class={rootClass}
  role="tablist"
  aria-orientation={tabs.orientation}
  onkeydown={onKeyDown}
>
  {#if children}
    {@render children()}
  {/if}
</div>
