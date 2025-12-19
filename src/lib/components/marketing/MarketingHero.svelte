<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  import { DsLinkButton } from "$lib/components/design-system";

  type Cta = {
    label: string;
    href: string;
  };

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    kicker?: string;
    title: string;
    description?: string;
    primary?: Cta;
    secondary?: Cta;
  }

  let {
    kicker,
    title,
    description,
    primary,
    secondary,
    class: className = "",
    ...rest
  }: Props = $props();
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
  <h1 class="text-h1 font-semibold">{title}</h1>
  {#if description}
    <p class="text-body-secondary text-muted-foreground">{description}</p>
  {/if}

  {#if primary || secondary}
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

