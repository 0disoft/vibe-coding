<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  import { DsCard } from "$lib/components/design-system";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    title: string;
    description: string;
    lang: string;
    content: string;
  }

  let {
    title,
    description,
    lang,
    content,
    class: className = "",
    ...rest
  }: Props = $props();
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
</svelte:head>

<div {...rest} class={["container py-12", className].filter(Boolean).join(" ")}>
  <div class="mx-auto max-w-4xl">
    <DsCard padding="lg">
      <article class="prose max-w-none" lang={lang}>
        {@html content}<!-- security-ignore: xss-svelte-html -->
      </article>
    </DsCard>
  </div>
</div>

