<script lang="ts">
  import { page } from '$app/state';
  import * as m from '$lib/paraglide/messages.js';
  import { localizeUrl } from '$lib/paraglide/runtime.js';

  import { DsLinkButton } from '$lib/components/design-system';
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
  <h1 id="error-title" class="text-h1 font-bold">{page.status}</h1>
  <p class="text-body-secondary text-muted-foreground">
    {#if page.status === 404}
      {m.error_not_found()}
    {:else if page.status >= 500}
      {m.error_unexpected()}
    {:else}
      {page.error?.message ?? m.error_unexpected()}
    {/if}
  </p>
  <DsLinkButton href={localizeUrl('/').href} intent="primary">
    {m.error_go_home()}
  </DsLinkButton>
</div>
