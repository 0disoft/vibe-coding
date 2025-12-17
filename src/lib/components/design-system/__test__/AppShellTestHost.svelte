<script lang="ts">
	import { DsAppShell, DsSidebar, DsLinkButton } from "$lib/components/design-system";

	let openCount = $state(0);
</script>

<DsAppShell title="Dashboard" description="App shell demo" sidebarTitle="Nav">
	{#snippet sidebar()}
		<DsSidebar title="Navigation">
			{#snippet children()}
				<nav aria-label="Sidebar nav" class="grid gap-1">
					<DsLinkButton href="/app" variant="link" intent="secondary" class="justify-start">
						Home
					</DsLinkButton>
				</nav>
			{/snippet}
		</DsSidebar>
	{/snippet}

	{#snippet actions()}
		<button type="button" onclick={() => (openCount += 1)}>Action</button>
	{/snippet}

	{#snippet children()}
		<div>Content</div>
	{/snippet}
</DsAppShell>

