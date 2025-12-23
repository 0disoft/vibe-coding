export type PageGroup =
	| 'marketing'
	| 'product'
	| 'auth'
	| 'legal'
	| 'docs'
	| 'support'
	| 'app'
	| 'community'
	| 'misc';

export type PageEntry = {
	id: string;
	title: string;
	path: string;
	group: PageGroup;
	description?: string;
};

export const pages: PageEntry[] = [
	{ id: 'home', title: 'Home', path: '/', group: 'marketing' },

	{ id: 'login', title: '로그인', path: '/login', group: 'auth' },
	{ id: 'signup', title: '회원가입', path: '/signup', group: 'auth' },
	{
		id: 'reset-password',
		title: '비밀번호 재설정',
		path: '/reset-password',
		group: 'auth'
	},

	{ id: 'profile', title: '프로필', path: '/profile', group: 'app' },
	{ id: 'settings', title: '프로필 설정', path: '/settings/profile', group: 'app' },
	{ id: 'billing', title: '결제 및 청구 관리', path: '/settings/billing', group: 'app' },
	{ id: 'alerts', title: '알림 설정', path: '/settings/notifications', group: 'app' },
	{ id: 'delete-account', title: '계정 삭제/탈퇴', path: '/settings/delete-account', group: 'app' },

	{ id: 'terms', title: '이용약관', path: '/terms', group: 'legal' },
	{ id: 'privacy', title: '개인정보 처리방침', path: '/privacy', group: 'legal' },
	{ id: 'cookie', title: '쿠키 정책', path: '/cookie', group: 'legal' },
	{ id: 'security', title: '보안 정책', path: '/security', group: 'legal' },
	{ id: 'gdpr', title: 'GDPR/국제 권리', path: '/gdpr', group: 'legal' },

	{ id: 'sitemap', title: '사이트맵', path: '/sitemap', group: 'misc' },
	{ id: 'accessibility', title: '웹사이트 접근성', path: '/accessibility', group: 'misc' },
	{ id: 'bug-bounty', title: '버그 바운티', path: '/bug-bounty', group: 'legal' },
];
