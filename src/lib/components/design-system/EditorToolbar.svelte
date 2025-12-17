<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  import DsIconButton from "./IconButton.svelte";
  import DsSelect from "./Select.svelte";

  export type EditorBlockType = "paragraph" | "h2" | "h3";
  export type EditorCommand =
    | "bold"
    | "italic"
    | "link"
    | "bulletList"
    | "orderedList"
    | "codeBlock";

  type ActiveState = Partial<Record<EditorCommand, boolean>>;
  type DisabledState = Partial<Record<EditorCommand, boolean>>;

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    /** 블록 타입 (controlled) */
    blockType?: EditorBlockType;
    onBlockTypeChange?: (next: EditorBlockType) => void;
    defaultBlockType?: EditorBlockType;

    /** 버튼 active/disabled 상태 */
    active?: ActiveState;
    disabled?: DisabledState;

    /** 버튼 클릭 시 호출 */
    onCommand?: (cmd: EditorCommand) => void;

    blockLabel?: string;
    labels?: Partial<Record<EditorCommand, string>>;
  }

  let {
    blockType,
    onBlockTypeChange,
    defaultBlockType = "paragraph",
    active = {},
    disabled = {},
    onCommand,
    blockLabel = "Block type",
    labels = {},
    class: className = "",
    ...rest
  }: Props = $props();

  let internalBlock = $state<EditorBlockType>(defaultBlockType);
  let currentBlock = $derived((blockType ?? internalBlock) as EditorBlockType);
  let selectValue = $state<EditorBlockType>(currentBlock);

  function setBlock(next: EditorBlockType) {
    if (blockType === undefined) internalBlock = next;
    onBlockTypeChange?.(next);
  }

  $effect(() => {
    if (selectValue !== currentBlock) selectValue = currentBlock;
  });

  $effect(() => {
    if (selectValue === currentBlock) return;
    setBlock(selectValue);
  });

  const blockOptions = [
    { value: "paragraph", label: "Text" },
    { value: "h2", label: "Heading 2" },
    { value: "h3", label: "Heading 3" },
  ] as const;

  function cmdLabel(cmd: EditorCommand) {
    return (
      labels[cmd] ??
      ({
        bold: "Bold",
        italic: "Italic",
        link: "Link",
        bulletList: "Bulleted list",
        orderedList: "Numbered list",
        codeBlock: "Code block",
      } satisfies Record<EditorCommand, string>)[cmd]
    );
  }

  function isPressed(cmd: EditorCommand) {
    return Boolean(active?.[cmd]);
  }

  function isDisabled(cmd: EditorCommand) {
    return Boolean(disabled?.[cmd]);
  }
</script>

<div {...rest} class={["ds-editor-toolbar", className].filter(Boolean).join(" ")}>
  <div class="ds-editor-toolbar-left">
    <div class="ds-editor-toolbar-block">
      <span class="sr-only">{blockLabel}</span>
      <DsSelect
        options={blockOptions.map((o) => ({ value: o.value, label: o.label }))}
        bind:value={selectValue}
      />
    </div>

    <div class="ds-editor-toolbar-buttons" role="toolbar" aria-label="Editor toolbar">
      <DsIconButton
        icon="bold"
        label={cmdLabel("bold")}
        size="sm"
        variant="ghost"
        intent="neutral"
        pressed={isPressed("bold")}
        disabled={isDisabled("bold")}
        onclick={() => onCommand?.("bold")}
      />
      <DsIconButton
        icon="italic"
        label={cmdLabel("italic")}
        size="sm"
        variant="ghost"
        intent="neutral"
        pressed={isPressed("italic")}
        disabled={isDisabled("italic")}
        onclick={() => onCommand?.("italic")}
      />
      <DsIconButton
        icon="link"
        label={cmdLabel("link")}
        size="sm"
        variant="ghost"
        intent="neutral"
        pressed={isPressed("link")}
        disabled={isDisabled("link")}
        onclick={() => onCommand?.("link")}
      />
      <DsIconButton
        icon="list"
        label={cmdLabel("bulletList")}
        size="sm"
        variant="ghost"
        intent="neutral"
        pressed={isPressed("bulletList")}
        disabled={isDisabled("bulletList")}
        onclick={() => onCommand?.("bulletList")}
      />
      <DsIconButton
        icon="list-ordered"
        label={cmdLabel("orderedList")}
        size="sm"
        variant="ghost"
        intent="neutral"
        pressed={isPressed("orderedList")}
        disabled={isDisabled("orderedList")}
        onclick={() => onCommand?.("orderedList")}
      />
      <DsIconButton
        icon="code"
        label={cmdLabel("codeBlock")}
        size="sm"
        variant="ghost"
        intent="neutral"
        pressed={isPressed("codeBlock")}
        disabled={isDisabled("codeBlock")}
        onclick={() => onCommand?.("codeBlock")}
      />
    </div>
  </div>
</div>
