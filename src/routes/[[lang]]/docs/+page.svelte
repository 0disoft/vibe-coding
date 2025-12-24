<script lang="ts">
	import {
		DsContentCard,
		DsKpi,
		DsPageHeader,
	} from "$lib/components/design-system";

	const featuredDocs = [
		{
			title: "Introduction",
			href: "/docs/intro",
			excerpt:
				"Learn about the core philosophy and architecture of Vibe Coding.",
			category: "General",
			readingMinutes: 5,
		},
		{
			title: "Quick Start",
			href: "/docs/installation",
			excerpt: "Get up and running with Vibe Coding in less than 5 minutes.",
			category: "Guide",
			readingMinutes: 10,
		},
		{
			title: "Component Library",
			href: "/design-system",
			excerpt: "Explore the comprehensive design system and UI components.",
			category: "Reference",
			readingMinutes: 15,
		},
	];
</script>

<div class="space-y-8">
	<DsPageHeader
		title="Documentation"
		description="Everything you need to build amazing apps with Vibe Coding."
		breadcrumbs={[
			{ label: "Home", href: "/" },
			{ label: "Docs", href: "/docs" },
		]}
	/>

	<section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		<DsKpi label="Total Articles" value={142} helper="growing every week" />
		<DsKpi label="Contributors" value={24} helper="active this month" />
		<DsKpi
			label="Components"
			value={30}
			helper="production ready"
			trend="up"
			delta="+12%"
		/>
	</section>

	<section>
		<h2 class="text-h3 font-bold mb-6">Featured Guides</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each featuredDocs as doc}
				<DsContentCard
					title={doc.title}
					href={doc.href}
					excerpt={doc.excerpt}
					category={doc.category}
					readingMinutes={doc.readingMinutes}
				/>
			{/each}
		</div>
	</section>
</div>
