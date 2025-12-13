<script lang="ts">
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

  <!-- 본문용 (4개) -->
  <section class="mb-12">
    <h2 class="mb-6 text-2xl font-semibold border-b border-border pb-2">본문용</h2>
    <div class="grid gap-4">
      <div class="p-4 rounded-lg bg-card">
        <div class="flex items-center gap-2 mb-2">
          <code class="text-helper text-muted-foreground">text-body</code>
          <span class="text-helper text-primary">{fs('text-body')}</span>
          <span class="text-helper text-muted-foreground">· 일반 본문, 기사 내용, 설명 문단</span>
        </div>
        <p class="text-body">다람쥐 헌 쳇바퀴에 타고파 The quick brown fox</p>
      </div>
      <div class="p-4 rounded-lg bg-card">
        <div class="flex items-center gap-2 mb-2">
          <code class="text-helper text-muted-foreground">text-body-secondary</code>
          <span class="text-helper text-primary">{fs('text-body-secondary')}</span>
          <span class="text-helper text-muted-foreground">· 부가 설명, 인용문, 사이드바 텍스트</span>
        </div>
        <p class="text-body-secondary">다람쥐 헌 쳇바퀴에 타고파 The quick brown fox</p>
      </div>
      <div class="p-4 rounded-lg bg-card">
        <div class="flex items-center gap-2 mb-2">
          <code class="text-helper text-muted-foreground">text-comment</code>
          <span class="text-helper text-primary">{fs('text-comment')}</span>
          <span class="text-helper text-muted-foreground">· 댓글, 리뷰, 사용자 피드백</span>
        </div>
        <p class="text-comment">다람쥐 헌 쳇바퀴에 타고파 The quick brown fox</p>
      </div>
      <div class="p-4 rounded-lg bg-card">
        <div class="flex items-center gap-2 mb-2">
          <code class="text-helper text-muted-foreground">text-code</code>
          <span class="text-helper text-primary">{fs('text-code')}</span>
          <span class="text-helper text-muted-foreground">· 코드 블록, 인라인 코드, 터미널 출력</span>
        </div>
        <p class="text-code font-mono">const hello = "world"; // 코드 전용</p>
      </div>
    </div>
  </section>

  <!-- 제목용 (4개) -->
  <section class="mb-12">
    <h2 class="mb-6 text-2xl font-semibold border-b border-border pb-2">제목용</h2>
    <div class="grid gap-4">
      <div class="p-4 rounded-lg bg-card">
        <div class="flex items-center gap-2 mb-2">
          <code class="text-helper text-muted-foreground">text-h1</code>
          <span class="text-helper text-primary">{fs('text-h1')}</span>
          <span class="text-helper text-muted-foreground">· 페이지 타이틀, 히어로 섹션 제목</span>
        </div>
        <p class="text-h1 font-bold">대제목 H1 Heading</p>
      </div>
      <div class="p-4 rounded-lg bg-card">
        <div class="flex items-center gap-2 mb-2">
          <code class="text-helper text-muted-foreground">text-h2</code>
          <span class="text-helper text-primary">{fs('text-h2')}</span>
          <span class="text-helper text-muted-foreground">· 섹션 제목, 카드 헤더</span>
        </div>
        <p class="text-h2 font-semibold">중제목 H2 Heading</p>
      </div>
      <div class="p-4 rounded-lg bg-card">
        <div class="flex items-center gap-2 mb-2">
          <code class="text-helper text-muted-foreground">text-h3</code>
          <span class="text-helper text-primary">{fs('text-h3')}</span>
          <span class="text-helper text-muted-foreground">· 서브섹션 제목, 모달 타이틀</span>
        </div>
        <p class="text-h3 font-semibold">소제목 H3 Heading</p>
      </div>
      <div class="p-4 rounded-lg bg-card">
        <div class="flex items-center gap-2 mb-2">
          <code class="text-helper text-muted-foreground">text-caption</code>
          <span class="text-helper text-primary">{fs('text-caption')}</span>
          <span class="text-helper text-muted-foreground">· 이미지 캡션, 표 주석, 출처 표기</span>
        </div>
        <p class="text-caption text-muted-foreground">캡션 텍스트 Caption Text</p>
      </div>
    </div>
  </section>

  <!-- 메뉴/UI용 (4개) -->
  <section class="mb-12">
    <h2 class="mb-6 text-2xl font-semibold border-b border-border pb-2">메뉴/UI용</h2>
    <div class="grid gap-4">
      <div class="p-4 rounded-lg bg-card">
        <div class="flex items-center gap-2 mb-2">
          <code class="text-helper text-muted-foreground">text-menu-lg</code>
          <span class="text-helper text-primary">{fs('text-menu-lg')}</span>
          <span class="text-helper text-muted-foreground">· 주요 네비게이션, 사이드바 메뉴</span>
        </div>
        <p class="text-menu-lg">메뉴 항목 (큰) Menu Item Large</p>
      </div>
      <div class="p-4 rounded-lg bg-card">
        <div class="flex items-center gap-2 mb-2">
          <code class="text-helper text-muted-foreground">text-menu</code>
          <span class="text-helper text-primary">{fs('text-menu')}</span>
          <span class="text-helper text-muted-foreground">· 드롭다운 메뉴, 컨텍스트 메뉴 항목</span>
        </div>
        <p class="text-menu">메뉴 항목 (일반) Menu Item Normal</p>
      </div>
      <div class="p-4 rounded-lg bg-card">
        <div class="flex items-center gap-2 mb-2">
          <code class="text-helper text-muted-foreground">text-menu-sm</code>
          <span class="text-helper text-primary">{fs('text-menu-sm')}</span>
          <span class="text-helper text-muted-foreground">· 서브메뉴, 필터/정렬 옵션</span>
        </div>
        <p class="text-menu-sm">메뉴 항목 (작은) Menu Item Small</p>
      </div>
      <div class="p-4 rounded-lg bg-card">
        <div class="flex items-center gap-2 mb-2">
          <code class="text-helper text-muted-foreground">text-xs-resp</code>
          <span class="text-helper text-primary">{fs('text-xs-resp')}</span>
          <span class="text-helper text-muted-foreground">· 푸터 링크, 뱃지, 타임스탬프</span>
        </div>
        <p class="text-xs-resp">초소형 텍스트 Extra Small Text</p>
      </div>
    </div>
  </section>

  <!-- 로고/브랜드용 (2개) -->
  <section class="mb-12">
    <h2 class="mb-6 text-2xl font-semibold border-b border-border pb-2">로고/브랜드용</h2>
    <div class="grid gap-4">
      <div class="p-4 rounded-lg bg-card">
        <div class="flex items-center gap-2 mb-2">
          <code class="text-helper text-muted-foreground">text-logo</code>
          <span class="text-helper text-primary">{fs('text-logo')}</span>
          <span class="text-helper text-muted-foreground">· 사이트 로고, 브랜드명</span>
        </div>
        <span class="text-logo font-bold">Vibe Coding</span>
      </div>
      <div class="p-4 rounded-lg bg-card">
        <div class="flex items-center gap-2 mb-2">
          <code class="text-helper text-muted-foreground">text-brand</code>
          <span class="text-helper text-primary">{fs('text-brand')}</span>
          <span class="text-helper text-muted-foreground">· 서브 브랜드, 앱 이름</span>
        </div>
        <span class="text-brand font-semibold">Vibe Studio</span>
      </div>
    </div>
  </section>

  <!-- 버튼용 (3개) -->
  <section class="mb-12">
    <h2 class="mb-6 text-2xl font-semibold border-b border-border pb-2">버튼용</h2>
    <div class="grid gap-4">
      <div class="p-4 rounded-lg bg-card">
        <div class="flex items-center gap-2 mb-2">
          <code class="text-helper text-muted-foreground">text-btn</code>
          <span class="text-helper text-primary">{fs('text-btn')}</span>
          <span class="text-helper text-muted-foreground">· 일반 버튼 텍스트</span>
        </div>
        <button type="button" class="text-btn px-4 py-2 rounded-md bg-primary text-primary-foreground"
          >버튼 Button</button
        >
      </div>
      <div class="p-4 rounded-lg bg-card">
        <div class="flex items-center gap-2 mb-2">
          <code class="text-helper text-muted-foreground">text-btn-sm</code>
          <span class="text-helper text-primary">{fs('text-btn-sm')}</span>
          <span class="text-helper text-muted-foreground">· 작은 버튼, 칩</span>
        </div>
        <button type="button" class="text-btn-sm px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground"
          >버튼 Small</button
        >
      </div>
      <div class="p-4 rounded-lg bg-card">
        <div class="flex items-center gap-2 mb-2">
          <code class="text-helper text-muted-foreground">text-btn-lg</code>
          <span class="text-helper text-primary">{fs('text-btn-lg')}</span>
          <span class="text-helper text-muted-foreground">· 큰 CTA 버튼</span>
        </div>
        <button type="button" class="text-btn-lg px-6 py-3 rounded-md bg-primary text-primary-foreground"
          >버튼 Large</button
        >
      </div>
    </div>
  </section>

  <!-- 라벨/폼 요소용 (3개) -->
  <section class="mb-12">
    <h2 class="mb-6 text-2xl font-semibold border-b border-border pb-2">라벨/폼 요소용</h2>
    <div class="grid gap-4">
      <div class="p-4 rounded-lg bg-card">
        <div class="flex items-center gap-2 mb-2">
          <code class="text-helper text-muted-foreground">text-label</code>
          <span class="text-helper text-primary">{fs('text-label')}</span>
          <span class="text-helper text-muted-foreground">· 폼 라벨, 필드명</span>
        </div>
        <span class="text-label font-medium">이메일 주소 Email Address</span>
      </div>
      <div class="p-4 rounded-lg bg-card">
        <div class="flex items-center gap-2 mb-2">
          <code class="text-helper text-muted-foreground">text-helper</code>
          <span class="text-helper text-primary">{fs('text-helper')}</span>
          <span class="text-helper text-muted-foreground">· 입력 필드 도움말, 에러 메시지</span>
        </div>
        <p class="text-helper text-muted-foreground">유효한 이메일 주소를 입력하세요</p>
      </div>
      <div class="p-4 rounded-lg bg-card">
        <div class="flex items-center gap-2 mb-2">
          <code class="text-helper text-muted-foreground">text-placeholder</code>
          <span class="text-helper text-primary">{fs('text-placeholder')}</span>
          <span class="text-helper text-muted-foreground">· 플레이스홀더 텍스트</span>
        </div>
        <p class="text-placeholder text-muted-foreground/60">example@email.com 형식</p>
      </div>
    </div>
  </section>

  <!-- 배지/태그용 (2개) -->
  <section class="mb-12">
    <h2 class="mb-6 text-2xl font-semibold border-b border-border pb-2">배지/태그용</h2>
    <div class="grid gap-4">
      <div class="p-4 rounded-lg bg-card">
        <div class="flex items-center gap-2 mb-2">
          <code class="text-helper text-muted-foreground">text-badge</code>
          <span class="text-helper text-primary">{fs('text-badge')}</span>
          <span class="text-helper text-muted-foreground">· 상태 배지, 알림 카운트</span>
        </div>
        <div class="flex gap-2">
          <span class="text-badge px-2 py-0.5 rounded-full bg-success text-success-foreground">성공</span>
          <span class="text-badge px-2 py-0.5 rounded-full bg-warning text-warning-foreground">대기중</span>
          <span class="text-badge px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground">실패</span>
        </div>
      </div>
      <div class="p-4 rounded-lg bg-card">
        <div class="flex items-center gap-2 mb-2">
          <code class="text-helper text-muted-foreground">text-tag</code>
          <span class="text-helper text-primary">{fs('text-tag')}</span>
          <span class="text-helper text-muted-foreground">· 해시태그, 카테고리 태그</span>
        </div>
        <div class="flex gap-2">
          <span class="text-tag px-2 py-1 rounded-md bg-accent text-accent-foreground">#SvelteKit</span>
          <span class="text-tag px-2 py-1 rounded-md bg-accent text-accent-foreground">#UnoCSS</span>
          <span class="text-tag px-2 py-1 rounded-md bg-accent text-accent-foreground">#TypeScript</span>
        </div>
      </div>
    </div>
  </section>

  <!-- 기타 UI (3개) -->
  <section class="mb-12">
    <h2 class="mb-6 text-2xl font-semibold border-b border-border pb-2">기타 UI</h2>
    <div class="grid gap-4">
      <div class="p-4 rounded-lg bg-card">
        <div class="flex items-center gap-2 mb-2">
          <code class="text-helper text-muted-foreground">text-tooltip</code>
          <span class="text-helper text-primary">{fs('text-tooltip')}</span>
          <span class="text-helper text-muted-foreground">· 툴팁 텍스트</span>
        </div>
        <div class="inline-block px-2 py-1 rounded bg-foreground text-background">
          <span class="text-tooltip">이것은 툴팁입니다 Tooltip text</span>
        </div>
      </div>
      <div class="p-4 rounded-lg bg-card">
        <div class="flex items-center gap-2 mb-2">
          <code class="text-helper text-muted-foreground">text-toast</code>
          <span class="text-helper text-primary">{fs('text-toast')}</span>
          <span class="text-helper text-muted-foreground">· 토스트/스낵바 메시지</span>
        </div>
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background">
          <span class="i-lucide-check h-4 w-4"></span>
          <span class="text-toast">저장되었습니다 Saved successfully</span>
        </div>
      </div>
      <div class="p-4 rounded-lg bg-card">
        <div class="flex items-center gap-2 mb-2">
          <code class="text-helper text-muted-foreground">text-breadcrumb</code>
          <span class="text-helper text-primary">{fs('text-breadcrumb')}</span>
          <span class="text-helper text-muted-foreground">· 브레드크럼 네비게이션</span>
        </div>
        <nav class="text-breadcrumb text-muted-foreground">
          홈 / 제품 / 카테고리 / <span class="text-foreground">현재 페이지</span>
        </nav>
      </div>
    </div>
  </section>

  <!-- 인라인 코드/숫자/타임스탬프 (4개) -->
  <section class="mb-12">
    <h2 class="mb-6 text-2xl font-semibold border-b border-border pb-2">인라인 코드/숫자/타임스탬프</h2>
    <div class="grid gap-4">
      <div class="p-4 rounded-lg bg-card">
        <div class="flex items-center gap-2 mb-2">
          <code class="text-helper text-muted-foreground">text-inline-code</code>
          <span class="text-helper text-primary">{fs('text-inline-code')}</span>
          <span class="text-helper text-muted-foreground">· 본문 내 인라인 코드</span>
        </div>
        <p class="text-body">
          이 함수는 <code class="text-inline-code font-mono px-1 py-0.5 rounded bg-muted">useState()</code> 훅을 사용합니다.
        </p>
      </div>
      <div class="p-4 rounded-lg bg-card">
        <div class="flex items-center gap-2 mb-2">
          <code class="text-helper text-muted-foreground">text-stat</code>
          <span class="text-helper text-primary">{fs('text-stat')}</span>
          <span class="text-helper text-muted-foreground">· 대시보드 KPI/통계 숫자</span>
        </div>
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
      </div>
      <div class="p-4 rounded-lg bg-card">
        <div class="flex items-center gap-2 mb-2">
          <code class="text-helper text-muted-foreground">text-price</code>
          <span class="text-helper text-primary">{fs('text-price')}</span>
          <span class="text-helper text-muted-foreground">· 가격, 금액 표시</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-price font-bold">₩49,900</span>
          <span class="text-helper text-muted-foreground line-through">₩69,900</span>
          <span class="text-badge px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground">-29%</span>
        </div>
      </div>
      <div class="p-4 rounded-lg bg-card">
        <div class="flex items-center gap-2 mb-2">
          <code class="text-helper text-muted-foreground">text-timestamp</code>
          <span class="text-helper text-primary">{fs('text-timestamp')}</span>
          <span class="text-helper text-muted-foreground">· 게시물 날짜, 시간 표시</span>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-timestamp text-muted-foreground">3분 전</span>
          <span class="text-timestamp text-muted-foreground">2024.12.11 18:55</span>
          <span class="text-timestamp text-muted-foreground">Dec 11, 2024</span>
        </div>
      </div>
    </div>
  </section>

  <!-- UnoCSS 기본 유틸리티 비교 -->
  <section>
    <h2 class="mb-6 text-2xl font-semibold border-b border-border pb-2">UnoCSS 기본 (참고용)</h2>
    <p class="mb-4 text-sm text-muted-foreground">preset-wind4 기본 제공 유틸리티. 커스텀 유틸리티와 병행 사용 가능.</p>
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
</div>
