<script lang="ts">
	import { DsLinkButton } from "$lib/components/design-system";

	import { site } from "$lib/constants";
	import * as m from "$lib/paraglide/messages.js";
</script>

<svelte:head>
	<title>{m.meta_site_title({ siteName: site.name })}</title>
	<meta
		name="description"
		content={m.meta_site_description({ siteDescription: site.description })}
	/>
</svelte:head>

<div class="container py-16">
	<div class="mx-auto max-w-2xl space-y-6 text-center">
		<p class="text-label text-muted-foreground">Local Template Sandbox</p>
		<h1 class="text-h1 font-semibold">
			{m.meta_site_title({ siteName: site.name })}
		</h1>
		<p class="text-body-secondary text-muted-foreground">
			{m.meta_site_description({ siteDescription: site.description })}
		</p>
		<div class="flex justify-center gap-2">
			<DsLinkButton href="/design-system" intent="primary">
				Design System
			</DsLinkButton>
			<DsLinkButton href="/design-system#coverage" variant="outline" intent="secondary">
				Coverage
			</DsLinkButton>
		</div>
	</div>
</div>
