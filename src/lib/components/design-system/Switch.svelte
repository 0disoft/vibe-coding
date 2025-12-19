<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";

  import { useId } from "$lib/shared/utils/use-id";

  type Size = "sm" | "md";

  interface Props extends Omit<HTMLInputAttributes, "type" | "size" | "checked"> {
    checked?: boolean;
    size?: Size;
    label?: string;
    ref?: HTMLInputElement | null;
    children?: Snippet;
  }

  let {
    id: idProp,
    checked = $bindable(false),
    size = "md",
    label,
    ref = $bindable(null),
    class: className = "",
    children,
    ...rest
  }: Props = $props();

  const generatedId = useId("ds-switch");
  let id = $derived(idProp ?? generatedId);

  let isDisabled = $derived(!!rest.disabled);
  let hasLabel = $derived(!!(label || children));
  let resolvedAriaLabel = $derived(rest["aria-label"] ?? (hasLabel ? undefined : label));
  let rootClass = $derived(["ds-switch", className].filter(Boolean).join(" "));
</script>

<label class={rootClass} data-ds-size={size} data-disabled={isDisabled ? "true" : undefined}>
  <input
    {...rest}
    bind:this={ref}
    id={id}
    type="checkbox"
    role="switch"
    bind:checked
    class="ds-switch-native"
    aria-label={resolvedAriaLabel}
  />

  <span class="ds-switch-track" aria-hidden="true">
    <span class="ds-switch-thumb"></span>
  </span>

  {#if label || children}
    <span class="ds-switch-label">
      {#if children}
        {@render children()}
      {:else}
        {label}
      {/if}
    </span>
  {/if}
</label>

