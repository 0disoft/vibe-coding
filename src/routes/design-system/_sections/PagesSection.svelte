<script lang="ts">
  import { DsCard, DsDataTable, DsLinkButton } from "$lib/components/design-system";

  import { pages as pageRegistry } from "$lib/constants";
  import { localizeUrl } from "$lib/paraglide/runtime.js";
</script>

<section id="pages" class="space-y-4">
  <h2 class="text-h2 font-semibold">Pages</h2>
  <DsCard class="space-y-4">
    <p class="text-body-secondary text-muted-foreground">
      요청된 페이지 스캐폴딩을 한 번에 확인할 수 있는 링크 목록입니다.
    </p>
    <DsDataTable
      columns={[
        { id: "title", header: "Page", sortable: true },
        { id: "group", header: "Group", sortable: true },
        { id: "path", header: "Path", sortable: true },
      ]}
      rows={pageRegistry.filter((p) => p.path !== "/")}
      getValue={(row, id) => row?.[id]}
    >
      {#snippet cell({ row, columnId, value })}
        {#if columnId === "title"}
          <DsLinkButton
            size="sm"
            variant="link"
            intent="secondary"
            href={localizeUrl(String(row.path)).href}
          >
            {String(value ?? "")}
          </DsLinkButton>
        {:else if columnId === "path"}
          <code class="text-code">{String(value ?? "")}</code>
        {:else}
          {String(value ?? "")}
        {/if}
      {/snippet}
    </DsDataTable>
  </DsCard>
</section>

