<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    children?: Snippet;
  }

  let { class: className = "", children, ...rest }: Props = $props();
</script>

<div
  {...rest}
  class={["prose", className].filter(Boolean).join(" ")}
>
  {#if children}
    {@render children()}
  {/if}
</div>

