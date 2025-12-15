<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';

  import { DsIcon } from '$lib/components/lab/design-system';

  type Size = 'sm' | 'md' | 'lg';
  type Variant = 'solid' | 'outline' | 'ghost';
  type Intent = 'primary' | 'secondary' | 'error' | 'success' | 'warning';

  interface Props extends HTMLButtonAttributes {
    icon: string;
    label: string;
    size?: Size;
    variant?: Variant;
    intent?: Intent;
    disabled?: boolean;
    loading?: boolean;
    children?: Snippet;
  }

  let {
    icon,
    label,
    size = 'md',
    variant = 'ghost',
    intent = 'secondary',
    loading = false,
    disabled = false,
    type = 'button',
    class: className = '',
    style = '',
    children,
    ...rest
  }: Props = $props();

  let btnSize = $derived(size);
  let iconSize = $derived(size);
</script>

<button
  {...rest}
  type={type}
  class={`ds-button ds-focus-ring ds-touch-target ${disabled || loading ? 'cursor-not-allowed' : 'cursor-pointer'} ${className}`.trim()}
  style={`border-radius: var(--button-radius); padding: 0 var(--button-padding-x-sm); ${disabled || loading ? `opacity: var(--opacity-disabled);` : ''} ${style}`}
  disabled={disabled || loading}
  aria-busy={loading || undefined}
  aria-label={label}
  data-ds-size={btnSize}
  data-ds-variant={variant}
  data-ds-intent={intent}
>
  <DsIcon name={icon} size={iconSize} />
  {#if children}
    {@render children()}
  {/if}
</button>
