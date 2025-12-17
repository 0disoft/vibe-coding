<script lang="ts">
  import {
    DsBadge,
    DsButton,
    DsCard,
    DsDropdown,
    DsDropdownItem,
    DsEmptyState,
    DsPopover,
    DsSkeleton,
    DsTooltip,
  } from "$lib/components/design-system";

  import { toast } from "$lib/stores/toast.svelte";

  let dropdownSelected = $state<string | null>(null);
  let popoverCount = $state(0);
</script>

<section id="ds-overlays" class="space-y-4">
  <h2 class="text-h2 font-semibold">Overlays</h2>
  <DsCard class="space-y-6">
    <div class="flex flex-wrap items-center gap-2">
      <DsDropdown
        align="start"
        items={[
          { id: "copy", label: "Copy link" },
          { id: "share", label: "Share" },
          { id: "delete", label: "Delete", disabled: true },
        ]}
        onSelect={(id) => {
          dropdownSelected = id;
          toast.info("Dropdown", `선택: ${id}`);
        }}
      />
      {#if dropdownSelected}
        <DsBadge intent="secondary" variant="soft">Selected: {dropdownSelected}</DsBadge>
      {/if}

      <DsDropdown align="start" menuClass="w-64" itemSelector='[role="menuitem"]'>
        {#snippet trigger(props)}
          <DsButton {...props} variant="outline" intent="secondary">Header/Footer</DsButton>
        {/snippet}

        {#snippet header()}
          <div class="text-helper text-muted-foreground">드롭다운 상단 슬롯</div>
        {/snippet}

        {#snippet children({ close })}
          <DsDropdownItem onclick={() => close()}>Action</DsDropdownItem>
          <DsDropdownItem onclick={() => close()}>Duplicate</DsDropdownItem>
          <DsDropdownItem intent="destructive" onclick={() => close()}>Delete</DsDropdownItem>
        {/snippet}

        {#snippet footer()}
          <div class="text-helper text-muted-foreground">드롭다운 하단 슬롯</div>
        {/snippet}
      </DsDropdown>

      <DsDropdown
        align="start"
        haspopup="listbox"
        items={[
          { id: "alpha", label: "Alpha" },
          { id: "beta", label: "Beta" },
          { id: "gamma", label: "Gamma" },
        ]}
        onSelect={(id) => toast.info("Listbox", `선택: ${id}`)}
      />

      <DsTooltip content="툴팁 예시">
        {#snippet children(trigger)}
          <DsButton variant="outline" intent="secondary" aria-describedby={trigger["aria-describedby"]}>
            Tooltip
          </DsButton>
        {/snippet}
      </DsTooltip>

      <DsPopover side="bottom" align="start" label="Popover">
        {#snippet trigger(props)}
          <DsButton
            variant="outline"
            intent="secondary"
            ref={props.ref}
            onclick={props.onclick}
            onkeydown={props.onkeydown}
          >
            Popover
          </DsButton>
        {/snippet}

        {#snippet children({ close })}
          <div class="space-y-3">
            <div class="font-semibold">간단한 Popover</div>
            <p class="text-helper text-muted-foreground">상호작용 가능한 컨텐츠를 넣습니다.</p>
            <div class="flex items-center gap-2">
              <DsButton size="sm" onclick={() => (popoverCount += 1)}>Count: {popoverCount}</DsButton>
              <DsButton size="sm" variant="outline" intent="secondary" onclick={() => close({ focusButton: true })}>
                Close
              </DsButton>
            </div>
          </div>
        {/snippet}
      </DsPopover>
    </div>

    <div class="grid gap-3 md:grid-cols-2">
      <DsSkeleton class="h-24 w-full rounded-md" />
      <DsEmptyState title="No results" description="검색 결과가 없습니다." />
    </div>
  </DsCard>
</section>
