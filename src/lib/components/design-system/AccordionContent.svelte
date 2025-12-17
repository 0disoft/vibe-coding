<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  import { getAccordionContext } from "./accordion-context";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    value: string;
    children?: Snippet;
  }

  let {
    value,
    class: className = "",
    children,
    ...rest
  }: Props = $props();

  const accordion = getAccordionContext();

  let isOpen = $derived(accordion.isOpen(value));
  let triggerId = $derived(
    `${accordion.baseId}-trigger-${encodeURIComponent(value).replace(/%/g, "_")}`,
  );
  let contentId = $derived(
    `${accordion.baseId}-content-${encodeURIComponent(value).replace(/%/g, "_")}`,
  );

  let rootClass = $derived(["ds-accordion-content", className].filter(Boolean).join(" "));
</script>

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

