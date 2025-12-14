<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    token: string;
    size: string;
    description: string;
    children?: Snippet;
  }

  let { token, size, description, children }: Props = $props();
</script>

<div class="p-4 rounded-lg bg-card">
  <div class="flex items-center gap-2 mb-2">
    <code class="text-helper text-muted-foreground">{token}</code>
    <span class="text-helper text-primary">{size}</span>
    <span class="text-helper text-muted-foreground">· {description}</span>
  </div>
  {#if children}
    {@render children()}
  {/if}
</div>
