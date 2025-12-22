<script lang="ts">
	import { page } from "$app/state";
	import {
		DsAdSlot,
		DsButton,
		DsCallout,
		DsCard,
		DsContentCard,
		DsFacetFilter,
		DsFilterBar,
		DsMediaPicker,
		DsQuote,
		DsTag,
	} from "$lib/components/design-system";
	import * as m from "$lib/paraglide/messages.js";
	import { toast } from "$lib/stores/toast.svelte";

	let query = $state("");
	let sort = $state<string | null>(null);

	let facetValues = $state<Record<string, string[]>>({
		type: ["guide"],
		difficulty: [],
	});

	let files = $state<File[]>([]);
	let lazyRenderedAt = $state<string | null>(null);

	// Make labels reactive to language changes
	let privacyLabel = $derived.by(() => {
		void page.url;
		return m.footer_privacy();
	});

	let adLabel = $derived.by(() => {
		void page.url;
		return m.common_advertisement();
	});

	function markLazyRendered(_node: HTMLElement) {
		if (!lazyRenderedAt) {
			lazyRenderedAt = new Date().toLocaleTimeString();
		}
		return {
			destroy() {
				// no-op
			},
		};
	}

	const sortOptions = [
		{ value: "new", label: "Newest" },
		{ value: "old", label: "Oldest" },
		{ value: "popular", label: "Popular" },
	];

	const heroSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600" viewBox="0 0 1200 600">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#7c3aed"/>
          <stop offset="1" stop-color="#06b6d4"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="600" fill="url(#g)"/>
      <circle cx="930" cy="130" r="120" fill="rgba(255,255,255,0.16)"/>
      <circle cx="260" cy="430" r="160" fill="rgba(255,255,255,0.12)"/>
      <text x="70" y="140" fill="rgba(255,255,255,0.92)" font-family="ui-sans-serif, system-ui" font-size="80" font-weight="700">
        Design System
      </text>
      <text x="70" y="220" fill="rgba(255,255,255,0.82)" font-family="ui-sans-serif, system-ui" font-size="44">
        Content primitives
      </text>
    </svg>
  `.trim();

	const imageSrc = `data:image/svg+xml;utf8,${encodeURIComponent(heroSvg)}`;
</script>

<section id="ds-content" class="space-y-4">
	<h2 class="text-h2 font-semibold">Content</h2>

	<DsCard class="space-y-6">
		<div class="space-y-2">
			<h3 class="text-label text-muted-foreground">ContentCard</h3>
			<div class="grid gap-3 md:grid-cols-2">
				<DsContentCard
					class="ds-content-card--compact"
					title="Guides: Build a better docs layout"
					href="/docs"
					excerpt="A practical checklist for navigation, TOC, and readable line-length."
					{imageSrc}
					imageAlt="Gradient banner with Design System title"
					status="published"
					author="Zerodi"
					category="Guides"
					date="2025-12-17"
					readingMinutes={6}
					tags={["docs", "layout", "a11y", "tokens"]}
				/>
				<DsContentCard
					class="ds-content-card--compact"
					title="Community: Share your build log"
					href="/community"
					excerpt="Small experiments, big learnings. Post updates and get feedback."
					status="draft"
					author="Zerodi"
					category="Community"
					date="2025-12-16"
					readingMinutes={3}
					tags={["community", "progress", "shipping"]}
				/>
			</div>
		</div>

		<div class="space-y-2">
			<h3 class="text-label text-muted-foreground">
				FilterBar + FacetFilter
			</h3>
			<DsFilterBar
				bind:query
				bind:sort
				{sortOptions}
				placeholder="Search posts…"
				sortPlaceholder="Sort"
			>
				{#snippet children()}
					<DsTag data-ds-intent="neutral" data-ds-variant="outline"
						>Type: Guides</DsTag
					>
					<DsTag data-ds-intent="neutral" data-ds-variant="outline"
						>Difficulty: Any</DsTag
					>
				{/snippet}
				{#snippet actions()}
					<DsButton
						size="sm"
						variant="solid"
						intent="primary"
						onclick={() =>
							toast.info("Filters", `query=${query}, sort=${sort ?? ""}`)}
					>
						Apply
					</DsButton>
				{/snippet}
			</DsFilterBar>

			<div class="grid gap-4 md:grid-cols-2">
				<div class="rounded-lg border border-border bg-surface p-4">
					<DsFacetFilter
						groups={[
							{
								id: "type",
								title: "Type",
								options: [
									{ value: "guide", label: "Guide", count: 12 },
									{ value: "blog", label: "Blog", count: 48 },
									{ value: "community", label: "Community", count: 29 },
								],
							},
							{
								id: "difficulty",
								title: "Difficulty",
								options: [
									{ value: "beginner", label: "Beginner", count: 24 },
									{ value: "intermediate", label: "Intermediate", count: 19 },
									{ value: "advanced", label: "Advanced", count: 8 },
								],
							},
						]}
						values={facetValues}
						onValuesChange={(next) => (facetValues = next)}
					/>
				</div>

				<div class="rounded-lg border border-border bg-surface p-4">
					<div class="text-helper text-muted-foreground">state</div>
					<div
						class="mt-2 rounded-md bg-surface-hover p-3"
						role="status"
						aria-live="polite"
						aria-atomic="true"
					>
						<pre class="whitespace-pre-wrap text-xs text-foreground">{JSON.stringify(
								{ query, sort, facetValues },
								null,
								2,
							)}</pre>
					</div>
				</div>
			</div>
		</div>

		<div class="space-y-2">
			<h3 class="text-label text-muted-foreground">AdSlot</h3>
			<div class="grid gap-4 md:grid-cols-3">
				<DsAdSlot
					variant="banner"
					showPlaceholder
					reserveRatio
					infoHref="/privacy"
					infoLabel={privacyLabel}
				/>
				<DsAdSlot
					variant="infeed-wide"
					showPlaceholder
					reserveRatio
					infoHref="/privacy"
					infoLabel={privacyLabel}
				/>
				<div class="min-h-[20rem]">
					<DsAdSlot
						variant="sidebar"
						showPlaceholder
						reserveRatio
						sticky
						infoHref="/privacy"
						infoLabel={privacyLabel}
					/>
				</div>
			</div>
			<div class="rounded-lg border border-border bg-surface p-4 space-y-4">
				<div class="text-helper text-muted-foreground">
					Lazy 데모: 스크롤해서 아래 광고가 보일 때 실제 콘텐츠가 렌더링됩니다.
				</div>
				<div
					class="h-40 rounded-md border border-dashed border-border bg-surface-hover"
				></div>
				<DsAdSlot
					variant="banner"
					showPlaceholder
					reserveRatio
					lazy
					lazyMargin="0px"
					infoHref="/privacy"
					infoLabel={privacyLabel}
				>
					{#snippet children()}
						<div use:markLazyRendered class="ds-ad-slot-placeholder-box">
							<div class="text-label">{adLabel}</div>
							<div
								class="text-helper text-muted-foreground"
								aria-live="polite"
								aria-atomic="true"
							>
								Lazy render: {lazyRenderedAt ?? "…"}
							</div>
						</div>
					{/snippet}
				</DsAdSlot>
			</div>
		</div>

		<div class="space-y-2">
			<h3 class="text-label text-muted-foreground">MediaPicker</h3>
			<DsMediaPicker bind:files onFilesChange={(next) => (files = next)} />
			<div class="text-helper text-muted-foreground">files: {files.length}</div>
		</div>

		<div class="space-y-2">
			<h3 class="text-label text-muted-foreground">Callout / Quote</h3>
			<div class="grid gap-3 md:grid-cols-2">
				<DsCallout intent="primary" title="Tip">
					{#snippet children()}
						<p class="text-body text-muted-foreground">
							Content UI는 docs/blog/community 어디서든 재사용할 수 있게 “조립
							컴포넌트”로 유지합니다.
						</p>
					{/snippet}
				</DsCallout>
				<DsQuote cite="Design System Guide">
					{#snippet children()}
						<p class="text-body">
							The best component is the one you can reuse without thinking about
							where it lives.
						</p>
					{/snippet}
				</DsQuote>
			</div>
		</div>
	</DsCard>
</section>
