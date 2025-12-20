<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  import { tick } from "svelte";

  import { createControllableState } from "$lib/shared/utils/controllable-state.svelte";

  import DsPopover from "./Popover.svelte";
  import DsIcon from "./Icon.svelte";

  export type ContextMenuItem = {
    id: string;
    label: string;
    icon?: string;
    shortcut?: string;
    disabled?: boolean;
    onSelect?: () => void;
  };

  type TriggerProps = {
    id: string;
    "aria-controls": string;
    "aria-haspopup": "menu";
    "aria-expanded": boolean;
    disabled: boolean;
    onclick: () => void;
    onkeydown: (e: KeyboardEvent) => void;
    ref: (node: HTMLElement) => void;
  };

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    items?: ContextMenuItem[];
    open?: boolean;
    onOpenChange?: (next: boolean) => void;
    disabled?: boolean;
    label?: string;
    /** 패널 정렬(마우스 우클릭 위치 기반은 v2에서) */
    align?: "start" | "center" | "end";
    /** 패널 오프셋(px) */
    offset?: number;
    trigger?: Snippet<[TriggerProps]>;
    children?: Snippet<[{ close: () => void }]>;
  }

  let {
    items = [],
    open,
    onOpenChange,
    disabled = false,
    label = "Context menu",
    align = "start",
    offset = 8,
    trigger: triggerContent,
    children: menuContent,
    class: className = "",
    ...rest
  }: Props = $props();

  let rootEl = $state<HTMLDivElement | null>(null);
  let itemsEl = $state<HTMLDivElement | null>(null);
  let triggerEl = $state<HTMLElement | null>(null);
  let anchorPos = $state<{ x: number; y: number } | null>(null);

  const triggerId = $props.id();
  const panelId = `${triggerId}-panel`;

  let openState = createControllableState({
    value: () => open,
    onChange: (next) => onOpenChange?.(next),
    defaultValue: false,
  });

  let isOpen = $derived(openState.value);
  let anchorStyle = $derived.by(() => {
    const pos = anchorPos ?? { x: -9999, y: -9999 };
    return `position: fixed; left: ${pos.x}px; top: ${pos.y}px; width: 0; height: 0;`;
  });

  function setOpen(next: boolean) {
    openState.value = next;
  }

  function openMenu() {
    if (disabled) return;
    setOpen(true);
    tick().then(() => focusFirstItem());
  }

  function closeMenu() {
    setOpen(false);
  }

  function focusFirstItem() {
    const root = rootEl;
    if (!root) return;
    const first = root.querySelector<HTMLElement>('[data-ds-context-item="true"]:not([aria-disabled="true"])');
    first?.focus();
  }

  function focusNext(dir: -1 | 1) {
    const list = itemsEl;
    if (!list) return;
    const nodes = Array.from(
      list.querySelectorAll<HTMLElement>('[data-ds-context-item="true"]:not([aria-disabled="true"])'),
    );
    if (nodes.length === 0) return;
    const active = document.activeElement as HTMLElement | null;
    const idx = nodes.findIndex((n) => n === active);
    const nextIdx = idx === -1 ? 0 : (idx + dir + nodes.length) % nodes.length;
    nodes[nextIdx]?.focus();
  }

  function onPanelKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusNext(1);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      focusNext(-1);
      return;
    }
    if (e.key === "Home") {
      e.preventDefault();
      focusFirstItem();
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      closeMenu();
    }
  }

  function handleTriggerContextMenu(e: MouseEvent) {
    if (disabled) return;
    e.preventDefault();
    anchorPos = { x: e.clientX, y: e.clientY };
    openMenu();
  }

  function handleTriggerClick(original: () => void) {
    if (disabled) return;
    if (triggerEl) {
      const rect = triggerEl.getBoundingClientRect();
      anchorPos = { x: rect.left, y: rect.bottom };
    } else if (rootEl) {
      const rect = rootEl.getBoundingClientRect();
      anchorPos = { x: rect.left, y: rect.bottom };
    }
    original();
  }

  function handleTriggerKeyDown(e: KeyboardEvent, original: (e: KeyboardEvent) => void) {
    if (disabled) return original(e);
    if (e.key === "ContextMenu" || (e.shiftKey && e.key === "F10")) {
      e.preventDefault();
      if (triggerEl) {
        const rect = triggerEl.getBoundingClientRect();
        anchorPos = { x: rect.left, y: rect.bottom };
      } else if (rootEl) {
        const rect = rootEl.getBoundingClientRect();
        anchorPos = { x: rect.left, y: rect.bottom };
      }
      openMenu();
      return;
    }
    original(e);
  }

  function captureTriggerRef(node: HTMLElement) {
    triggerEl = node;
  }

  function triggerAction(node: HTMLElement) {
    captureTriggerRef(node);

    return {
      destroy() {
        if (triggerEl === node) triggerEl = null;
      },
    };
  }

  function anchorAction(node: HTMLElement, refFn: (node: HTMLElement) => void) {
    refFn(node);
    return {
      destroy() {},
    };
  }

  $effect(() => {
    if (isOpen && !anchorPos) {
      if (triggerEl) {
        const rect = triggerEl.getBoundingClientRect();
        anchorPos = { x: rect.left, y: rect.bottom };
      } else if (rootEl) {
        const rect = rootEl.getBoundingClientRect();
        anchorPos = { x: rect.left, y: rect.bottom };
      }
    }
  });
</script>

<div
  {...rest}
  class={["ds-context-menu", className].filter(Boolean).join(" ")}
  bind:this={rootEl}
  oncontextmenu={handleTriggerContextMenu}
>
  <DsPopover
    open={isOpen}
    onOpenChange={(next) => setOpen(next)}
    disabled={disabled}
    side="bottom"
    {align}
    {offset}
    label={label}
    panelClass="ds-context-menu-panel"
    initialFocus='[data-ds-context-item="true"]:not([aria-disabled="true"])'
    returnFocusTo={triggerEl}
  >
    {#snippet trigger(props)}
      <span
        aria-hidden="true"
        class="ds-context-menu-anchor"
        style={anchorStyle}
        use:anchorAction={props.ref}
      ></span>
      {#if triggerContent}
        {@render triggerContent({
          id: props.id,
          "aria-controls": props["aria-controls"],
          "aria-haspopup": "menu",
          "aria-expanded": props["aria-expanded"],
          disabled,
          onclick: () => handleTriggerClick(props.onclick),
          onkeydown: (e) => handleTriggerKeyDown(e, props.onkeydown),
          ref: (node) => captureTriggerRef(node),
        })}
      {:else}
        <button
          type="button"
          id={props.id}
          aria-controls={props["aria-controls"]}
          aria-haspopup="menu"
          aria-expanded={props["aria-expanded"]}
          use:triggerAction
          class="ds-context-menu-trigger ds-focus-ring"
          disabled={disabled}
          onclick={() => handleTriggerClick(props.onclick)}
          onkeydown={(e) => handleTriggerKeyDown(e, props.onkeydown)}
        >
          Open
        </button>
      {/if}
    {/snippet}

    {#snippet children({ close })}
      {#if menuContent}
        {@render menuContent({ close })}
      {:else}
        <div
          class="ds-context-menu-items"
          bind:this={itemsEl}
          role="menu"
        >
          {#each items as item (item.id)}
            <button
              type="button"
              class="ds-context-menu-item ds-focus-ring"
              role="menuitem"
              aria-disabled={item.disabled || undefined}
              tabindex="-1"
              data-ds-context-item="true"
              onkeydown={onPanelKeyDown}
              onclick={() => {
                if (item.disabled) return;
                item.onSelect?.();
                close();
              }}
            >
              <span class="ds-context-menu-item-leading">
                {#if item.icon}
                  <DsIcon name={item.icon} size="sm" />
                {/if}
                <span class="ds-context-menu-item-label truncate">{item.label}</span>
              </span>

              {#if item.shortcut}
                <span class="ds-context-menu-item-shortcut">{item.shortcut}</span>
              {/if}
            </button>
          {/each}
        </div>
      {/if}
    {/snippet}
  </DsPopover>
</div>
