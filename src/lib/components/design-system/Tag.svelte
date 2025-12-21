<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  import { DsIcon } from "$lib/components/design-system";

  import type { IntentWithNeutral } from "./types";
  import { toIntentCss } from "./types";

  type Variant = "soft" | "outline";
  type Size = "sm" | "md";
  type RootTag = "span" | "a" | "button";

  interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    intent?: IntentWithNeutral;
    variant?: Variant;
    size?: Size;
    start?: Snippet;
    end?: Snippet;
    children?: Snippet;
    remove?: Snippet;
    onRemove?: () => void;
    removeLabel?: string;
    as?: RootTag;
    href?: string;
    target?: string;
    rel?: string;
    type?: "button" | "submit" | "reset";
    status?: boolean;
    flipStartInRtl?: boolean;
    flipEndInRtl?: boolean;
  }

  let {
    intent = "neutral",
    variant = "soft",
    size = "md",
    class: className = "",
    start,
    end,
    remove,
    onRemove,
    removeLabel = "Remove tag",
    as,
    href,
    target,
    rel,
    type,
    status = false,
    flipStartInRtl = false,
    flipEndInRtl = false,
    role: roleProp,
    "aria-live": ariaLiveProp,
    children,
    ...rest
  }: Props = $props();

  let intentCss = $derived(toIntentCss(intent));
  let rootClass = $derived(["ds-tag", className].filter(Boolean).join(" "));
  let resolvedTag = $derived.by(() => as ?? (href ? "a" : "span"));
  let resolvedRole = $derived.by(() => roleProp ?? (status ? "status" : undefined));
  let resolvedAriaLive = $derived.by(() => ariaLiveProp ?? (status ? "polite" : undefined));
  let resolvedType = $derived.by(() =>
    resolvedTag === "button" ? type ?? "button" : undefined,
  );
  let showRemove = $derived(!!remove || !!onRemove);
</script>

<svelte:element
  this={resolvedTag}
  {...rest}
  class={rootClass}
  data-ds-intent={intentCss}
  data-ds-variant={variant}
  data-ds-size={size}
  data-ds-interactive={resolvedTag !== "span" ? "true" : undefined}
  role={resolvedRole}
  aria-live={resolvedAriaLive}
  href={resolvedTag === "a" ? href : undefined}
  target={resolvedTag === "a" ? target : undefined}
  rel={resolvedTag === "a" ? rel : undefined}
  type={resolvedType}
>
  {#if start}
    <span
      class="ds-tag-start"
      aria-hidden="true"
      data-flip-rtl={flipStartInRtl ? "true" : undefined}
    >
      {@render start()}
    </span>
  {/if}

  {#if children}
    <span class="ds-tag-label">
      {@render children()}
    </span>
  {/if}

  {#if end}
    <span
      class="ds-tag-end"
      aria-hidden="true"
      data-flip-rtl={flipEndInRtl ? "true" : undefined}
    >
      {@render end()}
    </span>
  {/if}

  {#if showRemove}
    <button
      type="button"
      class="ds-tag-remove"
      aria-label={removeLabel}
      onclick={() => onRemove?.()}
    >
      {#if remove}
        {@render remove()}
      {:else}
        <DsIcon name="x" size="xs" />
      {/if}
    </button>
  {/if}
</svelte:element>

