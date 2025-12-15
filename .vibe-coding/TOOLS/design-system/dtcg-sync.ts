#!/usr/bin/env bun
/**
 * dtcg-sync.ts
 * DTCG-ish 토큰(JSON)을 읽어서 CSS 토큰 파일로 생성/검증합니다.
 *
 * SSOT:
 * - .vibe-coding/TOOLS/design-system/tokens.dtcg.json
 *
 * Output:
 * - src/styles/design-system-lab.tokens.css
 *
 * 사용법:
 *   bun .vibe-coding/TOOLS/design-system/dtcg-sync.ts
 *
 * 옵션:
 *   --in <path>      입력 DTCG JSON 경로
 *   --out <path>     출력 CSS 경로
 *   --verify         출력물이 최신인지 검증(불일치 시 exit 1)
 *   --print          파일 저장 없이 stdout 출력
 *   --help, -h       도움말
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

type Mode = "light" | "dark";

type DtcgToken = {
  $type: string;
  $value: unknown;
  $description?: string;
};

function printHelp(): void {
  console.log(`
🧩 dtcg-sync.ts — DTCG 토큰 → CSS 토큰 파일 생성/검증

사용법:
  bun .vibe-coding/TOOLS/design-system/dtcg-sync.ts [옵션]

옵션:
  --in <path>      입력 DTCG JSON 경로 (기본: .vibe-coding/TOOLS/design-system/tokens.dtcg.json)
  --out <path>     출력 CSS 경로 (기본: preset에 따라 자동)
  --preset <name>  출력 프리셋 (lab|root, 기본: lab)
  --verify         출력물이 최신인지 검증(불일치 시 exit 1)
  --print          파일 저장 없이 stdout 출력
  --help, -h       도움말
`);
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isToken(v: unknown): v is DtcgToken {
  if (!isPlainObject(v)) return false;
  return typeof v.$type === "string" && Object.prototype.hasOwnProperty.call(v, "$value");
}

function toKebab(input: string): string {
  return input
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/_/g, "-")
    .toLowerCase();
}

function pathToCssVar(path: string): string {
  const parts = path.split(".").filter(Boolean);

  const startsWith = (...prefix: string[]): boolean =>
    prefix.length <= parts.length && prefix.every((p, i) => parts[i] === p);

  const tail = (n: number): string[] => parts.slice(n);
  const joinKebab = (xs: string[]): string => xs.map(toKebab).join("-");

  if (startsWith("raw", "color")) return `--raw-color-${joinKebab(tail(2))}`;
  if (startsWith("color")) return `--color-${joinKebab(tail(1))}`;
  if (startsWith("spacing")) return `--spacing-${joinKebab(tail(1))}`;
  if (startsWith("radius")) return `--radius-${joinKebab(tail(1))}`;
  if (startsWith("opacity")) return `--opacity-${joinKebab(tail(1))}`;
  if (startsWith("shadow")) return `--shadow-${joinKebab(tail(1))}`;
  if (startsWith("elevation")) return `--elevation-${joinKebab(tail(1))}`;
  if (startsWith("size", "icon")) return `--size-icon-${joinKebab(tail(2))}`;
  if (startsWith("icon")) return `--icon-${joinKebab(tail(1))}`;
  if (startsWith("z")) return `--z-${joinKebab(tail(1))}`;
  if (startsWith("focus", "ring")) return `--focus-ring-${joinKebab(tail(2))}`;
  if (startsWith("motion")) return `--motion-${joinKebab(tail(1))}`;

  if (startsWith("typography", "font", "family")) return `--font-family-${joinKebab(tail(3))}`;
  if (startsWith("typography", "font", "size")) return `--font-size-${joinKebab(tail(3))}`;
  if (startsWith("typography", "font", "weight")) return `--font-weight-${joinKebab(tail(3))}`;
  if (startsWith("typography", "lineHeight")) return `--line-height-${joinKebab(tail(2))}`;
  if (startsWith("typography", "letterSpacing")) return `--letter-spacing-${joinKebab(tail(2))}`;
  if (startsWith("typography", "paragraphSpacing")) return "--paragraph-spacing";

  if (startsWith("touch", "targetMin")) return "--touch-target-min";
  if (startsWith("border", "width")) return "--border-width";

  if (startsWith("component", "button")) return `--button-${joinKebab(tail(2))}`;
  if (startsWith("component", "input")) return `--input-${joinKebab(tail(2))}`;
  if (startsWith("component", "field")) return `--field-${joinKebab(tail(2))}`;
  if (startsWith("component", "dialog")) return `--dialog-${joinKebab(tail(2))}`;
  if (startsWith("component", "dropdown")) return `--dropdown-${joinKebab(tail(2))}`;
  if (startsWith("component", "tooltip")) return `--tooltip-${joinKebab(tail(2))}`;
  if (startsWith("component", "toast")) return `--toast-${joinKebab(tail(2))}`;

  return `--${joinKebab(parts)}`;
}

function renderCssValue(v: unknown): string {
  if (typeof v === "number") return String(v);
  if (typeof v === "string") {
    return v.replace(/\{([^}]+)\}/g, (_m, ref: string) => `var(${pathToCssVar(ref.trim())})`);
  }
  throw new Error(`지원하지 않는 $value 타입: ${typeof v}`);
}

function splitByMode(value: unknown): Record<Mode, unknown> | null {
  if (!isPlainObject(value)) return null;
  const hasLight = Object.prototype.hasOwnProperty.call(value, "light");
  const hasDark = Object.prototype.hasOwnProperty.call(value, "dark");
  if (!hasLight && !hasDark) return null;
  return { light: value.light, dark: value.dark };
}

type FlatToken = {
  path: string;
  token: DtcgToken;
};

function collectTokens(node: unknown, prefix: string[] = []): FlatToken[] {
  if (!isPlainObject(node)) return [];

  const out: FlatToken[] = [];
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith("$")) continue;
    const nextPrefix = [...prefix, key];

    if (isToken(value)) {
      out.push({ path: nextPrefix.join("."), token: value });
      continue;
    }

    out.push(...collectTokens(value, nextPrefix));
  }
  return out;
}

type Preset = "lab" | "root";

type SectionId =
  | "touch"
  | "spacing"
  | "radius"
  | "border"
  | "opacity"
  | "shadow"
  | "elevation"
  | "size.icon"
  | "icon"
  | "z"
  | "focus.ring"
  | "motion"
  | "typography"
  | "component.button"
  | "component.input"
  | "component.field"
  | "component.dialog"
  | "component.dropdown"
  | "component.tooltip"
  | "component.toast"
  | "raw.color"
  | "color"
  | "other";

function sectionOf(path: string): SectionId {
  const startsWith = (p: string): boolean => path === p || path.startsWith(`${p}.`);
  if (startsWith("raw.color")) return "raw.color";
  if (startsWith("color")) return "color";

  if (startsWith("touch")) return "touch";
  if (startsWith("spacing")) return "spacing";
  if (startsWith("radius")) return "radius";
  if (startsWith("border")) return "border";
  if (startsWith("opacity")) return "opacity";
  if (startsWith("shadow")) return "shadow";
  if (startsWith("elevation")) return "elevation";
  if (startsWith("size.icon")) return "size.icon";
  if (startsWith("icon")) return "icon";
  if (startsWith("z")) return "z";
  if (startsWith("focus.ring")) return "focus.ring";
  if (startsWith("motion")) return "motion";
  if (startsWith("typography")) return "typography";

  if (startsWith("component.button")) return "component.button";
  if (startsWith("component.input")) return "component.input";
  if (startsWith("component.field")) return "component.field";
  if (startsWith("component.dialog")) return "component.dialog";
  if (startsWith("component.dropdown")) return "component.dropdown";
  if (startsWith("component.tooltip")) return "component.tooltip";
  if (startsWith("component.toast")) return "component.toast";

  return "other";
}

function isThemeToken(path: string): boolean {
  return (
    path.startsWith("raw.color.") ||
    path.startsWith("color.") ||
    path === "focus.ring.color" ||
    path === "focus.ring.offsetColor"
  );
}

function sectionTitle(id: SectionId): string {
  switch (id) {
    case "touch":
      return "A11y / Touch";
    case "spacing":
      return "Spacing";
    case "radius":
      return "Radius";
    case "border":
      return "Border";
    case "opacity":
      return "Opacity";
    case "shadow":
      return "Shadow";
    case "elevation":
      return "Elevation";
    case "size.icon":
      return "Icon Size";
    case "icon":
      return "Icon";
    case "z":
      return "Z-Index";
    case "focus.ring":
      return "Focus Ring";
    case "motion":
      return "Motion";
    case "typography":
      return "Typography";
    case "component.button":
      return "Component: Button";
    case "component.input":
      return "Component: Input";
    case "component.field":
      return "Pattern: Field";
    case "component.dialog":
      return "Pattern: Dialog";
    case "component.dropdown":
      return "Pattern: Dropdown";
    case "component.tooltip":
      return "Pattern: Tooltip";
    case "component.toast":
      return "Pattern: Toast";
    case "raw.color":
      return "Primitive (Raw)";
    case "color":
      return "Semantic (Canonical)";
    default:
      return "Other";
  }
}

type BuildOptions = {
  preset: Preset;
};

function buildCss(dtcg: unknown, options: BuildOptions): string {
  const tokens = collectTokens(dtcg);

  const shared = new Map<SectionId, Array<{ name: string; value: string }>>();
  const light = new Map<SectionId, Array<{ name: string; value: string }>>();
  const dark = new Map<SectionId, Array<{ name: string; value: string }>>();

  const push = (
    map: Map<SectionId, Array<{ name: string; value: string }>>,
    section: SectionId,
    decl: { name: string; value: string }
  ): void => {
    const list = map.get(section) ?? [];
    list.push(decl);
    map.set(section, list);
  };

  for (const { path, token } of tokens) {
    const cssVar = pathToCssVar(path);
    const section = sectionOf(path);
    const byMode = splitByMode(token.$value);

    if (isThemeToken(path) || byMode) {
      const vLight = renderCssValue(byMode ? byMode.light : token.$value);
      const vDark = renderCssValue(byMode ? byMode.dark : token.$value);
      push(light, section, { name: cssVar, value: vLight });
      push(dark, section, { name: cssVar, value: vDark });
      continue;
    }

    push(shared, section, { name: cssVar, value: renderCssValue(token.$value) });
  }

  const sharedOrder: SectionId[] = [
    "touch",
    "spacing",
    "radius",
    "border",
    "opacity",
    "shadow",
    "elevation",
    "size.icon",
    "icon",
    "z",
    "focus.ring",
    "motion",
    "typography",
    "component.button",
    "component.input",
    "component.field",
    "component.dialog",
    "component.dropdown",
    "component.tooltip",
    "component.toast",
    "other",
  ];

  const themeOrder: SectionId[] = ["raw.color", "color", "focus.ring", "other"];

  const renderSection = (id: SectionId, map: Map<SectionId, Array<{ name: string; value: string }>>): string[] => {
    const entries = map.get(id);
    if (!entries?.length) return [];

    const sorted = [...entries].sort((a, b) => a.name.localeCompare(b.name));
    const lines: string[] = [];
    lines.push(`  /* ${sectionTitle(id)} */`);
    for (const { name, value } of sorted) lines.push(`  ${name}: ${value};`);
    lines.push("");
    return lines;
  };

  const lines: string[] = [];
  lines.push("/*");
  lines.push("  GENERATED FILE — DO NOT EDIT");
  lines.push("  Source: .vibe-coding/TOOLS/design-system/tokens.dtcg.json");
  lines.push("  Generator: .vibe-coding/TOOLS/design-system/dtcg-sync.ts");
  lines.push(`  Preset: ${options.preset}`);
  lines.push("*/");
  lines.push("");

  const renderBlock = (selector: string, colorScheme: string, map: Map<SectionId, Array<{ name: string; value: string }>>, order: SectionId[]) => {
    lines.push(`${selector} {`);
    lines.push("  /* 폼 컨트롤 렌더링 힌트 (테마별로 재정의) */");
    lines.push(`  color-scheme: ${colorScheme};`);
    lines.push("");
    for (const id of order) lines.push(...renderSection(id, map));
    if (lines.at(-1) === "") lines.pop();
    lines.push("}");
    lines.push("");
  };

  if (options.preset === "lab") {
    renderBlock(".ds-lab", "light dark", shared, sharedOrder);
    renderBlock('.ds-lab[data-ds-theme="light"]', "light", light, themeOrder);
    renderBlock('.ds-lab[data-ds-theme="dark"]', "dark", dark, themeOrder);
  } else {
    // root preset: light는 기본 :root에 포함, dark만 별도 블록으로 분리
    const mergedLight = new Map<SectionId, Array<{ name: string; value: string }>>();
    for (const [k, v] of shared.entries()) mergedLight.set(k, [...v]);
    for (const [k, v] of light.entries()) mergedLight.set(k, [...(mergedLight.get(k) ?? []), ...v]);

    const rootOrder = Array.from(
      new Set<SectionId>([...sharedOrder, ...themeOrder.filter((x) => x !== "other")])
    );

    renderBlock(":root", "light dark", mergedLight, rootOrder);
    renderBlock(':root[data-theme="dark"]', "dark", dark, themeOrder);
  }

  if (lines.at(-1) === "") lines.pop();
  lines.push("");

  return lines.join("\n");
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    printHelp();
    process.exit(0);
  }

  const verify = args.includes("--verify");
  const printOnly = args.includes("--print");

  const presetIdx = args.indexOf("--preset");
  const preset = (presetIdx !== -1 ? args[presetIdx + 1] : "lab") as Preset;
  if (preset !== "lab" && preset !== "root") {
    console.error(`❌ 알 수 없는 preset: ${String(preset)}`);
    console.error("지원 preset: lab | root");
    process.exit(1);
  }

  const inIdx = args.indexOf("--in");
  const outIdx = args.indexOf("--out");

  const root = resolve(join(dirname(fileURLToPath(import.meta.url)), "../../.."));
  const inPath = resolve(root, inIdx !== -1 ? args[inIdx + 1] : ".vibe-coding/TOOLS/design-system/tokens.dtcg.json");
  const defaultOut =
    preset === "root" ? "src/styles/design-system.tokens.css" : "src/styles/design-system-lab.tokens.css";
  const outPath = resolve(root, outIdx !== -1 ? args[outIdx + 1] : defaultOut);

  const dtcgRaw = readFileSync(inPath, "utf-8");
  const dtcg = JSON.parse(dtcgRaw) as unknown;
  const css = buildCss(dtcg, { preset });

  if (printOnly) {
    console.log(css);
    process.exit(0);
  }

  if (verify) {
    const current = (() => {
      try {
        return readFileSync(outPath, "utf-8");
      } catch {
        return null;
      }
    })();

    if (current !== css) {
      console.error("❌ dtcg → css 동기화 검증 실패");
      console.error(`- ${outPath}: 최신 출력물과 불일치`);
      console.error("");
      console.error("로컬에서 아래 명령으로 갱신하세요:");
      console.error("  bun .vibe-coding/TOOLS/design-system/dtcg-sync.ts");
      process.exit(1);
    }

    console.log("✅ dtcg → css 최신 상태 확인 완료");
    process.exit(0);
  }

  writeFileSync(outPath, css, "utf-8");
  console.log(`✅ dtcg → css 생성 완료: ${outPath}`);
}

main();
