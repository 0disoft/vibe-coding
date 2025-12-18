<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  import DsCard from "./Card.svelte";
  import DsContentActions from "./ContentActions.svelte";
  import DsContentMeta from "./ContentMeta.svelte";
  import DsStatusBadge, { type ContentStatus } from "./StatusBadge.svelte";
  import DsTagList from "./TagList.svelte";

  interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    title: string;
    href?: string;
    excerpt?: string;
    imageSrc?: string;
    imageAlt?: string;
    status?: ContentStatus;
    author?: string;
    category?: string;
    date?: string | Date;
    readingMinutes?: number;
    tags?: string[];
    /** 우측 상단 액션 영역 (기본: ContentActions) */
    actions?: Snippet;
    /** 카드 본문 커스터마이즈 */
    children?: Snippet;
  }

  let {
    title,
    href,
    excerpt,
    imageSrc,
    imageAlt = "",
    status,
    author,
    category,
    date,
    readingMinutes,
    tags,
    actions,
    children: extra,
    class: className = "",
    ...rest
  }: Props = $props();
</script>

<article {...rest} class={["ds-content-card", className].filter(Boolean).join(" ")}>
  <DsCard tag={href ? "a" : "div"} href={href} padding="none" class="ds-content-card-inner">
    {#snippet header()}
      {#if imageSrc}
        <div class="ds-content-card-media" aria-hidden="true">
          <img class="ds-content-card-image" src={imageSrc} alt={imageAlt} loading="lazy" />
        </div>
      {/if}
    {/snippet}

    {#snippet children()}
      <div class="ds-content-card-body">
        <div class="ds-content-card-top">
          {#if status}
            <DsStatusBadge status={status} />
          {/if}
          <div class="ds-content-card-actions">
            {#if actions}
              {@render actions()}
            {:else}
              <DsContentActions url={href} />
            {/if}
          </div>
        </div>

        <div class="ds-content-card-title">{title}</div>
        {#if excerpt}
          <div class="ds-content-card-excerpt">{excerpt}</div>
        {/if}

        <DsContentMeta {author} {category} {date} {readingMinutes} />

        {#if tags?.length}
          <DsTagList tags={tags} maxVisible={6} />
        {/if}

        {#if extra}
          <div class="ds-content-card-extra">
            {@render extra()}
          </div>
        {/if}
      </div>
    {/snippet}
  </DsCard>
</article>
