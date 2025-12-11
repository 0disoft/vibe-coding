<script lang="ts">
  // 타이포그래피 유틸리티 테스트 페이지
</script>

<div class="container py-12">
  <h1 class="mb-8 text-center text-3xl font-bold">타이포그래피 유틸리티 테스트</h1>

  <!-- 본문용 (4개) -->
  <section class="mb-12">
    <h2 class="mb-6 text-2xl font-semibold border-b border-border pb-2">본문용</h2>
    <div class="grid gap-4">
      <div class="p-4 rounded-lg bg-card">
        <div class="flex items-center gap-2 mb-2">
          <code class="text-xs text-muted-foreground">text-body</code>
          <span class="text-xs text-primary">1.1rem</span>
          <span class="text-xs text-muted-foreground">· 일반 본문, 기사 내용, 설명 문단</span>
        </div>
        <p class="text-body">다람쥐 헌 쳇바퀴에 타고파 The quick brown fox</p>
      </div>
      <div class="p-4 rounded-lg bg-card">
        <div class="flex items-center gap-2 mb-2">
          <code class="text-xs text-muted-foreground">text-body-secondary</code>
          <span class="text-xs text-primary">0.95rem</span>
          <span class="text-xs text-muted-foreground">· 부가 설명, 인용문, 사이드바 텍스트</span>
        </div>
        <p class="text-body-secondary">다람쥐 헌 쳇바퀴에 타고파 The quick brown fox</p>
      </div>
      <div class="p-4 rounded-lg bg-card">
        <div class="flex items-center gap-2 mb-2">
          <code class="text-xs text-muted-foreground">text-comment</code>
          <span class="text-xs text-primary">0.95rem</span>
          <span class="text-xs text-muted-foreground">· 댓글, 리뷰, 사용자 피드백</span>
        </div>
        <p class="text-comment">다람쥐 헌 쳇바퀴에 타고파 The quick brown fox</p>
      </div>
      <div class="p-4 rounded-lg bg-card">
        <div class="flex items-center gap-2 mb-2">
          <code class="text-xs text-muted-foreground">text-code</code>
          <span class="text-xs text-primary">0.8rem</span>
          <span class="text-xs text-muted-foreground">· 코드 블록, 인라인 코드, 터미널 출력</span>
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
          <code class="text-xs text-muted-foreground">text-h1</code>
          <span class="text-xs text-primary">2.0rem</span>
          <span class="text-xs text-muted-foreground">· 페이지 타이틀, 히어로 섹션 제목</span>
        </div>
        <p class="text-h1 font-bold">대제목 H1 Heading</p>
      </div>
      <div class="p-4 rounded-lg bg-card">
        <div class="flex items-center gap-2 mb-2">
          <code class="text-xs text-muted-foreground">text-h2</code>
          <span class="text-xs text-primary">1.7rem</span>
          <span class="text-xs text-muted-foreground">· 섹션 제목, 카드 헤더</span>
        </div>
        <p class="text-h2 font-semibold">중제목 H2 Heading</p>
      </div>
      <div class="p-4 rounded-lg bg-card">
        <div class="flex items-center gap-2 mb-2">
          <code class="text-xs text-muted-foreground">text-h3</code>
          <span class="text-xs text-primary">1.4rem</span>
          <span class="text-xs text-muted-foreground">· 서브섹션 제목, 모달 타이틀</span>
        </div>
        <p class="text-h3 font-semibold">소제목 H3 Heading</p>
      </div>
      <div class="p-4 rounded-lg bg-card">
        <div class="flex items-center gap-2 mb-2">
          <code class="text-xs text-muted-foreground">text-caption</code>
          <span class="text-xs text-primary">0.85rem</span>
          <span class="text-xs text-muted-foreground">· 이미지 캡션, 표 주석, 출처 표기</span>
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
          <code class="text-xs text-muted-foreground">text-menu-lg</code>
          <span class="text-xs text-primary">0.95rem</span>
          <span class="text-xs text-muted-foreground">· 주요 네비게이션, 사이드바 메뉴</span>
        </div>
        <p class="text-menu-lg">메뉴 항목 (큰) Menu Item Large</p>
      </div>
      <div class="p-4 rounded-lg bg-card">
        <div class="flex items-center gap-2 mb-2">
          <code class="text-xs text-muted-foreground">text-menu</code>
          <span class="text-xs text-primary">0.85rem</span>
          <span class="text-xs text-muted-foreground">· 드롭다운 메뉴, 컨텍스트 메뉴 항목</span>
        </div>
        <p class="text-menu">메뉴 항목 (일반) Menu Item Normal</p>
      </div>
      <div class="p-4 rounded-lg bg-card">
        <div class="flex items-center gap-2 mb-2">
          <code class="text-xs text-muted-foreground">text-menu-sm</code>
          <span class="text-xs text-primary">0.75rem</span>
          <span class="text-xs text-muted-foreground">· 서브메뉴, 필터/정렬 옵션</span>
        </div>
        <p class="text-menu-sm">메뉴 항목 (작은) Menu Item Small</p>
      </div>
      <div class="p-4 rounded-lg bg-card">
        <div class="flex items-center gap-2 mb-2">
          <code class="text-xs text-muted-foreground">text-xs-resp</code>
          <span class="text-xs text-primary">0.65rem</span>
          <span class="text-xs text-muted-foreground">· 푸터 링크, 뱃지, 타임스탬프</span>
        </div>
        <p class="text-xs-resp">초소형 텍스트 Extra Small Text</p>
      </div>
    </div>
  </section>

  <!-- UnoCSS 기본 유틸리티 비교 -->
  <section>
    <h2 class="mb-6 text-2xl font-semibold border-b border-border pb-2">UnoCSS 기본 (참고용)</h2>
    <p class="mb-4 text-sm text-muted-foreground">preset-wind4 기본 제공 유틸리티. 커스텀 유틸리티와 병행 사용 가능.</p>
    <div class="grid gap-4">
      <div class="flex items-baseline gap-4 p-4 rounded-lg bg-muted">
        <code class="text-xs text-muted-foreground w-32 shrink-0">text-xs (0.65rem)</code>
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
