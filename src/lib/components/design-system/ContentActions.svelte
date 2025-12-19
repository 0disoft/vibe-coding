<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  import DsCopyButton from "./CopyButton.svelte";
  import DsIconButton from "./IconButton.svelte";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    url?: string;
    copyLabel?: string;
    copiedLabel?: string;
    bookmarkLabel?: string;
    openLabel?: string;
    bookmarked?: boolean;
    onBookmarkedChange?: (next: boolean) => void;
    showOpen?: boolean;
  }

  let {
    url,
    copyLabel = "Copy link",
    copiedLabel = "Copied",
    bookmarkLabel = "Bookmark",
    openLabel = "Open",
    bookmarked = $bindable(false),
    onBookmarkedChange,
    showOpen = false,
    class: className = "",
    ...rest
  }: Props = $props();

  function handleBookmark() {
    const next = !bookmarked;
    bookmarked = next;
    onBookmarkedChange?.(next);
  }
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
    label={bookmarked ? "Remove bookmark" : bookmarkLabel}
    size="sm"
    variant="ghost"
    intent={bookmarked ? "primary" : "neutral"}
    pressed={bookmarked}
    aria-pressed={bookmarked}
    onclick={handleBookmark}
  />

  {#if url && showOpen}
    <DsIconButton
      icon="external-link"
      label={openLabel}
      size="sm"
      variant="ghost"
      intent="neutral"
      onclick={() => window.open(url, "_blank", "noopener,noreferrer")}
    />
  {/if}
</div>
