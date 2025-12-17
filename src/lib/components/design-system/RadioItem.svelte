<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";

  import { useId } from "$lib/shared/utils/use-id";

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
  const generatedId = useId("ds-radio");
  let id = $derived(rest.id ?? generatedId);

  let isDisabled = $derived(group.disabled || disabled);
  let checked = $derived(group.value() === value);
  let resolvedAriaLabel = $derived(rest["aria-label"] ?? label);

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
    aria-describedby={group.describedBy}
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
      {:else}
        {#if label}
          <span class="ds-radio-label">{label}</span>
        {/if}
        {#if description}
          <span class="ds-radio-description">{description}</span>
        {/if}
      {/if}
    </span>
  {/if}
</label>
