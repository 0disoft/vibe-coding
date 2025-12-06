import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { sveltekit } from '@sveltejs/kit/vite';
import { playwright } from '@vitest/browser-playwright';
import UnoCSS from 'unocss/vite';
import { defineConfig } from 'vitest/config';


export default defineConfig({
	plugins: [
		UnoCSS(),      // UnoCSS를 맨 앞에
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			// @ts-expect-error: Paraglide 2.x 옵션 인식 오류 무시
			experimentalUseVirtualModules: true
		}),
		sveltekit()
	],
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
