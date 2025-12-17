<script lang="ts">
  import {
    DsCard,
    DsEditorInlineControls,
    DsEditorToolbar,
    DsField,
    DsInput,
    DsTextarea,
  } from "$lib/components/design-system";

  import type { EditorBlockType, EditorCommand } from "$lib/components/design-system/EditorToolbar.svelte";

  let blockType = $state<EditorBlockType>("paragraph");
  let active = $state<Partial<Record<EditorCommand, boolean>>>({
    bold: false,
    italic: false,
    link: false,
    bulletList: false,
    orderedList: false,
    codeBlock: false,
  });

  let linkValue = $state("https://example.com");
  let contentValue = $state(
    "텍스트를 드래그 선택하면 InlineControls가 뜹니다.\n\nBold/Italic/Link는 인라인 컨트롤로도 제공됩니다.",
  );

  let inlineOpen = $state(false);
  let anchorRect = $state<{
    left: number;
    top: number;
    width: number;
    height: number;
    bottom: number;
  } | null>(null);

  function toggle(cmd: EditorCommand) {
    active = { ...active, [cmd]: !active[cmd] };
  }

  function onCommand(cmd: EditorCommand) {
    if (cmd === "link") {
      // 데모: 링크 토글만
      toggle(cmd);
      return;
    }
    toggle(cmd);
  }

  function onInline(cmd: "bold" | "italic" | "link") {
    toggle(cmd);
  }

  function updateFromSelection() {
    const sel = window.getSelection?.();
    if (!sel || sel.rangeCount === 0) {
      inlineOpen = false;
      anchorRect = null;
      return;
    }
    const range = sel.getRangeAt(0);
    if (sel.isCollapsed) {
      inlineOpen = false;
      anchorRect = null;
      return;
    }
    const rect = range.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) {
      inlineOpen = false;
      anchorRect = null;
      return;
    }
    inlineOpen = true;
    anchorRect = {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      bottom: rect.bottom,
    };
  }

  $effect(() => {
    if (typeof window === "undefined") return;
    const handler = () => updateFromSelection();
    document.addEventListener("selectionchange", handler);
    window.addEventListener("scroll", handler, { passive: true });
    window.addEventListener("resize", handler);

    return () => {
      document.removeEventListener("selectionchange", handler);
      window.removeEventListener("scroll", handler);
      window.removeEventListener("resize", handler);
    };
  });

  let editorLabel = $derived.by(() => {
    if (blockType === "h2") return "Heading 2";
    if (blockType === "h3") return "Heading 3";
    return "Text";
  });
</script>

<section id="ds-editor" class="space-y-4">
  <h2 class="text-h2 font-semibold">Editor</h2>
  <DsCard class="space-y-4">
    <div class="space-y-2">
      <div class="text-label text-muted-foreground">EditorToolbar / InlineControls</div>
      <div class="rounded-lg border border-border bg-background p-3 space-y-3">
        <DsEditorToolbar
          blockType={blockType}
          onBlockTypeChange={(next) => (blockType = next)}
          active={active}
          onCommand={onCommand}
        />

        <div class="rounded-md border border-border bg-surface p-3 relative">
          <div class="text-helper text-muted-foreground mb-2">
            현재 블록 타입: {editorLabel} / link: {active.link ? "on" : "off"}
          </div>
          <DsTextarea
            rows={6}
            value={contentValue}
            oninput={(e) => (contentValue = (e.currentTarget as HTMLTextAreaElement).value)}
          />

          <DsEditorInlineControls
            open={inlineOpen}
            anchorRect={anchorRect}
            active={{ bold: active.bold, italic: active.italic, link: active.link }}
            onCommand={onInline}
          />
        </div>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <DsField label="Link (demo)" helpText="링크 커맨드는 보통 URL 입력 다이얼로그/Popover로 연결합니다.">
        {#snippet children(control)}
          <DsInput
            {...control}
            placeholder="https://..."
            bind:value={linkValue}
          />
        {/snippet}
      </DsField>
      <div class="rounded-md border border-border bg-surface p-3">
        <div class="text-label text-muted-foreground">상태</div>
        <div class="mt-2 text-helper text-muted-foreground">
          active: {JSON.stringify(active)}
        </div>
      </div>
    </div>
  </DsCard>
</section>

