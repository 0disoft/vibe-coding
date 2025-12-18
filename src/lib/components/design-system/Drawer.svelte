<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  import DsSheet from "./Sheet.svelte";

  interface Props extends Omit<HTMLAttributes<HTMLDialogElement>, "children"> {
    id: string;
    title: string;
    description?: string;
    open: boolean;
    onOpenChange?: (next: boolean) => void;
    size?: "sm" | "md" | "lg";
    closeOnOutsideClick?: boolean;
    closeOnEscape?: boolean;
    returnFocusTo?: HTMLElement | null;
    initialFocus?: string | HTMLElement | null;
    closeLabel?: string;
    children?: Snippet;
    footer?: Snippet;
  }

  let {
    id,
    title,
    description,
    open,
    onOpenChange,
    size = "md",
    closeOnOutsideClick = true,
    closeOnEscape = true,
    returnFocusTo = null,
    initialFocus = null,
    closeLabel = "Close",
    class: className = "",
    children,
    footer: footerContent,
    ...rest
  }: Props = $props();
</script>

<DsSheet
  {...rest}
  {id}
  {title}
  {description}
  {open}
  {onOpenChange}
  side="bottom"
  {size}
  {closeOnOutsideClick}
  {closeOnEscape}
  {returnFocusTo}
  {initialFocus}
  {closeLabel}
  class={className}
>
  {#if children}
    {@render children()}
  {/if}

  {#snippet footer()}
    {#if footerContent}
      {@render footerContent()}
    {/if}
  {/snippet}
</DsSheet>

