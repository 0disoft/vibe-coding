<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  import { DsIconButton } from "$lib/components/design-system";

  type Item =
    | { type: "page"; page: number; current: boolean; disabled: boolean }
    | { type: "ellipsis"; key: string };

  interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    page: number;
    pageCount: number;
    onPageChange?: (next: number) => void;
    siblingCount?: number;
    boundaryCount?: number;
    disabled?: boolean;
    label?: string;
  }

  let {
    page,
    pageCount,
    onPageChange,
    siblingCount = 1,
    boundaryCount = 1,
    disabled = false,
    label = "Pagination",
    class: className = "",
    ...rest
  }: Props = $props();

  function clampPage(p: number) {
    return Math.min(Math.max(1, p), Math.max(1, pageCount));
  }

  let current = $derived(clampPage(page));
  let total = $derived(Math.max(1, pageCount));

  function range(start: number, end: number) {
    const res: number[] = [];
    for (let i = start; i <= end; i++) res.push(i);
    return res;
  }

  function buildItems(): Item[] {
    if (total <= 1) return [{ type: "page", page: 1, current: true, disabled: true }];

    const s = Math.max(0, siblingCount);
    const b = Math.max(0, boundaryCount);

    const startPages = range(1, Math.min(b, total));
    const endPages = range(Math.max(total - b + 1, b + 1), total);

    const leftSiblingStart = Math.max(current - s, b + 1);
    const rightSiblingEnd = Math.min(current + s, total - b);

    const shouldShowLeftEllipsis = leftSiblingStart > b + 2;
    const shouldShowRightEllipsis = rightSiblingEnd < total - b - 1;

    const items: Item[] = [];

    for (const p of startPages) {
      items.push({ type: "page", page: p, current: p === current, disabled });
    }

    if (shouldShowLeftEllipsis) {
      items.push({ type: "ellipsis", key: "left" });
    } else {
      for (const p of range(b + 1, Math.max(b + 1, leftSiblingStart - 1))) {
        if (p > 0 && p <= total) items.push({ type: "page", page: p, current: p === current, disabled });
      }
    }

    for (const p of range(leftSiblingStart, rightSiblingEnd)) {
      if (p > 0 && p <= total) items.push({ type: "page", page: p, current: p === current, disabled });
    }

    if (shouldShowRightEllipsis) {
      items.push({ type: "ellipsis", key: "right" });
    } else {
      for (const p of range(Math.min(total - b, rightSiblingEnd + 1), total - b)) {
        if (p > 0 && p <= total) items.push({ type: "page", page: p, current: p === current, disabled });
      }
    }

    for (const p of endPages) {
      if (!startPages.includes(p)) {
        items.push({ type: "page", page: p, current: p === current, disabled });
      }
    }

    // dedupe pages (순서 유지)
    const seen = new Set<number>();
    return items.filter((it) => {
      if (it.type !== "page") return true;
      if (seen.has(it.page)) return false;
      seen.add(it.page);
      return true;
    });
  }

  let items = $derived(buildItems());
  let rootClass = $derived(["ds-pagination", className].filter(Boolean).join(" "));

  function go(next: number) {
    if (disabled) return;
    const clamped = clampPage(next);
    if (clamped === current) return;
    onPageChange?.(clamped);
  }
</script>

<nav {...rest} class={rootClass} aria-label={label}>
  <div class="ds-pagination-inner">
    <DsIconButton
      icon="chevron-left"
      label="Previous page"
      size="sm"
      variant="ghost"
      intent="secondary"
      disabled={disabled || current <= 1}
      onclick={() => go(current - 1)}
    />

    <div class="ds-pagination-pages" role="list">
      {#each items as it (it.type === "ellipsis" ? it.key : it.page)}
        {#if it.type === "ellipsis"}
          <span class="ds-pagination-ellipsis" aria-hidden="true">…</span>
        {:else}
          <button
            type="button"
            class="ds-pagination-page ds-focus-ring"
            data-current={it.current ? "true" : undefined}
            disabled={disabled}
            aria-current={it.current ? "page" : undefined}
            onclick={() => go(it.page)}
          >
            {it.page}
          </button>
        {/if}
      {/each}
    </div>

    <DsIconButton
      icon="chevron-right"
      label="Next page"
      size="sm"
      variant="ghost"
      intent="secondary"
      disabled={disabled || current >= total}
      onclick={() => go(current + 1)}
    />
  </div>
</nav>

