<script lang="ts">
  import { DocsAnchoredHeading, DocsPrevNext, DocsProse } from "$lib/components/docs";

  import { localizeUrl } from "$lib/paraglide/runtime.js";
  import { site } from "$lib/constants";

  // NOTE: 스텁 페이지이므로, 실제 구현 시 컴포넌트/데이터 로딩을 추가하세요.
</script>

<svelte:head>
  <title>문서/가이드 | {site.name}</title>
  <meta name="description" content="문서/가이드 - {site.name}" />
</svelte:head>

<DocsProse>
  {#snippet children()}
    <DocsAnchoredHeading id="docs-intro" text="Intro" />
    <p>단일 가이드 페이지의 기본 템플릿 예시입니다.</p>

    <DocsAnchoredHeading id="docs-next" text="Next" />
    <ul>
      <li>문서 서식(헤딩/코드/콜아웃) 규칙 확정</li>
      <li>예제 코드/샘플 데이터 정리</li>
      <li>관련 문서 링크(Prev/Next, 추천 링크) 추가</li>
    </ul>
  {/snippet}
</DocsProse>

<div class="pt-6">
  <DocsPrevNext
    prev={{ href: localizeUrl("/docs/guides").pathname, label: "Guides", description: "가이드 인덱스" }}
    next={{ href: localizeUrl("/docs/api").pathname, label: "API", description: "엔드포인트/SDK" }}
  />
</div>
