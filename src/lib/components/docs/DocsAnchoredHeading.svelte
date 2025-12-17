<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type HeadingLevel = 2 | 3 | 4;

  interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    id: string;
    level?: HeadingLevel;
    /** 단순 텍스트 헤딩(스니펫 생략용) */
    text?: string;
    /** URL 복사 버튼 레이블(i18n) */
    copyLabel?: string;
    copiedLabel?: string;
    children?: Snippet;
  }

  let {
    id,
    level = 2,
    text,
    copyLabel = "Copy link",
    copiedLabel = "Copied link",
    class: className = "",
    children,
    ...rest
  }: Props = $props();

  let copied = $state(false);
  let timer: number | null = null;

  function headingTag(): string {
    return `h${level}`;
  }

  async function copyLink(e: MouseEvent) {
    e.preventDefault();

    const url = new URL(window.location.href);
    url.hash = id;
    history.replaceState(null, "", url.toString());

    try {
      await navigator.clipboard?.writeText?.(url.toString());
      copied = true;
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => (copied = false), 1200);
    } catch {
      // clipboard 미지원/권한 거부: 해시만 이동
      location.hash = id;
    }
  }
</script>

<svelte:element
  this={headingTag()}
  {...rest}
  id={id}
  class={[
    "group flex scroll-mt-20 items-center gap-2",
    level === 2 ? "text-h2 font-semibold" : "",
    level === 3 ? "text-h3 font-semibold" : "",
    level === 4 ? "text-h4 font-semibold" : "",
    className
  ]
    .filter(Boolean)
    .join(" ")}
>
  <span class="min-w-0">
    {#if children}
      {@render children()}
    {:else if text}
      {text}
    {/if}
  </span>
  <a
    href={`#${id}`}
    class="ds-focus-ring inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
    aria-label={copied ? copiedLabel : copyLabel}
    onclick={copyLink}
  >
    <span class="i-lucide-link h-4 w-4" aria-hidden="true"></span>
  </a>
</svelte:element>
