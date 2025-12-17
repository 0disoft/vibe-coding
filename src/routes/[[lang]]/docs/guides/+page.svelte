<script lang="ts">
  import { DocsAnchoredHeading, DocsPrevNext, DocsProse } from "$lib/components/docs";

  import { localizeUrl } from "$lib/paraglide/runtime.js";
  import { site } from "$lib/constants";

  // NOTE: 스텁 페이지이므로, 실제 구현 시 컴포넌트/데이터 로딩을 추가하세요.
</script>

<svelte:head>
  <title>가이드 모음 | {site.name}</title>
  <meta name="description" content="가이드 모음 - {site.name}" />
</svelte:head>

<DocsProse>
  {#snippet children()}
    <DocsAnchoredHeading id="docs-intro" text="Intro" />
    <p>기능별/주제별로 문서를 묶어 제공하는 가이드 인덱스입니다.</p>

    <DocsAnchoredHeading id="docs-next" text="Next" />
    <ul>
      <li>가이드 카테고리(예: i18n, PWA, DS) 확정</li>
      <li>각 가이드 페이지에 메타(난이도/소요시간) 추가</li>
      <li>검색(명령 팔레트)와 연결</li>
    </ul>
  {/snippet}
</DocsProse>

<div class="pt-6">
  <DocsPrevNext
    prev={{ href: localizeUrl("/docs").pathname, label: "Overview", description: "문서 홈" }}
    next={{ href: localizeUrl("/docs/guide").pathname, label: "Guide", description: "단일 가이드 예시" }}
  />
</div>
