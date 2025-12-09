import CodeBlock from '$lib/components/CodeBlock.svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

describe('CodeBlock.svelte', () => {
	it('코드와 복사 버튼이 렌더링되어야 한다', async () => {
		const testCode = 'const greeting = "Hello, World!";';
		render(CodeBlock, { code: testCode, language: 'javascript' });

		// 복사 버튼이 있어야 함
		const copyButton = page.getByRole('button', { name: /copy/i });
		await expect.element(copyButton).toBeInTheDocument();
	});

	it('코드 내용이 화면에 표시되어야 한다', async () => {
		const testCode = 'function test() { return 42; }';
		render(CodeBlock, { code: testCode, language: 'typescript' });

		// 코드 콘텐츠가 화면에 표시되어야 함 (하이라이팅 전 fallback 또는 하이라이팅 후)
		const container = page.getByText(/function test/);
		await expect.element(container).toBeInTheDocument();
	});
});
