<script lang="ts">
	import { base } from "$app/paths";
	import { page } from "$app/state";
	import { pages, type PageEntry, type PageGroup } from "$lib/constants/pages";
	import * as m from "$lib/paraglide/messages";
	import { getLocaleFromUrl } from "$lib/shared/utils/locale";

	const { data } = $props();
	const currentLocale = $derived(getLocaleFromUrl(page.url));

	// Group pages by their group property
	const groupedPages = $derived.by(() => {
		const groups: Record<PageGroup, PageEntry[]> = {
			marketing: [],
			product: [],
			auth: [],
			legal: [],
			docs: [],
			support: [],
			app: [],
			community: [],
			misc: [],
		};

		pages.forEach((p) => {
			if (groups[p.group]) {
				groups[p.group].push(p);
			}
		});

		// Remove empty groups and sort by group order if needed
		return Object.entries(groups).filter(([_, items]) => items.length > 0) as [
			PageGroup,
			PageEntry[],
		][];
	});

	const getGroupLabel = (group: PageGroup) => {
		const labels: Record<PageGroup, string> = {
			marketing: m.sitemap_group_marketing({ locale: currentLocale }),
			product: m.sitemap_group_product({ locale: currentLocale }),
			auth: m.sitemap_group_auth({ locale: currentLocale }),
			legal: m.sitemap_group_legal({ locale: currentLocale }),
			docs: m.sitemap_group_docs({ locale: currentLocale }),
			support: m.sitemap_group_support({ locale: currentLocale }),
			app: m.sitemap_group_app({ locale: currentLocale }),
			community: m.sitemap_group_community({ locale: currentLocale }),
			misc: m.sitemap_group_misc({ locale: currentLocale }),
		};
		return labels[group] || group;
	};

	const getLocalizedPath = (path: string) => {
		const lang = currentLocale === "en" ? "" : `/${currentLocale}`;
		// Prevent double slashes if path is '/'
		const normalizedPath = path === "/" ? "" : path;
		return `${base}${lang}${normalizedPath}`;
	};
</script>

<svelte:head>
	<title>{m.sitemap_title({ locale: currentLocale })} | Vibe</title>
	<meta
		name="description"
		content={m.sitemap_description({ locale: currentLocale })}
	/>
</svelte:head>

<main class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
	<div class="mb-12 space-y-4">
		<h1 class="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
			{m.sitemap_title({ locale: currentLocale })}
		</h1>
		<p class="text-xl text-muted-foreground">
			{m.sitemap_description({ locale: currentLocale })}
		</p>
	</div>

	<div class="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
		{#each groupedPages as [group, items]}
			<section class="space-y-6">
				<div class="flex items-center gap-3">
					<div class="h-1 w-8 rounded-full bg-primary/40"></div>
					<h2 class="text-2xl font-bold tracking-tight text-foreground">
						{getGroupLabel(group)}
					</h2>
				</div>
				<ul
					class="space-y-3 border-l-2 border-border/40 pl-6 dark:border-border/20 rtl:border-l-0 rtl:border-r-2 rtl:pl-0 rtl:pr-6"
				>
					{#each items as item}
						<li>
							<a
								href={getLocalizedPath(item.path)}
								class="group flex flex-col transition-colors hover:text-primary"
							>
								<span
									class="text-lg font-medium leading-tight underline-offset-4 group-hover:underline"
								>
									{item.title}
								</span>
								{#if item.description}
									<span class="text-sm text-muted-foreground">
										{item.description}
									</span>
								{/if}
							</a>
						</li>
					{/each}
				</ul>
			</section>
		{/each}
	</div>
</main>

<style>
	/* Additional RTL support if needed */
	:global([dir="rtl"]) .rtl\:border-r-2 {
		border-right-width: 2px;
	}
	:global([dir="rtl"]) .rtl\:pr-6 {
		padding-right: 1.5rem;
	}
</style>
