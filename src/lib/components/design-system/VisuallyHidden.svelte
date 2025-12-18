<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type As = keyof HTMLElementTagNameMap;

  interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    as?: As;
    children?: Snippet;
  }

  let { as = "span", class: className = "", children, ...rest }: Props = $props();

  let rootClass = $derived(["sr-only", className].filter(Boolean).join(" "));
</script>

<svelte:element this={as} {...rest} class={rootClass}>
  {#if children}
    {@render children()}
  {/if}
</svelte:element>

