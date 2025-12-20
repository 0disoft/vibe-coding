<script lang="ts">
  import CodeBlock from "$lib/components/CodeBlock.svelte";
  import {
    DsTabs,
    DsTabsContent,
    DsTabsList,
    DsTabsTrigger,
  } from "$lib/components/design-system";

  export type CodeTab = {
    id?: string;
    label: string;
    language: string;
    code: string;
  };

  interface Props {
    tabs: CodeTab[];
  }

  let { tabs }: Props = $props();

  function tabValue(tab: CodeTab, index: number) {
    return tab.id ?? `tab-${index}`;
  }
</script>

<DsTabs>
  <DsTabsList class="w-full justify-start overflow-x-auto no-scrollbar">
    {#each tabs as tab, index (tab.id ?? tab.label ?? index)}
      <DsTabsTrigger value={tabValue(tab, index)}>{tab.label}</DsTabsTrigger>
    {/each}
  </DsTabsList>

  {#each tabs as tab, index (tab.id ?? tab.label ?? index)}
    <DsTabsContent value={tabValue(tab, index)}>
      <CodeBlock code={tab.code} language={tab.language} />
    </DsTabsContent>
  {/each}
</DsTabs>

