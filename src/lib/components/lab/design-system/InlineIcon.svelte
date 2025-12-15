<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import { DsIcon } from '$lib/components/lab/design-system';

  type Size = 'sm' | 'md' | 'lg';

  interface Props extends HTMLAttributes<HTMLSpanElement> {
    name: string;
    size?: Size;
    label?: string;
  }

  let { name, size = 'sm', label, class: className = '', ...rest }: Props = $props();
</script>

<span {...rest} class={`inline-flex items-center gap-[var(--icon-gap)] align-middle ${className}`.trim()}>
  <DsIcon name={name} size={size} label={label} />
</span>

