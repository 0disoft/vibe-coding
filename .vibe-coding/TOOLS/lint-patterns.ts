import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

// 감지할 코드 패턴 정의
interface LintRule {
  id: string;
  name: string;
  description: string;
  pattern: RegExp;
  suggestion: string;
  severity: "error" | "warning" | "info";
}

interface LintResult {
  file: string;
  line: number;
  column: number;
  rule: LintRule;
  match: string;
}

const RULES: LintRule[] = [
  // 레벨 1: 기본적인 타입 안전성 문제
  {
    id: "no-explicit-any",
    name: "명시적 any 사용 금지",
    description: ": any 또는 as any 사용 감지",
    pattern: /\b(?::\s*any\b|as\s+any\b)/g,
    suggestion: "unknown + 타입 가드 또는 구체적인 타입으로 교체",
    severity: "error",
  },
  {
    id: "no-ts-ignore",
    name: "@ts-ignore 사용 금지",
    description: "@ts-ignore 또는 @ts-nocheck 주석 감지",
    pattern: /@ts-(?:ignore|nocheck)/g,
    suggestion: "@ts-expect-error + 구체적인 사유 명시, 또는 타입 수정",
    severity: "error",
  },
  {
    id: "no-non-null-assertion",
    name: "Non-null assertion (!) 사용",
    description: "변수 뒤 ! 사용 감지",
    pattern: /\w+!\./g,
    suggestion: "옵셔널 체이닝(?.) 또는 명시적 null 체크로 교체",
    severity: "info", // warning에서 info로 하향
  },

  // 레벨 2: 패턴 기반 권장사항
  {
    id: "prefer-isdef-filter",
    name: "filter에서 isDef 타입 가드 권장",
    description: "filter 내 != null 패턴 감지",
    pattern: /\.filter\s*\([^)]*!=\s*null/g, // filter 안에서만 감지
    suggestion: "isDef 타입 가드 함수로 교체하면 타입 추론 향상",
    severity: "info",
  },
  {
    id: "no-console-outside-dev",
    name: "DEV 블록 외 console 사용",
    description: "console.log/warn/error 감지 (DEV 가드 없이)",
    pattern: /console\.(?:log|warn|error|info|debug)\s*\(/g,
    suggestion: "import.meta.env.DEV 조건문으로 감싸거나 제거",
    severity: "warning",
  },
  {
    id: "prefer-set-over-includes",
    name: "배열 .includes() 대신 Set 권장",
    description: "상수 배열에 .includes() 호출 감지",
    pattern: /(?:ALLOWED|VALUES|LIST|ITEMS|KEYS|IDS)\w*\.includes\s*\(/gi,
    suggestion: "new Set()으로 변환 후 .has()로 O(1) 조회",
    severity: "info",
  },

  // Svelte 5 / SvelteKit 2 안티패턴
  {
    id: "no-app-stores",
    name: "$app/stores 사용 금지 (deprecated)",
    description: "$app/stores import 감지",
    pattern: /from\s+['"]?\$app\/stores['"]?/g,
    suggestion: "$app/state로 마이그레이션 필요 (SvelteKit 2.12+)",
    severity: "warning",
  },
  {
    id: "no-html-tag",
    name: "@html 사용 주의 (XSS 위험)",
    description: "{@html ...} 사용 감지",
    pattern: /\{@html\s+/g,
    suggestion: "신뢰할 수 없는 입력에 사용 시 XSS 위험. DOMPurify 등 sanitize 필수",
    severity: "warning",
  },
  {
    id: "no-legacy-store",
    name: "레거시 스토어 사용 (Svelte 4)",
    description: "writable/readable import 감지",
    pattern: /from\s+['"]?svelte\/store['"]?/g,
    suggestion: "Svelte 5 runes ($state, $derived) 사용 권장",
    severity: "info",
  },
  {
    id: "no-on-directive",
    name: "on:event 문법 (Svelte 4)",
    description: "on:click, on:submit 등 레거시 이벤트 문법 감지",
    pattern: /\bon:[a-z]+\s*=/gi,
    suggestion: "Svelte 5: onclick, onsubmit 등 네이티브 속성 사용",
    severity: "info",
  },
  {
    id: "no-reactive-statement",
    name: "$: 반응성 문법 (Svelte 4)",
    description: "$: 반응성 문 감지",
    pattern: /^\s*\$:\s+/gm,
    suggestion: "Svelte 5: $derived 또는 $effect 사용",
    severity: "info",
  },
];

// 파일 확장자 필터
const VALID_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".svelte"];

// 무시할 경로 패턴
const IGNORE_PATTERNS = [
  /node_modules/,
  /\.svelte-kit/,
  /dist/,
  /build/,
  /\.git/,
];

// Svelte 파일에서 script 블록만 추출
function extractScriptContent(content: string, filePath: string): string {
  if (!filePath.endsWith(".svelte")) return content;

  const scriptMatches = content.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
  if (!scriptMatches) return "";

  return scriptMatches
    .map((match) => {
      const inner = match.replace(/<script[^>]*>/i, "").replace(/<\/script>/i, "");
      return inner;
    })
    .join("\n");
}

async function walk(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const path = join(dir, entry.name);

    // 무시 패턴 체크
    if (IGNORE_PATTERNS.some((p) => p.test(path))) continue;

    if (entry.isDirectory()) {
      files.push(...(await walk(path)));
    } else if (entry.isFile()) {
      const ext = extname(path);
      if (VALID_EXTENSIONS.includes(ext)) files.push(path);
    }
  }
  return files;
}

function lintContent(content: string, filePath: string): LintResult[] {
  const results: LintResult[] = [];

  // Svelte 파일은 script 블록만 추출
  const targetContent = extractScriptContent(content, filePath);
  const lines = targetContent.split("\n");

  // 블록 주석 상태 추적
  let inBlockComment = false;

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];
    const trimmed = line.trim();

    // 블록 주석 상태 추적
    if (inBlockComment) {
      if (trimmed.includes("*/")) {
        inBlockComment = false;
      }
      continue;
    }

    if (trimmed.startsWith("/*")) {
      inBlockComment = !trimmed.includes("*/");
      continue;
    }

    // 한 줄 주석 건너뜀
    if (trimmed.startsWith("//")) continue;

    // DEV 블록: 같은 줄에 import.meta.env.DEV가 있으면 console 허용
    const hasDevGuard = /import\.meta\.env\.DEV/.test(line);

    for (const rule of RULES) {
      // DEV 가드가 같은 줄에 있으면 console 규칙 건너뜀
      if (rule.id === "no-console-outside-dev" && hasDevGuard) continue;

      const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
      let match: RegExpExecArray | null;

      while ((match = regex.exec(line)) !== null) {
        results.push({
          file: filePath,
          line: lineNum + 1,
          column: match.index + 1,
          rule,
          match: match[0],
        });
      }
    }
  }

  return results;
}

async function lintFile(path: string): Promise<LintResult[]> {
  const content = await readFile(path, "utf-8");
  return lintContent(content, path);
}

function formatResults(results: LintResult[], basePath: string): string {
  const lines: string[] = [];

  if (results.length === 0) {
    lines.push("✅ 문제가 발견되지 않았습니다.");
    return lines.join("\n");
  }

  // 파일별로 그룹화
  const byFile = new Map<string, LintResult[]>();
  for (const r of results) {
    const rel = relative(basePath, r.file);
    if (!byFile.has(rel)) byFile.set(rel, []);
    byFile.get(rel)!.push(r);
  }

  // 심각도별 카운트
  const counts = { error: 0, warning: 0, info: 0 };

  for (const [file, fileResults] of byFile) {
    lines.push(`\n📄 ${file}`);
    for (const r of fileResults) {
      const icon =
        r.rule.severity === "error"
          ? "❌"
          : r.rule.severity === "warning"
            ? "⚠️"
            : "💡";
      lines.push(`  ${icon} L${r.line}:${r.column} [${r.rule.id}]`);
      lines.push(`     ${r.rule.name}: "${r.match.trim()}"`);
      lines.push(`     → ${r.rule.suggestion}`);
      counts[r.rule.severity]++;
    }
  }

  lines.push("\n────────────────────────────────────");
  lines.push(
    `총 ${results.length}개 이슈: ❌ ${counts.error} 오류, ⚠️ ${counts.warning} 경고, 💡 ${counts.info} 정보`
  );

  return lines.join("\n");
}

async function main() {
  const TARGET =
    process.argv.slice(2).find((arg) => !arg.startsWith("--")) || "src";
  const FILTER_SEVERITY = process.argv.includes("--errors-only")
    ? "error"
    : null;

  console.log(`🔍 스캔 대상: ${TARGET}`);

  try {
    const targetStat = await stat(TARGET);
    let files: string[];

    if (targetStat.isFile()) {
      const ext = extname(TARGET);
      if (!VALID_EXTENSIONS.includes(ext)) {
        console.log(
          `Error: 지원 확장자는 ${VALID_EXTENSIONS.join(", ")} 입니다.`
        );
        return;
      }
      files = [TARGET];
    } else {
      files = await walk(TARGET);
    }

    console.log(`📁 ${files.length}개 파일 발견\n`);

    let allResults: LintResult[] = [];
    for (const file of files) {
      const results = await lintFile(file);
      allResults.push(...results);
    }

    // 심각도 필터링
    if (FILTER_SEVERITY) {
      allResults = allResults.filter((r) => r.rule.severity === FILTER_SEVERITY);
    }

    const report = formatResults(allResults, TARGET);
    console.log(report);

    // 리포트 파일로 저장
    const scriptDir = dirname(fileURLToPath(import.meta.url));
    const reportPath = join(scriptDir, "lint-report.txt");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const header = `Lint Report - ${timestamp}\nTarget: ${TARGET}\n${"=".repeat(40)}\n`;
    await writeFile(reportPath, header + report, "utf-8");
    console.log(`\n📝 리포트 저장됨: ${reportPath}`);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
