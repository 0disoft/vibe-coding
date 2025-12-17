<script lang="ts">
  import {
    DsButton,
    DsCalendar,
    DsCard,
    DsChartFrame,
    DsCombobox,
    DsDataTable,
    DsDatePicker,
    DsDateRangePicker,
    DsIconButton,
    DsKpi,
    DsSearchPanel,
    DsSkeletonCard,
    DsSkeletonList,
    DsSkeletonTable,
    DsSparkline,
    DsStatCard,
    DsTable,
    DsTableToolbar,
  } from "$lib/components/design-system";

  import { pages as pageRegistry } from "$lib/constants";
  import { toast } from "$lib/stores/toast.svelte";

  let range = $state({ start: "", end: "" });
  let singleDate = $state<string | null>("2025-01-15");
  let assignee = $state("u2");

  let searchQuery = $state("");
  let searchSelected = $state<string | null>(null);

  const chartValues = [12, 10, 14, 18, 16, 21, 25, 19, 23, 28, 31, 29];
  const chartMin = Math.min(...chartValues);
  const chartMax = Math.max(...chartValues);

  const searchItems = pageRegistry
    .filter((p) => p.path !== "/")
    .map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description ?? `Group: ${p.group}`,
      meta: p.path,
      keywords: [p.group, p.path],
      disabled: p.path.includes("["),
    }));
</script>

<section id="ds-data" class="space-y-4">
  <h2 class="text-h2 font-semibold">Data</h2>
  <DsCard class="space-y-6">
    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-2">
        <div class="text-label text-muted-foreground">Combobox</div>
        <DsCombobox
          options={[
            { value: "u1", label: "Alex", keywords: ["admin"] },
            { value: "u2", label: "Blake", keywords: ["owner"] },
            { value: "u3", label: "Casey", keywords: ["viewer"], disabled: true },
          ]}
          bind:value={assignee}
          label="Assignee"
        />
      </div>

      <div class="space-y-2">
        <div class="text-label text-muted-foreground">DateRangePicker</div>
        <DsDateRangePicker bind:value={range} />
      </div>
    </div>

    <div class="space-y-2">
      <div class="text-label text-muted-foreground">Calendar</div>
      <div class="inline-flex rounded-md border border-border bg-surface">
        <DsCalendar bind:value={singleDate} />
      </div>
      <div class="text-helper text-muted-foreground">value: {singleDate ?? ""}</div>
    </div>

    <div class="space-y-2">
      <div class="text-label text-muted-foreground">DatePicker</div>
      <DsDatePicker bind:value={singleDate} label="Due date" locale="en-US" />
    </div>

    <div class="space-y-2">
      <div class="text-label text-muted-foreground">SearchPanel</div>
      <DsSearchPanel
        label="Search pages"
        placeholder="Type to filter pages…"
        items={searchItems}
        bind:query={searchQuery}
        onSelect={(id) => {
          searchSelected = id;
          toast.info("Search", id);
        }}
      />
      <div class="text-helper text-muted-foreground">selected: {searchSelected ?? ""}</div>
    </div>

    <div class="space-y-2">
      <div class="text-label text-muted-foreground">StatCard / KPI</div>
      <div class="grid gap-3 md:grid-cols-3">
        <DsStatCard
          label="Monthly revenue"
          value="$12,420"
          delta="+12%"
          trend="up"
          helper="vs last month"
          icon="dollar-sign"
        >
          {#snippet action()}
            <DsIconButton icon="ellipsis" label="More" size="sm" />
          {/snippet}
          {#snippet bottom()}
            <div class="flex items-center justify-between">
              <span class="text-helper text-muted-foreground">Updated 2m ago</span>
              <DsButton size="sm" variant="ghost" intent="secondary">View</DsButton>
            </div>
          {/snippet}
        </DsStatCard>
        <DsStatCard
          label="New users"
          value="1,284"
          delta="+4.3%"
          trend="up"
          helper="지난 7일"
          icon="users"
        />
        <DsStatCard
          label="Churn"
          value="2.1%"
          delta="-0.4%"
          trend="down"
          helper="지난 30일"
          icon="trending-down"
        />
      </div>

      <div class="grid gap-3 md:grid-cols-2">
        <DsKpi label="Activation" value="68%" helper="가입 후 24시간 내" delta="+2%" trend="up" icon="sparkles" />
        <DsKpi label="Support SLA" value="99.9%" helper="최근 90일" delta="stable" trend="neutral" icon="shield-check" />
      </div>
    </div>

    <div class="space-y-2">
      <div class="text-label text-muted-foreground">Chart primitives</div>
      <DsChartFrame
        title="Revenue trend"
        description="Sparkline + data table toggle (SSOT=데이터)"
        tableToggleLabel="Show data"
      >
        {#snippet children()}
          <div class="flex flex-wrap items-center justify-between gap-4">
            <DsSparkline
              values={chartValues}
              width={220}
              height={48}
              intent="primary"
              label="Revenue trend sparkline"
            />
            <div class="text-helper text-muted-foreground">
              min: {chartMin} / max: {chartMax}
            </div>
          </div>
        {/snippet}

        {#snippet table()}
          <DsTable caption="Monthly revenue values" scroll={false}>
            {#snippet children()}
              <thead class="ds-table-head">
                <tr class="ds-table-tr">
                  <th class="ds-table-th"><div class="ds-table-th-button">Month</div></th>
                  <th class="ds-table-th"><div class="ds-table-th-button">Value</div></th>
                </tr>
              </thead>
              <tbody>
                {#each chartValues as v, i (i)}
                  <tr class="ds-table-tr">
                    <td class="ds-table-td">{i + 1}</td>
                    <td class="ds-table-td">{v}</td>
                  </tr>
                {/each}
              </tbody>
            {/snippet}
          </DsTable>
        {/snippet}
      </DsChartFrame>
    </div>

    <div class="space-y-2">
      <div class="text-label text-muted-foreground">DataTable</div>
      <div class="pb-3">
        <DsTableToolbar
          title="Projects"
          description="검색/필터/액션을 한 곳에 모읍니다."
          count={3}
          placeholder="Search projects"
        >
          {#snippet end()}
            <DsButton size="sm" variant="outline" intent="secondary">Filter</DsButton>
            <DsButton size="sm" intent="primary">New</DsButton>
          {/snippet}
        </DsTableToolbar>
      </div>
      <DsDataTable
        columns={[
          { id: "id", header: "ID", sortable: true },
          { id: "name", header: "Name", sortable: true },
          { id: "status", header: "Status", sortable: true },
          { id: "score", header: "Score", align: "end", sortable: true },
        ]}
        rows={[
          { id: "p_001", name: "Alpha", status: "active", score: 92 },
          { id: "p_002", name: "Beta", status: "paused", score: 75 },
          { id: "p_003", name: "Gamma", status: "active", score: 88 },
        ]}
      />
    </div>

    <div class="space-y-2">
      <div class="text-label text-muted-foreground">Skeleton presets</div>
      <div class="grid gap-4 md:grid-cols-2">
        <DsSkeletonCard showMedia lines={2} />
        <DsSkeletonList rows={3} />
      </div>
      <div class="pt-2">
        <DsSkeletonTable columns={4} rows={4} />
      </div>
    </div>
  </DsCard>
</section>
