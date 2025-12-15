import { expect, test } from '@playwright/test';

test.describe('Design System Lab (A11y smoke)', () => {
	test.skip(process.env.A11Y !== '1', 'Set A11Y=1 to enable a11y checks.');

	// 라이트 테마 스코프 (여러 테스트에서 공통 사용)
	const lightThemeScope = '[data-ds-theme="light"]';

	// beforeEach로 중복 goto + ready 확인 통합
	test.beforeEach(async ({ page }) => {
		await page.goto('/lab/design-system', { waitUntil: 'domcontentloaded' });
		await expect(page.locator('html')).toHaveAttribute('data-ds-lab-ready', '1');
	});

	test('DsField label/description 연결', async ({ page }) => {
		await test.step('필수 입력 필드 검증', async () => {
			const inputRequired = page.locator('#lab-light-email');
			await expect(inputRequired).toBeVisible();
			await expect(page.locator('label[for="lab-light-email"]')).toBeVisible();
			// required 불리언 속성은 toHaveJSProperty로 더 안정적으로 검사
			await expect(inputRequired).toHaveJSProperty('required', true);

			const describedBy = await inputRequired.getAttribute('aria-describedby');
			expect(describedBy).toBeTruthy();
			for (const id of (describedBy ?? '').split(/\s+/).filter(Boolean)) {
				await expect(page.locator(`#${id}`)).toBeVisible();
			}
		});

		await test.step('유효하지 않은 입력 필드 검증', async () => {
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
	});

	test('Dialog a11y 연결', async ({ page }) => {
		const triggerButton = page
			.locator(lightThemeScope)
			.getByRole('button', { name: 'Open dialog' });

		await test.step('Dialog 열기', async () => {
			await triggerButton.click();
		});

		const dialog = page.locator('dialog#lab-light-dialog[open]').first();

		await test.step('Dialog 접근성 속성 확인', async () => {
			await expect(dialog).toBeVisible();
			await expect(dialog).toHaveAttribute('aria-modal', 'true');
			await expect(dialog).toHaveAttribute('aria-labelledby', 'lab-light-dialog-title');
			await expect(dialog).toHaveAttribute('aria-describedby', 'lab-light-dialog-desc');
		});

		await test.step('Dialog 열릴 때 내부로 포커스 이동 확인', async () => {
			// poll 방식으로 activeElement가 dialog 내부가 될 때까지 안정적으로 대기
			await expect
				.poll(
					async () => {
						return page.evaluate((dialogId) => {
							const active = document.activeElement;
							return active?.closest(`#${dialogId}`) !== null;
						}, 'lab-light-dialog');
					},
					{ message: 'Dialog 열릴 때 포커스가 내부로 이동해야 함', timeout: 5000 }
				)
				.toBe(true);
		});

		await test.step('Escape로 Dialog 닫기', async () => {
			await page.keyboard.press('Escape');
			await expect(dialog).toBeHidden();
		});

		await test.step('닫힌 후 트리거 버튼으로 포커스 복귀 확인', async () => {
			await expect(triggerButton).toBeFocused();
		});
	});

	test('Dropdown aria-expanded 토글', async ({ page }) => {
		const lightScope = page.locator(lightThemeScope);
		const trigger = lightScope.getByRole('button', { name: 'Open menu' });
		// 라이트 테마 스코프 내에서 메뉴 찾기 (다른 테마 메뉴와 혼동 방지)
		const menuLocator = lightScope.locator('[role="menu"], [role="listbox"]').first();

		await test.step('Dropdown 초기 상태 확인', async () => {
			await expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
			await expect(trigger).toHaveAttribute('aria-expanded', 'false');
		});

		await test.step('Dropdown 열기', async () => {
			await trigger.click();
			await expect(trigger).toHaveAttribute('aria-expanded', 'true');
			await expect(menuLocator).toBeVisible();
		});

		await test.step('Escape로 Dropdown 닫기', async () => {
			await page.keyboard.press('Escape');
			await expect(trigger).toHaveAttribute('aria-expanded', 'false');
		});

		await test.step('메뉴 hidden 확인', async () => {
			// aria-expanded 뿐 아니라 메뉴 요소 자체도 숨겨졌는지 확인
			await expect(menuLocator).toBeHidden();
		});
	});

	test('Tooltip aria-describedby 연결 및 ESC 닫기', async ({ page }) => {
		const trigger = page.locator('#lab-light-tooltip-trigger');
		await expect(trigger).toBeVisible();

		let tooltipId: string | null;

		await test.step('Tooltip 열기 (hover)', async () => {
			await trigger.hover();
			await expect(trigger).toHaveAttribute('aria-describedby', /ds-tooltip-/);
			tooltipId = await trigger.getAttribute('aria-describedby');
		});

		await test.step('Tooltip 요소 표시 확인', async () => {
			expect(tooltipId).toBeTruthy();
			const tooltip = page.locator(`#${tooltipId}`);
			await expect(tooltip).toBeVisible();
			await expect(tooltip).toHaveAttribute('role', 'tooltip');
		});

		await test.step('Tooltip 닫기 (ESC)', async () => {
			await trigger.click();
			await page.keyboard.press('Escape');
			await expect(trigger).not.toHaveAttribute('aria-describedby', /ds-tooltip-/);
		});

		await test.step('Tooltip 요소 숨김 확인', async () => {
			// 특정 tooltip ID로 확인 (전역 카운트 대신 오탐 방지)
			const tooltip = page.locator(`#${tooltipId}`);
			await expect(tooltip).toBeHidden();
		});
	});
});
