<script lang="ts">
  import type { ToastIntent, ToastItem } from "$lib/stores/toast.svelte";

  import {
    DsAlert,
    DsAvatar,
    DsBanner,
    DsButton,
    DsCard,
    DsContextMenu,
    DsDropdown,
    DsDropdownItem,
    DsField,
    DsIconButton,
    DsInlineAlert,
    DsNotificationCenter,
    DsSelect,
    DsSpinner,
    DsToastRegion,
  } from "$lib/components/design-system";

  type ToastDemoPosition =
    | "top-left"
    | "top-right"
    | "top-center"
    | "bottom-left"
    | "bottom-right"
    | "bottom-center";

  const toastDemoPositions = [
    "top-left",
    "top-right",
    "top-center",
    "bottom-left",
    "bottom-right",
    "bottom-center",
  ] as const satisfies ReadonlyArray<ToastDemoPosition>;

  let toastDemoPosition = $state<ToastDemoPosition>("top-center");
  let toastDemoToasts = $state<ToastItem[]>([]);

  function addToastDemo(intent: ToastIntent) {
    const id = crypto.randomUUID();
    const now = Date.now();
    toastDemoToasts = [
      ...toastDemoToasts.slice(-4),
      {
        id,
        intent,
        title: `Demo: ${intent}`,
        message: "이 토스트는 /design-system 데모용(로컬)입니다.",
        duration: Infinity,
        createdAt: now,
      },
    ];
  }

  function dismissToastDemo(id: string) {
    toastDemoToasts = toastDemoToasts.filter((t) => t.id !== id);
  }

  let inlineAlertMessage = $state("비밀번호는 12자 이상을 권장합니다.");

  type DemoNotification = {
    id: string;
    title: string;
    message?: string;
    meta?: string;
    intent?: "neutral" | "success" | "warning" | "error";
    read?: boolean;
    disabled?: boolean;
  };

  let notifications = $state<DemoNotification[]>([
    {
      id: "n1",
      title: "Welcome",
      message: "알림 센터 컴포넌트가 추가되었습니다.",
      meta: "2m ago",
      intent: "success",
      read: false,
    },
    {
      id: "n2",
      title: "Security",
      message: "2FA를 활성화하면 더 안전합니다.",
      meta: "1h ago",
      intent: "warning",
      read: false,
    },
    {
      id: "n3",
      title: "Billing",
      message: "결제 수단이 업데이트되었습니다.",
      meta: "yesterday",
      intent: "neutral",
      read: true,
    },
  ]);

  function markRead(id: string) {
    notifications = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
  }

  function dismissNotification(id: string) {
    notifications = notifications.filter((n) => n.id !== id);
  }

  function markAllRead() {
    notifications = notifications.map((n) => ({ ...n, read: true }));
  }
</script>

<section id="ds-feedback" class="space-y-4">
  <h2 class="text-h2 font-semibold">Feedback</h2>
  <DsCard class="space-y-6">
    <div class="space-y-2">
      <div class="text-label text-muted-foreground">Banner</div>
      <DsBanner
        intent="warning"
        title="유지보수 안내"
        description="오늘 23:00 ~ 23:30 사이 일부 기능이 불안정할 수 있습니다."
        dismissKey="ds-demo-banner-maintenance"
        dismissLabel="배너 닫기"
      />
    </div>

    <div class="space-y-2">
      <div class="text-label text-muted-foreground">InlineAlert</div>
      <div class="grid gap-3 md:grid-cols-2">
        <div class="space-y-2">
          <DsInlineAlert intent="neutral" message={inlineAlertMessage} />
          <div class="text-helper text-muted-foreground">
            필드 바로 아래에 붙이는 인라인 메시지(힌트/경고/에러) 용도입니다.
          </div>
          <div class="flex gap-2">
            <DsButton size="sm" variant="outline" intent="secondary" onclick={() => (inlineAlertMessage = "비밀번호는 12자 이상을 권장합니다.")}>
              Hint
            </DsButton>
            <DsButton size="sm" variant="outline" intent="secondary" onclick={() => (inlineAlertMessage = "숫자/특수문자를 포함하면 더 안전합니다.")}>
              Tip
            </DsButton>
          </div>
        </div>
        <div class="grid gap-2">
          <DsInlineAlert intent="success" message="사용 가능한 이메일입니다." />
          <DsInlineAlert intent="warning" message="결제 수단을 다시 확인해주세요." />
          <DsInlineAlert intent="danger" message="로그인 정보를 확인해주세요." />
        </div>
      </div>
    </div>

    <div class="space-y-2">
      <div class="text-label text-muted-foreground">NotificationCenter</div>
      <DsNotificationCenter
        items={notifications}
        onOpen={(id) => {
          markRead(id);
        }}
        onMarkRead={markRead}
        onDismiss={dismissNotification}
        onMarkAllRead={markAllRead}
      />
    </div>

    <div class="grid gap-3 md:grid-cols-2">
      <DsAlert intent="neutral" title="Notice" description="정보성 안내" />
      <DsAlert intent="warning" title="Warning" description="주의가 필요합니다" />
      <DsAlert intent="success" title="Success" description="성공했습니다" />
      <DsAlert intent="danger" title="Error" description="문제가 발생했습니다" />
    </div>
    <div class="flex items-center gap-3">
      <DsSpinner label="Loading" />
      <DsAvatar name="Test User" />
      <DsAvatar name="Jane Doe" src="https://invalid.example/avatar.png" />
      <DsDropdown align="end" menuClass="w-56" itemSelector='[role="menuitem"]'>
        {#snippet trigger(props)}
          <DsIconButton {...props} icon="ellipsis" label="More" />
        {/snippet}
        {#snippet children({ close })}
          <DsDropdownItem onclick={() => close()}>Action</DsDropdownItem>
          <DsDropdownItem intent="destructive" onclick={() => close()}>Delete</DsDropdownItem>
        {/snippet}
      </DsDropdown>

      <DsContextMenu
        align="end"
        items={[
          { id: "copy", label: "Copy", icon: "copy", shortcut: "Ctrl+C" },
          { id: "duplicate", label: "Duplicate", icon: "copy-plus", shortcut: "Ctrl+D" },
          { id: "delete", label: "Delete", icon: "trash-2", shortcut: "Del" },
        ]}
      >
        {#snippet trigger(props)}
          <DsIconButton {...props} icon="mouse-pointer-click" label="Context menu" />
        {/snippet}
      </DsContextMenu>
    </div>

    <div class="space-y-3">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div class="space-y-1">
          <div class="text-label text-muted-foreground">ToastRegion (local demo)</div>
          <div class="text-helper text-muted-foreground">
            기본 Toast 버튼은 레이아웃의 전역 리전을 사용합니다. 아래는 이 페이지 전용 리전입니다.
          </div>
        </div>
        <div class="w-56">
          <DsField label="Position" helpText="리전 위치">
            {#snippet children(control)}
              <DsSelect
                id={control.id}
                describedBy={control["aria-describedby"]}
                options={toastDemoPositions.map((p) => ({ value: p, label: p }))}
                bind:value={toastDemoPosition}
              />
            {/snippet}
          </DsField>
        </div>
      </div>

      <div class="flex flex-wrap gap-2">
        <DsButton size="sm" variant="outline" intent="secondary" onclick={() => addToastDemo("neutral")}>
          Add neutral
        </DsButton>
        <DsButton size="sm" intent="success" onclick={() => addToastDemo("success")}>Add success</DsButton>
        <DsButton size="sm" intent="warning" onclick={() => addToastDemo("warning")}>Add warning</DsButton>
        <DsButton size="sm" intent="danger" onclick={() => addToastDemo("error")}>Add error</DsButton>
        <DsButton
          size="sm"
          variant="outline"
          intent="secondary"
          disabled={toastDemoToasts.length === 0}
          onclick={() => (toastDemoToasts = [])}
        >
          Clear
        </DsButton>
      </div>

      <DsToastRegion toasts={toastDemoToasts} onDismiss={dismissToastDemo} position={toastDemoPosition} />
    </div>
  </DsCard>
</section>
