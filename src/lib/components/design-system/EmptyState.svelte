<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  import { DsIcon } from "$lib/components/design-system";

  interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    icon?: string;
    title: string;
    description?: string;
    headingLevel?: "h1" | "h2" | "h3" | "h4" | "h5" | "div";
    children?: Snippet;
    actions?: Snippet;
  }

  let {
    icon = "inbox",
    title,
    description,
    headingLevel = "h3",
    role: roleProp,
    "aria-labelledby": ariaLabelledby,
    class: className = "",
    children,
    actions,
    ...rest
  }: Props = $props();

  const titleId = $props.id();
  let computedRole = $derived(roleProp ?? "region");
  let labelledBy = $derived(ariaLabelledby ?? titleId);

  let rootClass = $derived(["ds-empty-state", className].filter(Boolean).join(" "));
</script>

<section {...rest} class={rootClass} role={computedRole} aria-labelledby={labelledBy}>
  <div class="ds-empty-state-icon" aria-hidden="true">
    <DsIcon name={icon} size="lg" />
  </div>

  <div class="ds-empty-state-body">
    <svelte:element this={headingLevel} class="ds-empty-state-title" id={titleId}>
      {title}
    </svelte:element>
    {#if description}
      <p class="ds-empty-state-description">{description}</p>
    {/if}

    {#if children}
      <div class="ds-empty-state-content">
        {@render children()}
      </div>
    {/if}

    {#if actions}
      <div class="ds-empty-state-actions">
        {@render actions()}
      </div>
    {/if}
  </div>
</section>

