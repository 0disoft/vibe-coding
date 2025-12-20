<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";

  import { DsIcon } from "$lib/components/design-system";

  interface Props extends Omit<HTMLInputAttributes, "type" | "size"> {
    checked?: boolean;
    indeterminate?: boolean;
    label?: string;
    ref?: HTMLInputElement | null;
    children?: Snippet;
  }

  const generatedId = $props.id();

  let {
    id: idProp,
    checked = $bindable(false),
    indeterminate = false,
    label,
    ref = $bindable(null),
    class: className = "",
    children,
    ...rest
  }: Props = $props();

  let id = $derived(idProp ?? generatedId);

  $effect(() => {
    if (!ref) return;
    ref.indeterminate = indeterminate;
  });

  let isDisabled = $derived(!!rest.disabled);
  let isMixed = $derived(indeterminate);
  let hasVisibleLabel = $derived(!!(label || children));
  let ariaChecked = $derived<"mixed" | undefined>(isMixed ? "mixed" : undefined);
  let resolvedAriaLabel = $derived(
    hasVisibleLabel ? undefined : rest["aria-label"] ?? label,
  );

  let rootClass = $derived(["ds-checkbox", className].filter(Boolean).join(" "));
</script>

<label
  class={rootClass}
  data-disabled={isDisabled ? "true" : undefined}
  for={id}
>
  <input
    {...rest}
    bind:this={ref}
    id={id}
    type="checkbox"
    bind:checked
    class="ds-checkbox-native"
    aria-label={resolvedAriaLabel}
    aria-checked={ariaChecked}
  />

  <span class="ds-checkbox-control" aria-hidden="true">
    {#if isMixed}
      <DsIcon name="minus" size="sm" />
    {:else if checked}
      <DsIcon name="check" size="sm" />
    {/if}
  </span>

  {#if label || children}
    <span class="ds-checkbox-label">
      {#if children}
        {@render children()}
      {:else}
        {label}
      {/if}
    </span>
  {/if}
</label>
