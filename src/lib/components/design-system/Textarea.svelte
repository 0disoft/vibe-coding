<script lang="ts">
  import type { HTMLTextareaAttributes } from 'svelte/elements';

  interface Props extends HTMLTextareaAttributes {
    variant?: 'outline' | 'filled';
    invalid?: boolean;
    ref?: HTMLTextAreaElement | null;
  }

  let {
    variant = 'outline',
    invalid = false,
    value = $bindable(''),
    ref = $bindable(null),
    class: className = '',
    style = '',
    ...rest
  }: Props = $props();

  let bgClass = $derived(variant === 'filled' ? 'bg-muted' : 'bg-background');
  let borderClass = $derived(invalid ? 'border-destructive' : 'border-input');

  let variantClass = $derived(
    `ds-focus-ring w-full border ${borderClass} ${bgClass} text-body placeholder:text-muted-foreground/60`
  );

  let defaultStyle = $derived(
    `padding: var(--input-padding-y) var(--input-padding-x); border-radius: var(--input-radius); min-height: 80px;`
  );
</script>

<textarea
  {...rest}
  bind:this={ref}
  bind:value
  class={`${variantClass} ${className}`.trim()}
  style={`${defaultStyle} ${style}`}
  aria-invalid={invalid ? 'true' : undefined}
></textarea>
