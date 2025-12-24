<script lang="ts">
	import { DsAppShell, DsTreeView } from "$lib/components/design-system";

	let { children } = $props();

	// Mock Navigation Data
	const docNodes = [
		{
			id: "getting-started",
			label: "Getting Started",
			children: [
				{ id: "intro", label: "Introduction", href: "/docs/intro" },
				{
					id: "installation",
					label: "Installation",
					href: "/docs/installation",
				},
			],
		},
		{
			id: "guides",
			label: "Guides",
			expanded: true,
			children: [
				{ id: "concepts", label: "Core Concepts", href: "/docs/concepts" },
				{ id: "tutorials", label: "Tutorials", href: "/docs/tutorials" },
			],
		},
		{
			id: "api",
			label: "API Reference",
			children: [
				{ id: "endpoints", label: "Endpoints", href: "/docs/api/endpoints" },
				{ id: "models", label: "Models", href: "/docs/api/models" },
			],
		},
	];

	let sidebarOpen = $state(false);
	let selectedId = $state("intro");
	let expandedIds = $state(["getting-started", "guides"]);
</script>

<DsAppShell
	title="Vibe Docs"
	description="Documentation for Vibe Coding Platform"
	bind:sidebarOpen
	openSidebarLabel="Open Menu"
	skipLinkLabel="Skip to content"
>
	{#snippet sidebar()}
		<DsTreeView
			nodes={docNodes}
			{selectedId}
			onSelectedIdChange={(id) => (selectedId = id ?? "intro")}
			{expandedIds}
			onExpandedIdsChange={(ids) => (expandedIds = ids)}
			onSelectNode={(node) => {
				if (node.href) {
					// In real app, navigation would happen here or via href
				}
			}}
		/>
	{/snippet}

	<div class="px-4 py-8 md:px-8 max-w-7xl mx-auto w-full">
		{@render children()}
	</div>
</DsAppShell>
