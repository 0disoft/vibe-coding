<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  import { getAccordionContext, setAccordionItemContext } from "./accordion-context";
  import { accordionContentId, accordionItemId, accordionTriggerId } from "./accordion-ids";

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
  let isItemDisabled = $derived(accordion.disabled || disabled);
  let itemId = $derived(accordionItemId(accordion.baseId, value));
  let triggerId = $derived(accordionTriggerId(accordion.baseId, value));
  let contentId = $derived(accordionContentId(accordion.baseId, value));

  setAccordionItemContext({
    get value() {
      return value;
    },
    get disabled() {
      return isItemDisabled;
    },
    get isOpen() {
      return isOpen;
    },
    get triggerId() {
      return triggerId;
    },
    get contentId() {
      return contentId;
    },
    get itemId() {
      return itemId;
    },
  });
  let rootClass = $derived(["ds-accordion-item", className].filter(Boolean).join(" "));
</script>

<div
  {...rest}
  class={rootClass}
  data-state={isOpen ? "open" : "closed"}
  data-disabled={isItemDisabled ? "true" : undefined}
  data-ds-accordion-item="true"
  data-value={value}
  id={itemId}
>
  {#if children}
    {@render children()}
  {/if}
</div>

