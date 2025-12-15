<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    motion?: boolean;
    children?: Snippet;
  }

  let { motion = false, class: className = '', children, ...rest }: Props = $props();
  let motionClass = $derived(motion ? 'ds-motion' : '');
</script>

<div
  {...rest}
  class={`${motionClass} rounded-lg border border-border bg-card p-4 text-card-foreground ${className}`.trim()}
>
  {#if children}
    {@render children()}
  {/if}
</div>
