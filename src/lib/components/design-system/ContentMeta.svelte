<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  import { DsIcon } from "$lib/components/design-system";

  export type ContentMetaItem = {
    label: string;
    icon?: string;
    href?: string;
    isDate?: boolean;
    dateTime?: string;
  };

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    items?: ContentMetaItem[];
    author?: string;
    authorHref?: string;
    category?: string;
    categoryHref?: string;
    readingMinutes?: number;
    date?: string | Date;
    /** time element datetime */
    dateTime?: string;
    locale?: string;
    separator?: string;
    compact?: boolean;
    renderSeparator?: Snippet;
  }

  let {
    items,
    author,
    authorHref,
    category,
    categoryHref,
    readingMinutes,
    date,
    dateTime,
    locale,
    separator = "·",
    compact = false,
    renderSeparator,
    class: className = "",
    ...rest
  }: Props = $props();

  function formatDate(v: string | Date | undefined): string | undefined {
    if (!v) return undefined;
    try {
      const dateObj = typeof v === "string" ? new Date(v) : v;
      const fmt = new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
      return fmt.format(dateObj);
    } catch {
      return typeof v === "string" ? v : undefined;
    }
  }

  function toIso(v: string | Date | undefined): string | undefined {
    if (!v) return undefined;
    try {
      const dateObj = typeof v === "string" ? new Date(v) : v;
      return dateObj.toISOString();
    } catch {
      return undefined;
    }
  }

  let derivedItems = $derived.by(() => {
    if (items?.length) return items;
    const list: ContentMetaItem[] = [];
    if (author) list.push({ label: author, icon: "user", href: authorHref });
    if (category) list.push({ label: category, icon: "folder", href: categoryHref });
    if (typeof readingMinutes === "number") {
      list.push({ label: `${readingMinutes} min read`, icon: "clock" });
    }
    const d = formatDate(date);
    if (d) {
      list.push({
        label: d,
        icon: "calendar",
        isDate: true,
        dateTime: dateTime ?? toIso(date),
      });
    }
    return list;
  });

  let dateLabel = $derived(formatDate(date));
</script>

<div
  {...rest}
  class={["ds-content-meta", compact ? "is-compact" : "", className]
    .filter(Boolean)
    .join(" ")}
>
  {#each derivedItems as item, index (item.label + index)}
    {#if index > 0}
      <span class="ds-content-meta-sep" aria-hidden="true">
        {#if renderSeparator}
          {@render renderSeparator()}
        {:else}
          {separator}
        {/if}
      </span>
    {/if}

    <span class="ds-content-meta-item">
      {#if item.icon}
        <DsIcon name={item.icon} size="sm" class="ds-content-meta-icon" />
      {/if}

      {#if item.isDate && item.dateTime}
        <time class="ds-content-meta-label" datetime={item.dateTime}>{item.label}</time>
      {:else if item.href}
        <a class="ds-content-meta-label ds-content-meta-link" href={item.href}>{item.label}</a>
      {:else}
        <span class="ds-content-meta-label">{item.label}</span>
      {/if}
    </span>
  {/each}
</div>
