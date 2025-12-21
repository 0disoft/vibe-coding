<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  import * as m from "$lib/paraglide/messages.js";

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
    emptyText = m.search_panel_empty(),
    class: className = "",
    ...rest
  }: Props = $props();

  function escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  let queryText = $derived(query.trim());
  let highlightRegExp = $derived(
    queryText ? new RegExp(`(${escapeRegExp(queryText)})`, "gi") : null,
  );
</script>

{#snippet highlight(text: string)}
  {#if !queryText}
    {text}
  {:else}
    {@const parts = text.split(highlightRegExp ?? /$^/)}
    {#each parts as part}
      {#if part.toLowerCase() === queryText.toLowerCase()}
        <span class="ds-search-highlight">{part}</span>
      {:else}
        {part}
      {/if}
    {/each}
  {/if}
{/snippet}

<section {...rest} class={["ds-search-results", className].filter(Boolean).join(" ")}>
  <div class="ds-search-results-header">
    <div class="text-label font-semibold text-foreground">{m.docs_results_label()}</div>
    <div class="text-helper text-muted-foreground" aria-live="polite" aria-atomic="true">
      “{query}” · {items.length}
    </div>
  </div>

  {#if items.length === 0}
    <div class="ds-search-results-empty">{emptyText}</div>
  {:else}
    <ul class="ds-search-results-list">
      {#each items as r (r.href)}
        <li class="ds-search-results-item">
          <a class="ds-search-results-link ds-focus-ring" href={r.href}>
            <div class="ds-search-results-title">{@render highlight(r.title)}</div>
            {#if r.excerpt}
              <div class="ds-search-results-excerpt">
                {@render highlight(r.excerpt)}
              </div>
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
