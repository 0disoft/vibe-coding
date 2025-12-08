<script lang="ts">
	import {
		createHighlighter,
		type BundledLanguage,
		type BundledTheme,
		type Highlighter
	} from 'shiki';

	interface Props {
		code: string;
		language?: string;
		theme?: BundledTheme;
	}

	let { code, language = 'typescript', theme = 'catppuccin-mocha' }: Props = $props();

	let copied = $state(false);
	let highlightedHtml = $state('');

	// 싱글톤 highlighter 인스턴스 (언어 추가 시 재사용)
	let highlighterPromise: Promise<Highlighter> | null = null;
	const loadedLanguages = new Set<string>();

	// 프로젝트에서 주로 사용하는 언어들만 초기 로드
	const INITIAL_LANGUAGES: BundledLanguage[] = [
		'typescript',
		'javascript',
		'json',
		'html',
		'css',
		'svelte',
		'bash',
		'markdown'
	];

	// 사용 가능한 테마 (필요시 추가)
	const THEMES: BundledTheme[] = ['catppuccin-mocha', 'github-dark', 'github-light'];

	// highlighter 인스턴스 가져오기 (lazy 로드)
	async function getHighlighter(): Promise<Highlighter> {
		if (!highlighterPromise) {
			highlighterPromise = createHighlighter({
				themes: THEMES,
				langs: INITIAL_LANGUAGES
			});
			// 초기 언어들을 로드된 것으로 표시
			INITIAL_LANGUAGES.forEach((lang) => loadedLanguages.add(lang));
		}
		return highlighterPromise;
	}

	// 언어 이름 정규화 (Shiki에서 지원하는 이름으로 변환)
	function normalizeLanguage(lang: string): BundledLanguage {
		const langMap: Record<string, BundledLanguage> = {
			// 별칭 → 정식 언어명
			ts: 'typescript',
			js: 'javascript',
			py: 'python',
			rs: 'rust',
			yml: 'yaml',
			md: 'markdown',
			// 웹 기술
			toml: 'toml',
			json: 'json',
			jsonc: 'jsonc',
			html: 'html',
			css: 'css',
			scss: 'scss',
			svelte: 'svelte',
			astro: 'astro',
			// JSX/TSX
			jsx: 'jsx',
			tsx: 'tsx',
			// 쉘/스크립트
			sh: 'bash',
			bash: 'bash',
			shell: 'bash',
			sql: 'sql',
			// 시스템/컴파일 언어
			c: 'c',
			cpp: 'cpp',
			'c++': 'cpp',
			go: 'go',
			java: 'java',
			zig: 'zig',
			asm: 'asm',
			// 함수형/기타 언어
			julia: 'julia',
			elixir: 'elixir',
			gleam: 'gleam'
			// mojo: Shiki 미지원 (2025-12 기준)
		};
		const normalized = lang.toLowerCase();
		// 별칭이 있으면 정식 이름으로 변환, 없으면 Shiki에게 그대로 전달
		return (langMap[normalized] ?? normalized) as BundledLanguage;
	}

	async function copyCode() {
		try {
			await navigator.clipboard.writeText(code);
			copied = true;
			setTimeout(() => (copied = false), 1500);
		} catch (error) {
			console.error('[CodeBlock] Failed to copy:', error);
		}
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
				const highlighter = await getHighlighter();

				// 아직 로드되지 않은 언어면 동적 로드
				if (!loadedLanguages.has(currentLang)) {
					await highlighter.loadLanguage(currentLang);
					loadedLanguages.add(currentLang);
				}

				const html = highlighter.codeToHtml(currentCode, {
					lang: currentLang,
					theme: currentTheme
				});

				if (active) highlightedHtml = html;
			} catch (error) {
				if (active) {
					console.error(`[CodeBlock] Failed to highlight code:`, error);
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
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');
	}
</script>

<div class="relative [&>pre]:!my-0 [&>pre]:!rounded-lg [&>pre]:!p-4">
	<button
		type="button"
		onclick={copyCode}
		aria-label={copied ? 'Copied to clipboard' : 'Copy code'}
		class="absolute right-2 top-2 z-10 rounded-md bg-muted/80 px-2 py-1 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
	>
		{copied ? '✓ Copied!' : '📋 Copy'}
	</button>
	{#if highlightedHtml}
		{@html highlightedHtml}
	{:else}
		<!-- 로딩 중 fallback -->
		<pre class="rounded-lg bg-muted p-4"><code class="text-sm">{code}</code></pre>
	{/if}
</div>
