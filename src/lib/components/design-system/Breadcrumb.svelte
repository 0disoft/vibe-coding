<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  export type BreadcrumbItem = {
    label: string;
    href?: string;
    /** 현재 페이지 표시(미지정이면 마지막 항목을 current로 처리) */
    current?: boolean;
  };

  interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    items: BreadcrumbItem[];
    label?: string;
  }

  let {
    items,
    label = "Breadcrumb",
    class: className = "",
    ...rest
  }: Props = $props();

  let computedItems = $derived.by(() => {
    const list = items ?? [];
    const hasCurrent = list.some((it) => it.current);
    if (hasCurrent) return list;
    return list.map((it, idx) => (idx === list.length - 1 ? { ...it, current: true } : it));
  });
</script>

<nav {...rest} class={["ds-breadcrumb", className].filter(Boolean).join(" ")} aria-label={label}>
  <ol class="ds-breadcrumb-list">
    {#each computedItems as item, idx (item.href ?? item.label)}
      <li class="ds-breadcrumb-item">
        {#if item.href && !item.current}
          <a class="ds-breadcrumb-link" href={item.href}>{item.label}</a>
        {:else}
          <span class="ds-breadcrumb-current" aria-current={item.current ? "page" : undefined}>
            {item.label}
          </span>
        {/if}

        {#if idx < computedItems.length - 1}
          <span class="ds-breadcrumb-sep" aria-hidden="true">/</span>
        {/if}
      </li>
    {/each}
  </ol>
</nav>

