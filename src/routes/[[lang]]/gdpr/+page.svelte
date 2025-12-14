<script lang="ts">
  import { site } from '$lib/constants';
  import type { PageData } from './$types';

  // 서버에서 로드된 HTML 컨텐츠
  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>
    {data.lang === 'ko' ? 'GDPR 및 개인정보 권리' : 'GDPR & Privacy Rights'} | {site.name}
  </title>
  <meta
    name="description"
    content={data.lang === 'ko' ? `${site.name} GDPR 및 개인정보 권리` : `${site.name} GDPR & Privacy Rights`}
  />
</svelte:head>

<!-- 마크다운에서 변환된 HTML 렌더링 -->
<article class="prose mx-auto max-w-3xl px-4 py-12 md:px-6" lang={data.lang}>
  {@html data.content}<!-- security-ignore: xss-svelte-html (레포 내 정적 마크다운을 빌드 타임에 로드해 marked로 변환한 결과) -->
</article>
