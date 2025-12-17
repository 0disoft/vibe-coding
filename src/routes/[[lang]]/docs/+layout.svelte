<script lang="ts">
  import { page } from "$app/state";

  import { DocsLayout, DocsSidebarNav } from "$lib/components/docs";

  import { localizeUrl } from "$lib/paraglide/runtime.js";

  type TocItem = { id: string; label: string; level: 2 | 3 | 4 };

  const navItems = [
    { href: localizeUrl("/docs").pathname, label: "Overview" },
    {
      href: localizeUrl("/docs/getting-started").pathname,
      label: "Getting started",
      items: [
        { href: localizeUrl("/docs/onboarding-checklist").pathname, label: "Onboarding checklist" },
        { href: localizeUrl("/docs/api").pathname, label: "API" },
      ],
    },
    { href: localizeUrl("/docs/guides").pathname, label: "Guides" },
    { href: localizeUrl("/docs/guide").pathname, label: "Guide" },
  ] as const;

  const tocMap: Record<string, TocItem[]> = {
    "/docs": [
      { id: "docs-intro", label: "Intro", level: 2 },
      { id: "docs-layout", label: "Layout", level: 2 },
      { id: "docs-next", label: "Next", level: 2 },
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
  title={title}
  description="DocsLayout 데스크톱(좌측 메뉴 + 우측 ToC) / 모바일(Sheet) 동작 확인"
  tocItems={tocItems}
>
  {#snippet sidebar()}
    <DocsSidebarNav title="Docs" items={navItems} activePath={page.url.pathname} />
  {/snippet}

  {#snippet children()}
    {@render routeChildren()}
  {/snippet}
</DocsLayout>
