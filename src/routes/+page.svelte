<script lang="ts">
	import { MarketingHero } from "$lib/components/marketing";

	import { page } from "$app/state";
	import { site } from "$lib/constants";
	import * as m from "$lib/paraglide/messages.js";
	import { localizeUrl } from "$lib/paraglide/runtime.js";
	import { getLocaleFromUrl, type Locale } from "$lib/shared/utils/locale";

	let currentLocale = $derived<Locale>(getLocaleFromUrl(page.url));
</script>

<svelte:head>
	<title>{m.meta_site_title({ siteName: site.name })}</title>
	<meta
		name="description"
		content={m.meta_site_description({ siteDescription: site.description })}
	/>
</svelte:head>

<div class="container mx-auto py-16">
	<MarketingHero
		kicker="Local Template Sandbox"
		title={m.meta_site_title({ siteName: site.name })}
		description={m.meta_site_description({ siteDescription: site.description })}
		primary={{
			label: "Design System",
			href: localizeUrl("/design-system", { locale: currentLocale }).href,
		}}
		secondary={{
			label: "Coverage",
			href: localizeUrl("/design-system#coverage", { locale: currentLocale })
				.href,
		}}
	/>
</div>
