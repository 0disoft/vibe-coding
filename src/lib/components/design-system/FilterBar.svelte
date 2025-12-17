<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  import DsButton from "./Button.svelte";
  import DsInput from "./Input.svelte";
  import DsSelect from "./Select.svelte";

  export type FilterBarSortOption = { value: string; label: string };

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    query?: string;
    onQueryChange?: (next: string) => void;
    placeholder?: string;

    sort?: string | null;
    onSortChange?: (next: string | null) => void;
    sortOptions?: FilterBarSortOption[];
    sortPlaceholder?: string;

    showClear?: boolean;
    clearLabel?: string;

    children?: Snippet;
    actions?: Snippet;
  }

  let {
    query = $bindable(""),
    onQueryChange,
    placeholder = "Search…",
    sort = $bindable<string | null>(null),
    onSortChange,
    sortOptions = [],
    sortPlaceholder = "Sort",
    showClear = true,
    clearLabel = "Clear",
    children,
    actions,
    class: className = "",
    ...rest
  }: Props = $props();

  let hasSort = $derived(sortOptions.length > 0);
  let canClear = $derived(showClear && (query.trim().length > 0 || (sort ?? null) !== null));

  let sortValue = $state("");

  $effect(() => {
    const next = sort ?? "";
    if (next !== sortValue) sortValue = next;
  });

  $effect(() => {
    if (!hasSort) return;
    const normalized = sortValue.trim();
    const next = normalized.length ? normalized : null;
    if (next === sort) return;
    sort = next;
    onSortChange?.(next);
  });

  function setQuery(next: string) {
    if (next === query) return;
    query = next;
    onQueryChange?.(next);
  }

  function setSort(next: string) {
    const normalized = next.trim();
    const v = normalized.length ? normalized : null;
    if (v === sort) return;
    sort = v;
    onSortChange?.(v);
  }

  function clearAll() {
    setQuery("");
    setSort("");
  }
</script>

<div {...rest} class={["ds-filter-bar", className].filter(Boolean).join(" ")}>
  <div class="ds-filter-bar-main">
    <DsInput value={query} placeholder={placeholder} clearable={false} class="ds-filter-bar-query" oninput={(e) => setQuery((e.currentTarget as HTMLInputElement).value)}>
      {#snippet start()}
        <span class="i-lucide-search h-4 w-4 text-muted-foreground" aria-hidden="true"></span>
      {/snippet}
    </DsInput>

    {#if hasSort}
      <div class="ds-filter-bar-sort">
        <DsSelect
          options={sortOptions}
          placeholder={sortPlaceholder}
          bind:value={sortValue}
        />
      </div>
    {/if}

    {#if children}
      <div class="ds-filter-bar-filters">
        {@render children()}
      </div>
    {/if}
  </div>

  <div class="ds-filter-bar-actions">
    {#if canClear}
      <DsButton size="sm" variant="outline" intent="secondary" onclick={clearAll}>
        {clearLabel}
      </DsButton>
    {/if}
    {#if actions}
      {@render actions()}
    {/if}
  </div>
</div>
