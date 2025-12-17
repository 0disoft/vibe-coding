<script lang="ts">
  import { DsCard, DsField, DsInput } from "$lib/components/design-system";

  const dsCoverage = [
    {
      id: "ds-buttons",
      title: "Buttons & Icons",
      items: ["DsButton", "DsIconButton", "DsLinkButton", "DsBadge", "DsIcon", "DsInlineIcon"],
    },
    { id: "ds-separator", title: "Separator", items: ["DsSeparator"] },
    {
      id: "ds-forms",
      title: "Forms",
      items: [
        "DsField",
        "DsInput",
        "DsTextarea",
        "DsPasswordInput",
        "DsOtpInput",
        "DsCheckbox",
        "DsSwitch",
        "DsRadioGroup",
        "DsRadioItem",
        "DsSelect",
        "DsCombobox",
        "DsDateRangePicker",
        "DsCalendar",
        "DsDatePicker",
        "DsTimePicker",
        "DsFileUpload",
        "DsTag",
      ],
    },
    {
      id: "ds-overlays",
      title: "Overlays",
      items: [
        "DsDropdown",
        "DsDropdownItem",
        "DsPopover",
        "DsDialog",
        "DsSheet",
        "DsDrawer",
        "DsCommandPalette",
        "DsTooltip",
        "DsSkeleton",
        "DsEmptyState",
      ],
    },
    {
      id: "ds-navigation",
      title: "Navigation",
      items: [
        "DsBreadcrumb",
        "DsTabs",
        "DsTabsList",
        "DsTabsTrigger",
        "DsTabsContent",
        "DsPagination",
        "DsSidebar",
        "DsAppShell",
      ],
    },
    {
      id: "ds-data",
      title: "Data",
      items: ["DsDataTable", "DsTableToolbar", "DsSearchPanel", "DsKpi", "DsStatCard", "DsProgress"],
    },
    {
      id: "ds-feedback",
      title: "Feedback",
      items: ["DsAlert", "DsSpinner", "DsAvatar", "DsToastRegion"],
    },
    {
      id: "ds-advanced",
      title: "Advanced",
      items: [
        "DsAccordion",
        "DsAccordionItem",
        "DsAccordionTrigger",
        "DsAccordionContent",
        "DsTimeline",
        "DsRating",
        "DsPricingTable",
      ],
    },
  ] as const;

  const docsCoverage = [
    "DocsCallout",
    "DocsSteps",
    "DocsToc",
    "DocsCodeTabs",
    "ApiEndpointCard",
    "DocsKbd",
    "DocsSearchResults",
    "DocsLayout",
    "DocsProse",
    "DocsAnchoredHeading",
    "DocsSidebarNav",
    "DocsPrevNext",
  ] as const;

  let coverageQuery = $state("");

  function includesQuery(name: string) {
    const q = coverageQuery.trim().toLowerCase();
    if (!q) return true;
    return name.toLowerCase().includes(q);
  }
</script>

<section id="coverage" class="space-y-4">
  <h2 class="text-h2 font-semibold">Coverage</h2>
  <DsCard class="space-y-4">
    <p class="text-body-secondary text-muted-foreground">
      이 페이지(`/design-system`)에 노출된 DS/Docs 컴포넌트 체크리스트입니다.
    </p>
    <div class="max-w-sm">
      <DsField label="Filter" helpText="컴포넌트 이름으로 필터링">
        {#snippet children(control)}
          <DsInput
            id={control.id}
            aria-describedby={control["aria-describedby"]}
            placeholder="예: DsDatePicker, DocsToc"
            clearable
            bind:value={coverageQuery}
          />
        {/snippet}
      </DsField>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <div class="space-y-4">
        <div class="text-label font-semibold text-foreground">Design System</div>
        {#each dsCoverage as group (group.id)}
          <div class="rounded-lg border border-border bg-surface p-4">
            <div class="flex items-center justify-between gap-2">
              <div class="text-menu-sm font-semibold text-foreground">{group.title}</div>
              <a class="text-helper text-muted-foreground hover:text-foreground" href={`#${group.id}`}>
                #{group.id}
              </a>
            </div>
            <div class="mt-3 flex flex-wrap gap-2">
              {#each group.items.filter(includesQuery) as name (name)}
                <span class="rounded-md border border-border bg-background px-2 py-1 text-menu-sm text-foreground">
                  {name}
                </span>
              {/each}
            </div>
          </div>
        {/each}
      </div>

      <div class="space-y-4">
        <div class="text-label font-semibold text-foreground">Docs</div>
        <div class="rounded-lg border border-border bg-surface p-4">
          <div class="flex items-center justify-between gap-2">
            <div class="text-menu-sm font-semibold text-foreground">Docs Components</div>
            <a class="text-helper text-muted-foreground hover:text-foreground" href="#docs">#docs</a>
          </div>
          <div class="mt-3 flex flex-wrap gap-2">
            {#each docsCoverage.filter(includesQuery) as name (name)}
              <span class="rounded-md border border-border bg-background px-2 py-1 text-menu-sm text-foreground">
                {name}
              </span>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </DsCard>
</section>

