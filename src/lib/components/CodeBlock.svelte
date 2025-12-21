<script lang="ts">
	// 동적 import를 위해 타입만 import (런타임 번들에 포함되지 않음)
	import type { BundledTheme } from "shiki";

	import {
		getHighlighterForLanguage,
		resolveLanguageOrText,
	} from "$lib/components/code-block/shiki";
	import { DsCopyButton, DsTooltip } from "$lib/components/design-system";
	import * as m from "$lib/paraglide/messages.js";

	interface Props {
		id?: string;
		code: string;
		language?: string;
		theme?: BundledTheme;
		ariaLabel?: string;
		showLanguageBadge?: boolean;
	}

	const generatedId = $props.id();

	let {
		id: idProp,
		code,
		language = "typescript",
		theme = "catppuccin-mocha",
		ariaLabel = m.codeblock_aria_label(),
		showLanguageBadge = true,
	}: Props = $props();

	let id = $derived(idProp ?? generatedId);
	let badgeId = $derived(`${id}-language`);
	let badgeLabel = $derived(
		language && language.trim().length > 0 ? language.toUpperCase() : "TEXT",
	);
	let ariaLabelledBy = $derived(showLanguageBadge ? badgeId : undefined);
	let ariaLabelValue = $derived(showLanguageBadge ? undefined : ariaLabel);
	let copyLabel = $derived(m.codeblock_copy());
	let copiedLabel = $derived(m.codeblock_copied());
	let loadingLabel = $derived(m.codeblock_loading());
	let loadingId = $derived(`${id}-loading`);

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

<div {id} class="ds-code-block-shell group w-full">
	{#if highlightedHtml}
		<!-- Shiki wrapper color override -->
		<div
			class="ds-code-block-content ds-focus-ring overflow-auto [&>pre]:!m-0 [&>pre]:!p-[1.125rem] [&>pre]:!bg-transparent [&>pre]:!rounded-[inherit]"
			data-lenis-prevent
			tabindex="0"
			role="textbox"
			aria-readonly="true"
			aria-multiline="true"
			aria-label={ariaLabelValue}
			aria-labelledby={ariaLabelledBy}
		>
			<div class="ds-code-block-header">
				{#if showLanguageBadge}
					<span id={badgeId} class="ds-code-block-badge">
						{badgeLabel}
					</span>
				{/if}
				<DsTooltip
					as="div"
					content={copyLabel}
					class="ds-code-block-copy"
				>
					{#snippet children(trigger)}
						<DsCopyButton
							size="xs"
							variant="ghost"
							intent="neutral"
							touchTarget={false}
							label={copyLabel}
							copiedLabel={copiedLabel}
							text={code}
							describedBy={trigger["aria-describedby"]}
							style="background-color: oklch(var(--color-surface) / 0.8); color: oklch(var(--color-text)); backdrop-filter: blur(4px);"
						/>
					{/snippet}
				</DsTooltip>
			</div>
			{@html highlightedHtml}<!-- security-ignore: xss-svelte-html -->
		</div>
	{:else}
		<!-- Fallback: 하이라이팅 로딩 중에도 코드는 즉시 노출 (테스트/UX 안정성) -->
		<div
			class="ds-code-block-content ds-focus-ring overflow-auto"
			data-lenis-prevent
			tabindex="0"
			role="textbox"
			aria-readonly="true"
			aria-multiline="true"
			aria-label={ariaLabelValue}
			aria-labelledby={ariaLabelledBy}
			aria-busy="true"
			aria-describedby={loadingId}
		>
			<span id={loadingId} class="sr-only" aria-live="polite">
				{loadingLabel}
			</span>
			<div class="ds-code-block-header">
				{#if showLanguageBadge}
					<span id={badgeId} class="ds-code-block-badge">
						{badgeLabel}
					</span>
				{/if}
				<DsTooltip
					as="div"
					content={copyLabel}
					class="ds-code-block-copy"
				>
					{#snippet children(trigger)}
						<DsCopyButton
							size="xs"
							variant="ghost"
							intent="neutral"
							touchTarget={false}
							label={copyLabel}
							copiedLabel={copiedLabel}
							text={code}
							describedBy={trigger["aria-describedby"]}
							style="background-color: oklch(var(--color-surface) / 0.8); color: oklch(var(--color-text)); backdrop-filter: blur(4px);"
						/>
					{/snippet}
				</DsTooltip>
			</div>
			<pre class="!m-0 !p-[1.125rem] !bg-transparent !rounded-[inherit]"><code
					>{code}</code
				></pre>
		</div>
	{/if}
</div>
