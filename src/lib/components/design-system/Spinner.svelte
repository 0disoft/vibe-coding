<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  import type { IntentWithNeutral } from "./types";
  import { toIntentCss } from "./types";

  type Size = "sm" | "md" | "lg";

  interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
    size?: Size;
    label?: string;
    intent?: IntentWithNeutral;
  }

  let {
    size = "md",
    label,
    intent = "primary",
    class: className = "",
    ...rest
  }: Props = $props();

  let hasLabel = $derived(!!label?.trim());
  let intentCss = $derived(toIntentCss(intent));
  let rootClass = $derived(["ds-spinner", className].filter(Boolean).join(" "));
</script>

<span
  {...rest}
  class={rootClass}
  data-ds-size={size}
  data-ds-intent={intentCss}
  role={hasLabel ? "status" : undefined}
  aria-label={hasLabel ? label : undefined}
  aria-hidden={hasLabel ? undefined : true}
></span>

