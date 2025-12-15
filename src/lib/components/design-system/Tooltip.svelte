<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';

  type TriggerProps = {
    describedBy?: string;
    onpointerover: (e: PointerEvent) => void;
    onpointerout: (e: PointerEvent) => void;
    onfocus: () => void;
    onblur: () => void;
    onfocusin: () => void;
    onfocusout: () => void;
    onkeydown: (e: KeyboardEvent) => void;
  };

  interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
    content?: string;
    disabled?: boolean;
    open?: boolean;
    onOpenChange?: (next: boolean) => void;
    delayMs?: number;
    closeDelayMs?: number;
    placement?: 'top' | 'bottom';
    children?: Snippet<[TriggerProps]>;
    tooltip?: Snippet;
  }

  let {
    content,
    disabled = false,
    open,
    onOpenChange,
    delayMs = 500,
    closeDelayMs = 100,
    placement = 'top',
    class: className = '',
    children,
    tooltip,
    ...rest
  }: Props = $props();

  let internalOpen = $state(false);
  let isControlled = $derived(open !== undefined);
  let isOpen = $derived(isControlled ? (open as boolean) : internalOpen);

  let tooltipId = $derived(
    `ds-tooltip-${(globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`).toString()}`
  );

  let openTimer = $state<number | null>(null);
  let closeTimer = $state<number | null>(null);

  function clearTimers(): void {
    if (openTimer !== null) window.clearTimeout(openTimer);
    if (closeTimer !== null) window.clearTimeout(closeTimer);
    openTimer = null;
    closeTimer = null;
  }

  function setOpen(next: boolean): void {
    if (!isControlled) internalOpen = next;
    onOpenChange?.(next);
  }

  function scheduleOpen(ms: number): void {
    clearTimers();
    openTimer = window.setTimeout(() => setOpen(true), Math.max(0, ms));
  }

  function scheduleClose(ms: number): void {
    clearTimers();
    closeTimer = window.setTimeout(() => setOpen(false), Math.max(0, ms));
  }

  function onPointerOver(e: PointerEvent): void {
    if (disabled) return;
    if (e.pointerType === 'touch') return;
    if (e.relatedTarget instanceof Node && e.currentTarget instanceof Node && e.currentTarget.contains(e.relatedTarget)) return;
    scheduleOpen(delayMs);
  }

  function onPointerOut(e: PointerEvent): void {
    if (disabled) return;
    if (e.relatedTarget instanceof Node && e.currentTarget instanceof Node && e.currentTarget.contains(e.relatedTarget)) return;
    scheduleClose(closeDelayMs);
  }

  function onMouseOver(e: MouseEvent): void {
    if (disabled) return;
    if (e.relatedTarget instanceof Node && e.currentTarget instanceof Node && e.currentTarget.contains(e.relatedTarget)) return;
    scheduleOpen(delayMs);
  }

  function onMouseOut(e: MouseEvent): void {
    if (disabled) return;
    if (e.relatedTarget instanceof Node && e.currentTarget instanceof Node && e.currentTarget.contains(e.relatedTarget)) return;
    scheduleClose(closeDelayMs);
  }

  function onFocusIn(): void {
    if (disabled) return;
    scheduleOpen(0);
  }

  function onFocusOut(): void {
    if (disabled) return;
    scheduleClose(0);
  }

  function onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      e.preventDefault();
      clearTimers();
      setOpen(false);
    }
  }

  let triggerProps = $derived<TriggerProps>({
    describedBy: isOpen ? tooltipId : undefined,
    onpointerover: onPointerOver,
    onpointerout: onPointerOut,
    onfocus: onFocusIn,
    onblur: onFocusOut,
    onfocusin: onFocusIn,
    onfocusout: onFocusOut,
    onkeydown: onKeyDown
  });
</script>

<span
  {...rest}
  class={`ds-tooltip-root ${className}`.trim()}
  onfocusin={onFocusIn}
  onfocusout={onFocusOut}
  onkeydown={onKeyDown}
  onmouseover={onMouseOver}
  onmouseout={onMouseOut}
  onpointerover={onPointerOver}
  onpointerout={onPointerOut}
>
  {#if children}
    {@render children(triggerProps)}
  {/if}

  {#if isOpen && !disabled && (tooltip || content)}
    <span class="ds-tooltip ds-elevation-2" role="tooltip" id={tooltipId} data-placement={placement}>
      {#if tooltip}
        {@render tooltip()}
      {:else}
        {content}
      {/if}
    </span>
  {/if}
</span>
