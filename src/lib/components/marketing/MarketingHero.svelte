<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  import { DsLinkButton } from "$lib/components/design-system";

  type Cta = {
    label: string;
    href: string;
  };

  type HeadingLevel = 1 | 2;

  interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    kicker?: string;
    title: string;
    description?: string;
    headingLevel?: HeadingLevel;
    primary?: Cta;
    secondary?: Cta;
    actions?: Snippet;
  }

  const generatedId = $props.id();

  let {
    kicker,
    title,
    description,
    headingLevel = 1,
    primary,
    secondary,
    actions,
    id: idProp,
    class: className = "",
    ...rest
  }: Props = $props();

  let id = $derived(idProp ?? generatedId);
  let headingTag = $derived(`h${headingLevel}`);
  let headingId = $derived(`${id}-title`);
  let headingClass = $derived(
    [headingLevel === 1 ? "text-h1" : "text-h2", "font-semibold"]
      .filter(Boolean)
      .join(" "),
  );
</script>

<section
  {...rest}
  {id}
  class={["mx-auto max-w-2xl space-y-6 text-center", className]
    .filter(Boolean)
    .join(" ")}
  aria-labelledby={headingId}
>
  {#if kicker}
    <p class="text-label text-muted-foreground">{kicker}</p>
  {/if}
  <svelte:element this={headingTag} id={headingId} class={headingClass}>
    {title}
  </svelte:element>
  {#if description}
    <p class="text-body-secondary text-muted-foreground">{description}</p>
  {/if}

  {#if actions}
    <div class="flex justify-center gap-2" role="group" aria-labelledby={headingId}>
      {@render actions()}
    </div>
  {:else if primary || secondary}
    <div class="flex justify-center gap-2" role="group" aria-labelledby={headingId}>
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
</section>
