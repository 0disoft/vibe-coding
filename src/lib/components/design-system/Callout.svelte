<script lang="ts">
  import type { Snippet } from "svelte";

  import DsAlert from "./Alert.svelte";
  import type { IntentWithNeutral } from "./types";

  interface Props {
    intent?: IntentWithNeutral;
    title?: string;
    children?: Snippet;
  }

  let { intent = "neutral", title, children }: Props = $props();
</script>

<DsAlert {intent} {title}>
  {#if children}
    {@render children()}
  {/if}
</DsAlert>

