<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  import { getAccordionContext } from "./accordion-context";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    value: string;
    disabled?: boolean;
    children?: Snippet;
  }

  let {
    value,
    disabled = false,
    class: className = "",
    children,
    ...rest
  }: Props = $props();

  const accordion = getAccordionContext();

  let isOpen = $derived(accordion.isOpen(value));
  let itemId = $derived(`${accordion.baseId}-item-${encodeURIComponent(value).replace(/%/g, "_")}`);
  let rootClass = $derived(["ds-accordion-item", className].filter(Boolean).join(" "));
</script>

<div
  {...rest}
  class={rootClass}
  data-state={isOpen ? "open" : "closed"}
  data-disabled={disabled ? "true" : undefined}
  data-ds-accordion-item="true"
  data-value={value}
  id={itemId}
>
  {#if children}
    {@render children()}
  {/if}
</div>

