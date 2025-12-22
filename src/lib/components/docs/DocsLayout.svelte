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
		sidebar?: Snippet<[{ close: () => void; onNavigate?: () => void }]>;
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
	const sidebarVisibilityStorageKey = "docs.sidebar.visible";
	const tocVisibilityStorageKey = "docs.toc.visible";

	/* State for Sheet (Mobile) */
	let isSheetSidebarOpen = $state(false);
	let isSheetTocOpen = $state(false);
	let lastFocus: HTMLElement | null = null;
	let hasLoadedVisibility = $state(false);

	/* State for Column Visibility (Desktop) */
	let isDesktopSidebarVisible = $state(true);
	let isDesktopTocVisible = $state(true);
	let isDesktop = $state(false);

	/* Scroll Spy: Active ToC Section */
	let activeTocId = $state<string | undefined>(undefined);

	let rootClass = $derived.by(() => {
		return [
			"grid gap-4 lg:gap-6",
			embedded
				? ""
				: "lg:grid-cols-[var(--col-nav)_minmax(0,1fr)_var(--col-toc)]",
			className,
		]
			.filter(Boolean)
			.join(" ");
	});

	let rootStyle = $derived.by(() => {
		if (embedded) return "";
		return `
				--col-nav: ${isDesktopSidebarVisible ? "240px" : "48px"};
				--col-toc: ${isDesktopTocVisible ? "200px" : "48px"};
				transition: grid-template-columns 0.3s ease;
			`;
	});

	let desktopOnlyClass = $derived(embedded ? "hidden" : "hidden lg:block");
	let mobileOnlyClass = $derived(embedded ? "" : "lg:hidden");

	function rememberFocus() {
		if (typeof document === "undefined") return;
		lastFocus = document.activeElement as HTMLElement | null;
	}

	function restoreFocus() {
		if (!lastFocus || typeof document === "undefined") return;
		if (!document.contains(lastFocus)) return;

		requestAnimationFrame(() => {
			lastFocus?.focus();
		});
	}

	function readStoredVisibility(key: string, fallback: boolean) {
		if (typeof window === "undefined") return fallback;
		try {
			const value = window.localStorage.getItem(key);
			if (value === null) return fallback;
			return value === "true" || value === "1";
		} catch {
			return fallback;
		}
	}

	function storeVisibility(key: string, value: boolean) {
		if (typeof window === "undefined") return;
		try {
			window.localStorage.setItem(key, value ? "true" : "false");
		} catch {
			// no-op
		}
	}

	// Desktop Toggle Handlers
	function toggleSidebar() {
		if (window.matchMedia("(min-width: 1024px)").matches) {
			isDesktopSidebarVisible = !isDesktopSidebarVisible;
			storeVisibility(sidebarVisibilityStorageKey, isDesktopSidebarVisible);
		} else {
			rememberFocus();
			isSheetSidebarOpen = true;
		}
	}

	function toggleToc() {
		if (window.matchMedia("(min-width: 1024px)").matches) {
			isDesktopTocVisible = !isDesktopTocVisible;
			storeVisibility(tocVisibilityStorageKey, isDesktopTocVisible);
		} else {
			rememberFocus();
			isSheetTocOpen = true;
		}
	}

	function handleSidebarSheetChange(next: boolean) {
		isSheetSidebarOpen = next;
		if (!next) restoreFocus();
	}

	function handleTocSheetChange(next: boolean) {
		isSheetTocOpen = next;
		if (!next) restoreFocus();
	}

	$effect(() => {
		if (embedded || typeof window === "undefined") return;
		if (hasLoadedVisibility) return;

		hasLoadedVisibility = true;
		isDesktopSidebarVisible = readStoredVisibility(
			sidebarVisibilityStorageKey,
			true,
		);
		isDesktopTocVisible = readStoredVisibility(
			tocVisibilityStorageKey,
			true,
		);
	});

	$effect(() => {
		if (embedded || typeof window === "undefined") return;
		const mq = window.matchMedia("(min-width: 1024px)");

		function handleChange(next: boolean) {
			isDesktop = next;
			if (next) {
				// Desktop mode: Close sheets
				isSheetSidebarOpen = false;
				isSheetTocOpen = false;
			}
		}

		handleChange(mq.matches);

		const onChange = (e: MediaQueryListEvent) => handleChange(e.matches);
		mq.addEventListener("change", onChange);

		return () => {
			mq.removeEventListener("change", onChange);
		};
	});

	// Scroll Spy Effect
	$effect(() => {
		if (typeof window === "undefined" || tocItems.length === 0) return;

		const ids = tocItems.map((item) => item.id);
		const visibleSections = new Map<string, number>();

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					const id = entry.target.id;
					if (entry.isIntersecting) {
						visibleSections.set(id, entry.intersectionRatio);
					} else {
						visibleSections.delete(id);
					}
				});

				// Find the topmost visible section
				if (visibleSections.size > 0) {
					// Get all visible IDs and find the one that appears first in the original order
					const visibleIds = [...visibleSections.keys()];
					for (const id of ids) {
						if (visibleIds.includes(id)) {
							activeTocId = id;
							break;
						}
					}
				}
			},
			{
				rootMargin: "-72px 0px -65% 0px",
				threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
			},
		);

		ids.forEach((id) => {
			const el = document.getElementById(id);
			if (el) observer.observe(el);
		});

		return () => observer.disconnect();
	});
</script>

<div
	{...rest}
	class={["relative", className].filter(Boolean).join(" ")}
	id={rootId}
>
	<!-- Fixed Left Sidebar -->
	{#if !embedded}
		<aside
			class={[
				desktopOnlyClass,
				"fixed top-16 z-40",
				"h-[calc(100vh-8rem)]",
			].join(" ")}
			style={`width: ${isDesktopSidebarVisible ? "240px" : "48px"}; transition: width 0.3s ease; inset-inline-start: 1rem;`}
			aria-hidden={!isDesktopSidebarVisible}
		>
			<!-- Collapsed State: Open Button -->
			<div
				class={[
					"absolute inset-0 flex justify-center py-2 transition-opacity duration-300",
					isDesktopSidebarVisible
						? "pointer-events-none opacity-0"
						: "opacity-100",
				].join(" ")}
				aria-hidden={isDesktopSidebarVisible}
			>
				<DsButton
					size="sm"
					variant="ghost"
					intent="secondary"
					onclick={toggleSidebar}
					title="Show Sidebar"
					aria-label="Show Sidebar"
				>
					<span class="i-lucide-panel-left-open h-4 w-4" aria-hidden="true"
					></span>
				</DsButton>
			</div>

			<!-- Expanded State: Content -->
			<div
				class={[
					"h-full transition-opacity duration-300",
					isDesktopSidebarVisible
						? "opacity-100 delay-150"
						: "pointer-events-none opacity-0 overflow-hidden",
				].join(" ")}
			>
				{#if sidebar}
					{@render sidebar({ close: toggleSidebar })}
				{/if}
			</div>
		</aside>
	{/if}

	<!-- Main Content -->
	<section
		class="min-w-0 pt-1 lg:pt-2"
		style={embedded || !isDesktop
			? ""
			: `margin-inline-start: ${isDesktopSidebarVisible ? "264px" : "72px"}; margin-inline-end: ${isDesktopTocVisible ? "224px" : "72px"}; transition: margin 0.3s ease;`}
	>
		<header class="space-y-2 lg:space-y-3">
			<div class="flex flex-wrap items-center justify-between gap-2">
				<h1 class="text-2xl lg:text-h1 font-semibold">{title}</h1>
				<!-- Toggle Buttons (Visible on Mobile ONLY) -->
				<div class={mobileOnlyClass}>
					<div class="flex items-center gap-1.5">
						{#if sidebar}
							<DsButton
								size="sm"
								variant="outline"
								intent="secondary"
								onclick={toggleSidebar}
								title="Show Sidebar"
							>
								<span
									class="i-lucide-panel-left-open h-4 w-4"
									aria-hidden="true"
								></span>
								<span class="sr-only">{m.docs_menu_button()}</span>
							</DsButton>
						{/if}
						{#if tocItems.length > 0}
							<DsButton
								size="sm"
								variant="outline"
								intent="secondary"
								onclick={toggleToc}
								title="Show ToC"
							>
								<span
									class="i-lucide-panel-right-open h-4 w-4"
									aria-hidden="true"
								></span>
								<span class="sr-only">{m.docs_on_this_page()}</span>
							</DsButton>
						{/if}
					</div>
				</div>
			</div>
			{#if description}
				<p class="text-xs lg:text-body-secondary text-muted-foreground">
					{description}
				</p>
			{/if}
		</header>

		<div class="mt-4 lg:mt-6 min-w-0">
			{#if children}
				{@render children()}
			{/if}
		</div>
	</section>

	<!-- Fixed Right Sidebar (ToC) -->
	{#if !embedded}
		<aside
			class={[
				desktopOnlyClass,
				"fixed top-16 z-40",
				"h-[calc(100vh-8rem)]",
			].join(" ")}
			style={`width: ${isDesktopTocVisible ? "200px" : "48px"}; transition: width 0.3s ease; inset-inline-end: 1rem;`}
			aria-hidden={!isDesktopTocVisible}
		>
			<!-- Collapsed State: Open Button -->
			<div
				class={[
					"absolute inset-0 flex justify-center py-2 transition-opacity duration-300",
					isDesktopTocVisible ? "pointer-events-none opacity-0" : "opacity-100",
				].join(" ")}
				aria-hidden={isDesktopTocVisible}
			>
				<DsButton
					size="sm"
					variant="ghost"
					intent="secondary"
					onclick={toggleToc}
					title="Show ToC"
					aria-label="Show ToC"
				>
					<span class="i-lucide-panel-right-open h-4 w-4" aria-hidden="true"
					></span>
				</DsButton>
			</div>

			<!-- Expanded State: Content -->
			<div
				class={[
					"h-full transition-opacity duration-300",
					isDesktopTocVisible
						? "opacity-100 delay-150"
						: "pointer-events-none opacity-0 overflow-hidden",
				].join(" ")}
			>
				{#if tocItems.length > 0}
					<DocsToc items={tocItems} activeId={activeTocId}>
						{#snippet actions()}
							<div class="flex items-center">
								<DsButton
									size="sm"
									variant="ghost"
									intent="secondary"
									onclick={toggleToc}
									title="Close ToC"
									aria-label="Close ToC"
								>
									<span
										class="i-lucide-panel-right-close h-4 w-4"
										aria-hidden="true"
									></span>
								</DsButton>
							</div>
						{/snippet}
					</DocsToc>
				{/if}
			</div>
		</aside>
	{/if}
</div>

{#if sidebar}
	<DsSheet
		id={sidebarId}
		title={m.docs_menu_title()}
		open={isSheetSidebarOpen}
		onOpenChange={handleSidebarSheetChange}
		side="left"
		size="sm"
		closeOnOutsideClick
		closeOnEscape
		class={mobileOnlyClass}
	>
		{@render sidebar({
			close: () => (isSheetSidebarOpen = false),
			onNavigate: () => (isSheetSidebarOpen = false),
		})}
	</DsSheet>
{/if}

{#if tocItems.length > 0}
	<DsSheet
		id={tocId}
		title={m.docs_on_this_page()}
		open={isSheetTocOpen}
		onOpenChange={handleTocSheetChange}
		side="right"
		size="sm"
		closeOnOutsideClick
		closeOnEscape
		class={mobileOnlyClass}
	>
		<DocsToc
			items={tocItems}
			class="border-0 bg-transparent p-0"
			onNavigate={() => (isSheetTocOpen = false)}
		/>
	</DsSheet>
{/if}
