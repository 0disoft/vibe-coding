<script lang="ts">
  // SSR에서 미리 하이라이팅된 코드블록 데이터
  let { data } = $props();
</script>

<div class="container py-12">
  <h1 class="mb-8 text-center text-3xl font-bold">CodeBlock 테스트</h1>

  <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
    <!-- TOML 예시 (왼쪽) -->
    <div>
      <h2 class="mb-4 text-xl font-semibold">TOML</h2>
      <div class="relative [&>pre]:!my-0 [&>pre]:!rounded-lg [&>pre]:!p-4">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -- SSR에서 생성한 신뢰할 수 있는 HTML -->
        {@html data.codeBlocks.toml.html}
      </div>
    </div>

    <!-- TypeScript 예시 (오른쪽) -->
    <div>
      <h2 class="mb-4 text-xl font-semibold">TypeScript</h2>
      <div class="relative [&>pre]:!my-0 [&>pre]:!rounded-lg [&>pre]:!p-4">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -- SSR에서 생성한 신뢰할 수 있는 HTML -->
        {@html data.codeBlocks.typescript.html}
      </div>
    </div>
  </div>
</div>
