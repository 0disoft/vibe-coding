<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  import * as m from "$lib/paraglide/messages.js";
  import { DsBreadcrumb } from "$lib/components/design-system";
  import type { BreadcrumbItem } from "./Breadcrumb.svelte";

  type Align = "start" | "center" | "between";
  type Size = "sm" | "md" | "lg";

  interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    id?: string;
    title: string;
    description?: string;
    breadcrumbs?: BreadcrumbItem[];
    breadcrumbLabel?: string;
    size?: Size;
    align?: Align;
    titleTag?: "h1" | "h2" | "h3" | "div";
    actions?: Snippet;
    meta?: Snippet;
    children?: Snippet;
  }

  const autoId = $props.id();

  let {
    id = autoId,
    title,
    description,
    breadcrumbs,
    breadcrumbLabel = m.ds_breadcrumb(),
    size = "md",
    align = "between",
    titleTag = "h1",
    actions,
    meta,
    class: className = "",
    children,
    ...rest
  }: Props = $props();

  let titleId = $derived(`${id}-title`);
</script>

<header
  id={id}
  {...rest}
  class={["ds-page-header", className].filter(Boolean).join(" ")}
  data-ds-size={size}
  data-ds-align={align}
  aria-labelledby={titleId}
>
  {#if breadcrumbs}
    <div class="ds-page-header-breadcrumbs">
      <DsBreadcrumb items={breadcrumbs} label={breadcrumbLabel} />
    </div>
  {/if}

  <div class="ds-page-header-main">
    <div class="ds-page-header-copy">
      <svelte:element this={titleTag} class="ds-page-header-title" id={titleId}>
        {title}
      </svelte:element>

      {#if description}
        <p class="ds-page-header-description">{description}</p>
      {/if}

      {#if meta}
        <div class="ds-page-header-meta">
          {@render meta()}
        </div>
      {/if}

      {#if children}
        <div class="ds-page-header-extra">
          {@render children()}
        </div>
      {/if}
    </div>

    {#if actions}
      <div class="ds-page-header-actions">
        {@render actions()}
      </div>
    {/if}
  </div>
</header>
