import { expect, test } from '@playwright/test';

test.describe('레이아웃 테스트', () => {
	test('헤더에 4개 액션 아이콘이 표시되어야 한다', async ({ page }) => {
		await page.goto('/');

		await expect(page.getByTestId('header-theme-toggle')).toBeVisible();
		await expect(page.getByTestId('header-language-picker')).toBeVisible();
		await expect(page.getByTestId('header-font-size-picker')).toBeVisible();
		await expect(page.getByTestId('header-user-menu')).toBeVisible();
	});

	test('푸터에 3개 정책 링크가 표시되어야 한다', async ({ page }) => {
		await page.goto('/');

		await expect(page.getByTestId('footer-terms-link')).toBeVisible();
		await expect(page.getByTestId('footer-privacy-link')).toBeVisible();
		await expect(page.getByTestId('footer-cookie-link')).toBeVisible();
	});
});
