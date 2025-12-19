<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { fade } from "svelte/transition";

  import DsIconButton from "./IconButton.svelte";

  export type EditorInlineCommand = "bold" | "italic" | "link";

  export type InlineAnchorRect = Pick<
    DOMRectReadOnly,
    "left" | "top" | "width" | "height"
  > & {
    bottom: number;
  };

  type ActiveState = Partial<Record<EditorInlineCommand, boolean>>;
  type DisabledState = Partial<Record<EditorInlineCommand, boolean>>;

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    open?: boolean;
    anchorRect?: InlineAnchorRect | null;
    placement?: "top" | "bottom";
    offset?: number;
    active?: ActiveState;
    disabled?: DisabledState;
    onCommand?: (cmd: EditorInlineCommand) => void;
    labels?: Partial<Record<EditorInlineCommand, string>>;
  }

  let {
    open = false,
    anchorRect = null,
    placement = "top",
    offset = 8,
    active = {},
    disabled = {},
    onCommand,
    labels = {},
    class: className = "",
    style = "",
    ...rest
  }: Props = $props();

  const commands = [
    { id: "bold", icon: "bold", label: "Bold" },
    { id: "italic", icon: "italic", label: "Italic" },
    { id: "link", icon: "link", label: "Link" },
  ] as const satisfies ReadonlyArray<{
    id: EditorInlineCommand;
    icon: string;
    label: string;
  }>;

  function cmdLabel(cmd: EditorInlineCommand) {
    return (
      labels[cmd] ??
      ({
        bold: "Bold",
        italic: "Italic",
        link: "Link",
      } satisfies Record<EditorInlineCommand, string>)[cmd]
    );
  }

  let computedStyle = $derived.by(() => {
    if (!open || !anchorRect) return "display: none;";
    const centerX = anchorRect.left + anchorRect.width / 2;
    const y =
      placement === "top"
        ? anchorRect.top - offset
        : anchorRect.bottom + offset;
    const translateY = placement === "top" ? "-100%" : "0";

    return [
      "position: fixed",
      `left: ${centerX}px`,
      `top: ${y}px`,
      "transform: translate(-50%, " + translateY + ")",
      "z-index: 50",
      style,
    ]
      .map((s) => (s ?? "").trim())
      .filter(Boolean)
      .join("; ");
  });

  function handleMouseDown(e: MouseEvent) {
    e.preventDefault();
  }
</script>

{#if open && anchorRect}
  <div
    {...rest}
    class={["ds-editor-inline", className].filter(Boolean).join(" ")}
    style={computedStyle}
    role="toolbar"
    aria-label="Inline formatting"
    transition:fade={{ duration: 150 }}
    onmousedown={handleMouseDown}
  >
    {#each commands as cmd (cmd.id)}
      <DsIconButton
        icon={cmd.icon}
        label={cmdLabel(cmd.id)}
        size="sm"
        variant="ghost"
        intent="neutral"
        pressed={Boolean(active?.[cmd.id])}
        disabled={Boolean(disabled?.[cmd.id])}
        onclick={() => onCommand?.(cmd.id)}
      />
    {/each}
  </div>
{/if}
