<script lang="ts">
  import type { Snippet } from "svelte";

  import { DsBadge } from "$lib/components/design-system";

  export type Step = {
    title: string;
    description?: string;
  };

  interface Props {
    steps: Step[];
    children?: Snippet;
  }

  let { steps, children }: Props = $props();
</script>

<ol class="grid gap-3">
  {#each steps as step, idx (step.title)}
    <li class="flex gap-3">
      <div class="pt-0.5">
        <DsBadge intent="primary" variant="soft" size="sm">{idx + 1}</DsBadge>
      </div>
      <div class="min-w-0">
        <div class="font-semibold text-foreground">{step.title}</div>
        {#if step.description}
          <div class="text-body-secondary text-muted-foreground">
            {step.description}
          </div>
        {/if}
      </div>
    </li>
  {/each}
</ol>

{#if children}
  <div class="mt-4">
    {@render children()}
  </div>
{/if}
