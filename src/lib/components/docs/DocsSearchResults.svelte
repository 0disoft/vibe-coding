<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  export type SearchResult = {
    title: string;
    href: string;
    excerpt?: string;
    meta?: string;
  };

  interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    query: string;
    items: SearchResult[];
    emptyText?: string;
  }

  let {
    query,
    items,
    emptyText = "No results",
    class: className = "",
    ...rest
  }: Props = $props();
</script>

<section {...rest} class={["ds-search-results", className].filter(Boolean).join(" ")}>
  <div class="ds-search-results-header">
    <div class="text-label font-semibold text-foreground">Results</div>
    <div class="text-helper text-muted-foreground">
      “{query}” · {items.length}
    </div>
  </div>

  {#if items.length === 0}
    <div class="ds-search-results-empty">{emptyText}</div>
  {:else}
    <ul class="ds-search-results-list">
      {#each items as r (r.href)}
        <li class="ds-search-results-item">
          <a class="ds-search-results-link" href={r.href}>
            <div class="ds-search-results-title">{r.title}</div>
            {#if r.excerpt}
              <div class="ds-search-results-excerpt">{r.excerpt}</div>
            {/if}
            {#if r.meta}
              <div class="ds-search-results-meta">{r.meta}</div>
            {/if}
          </a>
        </li>
      {/each}
    </ul>
  {/if}
</section>
