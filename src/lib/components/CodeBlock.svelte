<script lang="ts">
	// 동적 import를 위해 타입만 import (런타임 번들에 포함되지 않음)
	import type { BundledLanguage, BundledTheme } from "shiki";

	import { DsCopyButton, DsTooltip } from "$lib/components/design-system";
	import {
		getHighlighterForLanguage,
		resolveLanguageOrText,
	} from "$lib/components/code-block/shiki";

	interface Props {
		code: string;
		language?: string;
		theme?: BundledTheme;
	}

	let {
		code,
		language = "typescript",
		theme = "catppuccin-mocha",
	}: Props = $props();

	let highlightedHtml = $state("");

	// code 또는 language prop 변경 시 자동 재하이라이트 (Svelte 5 runes)
	$effect(() => {
		let active = true; // Race condition 방지
		const currentCode = code;
		const currentTheme = theme;

		// 하이라이팅 실행
		(async () => {
			try {
				const resolvedLang = await resolveLanguageOrText(language);
				if (resolvedLang === "text") {
					if (active) {
						highlightedHtml = `<pre><code>${escapeHtml(currentCode)}</code></pre>`;
					}
					return;
				}

				const highlighter = await getHighlighterForLanguage(resolvedLang);

				const html = highlighter.codeToHtml(currentCode, {
					lang: resolvedLang,
					theme: currentTheme,
				});

				if (active) highlightedHtml = html;
			} catch (error) {
				if (active) {
					if (import.meta.env.DEV) {
						console.error(`[CodeBlock] Failed to highlight code:`, error);
					}
					highlightedHtml = `<pre><code>${escapeHtml(currentCode)}</code></pre>`;
				}
			}
		})();

		return () => {
			active = false; // 이전 비동기 작업 결과 무시
		};
	});

	// HTML 이스케이프 함수 (fallback용)
	function escapeHtml(text: string): string {
		return text
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");
	}

	// 스타일은 src/styles/design-system.css 에서 디자인 시스템으로 관리합니다.
</script>

<div class="relative group w-full">
	<DsTooltip
		as="div"
		content="Copy code"
		class="transition-opacity opacity-0 group-hover:opacity-100 focus-within:opacity-100"
		style="position: absolute; right: 0.75rem; top: 0.75rem; z-index: 10;"
	>
		{#snippet children(trigger)}
			<DsCopyButton
				size="sm"
				variant="ghost"
				intent="neutral"
				touchTarget={false}
				label="Copy code"
				copiedLabel="Copied to clipboard"
				text={code}
				describedBy={trigger["aria-describedby"]}
				style="background-color: oklch(var(--color-surface) / 0.8); color: oklch(var(--color-text)); backdrop-filter: blur(4px);"
			/>
		{/snippet}
	</DsTooltip>

	{#if highlightedHtml}
		<!-- Shiki wrapper color override -->
		<div
			class="ds-code-block overflow-hidden [&>pre]:!m-0 [&>pre]:!p-[1.125rem] [&>pre]:!bg-transparent [&>pre]:!rounded-[inherit]"
		>
			{@html highlightedHtml}<!-- security-ignore: xss-svelte-html -->
		</div>
	{:else}
		<!-- Fallback: 하이라이팅 로딩 중에도 코드는 즉시 노출 (테스트/UX 안정성) -->
		<div class="ds-code-block overflow-hidden" aria-busy="true">
			<pre class="!m-0 !p-[1.125rem] !bg-transparent !rounded-[inherit]"><code
					>{code}</code
				></pre>
		</div>
	{/if}
</div>
