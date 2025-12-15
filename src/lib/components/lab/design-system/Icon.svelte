<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  type Size = 'sm' | 'md' | 'lg';

  interface Props extends HTMLAttributes<HTMLSpanElement> {
    name: string;
    size?: Size;
    label?: string;
  }

  let { name, size = 'md', label, class: className = '', style = '', ...rest }: Props = $props();

  let sizeVar = $derived(
    size === 'sm' ? 'var(--size-icon-sm)' : size === 'lg' ? 'var(--size-icon-lg)' : 'var(--size-icon-md)'
  );

  let ariaHidden = $derived(label ? undefined : true);
  let role = $derived(label ? 'img' : undefined);
</script>

<span
  {...rest}
  class={`ds-icon i-lucide-${name} ${className}`.trim()}
  style={`width:${sizeVar}; height:${sizeVar}; stroke-width: var(--icon-stroke-width); ${style}`}
  role={role}
  aria-label={label}
  aria-hidden={ariaHidden}
></span>
