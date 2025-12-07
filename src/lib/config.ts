export const siteConfig = {
  name: 'Vibe',
  description: 'SvelteKit 2 + Svelte 5 + UnoCSS + TypeScript + Vite',
  keywords: ['Svelte', 'SvelteKit', 'UnoCSS', 'TypeScript', 'Vite'],
  // 문의 이메일 (약관, 개인정보처리방침 등에서 사용)
  email: 'rodisoft1@gmail.com',
  // 정책 관련 설정 (이용약관, 개인정보처리방침에서 사용)
  policy: {
    lastUpdated: '2025-12-07',
    cpoName: 'Sewon Lim (Founder & Engineer)',
    // 개인정보 수탁업체 (국외 이전 포함)
    // Coolify, Umami, Chatwoot 등 self-hosted는 수탁업체 아님
    dataProcessors: [
      {
        name: 'Cloudflare, Inc.',
        purpose: '웹 호스팅 및 엣지 컴퓨팅 (Workers)',
        country: '미국',
        items: '접속 IP, 브라우저 정보, 요청 URL',
        retention: '최대 30일',
      },
      {
        name: 'Resend Inc.',
        purpose: '이메일 발송',
        country: '미국',
        items: '이메일 주소, 발송 내역',
        retention: '발송일로부터 30일',
      },
      {
        name: 'Lemon Squeezy LLC',
        purpose: '결제 처리',
        country: '미국',
        items: '이메일, 결제 정보, 거래 내역',
        retention: '관계 법령에 따름',
      },
    ],
  },
  links: {
    github: 'https://github.com/0disoft/vibe-coding',
  },
} as const;
