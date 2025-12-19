<script lang="ts">
  import { PolicyLayout } from '$lib/components/policy';
  import { site } from '$lib/constants';
  import * as m from '$lib/paraglide/messages';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let title = $derived(`${m.footer_bug_bounty({}, { locale: data.lang })} | ${site.name}`);
  let description = $derived(
    data.lang === 'ko'
      ? `${site.name} 버그 바운티 프로그램`
      : `${site.name} Bug Bounty Program`,
  );
</script>

<PolicyLayout title={title} description={description} lang={data.lang} content={data.content} />
