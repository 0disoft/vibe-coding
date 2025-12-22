<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import * as m from "$lib/paraglide/messages.js";

	import { DsLinkButton, DsSeparator } from "$lib/components/design-system";

	type DocsNavItem = {
		href: string;
		label: string;
		items?: ReadonlyArray<DocsNavItem>;
	};

	interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
		title?: string;
		items: ReadonlyArray<DocsNavItem>;
		/** 활성 경로(예: page.url.pathname). 미지정 시 href 매칭 비활성 */
		activePath?: string;
		actions?: Snippet;
		onNavigate?: () => void;
	}

	const generatedId = $props.id();

	let {
		id: idProp,
		title = m.nav_docs(),
		items,
		activePath,
		actions,
		onNavigate,
		class: className = "",
		...rest
	}: Props = $props();

	let rootId = $derived(idProp ?? generatedId);
	let navRef: HTMLElement | null = null;

	const baseLinkClass =
		"w-full !justify-start rounded-md px-2 py-0 leading-tight text-[0.72rem] !min-h-0";
	const activeLinkClass = "!bg-primary/10 !text-primary !font-medium";
	const inactiveLinkClass =
		"text-muted-foreground hover:bg-surface-hover hover:text-foreground";

	function slugify(value: string) {
		return value
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/(^-|-$)/g, "");
	}

	function getItemId(href: string, index: number) {
		const safe = slugify(href || "item");
		return `${rootId}-nav-${safe}-${index}`;
	}

	function isActive(href: string) {
		if (!activePath) return false;
		return activePath === href;
	}

	function handleNavigate(event?: MouseEvent) {
		if (!onNavigate) return;
		if (
			event &&
			(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
		)
			return;
		if (event && event.button !== 0) return;
		onNavigate();
	}

	function handleWheel(e: WheelEvent) {
		const target = e.currentTarget as HTMLElement;
		const { scrollTop, scrollHeight, clientHeight } = target;
		const atTop = scrollTop === 0 && e.deltaY < 0;
		const atBottom = scrollTop + clientHeight >= scrollHeight && e.deltaY > 0;

		// Allow scroll if there's room to scroll, prevent propagation
		if (!atTop && !atBottom) {
			e.stopPropagation();
		} else if (scrollHeight > clientHeight) {
			// At boundary but has scrollable content - still stop propagation
			e.stopPropagation();
		}
	}

	$effect(() => {
		if (!activePath) return;
		if (typeof window === "undefined") return;
		if (!navRef) return;

		const escaped =
			typeof CSS !== "undefined" && CSS.escape
				? CSS.escape(activePath)
				: activePath.replace(/["\\]/g, "\\$&");
		const target = navRef.querySelector<HTMLAnchorElement>(
			`a[href="${escaped}"]`,
		);
		if (!target) return;

		const prefersReducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;

		target.scrollIntoView({
			block: "nearest",
			behavior: prefersReducedMotion ? "auto" : "smooth",
		});
	});
</script>

<nav
	{...rest}
	bind:this={navRef}
	class={[
		"rounded-lg border border-border bg-surface flex flex-col h-full overflow-hidden",
		className,
	]
		.filter(Boolean)
		.join(" ")}
	aria-label={title}
>
	<div class="p-3 pb-0 shrink-0">
		<div class="flex items-center justify-between gap-2">
			<div class="text-menu-sm font-semibold text-foreground">{title}</div>
			{#if actions}
				{@render actions()}
			{/if}
		</div>
		<DsSeparator class="mt-3" />
	</div>

	<div
		class="mt-1 mb-2 flex-1 overflow-y-auto overscroll-y-contain thin-scrollbar p-3 pt-2"
		onwheel={handleWheel}
	>
		<ul class="grid gap-0">
			{#each items as item, itemIndex (item.href)}
				{@const isItemActive = isActive(item.href)}
				{@const itemId = getItemId(item.href, itemIndex)}
				<li>
					<DsLinkButton
						id={itemId}
						href={item.href}
						variant="ghost"
						intent="secondary"
						class={[
							baseLinkClass,
							isItemActive ? activeLinkClass : inactiveLinkClass,
						].join(" ")}
						aria-current={isItemActive ? "page" : undefined}
						onclick={handleNavigate}
					>
						{item.label}
					</DsLinkButton>
					{#if item.items?.length}
						<ul class="mt-0.5 grid gap-0.5 ps-3" aria-labelledby={itemId}>
							{#each item.items as sub, subIndex (sub.href)}
								{@const isSubActive = isActive(sub.href)}
								{@const subId = getItemId(sub.href, subIndex)}
								<li>
									<DsLinkButton
										id={subId}
										href={sub.href}
										variant="ghost"
										intent="secondary"
										class={[
											baseLinkClass,
											isSubActive ? activeLinkClass : inactiveLinkClass,
										].join(" ")}
										aria-current={isSubActive ? "page" : undefined}
										onclick={handleNavigate}
									>
										{sub.label}
									</DsLinkButton>
								</li>
							{/each}
						</ul>
					{/if}
				</li>
			{/each}
		</ul>
	</div>
</nav>
