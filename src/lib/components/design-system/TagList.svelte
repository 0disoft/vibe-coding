<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  import type { IntentWithNeutral } from "./types";
  import { toIntentCss } from "./types";

  type Variant = "soft" | "outline";
  type Size = "sm" | "md";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    tags: string[];
    maxVisible?: number;
    intent?: IntentWithNeutral;
    variant?: Variant;
    size?: Size;
    /** 태그 링크 생성 (없으면 non-interactive) */
    getHref?: (tag: string) => string;
    overflowLabel?: (count: number) => string;
  }

  let {
    tags,
    maxVisible = 6,
    intent = "neutral",
    variant = "soft",
    size = "sm",
    getHref,
    overflowLabel = (n) => `+${n}`,
    class: className = "",
    ...rest
  }: Props = $props();

  let intentCss = $derived(toIntentCss(intent));

  let visible = $derived(tags.slice(0, Math.max(0, maxVisible)));
  let overflowCount = $derived(Math.max(0, tags.length - visible.length));
</script>

<div {...rest} class={["ds-tag-list", className].filter(Boolean).join(" ")}>
  {#each visible as tag (tag)}
    {#if getHref}
      <a
        class="ds-tag ds-focus-ring"
        href={getHref(tag)}
        data-ds-intent={intentCss}
        data-ds-variant={variant}
        data-ds-size={size}
      >
        <span class="ds-tag-label">{tag}</span>
      </a>
    {:else}
      <span class="ds-tag" data-ds-intent={intentCss} data-ds-variant={variant} data-ds-size={size}>
        <span class="ds-tag-label">{tag}</span>
      </span>
    {/if}
  {/each}

  {#if overflowCount > 0}
    <span class="ds-tag" data-ds-intent="neutral" data-ds-variant="outline" data-ds-size={size}>
      <span class="ds-tag-label">{overflowLabel(overflowCount)}</span>
    </span>
  {/if}
</div>

