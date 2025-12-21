<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  import { DsIcon } from "$lib/components/design-system";

  type Align = "start" | "center";
  type Size = "sm" | "md";

  interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    id?: string;
    title: string;
    titleSnippet?: Snippet;
    description?: string;
    icon?: string;
    actions?: Snippet;
    align?: Align;
    size?: Size;
    role?: "status" | "region";
    ariaLive?: "polite" | "assertive";
  }

  const autoId = $props.id();

  let {
    id = autoId,
    title,
    titleSnippet,
    description,
    icon,
    actions,
    align = "start",
    size = "sm",
    role,
    ariaLive,
    class: className = "",
    ...rest
  }: Props = $props();

  let titleId = $derived(`${id}-title`);
  let resolvedAriaLive = $derived(
    role === "status" ? ariaLive ?? "polite" : ariaLive,
  );
</script>

<section
  id={id}
  {...rest}
  class={["ds-empty-state-mini", className].filter(Boolean).join(" ")}
  data-ds-align={align}
  data-ds-size={size}
  role={role}
  aria-labelledby={titleId}
  aria-live={resolvedAriaLive}
>
  {#if icon}
    <div class="ds-empty-state-mini-icon" aria-hidden="true">
      <DsIcon name={icon} size={size === "sm" ? "sm" : "md"} />
    </div>
  {/if}
  <div class="ds-empty-state-mini-title" id={titleId}>
    {#if titleSnippet}
      {@render titleSnippet()}
    {:else}
      {title}
    {/if}
  </div>
  {#if description}
    <p class="ds-empty-state-mini-description">{description}</p>
  {/if}
  {#if actions}
    <div class="ds-empty-state-mini-actions">
      {@render actions()}
    </div>
  {/if}
</section>
