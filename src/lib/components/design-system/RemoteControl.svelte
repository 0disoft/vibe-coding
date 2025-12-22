<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import DsRemoteItem, {
		type RemoteItemConfig,
		type RemoteItemSize,
		type TooltipPlacement,
	} from "./RemoteItem.svelte";
	import DsRemoteSeparator from "./RemoteSeparator.svelte";

	export type RemoteControlPlacement = "right" | "left" | "bottom";
	export type RemoteControlAlign = "start" | "center" | "end";

	type RemoteSeparatorEntry = {
		kind: "separator";
		id?: string;
	};

	export type RemoteControlEntry = RemoteItemConfig | RemoteSeparatorEntry;

	interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
		items?: ReadonlyArray<RemoteControlEntry>;
		placement?: RemoteControlPlacement;
		align?: RemoteControlAlign;
		floating?: boolean;
		responsive?: boolean;
		size?: RemoteItemSize;
		showLabels?: boolean;
		showTooltips?: boolean;
		label?: string;
		tag?: string;
		children?: Snippet;
		onItemSelect?: (id: string, item: RemoteItemConfig) => void;
	}

	let {
		"aria-label": ariaLabel,
		"aria-labelledby": ariaLabelledby,
		items = [],
		placement = "right",
		align = "center",
		floating = true,
		responsive = true,
		size = "md",
		showLabels = false,
		showTooltips = true,
		label = "Quick actions",
		tag = "div",
		class: className = "",
		children,
		role,
		onItemSelect,
		...rest
	}: Props = $props();

	let rootClass = $derived(
		["ds-remote-control", floating ? "is-floating" : "", className]
			.filter(Boolean)
			.join(" "),
	);

	let computedRole = $derived(role ?? "toolbar");
	let computedLabel = $derived(
		ariaLabelledby ? undefined : ariaLabel ?? label,
	);
	function getTooltipPlacement(next: RemoteControlPlacement): TooltipPlacement {
		if (next === "left") return "right";
		if (next === "bottom") return "top";
		return "left";
	}

let tooltipPlacement = $derived(getTooltipPlacement(placement));
let isNarrow = $state(false);
let separatorOrientation = $derived<"horizontal" | "vertical">(
	placement === "bottom" || (responsive && isNarrow) ? "vertical" : "horizontal",
);

	function handleSelect(item: RemoteItemConfig) {
		item.onSelect?.();
		onItemSelect?.(item.id, item);
	}

	function isSeparator(entry: RemoteControlEntry): entry is RemoteSeparatorEntry {
		return "kind" in entry && entry.kind === "separator";
	}

	function entryKey(entry: RemoteControlEntry, index: number) {
		if (isSeparator(entry)) return entry.id ?? index;
		return entry.id;
	}

$effect(() => {
	if (typeof window === "undefined") return;
	const mql = window.matchMedia("(max-width: 768px)");
	const update = () => {
		isNarrow = mql.matches;
	};
	update();
	mql.addEventListener("change", update);
	return () => {
		mql.removeEventListener("change", update);
	};
});

	type RovingConfig = {
		placement: RemoteControlPlacement;
		responsive: boolean;
	};

	function rovingToolbar(node: HTMLElement, config: RovingConfig) {
		let current = config;
		let focusables: HTMLElement[] = [];
		let mql: MediaQueryList | null = null;
		let observer: MutationObserver | null = null;

		function getOrientation() {
			const isResponsiveBottom =
				current.responsive &&
				typeof window !== "undefined" &&
				mql?.matches;
			if (current.placement === "bottom" || isResponsiveBottom) return "horizontal";
			return "vertical";
		}

		function isFocusable(el: HTMLElement) {
			if (el.matches("button")) {
				const btn = el as HTMLButtonElement;
				if (btn.disabled) return false;
			}
			if (el.getAttribute("aria-disabled") === "true") return false;
			return true;
		}

		function collectFocusables() {
			const elements = Array.from(
				node.querySelectorAll<HTMLElement>("a.ds-remote-item, button.ds-remote-item"),
			);
			focusables = elements.filter(isFocusable);
		}

		function setTabIndex(nextIndex: number) {
			focusables.forEach((el, idx) => {
				el.tabIndex = idx === nextIndex ? 0 : -1;
			});
		}

		function findInitialIndex() {
			const activeIndex = focusables.findIndex((el) =>
				el.classList.contains("is-active"),
			);
			if (activeIndex >= 0) return activeIndex;
			return 0;
		}

		function syncTabIndex() {
			if (!focusables.length) return;
			const currentIndex = focusables.findIndex(
				(el) => el === document.activeElement,
			);
			if (currentIndex >= 0) {
				setTabIndex(currentIndex);
				return;
			}
			setTabIndex(findInitialIndex());
		}

		function applyOrientation() {
			const orientation = getOrientation();
			node.setAttribute("aria-orientation", orientation);
		}

		function refresh() {
			collectFocusables();
			applyOrientation();
			syncTabIndex();
		}

		function moveFocus(delta: number) {
			if (!focusables.length) return;
			const currentIndex = focusables.findIndex(
				(el) => el === document.activeElement,
			);
			const baseIndex = currentIndex >= 0 ? currentIndex : findInitialIndex();
			let nextIndex = baseIndex + delta;
			if (nextIndex < 0) nextIndex = focusables.length - 1;
			if (nextIndex >= focusables.length) nextIndex = 0;
			setTabIndex(nextIndex);
			focusables[nextIndex]?.focus();
		}

		function onKeyDown(e: KeyboardEvent) {
			const target = e.target as HTMLElement | null;
			if (!target) return;
			if (!target.closest(".ds-remote-item")) return;
			const orientation = getOrientation();
			if (e.key === "Home") {
				e.preventDefault();
				setTabIndex(0);
				focusables[0]?.focus();
				return;
			}
			if (e.key === "End") {
				e.preventDefault();
				setTabIndex(focusables.length - 1);
				focusables[focusables.length - 1]?.focus();
				return;
			}
			if (orientation === "vertical" && e.key === "ArrowUp") {
				e.preventDefault();
				moveFocus(-1);
				return;
			}
			if (orientation === "vertical" && e.key === "ArrowDown") {
				e.preventDefault();
				moveFocus(1);
				return;
			}
			if (orientation === "horizontal" && e.key === "ArrowLeft") {
				e.preventDefault();
				moveFocus(-1);
				return;
			}
			if (orientation === "horizontal" && e.key === "ArrowRight") {
				e.preventDefault();
				moveFocus(1);
			}
		}

		function onFocusIn(e: FocusEvent) {
			const target = e.target as HTMLElement | null;
			if (!target) return;
			if (!target.closest(".ds-remote-item")) return;
			const index = focusables.findIndex((el) => el === target);
			if (index >= 0) setTabIndex(index);
		}

		function onMediaChange() {
			refresh();
		}

	if (typeof window !== "undefined") {
		mql = window.matchMedia("(max-width: 768px)");
		mql.addEventListener("change", onMediaChange);
	}

		node.addEventListener("keydown", onKeyDown);
		node.addEventListener("focusin", onFocusIn);

		if (typeof MutationObserver !== "undefined") {
			observer = new MutationObserver(() => refresh());
			observer.observe(node, { childList: true, subtree: true });
		}

		refresh();

		return {
			update(next: RovingConfig) {
				current = next;
				refresh();
			},
			destroy() {
				node.removeEventListener("keydown", onKeyDown);
				node.removeEventListener("focusin", onFocusIn);
				observer?.disconnect();
			if (mql) {
				mql.removeEventListener("change", onMediaChange);
			}
		},
	};
}
</script>

<svelte:element
	this={tag}
	{...rest}
	class={rootClass}
	role={computedRole}
	aria-label={computedLabel}
	aria-labelledby={ariaLabelledby}
	data-ds-placement={placement}
	data-ds-align={align}
	data-ds-size={size}
	data-ds-responsive={responsive ? "true" : undefined}
	use:rovingToolbar={{ placement, responsive }}
>
	{#if items.length}
		{#each items as entry, index (entryKey(entry, index))}
			{#if isSeparator(entry)}
				<DsRemoteSeparator orientation={separatorOrientation} />
			{:else}
				{@const itemLabel = entry.showLabel ?? showLabels}
				{@const itemTooltip = showTooltips ? entry.tooltip : false}
				{@const itemPlacement = entry.tooltipPlacement ?? tooltipPlacement}
				<DsRemoteItem
					label={entry.label}
					icon={entry.icon}
					href={entry.href}
					target={entry.target}
					rel={entry.rel}
					active={entry.active}
					disabled={entry.disabled}
					variant={entry.variant}
					size={entry.size ?? size}
					showLabel={itemLabel}
					tooltip={itemTooltip}
					tooltipPlacement={itemPlacement}
					onSelect={() => handleSelect(entry)}
				/>
			{/if}
		{/each}
	{:else if children}
		{@render children()}
	{/if}
</svelte:element>
