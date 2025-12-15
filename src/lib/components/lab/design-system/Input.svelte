<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  type Size = 'sm' | 'md' | 'lg';
  type Variant = 'outline' | 'filled';

  interface Props extends Omit<HTMLInputAttributes, 'size'> {
    size?: Size;
    variant?: Variant;
    invalid?: boolean;
  }

  let {
    size = 'md',
    variant = 'outline',
    invalid = false,
    class: className = '',
    ...rest
  }: Props = $props();

  let minHeight = $derived(size === 'sm' ? '36px' : size === 'lg' ? '48px' : '44px');

  let bgClass = $derived(variant === 'filled' ? 'bg-muted' : 'bg-background');
  let borderClass = $derived(invalid ? 'border-destructive' : 'border-input');
  let variantClass = $derived(`ds-focus-ring w-full border ${borderClass} ${bgClass} text-body placeholder:text-muted-foreground/60`);

  let style = $derived(
    `padding: var(--input-padding-y) var(--input-padding-x); border-radius: var(--input-radius); min-height: ${minHeight};`
  );
</script>

<input
  {...rest}
  class={`${variantClass} ${className}`.trim()}
  style={style}
  aria-invalid={invalid ? 'true' : undefined}
/>
