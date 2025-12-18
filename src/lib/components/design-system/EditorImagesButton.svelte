<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  import DsButton from "./Button.svelte";
  import DsIconButton from "./IconButton.svelte";
  import DsMediaPicker from "./MediaPicker.svelte";
  import DsPopover from "./Popover.svelte";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    disabled?: boolean;
    pressed?: boolean;

    label?: string;
    accept?: string;
    multiple?: boolean;
    maxFiles?: number;
    maxSizeBytes?: number;
    insertLabel?: string;
    cancelLabel?: string;

    onInsert?: (files: File[]) => void;
  }

  let {
    disabled = false,
    pressed = false,
    label = "Insert images",
    accept = "image/*",
    multiple = true,
    maxFiles = 10,
    maxSizeBytes,
    insertLabel = "Insert",
    cancelLabel = "Cancel",
    onInsert,
    class: className = "",
    ...rest
  }: Props = $props();

  let open = $state(false);
  let files = $state<File[]>([]);

  function insert() {
    if (!files.length) return;
    onInsert?.(files);
    files = [];
    open = false;
  }
</script>

<div {...rest} class={["inline-flex", className].filter(Boolean).join(" ")}>
  <DsPopover
    open={open}
    onOpenChange={(next) => {
      open = next;
      if (!next) files = [];
    }}
    side="bottom"
    align="start"
    label={label}
    panelClass="w-[min(520px,92vw)] p-3"
  >
    {#snippet trigger(props)}
      <DsIconButton
        {...props}
        icon="image"
        label={label}
        size="sm"
        variant="ghost"
        intent="neutral"
        pressed={pressed || open}
        disabled={disabled}
        onclick={() => (open = !open)}
      />
    {/snippet}

    {#snippet children({ close })}
      <div class="grid gap-3">
        <DsMediaPicker
          files={files}
          onFilesChange={(next) => (files = next)}
          {accept}
          {multiple}
          {maxFiles}
          {maxSizeBytes}
          {disabled}
        />

        <div class="flex items-center justify-end gap-2">
          <DsButton
            size="sm"
            variant="outline"
            intent="secondary"
            {disabled}
            onclick={() => {
              files = [];
              close({ focusButton: true });
            }}
          >
            {cancelLabel}
          </DsButton>
          <DsButton
            size="sm"
            intent="primary"
            disabled={disabled || !files.length}
            onclick={() => {
              insert();
              close({ focusButton: true });
            }}
          >
            {insertLabel}
          </DsButton>
        </div>
      </div>
    {/snippet}
  </DsPopover>
</div>

