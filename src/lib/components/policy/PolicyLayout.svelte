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

<div {...rest} class={["container px-4 py-12 md:px-6", className].filter(Boolean).join(" ")}>
  <div class="mx-auto max-w-4xl">
    <DsCard class="p-6 md:p-8">
      <article class="prose max-w-none" lang={lang}>
        {@html content}<!-- security-ignore: xss-svelte-html -->
      </article>
    </DsCard>
  </div>
</div>

