<script lang="ts">
  import { DocsAnchoredHeading, DocsPrevNext, DocsProse } from "$lib/components/docs";

  import { localizeUrl } from "$lib/paraglide/runtime.js";
  import { site } from "$lib/constants";

  // NOTE: 스텁 페이지이므로, 실제 구현 시 컴포넌트/데이터 로딩을 추가하세요.
</script>

<svelte:head>
  <title>온보딩 체크리스트 | {site.name}</title>
  <meta name="description" content="온보딩 체크리스트 - {site.name}" />
</svelte:head>

<DocsProse>
  {#snippet children()}
    <DocsAnchoredHeading id="docs-intro" text="Intro" />
    <p>프로젝트를 처음 세팅할 때 빠뜨리기 쉬운 항목들을 체크리스트로 관리합니다.</p>

    <DocsAnchoredHeading id="docs-next" text="Next" />
    <ul>
      <li>테마/폰트/언어 기본값 확인</li>
      <li>PWA/서비스 워커 동작 확인</li>
      <li>배포 환경변수 및 도메인 설정</li>
    </ul>
  {/snippet}
</DocsProse>

<div class="pt-6">
  <DocsPrevNext
    prev={{ href: localizeUrl("/docs/getting-started").pathname, label: "Getting started", description: "기본 셋업" }}
    next={{ href: localizeUrl("/docs/api").pathname, label: "API", description: "엔드포인트/SDK" }}
  />
</div>
