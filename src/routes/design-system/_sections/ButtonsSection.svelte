<script lang="ts">
  import {
    DsBadge,
    DsButton,
    DsCard,
    DsIcon,
    DsIconButton,
    DsInlineIcon,
  } from "$lib/components/design-system";
</script>

<section id="ds-buttons" class="space-y-4">
  <h2 class="text-h2 font-semibold">Buttons</h2>
  <DsCard class="space-y-6">
    <div class="flex flex-wrap gap-2">
      <DsButton intent="primary">Primary</DsButton>
      <DsButton intent="secondary" variant="outline">Secondary</DsButton>
      <DsButton intent="success" variant="solid">Success</DsButton>
      <DsButton intent="warning" variant="solid">Warning</DsButton>
      <DsButton intent="danger" variant="solid">Danger</DsButton>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <DsIconButton icon="settings" label="Settings" />
      <DsIconButton icon="user" label="User" intent="success" />
      <DsIconButton icon="triangle-alert" label="Warning" intent="warning" />
      <DsBadge intent="primary" variant="soft">Badge</DsBadge>
      <DsBadge intent="success" variant="outline">Verified</DsBadge>
    </div>

    <div class="space-y-2">
      <div class="text-label text-muted-foreground">Icon / InlineIcon</div>
      <div class="flex flex-wrap items-center gap-3">
        <DsIcon name="sparkles" size="sm" />
        <DsIcon name="sparkles" size="md" />
        <DsIcon name="sparkles" size="lg" />
        <DsIcon name="sparkles" size="xl" />
        <DsIcon name="shield-check" size="md" label="Security" />
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <DsInlineIcon name="sparkles">
          {#snippet children()}Inline start{/snippet}
        </DsInlineIcon>
        <DsInlineIcon name="arrow-right" side="end">
          {#snippet children()}Inline end{/snippet}
        </DsInlineIcon>
        <DsInlineIcon name="info" label="Info" />
      </div>
    </div>
  </DsCard>
</section>

