<script lang="ts">
  import { PolicyLayout } from '$lib/components/policy';
  import { site } from '$lib/constants';
  import * as m from '$lib/paraglide/messages';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let title = $derived(`${m.footer_security({}, { locale: data.lang })} | ${site.name}`);
  let description = $derived(
    data.lang === 'ko' ? `${site.name} 보안 정책` : `${site.name} Security Policy`,
  );
</script>

<PolicyLayout title={title} description={description} lang={data.lang} content={data.content} />
