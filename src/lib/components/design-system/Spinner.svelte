<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type Size = "sm" | "md" | "lg";

  interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
    size?: Size;
    label?: string;
  }

  let {
    size = "md",
    label,
    class: className = "",
    ...rest
  }: Props = $props();

  let hasLabel = $derived(!!label?.trim());
  let rootClass = $derived(["ds-spinner", className].filter(Boolean).join(" "));
</script>

<span
  {...rest}
  class={rootClass}
  data-ds-size={size}
  role={hasLabel ? "status" : undefined}
  aria-label={hasLabel ? label : undefined}
  aria-hidden={hasLabel ? undefined : true}
></span>

