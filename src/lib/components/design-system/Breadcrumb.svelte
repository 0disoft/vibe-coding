<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  import { DsDropdown, DsDropdownItem, DsIcon } from "$lib/components/design-system";

  export type BreadcrumbItem = {
    label: string;
    href?: string;
    icon?: string;
    /** 현재 페이지 표시(미지정이면 마지막 항목을 current로 처리) */
    current?: boolean;
    menuItems?: BreadcrumbMenuItem[];
    menuLabel?: string;
  };

  export type BreadcrumbMenuItem = {
    label: string;
    href: string;
    disabled?: boolean;
  };

  interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    items: BreadcrumbItem[];
    label?: string;
    separator?: Snippet;
  }

  let {
    items,
    label = "Breadcrumb",
    separator,
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
    {#each computedItems as item, idx (item.href ?? `${item.label}-${idx}`)}
      <li class="ds-breadcrumb-item">
        {#if item.menuItems && item.menuItems.length > 0}
          <DsDropdown label={item.menuLabel ?? item.label} align="start">
            {#snippet trigger(props)}
              <button
                {...props}
                type="button"
                class="ds-breadcrumb-link ds-breadcrumb-button ds-focus-ring"
              >
                {#if item.icon}
                  <DsIcon name={item.icon} size="sm" class="ds-breadcrumb-icon" />
                {/if}
                <span>{item.label}</span>
                <DsIcon name="chevron-down" size="xs" class="ds-breadcrumb-menu-icon" />
              </button>
            {/snippet}
            {#snippet children({ close })}
              {#each item.menuItems as menuItem (menuItem.href)}
                <DsDropdownItem
                  href={menuItem.href}
                  disabled={menuItem.disabled}
                  onclick={() => close()}
                >
                  {menuItem.label}
                </DsDropdownItem>
              {/each}
            {/snippet}
          </DsDropdown>
        {:else if item.href && !item.current}
          <a class="ds-breadcrumb-link" href={item.href}>
            {#if item.icon}
              <DsIcon name={item.icon} size="sm" class="ds-breadcrumb-icon" />
            {/if}
            <span>{item.label}</span>
          </a>
        {:else}
          <span class="ds-breadcrumb-current" aria-current={item.current ? "page" : undefined}>
            {#if item.icon}
              <DsIcon name={item.icon} size="sm" class="ds-breadcrumb-icon" />
            {/if}
            <span>{item.label}</span>
          </span>
        {/if}

        {#if idx < computedItems.length - 1}
          <span class="ds-breadcrumb-sep" aria-hidden="true">
            {#if separator}
              {@render separator()}
            {:else}
              /
            {/if}
          </span>
        {/if}
      </li>
    {/each}
  </ol>
</nav>
