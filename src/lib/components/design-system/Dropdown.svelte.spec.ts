import { afterEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import DsDropdown from '$lib/components/design-system/Dropdown.svelte';

let unmount: (() => void) | undefined;

afterEach(() => {
	unmount?.();
	unmount = undefined;
});

describe('DsDropdown', () => {
	it('menu 모드에서 키보드로 이동/닫힘이 동작해야 한다', async () => {
		const onSelect = vi.fn();

		const result = render(DsDropdown, {
			label: 'Menu',
			items: [
				{ id: 'alpha', label: 'Alpha' },
				{ id: 'beta', label: 'Beta' },
				{ id: 'gamma', label: 'Gamma' }
			],
			onSelect
		});
		unmount = result.unmount;

		const trigger = page.getByRole('button', { name: 'Menu' });
		await trigger.click();

		const alpha = page.getByRole('menuitem', { name: 'Alpha' });
		await expect.element(alpha).toHaveFocus();

		alpha.element().dispatchEvent(
			new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
		);

		const beta = page.getByRole('menuitem', { name: 'Beta' });
		await expect.element(beta).toHaveFocus();

		await beta.click();
		expect(onSelect).toHaveBeenCalledWith('beta');

		await expect.element(trigger).toHaveFocus();

		await trigger.click();
		await expect.element(page.getByRole('menu')).toBeInTheDocument();

		const gamma = page.getByRole('menuitem', { name: 'Gamma' });
		gamma.element().dispatchEvent(
			new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
		);

		await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
		await expect.element(trigger).toHaveFocus();
	});

	it('listbox 모드에서 role/aria-haspopup이 일치해야 한다', async () => {
		const result = render(DsDropdown, {
			label: 'Pick',
			haspopup: 'listbox',
			items: [
				{ id: 'alpha', label: 'Alpha' },
				{ id: 'beta', label: 'Beta' }
			],
			onSelect: vi.fn()
		});
		unmount = result.unmount;

		const trigger = page.getByRole('button', { name: 'Pick' });
		await expect.element(trigger).toHaveAttribute('aria-haspopup', 'listbox');

		await trigger.click();
		await expect.element(page.getByRole('listbox')).toBeInTheDocument();

		const optionAlpha = page.getByRole('option', { name: 'Alpha' });
		await expect.element(optionAlpha).toHaveFocus();
	});
});

