import { afterEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import CodeBlock from '$lib/components/CodeBlock.svelte';

// 렌더 결과에서 unmount 함수 추출 (자동 cleanup 보강)
let unmount: (() => void) | undefined;

afterEach(() => {
	unmount?.();
	unmount = undefined;
});

describe('CodeBlock.svelte', () => {
	it('코드가 pre code 안에 렌더링되고 복사 버튼이 노출되어야 한다', async () => {
		const testCode = 'const greeting = "Hello, World!";';
		const result = render(CodeBlock, { code: testCode, language: 'javascript' });
		unmount = result.unmount;

		// pre code 요소 내에 코드가 렌더링되는지 확인 (fallback 또는 하이라이팅 후)
		const codeEl = page.getByText(testCode);
		await expect.element(codeEl).toBeInTheDocument();

		// 복사 버튼 확인 (aria-label 기반 - 컴포넌트는 'Copy code' 사용)
		const copyButton = page.getByRole('button', { name: /copy code/i });
		await expect.element(copyButton).toBeInTheDocument();
	});

	it('복사 버튼 클릭 시 clipboard에 코드가 기록되어야 한다', async () => {
		const testCode = 'function test() { return 42; }';

		// clipboard API 모킹
		const writeText = vi.fn().mockResolvedValue(undefined);
		const originalClipboard = navigator.clipboard;
		Object.defineProperty(navigator, 'clipboard', {
			value: { writeText },
			configurable: true
		});

		try {
			const result = render(CodeBlock, { code: testCode, language: 'typescript' });
			unmount = result.unmount;

			const copyButton = page.getByRole('button', { name: /copy code/i });
			await copyButton.click();

			// clipboard.writeText가 올바른 코드로 호출되었는지 검증
			expect(writeText).toHaveBeenCalledWith(testCode);
		} finally {
			// clipboard 복원
			Object.defineProperty(navigator, 'clipboard', {
				value: originalClipboard,
				configurable: true
			});
		}
	});

	it('복사 후 버튼 상태가 변경되어야 한다', async () => {
		const testCode = 'export const copied = true;';

		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, 'clipboard', {
			value: { writeText },
			configurable: true
		});

		const result = render(CodeBlock, { code: testCode, language: 'javascript' });
		unmount = result.unmount;

		const copyButton = page.getByRole('button', { name: /copy code/i });
		await copyButton.click();

		// 복사 후 UI 상태 변경 확인 (aria-label이 'Copied to clipboard'로 변경)
		const copiedButton = page.getByRole('button', { name: /copied to clipboard/i });
		await expect.element(copiedButton).toBeInTheDocument();
	});
});
