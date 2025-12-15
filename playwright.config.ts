import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

export default defineConfig({
	webServer: {
		command: `bun run build && bun run preview -- --host 127.0.0.1 --port ${PORT}`,
		port: PORT,
		reuseExistingServer: !process.env.CI,
		timeout: 300_000
	},
	testDir: 'e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	use: {
		baseURL: `http://127.0.0.1:${PORT}`,
		trace: 'on-first-retry'
	},

	// 다양한 디바이스 뷰포트에서 테스트
	projects: [
		{
			name: 'Mobile',
			use: { ...devices['iPhone 14 Pro'] }
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
