import { expect, test } from '@playwright/test';

test.describe('Design System Lab (Visual)', () => {
	test.skip(process.env.VISUAL !== '1', 'Set VISUAL=1 to enable visual snapshots.');

	// 스냅샷 환경 고정: 애니메이션 끄기, caret 숨김
	const screenshotOptions = {
		fullPage: true,
		timeout: 30_000,
		animations: 'disabled',
		caret: 'hide'
	} as const;

	// 폰트 로딩 대기 (타임아웃 가드 포함)
	const waitForFonts = async (page: import('@playwright/test').Page, timeoutMs = 5000) => {
		try {
			await Promise.race([
				page.evaluate(() => document.fonts.ready),
				new Promise((_, reject) =>
					setTimeout(() => reject(new Error('Font loading timeout')), timeoutMs)
				)
			]);
		} catch {
			// 폰트 로딩 실패 시 경고만 남기고 계속 진행 (CI 안정성)
			console.warn(`Font loading did not complete within ${timeoutMs}ms, proceeding anyway`);
		}
	};

	// 공통 페이지 준비 로직
	const preparePage = async (page: import('@playwright/test').Page) => {
		await page.goto('/lab/design-system', { waitUntil: 'domcontentloaded' });
		await expect(page.locator('html')).toHaveAttribute('data-ds-lab-ready', '1');

		// 폰트 로딩 완료 대기 (웹폰트 타이밍으로 인한 픽셀 흔들림 방지, 최대 5초)
		await waitForFonts(page);

		await expect(page.getByRole('heading', { name: 'Design System Lab' })).toBeVisible();
	};

	test('lab 페이지 스냅샷', async ({ page }) => {
		await preparePage(page);
		await expect(page).toHaveScreenshot('design-system-lab.png', screenshotOptions);
	});

	test('lab 페이지 스냅샷 (reduced-motion)', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await preparePage(page);
		await expect(page).toHaveScreenshot('design-system-lab.reduced-motion.png', screenshotOptions);
	});

	test('lab 페이지 스냅샷 (forced-colors)', async ({ page }) => {
		await page.emulateMedia({ forcedColors: 'active' });
		await preparePage(page);
		await expect(page).toHaveScreenshot('design-system-lab.forced-colors.png', screenshotOptions);
	});

	test('lab 페이지 스냅샷 (prefers-contrast: more)', async ({ page }) => {
		await page.emulateMedia({ contrast: 'more' });
		await preparePage(page);
		await expect(page).toHaveScreenshot('design-system-lab.contrast-more.png', screenshotOptions);
	});
});
