<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  export type ContentMetaItem = {
    label: string;
    icon?: string;
  };

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    items?: ContentMetaItem[];
    author?: string;
    category?: string;
    readingMinutes?: number;
    date?: string | Date;
    /** time element datetime */
    dateTime?: string;
    separator?: string;
    compact?: boolean;
  }

  let {
    items,
    author,
    category,
    readingMinutes,
    date,
    dateTime,
    separator = "·",
    compact = false,
    class: className = "",
    ...rest
  }: Props = $props();

  function formatDate(v: string | Date | undefined): string | undefined {
    if (!v) return undefined;
    if (typeof v === "string") return v;
    try {
      return v.toLocaleDateString();
    } catch {
      return undefined;
    }
  }

  let derivedItems = $derived.by(() => {
    if (items?.length) return items;
    const list: ContentMetaItem[] = [];
    if (author) list.push({ label: author, icon: "user" });
    if (category) list.push({ label: category, icon: "folder" });
    if (typeof readingMinutes === "number") {
      list.push({ label: `${readingMinutes} min read`, icon: "clock" });
    }
    const d = formatDate(date);
    if (d) list.push({ label: d, icon: "calendar" });
    return list;
  });

  let dateLabel = $derived(formatDate(date));
  let dateAttr = $derived.by(() => {
    if (dateTime) return dateTime;
    if (date instanceof Date) return date.toISOString();
    return undefined;
  });
</script>

<div
  {...rest}
  class={["ds-content-meta", compact ? "is-compact" : "", className]
    .filter(Boolean)
    .join(" ")}
>
  {#each derivedItems as item, index (item.label + index)}
    {#if index > 0}
      <span class="ds-content-meta-sep" aria-hidden="true">{separator}</span>
    {/if}

    <span class="ds-content-meta-item">
      {#if item.icon}
        <span class={`ds-icon i-lucide-${item.icon} ds-content-meta-icon`} aria-hidden="true"></span>
      {/if}

      {#if item.label === dateLabel && dateAttr}
        <time class="ds-content-meta-label" datetime={dateAttr}>{item.label}</time>
      {:else}
        <span class="ds-content-meta-label">{item.label}</span>
      {/if}
    </span>
  {/each}
</div>

