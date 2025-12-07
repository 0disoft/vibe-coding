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
    dataProcessors: [
      {
        id: 'cloudflare',
        name: 'Cloudflare, Inc.',
      },
      {
        id: 'resend',
        name: 'Resend Inc.',
      },
      {
        id: 'lemonsqueezy',
        name: 'Lemon Squeezy LLC',
      },
    ],
  },
  links: {
    github: 'https://github.com/0disoft/vibe-coding',
  },
} as const;
