<script lang="ts">
  import TypographyCard from '$lib/components/typography/TypographyCard.svelte';
  import TypographySection from '$lib/components/typography/TypographySection.svelte';

  interface Props {
    fs: (key: string) => string;
  }

  let { fs }: Props = $props();
</script>

<TypographySection title="본문용">
  <TypographyCard token="text-body" size={fs('text-body')} description="일반 본문, 기사 내용, 설명 문단">
    <p class="text-body">다람쥐 헌 쳇바퀴에 타고파 The quick brown fox</p>
  </TypographyCard>

  <TypographyCard
    token="text-body-secondary"
    size={fs('text-body-secondary')}
    description="부가 설명, 인용문, 사이드바 텍스트"
  >
    <p class="text-body-secondary">다람쥐 헌 쳇바퀴에 타고파 The quick brown fox</p>
  </TypographyCard>

  <TypographyCard token="text-comment" size={fs('text-comment')} description="댓글, 리뷰, 사용자 피드백">
    <p class="text-comment">다람쥐 헌 쳇바퀴에 타고파 The quick brown fox</p>
  </TypographyCard>

  <TypographyCard token="text-code" size={fs('text-code')} description="코드 블록, 인라인 코드, 터미널 출력">
    <p class="text-code font-mono">const hello = "world"; // 코드 전용</p>
  </TypographyCard>
</TypographySection>

<TypographySection title="제목용">
  <TypographyCard token="text-h1" size={fs('text-h1')} description="페이지 타이틀, 히어로 섹션 제목">
    <p class="text-h1 font-bold">대제목 H1 Heading</p>
  </TypographyCard>

  <TypographyCard token="text-h2" size={fs('text-h2')} description="섹션 제목, 카드 헤더">
    <p class="text-h2 font-semibold">중제목 H2 Heading</p>
  </TypographyCard>

  <TypographyCard token="text-h3" size={fs('text-h3')} description="서브섹션 제목, 모달 타이틀">
    <p class="text-h3 font-semibold">소제목 H3 Heading</p>
  </TypographyCard>

  <TypographyCard token="text-caption" size={fs('text-caption')} description="이미지 캡션, 표 주석, 출처 표기">
    <p class="text-caption text-muted-foreground">캡션 텍스트 Caption Text</p>
  </TypographyCard>
</TypographySection>

