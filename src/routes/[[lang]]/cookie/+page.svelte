<script lang="ts">
  import { DsCard } from '$lib/components/design-system';
  import { site } from '$lib/constants';
  import type { PageData } from './$types';

  // 서버에서 로드된 HTML 컨텐츠
  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>
    {data.lang === 'ko' ? '쿠키 정책' : 'Cookie Policy'} | {site.name}
  </title>
  <meta name="description" content={data.lang === 'ko' ? `${site.name} 쿠키 정책` : `${site.name} Cookie Policy`} />
</svelte:head>

<!-- 마크다운에서 변환된 HTML 렌더링 -->
<div class="container px-4 py-12 md:px-6">
  <div class="mx-auto max-w-4xl">
    <DsCard class="p-6 md:p-8">
      <article class="prose max-w-none" lang={data.lang}>
        {@html data.content}<!-- security-ignore: xss-svelte-html (레포 내 정적 마크다운을 빌드 타임에 로드해 marked로 변환한 결과) -->
      </article>
    </DsCard>
  </div>
</div>
