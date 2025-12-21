<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  import { DsCard } from "$lib/components/design-system";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    title: string;
    headTitle?: string;
    description: string;
    lang: string;
    content: string;
    titleAs?: keyof HTMLElementTagNameMap;
    updatedAt?: string;
    updatedAtLabel?: string;
    header?: Snippet;
    meta?: Snippet;
  }

  const generatedId = $props.id();

  let {
    title,
    headTitle,
    description,
    lang,
    content,
    titleAs = "h1",
    updatedAt,
    updatedAtLabel = "Effective date",
    header: headerSnippet,
    meta: metaSnippet,
    id: idProp,
    class: className = "",
    ...rest
  }: Props = $props();

  let resolvedHeadTitle = $derived(headTitle ?? title);
  let id = $derived(idProp ?? generatedId);
  let titleId = $derived(`${id}-title`);
  let contentId = $derived(`${id}-content`);
  let shouldShowMeta = $derived(!!updatedAt || !!metaSnippet);
</script>

<svelte:head>
  <title>{resolvedHeadTitle}</title>
  <meta name="description" content={description} />
</svelte:head>

<div {...rest} class={["container py-12", className].filter(Boolean).join(" ")}>
  <div class="mx-auto max-w-4xl">
    <DsCard padding="lg">
      {#if headerSnippet}
        <div class="mb-4">{@render headerSnippet()}</div>
      {/if}
      <header class="space-y-2">
        <svelte:element this={titleAs} id={titleId} class="text-h1 font-semibold">
          {title}
        </svelte:element>
        {#if shouldShowMeta}
          <div class="flex flex-wrap items-center gap-3 text-body text-muted-foreground">
            {#if updatedAt}
              <span>{updatedAtLabel}: {updatedAt}</span>
            {/if}
            {#if metaSnippet}
              {@render metaSnippet()}
            {/if}
          </div>
        {/if}
      </header>
      <article
        id={contentId}
        class="prose max-w-none mt-6"
        lang={lang}
        aria-labelledby={titleId}
      >
        {@html content}<!-- security-ignore: xss-svelte-html -->
      </article>
    </DsCard>
  </div>
</div>

