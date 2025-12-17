<script lang="ts">
  import type { Snippet } from "svelte";

  import type { RenderNodeCtx, TreeNode } from "./treeview-types";

  import DsIcon from "./Icon.svelte";

  interface Props {
    treeId: string;
    node: TreeNode;
    level: number;
    parentId: string | null;

    activeId: string | null;
    setActive: (id: string) => void;

    selectedId: string | null;
    expandedIds: string[];

    showToggle: boolean;
    showIcons: boolean;

    toggleExpanded: (id: string) => void;
    selectNode: (node: TreeNode) => void;

    renderNode?: Snippet<[RenderNodeCtx]>;

    itemRef: (
      node: HTMLElement,
      params: { id: string },
    ) => { update?: (next: { id: string }) => void; destroy?: () => void };
  }

  let {
    treeId,
    node,
    level,
    parentId,
    activeId,
    setActive,
    selectedId,
    expandedIds,
    showToggle,
    showIcons,
    toggleExpanded,
    selectNode,
    renderNode,
    itemRef,
  }: Props = $props();

  let hasChildren = $derived(Boolean(node.children?.length));
  let isExpanded = $derived(hasChildren && expandedIds.includes(node.id));
  let isSelected = $derived(selectedId === node.id);
  let isDisabled = $derived(Boolean(node.disabled));
  let tabIndex = $derived(activeId === node.id ? 0 : -1);

  let paddingStart = $derived(
    `calc(var(--treeview-padding-x) + (${level} * var(--treeview-indent)))`,
  );
</script>

<div
  role="treeitem"
  tabindex={tabIndex}
  aria-level={level + 1}
  aria-selected={isSelected ? "true" : undefined}
  aria-expanded={hasChildren ? (isExpanded ? "true" : "false") : undefined}
  class="ds-tree-item ds-focus-ring"
  data-selected={isSelected ? "true" : undefined}
  data-disabled={isDisabled ? "true" : undefined}
  style={`padding-inline-start: ${paddingStart};`}
  use:itemRef={{ id: node.id }}
  onclick={() => {
    setActive(node.id);
    if (!isDisabled) selectNode(node);
  }}
  onfocus={() => setActive(node.id)}
>
  {#if renderNode}
    {@render renderNode({
      node,
      level,
      parentId,
      hasChildren,
      isExpanded,
      isSelected,
      isDisabled,
      toggle: () => toggleExpanded(node.id),
      select: () => selectNode(node),
    })}
  {:else}
    {#if showToggle}
      <button
        type="button"
        class="ds-tree-toggle"
        aria-label={isExpanded ? "Collapse" : "Expand"}
        aria-controls={`${treeId}-${node.id}-group`}
        aria-hidden={hasChildren ? undefined : "true"}
        tabindex="-1"
        disabled={!hasChildren || isDisabled}
        onmousedown={(e) => e.preventDefault()}
        onclick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!hasChildren) return;
          toggleExpanded(node.id);
        }}
      >
        {#if hasChildren}
          <DsIcon name={isExpanded ? "chevron-down" : "chevron-right"} size="sm" />
        {/if}
      </button>
    {/if}

    {#if showIcons && node.icon}
      <span class="ds-tree-icon" aria-hidden="true">
        <DsIcon name={node.icon} size="sm" />
      </span>
    {/if}

    <div class="ds-tree-text">
      <div class="ds-tree-label">{node.label}</div>
      {#if node.description}
        <div class="ds-tree-desc">{node.description}</div>
      {/if}
    </div>
  {/if}
</div>

{#if hasChildren && isExpanded}
  <div role="group" id={`${treeId}-${node.id}-group`}>
    {#each node.children ?? [] as child (child.id)}
      <svelte:self
        {treeId}
        node={child}
        level={level + 1}
        parentId={node.id}
        {activeId}
        {setActive}
        {selectedId}
        {expandedIds}
        {showToggle}
        {showIcons}
        {toggleExpanded}
        {selectNode}
        {renderNode}
        {itemRef}
      />
    {/each}
  </div>
{/if}

