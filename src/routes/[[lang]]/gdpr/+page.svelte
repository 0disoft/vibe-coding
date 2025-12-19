<script lang="ts">
  import { PolicyLayout } from '$lib/components/policy';
  import { site } from '$lib/constants';
  import type { PageData } from './$types';

  // 서버에서 로드된 HTML 컨텐츠
  let { data }: { data: PageData } = $props();

  let title = $derived(
    data.lang === 'ko'
      ? `GDPR 및 개인정보 권리 | ${site.name}`
      : `GDPR & Privacy Rights | ${site.name}`,
  );
  let description = $derived(
    data.lang === 'ko'
      ? `${site.name} GDPR 및 개인정보 권리`
      : `${site.name} GDPR & Privacy Rights`,
  );
</script>

<PolicyLayout title={title} description={description} lang={data.lang} content={data.content} />
