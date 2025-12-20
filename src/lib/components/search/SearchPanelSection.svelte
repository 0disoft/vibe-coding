<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  import { DsSearchPanel } from "$lib/components/design-system";
  import type { SearchItem } from "$lib/components/design-system/SearchPanel.svelte";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    items: ReadonlyArray<SearchItem>;
    query?: string;
    onQueryChange?: (next: string) => void;
    onSelect?: (id: string) => void;
    title?: string;
    label?: string;
    placeholder?: string;
    emptyText?: string;
  }

  let {
    items,
    query = $bindable(""),
    onQueryChange,
    onSelect,
    title = "Demo",
    label = "Search pages",
    placeholder = "Type to filter pages…",
    emptyText = "No results.",
    class: className = "",
    ...rest
  }: Props = $props();
</script>

<div {...rest} class={["space-y-2", className].filter(Boolean).join(" ")}>
  <div class="text-label text-muted-foreground">{title}</div>
  <div class="mt-2">
    <DsSearchPanel
      {items}
      bind:query
      {label}
      {placeholder}
      {emptyText}
      onQueryChange={onQueryChange}
      onSelect={onSelect}
    />
  </div>
</div>

