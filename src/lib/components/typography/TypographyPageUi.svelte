<script lang="ts">
  import TypographyCard from '$lib/components/typography/TypographyCard.svelte';
  import TypographySection from '$lib/components/typography/TypographySection.svelte';

  interface Props {
    fs: (key: string) => string;
  }

  let { fs }: Props = $props();
</script>

<TypographySection title="메뉴/UI용">
  <TypographyCard token="text-menu-lg" size={fs('text-menu-lg')} description="주요 네비게이션, 사이드바 메뉴">
    <p class="text-menu-lg">메뉴 항목 (큰) Menu Item Large</p>
  </TypographyCard>

  <TypographyCard token="text-menu" size={fs('text-menu')} description="드롭다운 메뉴, 컨텍스트 메뉴 항목">
    <p class="text-menu">메뉴 항목 (일반) Menu Item Normal</p>
  </TypographyCard>

  <TypographyCard token="text-menu-sm" size={fs('text-menu-sm')} description="서브메뉴, 필터/정렬 옵션">
    <p class="text-menu-sm">메뉴 항목 (작은) Menu Item Small</p>
  </TypographyCard>

  <TypographyCard token="text-xs-resp" size={fs('text-xs-resp')} description="푸터 링크, 뱃지, 타임스탬프">
    <p class="text-xs-resp">초소형 텍스트 Extra Small Text</p>
  </TypographyCard>
</TypographySection>

<TypographySection title="로고/브랜드용">
  <TypographyCard token="text-logo" size={fs('text-logo')} description="사이트 로고, 브랜드명">
    <span class="text-logo font-bold">Vibe Coding</span>
  </TypographyCard>

  <TypographyCard token="text-brand" size={fs('text-brand')} description="서브 브랜드, 앱 이름">
    <span class="text-brand font-semibold">Vibe Studio</span>
  </TypographyCard>
</TypographySection>

<TypographySection title="버튼용">
  <TypographyCard token="text-btn" size={fs('text-btn')} description="일반 버튼 텍스트">
    <button type="button" class="text-btn px-4 py-2 rounded-md bg-primary text-primary-foreground">
      버튼 Button
    </button>
  </TypographyCard>

  <TypographyCard token="text-btn-sm" size={fs('text-btn-sm')} description="작은 버튼, 칩">
    <button type="button" class="text-btn-sm px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground">
      버튼 Small
    </button>
  </TypographyCard>

  <TypographyCard token="text-btn-lg" size={fs('text-btn-lg')} description="큰 CTA 버튼">
    <button type="button" class="text-btn-lg px-6 py-3 rounded-md bg-primary text-primary-foreground">
      버튼 Large
    </button>
  </TypographyCard>
</TypographySection>

<TypographySection title="라벨/폼 요소용">
  <TypographyCard token="text-label" size={fs('text-label')} description="폼 라벨, 필드명">
    <span class="text-label font-medium">이메일 주소 Email Address</span>
  </TypographyCard>

  <TypographyCard token="text-helper" size={fs('text-helper')} description="입력 필드 도움말, 에러 메시지">
    <p class="text-helper text-muted-foreground">유효한 이메일 주소를 입력하세요</p>
  </TypographyCard>

  <TypographyCard token="text-placeholder" size={fs('text-placeholder')} description="플레이스홀더 텍스트">
    <p class="text-placeholder text-muted-foreground/60">example@email.com 형식</p>
  </TypographyCard>
</TypographySection>

<TypographySection title="배지/태그용">
  <TypographyCard token="text-badge" size={fs('text-badge')} description="상태 배지, 알림 카운트">
    <div class="flex gap-2">
      <span class="text-badge px-2 py-0.5 rounded-full bg-success text-success-foreground">성공</span>
      <span class="text-badge px-2 py-0.5 rounded-full bg-warning text-warning-foreground">대기중</span>
      <span class="text-badge px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground">실패</span>
    </div>
  </TypographyCard>

  <TypographyCard token="text-tag" size={fs('text-tag')} description="해시태그, 카테고리 태그">
    <div class="flex gap-2">
      <span class="text-tag px-2 py-1 rounded-md bg-accent text-accent-foreground">#SvelteKit</span>
      <span class="text-tag px-2 py-1 rounded-md bg-accent text-accent-foreground">#UnoCSS</span>
      <span class="text-tag px-2 py-1 rounded-md bg-accent text-accent-foreground">#TypeScript</span>
    </div>
  </TypographyCard>
</TypographySection>

<TypographySection title="기타 UI">
  <TypographyCard token="text-tooltip" size={fs('text-tooltip')} description="툴팁 텍스트">
    <div class="inline-block px-2 py-1 rounded bg-foreground text-background">
      <span class="text-tooltip">이것은 툴팁입니다 Tooltip text</span>
    </div>
  </TypographyCard>

  <TypographyCard token="text-toast" size={fs('text-toast')} description="토스트/스낵바 메시지">
    <div class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background">
      <span class="i-lucide-check h-4 w-4"></span>
      <span class="text-toast">저장되었습니다 Saved successfully</span>
    </div>
  </TypographyCard>

  <TypographyCard token="text-breadcrumb" size={fs('text-breadcrumb')} description="브레드크럼 네비게이션">
    <nav class="text-breadcrumb text-muted-foreground">
      홈 / 제품 / 카테고리 / <span class="text-foreground">현재 페이지</span>
    </nav>
  </TypographyCard>
</TypographySection>

