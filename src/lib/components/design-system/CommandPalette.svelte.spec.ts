import { afterEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import CommandPaletteTestHost from '$lib/components/design-system/__test__/CommandPaletteTestHost.svelte';

let unmount: (() => void) | undefined;

afterEach(() => {
	unmount?.();
	unmount = undefined;
});

function dispatchKey(el: Element, key: string) {
	el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

function sleep(ms: number) {
	return new Promise((resolve) => window.setTimeout(resolve, ms));
}

describe('DsCommandPalette a11y', () => {
	it('combobox/listbox/option 시맨틱과 aria-activedescendant가 일치해야 한다', async () => {
		const onSelect = vi.fn();

		const result = render(CommandPaletteTestHost, {
			items: [
				{ id: 'disabled', label: 'Disabled', disabled: true },
				{ id: 'profile', label: 'Profile', description: 'Go to profile' },
				{ id: 'settings', label: 'Settings' }
			],
			onSelect
		});
		unmount = result.unmount;

		const trigger = page.getByRole('button', { name: 'Open Palette' });
		await trigger.click();

		const input = page.getByRole('combobox', { name: 'Search commands' });
		await expect.element(input).toBeInTheDocument();
		await expect.element(input).toHaveAttribute('aria-haspopup', 'listbox');

		const listbox = page.getByRole('listbox', { name: 'Commands' });
		await expect.element(listbox).toBeInTheDocument();

		const profile = page.getByRole('option', { name: 'Profile' });
		await expect.element(profile).toHaveAttribute('aria-selected', 'true');

		const activeId = input.element().getAttribute('aria-activedescendant');
		expect(activeId).toBeTruthy();
		if (activeId) {
			expect(profile.element().id).toBe(activeId);
		}
	});

	it('Arrow/Enter 키가 disabled를 스킵하며 선택 후 닫히고 포커스가 복귀해야 한다', async () => {
		const onSelect = vi.fn();

		const result = render(CommandPaletteTestHost, {
			items: [
				{ id: 'disabled', label: 'Disabled', disabled: true },
				{ id: 'profile', label: 'Profile' },
				{ id: 'settings', label: 'Settings' }
			],
			onSelect
		});
		unmount = result.unmount;

		const trigger = page.getByRole('button', { name: 'Open Palette' });
		await trigger.click();

		const input = page.getByRole('combobox', { name: 'Search commands' });
		await expect.element(input).toBeInTheDocument();
		await expect.element(input).toHaveFocus();

		// initial: Profile (disabled 스킵)
		await expect
			.element(page.getByRole('option', { name: 'Profile' }))
			.toHaveAttribute('aria-selected', 'true');

		dispatchKey(input.element(), 'ArrowDown');
		await expect
			.element(page.getByRole('option', { name: 'Settings' }))
			.toHaveAttribute('aria-selected', 'true');

		dispatchKey(input.element(), 'ArrowUp');
		await expect
			.element(page.getByRole('option', { name: 'Profile' }))
			.toHaveAttribute('aria-selected', 'true');

		dispatchKey(input.element(), 'Enter');
		expect(onSelect).toHaveBeenCalledWith('profile');

		await expect.element(page.getByRole('dialog', { name: 'Commands' })).not.toBeInTheDocument();
		await expect.element(trigger).toHaveFocus();
	});

	it('reduced-motion에서는 닫힘이 빠르게 완료되어야 한다', async () => {
		const originalMatchMedia = window.matchMedia;
		const createReducedMotionMql = (query: string): MediaQueryList => {
			const noop = () => {};
			return {
				matches: true,
				media: query,
				onchange: null,
				addEventListener: noop as MediaQueryList['addEventListener'],
				removeEventListener: noop as MediaQueryList['removeEventListener'],
				addListener: noop as MediaQueryList['addListener'],
				removeListener: noop as MediaQueryList['removeListener'],
				dispatchEvent: (() => false) as MediaQueryList['dispatchEvent']
			};
		};

		window.matchMedia = (query: string) => {
			if (query.includes('prefers-reduced-motion')) {
				return createReducedMotionMql(query);
			}

			return originalMatchMedia(query);
		};

		const onSelect = vi.fn();

		try {
			const result = render(CommandPaletteTestHost, {
				items: [
					{ id: 'alpha', label: 'Alpha' },
					{ id: 'beta', label: 'Beta' }
				],
				onSelect
			});
			unmount = result.unmount;

			const trigger = page.getByRole('button', { name: 'Open Palette' });
			await trigger.click();

			const input = page.getByRole('combobox', { name: 'Search commands' });
			dispatchKey(input.element(), 'Enter');

			await sleep(50);
			await expect.element(page.getByRole('dialog', { name: 'Commands' })).not.toBeInTheDocument();
		} finally {
			window.matchMedia = originalMatchMedia;
		}
	});
});
