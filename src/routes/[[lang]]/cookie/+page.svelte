<script lang="ts">
  import { PolicyLayout } from '$lib/components/policy';
  import { site } from '$lib/constants';
  import type { PageData } from './$types';

  // 서버에서 로드된 HTML 컨텐츠
  let { data }: { data: PageData } = $props();

  let title = $derived(
    data.lang === 'ko' ? `쿠키 정책 | ${site.name}` : `Cookie Policy | ${site.name}`,
  );
  let description = $derived(
    data.lang === 'ko' ? `${site.name} 쿠키 정책` : `${site.name} Cookie Policy`,
  );
</script>

<PolicyLayout title={title} description={description} lang={data.lang} content={data.content} />
