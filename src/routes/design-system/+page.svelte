<script lang="ts">
	import { onMount } from "svelte";

	import { DsIconButton } from "$lib/components/design-system";
	import { DocsToc } from "$lib/components/docs";

	import AdvancedSection from "./_sections/AdvancedSection.svelte";
	import ButtonsSection from "./_sections/ButtonsSection.svelte";
	import CommerceSection from "./_sections/CommerceSection.svelte";
	import ContentSection from "./_sections/ContentSection.svelte";
	import CoverageSection from "./_sections/CoverageSection.svelte";
	import DataSection from "./_sections/DataSection.svelte";
	import DocsSection from "./_sections/DocsSection.svelte";
	import EditorSection from "./_sections/EditorSection.svelte";
	import FeedbackSection from "./_sections/FeedbackSection.svelte";
	import FormsSection from "./_sections/FormsSection.svelte";
	import NavigationSection from "./_sections/NavigationSection.svelte";
	import OverlaysSection from "./_sections/OverlaysSection.svelte";
	import PagesSection from "./_sections/PagesSection.svelte";
	import SeparatorSection from "./_sections/SeparatorSection.svelte";
	import ShowcaseHeader from "./_sections/ShowcaseHeader.svelte";
	import TokensSection from "./_sections/TokensSection.svelte";

	const tocItems = [
		{ id: "pages", label: "Pages", level: 2 },
		{ id: "tokens", label: "Tokens", level: 2 },
		{ id: "coverage", label: "Coverage", level: 2 },
		{ id: "ds-buttons", label: "Buttons", level: 2 },
		{ id: "ds-separator", label: "Separator", level: 2 },
		{ id: "ds-forms", label: "Forms", level: 2 },
		{ id: "ds-editor", label: "Editor", level: 2 },
		{ id: "ds-overlays", label: "Overlays", level: 2 },
		{ id: "ds-navigation", label: "Navigation", level: 2 },
		{ id: "ds-content", label: "Content", level: 2 },
		{ id: "ds-data", label: "Data", level: 2 },
		{ id: "ds-commerce", label: "Commerce", level: 2 },
		{ id: "ds-feedback", label: "Feedback", level: 2 },
		{ id: "ds-advanced", label: "Advanced", level: 2 },
		{ id: "docs", label: "Docs Components", level: 2 },
	] as const;

	type TocId = (typeof tocItems)[number]["id"];
	let activeSectionId = $state<TocId>(tocItems[0]?.id ?? "pages");
	let isTocVisible = $state(true);
	let isDesktop = $state(false);
	let setLabReady: (() => void) | null = null;

	onMount(() => {
		const ids = tocItems.map((i) => i.id) as TocId[];
		const idSet = new Set<TocId>(ids);

		function isTocId(value: string): value is TocId {
			return idSet.has(value as TocId);
		}

		function updateFromHash() {
			const hash = window.location.hash.replace(/^#/, "");
			if (hash && isTocId(hash)) activeSectionId = hash;
		}

		updateFromHash();
		window.addEventListener("hashchange", updateFromHash);

		setLabReady = () => {
			document.documentElement.dataset.dsLabReady = "1";
		};

		const targets = ids
			.map((id) => document.getElementById(id))
			.filter((el): el is HTMLElement => !!el);

		const io = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((e) => e.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

				const top = visible[0]?.target as HTMLElement | undefined;
				const id = top?.id;
				if (id && isTocId(id)) {
					activeSectionId = id;
					history.replaceState(null, "", `#${id}`);
				}
			},
			{
				root: null,
				rootMargin: "-20% 0px -70% 0px",
				threshold: [0, 0.1],
			},
		);

		for (const t of targets) io.observe(t);

		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				setLabReady?.();
			});
		});

		// Desktop detection
		const mq = window.matchMedia("(min-width: 1024px)");
		const handleMq = (e: MediaQueryListEvent | MediaQueryList) => {
			isDesktop = e.matches;
		};
		handleMq(mq);
		mq.addEventListener("change", handleMq);

		return () => {
			io.disconnect();
			window.removeEventListener("hashchange", updateFromHash);
			mq.removeEventListener("change", handleMq);
			setLabReady = null;
		};
	});

	function toggleToc() {
		isTocVisible = !isTocVisible;
	}
</script>

<div class="relative">
	<!-- Main Content -->
	<section
		class="min-w-0 space-y-10"
		style={isDesktop
			? `margin-right: ${isTocVisible ? "240px" : "64px"}; transition: margin 0.3s ease;`
			: ""}
	>
		<PagesSection />
		<TokensSection />
		<CoverageSection />
		<ShowcaseHeader />
		<ButtonsSection />
		<SeparatorSection />
		<FormsSection />
		<EditorSection />
		<OverlaysSection />
		<NavigationSection />
		<ContentSection />
		<DataSection />
		<CommerceSection />
		<FeedbackSection />
		<AdvancedSection />
		<DocsSection {tocItems} />
	</section>

	<!-- Fixed Right Sidebar -->
	<aside
		class="hidden lg:block fixed right-4 top-16 z-40 h-[calc(100vh-8rem)]"
		style={`width: ${isTocVisible ? "220px" : "48px"}; transition: width 0.3s ease;`}
		aria-label="Table of Contents"
	>
		<!-- Collapsed State: Open Button -->
		<div
			class={[
				"absolute inset-0 flex justify-center py-2 transition-opacity duration-300",
				isTocVisible ? "pointer-events-none opacity-0" : "opacity-100",
			].join(" ")}
		>
			<DsIconButton
				onclick={toggleToc}
				label="Show Sections"
				icon="panel-right-open"
				variant="ghost"
				intent="secondary"
			/>
		</div>

		<!-- Expanded State -->
		<div
			class={[
				"h-full space-y-3 transition-opacity duration-300",
				isTocVisible
					? "opacity-100 delay-150"
					: "pointer-events-none opacity-0 overflow-hidden",
			].join(" ")}
		>
			<DocsToc items={tocItems} activeId={activeSectionId} title="Sections">
				{#snippet actions()}
					<DsIconButton
						onclick={toggleToc}
						label="Close Sections"
						icon="panel-right-close"
						variant="ghost"
						intent="secondary"
						size="sm"
					/>
				{/snippet}
			</DocsToc>

			<div class="rounded-lg border border-border bg-surface p-4">
				<div class="text-label font-semibold text-foreground">상태</div>
				<div
					class="mt-2 flex items-center gap-2 text-helper text-muted-foreground"
				>
					<span class="i-lucide-flask-conical h-4 w-4"></span>
					임시 페이지(추후 삭제 예정)
				</div>
			</div>
		</div>
	</aside>
</div>
