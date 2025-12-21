<script lang="ts">
  import { onMount } from "svelte";
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { fade } from "svelte/transition";

  import { browser } from "$app/environment";

  import { getTabsContext } from "./tabs-context";

  type TabStop = "auto" | "always" | "never";
  type TransitionKind = "none" | "fade";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    value: string;
    children?: Snippet;
    keepMounted?: boolean;
    tabStop?: TabStop;
    transition?: TransitionKind;
    transitionDuration?: number;
  }

  let {
    value,
    class: className = "",
    children,
    keepMounted = true,
    tabStop = "auto",
    transition = "none",
    transitionDuration = 150,
    tabindex: tabIndexProp,
    ...rest
  }: Props = $props();

  const tabs = getTabsContext();
  let panelEl = $state<HTMLDivElement | null>(null);
  let hasFocusable = $state(false);
  let prefersReducedMotion = $state(false);

  let selected = $derived(tabs.isSelected(value));
  let id = $derived(tabs.panelId(value));
  let tabId = $derived(tabs.tabId(value));

  let rootClass = $derived(["ds-tabs-content", className].filter(Boolean).join(" "));

  function updateFocusable() {
    if (!panelEl) return;
    const selector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';
    hasFocusable = !!panelEl.querySelector(selector);
  }

  $effect(() => {
    if (!panelEl) return;
    queueMicrotask(updateFocusable);
    if (typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver(updateFocusable);
    observer.observe(panelEl, {
      childList: true,
      subtree: true,
      attributes: true,
    });
    return () => observer.disconnect();
  });

  onMount(() => {
    if (!browser) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      prefersReducedMotion = media.matches;
    };
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  });

  let resolvedTabIndex = $derived.by(() => {
    if (tabIndexProp !== undefined) return tabIndexProp;
    if (tabStop === "always") return 0;
    if (tabStop === "never") return undefined;
    return hasFocusable ? undefined : 0;
  });

  let transitionDurationMs = $derived(
    transition === "fade" && !prefersReducedMotion ? transitionDuration : 0,
  );
</script>

{#if keepMounted || selected}
  <div
    {...rest}
    bind:this={panelEl}
    class={rootClass}
    id={id}
    role="tabpanel"
    aria-labelledby={tabId}
    tabindex={resolvedTabIndex}
    hidden={keepMounted ? !selected : undefined}
    data-state={selected ? "active" : "inactive"}
    transition:fade={{ duration: transitionDurationMs }}
  >
    {#if children}
      {@render children()}
    {/if}
  </div>
{/if}

