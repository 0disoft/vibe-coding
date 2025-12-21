<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Columns = 1 | 2;

  interface Props extends Omit<HTMLAttributes<HTMLFieldSetElement>, "children"> {
    id?: string;
    title?: string;
    description?: string;
    actions?: Snippet;
    columns?: Columns;
    disabled?: boolean;
    "aria-label"?: string;
    children?: Snippet;
  }

  const generatedId = $props.id();

  let {
    id = generatedId,
    title,
    description,
    actions,
    columns = 1,
    disabled = false,
    "aria-label": ariaLabelProp,
    class: className = "",
    children,
    ...rest
  }: Props = $props();

  let descriptionId = $derived(description ? `${id}-desc` : undefined);
  let legendId = $derived(title ? `${id}-legend` : undefined);
  let resolvedAriaLabel = $derived(title ? undefined : ariaLabelProp);
</script>

<fieldset
  {...rest}
  {id}
  class={["ds-form-section", className].filter(Boolean).join(" ")}
  aria-describedby={descriptionId}
  aria-labelledby={legendId}
  aria-label={resolvedAriaLabel}
  data-ds-columns={columns}
  {disabled}
>
  {#if title}
    <legend class="ds-form-section-legend" id={legendId}>
      {title}
    </legend>
  {/if}

  {#if description || actions}
    <div class="ds-form-section-header">
      {#if description}
        <p id={descriptionId} class="ds-form-section-description">
          {description}
        </p>
      {/if}
      {#if actions}
        <div class="ds-form-section-actions">
          {@render actions()}
        </div>
      {/if}
    </div>
  {/if}

  <div class="ds-form-section-body">
    {#if children}
      {@render children()}
    {/if}
  </div>
</fieldset>
