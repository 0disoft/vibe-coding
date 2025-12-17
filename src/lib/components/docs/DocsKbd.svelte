<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    keys: string;
  }

  let { keys, class: className = "", ...rest }: Props = $props();
  let parts = $derived(keys.split("+").map((k) => k.trim()).filter(Boolean));
</script>

<span {...rest} class={["ds-kbd", className].filter(Boolean).join(" ")}>
  {#each parts as p, idx (p)}
    <kbd class="ds-kbd-key">{p}</kbd>
    {#if idx < parts.length - 1}
      <span class="ds-kbd-plus" aria-hidden="true">+</span>
    {/if}
  {/each}
</span>

