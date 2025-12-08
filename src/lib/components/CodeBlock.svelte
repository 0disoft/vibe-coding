<script lang="ts">
	import hljs from 'highlight.js/lib/core';

	// 지원 언어 목록
	const LANGUAGE_MAP: Record<string, string[]> = {
		typescript: ['typescript', 'ts'],
		javascript: ['javascript', 'js'],
		xml: ['html', 'xml', 'svg'], // HTML은 xml 언어 사용
		css: ['css', 'scss', 'less'],
		python: ['python', 'py'],
		go: ['go', 'golang'],
		rust: ['rust', 'rs'],
		json: ['json'],
		yaml: ['yaml', 'yml'],
		ini: ['ini', 'toml'], // TOML은 INI 하이라이터로 처리
		markdown: ['markdown', 'md']
	};

	// 언어 import 맵
	const LANGUAGE_IMPORTS: Record<string, () => Promise<any>> = {
		typescript: () => import('highlight.js/lib/languages/typescript'),
		javascript: () => import('highlight.js/lib/languages/javascript'),
		xml: () => import('highlight.js/lib/languages/xml'),
		css: () => import('highlight.js/lib/languages/css'),
		python: () => import('highlight.js/lib/languages/python'),
		go: () => import('highlight.js/lib/languages/go'),
		rust: () => import('highlight.js/lib/languages/rust'),
		json: () => import('highlight.js/lib/languages/json'),
		yaml: () => import('highlight.js/lib/languages/yaml'),
		ini: () => import('highlight.js/lib/languages/ini'),
		markdown: () => import('highlight.js/lib/languages/markdown')
	};

	// 이미 등록된 언어 추적
	const registeredLanguages = new Set<string>();

	interface Props {
		code: string;
		language?: string;
	}

	let { code, language = 'typescript' }: Props = $props();

	let copied = $state(false);
	let codeElement: HTMLElement | undefined = $state();

	async function copyCode() {
		// hljs가 DOM을 변경해도 원본 코드를 복사할 수 있도록 code prop 직접 사용
		await navigator.clipboard.writeText(code);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	// 언어 이름 정규화 (예: 'ts' -> 'typescript', 'html' -> 'xml')
	function normalizeLanguage(lang: string): string {
		const normalized = lang.toLowerCase();
		for (const [moduleName, aliases] of Object.entries(LANGUAGE_MAP)) {
			if (aliases.includes(normalized)) {
				return moduleName;
			}
		}
		return normalized;
	}

	// 동적으로 언어 로드 및 등록
	async function loadLanguage(lang: string): Promise<boolean> {
		const moduleName = normalizeLanguage(lang);

		if (registeredLanguages.has(moduleName)) {
			return true;
		}

		const importFn = LANGUAGE_IMPORTS[moduleName];
		if (!importFn) {
			console.warn(`[CodeBlock] Language "${lang}" is not supported`);
			return false;
		}

		try {
			const module = await importFn();
			hljs.registerLanguage(moduleName, module.default);

			// 별칭도 등록
			const aliases = LANGUAGE_MAP[moduleName] || [];
			for (const alias of aliases) {
				if (alias !== moduleName) {
					hljs.registerLanguage(alias, module.default);
				}
			}

			registeredLanguages.add(moduleName);
			return true;
		} catch (error) {
			console.error(`[CodeBlock] Failed to load language "${lang}":`, error);
			return false;
		}
	}

	// code 또는 language prop 변경 시 자동 재하이라이트 (Svelte 5 runes)
	$effect(() => {
		// 의존성 추적을 위해 참조
		const currentCode = code;
		const currentLang = language;

		if (codeElement) {
			// hljs가 DOM을 <span>으로 변환한 상태에서 prop이 바뀌면 Svelte와 충돌 가능
			// 따라서 하이라이트 전에 DOM을 원본 텍스트로 리셋
			codeElement.textContent = currentCode;
			// hljs는 이 속성으로 중복 하이라이트를 방지하므로 재하이라이트 시 제거
			codeElement.removeAttribute('data-highlighted');

			loadLanguage(currentLang).then(() => {
				// 비동기 로딩 중 코드가 바뀌었을 수 있으므로 체크
				if (codeElement && codeElement.textContent === currentCode) {
					hljs.highlightElement(codeElement);
				}
			});
		}
	});
</script>

<div class="relative">
	<button
		type="button"
		onclick={copyCode}
		class="absolute right-2 top-2 rounded-md bg-muted/80 px-2 py-1 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
	>
		{copied ? '✓ Copied!' : '📋 Copy'}
	</button>
	<pre class="hljs"><code bind:this={codeElement} class="language-{language}">{code}</code></pre>
</div>
