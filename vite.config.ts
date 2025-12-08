import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { sveltekit } from '@sveltejs/kit/vite';
import { playwright } from '@vitest/browser-playwright';
import UnoCSS from 'unocss/vite';
import { defineConfig } from 'vitest/config';


export default defineConfig({
	// info 레벨 메시지 숨김 (SvelteKit 설정 덮어쓰기 알림 등)
	logLevel: 'warn',
	plugins: [
		UnoCSS(),      // UnoCSS를 맨 앞에
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			// @ts-expect-error: Paraglide 2.x 옵션 인식 오류 무시
			experimentalUseVirtualModules: true,
			// URL 경로에서 locale 감지 활성화 (예: /ko, /en)
			strategy: ['url', 'cookie', 'baseLocale']
		}),
		sveltekit()
	],
	build: {
		// shiki 등 대용량 라이브러리로 인해 임계값 상향
		chunkSizeWarningLimit: 1000,
		rollupOptions: {
			output: {
				// 대용량 라이브러리를 별도 청크로 분리
				manualChunks: (id) => {
					// Shiki (코드 하이라이팅) - 가장 큰 청크
					if (id.includes('shiki')) {
						return 'shiki';
					}
					// Marked (마크다운 파서)
					if (id.includes('marked')) {
						return 'marked';
					}
					// 폰트 파일들
					if (id.includes('@fontsource')) {
						return 'fonts';
					}
				}
			}
		}
	},
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: true,
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**']
				}
			},
			{
				extends: true,
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					// 주의:
					// - 현재는 "UI 전용 폴더"라는 가정으로 src/lib/components/** 를 제외
					// - 만약 components 아래에 서버 전용 유틸이 추가되면 이 exclude를 재검토할 것
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}', 'src/lib/components/**']
				}
			}
		]
	}
});
