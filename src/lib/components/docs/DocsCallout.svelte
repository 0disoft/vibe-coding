<script lang="ts">
  import type { Snippet } from "svelte";

  import { DsAlert } from "$lib/components/design-system";
  import type { IntentWithNeutral } from "$lib/components/design-system";

  interface Props {
    intent?: IntentWithNeutral;
    title?: string;
    children?: Snippet;
  }

  let { intent = "neutral", title, children }: Props = $props();
</script>

<DsAlert {intent} title={title}>
  {#if children}
    {@render children()}
  {/if}
</DsAlert>

