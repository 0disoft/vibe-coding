<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  import type { IntentWithNeutral } from "./types";
  import { toIntentCss } from "./types";

  type Variant = "soft" | "outline";
  type Size = "sm" | "md";

  interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
    intent?: IntentWithNeutral;
    variant?: Variant;
    size?: Size;
    start?: Snippet;
    end?: Snippet;
    children?: Snippet;
  }

  let {
    intent = "neutral",
    variant = "soft",
    size = "md",
    class: className = "",
    start,
    end,
    children,
    ...rest
  }: Props = $props();

  let intentCss = $derived(toIntentCss(intent));
  let rootClass = $derived(["ds-tag", className].filter(Boolean).join(" "));
</script>

<span
  {...rest}
  class={rootClass}
  data-ds-intent={intentCss}
  data-ds-variant={variant}
  data-ds-size={size}
>
  {#if start}
    <span class="ds-tag-start" aria-hidden="true">
      {@render start()}
    </span>
  {/if}

  {#if children}
    <span class="ds-tag-label">
      {@render children()}
    </span>
  {/if}

  {#if end}
    <span class="ds-tag-end" aria-hidden="true">
      {@render end()}
    </span>
  {/if}
</span>

