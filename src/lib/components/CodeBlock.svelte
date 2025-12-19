<script lang="ts">
	// 동적 import를 위해 타입만 import (런타임 번들에 포함되지 않음)
	import type { BundledLanguage, BundledTheme } from "shiki";

	import { DsCopyButton, DsTooltip } from "$lib/components/design-system";
	import { getHighlighterForLanguage } from "$lib/components/code-block/shiki";

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

	// 언어 이름 정규화 (Shiki에서 지원하는 이름으로 변환)
	function normalizeLanguage(lang: string): BundledLanguage {
		const langMap: Record<string, BundledLanguage> = {
			// 별칭 → 정식 언어명
			ts: "typescript",
			js: "javascript",
			py: "python",
			rs: "rust",
			yml: "yaml",
			md: "markdown",
			// 웹 기술
			toml: "toml",
			json: "json",
			jsonc: "jsonc",
			html: "html",
			css: "css",
			scss: "scss",
			svelte: "svelte",
			astro: "astro",
			// JSX/TSX
			jsx: "jsx",
			tsx: "tsx",
			// 쉘/스크립트
			sh: "bash",
			bash: "bash",
			shell: "bash",
			sql: "sql",
			// 시스템/컴파일 언어
			c: "c",
			cpp: "cpp",
			"c++": "cpp",
			go: "go",
			java: "java",
			zig: "zig",
			asm: "asm",
			// 함수형/기타 언어
			julia: "julia",
			elixir: "elixir",
			gleam: "gleam",
		};
		const normalized = lang.toLowerCase();
		// 별칭이 있으면 정식 이름으로 변환, 없으면 Shiki에게 그대로 전달
		return (langMap[normalized] ?? normalized) as BundledLanguage;
	}

	// code 또는 language prop 변경 시 자동 재하이라이트 (Svelte 5 runes)
	$effect(() => {
		let active = true; // Race condition 방지
		const currentCode = code;
		const currentLang = normalizeLanguage(language);
		const currentTheme = theme;

		// 하이라이팅 실행
		(async () => {
			try {
				const highlighter = await getHighlighterForLanguage(currentLang);

				const html = highlighter.codeToHtml(currentCode, {
					lang: currentLang,
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
