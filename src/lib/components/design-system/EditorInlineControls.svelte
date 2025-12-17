<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

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
</script>

<div
  {...rest}
  class={["ds-editor-inline", className].filter(Boolean).join(" ")}
  style={computedStyle}
  role="toolbar"
  aria-label="Inline formatting"
>
  <DsIconButton
    icon="bold"
    label={cmdLabel("bold")}
    size="sm"
    variant="ghost"
    intent="neutral"
    pressed={Boolean(active?.bold)}
    disabled={Boolean(disabled?.bold)}
    onclick={() => onCommand?.("bold")}
  />
  <DsIconButton
    icon="italic"
    label={cmdLabel("italic")}
    size="sm"
    variant="ghost"
    intent="neutral"
    pressed={Boolean(active?.italic)}
    disabled={Boolean(disabled?.italic)}
    onclick={() => onCommand?.("italic")}
  />
  <DsIconButton
    icon="link"
    label={cmdLabel("link")}
    size="sm"
    variant="ghost"
    intent="neutral"
    pressed={Boolean(active?.link)}
    disabled={Boolean(disabled?.link)}
    onclick={() => onCommand?.("link")}
  />
</div>
