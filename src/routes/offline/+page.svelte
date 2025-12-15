<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';

  import { DsButton } from '$lib/components/design-system';
</script>

<svelte:head>
  <title>{m.offline_title()}</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<!-- 오프라인 페이지는 layout 없이 렌더될 수 있으므로 min-h-screen 사용 -->
<div
  class="flex flex-col items-center justify-center min-h-screen gap-6 text-center bg-background text-foreground"
  role="alert"
  aria-labelledby="offline-title"
>
  <h1 id="offline-title" class="text-5xl font-bold tracking-tight">{m.offline_title()}</h1>
  <p class="text-xl text-muted-foreground">{m.offline_message()}</p>
  <DsButton intent="primary" onclick={() => window.location.reload()}>
    {m.offline_retry()}
  </DsButton>
</div>
