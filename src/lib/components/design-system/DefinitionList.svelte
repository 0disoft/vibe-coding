<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  export type DefinitionItem = {
    term: string;
    description: string;
  };

  interface Props extends Omit<HTMLAttributes<HTMLDListElement>, "children"> {
    items?: DefinitionItem[];
    variant?: "stacked" | "columns";
    children?: Snippet;
  }

  let {
    items,
    variant = "stacked",
    children,
    class: className = "",
    ...rest
  }: Props = $props();
</script>

<dl
  {...rest}
  class={["ds-definition-list", className].filter(Boolean).join(" ")}
  data-ds-variant={variant}
>
  {#if items?.length}
    {#each items as item, index (item.term + index)}
      <div class="ds-definition-item">
        <dt class="ds-definition-term">{item.term}</dt>
        <dd class="ds-definition-desc">{item.description}</dd>
      </div>
    {/each}
  {:else if children}
    {@render children()}
  {/if}
</dl>

