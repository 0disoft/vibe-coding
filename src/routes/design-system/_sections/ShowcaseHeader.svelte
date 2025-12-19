<script lang="ts">
  import { DsButton, DsCommandPalette, DsDialog, DsDrawer, DsSheet } from "$lib/components/design-system";

  import { toast } from "$lib/stores/toast.svelte";

  let dialogOpen = $state(false);
  let sheetOpen = $state(false);
  let drawerOpen = $state(false);
  let commandOpen = $state(false);

  function runToastPromiseDemo() {
    const p = new Promise<string>((resolve) => {
      setTimeout(() => resolve("done"), 1200);
    });

    toast.promise(p, {
      key: "ds-demo-promise",
      loading: "Loading…",
      success: (value) => ({ title: "Success", options: { message: `result: ${value}` } }),
      error: () => ({ title: "Error", options: { message: "failed" } }),
    });
  }
</script>

<header class="space-y-2">
  <p class="text-label text-muted-foreground">Design System</p>
  <h1 class="text-h1 font-semibold">쇼케이스 (임시)</h1>
  <p class="text-body-secondary text-muted-foreground">
    템플릿 확장 중인 DS/Docs 컴포넌트를 한 페이지에서 검증합니다.
  </p>
  <div class="flex flex-wrap gap-2">
    <DsButton onclick={() => toast.success("성공", "토스트가 표시되어야 합니다.")}>Toast</DsButton>
    <DsButton variant="outline" intent="secondary" onclick={runToastPromiseDemo}>Toast.promise</DsButton>
    <DsButton variant="outline" intent="secondary" onclick={() => (dialogOpen = true)}>Dialog</DsButton>
    <DsButton variant="outline" intent="secondary" onclick={() => (commandOpen = true)}>Command</DsButton>
    <DsButton variant="outline" intent="secondary" onclick={() => (sheetOpen = true)}>Sheet</DsButton>
    <DsButton variant="outline" intent="secondary" onclick={() => (drawerOpen = true)}>Drawer</DsButton>
  </div>
</header>

<DsDialog
  id="ds-dialog"
  title="Dialog"
  description="DsDialog 동작 확인"
  bind:open={dialogOpen}
>
  <p class="text-body-secondary text-muted-foreground">ESC/외부 클릭/포커스 복귀 등을 확인합니다.</p>
</DsDialog>

<DsSheet
  id="ds-sheet"
  title="Sheet"
  description="오른쪽에서 슬라이드되는 패널"
  open={sheetOpen}
  onOpenChange={(next) => (sheetOpen = next)}
  side="right"
  size="md"
>
  <p class="text-body-secondary text-muted-foreground">모바일/대시보드 설정 패널에 사용합니다.</p>
</DsSheet>

<DsDrawer
  id="ds-drawer"
  title="Drawer"
  description="아래에서 올라오는 패널"
  open={drawerOpen}
  onOpenChange={(next) => (drawerOpen = next)}
  size="md"
>
  <p class="text-body-secondary text-muted-foreground">모바일 네비/필터 패널에 사용합니다.</p>
</DsDrawer>

<DsCommandPalette
  bind:open={commandOpen}
  title="Command"
  items={[
    { id: "docs", label: "Go to Docs", description: "문서로 이동", shortcut: "Ctrl+K" },
    { id: "settings", label: "Open Settings", description: "설정 열기", shortcut: "Ctrl+," },
    { id: "logout", label: "Logout", description: "로그아웃", disabled: true },
  ]}
  onSelect={(id) => toast.info("Command", id)}
/>
