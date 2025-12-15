#!/usr/bin/env bun
/**
 * tokens-manifest.ts
 * 디자인 시스템 토큰을 CSS에서 추출해 사람이 보기 좋은 MD/JSON으로 정리합니다.
 *
 * 기본 소스:
 * - src/styles/design-system.tokens.css
 * - src/styles/design-system-lab.tokens.css
 *
 * 사용법:
 *   bun .vibe-coding/TOOLS/design-system/tokens-manifest.ts [옵션]
 *
 * 옵션:
 *   --out <dir>      출력 디렉토리 (기본: .vibe-coding/TOOLS/design-system)
 *   --json-only      JSON만 출력/저장
 *   --md-only        MD만 출력/저장
 *   --print          파일 저장 없이 stdout 출력
 *   --stable         생성 시간을 고정해(diff-friendly) 출력
 *   --verify         현재 출력물(TOKENS.md, tokens.manifest.json)이 최신인지 검증(불일치/진단 이슈 시 exit 1)
 *   --help, -h       도움말
 *
 * 예시:
 *   bun .vibe-coding/TOOLS/design-system/tokens-manifest.ts
 *   bun .vibe-coding/TOOLS/design-system/tokens-manifest.ts --print
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

type Theme = "light" | "dark" | "shared" | "other";
type Category =
	| "rawColor"
	| "semanticColor"
	| "unocssColorVar"
	| "a11y"
	| "component"
	| "typography"
	| "other";

interface TokenOccurrence {
	name: string;
	file: string;
	line: number;
	contextPath: string;
	theme: Theme;
	value: string;
}

interface TokenEntry {
	name: string;
	category: Category;
	occurrences: TokenOccurrence[];
}

interface Manifest {
	generatedAt: string;
	sources: string[];
	semanticColorsFromUno: string[];
	tokens: TokenEntry[];
	diagnostics: {
		duplicateInTheme: Array<{
			name: string;
			theme: Theme;
			values: string[];
			contexts: string[];
		}>;
	};
}

const DEFAULT_SOURCES = [
	"src/styles/design-system.tokens.css",
	"src/styles/design-system-lab.tokens.css",
];

function printHelp(): void {
	console.log(`
🧾 tokens-manifest.ts — 디자인 시스템 토큰 매니페스트 생성

사용법:
  bun .vibe-coding/TOOLS/design-system/tokens-manifest.ts [옵션]

옵션:
  --out <dir>      출력 디렉토리 (기본: .vibe-coding/TOOLS/design-system)
  --json-only      JSON만 출력/저장
  --md-only        MD만 출력/저장
  --print          파일 저장 없이 stdout 출력
  --stable         생성 시간을 고정해(diff-friendly) 출력
  --verify         현재 출력물이 최신인지 검증(불일치/진단 이슈 시 exit 1)
  --help, -h       도움말
`);
}

function stripBlockComments(input: string): string {
	return input.replace(/\/\*[\s\S]*?\*\//g, "");
}

function countChar(haystack: string, needle: string): number {
	let n = 0;
	for (let i = 0; i < haystack.length; i++) {
		if (haystack[i] === needle) n++;
	}
	return n;
}

function normalizePath(p: string): string {
	return p.replace(/\\/g, "/");
}

function guessTheme(contextPath: string, tokenName: string): Theme {
	const ctx = contextPath.toLowerCase();

	if (ctx.includes("data-ds-theme=\"dark\"") || ctx.includes("data-theme=\"dark\"")) return "dark";
	if (ctx.includes("data-ds-theme=\"light\"")) return "light";

	// tokens.css의 :root는 light 기본값으로 취급
	if (ctx.startsWith(":root") && !ctx.includes("dark")) return "light";

	if (ctx.includes(".ds-lab")) return "shared";

	// forced-colors / prefers-contrast 같은 특수 케이스는 other
	if (ctx.includes("@media")) return "other";

	// 파일 레벨 fallback: 이름이 :root[data-theme="dark"]에서만 나오면 이미 dark로 잡힘
	if (tokenName.startsWith("--raw-color-") || tokenName.startsWith("--color-")) return "other";

	return "other";
}

function parseUnoSemanticColors(unoConfigPath: string): string[] {
	const content = readFileSync(unoConfigPath, "utf-8");
	const m = content.match(/const\s+semanticColors\s*=\s*\[([\s\S]*?)\]\s+as\s+const;/);
	if (!m) return [];
	const block = m[1];
	return Array.from(block.matchAll(/'([^']+)'/g)).map((x) => x[1]);
}

function classifyToken(name: string, semanticColorsFromUno: string[]): Category {
	if (name.startsWith("--raw-color-")) return "rawColor";
	if (name.startsWith("--color-")) return "semanticColor";

	if (name.startsWith("--focus-") || name.startsWith("--motion-") || name.startsWith("--touch-")) return "a11y";
	if (
		name.startsWith("--button-") ||
		name.startsWith("--input-") ||
		name.startsWith("--card-") ||
		name.startsWith("--field-") ||
		name.startsWith("--icon-") ||
		name.startsWith("--size-icon-") ||
		name.startsWith("--dialog-") ||
		name.startsWith("--dropdown-") ||
		name.startsWith("--tooltip-") ||
		name.startsWith("--toast-") ||
		name.startsWith("--shadow-") ||
		name.startsWith("--elevation-") ||
		name.startsWith("--z-") ||
		name.startsWith("--spacing-") ||
		name.startsWith("--radius-") ||
		name.startsWith("--opacity-") ||
		name.startsWith("--border-width")
	)
		return "component";

	if (
		name.startsWith("--fs-") ||
		name.startsWith("--lh-") ||
		name.startsWith("--font-") ||
		name.startsWith("--text-") ||
		name.startsWith("--line-height-") ||
		name.startsWith("--letter-spacing-") ||
		name.startsWith("--paragraph-spacing")
	)
		return "typography";

	const maybeLegacy = name.slice(2);
	if (semanticColorsFromUno.includes(maybeLegacy)) return "unocssColorVar";

	return "other";
}

function parseCssTokens(filePath: string, semanticColorsFromUno: string[], root: string): TokenOccurrence[] {
	const raw = readFileSync(filePath, "utf-8");
	const content = stripBlockComments(raw);
	const lines = content.split(/\r?\n/);

	const occurrences: TokenOccurrence[] = [];
	const contextStack: string[] = [];

	for (let i = 0; i < lines.length; i++) {
		const lineNo = i + 1;
		const line = lines[i];

		// 닫힘 먼저 처리 (라인 단위로 충분)
		const closeCount = countChar(line, "}");
		for (let c = 0; c < closeCount; c++) {
			contextStack.pop();
		}

		// 열림 처리
		if (line.includes("{")) {
			const before = line.split("{")[0]?.trim();
			const openCount = countChar(line, "{");
			for (let c = 0; c < openCount; c++) {
				contextStack.push(before && c === 0 ? before : before || "(anonymous)");
			}
		}

		// 토큰 추출 (선언은 단일 라인 가정)
		const m = line.match(/^\s*(--[A-Za-z0-9-_]+)\s*:\s*([^;]+);/);
		if (!m) continue;

		const name = m[1];
		const value = m[2].trim();
		const contextPath = contextStack.length ? contextStack.join(" > ") : "(global)";

		// 이 파일에서 관심 없는 토큰은 제외하지 않고 모두 수집하되, 분류는 나중에 한다.
		occurrences.push({
			name,
			file: normalizePath(relative(root, filePath)),
			line: lineNo,
			contextPath,
			theme: guessTheme(contextPath, name),
			value,
		});
	}

	// category 계산은 TokenEntry에서 수행하므로 여기서는 순수 추출만.
	// semanticColorsFromUno는 theme 추론/필터에 쓸 수 있어 인자로 둔다.
	void semanticColorsFromUno;

	return occurrences;
}

function groupTokens(occurrences: TokenOccurrence[], semanticColorsFromUno: string[]): TokenEntry[] {
	const byName = new Map<string, TokenOccurrence[]>();

	for (const occ of occurrences) {
		const list = byName.get(occ.name);
		if (list) list.push(occ);
		else byName.set(occ.name, [occ]);
	}

	const tokens: TokenEntry[] = [];
	for (const [name, occs] of byName) {
		tokens.push({
			name,
			category: classifyToken(name, semanticColorsFromUno),
			occurrences: occs,
		});
	}

	tokens.sort((a, b) => a.name.localeCompare(b.name));
	return tokens;
}

function computeDiagnostics(tokens: TokenEntry[]): Manifest["diagnostics"] {
	const duplicateInTheme: Manifest["diagnostics"]["duplicateInTheme"] = [];

	for (const t of tokens) {
		// 같은 토큰이 "같은 테마 + 같은 스코프(셀렉터/미디어 컨텍스트)" 안에서
		// 서로 다른 값으로 재정의된 경우만 문제로 취급한다.
		const byScope = new Map<string, TokenOccurrence[]>();

		for (const occ of t.occurrences) {
			const scopeKey = `${occ.theme}@@${occ.contextPath}`;
			const list = byScope.get(scopeKey) ?? [];
			list.push(occ);
			byScope.set(scopeKey, list);
		}

		for (const [scopeKey, occs] of byScope) {
			const values = Array.from(new Set(occs.map((o) => o.value)));
			if (values.length <= 1) continue;

			const [theme] = scopeKey.split("@@") as [Theme];
			duplicateInTheme.push({
				name: t.name,
				theme,
				values,
				contexts: occs.map((o) => `${o.contextPath} (${o.file}:${o.line})`),
			});
		}
	}

	duplicateInTheme.sort((a, b) => a.name.localeCompare(b.name));
	return { duplicateInTheme };
}

function formatValueCell(values: string[]): string {
	if (values.length === 0) return "";
	if (values.length === 1) return values[0];
	return values.join(" | ");
}

function escapePipes(input: string): string {
	return input.replace(/\|/g, "\\|");
}

function toMarkdown(manifest: Manifest): string {
	const lines: string[] = [];
	const tokensByCategory = new Map<Category, TokenEntry[]>();

	for (const t of manifest.tokens) {
		const list = tokensByCategory.get(t.category) ?? [];
		list.push(t);
		tokensByCategory.set(t.category, list);
	}

	const categoryOrder: Array<{ key: Category; title: string; }> = [
		{ key: "semanticColor", title: "시맨틱 색상 토큰 (`--color-*`)" },
		{ key: "rawColor", title: "원시 색상 토큰 (`--raw-color-*`)" },
		{ key: "unocssColorVar", title: "UnoCSS 호환 변수 (`--primary` 등)" },
		{ key: "a11y", title: "A11y/모션 토큰 (`--focus-*`, `--motion-*`, `--touch-*`)" },
		{ key: "component", title: "컴포넌트 토큰 (`--button-*`, `--input-*` 등)" },
		{ key: "typography", title: "타이포그래피 토큰 (`--fs-*`, `--font-*` 등)" },
		{ key: "other", title: "기타 토큰" },
	];

	lines.push("# TOKENS");
	lines.push("");
	lines.push("> 이 파일은 `.vibe-coding/TOOLS/design-system/tokens-manifest.ts`가 생성합니다.");
	lines.push("");
	lines.push(`- Generated at: \`${manifest.generatedAt}\``);
	lines.push("");
	lines.push("## Sources");
	lines.push("");
	for (const s of manifest.sources) {
		lines.push(`- \`${s}\``);
	}
	lines.push("");
	lines.push("## Semantic Colors (UnoCSS)");
	lines.push("");
	lines.push("`uno.config.ts`에서 지원하는 시맨틱 컬러 이름들입니다. (예: `bg-*`, `text-*` 유틸에서 사용)");
	lines.push("");
	lines.push(manifest.semanticColorsFromUno.map((c) => `- \`${c}\``).join("\n"));
	lines.push("");

	for (const { key, title } of categoryOrder) {
		const list = tokensByCategory.get(key) ?? [];
		if (list.length === 0) continue;

		lines.push(`## ${title}`);
		lines.push("");
		lines.push("| Token | Light | Dark | Shared | Occurrences |");
		lines.push("| --- | --- | --- | --- | --- |");

		for (const t of list) {
			const byTheme = { light: [] as string[], dark: [] as string[], shared: [] as string[] };

			for (const occ of t.occurrences) {
				if (occ.theme === "light") byTheme.light.push(occ.value);
				else if (occ.theme === "dark") byTheme.dark.push(occ.value);
				else if (occ.theme === "shared") byTheme.shared.push(occ.value);
			}

			const uniqLight = Array.from(new Set(byTheme.light));
			const uniqDark = Array.from(new Set(byTheme.dark));
			const uniqShared = Array.from(new Set(byTheme.shared));

			const occCount = t.occurrences.length;
			const row = [
				`\`${t.name}\``,
				`\`${escapePipes(formatValueCell(uniqLight))}\``,
				`\`${escapePipes(formatValueCell(uniqDark))}\``,
				`\`${escapePipes(formatValueCell(uniqShared))}\``,
				`${occCount}`,
			];

			lines.push(`| ${row.join(" | ")} |`);
		}

		lines.push("");
	}

	if (manifest.diagnostics.duplicateInTheme.length) {
		lines.push("## Diagnostics");
		lines.push("");
		lines.push("### Duplicate Values In Same Theme");
		lines.push("");
		lines.push("같은 토큰이 같은 테마 스코프에서 서로 다른 값으로 선언된 경우입니다.");
		lines.push("");
		lines.push("| Token | Theme | Values | Contexts |");
		lines.push("| --- | --- | --- | --- |");

		for (const d of manifest.diagnostics.duplicateInTheme) {
			// markdownlint(MD033) 대응: 테이블 셀에 inline HTML(<br>)을 쓰지 않음
			const contexts = d.contexts.slice(0, 4).join("; ");
			const more = d.contexts.length > 4 ? `; ... +${d.contexts.length - 4}` : "";

			lines.push(
				`| \`${d.name}\` | \`${d.theme}\` | \`${escapePipes(d.values.join(" | "))}\` | ${escapePipes(contexts + more)} |`
			);
		}

		lines.push("");
	}

	return lines.join("\n");
}

function main(): void {
	const args = process.argv.slice(2);

	if (args.includes("--help") || args.includes("-h")) {
		printHelp();
		process.exit(0);
	}

	const printOnly = args.includes("--print");
	const jsonOnly = args.includes("--json-only");
	const mdOnly = args.includes("--md-only");
	const stable = args.includes("--stable");
	const verify = args.includes("--verify");

	const outIdx = args.indexOf("--out");
	const outDir = outIdx !== -1 ? args[outIdx + 1] : ".vibe-coding/TOOLS/design-system";
	const outAbs = resolve(outDir);

	const root = resolve(join(dirname(fileURLToPath(import.meta.url)), "../../.."));
	const unoPath = join(root, "uno.config.ts");
	const sources = DEFAULT_SOURCES.map((p) => join(root, p));

	const semanticColorsFromUno = parseUnoSemanticColors(unoPath);
	const allOccurrences = sources.flatMap((p) => parseCssTokens(p, semanticColorsFromUno, root));
	const tokens = groupTokens(allOccurrences, semanticColorsFromUno);
	const diagnostics = computeDiagnostics(tokens);

	const manifest: Manifest = {
		generatedAt: stable ? "stable" : new Date().toISOString(),
		sources: DEFAULT_SOURCES,
		semanticColorsFromUno,
		tokens,
		diagnostics,
	};

	const md = toMarkdown(manifest);
	const json = JSON.stringify(manifest, null, 2);

	if (printOnly) {
		if (!mdOnly) console.log(json);
		if (!jsonOnly) console.log(md);
		process.exit(0);
	}

	if (verify) {
		const problems: string[] = [];

		if (manifest.diagnostics.duplicateInTheme.length) {
			problems.push(
				`- Diagnostics: 같은 테마 스코프에서 서로 다른 값으로 선언된 토큰이 ${manifest.diagnostics.duplicateInTheme.length}개 있습니다.`
			);
		}

		const mdPath = join(outAbs, "TOKENS.md");
		const jsonPath = join(outAbs, "tokens.manifest.json");

		const safeRead = (path: string): string | null => {
			try {
				return readFileSync(path, "utf-8");
			} catch {
				return null;
			}
		};

		if (!jsonOnly) {
			const currentMd = safeRead(mdPath);
			if (currentMd !== md) problems.push(`- ${mdPath}: 최신 출력물과 불일치`);
		}
		if (!mdOnly) {
			const currentJson = safeRead(jsonPath);
			if (currentJson !== json) problems.push(`- ${jsonPath}: 최신 출력물과 불일치`);
		}

		if (problems.length) {
			console.error("❌ tokens manifest 검증 실패");
			console.error(problems.join("\n"));
			console.error("");
			console.error(
				"로컬에서 아래 명령으로 갱신하세요:\n  bun .vibe-coding/TOOLS/design-system/tokens-manifest.ts --stable"
			);
			process.exit(1);
		}

		console.log("✅ tokens manifest 최신 상태 확인 완료");
		process.exit(0);
	}

	mkdirSync(outAbs, { recursive: true });

	if (!mdOnly) {
		writeFileSync(join(outAbs, "tokens.manifest.json"), json, "utf-8");
	}
	if (!jsonOnly) {
		writeFileSync(join(outAbs, "TOKENS.md"), md, "utf-8");
	}

	console.log(`✅ tokens manifest 생성 완료: ${outAbs}`);
}

main();
