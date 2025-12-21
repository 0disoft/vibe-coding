<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  import { getTabsContext } from "./tabs-context";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    children?: Snippet;
    loop?: boolean;
  }

  let {
    class: className = "",
    children,
    loop = true,
    ...rest
  }: Props = $props();

  const tabs = getTabsContext();
  let listEl = $state<HTMLDivElement | null>(null);
  let lastActiveValue = $state<string | null>(null);
  let lastActiveIndex = $state<number | null>(null);

  function enabledTabs(container: HTMLElement) {
    return Array.from(
      container.querySelectorAll<HTMLElement>('[role="tab"]:not([aria-disabled="true"])'),
    );
  }

  function updateActiveFallback() {
    if (!listEl) return;
    const items = enabledTabs(listEl);
    if (!items.length) return;

    const selected = listEl.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
    if (selected) {
      const selectedValue = selected.getAttribute("data-value");
      if (selectedValue) lastActiveValue = selectedValue;
      const selectedIndex = items.indexOf(selected);
      lastActiveIndex = selectedIndex === -1 ? null : selectedIndex;
      return;
    }

    if (lastActiveValue) {
      const candidate = items.find(
        (item) => item.getAttribute("data-value") === lastActiveValue,
      );
      if (candidate) {
        tabs.setValue(lastActiveValue);
        return;
      }
    }

    const fallbackIndex =
      lastActiveIndex !== null
        ? Math.min(lastActiveIndex, items.length - 1)
        : 0;
    const fallback = items[fallbackIndex] ?? items[0];
    const fallbackValue = fallback?.getAttribute("data-value") ?? "";
    if (fallbackValue) tabs.setValue(fallbackValue);
  }

  $effect(() => {
    if (!listEl) return;
    queueMicrotask(updateActiveFallback);
    if (typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver(updateActiveFallback);
    observer.observe(listEl, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["aria-selected", "aria-disabled", "data-value"],
    });
    return () => observer.disconnect();
  });

  function isRtl(container: HTMLElement) {
    const dir = container.dir || getComputedStyle(container).direction;
    return dir === "rtl";
  }

  function onKeyDown(e: KeyboardEvent) {
    const container = e.currentTarget as HTMLElement;
    const items = enabledTabs(container);
    if (!items.length) return;

    const current = document.activeElement as HTMLElement | null;
    const currentIndex = current ? items.indexOf(current) : -1;

    const isHorizontal = tabs.orientation === "horizontal";
    const shouldFlip = isHorizontal && isRtl(container);
    const nextKey = isHorizontal ? (shouldFlip ? "ArrowLeft" : "ArrowRight") : "ArrowDown";
    const prevKey = isHorizontal ? (shouldFlip ? "ArrowRight" : "ArrowLeft") : "ArrowUp";

    let nextIndex = currentIndex;
    if (e.key === nextKey) {
      if (currentIndex === -1) nextIndex = 0;
      else if (currentIndex < items.length - 1) nextIndex = currentIndex + 1;
      else if (loop) nextIndex = 0;
      else return;
    } else if (e.key === prevKey) {
      if (currentIndex === -1) nextIndex = items.length - 1;
      else if (currentIndex > 0) nextIndex = currentIndex - 1;
      else if (loop) nextIndex = items.length - 1;
      else return;
    } else if (e.key === "Home") nextIndex = 0;
    else if (e.key === "End") nextIndex = items.length - 1;
    else return;

    e.preventDefault();
    const nextEl = items[nextIndex];
    nextEl?.focus();
    nextEl?.scrollIntoView({ block: "nearest", inline: "nearest" });

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
