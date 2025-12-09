/**
 * 정책 관련 상수
 *
 * 이용약관, 개인정보처리방침, 쿠키정책 등에서 사용되는 설정을 정의합니다.
 * stack.manifest.toml에서 잠재적으로 사용될 수 있는 모든 서비스를 미리 등록합니다.
 */
export const policy = {
	effectiveDate: {
		terms: '2025-12-07',
		privacy: '2025-12-07',
		cookie: '2025-12-08'
	},
	cpoName: 'Sewon Lim (Founder & Engineer)',
	// 개인정보 수탁업체 (국외 이전 포함)
	// stack.manifest.toml의 모든 잠재적 서비스를 미리 등록
	dataProcessors: [
		// === 인프라 ===
		{ id: 'cloudflare', name: 'Cloudflare, Inc.' },
		{ id: 'vercel', name: 'Vercel Inc.' },
		// === 인증 ===
		{ id: 'better_auth', name: 'Better Auth (Self-hosted)' },
		// === 보안 ===
		{ id: 'cap', name: 'Cap (Self-hosted CAPTCHA)' },
		// === 데이터베이스 ===
		{ id: 'neon', name: 'Neon Inc.' },
		{ id: 'supabase', name: 'Supabase Inc.' },
		{ id: 'turso', name: 'Turso (ChiselStrike)' },
		{ id: 'upstash', name: 'Upstash Inc.' },
		// === 스토리지/CMS ===
		{ id: 'cloudflare_r2', name: 'Cloudflare R2' },
		{ id: 'directus', name: 'Directus (Self-hosted)' },
		// === 결제 ===
		{ id: 'lemonsqueezy', name: 'Lemon Squeezy LLC' },
		{ id: 'portone', name: 'Portone Co., Ltd.' },
		{ id: 'btcpay', name: 'BTCPay Server (Self-hosted)' },
		{ id: 'revenuecat', name: 'RevenueCat Inc.' },
		{ id: 'wise', name: 'Wise Payments Ltd.' },
		// === 후원 ===
		{ id: 'kofi', name: 'Ko-fi Labs Ltd.' },
		{ id: 'github_sponsors', name: 'GitHub Sponsors' },
		// === 커뮤니케이션 ===
		{ id: 'resend', name: 'Resend Inc.' },
		{ id: 'novu', name: 'Novu Inc.' },
		{ id: 'ntfy', name: 'ntfy (Self-hosted)' },
		// === 분석/모니터링 ===
		{ id: 'umami', name: 'Umami Software, Inc.' },
		{ id: 'glitchtip', name: 'GlitchTip' },
		{ id: 'uptime_kuma', name: 'Uptime Kuma (Self-hosted)' },
		// === 검색/AI ===
		{ id: 'meilisearch', name: 'Meilisearch (Self-hosted)' },
		{ id: 'qdrant', name: 'Qdrant (Self-hosted)' },
		{ id: 'openrouter', name: 'OpenRouter' },
		{ id: 'vercel_ai', name: 'Vercel AI SDK' },
		// === 광고 ===
		{ id: 'google_ads', name: 'Google Ads' },
		{ id: 'meta_ads', name: 'Meta Platforms, Inc.' },
		{ id: 'adsense', name: 'Google AdSense' },
		// === 고객지원/커뮤니티 ===
		{ id: 'chatwoot', name: 'Chatwoot Inc.' },
		{ id: 'github', name: 'GitHub, Inc.' },
		{ id: 'giscus', name: 'Giscus' },
		{ id: 'remark42', name: 'Remark42 (Self-hosted)' }
	],
	// 쿠키 정책에 표시할 서비스 목록 (카테고리별 분류)
	cookieServices: {
		infrastructure: ['cloudflare', 'vercel'],
		analytics: ['umami', 'google_ads', 'meta_ads', 'adsense'],
		payments: ['lemonsqueezy', 'portone', 'btcpay', 'revenuecat', 'wise', 'kofi'],
		social: ['github', 'giscus', 'remark42', 'github_sponsors'],
		support: ['chatwoot'],
		ai: ['openrouter', 'vercel_ai']
	}
} as const;
