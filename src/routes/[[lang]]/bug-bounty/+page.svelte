<script lang="ts">
  import { site } from '$lib/constants';
  import * as m from '$lib/paraglide/messages';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>
    {m.footer_bug_bounty({}, { locale: data.lang })} | {site.name}
  </title>
  <meta
    name="description"
    content={data.lang === 'ko' ? `${site.name} 버그 바운티 프로그램` : `${site.name} Bug Bounty Program`}
  />
</svelte:head>

<article class="prose mx-auto max-w-3xl px-4 py-12 md:px-6" lang={data.lang}>
  {@html data.content}<!-- security-ignore: xss-svelte-html (레포 내 정적 마크다운을 빌드 타임에 로드해 marked로 변환한 결과) -->
</article>
