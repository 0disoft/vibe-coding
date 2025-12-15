import { expect, test } from '@playwright/test';

test.describe('Design System Lab (A11y smoke)', () => {
	test.skip(process.env.A11Y !== '1', 'Set A11Y=1 to enable a11y checks.');

	test('DsField label/description 연결', async ({ page }) => {
		await page.goto('/lab/design-system', { waitUntil: 'domcontentloaded' });

		const inputRequired = page.locator('#lab-light-email');
		await expect(inputRequired).toBeVisible();
		await expect(page.locator('label[for="lab-light-email"]')).toBeVisible();
		await expect(inputRequired).toHaveAttribute('required', '');

		const describedBy = await inputRequired.getAttribute('aria-describedby');
		expect(describedBy).toBeTruthy();
		for (const id of (describedBy ?? '').split(/\s+/).filter(Boolean)) {
			await expect(page.locator(`#${id}`)).toBeVisible();
		}

		const lightInvalid = page.locator('#lab-light-email-error');
		await expect(lightInvalid).toBeVisible();
		await expect(page.locator('label[for="lab-light-email-error"]')).toBeVisible();
		await expect(lightInvalid).toHaveAttribute('aria-invalid', 'true');

		const describedByInvalid = await lightInvalid.getAttribute('aria-describedby');
		expect(describedByInvalid).toBeTruthy();
		for (const id of (describedByInvalid ?? '').split(/\s+/).filter(Boolean)) {
			await expect(page.locator(`#${id}`)).toBeVisible();
		}

		await expect(page.locator('#lab-light-email-error-error')).toHaveAttribute('role', 'alert');
	});

	test('Dialog a11y 연결', async ({ page }) => {
		await page.goto('/lab/design-system', { waitUntil: 'domcontentloaded' });
		await page.getByRole('button', { name: 'Open dialog' }).first().click();

		const dialog = page.locator('dialog[open]').first();
		await expect(dialog).toBeVisible();
		await expect(dialog).toHaveAttribute('aria-modal', 'true');
		await expect(dialog).toHaveAttribute('aria-labelledby', 'lab-light-dialog-title');
		await expect(dialog).toHaveAttribute('aria-describedby', 'lab-light-dialog-desc');

		await page.keyboard.press('Escape');
		await expect(dialog).toBeHidden();
	});

	test('Dropdown aria-expanded 토글', async ({ page }) => {
		await page.goto('/lab/design-system', { waitUntil: 'domcontentloaded' });

		const trigger = page.getByRole('button', { name: 'Open menu' }).first();
		await expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
		await expect(trigger).toHaveAttribute('aria-expanded', 'false');
		await trigger.click();
		await expect(trigger).toHaveAttribute('aria-expanded', 'true');
		await page.keyboard.press('Escape');
		await expect(trigger).toHaveAttribute('aria-expanded', 'false');
	});
});
