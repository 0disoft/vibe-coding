<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { createControllableState } from "$lib/shared/utils/controllable-state.svelte";
  import { useId } from "$lib/shared/utils/use-id";
  import type { FlatNode, RenderNodeCtx, TreeNode } from "./treeview-types";
  export type { TreeNode } from "./treeview-types";
  import TreeViewNode from "./TreeViewNode.svelte";

  interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    id?: string;
    label?: string;
    nodes: TreeNode[];

    selectedId?: string | null;
    onSelectedIdChange?: (next: string | null) => void;
    defaultSelectedId?: string | null;

    expandedIds?: string[];
    onExpandedIdsChange?: (next: string[]) => void;
    defaultExpandedIds?: string[];

    /** 토글 버튼 표시 여부 */
    showToggle?: boolean;
    /** 아이콘 표시 여부 */
    showIcons?: boolean;
    /** 노드 렌더 커스터마이즈(고급) */
    renderNode?: Snippet<[RenderNodeCtx]>;
    /** 선택 시 호출(예: 라우팅) */
    onSelectNode?: (node: TreeNode) => void;
  }

  let {
    id: idProp,
    label = "Tree",
    nodes,
    selectedId,
    onSelectedIdChange,
    defaultSelectedId = null,
    expandedIds,
    onExpandedIdsChange,
    defaultExpandedIds = [],
    showToggle = true,
    showIcons = true,
    renderNode,
    onSelectNode,
    class: className = "",
    ...rest
  }: Props = $props();

  const generatedId = useId("ds-tree");
  let treeId = $derived(idProp ?? generatedId);

  let selectedState = createControllableState<string | null>({
    value: () => selectedId ?? undefined,
    onChange: (next) => onSelectedIdChange?.(next),
    defaultValue: defaultSelectedId,
  });

  let expandedState = createControllableState<string[]>({
    value: () => expandedIds ?? undefined,
    onChange: (next) => onExpandedIdsChange?.(next),
    defaultValue: defaultExpandedIds,
  });

  function hasChildren(node: TreeNode) {
    return Boolean(node.children?.length);
  }

  function toggleExpanded(id: string) {
    const current = expandedState.value;
    const set = new Set(current);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    expandedState.value = [...set];
  }

  function selectNode(node: TreeNode) {
    if (node.disabled) return;
    selectedState.value = node.id;
    onSelectNode?.(node);
  }

  function flatten(
    list: TreeNode[],
    params: {
      level: number;
      parentId: string | null;
      expanded: Set<string>;
      selected: string | null;
      out: FlatNode[];
    },
  ) {
    for (const n of list) {
      const has = hasChildren(n);
      const isExpanded = has && params.expanded.has(n.id);
      params.out.push({
        node: n,
        level: params.level,
        parentId: params.parentId,
        hasChildren: has,
        isExpanded,
        isSelected: params.selected === n.id,
        isDisabled: Boolean(n.disabled),
      });
      if (has && isExpanded) {
        flatten(n.children ?? [], {
          ...params,
          level: params.level + 1,
          parentId: n.id,
        });
      }
    }
  }

  let flat = $derived.by(() => {
    const out: FlatNode[] = [];
    const expanded = new Set(expandedState.value);
    flatten(nodes, {
      level: 0,
      parentId: null,
      expanded,
      selected: selectedState.value,
      out,
    });
    return out;
  });

  let parentById = $derived.by(() => {
    const m = new Map<string, string | null>();
    for (const item of flat) m.set(item.node.id, item.parentId);
    return m;
  });

  let activeId = $state<string | null>(null);

  const itemEls = new Map<string, HTMLElement>();

  function itemRef(node: HTMLElement, params: { id: string }) {
    itemEls.set(params.id, node);
    return {
      update(next: { id: string }) {
        if (next.id === params.id) return;
        itemEls.delete(params.id);
        itemEls.set(next.id, node);
        params = next;
      },
      destroy() {
        itemEls.delete(params.id);
      },
    };
  }

  function focusItem(id: string) {
    const el = itemEls.get(id);
    el?.focus();
  }

  function visibleIndexOf(id: string | null) {
    if (!id) return -1;
    return flat.findIndex((f) => f.node.id === id);
  }

  function setActive(id: string) {
    activeId = id;
  }

  $effect(() => {
    const visibleIds = new Set(flat.map((f) => f.node.id));
    const preferred = selectedState.value;

    if (preferred && visibleIds.has(preferred)) {
      activeId = preferred;
      return;
    }

    if (activeId && visibleIds.has(activeId)) return;
    activeId = flat[0]?.node.id ?? null;
  });

  function moveActive(delta: number) {
    const currentIndex = visibleIndexOf(activeId);
    if (currentIndex < 0) return;
    const nextIndex = Math.min(flat.length - 1, Math.max(0, currentIndex + delta));
    const nextId = flat[nextIndex]?.node.id;
    if (!nextId) return;
    setActive(nextId);
    focusItem(nextId);
  }

  function activateCurrent() {
    const currentIndex = visibleIndexOf(activeId);
    const item = currentIndex >= 0 ? flat[currentIndex] : null;
    if (!item) return;
    if (item.isDisabled) return;
    selectNode(item.node);
  }

  function expandCurrent() {
    const currentIndex = visibleIndexOf(activeId);
    const item = currentIndex >= 0 ? flat[currentIndex] : null;
    if (!item) return;
    if (!item.hasChildren) return;
    if (item.isExpanded) {
      // 이미 펼쳐져 있으면 첫 자식으로 이동
      const next = flat[currentIndex + 1];
      if (next && next.parentId === item.node.id) {
        setActive(next.node.id);
        focusItem(next.node.id);
      }
      return;
    }
    toggleExpanded(item.node.id);
  }

  function collapseOrParent() {
    const currentIndex = visibleIndexOf(activeId);
    const item = currentIndex >= 0 ? flat[currentIndex] : null;
    if (!item) return;
    if (item.hasChildren && item.isExpanded) {
      toggleExpanded(item.node.id);
      return;
    }
    const parentId = parentById.get(item.node.id);
    if (parentId) {
      setActive(parentId);
      focusItem(parentId);
    }
  }

  function onTreeKeyDown(e: KeyboardEvent) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        moveActive(1);
        break;
      case "ArrowUp":
        e.preventDefault();
        moveActive(-1);
        break;
      case "Home":
        e.preventDefault();
        if (flat[0]?.node.id) {
          setActive(flat[0].node.id);
          focusItem(flat[0].node.id);
        }
        break;
      case "End":
        e.preventDefault();
        if (flat[flat.length - 1]?.node.id) {
          const id = flat[flat.length - 1].node.id;
          setActive(id);
          focusItem(id);
        }
        break;
      case "ArrowRight":
        e.preventDefault();
        expandCurrent();
        break;
      case "ArrowLeft":
        e.preventDefault();
        collapseOrParent();
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        activateCurrent();
        break;
    }
  }
</script>

<nav
  {...rest}
  class={["ds-tree", className].filter(Boolean).join(" ")}
  aria-label={label}
  id={treeId}
>
  <div role="tree" aria-label={label} onkeydown={onTreeKeyDown}>
    {#each nodes as node (node.id)}
      <TreeViewNode
        {treeId}
        {node}
        level={0}
        parentId={null}
        {activeId}
        setActive={setActive}
        selectedId={selectedState.value}
        expandedIds={expandedState.value}
        {showToggle}
        {showIcons}
        toggleExpanded={toggleExpanded}
        selectNode={selectNode}
        {renderNode}
        itemRef={itemRef}
      />
    {/each}
  </div>
</nav>
