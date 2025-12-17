<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  import { createControllableState } from "$lib/shared/utils/controllable-state.svelte";

  import DsCheckbox from "./Checkbox.svelte";

  export type FacetOption = {
    value: string;
    label: string;
    count?: number;
    disabled?: boolean;
  };

  export type FacetGroup = {
    id: string;
    title: string;
    options: FacetOption[];
  };

  export type FacetValues = Record<string, string[]>;

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    groups: FacetGroup[];
    values?: FacetValues;
    onValuesChange?: (next: FacetValues) => void;
    defaultValues?: FacetValues;
    renderOption?: Snippet<
      [
        {
          groupId: string;
          option: FacetOption;
          checked: boolean;
          toggle: () => void;
        },
      ]
    >;
  }

  let {
    groups,
    values,
    onValuesChange,
    defaultValues = {},
    renderOption,
    class: className = "",
    ...rest
  }: Props = $props();

  function normalizeDefaults(): FacetValues {
    const out: FacetValues = {};
    for (const g of groups) out[g.id] = defaultValues[g.id] ?? [];
    return out;
  }

  let state = createControllableState<FacetValues>({
    value: () => values ?? undefined,
    onChange: (next) => onValuesChange?.(next),
    defaultValue: normalizeDefaults(),
  });

  function setGroup(groupId: string, next: string[]) {
    state.value = { ...state.value, [groupId]: next };
  }

  function toggle(groupId: string, value: string) {
    const current = state.value[groupId] ?? [];
    const set = new Set(current);
    if (set.has(value)) set.delete(value);
    else set.add(value);
    setGroup(groupId, [...set]);
  }
</script>

<div {...rest} class={["ds-facet-filter", className].filter(Boolean).join(" ")}>
  {#each groups as group (group.id)}
    <section class="ds-facet-group" aria-label={group.title}>
      <div class="ds-facet-title">{group.title}</div>
      <div class="ds-facet-options">
        {#each group.options as option (option.value)}
          {@const checked = (state.value[group.id] ?? []).includes(option.value)}
          {#if renderOption}
            {@render renderOption({
              groupId: group.id,
              option,
              checked,
              toggle: () => toggle(group.id, option.value),
            })}
          {:else}
            <label class="ds-facet-option">
              <DsCheckbox
                checked={checked}
                disabled={option.disabled}
                onchange={() => toggle(group.id, option.value)}
              >
                {#snippet children()}
                  <span class="ds-facet-option-label">{option.label}</span>
                  {#if typeof option.count === "number"}
                    <span class="ds-facet-option-count">{option.count}</span>
                  {/if}
                {/snippet}
              </DsCheckbox>
            </label>
          {/if}
        {/each}
      </div>
    </section>
  {/each}
</div>

