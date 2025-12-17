import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import DsSeparator from '$lib/components/design-system/Separator.svelte';

let unmount: (() => void) | undefined;

afterEach(() => {
	unmount?.();
	unmount = undefined;
});

describe('DsSeparator', () => {
	it('decorative 기본값은 SR에서 숨겨야 한다', async () => {
		const result = render(DsSeparator, { 'data-testid': 'sep' });
		unmount = result.unmount;

		const el = page.getByTestId('sep');
		await expect.element(el).toHaveAttribute('aria-hidden', 'true');
	});

	it('semantic separator는 role/orientation/label이 설정되어야 한다', async () => {
		const result = render(DsSeparator, {
			decorative: false,
			orientation: 'vertical',
			label: 'Section divider'
		});
		unmount = result.unmount;

		const el = page.getByRole('separator', { name: 'Section divider' });
		await expect.element(el).toHaveAttribute('aria-orientation', 'vertical');
	});
});
