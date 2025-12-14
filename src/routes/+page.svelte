<script lang="ts">
  import TypographyPageBasics from '$lib/components/typography/TypographyPageBasics.svelte';
  import TypographyPageInline from '$lib/components/typography/TypographyPageInline.svelte';
  import TypographyPageUi from '$lib/components/typography/TypographyPageUi.svelte';
  import { onMount } from 'svelte';

  // CSS 변수에서 폰트 크기 읽기 (Single Source of Truth)
  let fontSizes = $state<Record<string, string>>({});

  // CSS 변수명 → 표시용 라벨 매핑
  const cssVarMap: Record<string, string> = {
    // 본문용
    'text-body': '--fs-body-base',
    'text-body-secondary': '--fs-body-secondary-base',
    'text-comment': '--fs-comment-base',
    'text-code': '--fs-code-base',
    // 제목용
    'text-h1': '--fs-h1-base',
    'text-h2': '--fs-h2-base',
    'text-h3': '--fs-h3-base',
    'text-caption': '--fs-caption-base',
    // 메뉴/UI용
    'text-menu-lg': '--fs-menu-lg',
    'text-menu': '--fs-menu',
    'text-menu-sm': '--fs-menu-sm',
    'text-xs-resp': '--fs-xs-base',
    // 로고/브랜드용
    'text-logo': '--fs-logo-base',
    'text-brand': '--fs-brand-base',
    // 버튼용
    'text-btn': '--fs-btn-base',
    'text-btn-sm': '--fs-btn-sm-base',
    'text-btn-lg': '--fs-btn-lg-base',
    // 라벨/폼 요소용
    'text-label': '--fs-label-base',
    'text-helper': '--fs-helper-base',
    'text-placeholder': '--fs-placeholder-base',
    // 배지/태그용
    'text-badge': '--fs-badge-base',
    'text-tag': '--fs-tag-base',
    // 기타 UI
    'text-tooltip': '--fs-tooltip-base',
    'text-toast': '--fs-toast-base',
    'text-breadcrumb': '--fs-breadcrumb-base',
    // 인라인 코드/숫자/타임스탬프
    'text-inline-code': '--fs-inline-code-base',
    'text-stat': '--fs-stat-base',
    'text-price': '--fs-price-base',
    'text-timestamp': '--fs-timestamp-base',
    // UnoCSS 기본
    'text-xs': '--text-xs-fontSize',
  };

  onMount(() => {
    const styles = getComputedStyle(document.documentElement);
    const result: Record<string, string> = {};

    for (const [key, cssVar] of Object.entries(cssVarMap)) {
      result[key] = styles.getPropertyValue(cssVar).trim() || '?';
    }
    fontSizes = result;
  });

  // 폰트 크기 가져오기 헬퍼
  function fs(key: string): string {
    return fontSizes[key] || '...';
  }
</script>

<div class="container py-12">
  <h1 class="mb-8 text-center text-3xl font-bold">타이포그래피 유틸리티 테스트</h1>

  <TypographyPageBasics fs={fs} />
  <TypographyPageUi fs={fs} />
  <TypographyPageInline fs={fs} />
</div>

