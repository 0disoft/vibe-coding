<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";

  import { getRadioGroupContext } from "./radio-group-context";

  interface Props extends Omit<HTMLInputAttributes, "type" | "checked" | "value"> {
    value: string;
    disabled?: boolean;
    label?: string;
    description?: string;
    ref?: HTMLInputElement | null;
    children?: Snippet;
  }

  let {
    value,
    disabled = false,
    label,
    description,
    ref = $bindable(null),
    class: className = "",
    children,
    ...rest
  }: Props = $props();

  const group = getRadioGroupContext();
  const generatedId = $props.id();
  let id = $derived(rest.id ?? generatedId);
  let descriptionId = $derived(description ? `${id}-desc` : undefined);

  let isDisabled = $derived(group.disabled || disabled);
  let checked = $derived(group.value === value);
  let hasLabel = $derived(!!(label || children));
  let resolvedAriaLabel = $derived(rest["aria-label"] ?? (hasLabel ? undefined : label));
  let mergedDescribedBy = $derived(
    [group.describedBy, descriptionId].filter(Boolean).join(" ") || undefined
  );

  function onChange() {
    if (isDisabled) return;
    group.setValue(value);
  }

  let rootClass = $derived(["ds-radio-item", className].filter(Boolean).join(" "));
</script>

<label class={rootClass} data-disabled={isDisabled ? "true" : undefined}>
  <input
    {...rest}
    bind:this={ref}
    id={id}
    class="ds-radio-native"
    type="radio"
    name={group.name}
    value={value}
    checked={checked}
    disabled={isDisabled}
    required={group.required}
    aria-label={resolvedAriaLabel}
    aria-describedby={mergedDescribedBy}
    onchange={onChange}
  />

  <span class="ds-radio-control" aria-hidden="true">
    {#if checked}
      <span class="ds-radio-dot"></span>
    {/if}
  </span>

  {#if children || label || description}
    <span class="ds-radio-text">
      {#if children}
        {@render children()}
      {:else if label}
        <span class="ds-radio-label">{label}</span>
      {/if}
      {#if description}
        <span id={descriptionId} class="ds-radio-description">{description}</span>
      {/if}
    </span>
  {/if}
</label>
