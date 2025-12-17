<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  import { DsIcon } from "$lib/components/design-system";
  import { getAccordionContext } from "./accordion-context";

  interface Props extends Omit<HTMLButtonAttributes, "children" | "type"> {
    value: string;
    disabled?: boolean;
    children?: Snippet;
  }

  let {
    value,
    disabled = false,
    class: className = "",
    children,
    onclick,
    onkeydown,
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

  function handleClick(e: MouseEvent) {
    if (disabled) {
      e.preventDefault();
      return;
    }
    accordion.toggle(value);
    onclick?.(e as any);
  }

  function handleKeyDown(e: KeyboardEvent) {
    const currentTarget = e.currentTarget as HTMLElement;
    const root = currentTarget.closest('[data-ds-accordion-root="true"]') ?? currentTarget.closest(".ds-accordion");
    if (!root) {
      onkeydown?.(e as any);
      return;
    }

    const triggers = Array.from(
      root.querySelectorAll<HTMLElement>('[data-ds-accordion-trigger="true"]:not([aria-disabled="true"])'),
    );
    if (!triggers.length) {
      onkeydown?.(e as any);
      return;
    }

    const currentIndex = triggers.indexOf(currentTarget);
    if (currentIndex < 0) {
      onkeydown?.(e as any);
      return;
    }

    let nextIndex = currentIndex;
    if (e.key === "ArrowDown") nextIndex = (currentIndex + 1) % triggers.length;
    else if (e.key === "ArrowUp") nextIndex = (currentIndex - 1 + triggers.length) % triggers.length;
    else if (e.key === "Home") nextIndex = 0;
    else if (e.key === "End") nextIndex = triggers.length - 1;
    else {
      onkeydown?.(e as any);
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
  aria-disabled={disabled || undefined}
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
    <DsIcon name="chevron-down" size="sm" class={isOpen ? "is-open" : ""} />
  </span>
</button>

