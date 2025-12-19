<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  import { DsIcon } from "$lib/components/design-system";
  import { getAccordionContext, getAccordionItemContext } from "./accordion-context";

  interface Props extends Omit<HTMLButtonAttributes, "children" | "type" | "value"> {
    disabled?: boolean;
    children?: Snippet;
  }

  type ButtonClickEvent = Parameters<NonNullable<HTMLButtonAttributes["onclick"]>>[0];
  type ButtonKeyDownEvent = Parameters<NonNullable<HTMLButtonAttributes["onkeydown"]>>[0];

  let {
    disabled = false,
    class: className = "",
    children,
    onclick,
    onkeydown,
    ...rest
  }: Props = $props();

  const accordion = getAccordionContext();
  const item = getAccordionItemContext();

  let isOpen = $derived(item.isOpen);
  let triggerId = $derived(item.triggerId);
  let contentId = $derived(item.contentId);
  let isTriggerDisabled = $derived(item.disabled || disabled);

  function handleClick(e: ButtonClickEvent) {
    if (isTriggerDisabled) {
      e.preventDefault();
      return;
    }
    accordion.toggle(item.value);
    onclick?.(e);
  }

  function handleKeyDown(e: ButtonKeyDownEvent) {
    onkeydown?.(e);
    if (e.defaultPrevented) return;

    const currentTarget = e.currentTarget;
    const root =
      currentTarget.closest('[data-ds-accordion-root="true"]') ??
      currentTarget.closest(".ds-accordion");
    if (!root) return;

    const triggers = Array.from(
      root.querySelectorAll<HTMLElement>('[data-ds-accordion-trigger="true"]:not([disabled])'),
    );
    if (!triggers.length) return;

    const currentIndex = triggers.indexOf(currentTarget);
    if (currentIndex < 0) return;

    let nextIndex = currentIndex;
    if (e.key === "ArrowDown") nextIndex = (currentIndex + 1) % triggers.length;
    else if (e.key === "ArrowUp") nextIndex = (currentIndex - 1 + triggers.length) % triggers.length;
    else if (e.key === "Home") nextIndex = 0;
    else if (e.key === "End") nextIndex = triggers.length - 1;
    else {
      onkeydown?.(e);
      return;
    }

    e.preventDefault();
    triggers[nextIndex]?.focus();
  }

  let rootClass = $derived(["ds-accordion-trigger", className].filter(Boolean).join(" "));
</script>

<button
  {...rest}
  type="button"
  class={rootClass}
  id={triggerId}
  aria-controls={contentId}
  aria-expanded={isOpen}
  aria-disabled={isTriggerDisabled || undefined}
  disabled={isTriggerDisabled || undefined}
  data-state={isOpen ? "open" : "closed"}
  data-ds-accordion-trigger="true"
  onclick={handleClick}
  onkeydown={handleKeyDown}
>
  <span class="ds-accordion-trigger-label">
    {#if children}
      {@render children()}
    {/if}
  </span>
  <span class="ds-accordion-trigger-icon" aria-hidden="true">
    <DsIcon name="chevron-down" size="sm" />
  </span>
</button>

