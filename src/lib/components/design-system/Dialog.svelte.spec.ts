import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import DialogTestHost from '$lib/components/design-system/__test__/DialogTestHost.svelte';

let unmount: (() => void) | undefined;

afterEach(() => {
	unmount?.();
	unmount = undefined;
});

function sleep(ms: number) {
	return new Promise((resolve) => window.setTimeout(resolve, ms));
}

describe('DsDialog a11y', () => {
	it('SR 속성(이름/설명)과 initial focus가 동작해야 한다', async () => {
		const result = render(DialogTestHost);
		unmount = result.unmount;

		const trigger = page.getByRole('button', { name: 'Open Dialog' });
		await trigger.click();

		const dialog = page.getByRole('dialog', { name: 'Test Dialog' });
		await expect.element(dialog).toBeInTheDocument();
		await expect.element(dialog).toHaveAttribute('aria-modal', 'true');

		const describedBy = dialog.element().getAttribute('aria-describedby');
		expect(describedBy).toBeTruthy();
		if (describedBy) {
			const descEl = document.getElementById(describedBy);
			expect(descEl?.textContent).toContain('Dialog description');
		}

		const first = page.getByRole('button', { name: 'First focus' });
		await expect.element(first).toHaveFocus();
	});

	it('ESC(cancel)로 닫히고 트리거로 포커스가 복귀해야 한다', async () => {
		const result = render(DialogTestHost);
		unmount = result.unmount;

		const trigger = page.getByRole('button', { name: 'Open Dialog' });
		await trigger.click();

		const dialog = page.getByRole('dialog', { name: 'Test Dialog' });
		await expect.element(dialog).toBeInTheDocument();

		dialog.element().dispatchEvent(new Event('cancel', { cancelable: true }));

		await expect.element(page.getByRole('dialog', { name: 'Test Dialog' })).not.toBeInTheDocument();
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

		try {
			const result = render(DialogTestHost);
			unmount = result.unmount;

			const trigger = page.getByRole('button', { name: 'Open Dialog' });
			await trigger.click();

			const close = page.getByRole('button', { name: 'Close dialog' });
			await close.click();

			// 애니메이션 경로(약 200ms) 대신, 짧은 시간 내에 닫힘을 확인
			await sleep(50);
			await expect
				.element(page.getByRole('dialog', { name: 'Test Dialog' }))
				.not.toBeInTheDocument();
		} finally {
			window.matchMedia = originalMatchMedia;
		}
	});
});
