<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  import type { IntentWithNeutral } from "./types";
  import { toIntentCss } from "./types";

  type Size = "sm" | "md";

  interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
    intent?: IntentWithNeutral;
    label?: string;
    size?: Size;
    pulse?: boolean;
    announce?: boolean;
    ariaLive?: "polite" | "assertive";
    children?: Snippet;
  }

  let {
    intent = "neutral",
    label,
    size = "sm",
    pulse = false,
    announce = false,
    ariaLive,
    class: className = "",
    children,
    ...rest
  }: Props = $props();

  let intentCss = $derived(toIntentCss(intent));
  let resolvedAriaLive = $derived(announce ? ariaLive ?? "polite" : ariaLive);
</script>

<span
  {...rest}
  class={["ds-inline-status", className].filter(Boolean).join(" ")}
  data-ds-intent={intentCss}
  data-ds-size={size}
  data-ds-pulse={pulse ? "true" : undefined}
  role={announce ? "status" : undefined}
  aria-live={resolvedAriaLive}
>
  <span class="ds-inline-status-dot" aria-hidden="true"></span>
  {#if children}
    <span class="ds-inline-status-label">
      {@render children()}
    </span>
  {:else if label}
    <span class="ds-inline-status-label">{label}</span>
  {/if}
</span>
