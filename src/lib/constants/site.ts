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
	// 문의 이메일 (약관, 개인정보처리방침 등에서 사용)
	email: 'rodisoft1@gmail.com',
	links: {
		github: 'https://github.com/0disoft/vibe-coding'
	}
} as const satisfies SiteConfig;
