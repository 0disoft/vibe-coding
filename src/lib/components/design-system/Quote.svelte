<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type QuoteVariant = "classic" | "modern" | "plain";

  interface Props extends Omit<HTMLAttributes<HTMLQuoteElement>, "children" | "cite"> {
    /** 인용 원문 URL */
    cite?: string;
    children?: Snippet;
    author?: string;
    source?: string;
    variant?: QuoteVariant;
    showIcon?: boolean;
  }

  let {
    cite,
    children,
    author,
    source,
    variant = "classic",
    showIcon = false,
    class: className = "",
    ...rest
  }: Props = $props();

  let variantClass = $derived(
    variant === "classic"
      ? "ds-quote--classic"
      : variant === "modern"
        ? "ds-quote--modern"
        : "ds-quote--plain",
  );
</script>

<blockquote
  {...rest}
  {cite}
  class={["ds-quote", variantClass, className].filter(Boolean).join(" ")}
>
  {#if showIcon}
    <span class="ds-quote-icon" aria-hidden="true">“</span>
  {/if}

  <div class="ds-quote-body">
    {#if children}
      {@render children()}
    {/if}
  </div>

  {#if author || source}
    <footer class="ds-quote-cite">
      <span class="ds-quote-dash" aria-hidden="true">—</span>
      <span class="ds-quote-meta">
        {#if author}
          <span class="ds-quote-author">{author}</span>
        {/if}
        {#if source}
          <cite class="ds-quote-source">{source}</cite>
        {/if}
      </span>
    </footer>
  {/if}
</blockquote>
