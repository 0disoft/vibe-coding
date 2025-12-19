<script lang="ts">
  import { PolicyLayout } from '$lib/components/policy';
  import { site } from '$lib/constants';
  import type { PageData } from './$types';

  // 서버에서 로드된 HTML 컨텐츠
  let { data }: { data: PageData } = $props();

  let title = $derived(
    data.lang === 'ko' ? `개인정보처리방침 | ${site.name}` : `Privacy Policy | ${site.name}`,
  );
  let description = $derived(
    data.lang === 'ko'
      ? `${site.name} 서비스 개인정보처리방침`
      : `${site.name} Privacy Policy`,
  );
</script>

<PolicyLayout title={title} description={description} lang={data.lang} content={data.content} />
