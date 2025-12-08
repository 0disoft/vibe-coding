export const siteConfig = {
  name: 'Vibe',
  description: 'SvelteKit 2 + Svelte 5 + UnoCSS + TypeScript + Vite',
  keywords: ['Svelte', 'SvelteKit', 'UnoCSS', 'TypeScript', 'Vite'],
  // 문의 이메일 (약관, 개인정보처리방침 등에서 사용)
  email: 'rodisoft1@gmail.com',
  // 정책 관련 설정 (이용약관, 개인정보처리방침에서 사용)
  policy: {
    effectiveDate: {
      terms: '2025-12-07',
      privacy: '2025-12-07',
      cookie: '2025-12-08',
    },
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
      {
        id: 'portone',
        name: 'Portone Co., Ltd.',
      },
      {
        id: 'umami',
        name: 'Umami Software, Inc.',
      },
      {
        id: 'glitchtip',
        name: 'GlitchTip',
      },
      {
        id: 'chatwoot',
        name: 'Chatwoot Inc.',
      },
      {
        id: 'openrouter',
        name: 'OpenRouter',
      },
      {
        id: 'github',
        name: 'GitHub, Inc.',
      },
      {
        id: 'giscus',
        name: 'Giscus',
      },
    ],
    // 쿠키 정책에 표시할 서비스 목록 (카테고리별 분류)
    cookieServices: {
      infrastructure: ['cloudflare'],
      payments: ['lemonsqueezy', 'portone', 'chatwoot'],
      social: ['github', 'giscus'],
    },
  },
  links: {
    github: 'https://github.com/0disoft/vibe-coding',
  },
} as const;
