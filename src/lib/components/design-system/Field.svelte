<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';

  type ControlProps = {
    id: string;
    describedBy?: string;
    invalid: boolean;
    required: boolean;
  };

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
    id: string;
    label: string;
    helpText?: string;
    errorText?: string;
    invalid?: boolean;
    required?: boolean;
    children?: Snippet<[ControlProps]>;
  }

  let {
    id,
    label,
    helpText,
    errorText,
    invalid = false,
    required = false,
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  let helpId = $derived(`${id}-help`);
  let errorId = $derived(`${id}-error`);

  let describedBy = $derived.by(() => {
    const ids: string[] = [];
    if (helpText) ids.push(helpId);
    if (invalid && errorText) ids.push(errorId);
    return ids.length ? ids.join(' ') : undefined;
  });

  let controlProps = $derived<ControlProps>({
    id,
    describedBy,
    invalid,
    required
  });
</script>

<div {...rest} class={`ds-field ${className}`.trim()}>
  <label class="ds-field-label" for={id}>
    {label}{#if required}<span aria-hidden="true"> *</span>{/if}
  </label>

  {#if children}
    {@render children(controlProps)}
  {/if}

  {#if helpText}
    <div class="ds-field-help" id={helpId}>
      {helpText}
    </div>
  {/if}

  {#if invalid && errorText}
    <div class="ds-field-error" id={errorId} role="alert">
      {errorText}
    </div>
  {/if}
</div>

