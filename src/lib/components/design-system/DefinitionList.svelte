<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  export type DefinitionItem = {
    term: string;
    description: string | number | null | undefined;
  };

  interface Props extends Omit<HTMLAttributes<HTMLDListElement>, "children"> {
    items?: DefinitionItem[];
    variant?: "stacked" | "columns";
    renderDescription?: Snippet<[DefinitionItem]>;
    children?: Snippet;
  }

  let {
    items,
    variant = "stacked",
    renderDescription,
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
        <dd class="ds-definition-desc">
          {#if renderDescription}
            {@render renderDescription(item)}
          {:else}
            {item.description ?? "-"}
          {/if}
        </dd>
      </div>
    {/each}
  {:else if children}
    {@render children()}
  {/if}
</dl>
