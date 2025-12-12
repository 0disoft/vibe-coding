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
		cookie: '2025-12-08',
		security: '2025-12-11',
		bugBounty: '2025-12-11'
	},
	cpoName: 'Sewon Lim (Founder & Engineer)',
	// 보안 표준 (암호화 알고리즘 등) - 마크다운 치환용
	securityStandards: {
		password: 'Argon2id',
		data: 'XChaCha20-Poly1305',
		kdf: 'HKDF (BLAKE3)',
		integrity: 'BLAKE3',
		transport: 'TLS 1.3+ / HSTS'
	},
	securityReasons: {
		ko: {
			password:
				'GPU 병렬화 공격에 강하고 메모리 하드(Memory-hard) 함수여서 무차별 대입 공격 방어에 탁월합니다.',
			data: '모바일 환경에서 AES보다 빠르며, 192비트 논스를 사용해 대규모 데이터 암호화 시에도 키/논스 충돌 위험이 없습니다.',
			kdf: '단일 런타임 내에서도 키를 논리적으로 분리하고, 키 파생 과정의 암호학적 강도를 보장합니다.',
			integrity:
				'MD5, SHA-1 등 구형 해시 함수보다 훨씬 빠르고 안전하며, 데이터 무결성을 확실하게 보장합니다.',
			transport:
				'중간자 공격을 차단하고, 다운그레이드 공격을 방지하여 데이터 전송 구간을 안전하게 보호합니다.'
		},
		en: {
			password:
				'Resistant to GPU parallel attacks and memory-hard, making it highly effective against brute-force attacks.',
			data: 'Faster than AES on mobile devices and uses a 192-bit nonce to eliminate key/nonce collision risks in large-scale encryption.',
			kdf: 'Logically separates keys within a single runtime and ensures cryptographic strength in key derivation.',
			integrity:
				'Significantly faster and more secure than legacy hashes like MD5/SHA-1, ensuring data integrity.',
			transport:
				'Prevents Man-in-the-Middle (MitM) and downgrade attacks, securing data in transit.'
		}
	},
	thirdPartyProviders: ['Supabase', 'Cloudflare', 'Vercel'],
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
		{ id: 'portone', name: 'PortOne Co., Ltd.' },
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
	},
	// Rate Limiting 설정
	rateLimit: {
		maxRequests: 7, // 윈도우 내 최대 요청 수
		windowMs: 2000, // 탐지 윈도우 (밀리초) - 2초
		penaltyMs: 5000 // 차단 시 페널티 기간 (밀리초) - 5초
	},
	// 요청 본문 크기 제한 (Content-Length 검사)
	maxBodySize: 10 * 1024 * 1024 // 10MB
} as const;
