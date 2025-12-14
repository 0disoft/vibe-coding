/**
 * 사이트 기본 정보 상수
 *
 * 사이트 메타데이터, SEO, 외부 링크 등 기본 정보를 정의합니다.
 */

/** 사이트 설정 인터페이스 */
interface SiteConfig {
	name: string;
	description: string;
	keywords: readonly string[];
	/**
	 * 사이트의 공개 Origin (예: https://example.com)
	 *
	 * - sitemap 생성 등 "절대 URL"이 필요한 곳에서 사용합니다.
	 * - 템플릿 복사 시 실수 방지를 위해 기본값은 플레이스홀더로 유지하고,
	 *   배포 환경에서는 `PUBLIC_SITE_ORIGIN` 환경변수로 오버라이드하는 것을 권장합니다.
	 */
	origin: string;
	email: string;
	links: {
		github: string;
		[key: string]: string; // 추가 링크 허용
	};
}

export const site = {
	name: 'Vibe',
	description: 'SvelteKit 2 + Svelte 5 + UnoCSS + TypeScript + Vite',
	keywords: ['Svelte', 'SvelteKit', 'UnoCSS', 'TypeScript', 'Vite'],
	// 템플릿 기본값(플레이스홀더). 배포 환경에서는 PUBLIC_SITE_ORIGIN으로 설정 권장.
	origin: 'https://example.com',
	// 문의 이메일 (약관, 개인정보처리방침 등에서 사용)
	email: 'rodisoft1@gmail.com',
	links: {
		github: 'https://github.com/0disoft/vibe-coding'
	}
} as const satisfies SiteConfig;
