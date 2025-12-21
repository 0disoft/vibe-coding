<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  import * as m from "$lib/paraglide/messages.js";
  import { DsButton, DsDialog } from "$lib/components/design-system";

  import type { ButtonVariant, Intent } from "./types";

  type Size = "sm" | "md" | "lg";
  type CloseReason = "confirm" | "cancel" | undefined;

  interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    id: string;
    title: string;
    description?: string;
    open?: boolean;
    onOpenChange?: (next: boolean) => void;
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmIntent?: Intent;
    cancelIntent?: Intent;
    confirmVariant?: ButtonVariant;
    cancelVariant?: ButtonVariant;
    confirmDisabled?: boolean;
    confirmLoading?: boolean;
    confirmLoadingLabel?: string;
    size?: Size;
    closeOnOutsideClick?: boolean;
    closeOnEscape?: boolean;
    initialFocus?: string | HTMLElement | null;
    returnFocusTo?: HTMLElement | null;
    closeLabel?: string;
    dialogRole?: "dialog" | "alertdialog";
    content?: Snippet;
    children?: Snippet;
    actions?: Snippet;
  }

  let {
    id,
    title,
    description,
    open = $bindable(false),
    onOpenChange,
    onConfirm,
    onCancel,
    confirmLabel = m.ds_confirm(),
    cancelLabel = m.ds_cancel(),
    confirmIntent = "danger",
    cancelIntent = "secondary",
    confirmVariant = "solid",
    cancelVariant = "outline",
    confirmDisabled = false,
    confirmLoading = false,
    confirmLoadingLabel = m.ds_processing(),
    size = "sm",
    closeOnOutsideClick = false,
    closeOnEscape = true,
    initialFocus,
    returnFocusTo = null,
    closeLabel = m.ds_dialog_close(),
    dialogRole = "alertdialog",
    content,
    children,
    actions,
    class: className = "",
    ...rest
  }: Props = $props();

  let cancelButtonRef = $state<HTMLButtonElement | null>(null);

  let resolvedInitialFocus = $derived.by(() => {
    if (initialFocus !== undefined) return initialFocus;
    return confirmIntent === "danger" ? cancelButtonRef : null;
  });

  let bodyContent = $derived(children ?? content);

  function setOpen(next: boolean, reason?: CloseReason) {
    if (open === next) return;
    open = next;
    onOpenChange?.(next);
    if (!next && reason !== "confirm") onCancel?.();
  }

  function handleOpenChange(next: boolean) {
    setOpen(next, next ? undefined : "cancel");
  }

  function handleConfirm() {
    onConfirm?.();
    setOpen(false, "confirm");
  }

  function handleCancel() {
    setOpen(false, "cancel");
  }
</script>

<DsDialog
  {...rest}
  {id}
  {title}
  {description}
  {open}
  size={size}
  closeOnOutsideClick={closeOnOutsideClick}
  closeOnEscape={closeOnEscape}
  onOpenChange={handleOpenChange}
  role={dialogRole}
  initialFocus={resolvedInitialFocus}
  returnFocusTo={returnFocusTo}
  closeLabel={closeLabel}
  class={className}
>
  {#snippet children()}
    {#if bodyContent}
      <div class="ds-confirm-dialog-body">
        {@render bodyContent()}
      </div>
    {/if}
  {/snippet}

  {#snippet footer()}
    {#if actions}
      {@render actions()}
    {:else}
      <div class="ds-confirm-dialog-actions">
        <DsButton
          variant={cancelVariant}
          intent={cancelIntent}
          onclick={handleCancel}
          ref={cancelButtonRef}
        >
          {cancelLabel}
        </DsButton>
        <DsButton
          variant={confirmVariant}
          intent={confirmIntent}
          loading={confirmLoading}
          loadingLabel={confirmLoadingLabel}
          disabled={confirmDisabled}
          onclick={handleConfirm}
        >
          {confirmLabel}
        </DsButton>
      </div>
    {/if}
  {/snippet}
</DsDialog>
