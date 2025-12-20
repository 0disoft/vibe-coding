<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import {
		DsIconButton,
		DsSheet,
		DsSkipLink,
	} from "$lib/components/design-system";

	interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
		title?: string;
		description?: string;

		sidebarTitle?: string;
		sidebar?: Snippet;
		actions?: Snippet;
		children?: Snippet;

		openSidebarLabel?: string;
		mainId?: string;
		skipLinkLabel?: string;
		sidebarOpen?: boolean;
	}

	let {
		title,
		description,
		sidebarTitle = "Menu",
		sidebar,
		actions,
		openSidebarLabel = "Open sidebar",
		mainId = "main-content",
		skipLinkLabel,
		sidebarOpen = $bindable(false),
		class: className = "",
		children,
		...rest
	}: Props = $props();

	$effect(() => {
		if (typeof window === "undefined" || !sidebar) return;
		const mq = window.matchMedia("(min-width: 1024px)");

		function handleChange(next: boolean) {
			if (next && sidebarOpen) sidebarOpen = false;
		}

		handleChange(mq.matches);

		const onChange = (e: MediaQueryListEvent) => handleChange(e.matches);
		mq.addEventListener("change", onChange);

		return () => {
			mq.removeEventListener("change", onChange);
		};
	});
</script>

<DsSkipLink href={`#${mainId}`} label={skipLinkLabel} />

<div {...rest} class={["ds-app-shell", className].filter(Boolean).join(" ")}>
	{#if sidebar}
		<aside class="ds-app-shell-sidebar hidden lg:block">
			{@render sidebar()}
		</aside>
	{/if}

	<main id={mainId} class="ds-app-shell-main min-w-0" tabindex="-1">
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
								aria-expanded={sidebarOpen}
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
	</main>
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
		{#if sidebarOpen}
			{@render sidebar()}
		{/if}
	</DsSheet>
{/if}
