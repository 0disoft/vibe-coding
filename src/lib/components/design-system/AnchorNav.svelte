<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  import * as m from "$lib/paraglide/messages.js";

  export type AnchorNavItem = {
    id: string;
    label: string;
    level?: number;
    href?: string;
    disabled?: boolean;
  };

  interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    id?: string;
    items: ReadonlyArray<AnchorNavItem>;
    activeId?: string;
    onActiveChange?: (id: string) => void;
    sticky?: boolean;
    offset?: number;
    label?: string;
    labelTag?: "div" | "p" | "h2" | "h3" | "h4";
  }

  const autoId = $props.id();

  let {
    id = autoId,
    items,
    activeId,
    onActiveChange,
    sticky = true,
    offset = 96,
    label = m.ds_anchor_nav_label(),
    labelTag = "div",
    class: className = "",
    style: styleValue = "",
    ...rest
  }: Props = $props();

  let internalActive = $state<string | null>(null);
  let currentActive = $derived(activeId ?? internalActive);
  let labelId = $derived(`${id}-label`);

  $effect(() => {
    if (activeId !== undefined) return;
    if (!items.length) return;
    if (!internalActive) {
      internalActive = items[0].id;
      return;
    }
    const exists = items.some((item) => item.id === internalActive);
    if (!exists) internalActive = items[0].id;
  });

  function setActive(next: string | null) {
    if (!next || next === currentActive) return;
    if (activeId === undefined) internalActive = next;
    onActiveChange?.(next);
  }

  function computeActiveFallback() {
    if (!items.length) return;
    let next: string | null = null;
    for (const item of items) {
      const target = document.getElementById(item.id);
      if (!target) continue;
      const top = target.getBoundingClientRect().top;
      if (top - offset <= 0) {
        next = item.id;
      } else {
        break;
      }
    }
    if (!next && items[0]) next = items[0].id;
    setActive(next);
  }

  function resolveVisibleActive(visible: Set<string>) {
    let next: string | null = null;
    for (const item of items) {
      if (visible.has(item.id)) next = item.id;
    }
    return next ?? items[0]?.id ?? null;
  }

  $effect(() => {
    if (typeof window === "undefined") return;
    if (!items.length) return;

    const win = window as Window;

    if (!("IntersectionObserver" in win)) {
      let raf = 0;
      const onScroll = () => {
        if (raf) return;
        raf = win.requestAnimationFrame(() => {
          raf = 0;
          computeActiveFallback();
        });
      };

      win.addEventListener("scroll", onScroll, { passive: true });
      win.addEventListener("resize", onScroll);
      onScroll();

      return () => {
        win.removeEventListener("scroll", onScroll);
        win.removeEventListener("resize", onScroll);
        if (raf) win.cancelAnimationFrame(raf);
      };
    }

    const visible = new Set<string>();
    const rootMargin = `-${offset}px 0px -60% 0px`;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).id;
          if (!id) continue;
          if (entry.isIntersecting) visible.add(id);
          else visible.delete(id);
        }
        const next = resolveVisibleActive(visible);
        if (next) setActive(next);
      },
      { rootMargin, threshold: 0 },
    );

    const targets = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));

    for (const el of targets) observer.observe(el);
    computeActiveFallback();

    return () => {
      observer.disconnect();
      visible.clear();
    };
  });

  function levelIndent(level?: number) {
    const normalized = Math.max((level ?? 2) - 2, 0);
    return `--ds-anchor-nav-level:${normalized}`;
  }

  let styleAttr = $derived(
    [
      styleValue,
      offset ? `--ds-anchor-nav-offset: ${offset}px` : "",
    ]
      .filter(Boolean)
      .join("; "),
  );

  function focusTarget(id: string) {
    const target = document.getElementById(id);
    if (!target) return;

    const hasTabIndex = target.hasAttribute("tabindex");
    const prevTabIndex = target.getAttribute("tabindex");
    if (target.tabIndex < 0) {
      target.setAttribute("tabindex", "-1");
    }

    target.focus({ preventScroll: true });

    if (!hasTabIndex && target.tabIndex < 0) {
      window.setTimeout(() => {
        if (!document.body.contains(target)) return;
        if (prevTabIndex === null) target.removeAttribute("tabindex");
        else target.setAttribute("tabindex", prevTabIndex);
      }, 0);
    }
  }

  function handleItemClick(item: AnchorNavItem) {
    setActive(item.id);
    window.requestAnimationFrame(() => focusTarget(item.id));
  }
</script>

<nav
  id={id}
  {...rest}
  class={["ds-anchor-nav", className].filter(Boolean).join(" ")}
  aria-labelledby={labelId}
  data-ds-sticky={sticky ? "true" : undefined}
  style={styleAttr}
>
  <svelte:element this={labelTag} id={labelId} class="ds-anchor-nav-title">
    {label}
  </svelte:element>
  <ul class="ds-anchor-nav-list">
    {#each items as item (item.id)}
      <li
        class="ds-anchor-nav-item"
        style={levelIndent(item.level)}
        data-disabled={item.disabled ? "true" : undefined}
      >
        {#if item.disabled}
          <span class="ds-anchor-nav-link is-disabled">{item.label}</span>
        {:else}
          <a
            href={item.href ?? `#${item.id}`}
            class={[
              "ds-anchor-nav-link ds-focus-ring",
              currentActive === item.id ? "is-active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-current={currentActive === item.id ? "location" : undefined}
            onclick={() => handleItemClick(item)}
          >
            {item.label}
          </a>
        {/if}
      </li>
    {/each}
  </ul>
</nav>
