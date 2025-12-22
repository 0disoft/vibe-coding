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
		onNavigate?: () => void;
	}

	let {
		items,
		activeId,
		title = m.docs_on_this_page(),
		actions,
		onNavigate,
		class: className = "",
		...rest
	}: Props = $props();

	const tocItemRefs = new Map<string, HTMLAnchorElement>();

	function trackItem(node: HTMLAnchorElement, id: string) {
		tocItemRefs.set(id, node);

		return {
			update(nextId: string) {
				if (id !== nextId) {
					tocItemRefs.delete(id);
					id = nextId;
					tocItemRefs.set(id, node);
				}
			},
			destroy() {
				tocItemRefs.delete(id);
			},
		};
	}

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

	function focusTarget(id: string) {
		if (typeof document === "undefined") return;

		const target = document.getElementById(id) as HTMLElement | null;
		if (!target) return;

		const hasTabIndex = target.hasAttribute("tabindex");

		if (!hasTabIndex) {
			target.setAttribute("tabindex", "-1");
			target.setAttribute("data-toc-temp-tabindex", "true");
		}

		const restoreTabIndex = () => {
			if (target.getAttribute("data-toc-temp-tabindex") === "true") {
				target.removeAttribute("tabindex");
				target.removeAttribute("data-toc-temp-tabindex");
			}
		};

		target.addEventListener("blur", restoreTabIndex, { once: true });

		requestAnimationFrame(() => {
			try {
				target.focus({ preventScroll: true });
			} catch {
				target.focus();
			}
		});
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

	$effect(() => {
		if (!activeId) return;
		if (typeof window === "undefined") return;

		const target = tocItemRefs.get(activeId);
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
		class="mt-1 mb-2 flex-1 overflow-y-auto overscroll-y-contain thin-scrollbar p-4 pt-3"
		onwheel={handleWheel}
	>
		<ul class="grid gap-1">
			{#each items as item (item.id)}
				{@const isActive = activeId === item.id}
				<li class={indent(item.level)}>
					<a
						href={`#${item.id}`}
						use:trackItem={item.id}
						onclick={(event) => {
							focusTarget(item.id);
							handleNavigate(event);
						}}
						class={[
							"block rounded px-2 py-1 text-xs transition-colors relative",
							isActive
								? "!bg-primary/10 !text-primary !font-medium"
								: "text-muted-foreground hover:text-foreground hover:bg-surface-hover",
						].join(" ")}
						aria-current={isActive ? "location" : undefined}
					>
						{item.label}
					</a>
				</li>
			{/each}
		</ul>
	</div>
</nav>
