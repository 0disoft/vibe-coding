<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import * as m from "$lib/paraglide/messages.js";

	import type { TocItem } from "./types";

	interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
		items: ReadonlyArray<TocItem>;
		activeId?: string;
		title?: string;
		actions?: Snippet;
	}

	let {
		items,
		activeId,
		title = m.docs_on_this_page(),
		actions,
		class: className = "",
		...rest
	}: Props = $props();

	function indent(level?: number) {
		if (!level || level <= 2) return "ps-0";
		if (level === 3) return "ps-4";
		return "ps-7";
	}

	function handleWheel(e: WheelEvent) {
		const target = e.currentTarget as HTMLElement;
		const { scrollTop, scrollHeight, clientHeight } = target;
		const atTop = scrollTop === 0 && e.deltaY < 0;
		const atBottom = scrollTop + clientHeight >= scrollHeight && e.deltaY > 0;

		if (!atTop && !atBottom) {
			e.stopPropagation();
		} else if (scrollHeight > clientHeight) {
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
	</div>
	<div
		class="flex-1 overflow-y-auto overscroll-y-contain thin-scrollbar p-4 pt-3"
		onwheel={handleWheel}
	>
		<ul class="grid gap-1">
			{#each items as item (item.id)}
				<li class={indent(item.level)}>
					<a
						href={`#${item.id}`}
						class={[
							"block rounded px-2 py-1 text-xs transition-colors",
							activeId === item.id
								? "!bg-primary/10 !text-primary !font-medium"
								: "text-muted-foreground hover:text-foreground hover:bg-surface-hover",
						].join(" ")}
						aria-current={activeId === item.id ? "location" : undefined}
					>
						{item.label}
					</a>
				</li>
			{/each}
		</ul>
	</div>
</nav>
