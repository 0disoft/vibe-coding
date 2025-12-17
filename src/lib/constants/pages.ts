export type PageGroup =
	| "marketing"
	| "product"
	| "auth"
	| "legal"
	| "docs"
	| "support"
	| "app"
	| "community"
	| "misc";

export type PageEntry = {
	id: string;
	title: string;
	path: string;
	group: PageGroup;
	description?: string;
};

export const pages: PageEntry[] = [
	{ id: "home", title: "Home", path: "/", group: "marketing" },
	{ id: "about", title: "소개", path: "/about", group: "marketing" },
	{ id: "products", title: "제품/서비스", path: "/products", group: "product" },
	{
		id: "product-detail",
		title: "제품/서비스 상세",
		path: "/products/[slug]",
		group: "product",
	},
	{ id: "features", title: "기능 목록", path: "/features", group: "product" },
	{ id: "compare", title: "비교", path: "/compare", group: "product" },
	{ id: "integrations", title: "통합/연동", path: "/integrations", group: "product" },
	{
		id: "integration-detail",
		title: "통합/연동 상세",
		path: "/integrations/[slug]",
		group: "product",
	},
	{ id: "roi-calculator", title: "ROI 계산기", path: "/roi-calculator", group: "product" },
	{ id: "templates", title: "템플릿 갤러리", path: "/templates", group: "product" },
	{
		id: "template-detail",
		title: "템플릿 상세",
		path: "/templates/[slug]",
		group: "product",
	},
	{ id: "ai", title: "AI 기술 소개", path: "/ai", group: "product" },

	{ id: "pricing", title: "가격", path: "/pricing", group: "marketing" },
	{ id: "testimonials", title: "고객 후기", path: "/testimonials", group: "marketing" },
	{ id: "use-cases", title: "사용 사례", path: "/use-cases", group: "marketing" },
	{ id: "customer-stories", title: "고객 사례", path: "/customers", group: "marketing" },
	{ id: "portfolio", title: "포트폴리오", path: "/portfolio", group: "marketing" },
	{ id: "showcase", title: "사용자 쇼케이스", path: "/showcase", group: "marketing" },
	{ id: "team", title: "팀 소개", path: "/team", group: "marketing" },
	{ id: "awards", title: "인증/수상", path: "/awards", group: "marketing" },
	{ id: "esg", title: "지속가능성(ESG)", path: "/esg", group: "marketing" },
	{ id: "press", title: "언론 자료실", path: "/press", group: "marketing" },

	{ id: "contact", title: "연락처", path: "/contact", group: "support" },
	{ id: "demo", title: "데모 요청/예약", path: "/demo", group: "marketing" },
	{ id: "enterprise", title: "기업 솔루션", path: "/enterprise", group: "marketing" },
	{ id: "download", title: "앱 다운로드", path: "/download", group: "marketing" },

	{ id: "seller-center", title: "판매자 센터", path: "/seller", group: "app" },
	{ id: "buyer-protection", title: "구매자 보호", path: "/buyer-protection", group: "legal" },
	{
		id: "shipping-returns",
		title: "배송/반품 정책",
		path: "/shipping-returns",
		group: "legal",
	},

	{ id: "login", title: "로그인", path: "/login", group: "auth" },
	{ id: "signup", title: "회원가입", path: "/signup", group: "auth" },
	{
		id: "reset-password",
		title: "비밀번호 재설정",
		path: "/reset-password",
		group: "auth",
	},

	{ id: "dashboard", title: "대시보드", path: "/app", group: "app" },
	{ id: "analytics", title: "분석 대시보드", path: "/app/analytics", group: "app" },
	{ id: "search", title: "검색", path: "/search", group: "app" },
	{ id: "notifications", title: "알림", path: "/notifications", group: "app" },

	{ id: "profile", title: "프로필", path: "/profile", group: "app" },
	{ id: "settings", title: "프로필 설정", path: "/settings/profile", group: "app" },
	{ id: "billing", title: "결제 및 청구 관리", path: "/settings/billing", group: "app" },
	{ id: "alerts", title: "알림 설정", path: "/settings/notifications", group: "app" },
	{ id: "export", title: "데이터 내보내기", path: "/settings/export", group: "app" },
	{ id: "delete-account", title: "계정 삭제/탈퇴", path: "/settings/delete-account", group: "app" },

	{ id: "docs", title: "문서 가이드", path: "/docs", group: "docs" },
	{ id: "docs-start", title: "시작 가이드", path: "/docs/getting-started", group: "docs" },
	{
		id: "docs-onboarding",
		title: "온보딩 체크리스트",
		path: "/docs/onboarding-checklist",
		group: "docs",
	},
	{ id: "docs-api", title: "API 문서", path: "/docs/api", group: "docs" },
	{ id: "docs-api-ref", title: "API 레퍼런스", path: "/docs/api/reference", group: "docs" },
	{ id: "docs-guides", title: "가이드", path: "/docs/guides", group: "docs" },
	{ id: "docs-guide", title: "문서/가이드", path: "/docs/guide", group: "docs" },

	{ id: "help", title: "지원/헬프 센터", path: "/help", group: "support" },
	{ id: "faq", title: "자주 묻는 질문", path: "/faq", group: "support" },
	{ id: "status", title: "시스템 상태", path: "/status", group: "support" },

	{ id: "blog", title: "블로그", path: "/blog", group: "community" },
	{ id: "blog-archive", title: "블로그 아카이브", path: "/blog/archive", group: "community" },
	{ id: "blog-tags", title: "블로그 태그", path: "/blog/tags/[tag]", group: "community" },
	{ id: "news", title: "뉴스/업데이트", path: "/news", group: "community" },
	{ id: "events", title: "이벤트/웨비나", path: "/events", group: "community" },
	{ id: "community", title: "커뮤니티 허브", path: "/community", group: "community" },
	{ id: "newsletter", title: "뉴스레터 신청", path: "/newsletter", group: "community" },
	{ id: "rewards", title: "리워드/멤버십", path: "/rewards", group: "community" },
	{ id: "survey", title: "설문/피드백", path: "/survey", group: "community" },
	{ id: "waitlist", title: "대기자 명단", path: "/waitlist", group: "community" },
	{ id: "referrals", title: "추천 프로그램", path: "/referrals", group: "community" },

	{ id: "changelog", title: "변경 로그", path: "/changelog", group: "misc" },
	{ id: "roadmap", title: "로드맵", path: "/roadmap", group: "misc" },
	{ id: "maintenance", title: "유지보수 안내", path: "/maintenance", group: "misc" },

	{ id: "resources", title: "리소스", path: "/resources", group: "marketing" },
	{
		id: "resources-downloads",
		title: "리소스 다운로드",
		path: "/resources/downloads",
		group: "marketing",
	},
	{
		id: "resources-whitepaper",
		title: "화이트페이퍼",
		path: "/resources/whitepaper",
		group: "marketing",
	},

	{ id: "terms", title: "이용약관", path: "/terms", group: "legal" },
	{ id: "privacy", title: "개인정보 처리방침", path: "/privacy", group: "legal" },
	{ id: "cookie", title: "쿠키 정책", path: "/cookie", group: "legal" },
	{ id: "security", title: "보안 정책", path: "/security", group: "legal" },
	{ id: "compliance", title: "보안/인증", path: "/compliance", group: "legal" },
	{ id: "gdpr", title: "GDPR/국제 권리", path: "/gdpr", group: "legal" },
	{ id: "sla", title: "서비스 수준 계약(SLA)", path: "/sla", group: "legal" },
	{ id: "ai-transparency", title: "AI 투명성 정책", path: "/ai-transparency", group: "legal" },

	{ id: "sitemap", title: "사이트맵", path: "/sitemap", group: "misc" },
	{ id: "accessibility", title: "웹사이트 접근성", path: "/accessibility", group: "misc" },
	{ id: "licenses", title: "오픈소스 라이선스", path: "/licenses", group: "misc" },
	{ id: "media", title: "미디어 갤러리", path: "/media", group: "misc" },
	{ id: "map", title: "위치/지도", path: "/map", group: "misc" },
	{ id: "language", title: "다국어 전환", path: "/language", group: "misc" },
	{ id: "courses", title: "프로그램/코스", path: "/courses", group: "misc" },
	{ id: "careers", title: "채용", path: "/careers", group: "marketing" },
	{ id: "partners", title: "파트너/제휴", path: "/partners", group: "marketing" },
	{ id: "metrics", title: "성과 지표", path: "/metrics", group: "app" },
	{ id: "bug-bounty", title: "버그 바운티", path: "/bug-bounty", group: "legal" },

	{ id: "404", title: "404", path: "/404", group: "misc" },
];
