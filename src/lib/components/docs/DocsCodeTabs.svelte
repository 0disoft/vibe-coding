<script lang="ts">
  import CodeBlock from "$lib/components/CodeBlock.svelte";
  import {
    DsTabs,
    DsTabsContent,
    DsTabsList,
    DsTabsTrigger,
  } from "$lib/components/design-system";

  export type CodeTab = {
    label: string;
    language: string;
    code: string;
  };

  interface Props {
    tabs: CodeTab[];
  }

  let { tabs }: Props = $props();
</script>

<DsTabs>
  <DsTabsList class="w-full justify-start flex-wrap">
    {#each tabs as tab (tab.label)}
      <DsTabsTrigger value={tab.label}>{tab.label}</DsTabsTrigger>
    {/each}
  </DsTabsList>

  {#each tabs as tab (tab.label)}
    <DsTabsContent value={tab.label}>
      <CodeBlock code={tab.code} language={tab.language} />
    </DsTabsContent>
  {/each}
</DsTabs>

