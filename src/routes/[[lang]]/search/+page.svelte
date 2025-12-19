<script lang="ts">
  import { goto } from "$app/navigation";

  import { DsCard, DsLinkButton } from "$lib/components/design-system";
  import { SearchPanelSection } from "$lib/components/search";
  import { site } from "$lib/constants";
  import { pages } from "$lib/constants/pages";
  import { localizeUrl } from "$lib/paraglide/runtime.js";

  // NOTE: 스텁 페이지이므로, 실제 구현 시 컴포넌트/데이터 로딩을 추가하세요.

  const items = pages
    .filter((p) => p.path !== "/")
    .map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description ?? `Group: ${p.group}`,
      meta: p.path,
      keywords: [p.group, p.path],
      disabled: p.path.includes("["),
    }));

  let query = $state("");
</script>

<svelte:head>
  <title>검색 | {site.name}</title>
  <meta name="description" content="검색 - {site.name}" />
</svelte:head>

<div class="container px-4 py-12 md:px-6">
  <div class="mx-auto max-w-4xl space-y-6">
    <div class="space-y-2">
      <p class="text-label text-muted-foreground">Page Stub</p>
      <h1 class="text-h1 font-semibold">검색</h1>
      <p class="text-body-secondary text-muted-foreground">이 페이지는 템플릿 스캐폴딩 단계에서 자동 생성된 스텁입니다.</p>
      <div class="flex flex-wrap gap-2 pt-2">
        <DsLinkButton href="/design-system" variant="outline" intent="secondary">
          Design System
        </DsLinkButton>
      </div>
    </div>

    <DsCard class="space-y-3 p-6 md:p-8">
      <div class="text-label text-muted-foreground">Route</div>
      <div class="text-body">
        <code class="text-code">/search</code>
      </div>

      <div class="pt-4">
        <SearchPanelSection
          {items}
          bind:query
          onSelect={(id) => {
            const next = pages.find((p) => p.id === id);
            if (!next) return;
            goto(localizeUrl(next.path).href);
          }}
        />
      </div>

      <div class="text-label text-muted-foreground pt-4">Next</div>
      <ul class="list-disc ps-6 space-y-1 text-body">
        <li>페이지 목적/콘텐츠 구조 확정</li>
        <li>필요한 DS/Docs 컴포넌트 조합 적용</li>
        <li>데이터 로딩/폼/검증/에러 상태 추가</li>
      </ul>
    </DsCard>
  </div>
</div>
