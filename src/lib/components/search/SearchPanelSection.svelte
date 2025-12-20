<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  import { DsSearchPanel } from "$lib/components/design-system";
  import * as m from "$lib/paraglide/messages.js";
  import type { SearchItem } from "$lib/components/design-system/SearchPanel.svelte";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    items: ReadonlyArray<SearchItem>;
    query?: string;
    onQueryChange?: (next: string) => void;
    onSelect?: (id: string) => void;
    title?: string;
    titleAs?: keyof HTMLElementTagNameMap;
    label?: string;
    placeholder?: string;
    emptyText?: string;
  }

  const generatedId = $props.id();

  let {
    items,
    query = $bindable(""),
    onQueryChange,
    onSelect,
    title = m.search_panel_demo_title(),
    titleAs = "h3",
    label = m.search_panel_label_pages(),
    placeholder = m.search_panel_placeholder_pages(),
    emptyText = m.search_panel_empty(),
    id: idProp,
    class: className = "",
    ...rest
  }: Props = $props();

  let id = $derived(idProp ?? generatedId);
  let titleId = $derived(`${id}-title`);
  let ariaLabelledBy = $derived(title ? titleId : undefined);
  let ariaLabel = $derived(!title ? label : undefined);
</script>

<div
  {...rest}
  {id}
  class={["space-y-2", className].filter(Boolean).join(" ")}
  role="search"
  aria-labelledby={ariaLabelledBy}
  aria-label={ariaLabel}
>
  {#if title}
    <svelte:element this={titleAs} id={titleId} class="text-label text-muted-foreground">
      {title}
    </svelte:element>
  {/if}
  <div>
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
