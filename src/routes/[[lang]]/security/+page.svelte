<script lang="ts">
  import { site } from '$lib/constants';
  import * as m from '$lib/paraglide/messages';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>
    {m.footer_security({}, { locale: data.lang })} | {site.name}
  </title>
  <meta name="description" content={data.lang === 'ko' ? `${site.name} 보안 정책` : `${site.name} Security Policy`} />
</svelte:head>

<article class="prose mx-auto max-w-3xl px-4 py-12 md:px-6" lang={data.lang}>
  {@html data.content}
</article>
