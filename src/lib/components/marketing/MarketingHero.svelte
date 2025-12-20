<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  import { DsLinkButton } from "$lib/components/design-system";

  type Cta = {
    label: string;
    href: string;
  };

  type HeadingLevel = 1 | 2;

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    kicker?: string;
    title: string;
    description?: string;
    headingLevel?: HeadingLevel;
    primary?: Cta;
    secondary?: Cta;
    actions?: Snippet;
  }

  let {
    kicker,
    title,
    description,
    headingLevel = 1,
    primary,
    secondary,
    actions,
    class: className = "",
    ...rest
  }: Props = $props();

  let headingTag = $derived(`h${headingLevel}`);
</script>

<div
  {...rest}
  class={["mx-auto max-w-2xl space-y-6 text-center", className]
    .filter(Boolean)
    .join(" ")}
>
  {#if kicker}
    <p class="text-label text-muted-foreground">{kicker}</p>
  {/if}
  <svelte:element this={headingTag} class="text-h1 font-semibold">
    {title}
  </svelte:element>
  {#if description}
    <p class="text-body-secondary text-muted-foreground">{description}</p>
  {/if}

  {#if actions}
    <div class="flex justify-center gap-2">
      {@render actions()}
    </div>
  {:else if primary || secondary}
    <div class="flex justify-center gap-2">
      {#if primary}
        <DsLinkButton href={primary.href} intent="primary">
          {primary.label}
        </DsLinkButton>
      {/if}
      {#if secondary}
        <DsLinkButton href={secondary.href} variant="outline" intent="secondary">
          {secondary.label}
        </DsLinkButton>
      {/if}
    </div>
  {/if}
</div>

