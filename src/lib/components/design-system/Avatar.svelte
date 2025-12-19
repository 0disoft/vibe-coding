<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Size = "sm" | "md" | "lg" | "xl";

  interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
    src?: string | null;
    alt?: string;
    name?: string;
    size?: Size;
    loading?: "eager" | "lazy";
    /** 이미지 로드 실패 시 표시할 fallback (미지정이면 name의 이니셜) */
    fallback?: Snippet;
  }

  let {
    src,
    alt = "",
    name,
    size = "md",
    loading = "lazy",
    fallback,
    class: className = "",
    ...rest
  }: Props = $props();

  let imageStatus = $state<"loading" | "loaded" | "error">("error");

  $effect(() => {
    // src가 바뀌면 재시도
    src;
    imageStatus = src ? "loading" : "error";
  });

  function initialsFromName(n?: string) {
    const s = (n ?? "").trim();
    if (!s) return "?";
    const parts = s.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? "?";
    const last = parts.length > 1 ? parts.at(-1)?.[0] ?? "" : "";
    return `${first}${last}`.toUpperCase();
  }

  let initials = $derived(initialsFromName(name));
  let rootClass = $derived(["ds-avatar", className].filter(Boolean).join(" "));
  let shouldShowImage = $derived(!!src && imageStatus !== "error");
  let label = $derived(name || alt || "Avatar");
</script>

<span
  {...rest}
  class={rootClass}
  data-ds-size={size}
  data-state={imageStatus}
  role={!shouldShowImage ? "img" : undefined}
  aria-label={!shouldShowImage ? label : undefined}
>
  {#if shouldShowImage}
    <img
      class="ds-avatar-image"
      src={src}
      alt={label}
      {loading}
      onload={() => {
        imageStatus = "loaded";
      }}
      onerror={() => {
        imageStatus = "error";
      }}
    />
  {:else}
    <span class="ds-avatar-fallback" aria-hidden="true">
      {#if fallback}
        {@render fallback()}
      {:else}
        {initials}
      {/if}
    </span>
  {/if}
</span>
