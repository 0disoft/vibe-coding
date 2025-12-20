<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { setContext } from "svelte";

  import { page } from "$app/state";

  import { getDirForLocale, getLocaleFromUrl, type Direction, type Locale } from "$lib/shared/utils/locale";

  export const DS_DIRECTION_CONTEXT = Symbol("ds-direction");

  export type DirectionContext = {
    readonly locale: Locale;
    readonly dir: Direction;
  };

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    /** 강제로 locale을 지정하고 싶을 때만 사용(대부분 자동) */
    locale?: Locale;
    /** documentElement(<html>)에 lang/dir을 적용 */
    applyToDocument?: boolean;
    children?: Snippet;
  }

  let {
    locale,
    applyToDocument = true,
    children,
    class: className = "",
    ...rest
  }: Props = $props();

  let resolvedLocale = $derived(locale ?? getLocaleFromUrl(page.url));
  let resolvedDir = $derived(getDirForLocale(resolvedLocale));

  const ctx: DirectionContext = {
    get locale() {
      return resolvedLocale;
    },
    get dir() {
      return resolvedDir;
    },
  };

  setContext(DS_DIRECTION_CONTEXT, ctx);

  $effect(() => {
    if (!applyToDocument) return;
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    if (root.lang !== resolvedLocale) root.lang = resolvedLocale;
    if (root.dir !== resolvedDir) root.dir = resolvedDir;
  });
</script>

{#if applyToDocument}
  <div {...rest} class={["contents", className].filter(Boolean).join(" ")}>
    {#if children}
      {@render children()}
    {/if}
  </div>
{:else}
  <div
    {...rest}
    class={className}
    dir={resolvedDir}
    lang={resolvedLocale}
  >
    {#if children}
      {@render children()}
    {/if}
  </div>
{/if}
