import { expect, test } from '@playwright/test';

test.describe('Design System Lab (Visual)', () => {
	test.skip(process.env.VISUAL !== '1', 'Set VISUAL=1 to enable visual snapshots.');

	test('lab 페이지 스냅샷', async ({ page }) => {
		await page.goto('/lab/design-system', { waitUntil: 'domcontentloaded' });
		await expect(page.getByRole('heading', { name: 'Design System Lab' })).toBeVisible();

		await expect(page).toHaveScreenshot('design-system-lab.png', { fullPage: true });
	});

	test('lab 페이지 스냅샷 (reduced-motion)', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.goto('/lab/design-system', { waitUntil: 'domcontentloaded' });
		await expect(page.getByRole('heading', { name: 'Design System Lab' })).toBeVisible();

		await expect(page).toHaveScreenshot('design-system-lab.reduced-motion.png', { fullPage: true });
	});

	test('lab 페이지 스냅샷 (forced-colors)', async ({ page }) => {
		await page.emulateMedia({ forcedColors: 'active' });
		await page.goto('/lab/design-system', { waitUntil: 'domcontentloaded' });
		await expect(page.getByRole('heading', { name: 'Design System Lab' })).toBeVisible();

		await expect(page).toHaveScreenshot('design-system-lab.forced-colors.png', { fullPage: true });
	});

	test('lab 페이지 스냅샷 (prefers-contrast: more)', async ({ page }) => {
		await page.emulateMedia({ contrast: 'more' });
		await page.goto('/lab/design-system', { waitUntil: 'domcontentloaded' });
		await expect(page.getByRole('heading', { name: 'Design System Lab' })).toBeVisible();

		await expect(page).toHaveScreenshot('design-system-lab.contrast-more.png', { fullPage: true });
	});
});
