<script lang="ts">
  import { DocsAnchoredHeading, DocsPrevNext, DocsProse } from "$lib/components/docs";

  import { localizeUrl } from "$lib/paraglide/runtime.js";
  import { site } from "$lib/constants";

  // NOTE: 스텁 페이지이므로, 실제 구현 시 컴포넌트/데이터 로딩을 추가하세요.
</script>

<svelte:head>
  <title>API 레퍼런스 | {site.name}</title>
  <meta name="description" content="API 레퍼런스 - {site.name}" />
</svelte:head>

<DocsProse>
  {#snippet children()}
    <DocsAnchoredHeading id="docs-intro" text="Intro" />
    <p>엔드포인트/스키마/에러 규격 등 상세 레퍼런스를 정리하는 페이지입니다.</p>

    <DocsAnchoredHeading id="docs-next" text="Next" />
    <ul>
      <li>엔드포인트 목록(그룹/태그) 확정</li>
      <li>요청/응답 스키마 표기(예: TypeBox/JSON Schema) 추가</li>
      <li>레이트리밋/에러코드/리트라이 정책 문서화</li>
    </ul>
  {/snippet}
</DocsProse>

<div class="pt-6">
  <DocsPrevNext
    prev={{ href: localizeUrl("/docs/api").pathname, label: "API", description: "인덱스" }}
    next={{ href: localizeUrl("/docs").pathname, label: "Overview", description: "문서 홈" }}
  />
</div>
