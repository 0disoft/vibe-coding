<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    cite?: string;
    children?: Snippet;
  }

  let { cite, children, class: className = "", ...rest }: Props = $props();
</script>

<blockquote {...rest} class={["ds-quote", className].filter(Boolean).join(" ")}>
  <div class="ds-quote-body">
    {#if children}
      {@render children()}
    {/if}
  </div>
  {#if cite}
    <footer class="ds-quote-cite">— {cite}</footer>
  {/if}
</blockquote>

