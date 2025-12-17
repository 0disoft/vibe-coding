<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  import { DsIcon } from "$lib/components/design-system";

  interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    icon?: string;
    title: string;
    description?: string;
    children?: Snippet;
    actions?: Snippet;
  }

  let {
    icon = "inbox",
    title,
    description,
    class: className = "",
    children,
    actions,
    ...rest
  }: Props = $props();

  let rootClass = $derived(["ds-empty-state", className].filter(Boolean).join(" "));
</script>

<section {...rest} class={rootClass}>
  <div class="ds-empty-state-icon" aria-hidden="true">
    <DsIcon name={icon} size="lg" />
  </div>

  <div class="ds-empty-state-body">
    <h2 class="ds-empty-state-title">{title}</h2>
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

