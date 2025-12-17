<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  import DsCopyButton from "./CopyButton.svelte";
  import DsIconButton from "./IconButton.svelte";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    url?: string;
    copyLabel?: string;
    copiedLabel?: string;
    bookmarkLabel?: string;
    bookmarked?: boolean;
    onBookmarkedChange?: (next: boolean) => void;
    showOpen?: boolean;
  }

  let {
    url,
    copyLabel = "Copy link",
    copiedLabel = "Copied",
    bookmarkLabel = "Bookmark",
    bookmarked = false,
    onBookmarkedChange,
    showOpen = false,
    class: className = "",
    ...rest
  }: Props = $props();
</script>

<div {...rest} class={["ds-content-actions", className].filter(Boolean).join(" ")}>
  {#if url}
    <DsCopyButton
      size="sm"
      variant="ghost"
      intent="neutral"
      icon="link"
      copiedIcon="check"
      label={copyLabel}
      copiedLabel={copiedLabel}
      text={url}
    />
  {/if}

  <DsIconButton
    icon={bookmarked ? "bookmark-check" : "bookmark"}
    label={bookmarkLabel}
    size="sm"
    variant="ghost"
    intent="neutral"
    pressed={bookmarked}
    onclick={() => onBookmarkedChange?.(!bookmarked)}
  />

  {#if url && showOpen}
    <DsIconButton
      icon="external-link"
      label="Open"
      size="sm"
      variant="ghost"
      intent="neutral"
      onclick={() => window.open(url, "_blank", "noopener,noreferrer")}
    />
  {/if}
</div>

