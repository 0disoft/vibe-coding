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
	}

	let {
		title = m.nav_docs(),
		items,
		activePath,
		actions,
		class: className = "",
		...rest
	}: Props = $props();

	function isActive(href: string) {
		if (!activePath) return false;
		return activePath === href;
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
</script>

<nav
	{...rest}
	class={[
		"rounded-lg border border-border bg-surface flex flex-col h-full overflow-hidden",
		className,
	]
		.filter(Boolean)
		.join(" ")}
	aria-label={title}
>
	<div class="p-4 pb-0 shrink-0">
		<div class="flex items-center justify-between gap-2">
			<div class="text-menu-sm font-semibold text-foreground">{title}</div>
			{#if actions}
				{@render actions()}
			{/if}
		</div>
		<DsSeparator class="mt-3" />
	</div>

	<div
		class="flex-1 overflow-y-auto overscroll-y-contain thin-scrollbar p-4 pt-3"
		onwheel={handleWheel}
	>
		<ul class="grid gap-0">
			{#each items as item (item.href)}
				<li>
					<DsLinkButton
						href={item.href}
						variant="ghost"
						intent="secondary"
						class={[
							"w-full !justify-start rounded-md px-2 py-0.5 text-[11px] !min-h-0",
							isActive(item.href)
								? "!bg-primary/10 !text-primary !font-medium"
								: "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
						].join(" ")}
						aria-current={isActive(item.href) ? "page" : undefined}
					>
						{item.label}
					</DsLinkButton>
					{#if item.items?.length}
						<ul class="mt-1 grid gap-0 ps-4">
							{#each item.items as sub (sub.href)}
								<li>
									<DsLinkButton
										href={sub.href}
										variant="ghost"
										intent="secondary"
										class={[
											"w-full !justify-start rounded-md px-2 py-0.5 text-[11px] !min-h-0",
											isActive(sub.href)
												? "!bg-primary/10 !text-primary !font-medium"
												: "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
										].join(" ")}
										aria-current={isActive(sub.href) ? "page" : undefined}
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
