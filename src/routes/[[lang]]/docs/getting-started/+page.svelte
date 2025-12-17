<script lang="ts">
  import { DocsAnchoredHeading, DocsPrevNext, DocsProse } from "$lib/components/docs";

  import { localizeUrl } from "$lib/paraglide/runtime.js";
  import { site } from "$lib/constants";

  // NOTE: 스텁 페이지이므로, 실제 구현 시 컴포넌트/데이터 로딩을 추가하세요.
</script>

<svelte:head>
  <title>시작 가이드 | {site.name}</title>
  <meta name="description" content="시작 가이드 - {site.name}" />
</svelte:head>

<DocsProse>
  {#snippet children()}
    <DocsAnchoredHeading id="docs-intro" text="Intro" />
    <p>설치, 개발 서버 실행, 프로젝트 구조 등 “처음 시작”에 필요한 내용을 모으는 섹션입니다.</p>

    <DocsAnchoredHeading id="docs-next" text="Next" />
    <ul>
      <li><code>bun install</code> / <code>bun dev</code> 플로우 문서화</li>
      <li>환경변수/배포(Preview/Prod) 가이드 추가</li>
      <li>자주 겪는 문제(Windows 줄바꿈 등) 정리</li>
    </ul>
  {/snippet}
</DocsProse>

<div class="pt-6">
  <DocsPrevNext
    prev={{ href: localizeUrl("/docs").pathname, label: "Overview", description: "문서 홈" }}
    next={{
      href: localizeUrl("/docs/onboarding-checklist").pathname,
      label: "Onboarding checklist",
      description: "초기 셋업 체크리스트",
    }}
  />
</div>
