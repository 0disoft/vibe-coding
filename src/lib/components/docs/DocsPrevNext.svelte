<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  import * as m from "$lib/paraglide/messages.js";

  import { DsLinkButton, DsSeparator } from "$lib/components/design-system";

  type NavItem = {
    href: string;
    label: string;
    description?: string;
  };

  interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    prev?: NavItem;
    next?: NavItem;
  }

  let { prev, next, class: className = "", ...rest }: Props = $props();
</script>

<nav
  {...rest}
  class={["grid gap-3 sm:grid-cols-2", className].filter(Boolean).join(" ")}
  aria-label={m.docs_pagination_label()}
>
  <div class="min-w-0">
    {#if prev}
      <DsLinkButton href={prev.href} variant="outline" intent="secondary" class="w-full justify-start">
        <span class="i-lucide-arrow-left h-4 w-4" aria-hidden="true"></span>
        <span class="min-w-0">
          <span class="block text-menu-sm font-semibold truncate">{prev.label}</span>
          {#if prev.description}
            <span class="block text-helper text-muted-foreground truncate">{prev.description}</span>
          {/if}
        </span>
      </DsLinkButton>
    {/if}
  </div>

  <div class="min-w-0">
    {#if next}
      <DsLinkButton href={next.href} variant="outline" intent="secondary" class="w-full justify-end">
        <span class="min-w-0 text-end">
          <span class="block text-menu-sm font-semibold truncate">{next.label}</span>
          {#if next.description}
            <span class="block text-helper text-muted-foreground truncate">{next.description}</span>
          {/if}
        </span>
        <span class="i-lucide-arrow-right h-4 w-4" aria-hidden="true"></span>
      </DsLinkButton>
    {/if}
  </div>
</nav>

