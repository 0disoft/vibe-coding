<script lang="ts">
  import { DsCard, DsSeparator } from "$lib/components/design-system";
</script>

<section id="ds-separator" class="space-y-4">
  <h2 class="text-h2 font-semibold">Separator</h2>
  <DsCard class="space-y-4">
    <div class="space-y-2">
      <p class="text-label text-muted-foreground">Horizontal</p>
      <DsSeparator class="my-3" />
    </div>
    <div class="space-y-2">
      <p class="text-label text-muted-foreground">Vertical</p>
      <div class="flex items-center gap-4">
        <span class="text-body-secondary text-muted-foreground">Left</span>
        <div class="h-10">
          <DsSeparator orientation="vertical" class="h-full" />
        </div>
        <span class="text-body-secondary text-muted-foreground">Right</span>
      </div>
    </div>
  </DsCard>
</section>

