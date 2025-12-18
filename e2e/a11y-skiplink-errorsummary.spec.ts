import { expect, test } from '@playwright/test';

test.describe('A11y 패턴 회귀 방지', () => {
	test('SkipLink - 첫 포커스 요소 + Enter로 main 포커스 이동', async ({ page }, testInfo) => {
		test.skip(['Mobile', 'Tablet'].includes(testInfo.project.name));
		// privacy 페이지는 마크다운 렌더가 커서 hydration이 오래 걸려 flaky해질 수 있어
		// 가벼운 라우트에서 SkipLink 동작만 안정적으로 검증합니다.
		await page.goto('/design-system', { waitUntil: 'load' });
		await page.locator('html[data-hydrated="true"]').waitFor({ timeout: 60_000 });

		const main = page.locator('#main-content');
		await expect(main).toHaveAttribute('tabindex', '-1');

		const skipLink = page.locator('a[href="#main-content"]').first();

		// 첫 포커스 가능한 요소가 SkipLink인지(탭 순서) 확인
		const firstFocusableHref = await page.evaluate(() => {
			const isDisabled = (el: Element) =>
				el instanceof HTMLButtonElement ||
				el instanceof HTMLInputElement ||
				el instanceof HTMLSelectElement ||
				el instanceof HTMLTextAreaElement
					? el.disabled
					: false;

			const isHidden = (el: Element) => {
				const style = window.getComputedStyle(el as HTMLElement);
				return style.display === 'none' || style.visibility === 'hidden';
			};

			const focusable = Array.from(
				document.querySelectorAll<HTMLElement>(
					'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]',
				),
			).filter((el) => !isHidden(el) && !el.hasAttribute('inert') && !isDisabled(el));

			const first = focusable[0];
			return first instanceof HTMLAnchorElement ? first.getAttribute('href') : null;
		});
		expect(firstFocusableHref).toBe('#main-content');

		// Enter(키보드 활성화) 시 main으로 포커스가 이동해야 한다
		await skipLink.focus();

		await page.keyboard.press('Enter');
		await expect(main).toBeFocused();
	});

	test('ErrorSummary - 제출 실패 시 자동 포커스 + 링크 클릭 시 입력 포커스', async ({ page }, testInfo) => {
		test.skip(['Mobile', 'Tablet'].includes(testInfo.project.name));
		await page.goto('/design-system', { waitUntil: 'load' });
		await page.locator('html[data-hydrated="true"]').waitFor({ timeout: 60_000 });

		const formsSection = page.locator('#ds-forms');
		await expect(formsSection).toBeVisible();

		await formsSection.getByRole('button', { name: 'Submit' }).click();

		const summary = formsSection.locator('#ds-error-summary');
		await expect(summary).toBeVisible();
		await expect(summary).toBeFocused({ timeout: 10_000 });

		await summary.getByRole('link').first().click();
		await expect(page.getByRole('textbox', { name: 'Email (ErrorSummary demo)' })).toBeFocused();
	});
});
