<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { slide, type SlideParams } from "svelte/transition";

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

  let isOpen = $derived(item.isOpen);
  let triggerId = $derived(item.triggerId);
  let contentId = $derived(item.contentId);

  let rootClass = $derived(["ds-accordion-content", className].filter(Boolean).join(" "));
  let slideParams = $derived(transitionParams ?? { duration: 200 });
</script>

{#if keepMounted}
  <div
    {...rest}
    class={rootClass}
    id={contentId}
    aria-labelledby={triggerId}
    role="region"
    hidden={!isOpen}
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

