<script lang="ts">
  import { DsCard, DsDefinitionList, DsTable } from "$lib/components/design-system";
  import CodeBlock from "$lib/components/CodeBlock.svelte";
  import type { TocItem } from "$lib/components/docs/DocsToc.svelte";

  import {
    ApiEndpointCard,
    DocsAnchoredHeading,
    DocsCallout,
    DocsCodeTabs,
    DocsKbd,
    DocsLayout,
    DocsPrevNext,
    DocsProse,
    DocsSearchResults,
    DocsSidebarNav,
    DocsSteps,
    DocsToc,
  } from "$lib/components/docs";

  export let tocItems: readonly TocItem[];

  const docsDemoToc = [
    { id: "docs-intro", label: "Intro", level: 2 },
    { id: "docs-install", label: "Install", level: 2 },
    { id: "docs-next", label: "Next", level: 2 },
  ] as const;

  const docsNavItems = [
    { href: "/docs", label: "Overview" },
    {
      href: "/docs/getting-started",
      label: "Getting started",
      items: [
        { href: "/docs/onboarding-checklist", label: "Onboarding checklist" },
        { href: "/docs/api", label: "API" },
      ],
    },
    { href: "/docs/guides", label: "Guides" },
  ] as const;
</script>

<section id="docs" class="space-y-4">
  <h2 class="text-h2 font-semibold">Docs Components</h2>
  <DsCard class="space-y-6">
    <DocsCallout intent="primary" title="DocsCallout">
      문서 페이지에서 Note/Tip/Warning 같은 블록을 빠르게 표현합니다.
    </DocsCallout>

    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-2">
        <div class="text-label text-muted-foreground">DocsSteps</div>
        <DocsSteps
          steps={[
            { title: "Install", description: "bun install" },
            { title: "Run", description: "bun dev" },
            { title: "Deploy", description: "CI에서 build/publish" },
          ]}
        />
      </div>

      <div class="space-y-2">
        <div class="text-label text-muted-foreground">DocsToc</div>
        <DocsToc items={tocItems} activeId="docs" />
      </div>
    </div>

    <div class="space-y-2">
      <div class="text-label text-muted-foreground">DocsCodeTabs</div>
      <DocsCodeTabs
        tabs={[
          { label: "bun", language: "bash", code: "bun install\nbun dev" },
          { label: "curl", language: "bash", code: "curl -X GET https://api.example.com" },
          { label: "ts", language: "typescript", code: "const ok: boolean = true;" },
        ]}
      />
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-2">
        <div class="text-label text-muted-foreground">DsTable (semantic)</div>
        <DsTable caption="예시: 정책 테이블(시맨틱 + 스크롤)" scroll>
          {#snippet children()}
            <thead class="ds-table-head">
              <tr class="ds-table-tr">
                <th class="ds-table-th">
                  <div class="ds-table-th-button">Tier</div>
                </th>
                <th class="ds-table-th">
                  <div class="ds-table-th-button">Limit</div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr class="ds-table-tr">
                <td class="ds-table-td">Free</td>
                <td class="ds-table-td">10 req/min</td>
              </tr>
              <tr class="ds-table-tr">
                <td class="ds-table-td">Pro</td>
                <td class="ds-table-td">120 req/min</td>
              </tr>
            </tbody>
          {/snippet}
        </DsTable>
      </div>

      <div class="space-y-2">
        <div class="text-label text-muted-foreground">DsDefinitionList</div>
        <DsDefinitionList
          variant="columns"
          items={[
            { term: "SLA", description: "서비스 가용성에 대한 약속(예: 99.9%)" },
            { term: "RPO", description: "데이터 손실 허용 목표(Recovery Point Objective)" },
            { term: "RTO", description: "복구 목표 시간(Recovery Time Objective)" },
          ]}
        />
      </div>
    </div>

    <div class="space-y-2">
      <div class="text-label text-muted-foreground">ApiEndpointCard</div>
      <ApiEndpointCard
        method="GET"
        path="/v1/users"
        description="사용자 목록을 조회합니다."
        examples={[
          { label: "cURL", language: "bash", code: "curl -X GET https://api.example.com/v1/users" },
          {
            label: "TS",
            language: "typescript",
            code: "await fetch('https://api.example.com/v1/users');",
          },
        ]}
      >
        <CodeBlock
          language="json"
          code={`{
  "meta": {
    "requestId": "req_9f3c",
    "generatedAt": "2025-12-20T10:30:00Z"
  },
  "data": [
    { "id": "u_123", "name": "Avery", "role": "admin" },
    { "id": "u_124", "name": "Jules", "role": "editor" },
    { "id": "u_125", "name": "Casey", "role": "viewer" },
    { "id": "u_126", "name": "Morgan", "role": "viewer" },
    { "id": "u_127", "name": "Reese", "role": "editor" },
    { "id": "u_128", "name": "Sky", "role": "viewer" },
    { "id": "u_129", "name": "Rowan", "role": "admin" },
    { "id": "u_130", "name": "Quinn", "role": "viewer" },
    { "id": "u_131", "name": "Parker", "role": "viewer" },
    { "id": "u_132", "name": "Elliot", "role": "editor" },
    { "id": "u_133", "name": "Harper", "role": "admin" },
    { "id": "u_134", "name": "Riley", "role": "viewer" },
    { "id": "u_135", "name": "Sawyer", "role": "editor" },
    { "id": "u_136", "name": "Kendall", "role": "viewer" },
    { "id": "u_137", "name": "Emerson", "role": "viewer" },
    { "id": "u_138", "name": "Jordan", "role": "admin" },
    { "id": "u_139", "name": "Rowe", "role": "viewer" },
    { "id": "u_140", "name": "Alex", "role": "editor" },
    { "id": "u_141", "name": "Taylor", "role": "viewer" },
    { "id": "u_142", "name": "Cameron", "role": "viewer" },
    { "id": "u_143", "name": "Finley", "role": "editor" },
    { "id": "u_144", "name": "Peyton", "role": "viewer" },
    { "id": "u_145", "name": "Phoenix", "role": "admin" },
    { "id": "u_146", "name": "Dakota", "role": "viewer" },
    { "id": "u_147", "name": "Ari", "role": "viewer" },
    { "id": "u_148", "name": "Nova", "role": "editor" },
    { "id": "u_149", "name": "River", "role": "viewer" }
  ],
  "paging": {
    "nextCursor": "cur_7b1d",
    "hasMore": true
  }
}`}
        />
      </ApiEndpointCard>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-2">
        <div class="text-label text-muted-foreground">DocsKbd</div>
        <div class="flex flex-wrap items-center gap-2">
          <DocsKbd keys="Ctrl + K" />
          <DocsKbd keys="Shift + Enter" />
        </div>
      </div>
      <div class="space-y-2">
        <div class="text-label text-muted-foreground">DocsSearchResults</div>
        <DocsSearchResults
          query="auth"
          items={[
            { title: "Authentication", href: "/docs/auth", excerpt: "로그인/토큰/세션", meta: "docs · 2m" },
            { title: "Reset password", href: "/docs/reset", excerpt: "OTP와 재설정 플로우", meta: "docs · 1m" },
          ]}
        />
      </div>
    </div>

    <div class="space-y-2">
      <div class="text-label text-muted-foreground">DocsLayout / DocsProse / DocsAnchoredHeading / DocsPrevNext</div>
      <DocsLayout
        title="DocsLayout"
        description="문서 페이지 레이아웃(사이드바 + 본문 + ToC)"
        tocItems={docsDemoToc}
        embedded
        class="rounded-lg border border-border bg-background p-4"
      >
        {#snippet sidebar()}
          <DocsSidebarNav
            title="Docs"
            items={docsNavItems}
            activePath="/docs/getting-started"
            class="border-0 bg-transparent p-0"
          />
        {/snippet}

        {#snippet children()}
          <DocsProse>
            {#snippet children()}
              <DocsAnchoredHeading id="docs-intro" level={2}>
                {#snippet children()}Intro{/snippet}
              </DocsAnchoredHeading>
              <p>이 영역은 마크다운/가이드 본문 스타일을 표준화합니다.</p>

              <DocsAnchoredHeading id="docs-install" level={2}>
                {#snippet children()}Install{/snippet}
              </DocsAnchoredHeading>
              <p><code>bun install</code> 후 <code>bun dev</code> 로 실행합니다.</p>

              <DocsAnchoredHeading id="docs-next" level={2}>
                {#snippet children()}Next{/snippet}
              </DocsAnchoredHeading>
              <p>사이드바/ToC는 모바일에서 Sheet로 열립니다.</p>
            {/snippet}
          </DocsProse>

          <div class="pt-6">
            <DocsPrevNext
              prev={{ href: "/docs", label: "Overview", description: "문서 홈" }}
              next={{ href: "/docs/api", label: "API", description: "엔드포인트/SDK" }}
            />
          </div>
        {/snippet}
      </DocsLayout>
    </div>
  </DsCard>
</section>
