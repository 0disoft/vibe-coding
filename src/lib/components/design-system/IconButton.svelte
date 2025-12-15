<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';

  import { DsIcon } from '$lib/components/design-system';

  type Size = 'sm' | 'md' | 'lg';
  type Variant = 'solid' | 'outline' | 'ghost';
  type Intent = 'neutral' | 'primary' | 'secondary' | 'danger' | 'error' | 'success' | 'warning';

  interface Props extends HTMLButtonAttributes {
    label: string;
    icon?: string;
    size?: Size;
    variant?: Variant;
    intent?: Intent;
    pressed?: boolean;
    disabled?: boolean;
    loading?: boolean;
    ref?: HTMLButtonElement | null;
    children?: Snippet;
  }

  let {
    label,
    icon,
    size = 'md',
    variant = 'ghost',
    intent = 'neutral',
    pressed,
    loading = false,
    disabled = false,
    type = 'button',
    ref = $bindable<HTMLButtonElement | null>(null),
    class: className = '',
    style = '',
    children,
    ...rest
  }: Props = $props();

  let btnSize = $derived(size);
  let iconSize = $derived(size);
  let intentCss = $derived((intent === 'danger' ? 'error' : intent) as Exclude<Intent, 'danger'>);
</script>

<button
  {...rest}
  bind:this={ref}
  type={type}
  class={`ds-button ds-focus-ring ds-touch-target ${disabled || loading ? 'cursor-not-allowed' : 'cursor-pointer'} ${className}`.trim()}
  style={`border-radius: var(--button-radius); padding: 0 var(--button-padding-x-sm); ${disabled || loading ? `opacity: var(--opacity-disabled);` : ''} ${style}`}
  disabled={disabled || loading}
  aria-busy={loading || undefined}
  aria-label={label}
  aria-pressed={pressed ?? undefined}
  data-ds-size={btnSize}
  data-ds-variant={variant}
  data-ds-intent={intentCss}
>
  {#if icon}
    <DsIcon name={icon} size={iconSize} />
  {/if}
  {#if children}
    {@render children()}
  {/if}
</button>
