import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;
const REUSE_EXISTING_SERVER = process.env.PW_REUSE_SERVER === '1' && !process.env.CI;

export default defineConfig({
	webServer: {
		command: `bun run build && bun run preview -- --host 127.0.0.1 --port ${PORT}`,
		port: PORT,
		// 로컬에서 이전에 떠 있던 preview 서버(포트 점유)를 잘못 재사용하면
		// 테스트가 전부 timeout으로 무너질 수 있어 기본은 비재사용으로 둡니다.
		// 필요하면 PW_REUSE_SERVER=1 로 opt-in 하세요.
		reuseExistingServer: REUSE_EXISTING_SERVER,
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
