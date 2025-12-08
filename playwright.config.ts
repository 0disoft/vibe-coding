import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'bun run build && bun run preview',
		port: 4173,
		reuseExistingServer: true
	},
	testDir: 'e2e',

	// 다양한 디바이스 뷰포트에서 테스트
	projects: [
		{
			name: 'Mobile',
			use: { ...devices['iPhone 16 Pro'] }
		},
		{
			name: 'Tablet',
			use: { ...devices['iPad (gen 11)'] }
		},
		{
			name: 'Laptop',
			use: { viewport: { width: 1280, height: 720 } }
		},
		{
			name: 'Desktop',
			use: { viewport: { width: 1920, height: 1080 } }
		},
		{
			name: 'Large Desktop',
			use: { viewport: { width: 2560, height: 1440 } }
		}
	]
});
