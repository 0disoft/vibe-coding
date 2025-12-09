import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// 전처리기 설정
	// - TypeScript 변환
	// - PostCSS/UnoCSS 처리
	// - Svelte 컴포넌트 스타일 처리
	preprocess: vitePreprocess(),

	kit: {
		// 배포 어댑터 설정
		// - adapter-auto: 배포 환경 자동 감지 (Vercel, Cloudflare 등)
		// - adapter-static: 정적 사이트 생성 (SSG)
		// - adapter-node: Node.js 서버
		// - adapter-vercel: Vercel 전용
		adapter: adapter()

		// 추가 설정 예시:
		// alias: {
		//   '$components': 'src/lib/components',
		//   '$utils': 'src/lib/utils'
		// },
		// csp: { mode: 'auto' },  // 보안 헤더
		// prerender: { handleHttpError: 'warn' }  // 프리렌더링 에러 처리
	}
};

export default config;
