<script lang="ts">
  import { page } from '$app/state';
  import * as m from '$lib/paraglide/messages.js';
  import { localizeUrl } from '$lib/paraglide/runtime.js';
</script>

<svelte:head>
  <title>{page.status} | Error</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<!-- 에러 페이지는 main 내부에서 렌더되므로 min-h로 자체 높이 확보 -->
<div
  class="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center"
  role="alert"
  aria-labelledby="error-title"
>
  <h1 id="error-title" class="text-5xl font-bold tracking-tight">{page.status}</h1>
  <p class="text-xl text-muted-foreground">
    {#if page.status === 404}
      {m.error_not_found()}
    {:else if page.status >= 500}
      {m.error_unexpected()}
    {:else}
      {page.error?.message ?? m.error_unexpected()}
    {/if}
  </p>
  <a
    href={localizeUrl('/').href}
    class="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold transition-all rounded-md shadow-lg bg-primary text-primary-foreground hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
  >
    {m.error_go_home()}
  </a>
</div>
