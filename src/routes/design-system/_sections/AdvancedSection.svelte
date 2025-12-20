<script lang="ts">
  import {
    DsCard,
    DsCarousel,
    DsPricingTable,
    DsRating,
    DsSteps,
    DsTimeline,
    DsWizard,
  } from "$lib/components/design-system";

  import { toast } from "$lib/stores/toast.svelte";

  let rating = $state(4);
  let stepsCurrentId = $state<string | null>("start");

  const flowSteps = [
    { id: "start", title: "Start", description: "기본 설정" },
    { id: "profile", title: "Profile", description: "프로필 작성" },
    { id: "verify", title: "Verify", description: "이메일 인증" },
    { id: "done", title: "Done", description: "완료" },
  ] as const;

  const carouselItems = [
    { id: "t1", title: "Template A", description: "랜딩 페이지 템플릿" },
    { id: "t2", title: "Template B", description: "대시보드/앱 템플릿" },
    { id: "t3", title: "Template C", description: "포트폴리오/갤러리 템플릿" },
  ];
</script>

<section id="ds-advanced" class="space-y-4">
  <h2 class="text-h2 font-semibold">Advanced</h2>
  <DsCard class="space-y-6">
    <div class="space-y-2">
      <div class="text-label text-muted-foreground">Carousel</div>
        <DsCarousel items={carouselItems}>
          {#snippet slide({ item })}
            <DsCard class="h-full">
              <div class="text-body font-semibold">{item.title ?? ""}</div>
              <div class="text-body-secondary text-muted-foreground">
                {item.description ?? ""}
              </div>
            </DsCard>
        {/snippet}
      </DsCarousel>
    </div>

    <div class="space-y-2">
      <div class="text-label text-muted-foreground">Steps</div>
      <DsSteps
        steps={flowSteps}
        bind:currentId={stepsCurrentId}
        allowNavigation
      />
      <div class="text-helper text-muted-foreground">current: {stepsCurrentId}</div>
    </div>

    <div class="space-y-2">
      <div class="text-label text-muted-foreground">Wizard</div>
      <DsWizard
        steps={flowSteps}
        defaultCurrentId="start"
        allowNavigation
        onFinish={() => toast.success("Wizard", "완료되었습니다.")}
      >
        {#snippet children(ctx)}
          <div class="rounded-md border border-border bg-background p-4">
            <div class="text-body font-semibold">
              {ctx.step?.title ?? "No step"}
            </div>
            {#if ctx.step?.description}
              <div class="text-body-secondary text-muted-foreground">
                {ctx.step.description}
              </div>
            {/if}
            <div class="mt-3 text-helper text-muted-foreground">
              {ctx.index + 1} / {ctx.total}
            </div>
          </div>
        {/snippet}
      </DsWizard>
    </div>

    <div class="space-y-2">
      <div class="text-label text-muted-foreground">Timeline</div>
      <DsTimeline
        items={[
          { title: "v0.1", date: "2025-01-01", description: "초기 릴리즈", status: "done" },
          { title: "v0.2", date: "2025-02-01", description: "대시보드 고도화", status: "in-progress" },
          { title: "v0.3", date: "2025-03-01", description: "문서/검색", status: "planned" },
        ]}
      />
    </div>

    <div class="space-y-2">
      <div class="text-label text-muted-foreground">Rating</div>
      <DsRating bind:value={rating} />
    </div>

    <div class="space-y-2">
      <div class="text-label text-muted-foreground">PricingTable</div>
      <DsPricingTable
        plans={[
          {
            id: "free",
            name: "Free",
            price: "$0",
            period: "/mo",
            description: "개인 테스트용",
            features: ["1 project", "Community support", "Basic analytics"],
            ctaLabel: "Start free",
          },
          {
            id: "pro",
            name: "Pro",
            price: "$29",
            period: "/mo",
            description: "개인/프로덕트 팀",
            highlighted: true,
            badge: "Most popular",
            features: ["Unlimited projects", "Email support", "Advanced analytics"],
            ctaLabel: "Go Pro",
          },
          {
            id: "team",
            name: "Team",
            price: "$99",
            period: "/mo",
            description: "조직/기업",
            features: ["SSO", "SLA", "Audit logs"],
            ctaLabel: "Contact sales",
          },
        ]}
        onSelect={(id) => toast.info("Pricing", `선택: ${id}`)}
      />
    </div>
  </DsCard>
</section>
