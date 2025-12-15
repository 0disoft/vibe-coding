<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';

  import { DsButton } from '$lib/components/lab/design-system';

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
  let internalOpen = $state(false);

  let isControlled = $derived(open !== undefined);
  let isOpen = $derived(isControlled ? (open as boolean) : internalOpen);

  function setOpen(next: boolean): void {
    if (!isControlled) internalOpen = next;
    onOpenChange?.(next);
  }

  function toggle(): void {
    setOpen(!isOpen);
  }

  function close(): void {
    setOpen(false);
  }

  function focusFirstItem(): void {
    const root = rootEl;
    if (!root) return;
    const itemsEls = Array.from(root.querySelectorAll<HTMLElement>('[data-ds-dropdown-item="true"]'));
    const first = itemsEls.find((el) => !el.hasAttribute('data-disabled'));
    first?.focus();
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
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isOpen) setOpen(true);
      queueMicrotask(focusFirstItem);
    }
  }

  function onMenuKeyDown(e: KeyboardEvent): void {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      close();
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

<div {...rest} bind:this={rootEl} class={`ds-dropdown ${className}`.trim()}>
  <DsButton
    type="button"
    intent="secondary"
    variant="outline"
    aria-haspopup="menu"
    aria-expanded={isOpen}
    onclick={toggle}
    onkeydown={onTriggerKeyDown}
  >
    {label}
  </DsButton>

  {#if isOpen}
    <div class="ds-dropdown-menu ds-elevation-2" role="menu" aria-label={label}>
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
