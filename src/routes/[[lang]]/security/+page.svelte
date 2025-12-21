<script lang="ts">
  import { DsBreadcrumb } from '$lib/components/design-system';
  import { PolicyLayout } from '$lib/components/policy';
  import { policy, site } from '$lib/constants';
  import * as m from '$lib/paraglide/messages';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  const currentId = 'security';

  let docTitle = $derived(m.footer_security({}, { locale: data.lang }));
  let headTitle = $derived(`${docTitle} | ${site.name}`);
  let description = $derived(
    data.lang === 'ko' ? `${site.name} 보안 정책` : `${site.name} Security Policy`,
  );
  let updatedAt = $derived(
    new Intl.DateTimeFormat(data.lang, { dateStyle: 'long' }).format(
      new Date(policy.effectiveDate.security),
    ),
  );
  let updatedAtLabel = $derived(m.policy_effective_date_label({}, { locale: data.lang }));
  let policySectionLabel = $derived(m.policy_breadcrumb_section({}, { locale: data.lang }));
  let policyMenuItems = $derived([
    {
      label: m.footer_terms({}, { locale: data.lang }),
      href: `/${data.lang}/terms`,
      disabled: currentId === 'terms',
    },
    {
      label: m.footer_privacy({}, { locale: data.lang }),
      href: `/${data.lang}/privacy`,
      disabled: currentId === 'privacy',
    },
    {
      label: m.footer_cookie_policy({}, { locale: data.lang }),
      href: `/${data.lang}/cookie`,
      disabled: currentId === 'cookie',
    },
    {
      label: m.footer_security({}, { locale: data.lang }),
      href: `/${data.lang}/security`,
      disabled: currentId === 'security',
    },
    {
      label: m.footer_gdpr({}, { locale: data.lang }),
      href: `/${data.lang}/gdpr`,
      disabled: currentId === 'gdpr',
    },
    {
      label: m.footer_accessibility({}, { locale: data.lang }),
      href: `/${data.lang}/accessibility`,
      disabled: currentId === 'accessibility',
    },
    {
      label: m.footer_bug_bounty({}, { locale: data.lang }),
      href: `/${data.lang}/bug-bounty`,
      disabled: currentId === 'bug-bounty',
    },
  ]);
  let breadcrumbs = $derived([
    { label: site.name, href: `/${data.lang}` },
    {
      label: policySectionLabel,
      menuItems: policyMenuItems,
      menuLabel: policySectionLabel,
    },
    { label: docTitle },
  ]);
</script>

<PolicyLayout
  title={docTitle}
  headTitle={headTitle}
  description={description}
  lang={data.lang}
  content={data.content}
  updatedAt={updatedAt}
  updatedAtLabel={updatedAtLabel}
>
  {#snippet header()}
    <DsBreadcrumb items={breadcrumbs} />
  {/snippet}
</PolicyLayout>
