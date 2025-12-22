<script lang="ts">
	import { page } from "$app/state";

	import { DsButton } from "$lib/components/design-system";
	import {
		DocsLayout,
		DocsSidebarNav,
		type TocItem,
	} from "$lib/components/docs";

	import { localizeUrl } from "$lib/paraglide/runtime.js";

	import { getLocaleFromUrl } from "$lib/shared/utils/locale";

	let currentLocale = $derived(getLocaleFromUrl(page.url));

	let navItems = $derived([
		{
			href: localizeUrl("/docs", { locale: currentLocale }).pathname,
			label: "Overview",
		},
		{
			href: localizeUrl("/docs/getting-started", { locale: currentLocale })
				.pathname,
			label: "Getting started",
			items: [
				{
					href: localizeUrl("/docs/onboarding-checklist", {
						locale: currentLocale,
					}).pathname,
					label: "Onboarding checklist",
				},
				{
					href: localizeUrl("/docs/api", { locale: currentLocale }).pathname,
					label: "API",
				},
			],
		},
		{
			href: localizeUrl("/docs/guides", { locale: currentLocale }).pathname,
			label: "Guides",
		},
		{
			href: localizeUrl("/docs/guide", { locale: currentLocale }).pathname,
			label: "Guide",
		},
		// Mock Data for Sidebar Scrolling
		{ href: "#mock-1", label: "Mock Category 1" },
		{ href: "#mock-2", label: "Mock Category 2" },
		{ href: "#mock-3", label: "Mock Category 3" },
		{ href: "#mock-4", label: "Mock Category 4" },
		{ href: "#mock-5", label: "Mock Category 5" },
		{ href: "#mock-6", label: "Mock Category 6" },
		{ href: "#mock-7", label: "Mock Category 7" },
		{ href: "#mock-8", label: "Mock Category 8" },
		{ href: "#mock-9", label: "Mock Category 9" },
		{ href: "#mock-10", label: "Mock Category 10" },
		{ href: "#mock-11", label: "Mock Category 11" },
		{ href: "#mock-12", label: "Mock Category 12" },
		{ href: "#mock-13", label: "Mock Category 13" },
		{ href: "#mock-14", label: "Mock Category 14" },
		{ href: "#mock-15", label: "Mock Category 15" },
		{ href: "#mock-16", label: "Mock Category 16" },
	]);

	const tocMap: Record<string, TocItem[]> = {
		"/docs": [
			{ id: "docs-intro", label: "Intro", level: 2 },
			{ id: "docs-layout", label: "Layout", level: 2 },
			{ id: "docs-next", label: "Next", level: 2 },
			// Mock ToC Items
			{ id: "mock-section-1", label: "Testing Section 1", level: 2 },
			{ id: "mock-section-2", label: "Testing Section 2", level: 2 },
			{ id: "mock-section-3", label: "Testing Section 3", level: 2 },
			{ id: "mock-section-4", label: "Testing Section 4", level: 2 },
			{ id: "mock-section-5", label: "Testing Section 5", level: 2 },
			// Extended Mock Data
			{ id: "mock-toc-1", label: "Mock ToC Item 1", level: 2 },
			{ id: "mock-toc-2", label: "Mock ToC Item 2", level: 2 },
			{ id: "mock-toc-3", label: "Mock ToC Item 3", level: 2 },
			{ id: "mock-toc-4", label: "Mock ToC Item 4", level: 2 },
			{ id: "mock-toc-5", label: "Mock ToC Item 5", level: 2 },
			{ id: "mock-toc-6", label: "Mock ToC Item 6", level: 2 },
			{ id: "mock-toc-7", label: "Mock ToC Item 7", level: 2 },
			{ id: "mock-toc-8", label: "Mock ToC Item 8", level: 2 },
			{ id: "mock-toc-9", label: "Mock ToC Item 9", level: 2 },
			{ id: "mock-toc-10", label: "Mock ToC Item 10", level: 2 },
			{ id: "mock-toc-11", label: "Mock ToC Item 11", level: 2 },
			{ id: "mock-toc-12", label: "Mock ToC Item 12", level: 2 },
			{ id: "mock-toc-13", label: "Mock ToC Item 13", level: 2 },
			{ id: "mock-toc-14", label: "Mock ToC Item 14", level: 2 },
			{ id: "mock-toc-15", label: "Mock ToC Item 15", level: 2 },
			{ id: "mock-toc-16", label: "Mock ToC Item 16", level: 2 },
			{ id: "mock-toc-17", label: "Mock ToC Item 17", level: 2 },
			{ id: "mock-toc-18", label: "Mock ToC Item 18", level: 2 },
			{ id: "mock-toc-19", label: "Mock ToC Item 19", level: 2 },
			{ id: "mock-toc-20", label: "Mock ToC Item 20", level: 2 },
		],
		"/docs/getting-started": [
			{ id: "docs-intro", label: "Intro", level: 2 },
			{ id: "docs-next", label: "Next", level: 2 },
		],
		"/docs/guides": [
			{ id: "docs-intro", label: "Intro", level: 2 },
			{ id: "docs-next", label: "Next", level: 2 },
		],
		"/docs/guide": [
			{ id: "docs-intro", label: "Intro", level: 2 },
			{ id: "docs-next", label: "Next", level: 2 },
		],
		"/docs/onboarding-checklist": [
			{ id: "docs-intro", label: "Intro", level: 2 },
			{ id: "docs-next", label: "Next", level: 2 },
		],
		"/docs/api": [
			{ id: "docs-intro", label: "Intro", level: 2 },
			{ id: "docs-reference", label: "Reference", level: 2 },
			{ id: "docs-next", label: "Next", level: 2 },
		],
		"/docs/api/reference": [
			{ id: "docs-intro", label: "Intro", level: 2 },
			{ id: "docs-next", label: "Next", level: 2 },
		],
	};

	const titleMap: Record<string, string> = {
		"/docs": "문서 가이드",
		"/docs/getting-started": "시작 가이드",
		"/docs/guides": "가이드 모음",
		"/docs/guide": "가이드",
		"/docs/onboarding-checklist": "온보딩 체크리스트",
		"/docs/api": "API",
		"/docs/api/reference": "API Reference",
	};

	function stripLangPrefix(pathname: string) {
		// [[lang]] optional param: /en/docs/... 형태를 /docs/...로 정규화
		return pathname.replace(/^\/[a-z]{2}(?:-[A-Z]{2})?(?=\/docs(?:\/|$))/, "");
	}

	let canonicalPath = $derived(stripLangPrefix(page.url.pathname));
	let title = $derived(titleMap[canonicalPath] ?? "Docs");
	let tocItems = $derived(tocMap[canonicalPath] ?? []);

	let { children: routeChildren } = $props();
</script>

<DocsLayout
	{title}
	description="DocsLayout 데스크톱(좌측 메뉴 + 우측 ToC) / 모바일(Sheet) 동작 확인"
	{tocItems}
>
	{#snippet sidebar({ close })}
		<DocsSidebarNav
			title="Docs"
			items={navItems}
			activePath={page.url.pathname}
		>
			{#snippet actions()}
				<div class="flex items-center">
					<DsButton
						size="sm"
						variant="ghost"
						intent="secondary"
						onclick={close}
						title="Close Sidebar"
						aria-label="Close Sidebar"
					>
						<span class="i-lucide-panel-left-close h-4 w-4" aria-hidden="true"
						></span>
					</DsButton>
				</div>
			{/snippet}
		</DocsSidebarNav>
	{/snippet}

	{#snippet children()}
		{@render routeChildren()}
	{/snippet}
</DocsLayout>
