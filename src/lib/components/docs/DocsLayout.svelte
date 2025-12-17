<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  import { DsButton, DsSheet } from "$lib/components/design-system";

  import DocsToc, { type TocItem } from "$lib/components/docs/DocsToc.svelte";

  interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    title: string;
    description?: string;
    sidebar?: Snippet;
    tocItems?: ReadonlyArray<TocItem>;
    children?: Snippet;
  }

  let {
    title,
    description,
    sidebar,
    tocItems = [],
    class: className = "",
    children,
    ...rest
  }: Props = $props();

  let sidebarOpen = $state(false);
  let tocOpen = $state(false);
</script>

<div
  {...rest}
  class={["grid gap-6 lg:grid-cols-[260px_1fr_260px]", className]
    .filter(Boolean)
    .join(" ")}
>
  <aside class="hidden lg:block">
    {#if sidebar}
      {@render sidebar()}
    {/if}
  </aside>

  <section class="min-w-0">
    <header class="space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h1 class="text-h1 font-semibold">{title}</h1>
        <div class="flex items-center gap-2 lg:hidden">
          {#if sidebar}
            <DsButton size="sm" variant="outline" intent="secondary" onclick={() => (sidebarOpen = true)}>
              <span class="i-lucide-menu h-4 w-4" aria-hidden="true"></span>
              Menu
            </DsButton>
          {/if}
          {#if tocItems.length > 0}
            <DsButton size="sm" variant="outline" intent="secondary" onclick={() => (tocOpen = true)}>
              <span class="i-lucide-list h-4 w-4" aria-hidden="true"></span>
              On this page
            </DsButton>
          {/if}
        </div>
      </div>
      {#if description}
        <p class="text-body-secondary text-muted-foreground">{description}</p>
      {/if}
    </header>

    <div class="mt-6 min-w-0">
      {#if children}
        {@render children()}
      {/if}
    </div>
  </section>

  <aside class="hidden lg:block">
    {#if tocItems.length > 0}
      <DocsToc items={tocItems} />
    {/if}
  </aside>
</div>

{#if sidebar}
  <DsSheet
    id="docs-sidebar"
    title="Docs Menu"
    open={sidebarOpen}
    onOpenChange={(next) => (sidebarOpen = next)}
    side="left"
    size="sm"
    closeOnOutsideClick
    closeOnEscape
    class="lg:hidden"
  >
    {@render sidebar()}
  </DsSheet>
{/if}

{#if tocItems.length > 0}
  <DsSheet
    id="docs-toc"
    title="On this page"
    open={tocOpen}
    onOpenChange={(next) => (tocOpen = next)}
    side="right"
    size="sm"
    closeOnOutsideClick
    closeOnEscape
    class="lg:hidden"
  >
    <DocsToc items={tocItems} class="border-0 bg-transparent p-0" />
  </DsSheet>
{/if}

