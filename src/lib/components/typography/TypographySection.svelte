<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    children?: Snippet;
  }

  let { title, children }: Props = $props();
</script>

<section class="mb-12">
  <h2 class="mb-6 text-2xl font-semibold border-b border-border pb-2">{title}</h2>
  <div class="grid gap-4">
    {#if children}
      {@render children()}
    {/if}
  </div>
</section>
