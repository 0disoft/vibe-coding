<script lang="ts">
	import { onMount } from "svelte";

	import { DocsToc } from "$lib/components/docs";

	import AdvancedSection from "./_sections/AdvancedSection.svelte";
	import ButtonsSection from "./_sections/ButtonsSection.svelte";
	import CoverageSection from "./_sections/CoverageSection.svelte";
	import ContentSection from "./_sections/ContentSection.svelte";
	import DataSection from "./_sections/DataSection.svelte";
	import DocsSection from "./_sections/DocsSection.svelte";
	import FeedbackSection from "./_sections/FeedbackSection.svelte";
	import FormsSection from "./_sections/FormsSection.svelte";
	import EditorSection from "./_sections/EditorSection.svelte";
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
		{ id: "ds-feedback", label: "Feedback", level: 2 },
		{ id: "ds-advanced", label: "Advanced", level: 2 },
		{ id: "docs", label: "Docs Components", level: 2 },
	] as const;

	type TocId = (typeof tocItems)[number]["id"];
	let activeSectionId = $state<TocId>(tocItems[0]?.id ?? "pages");

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
				if (id && isTocId(id)) activeSectionId = id;
			},
			{
				root: null,
				rootMargin: "-20% 0px -70% 0px",
				threshold: [0, 0.1],
			},
		);

		for (const t of targets) io.observe(t);

		return () => {
			io.disconnect();
			window.removeEventListener("hashchange", updateFromHash);
		};
	});
</script>

<div class="grid gap-6 lg:grid-cols-[1fr_280px]">
	<div class="min-w-0 space-y-10">
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
		<FeedbackSection />
		<AdvancedSection />
		<DocsSection tocItems={tocItems} />
	</div>

	<aside class="hidden lg:block">
		<div class="sticky top-6 space-y-3">
			<DocsToc items={tocItems} activeId={activeSectionId} title="Sections" />
			<div class="rounded-lg border border-border bg-surface p-4">
				<div class="text-label font-semibold text-foreground">상태</div>
				<div class="mt-2 flex items-center gap-2 text-helper text-muted-foreground">
					<span class="i-lucide-flask-conical h-4 w-4"></span>
					임시 페이지(추후 삭제 예정)
				</div>
			</div>
		</div>
	</aside>
</div>
