<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';

  import { DsButton } from '$lib/components/design-system';

  type Item = {
    id: string;
    label: string;
    disabled?: boolean;
  };

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
    label: string;
    items: Item[];
    onSelect?: (id: string) => void;
    open?: boolean;
    onOpenChange?: (next: boolean) => void;
    children?: Snippet;
  }

  let {
    label,
    items,
    onSelect,
    open,
    onOpenChange,
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  let rootEl = $state<HTMLDivElement | null>(null);
  let buttonEl = $state<HTMLButtonElement | null>(null);
  let internalOpen = $state(false);

  let isControlled = $derived(open !== undefined);
  let isOpen = $derived(isControlled ? (open as boolean) : internalOpen);

  let triggerId = $derived(
    `ds-dropdown-trigger-${(globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`).toString()}`
  );
  let menuId = $derived(`${triggerId}-menu`);

  function setOpen(next: boolean): void {
    if (!isControlled) internalOpen = next;
    onOpenChange?.(next);
  }

  function toggle(): void {
    setOpen(!isOpen);
  }

  function close(options?: { focusButton?: boolean }): void {
    setOpen(false);
    if (options?.focusButton) queueMicrotask(() => buttonEl?.focus());
  }

  function focusFirstItem(): void {
    const root = rootEl;
    if (!root) return;
    const itemsEls = Array.from(root.querySelectorAll<HTMLElement>('[data-ds-dropdown-item="true"]'));
    const first = itemsEls.find((el) => !el.hasAttribute('data-disabled'));
    first?.focus();
  }

  function focusLastItem(): void {
    const root = rootEl;
    if (!root) return;
    const itemsEls = Array.from(root.querySelectorAll<HTMLElement>('[data-ds-dropdown-item="true"]'));
    const enabled = itemsEls.filter((el) => !el.hasAttribute('data-disabled'));
    enabled.at(-1)?.focus();
  }

  function focusNext(current: HTMLElement, dir: 1 | -1): void {
    const root = rootEl;
    if (!root) return;
    const itemsEls = Array.from(root.querySelectorAll<HTMLElement>('[data-ds-dropdown-item="true"]'));
    const enabled = itemsEls.filter((el) => !el.hasAttribute('data-disabled'));
    const idx = enabled.indexOf(current);
    if (idx === -1) return;
    const next = enabled[(idx + dir + enabled.length) % enabled.length];
    next?.focus();
  }

  function onTriggerKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }

    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isOpen) setOpen(true);
      queueMicrotask(focusFirstItem);
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) setOpen(true);
      queueMicrotask(focusLastItem);
    }
  }

  function onMenuKeyDown(e: KeyboardEvent): void {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      close({ focusButton: true });
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusNext(target, 1);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusNext(target, -1);
      return;
    }

    if (e.key === 'Home') {
      e.preventDefault();
      focusFirstItem();
      return;
    }

    if (e.key === 'End') {
      e.preventDefault();
      focusLastItem();
      return;
    }
  }

  function onRootFocusOut(e: FocusEvent): void {
    const root = rootEl;
    if (!root) return;
    if (!isOpen) return;

    const next = e.relatedTarget;
    if (!(next instanceof Node)) {
      close();
      return;
    }

    if (root.contains(next)) return;
    close();
  }

  function onDocumentPointerDown(e: PointerEvent): void {
    const root = rootEl;
    if (!root) return;
    if (!isOpen) return;
    if (root.contains(e.target as Node)) return;
    close();
  }

  $effect(() => {
    document.addEventListener('pointerdown', onDocumentPointerDown, { capture: true });
    return () => document.removeEventListener('pointerdown', onDocumentPointerDown, true);
  });
</script>

<div {...rest} bind:this={rootEl} class={`ds-dropdown ${className}`.trim()} onfocusout={onRootFocusOut}>
  <DsButton
    bind:ref={buttonEl}
    type="button"
    intent="secondary"
    variant="outline"
    id={triggerId}
    aria-controls={menuId}
    aria-haspopup="menu"
    aria-expanded={isOpen}
    onclick={toggle}
    onkeydown={onTriggerKeyDown}
  >
    {label}
  </DsButton>

  {#if isOpen}
    <div
      id={menuId}
      class="ds-dropdown-menu ds-elevation-2"
      role="menu"
      aria-labelledby={triggerId}
      tabindex="-1"
    >
      {#if children}
        {@render children()}
      {:else}
        {#each items as item (item.id)}
          <button
            type="button"
            class="ds-dropdown-item ds-focus-ring"
            role="menuitem"
            data-ds-dropdown-item="true"
            data-disabled={item.disabled ? 'true' : undefined}
            disabled={item.disabled}
            onclick={() => {
              if (item.disabled) return;
              onSelect?.(item.id);
              close();
            }}
            onkeydown={onMenuKeyDown}
          >
            {item.label}
          </button>
        {/each}
      {/if}
    </div>
  {/if}
</div>

