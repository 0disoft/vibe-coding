<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import { DsIconButton, DsSheet } from "$lib/components/design-system";

	interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
		title?: string;
		description?: string;

		sidebarTitle?: string;
		sidebar?: Snippet;
		actions?: Snippet;
		children?: Snippet;

		openSidebarLabel?: string;
	}

	let {
		title,
		description,
		sidebarTitle = "Menu",
		sidebar,
		actions,
		openSidebarLabel = "Open sidebar",
		class: className = "",
		children,
		...rest
	}: Props = $props();

	let sidebarOpen = $state(false);
</script>

<div
	{...rest}
	class={["ds-app-shell", className].filter(Boolean).join(" ")}
>
	{#if sidebar}
		<div class="ds-app-shell-sidebar hidden lg:block">
			{@render sidebar()}
		</div>
	{/if}

	<section class="ds-app-shell-main min-w-0">
		<header class="ds-app-shell-header">
			<div class="flex items-start justify-between gap-3">
				<div class="min-w-0">
					<div class="flex items-center gap-2">
						{#if sidebar}
							<DsIconButton
								class="lg:hidden"
								icon="panel-left"
								label={openSidebarLabel}
								variant="outline"
								intent="secondary"
								onclick={() => (sidebarOpen = true)}
							/>
						{/if}
						{#if title}
							<h1 class="text-h2 font-semibold truncate">{title}</h1>
						{/if}
					</div>
					{#if description}
						<p class="text-body-secondary text-muted-foreground mt-1">
							{description}
						</p>
					{/if}
				</div>

				{#if actions}
					<div class="shrink-0">
						{@render actions()}
					</div>
				{/if}
			</div>
		</header>

		<div class="ds-app-shell-content">
			{#if children}
				{@render children()}
			{/if}
		</div>
	</section>
</div>

{#if sidebar}
	<DsSheet
		id="ds-app-shell-sidebar"
		title={sidebarTitle}
		open={sidebarOpen}
		onOpenChange={(next) => (sidebarOpen = next)}
		side="left"
		size="sm"
		closeOnOutsideClick
		closeOnEscape
		class="lg:hidden"
	>
		{@render sidebar()}
	</DsSheet>
{/if}

