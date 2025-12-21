<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  import { DsIcon, DsTooltip } from "$lib/components/design-system";

  export type SideNavItem = {
    id: string;
    label: string;
    href?: string;
    icon?: string;
    disabled?: boolean;
    /** 링크가 아닌 액션 성격일 때 true */
    isAction?: boolean;
  };

  interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    items: ReadonlyArray<SideNavItem>;
    activeId?: string;
    defaultActiveId?: string;
    onActiveChange?: (id: string) => void;
    collapsed?: boolean;
    label?: string;
  }

  let {
    items,
    activeId,
    defaultActiveId,
    onActiveChange,
    collapsed = false,
    label = "Side navigation",
    class: className = "",
    ...rest
  }: Props = $props();

  let internalActive = $state<string | null>(null);
  let currentActive = $derived(activeId ?? internalActive);
  let itemRefs = $state<Array<HTMLElement | null>>([]);

  $effect(() => {
    if (activeId !== undefined) return;
    const fallback = defaultActiveId ?? items[0]?.id ?? null;
    if (!internalActive) {
      if (fallback) internalActive = fallback;
      return;
    }
    const exists = items.some((item) => item.id === internalActive);
    if (!exists) internalActive = fallback;
  });

  function setActive(next: string) {
    if (currentActive === next) return;
    if (activeId === undefined) internalActive = next;
    onActiveChange?.(next);
  }

  function focusBoundary(toEnd: boolean) {
    const indices = items
      .map((_, idx) => idx)
      .filter((idx) => !items[idx]?.disabled);
    if (!indices.length) return;
    const nextIndex = toEnd ? indices[indices.length - 1] : indices[0];
    itemRefs[nextIndex]?.focus();
  }

  function onItemKeyDown(e: KeyboardEvent) {
    if (e.key === "Home") {
      e.preventDefault();
      focusBoundary(false);
    } else if (e.key === "End") {
      e.preventDefault();
      focusBoundary(true);
    }
  }
</script>

<nav
  {...rest}
  class={["ds-side-nav", className].filter(Boolean).join(" ")}
  aria-label={label}
  data-ds-collapsed={collapsed ? "true" : undefined}
>
  <ul class="ds-side-nav-list">
    {#each items as item, idx (item.id)}
      {@const isActive = currentActive === item.id}
      {@const isAction = item.isAction ?? false}
      <li class="ds-side-nav-item">
        {#if item.disabled}
          {#if collapsed}
            <DsTooltip content={item.label} placement="right">
              {#snippet children(props)}
                <span
                  class="ds-side-nav-link is-disabled"
                  aria-disabled="true"
                  aria-describedby={props["aria-describedby"]}
                >
                  {#if item.icon}
                    <DsIcon name={item.icon} size="sm" class="ds-side-nav-icon" />
                  {/if}
                </span>
              {/snippet}
            </DsTooltip>
          {:else}
            <span class="ds-side-nav-link is-disabled" aria-disabled="true">
              {#if item.icon}
                <DsIcon name={item.icon} size="sm" class="ds-side-nav-icon" />
              {/if}
              <span class="ds-side-nav-label">{item.label}</span>
            </span>
          {/if}
        {:else if item.href}
          {#if collapsed}
            <DsTooltip content={item.label} placement="right">
              {#snippet children(props)}
                <a
                  href={item.href}
                  class={[
                    "ds-side-nav-link ds-focus-ring",
                    isActive ? "is-active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-current={isActive && !isAction ? "page" : undefined}
                  aria-label={item.label}
                  aria-describedby={props["aria-describedby"]}
                  onclick={() => setActive(item.id)}
                  onkeydown={onItemKeyDown}
                  bind:this={itemRefs[idx]}
                >
                  {#if item.icon}
                    <DsIcon name={item.icon} size="sm" class="ds-side-nav-icon" />
                  {/if}
                </a>
              {/snippet}
            </DsTooltip>
          {:else}
            <a
              href={item.href}
              class={[
                "ds-side-nav-link ds-focus-ring",
                isActive ? "is-active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-current={isActive && !isAction ? "page" : undefined}
              onclick={() => setActive(item.id)}
              onkeydown={onItemKeyDown}
              bind:this={itemRefs[idx]}
            >
              {#if item.icon}
                <DsIcon name={item.icon} size="sm" class="ds-side-nav-icon" />
              {/if}
              <span class="ds-side-nav-label">{item.label}</span>
            </a>
          {/if}
        {:else}
          {#if collapsed}
            <DsTooltip content={item.label} placement="right">
              {#snippet children(props)}
                <button
                  type="button"
                  class={[
                    "ds-side-nav-link ds-focus-ring",
                    isActive ? "is-active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-current={isActive && !isAction ? "page" : undefined}
                  aria-pressed={isAction ? isActive : undefined}
                  aria-label={item.label}
                  aria-describedby={props["aria-describedby"]}
                  onclick={() => setActive(item.id)}
                  onkeydown={onItemKeyDown}
                  bind:this={itemRefs[idx]}
                >
                  {#if item.icon}
                    <DsIcon name={item.icon} size="sm" class="ds-side-nav-icon" />
                  {/if}
                </button>
              {/snippet}
            </DsTooltip>
          {:else}
            <button
              type="button"
              class={[
                "ds-side-nav-link ds-focus-ring",
                isActive ? "is-active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-current={isActive && !isAction ? "page" : undefined}
              aria-pressed={isAction ? isActive : undefined}
              onclick={() => setActive(item.id)}
              onkeydown={onItemKeyDown}
              bind:this={itemRefs[idx]}
            >
              {#if item.icon}
                <DsIcon name={item.icon} size="sm" class="ds-side-nav-icon" />
              {/if}
              <span class="ds-side-nav-label">{item.label}</span>
            </button>
          {/if}
        {/if}
      </li>
    {/each}
  </ul>
</nav>
