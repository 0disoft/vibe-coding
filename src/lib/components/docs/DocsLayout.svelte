<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import * as m from "$lib/paraglide/messages.js";

	import { DsButton, DsSheet } from "$lib/components/design-system";

	import DocsToc from "$lib/components/docs/DocsToc.svelte";

	import type { TocItem } from "./types";

	interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
		title: string;
		description?: string;
		sidebar?: Snippet;
		tocItems?: ReadonlyArray<TocItem>;
		/**
		 * 부모 레이아웃(예: /design-system 쇼케이스) 안에 "임베드"되는 경우,
		 * 뷰포트가 넓어도 좌/우 사이드바를 고정 컬럼으로 렌더하지 않고
		 * Menu / On this page 를 Sheet로 제공합니다.
		 */
		embedded?: boolean;
		children?: Snippet;
	}

	let {
		id: providedId,
		title,
		description,
		sidebar,
		tocItems = [],
		embedded = false,
		class: className = "",
		children,
		...rest
	}: Props = $props();

	const generatedId = $props.id();
	let rootId = $derived(providedId ?? generatedId);
	let sidebarId = $derived(`${rootId}-docs-sidebar`);
	let tocId = $derived(`${rootId}-docs-toc`);

	let sidebarOpen = $state(false);
	let tocOpen = $state(false);

	let rootClass = $derived(
		[
			"grid gap-6",
			embedded
				? ""
				: "lg:grid-cols-[220px_minmax(0,1fr)_220px] xl:grid-cols-[240px_minmax(0,1fr)_240px]",
			className,
		]
			.filter(Boolean)
			.join(" "),
	);

	let desktopOnlyClass = $derived(embedded ? "hidden" : "hidden lg:block");
	let mobileOnlyClass = $derived(embedded ? "" : "lg:hidden");

	$effect(() => {
		if (embedded || typeof window === "undefined") return;
		const mq = window.matchMedia("(min-width: 1024px)");

		function handleChange(next: boolean) {
			if (next) {
				sidebarOpen = false;
				tocOpen = false;
			}
		}

		handleChange(mq.matches);

		const onChange = (e: MediaQueryListEvent) => handleChange(e.matches);
		mq.addEventListener("change", onChange);

		return () => {
			mq.removeEventListener("change", onChange);
		};
	});
</script>

<div {...rest} class={rootClass} id={rootId}>
	<aside class={desktopOnlyClass}>
		{#if sidebar}
			{@render sidebar()}
		{/if}
	</aside>

	<section class="min-w-0">
		<header class="space-y-3">
			<div class="flex flex-wrap items-center justify-between gap-2">
				<h1 class="text-h1 font-semibold">{title}</h1>
				<div
					class={["flex items-center gap-2", mobileOnlyClass]
						.filter(Boolean)
						.join(" ")}
				>
					{#if sidebar}
						<DsButton
							size="sm"
							variant="outline"
							intent="secondary"
							onclick={() => (sidebarOpen = true)}
						>
							<span class="i-lucide-menu h-4 w-4" aria-hidden="true"></span>
							{m.docs_menu_button()}
						</DsButton>
					{/if}
					{#if tocItems.length > 0}
						<DsButton
							size="sm"
							variant="outline"
							intent="secondary"
							onclick={() => (tocOpen = true)}
						>
							<span class="i-lucide-list h-4 w-4" aria-hidden="true"></span>
							{m.docs_on_this_page()}
						</DsButton>
					{/if}
				</div>
			</div>
			{#if description}
				<p class="text-body-secondary text-muted-foreground">{description}</p>
			{/if}
		</header>

		<div class="mt-6 min-w-0">
			{#if children}
				{@render children()}
			{/if}
		</div>
	</section>

	<aside class={desktopOnlyClass}>
		{#if tocItems.length > 0}
			<DocsToc items={tocItems} />
		{/if}
	</aside>
</div>

{#if sidebar}
	<DsSheet
		id={sidebarId}
		title={m.docs_menu_title()}
		open={sidebarOpen}
		onOpenChange={(next) => (sidebarOpen = next)}
		side="left"
		size="sm"
		closeOnOutsideClick
		closeOnEscape
		class={mobileOnlyClass}
	>
		{@render sidebar()}
	</DsSheet>
{/if}

{#if tocItems.length > 0}
	<DsSheet
		id={tocId}
		title={m.docs_on_this_page()}
		open={tocOpen}
		onOpenChange={(next) => (tocOpen = next)}
		side="right"
		size="sm"
		closeOnOutsideClick
		closeOnEscape
		class={mobileOnlyClass}
	>
		<DocsToc items={tocItems} class="border-0 bg-transparent p-0" />
	</DsSheet>
{/if}
