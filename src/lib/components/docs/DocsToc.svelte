<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  import * as m from "$lib/paraglide/messages.js";

  import type { TocItem } from "./types";

  interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    items: ReadonlyArray<TocItem>;
    activeId?: string;
    title?: string;
  }

  let {
    items,
    activeId,
    title = m.docs_on_this_page(),
    class: className = "",
    ...rest
  }: Props = $props();

  function indent(level?: number) {
    if (!level || level <= 2) return "ps-0";
    if (level === 3) return "ps-4";
    return "ps-7";
  }
</script>

<nav
  {...rest}
  class={["rounded-lg border border-border bg-surface p-4", className]
    .filter(Boolean)
    .join(" ")}
  aria-label={title}
>
  <div class="text-menu-sm font-semibold text-foreground">{title}</div>
  <ul class="mt-3 grid gap-1">
    {#each items as item (item.id)}
      <li class={indent(item.level)}>
        <a
          href={`#${item.id}`}
          class={[
            "block rounded px-2 py-1 text-menu-sm transition-colors",
            activeId === item.id
              ? "bg-surface-hover text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-surface-hover",
          ].join(" ")}
          aria-current={activeId === item.id ? "location" : undefined}
        >
          {item.label}
        </a>
      </li>
    {/each}
  </ul>
</nav>
