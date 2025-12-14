<script lang="ts">
  import TypographyCard from '$lib/components/typography/TypographyCard.svelte';
  import TypographySection from '$lib/components/typography/TypographySection.svelte';

  interface Props {
    fs: (key: string) => string;
  }

  let { fs }: Props = $props();
</script>

<TypographySection title="인라인 코드/숫자/타임스탬프">
  <TypographyCard token="text-inline-code" size={fs('text-inline-code')} description="본문 내 인라인 코드">
    <p class="text-body">
      이 함수는 <code class="text-inline-code font-mono px-1 py-0.5 rounded bg-muted">useState()</code> 훅을 사용합니다.
    </p>
  </TypographyCard>

  <TypographyCard token="text-stat" size={fs('text-stat')} description="대시보드 KPI/통계 숫자">
    <div class="flex gap-8">
      <div class="text-center">
        <p class="text-stat font-bold text-primary">12,345</p>
        <p class="text-helper text-muted-foreground">총 사용자</p>
      </div>
      <div class="text-center">
        <p class="text-stat font-bold text-success">+28%</p>
        <p class="text-helper text-muted-foreground">성장률</p>
      </div>
    </div>
  </TypographyCard>

  <TypographyCard token="text-price" size={fs('text-price')} description="가격, 금액 표시">
    <div class="flex items-baseline gap-2">
      <span class="text-price font-bold">₩49,900</span>
      <span class="text-helper text-muted-foreground line-through">₩69,900</span>
      <span class="text-badge px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground">-29%</span>
    </div>
  </TypographyCard>

  <TypographyCard token="text-timestamp" size={fs('text-timestamp')} description="게시물 날짜, 시간 표시">
    <div class="flex items-center gap-4">
      <span class="text-timestamp text-muted-foreground">3분 전</span>
      <span class="text-timestamp text-muted-foreground">2024.12.11 18:55</span>
      <span class="text-timestamp text-muted-foreground">Dec 11, 2024</span>
    </div>
  </TypographyCard>
</TypographySection>

<section>
  <h2 class="mb-6 text-2xl font-semibold border-b border-border pb-2">UnoCSS 기본 (참고용)</h2>
  <p class="mb-4 text-sm text-muted-foreground">
    preset-wind4 기본 제공 유틸리티. 커스텀 유틸리티와 병행 사용 가능.
  </p>
  <div class="grid gap-4">
    <div class="flex items-baseline gap-4 p-4 rounded-lg bg-muted">
      <code class="text-xs text-muted-foreground w-32 shrink-0">text-xs ({fs('text-xs')})</code>
      <p class="text-xs">UnoCSS 기본 xs</p>
    </div>
    <div class="flex items-baseline gap-4 p-4 rounded-lg bg-muted">
      <code class="text-xs text-muted-foreground w-32 shrink-0">text-sm (0.875rem)</code>
      <p class="text-sm">UnoCSS 기본 sm</p>
    </div>
    <div class="flex items-baseline gap-4 p-4 rounded-lg bg-muted">
      <code class="text-xs text-muted-foreground w-32 shrink-0">text-base (1rem)</code>
      <p class="text-base">UnoCSS 기본 base</p>
    </div>
    <div class="flex items-baseline gap-4 p-4 rounded-lg bg-muted">
      <code class="text-xs text-muted-foreground w-32 shrink-0">text-lg (1.125rem)</code>
      <p class="text-lg">UnoCSS 기본 lg</p>
    </div>
  </div>
</section>

