import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import DatePickerTestHost from '$lib/components/design-system/__test__/DatePickerTestHost.svelte';

let unmount: (() => void) | undefined;

afterEach(() => {
	unmount?.();
	unmount = undefined;
});

describe('DsDatePicker', () => {
	it('트리거로 열리고, 날짜 선택 시 닫히며 값이 반영되어야 한다', async () => {
		const result = render(DatePickerTestHost);
		unmount = result.unmount;

		const trigger = page.getByRole('button', { name: 'Pick a date' });
		await trigger.click();

		const dialog = page.getByRole('dialog', { name: 'Pick a date' });
		await expect.element(dialog).toBeInTheDocument();

		await page.getByTestId('ds-calendar-day-2025-01-16').click();

		await expect.element(page.getByTestId('date-picker-value')).toHaveTextContent('2025-01-16');
		await expect.element(page.getByRole('dialog', { name: 'Pick a date' })).not.toBeInTheDocument();
		await expect.element(trigger).toHaveFocus();
	});

	it('Clear로 값을 비울 수 있어야 한다', async () => {
		const result = render(DatePickerTestHost, { initial: '2025-01-16' });
		unmount = result.unmount;

		const trigger = page.getByRole('button', { name: 'Pick a date' });
		await trigger.click();

		await page.getByRole('button', { name: 'Clear' }).click();
		await expect.element(page.getByTestId('date-picker-value')).toHaveTextContent('');
	});
});
