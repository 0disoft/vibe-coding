<script lang="ts">
  import { onMount } from "svelte";
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { slide, type SlideParams } from "svelte/transition";

  import { browser } from "$app/environment";

  import { getAccordionItemContext } from "./accordion-context";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "value"> {
    keepMounted?: boolean;
    transitionParams?: SlideParams;
    children?: Snippet;
  }

  let {
    keepMounted = true,
    transitionParams,
    class: className = "",
    children,
    ...rest
  }: Props = $props();

  const item = getAccordionItemContext();
  let prefersReducedMotion = $state(false);

  let isOpen = $derived(item.isOpen);
  let triggerId = $derived(item.triggerId);
  let contentId = $derived(item.contentId);

  let rootClass = $derived(["ds-accordion-content", className].filter(Boolean).join(" "));
  let slideParams = $derived.by(() => {
    const base = transitionParams ?? { duration: 200 };
    if (!prefersReducedMotion) return base;
    return { ...base, duration: 0 };
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
</script>

{#if keepMounted}
  <div
    {...rest}
    class={rootClass}
    id={contentId}
    aria-labelledby={triggerId}
    role="region"
    hidden={!isOpen}
    inert={!isOpen ? true : undefined}
    data-state={isOpen ? "open" : "closed"}
  >
    <div class="ds-accordion-content-inner">
      {#if children}
        {@render children()}
      {/if}
    </div>
  </div>
{:else if isOpen}
  <div
    {...rest}
    class={rootClass}
    id={contentId}
    aria-labelledby={triggerId}
    role="region"
    data-state="open"
    transition:slide={slideParams}
  >
    <div class="ds-accordion-content-inner">
      {#if children}
        {@render children()}
      {/if}
    </div>
  </div>
{/if}

