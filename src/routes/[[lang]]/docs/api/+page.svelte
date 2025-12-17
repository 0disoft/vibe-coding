<script lang="ts">
  import { DocsAnchoredHeading, DocsPrevNext, DocsProse } from "$lib/components/docs";

  import { localizeUrl } from "$lib/paraglide/runtime.js";
  import { site } from "$lib/constants";

  // NOTE: 스텁 페이지이므로, 실제 구현 시 컴포넌트/데이터 로딩을 추가하세요.
</script>

<svelte:head>
  <title>API 문서 | {site.name}</title>
  <meta name="description" content="API 문서 - {site.name}" />
</svelte:head>

<DocsProse>
  {#snippet children()}
    <DocsAnchoredHeading id="docs-intro" text="Intro" />
    <p>API 문서의 인덱스입니다. 엔드포인트 목록, 인증 방식, SDK 사용법 등을 안내합니다.</p>

    <DocsAnchoredHeading id="docs-reference" text="Reference" />
    <p>
      상세 레퍼런스는 <code>/docs/api/reference</code> 로 이동합니다.
    </p>

    <DocsAnchoredHeading id="docs-next" text="Next" />
    <ul>
      <li>인증/권한/에러 포맷 표준화</li>
      <li>엔드포인트 예제(curl/ts) 템플릿 정리</li>
      <li>SDK/클라이언트 생성 가이드 추가</li>
    </ul>
  {/snippet}
</DocsProse>

<div class="pt-6">
  <DocsPrevNext
    prev={{ href: localizeUrl("/docs").pathname, label: "Overview", description: "문서 홈" }}
    next={{ href: localizeUrl("/docs/api/reference").pathname, label: "API Reference", description: "상세 레퍼런스" }}
  />
</div>
