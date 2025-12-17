<script lang="ts">
  import { localizeUrl } from "$lib/paraglide/runtime.js";

  import { DocsAnchoredHeading, DocsPrevNext, DocsProse } from "$lib/components/docs";

  import { site } from "$lib/constants";
</script>

<svelte:head>
  <title>문서 가이드 | {site.name}</title>
  <meta name="description" content="문서 가이드 - {site.name}" />
</svelte:head>

<DocsProse>
  {#snippet children()}
    <DocsAnchoredHeading id="docs-intro" text="Intro" />
    <p>
      데스크톱에서는 좌측 메뉴와 우측 목차가 고정 컬럼으로 노출되고, 화면이 좁아지면 상단 버튼으로 Sheet를
      열어 접근합니다.
    </p>

    <DocsAnchoredHeading id="docs-layout" text="Layout" />
    <p>
      <code>DocsLayout</code> 은 내부적으로 3컬럼 그리드를 사용합니다. 본문 컬럼이 가장 넓게 유지되도록
      데스크톱 컬럼 비율을 조정했습니다.
    </p>

    <DocsAnchoredHeading id="docs-next" text="Next" />
    <ul>
      <li>Overview / Getting started / Guides 페이지 구조 정리</li>
      <li>각 페이지에서 tocItems 자동 생성(또는 단일 소스화)</li>
      <li>activeId 기반 ToC 하이라이트(IntersectionObserver) 추가</li>
    </ul>
  {/snippet}
</DocsProse>

<div class="pt-6">
  <DocsPrevNext
    next={{
      href: localizeUrl("/docs/getting-started").pathname,
      label: "Getting started",
      description: "설치/실행/기본 개념",
    }}
  />
</div>
