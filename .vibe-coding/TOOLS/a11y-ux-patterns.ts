import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

// 규칙 스코프 정의
type RuleScope = "markup" | "style" | "html" | "all";

// 검사 규칙 인터페이스
interface LintRule {
  id: string;
  name: string;
  description: string;
  pattern: RegExp;
  suggestion: string;
  severity: "error" | "warning" | "info";
  scope: RuleScope;
}

interface LintResult {
  file: string;
  line: number;
  column: number;
  rule: LintRule;
  match: string;
}

// ============================================================
// Phase 1 규칙: 필수 접근성
// ============================================================

const RULES: LintRule[] = [
  // 이미지 접근성
  {
    id: "a11y-img-alt-missing",
    name: "이미지 alt 속성 누락",
    description: "<img> 태그에 alt 속성 필수",
    pattern: /<img\s+(?![^>]*\balt\s*=)[^>]*>/gi,
    suggestion: "alt=\"설명\" 추가 (장식용 이미지는 alt=\"\")",
    severity: "error",
    scope: "markup",
  },

  // 버튼/링크 접근성
  {
    id: "a11y-empty-link",
    name: "빈 링크 텍스트",
    description: "<a> 태그 내부 텍스트 없음",
    pattern: /<a\s+[^>]*>\s*<\/a>/gi,
    suggestion: "링크 텍스트 또는 aria-label 추가",
    severity: "error",
    scope: "markup",
  },
  {
    id: "a11y-button-type",
    name: "button type 속성 누락",
    description: "<button>에 type 속성 권장",
    pattern: /<button\s+(?![^>]*\btype\s*=)[^>]*>/gi,
    suggestion: "type=\"button\" 추가 (폼 제출 방지)",
    severity: "warning",
    scope: "markup",
  },
  {
    id: "a11y-icon-only-interactive",
    name: "아이콘만 있는 버튼/링크",
    description: "아이콘만 있으면 aria-label 필요",
    pattern: /<(?:button|a)\s+(?![^>]*aria-label)[^>]*>\s*<(?:span|i|svg)\s+[^>]*(?:class="[^"]*i-|i-lucide)[^>]*>\s*<\/(?:span|i|svg)>\s*<\/(?:button|a)>/gi,
    suggestion: "aria-label=\"설명\" 추가",
    severity: "info",
    scope: "markup",
  },

  // ARIA 패턴
  {
    id: "a11y-tabindex-positive",
    name: "양수 tabindex 사용",
    description: "tabindex > 0은 탐색 순서 혼란 유발",
    pattern: /\btabindex\s*=\s*["']?[1-9]\d*["']?/gi,
    suggestion: "tabindex=\"0\" 또는 tabindex=\"-1\" 사용",
    severity: "warning",
    scope: "markup",
  },
  {
    id: "a11y-popup-no-expanded",
    name: "팝업 버튼에 aria-expanded 누락",
    description: "aria-haspopup 있으면 aria-expanded 필요",
    // 태그 전체를 매치하고 lookahead로 판정 (속성 순서 무관)
    pattern: /<[a-z][\w:-]*\b(?=[^>]*\baria-haspopup\s*=)(?![^>]*\baria-expanded\s*=)[^>]*>/gi,
    suggestion: "aria-expanded={isOpen} 추가",
    severity: "warning",
    scope: "markup",
  },

  // 폼 접근성
  {
    id: "a11y-input-missing-label",
    name: "Input 레이블 누락 의심",
    description: "input 태그에 aria-label 또는 aria-labelledby 권장",
    pattern: /<input\s+(?![^>]*\btype=["']?(?:hidden|submit|button|image|reset)["']?)(?![^>]*\baria-label)(?![^>]*\baria-labelledby)[^>]*>/gi,
    suggestion: "aria-label 추가 또는 <label for=...> 사용 확인 (label로 감싼 경우 무시 가능)",
    severity: "info", // 오탐 가능성이 높아 info로 설정
    scope: "markup",
  },

  // 랜드마크 (별도 로직으로 처리)
  // a11y-multiple-main은 CUSTOM_RULES에서 별도 정의

  // ============================================================
  // Phase 1 규칙: 모바일 접근성 (메타태그)
  // ============================================================
  {
    id: "mobile-no-zoom",
    name: "줌 차단 (접근성 위반)",
    description: "user-scalable=no 또는 maximum-scale=1 감지",
    pattern: /(?:user-scalable\s*=\s*["']?no["']?|maximum-scale\s*=\s*["']?1["']?)/gi,
    suggestion: "저시력 사용자에게 줌은 필수. 해당 속성 제거",
    severity: "error",
    scope: "all", // svelte:head에서도 감지 필요
  },

  // ============================================================
  // Phase 2 규칙: RTL 대응
  // ============================================================
  {
    id: "rtl-position-class",
    name: "물리적 위치 클래스 사용",
    description: "left-0, right-0 대신 start-0, end-0 권장",
    pattern: /\b(?:left|right)-(?:0|px|auto|\d+)\b/g,
    suggestion: "start-*, end-* 사용 (RTL 언어 대응)",
    severity: "warning",
    scope: "markup",
  },
  {
    id: "rtl-margin-class",
    name: "물리적 마진 클래스 사용",
    description: "ml-*, mr-* 대신 ms-*, me-* 권장",
    pattern: /\b(?:ml|mr)-(?:\d+|auto|px)\b/g,
    suggestion: "ms-*, me-* 사용 (RTL 언어 대응)",
    severity: "info",
    scope: "markup",
  },
  {
    id: "rtl-padding-class",
    name: "물리적 패딩 클래스 사용",
    description: "pl-*, pr-* 대신 ps-*, pe-* 권장",
    pattern: /\b(?:pl|pr)-(?:\d+|auto|px)\b/g,
    suggestion: "ps-*, pe-* 사용 (RTL 언어 대응)",
    severity: "info",
    scope: "markup",
  },
  {
    id: "rtl-text-align-class",
    name: "물리적 텍스트 정렬 사용",
    description: "text-left, text-right 대신 text-start, text-end 권장",
    pattern: /\btext-(?:left|right)\b/g,
    suggestion: "text-start, text-end 사용 (RTL 언어 대응)",
    severity: "info",
    scope: "markup",
  },

  // ============================================================
  // Phase 2 규칙: CSS 패턴
  // ============================================================
  {
    id: "mobile-tap-highlight-global",
    name: "전역 tap-highlight 제거",
    description: "* 선택자에 tap-highlight-color: transparent 감지",
    pattern: /\*\s*\{[^}]*-webkit-tap-highlight-color\s*:\s*transparent/gi,
    suggestion: ".interactive 클래스로 제한하고 :focus-visible 강화",
    severity: "warning",
    scope: "style",
  },
];

// 별도 로직으로 처리되는 규칙 (패턴 매칭이 아닌 카운팅 등)
const MULTIPLE_MAIN_RULE: LintRule = {
  id: "a11y-multiple-main",
  name: "main 요소 중복",
  description: "페이지당 main은 하나만 허용",
  pattern: /<main\b/gi,
  suggestion: "main 요소는 레이아웃에 하나만 사용",
  severity: "error",
  scope: "markup",
};

// 파일 확장자 필터
const VALID_EXTENSIONS = [".svelte", ".html", ".css"];

// 무시할 경로 패턴
const IGNORE_PATTERNS = [
  /node_modules/,
  /\.svelte-kit/,
  /dist/,
  /build/,
  /\.git/,
];

// Svelte 파일에서 블록 추출
interface CodeBlock {
  content: string;
  startLine: number;
  endLine: number;
}

function extractMarkupBlocks(content: string): CodeBlock[] {
  const lines = content.split(/\r?\n/);
  const blocks: CodeBlock[] = [];
  let inScript = false;
  let inStyle = false;
  let currentBlock: string[] = [];
  let blockStartLine = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("<script")) {
      inScript = true;
      if (currentBlock.length > 0) {
        blocks.push({
          content: currentBlock.join("\n"),
          startLine: blockStartLine,
          endLine: i - 1,
        });
        currentBlock = [];
      }
      continue;
    }
    if (trimmed.startsWith("</script>")) {
      inScript = false;
      blockStartLine = i + 1;
      continue;
    }
    if (trimmed.startsWith("<style")) {
      inStyle = true;
      if (currentBlock.length > 0) {
        blocks.push({
          content: currentBlock.join("\n"),
          startLine: blockStartLine,
          endLine: i - 1,
        });
        currentBlock = [];
      }
      continue;
    }
    if (trimmed.startsWith("</style>")) {
      inStyle = false;
      blockStartLine = i + 1;
      continue;
    }

    if (!inScript && !inStyle) {
      if (currentBlock.length === 0) blockStartLine = i;
      currentBlock.push(line);
    }
  }

  if (currentBlock.length > 0) {
    blocks.push({
      content: currentBlock.join("\n"),
      startLine: blockStartLine,
      endLine: lines.length - 1,
    });
  }

  return blocks;
}

function extractStyleBlocks(content: string): CodeBlock[] {
  const blocks: CodeBlock[] = [];
  const regex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    const tagEndIndex = match.index + match[0].indexOf(">") + 1;
    const beforeContent = content.slice(0, tagEndIndex);
    const startLine = (beforeContent.match(/\n/g) || []).length;
    const beforeMatchEnd = content.slice(0, match.index + match[0].length);
    const endLine = (beforeMatchEnd.match(/\n/g) || []).length;

    blocks.push({
      content: match[1],
      startLine,
      endLine,
    });
  }

  return blocks;
}

async function walk(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const path = join(dir, entry.name);
    const normalizedPath = path.replace(/\\/g, "/");
    if (IGNORE_PATTERNS.some((p) => p.test(normalizedPath))) continue;

    if (entry.isDirectory()) {
      files.push(...(await walk(path)));
    } else if (entry.isFile()) {
      const ext = extname(path);
      if (VALID_EXTENSIONS.includes(ext)) files.push(path);
    }
  }
  return files;
}

// 동시 실행 제한 유틸리티 (파일 핸들 한도 방지)
async function runWithLimit<T, R>(
  items: readonly T[],
  limit: number,
  worker: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  let nextIndex = 0;

  async function runner() {
    while (true) {
      const i = nextIndex++;
      if (i >= items.length) return;
      results[i] = await worker(items[i]);
    }
  }

  const n = Math.max(1, Math.min(limit, items.length));
  await Promise.all(Array.from({ length: n }, () => runner()));
  return results;
}

// HTML 주석을 공백으로 치환 (줄바꿈은 유지하여 라인 넘버 보존)
function stripHtmlComments(content: string): string {
  return content.replace(/<!--[\s\S]*?-->/g, (match) => {
    return match.replace(/[^\n]/g, " ");
  });
}

// 블록 전체에서 패턴 검사 (여러 줄에 걸친 태그도 검출)
function lintBlockWhole(
  content: string,
  filePath: string,
  rules: LintRule[],
  lineOffset: number = 0
): LintResult[] {
  const cleanContent = stripHtmlComments(content); // 주석 제거
  const results: LintResult[] = [];

  for (const rule of rules) {
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
    let match: RegExpExecArray | null;

    while ((match = regex.exec(cleanContent)) !== null) {
      const before = cleanContent.slice(0, match.index);
      const lineInBlock = (before.match(/\n/g) || []).length + 1;
      const lastNl = before.lastIndexOf("\n");
      const colInBlock = match.index - (lastNl === -1 ? 0 : lastNl + 1) + 1;

      // 원본 content에서 match 텍스트 추출 (디버깅용)
      const originalMatch = content.slice(match.index, match.index + match[0].length);
      results.push({
        file: filePath,
        line: lineInBlock + lineOffset,
        column: colInBlock,
        rule,
        match: originalMatch.slice(0, 40) + (originalMatch.length > 40 ? "..." : ""),
      });
    }
  }

  return results;
}

// 줄 단위 검사 (CSS 등 간단한 패턴용)
function lintBlock(
  content: string,
  filePath: string,
  rules: LintRule[],
  lineOffset: number = 0
): LintResult[] {
  const results: LintResult[] = [];
  const lines = content.split(/\r?\n/);

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];

    for (const rule of rules) {
      const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
      let match: RegExpExecArray | null;

      while ((match = regex.exec(line)) !== null) {
        results.push({
          file: filePath,
          line: lineNum + 1 + lineOffset,
          column: match.index + 1,
          rule,
          match: match[0].slice(0, 40) + (match[0].length > 40 ? "..." : ""),
        });
      }
    }
  }

  return results;
}

function lintContent(content: string, filePath: string): LintResult[] {
  const results: LintResult[] = [];
  const isSvelte = filePath.endsWith(".svelte");
  const isHtml = filePath.endsWith(".html");
  const isCss = filePath.endsWith(".css");

  const markupRules = RULES.filter((r) => r.scope === "markup" || r.scope === "all");
  const styleRules = RULES.filter((r) => r.scope === "style" || r.scope === "all");
  const htmlRules = RULES.filter((r) => r.scope === "html" || r.scope === "all");

  if (isSvelte) {
    // 마크업 검사 (블록 전체 검사로 여러 줄 태그도 검출)
    const markupBlocks = extractMarkupBlocks(content);
    for (const block of markupBlocks) {
      results.push(...lintBlockWhole(block.content, filePath, markupRules, block.startLine));
    }

    // 스타일 검사
    const styleBlocks = extractStyleBlocks(content);
    for (const block of styleBlocks) {
      results.push(...lintBlockWhole(block.content, filePath, styleRules, block.startLine));
    }

    // main 중복 검사 - 두 번째 main의 정확한 위치 표시
    const mainMatches = [...content.matchAll(/<main\b/gi)];
    if (mainMatches.length > 1) {
      const secondMain = mainMatches[1];
      const idx = secondMain.index ?? 0;
      const beforeSecond = content.slice(0, idx);
      const line = (beforeSecond.match(/\n/g) || []).length + 1;
      const lastNl = beforeSecond.lastIndexOf("\n");
      const column = idx - (lastNl === -1 ? 0 : lastNl + 1) + 1;
      results.push({
        file: filePath,
        line,
        column,
        rule: MULTIPLE_MAIN_RULE,
        match: `<main> x ${mainMatches.length}`,
      });
    }
  } else if (isHtml) {
    // HTML 파일은 markup + html + all 규칙을 한 번에 적용 (중복 방지)
    const htmlFileRules = RULES.filter(
      (r) => r.scope === "markup" || r.scope === "html" || r.scope === "all"
    );
    results.push(...lintBlockWhole(content, filePath, htmlFileRules));
  } else if (isCss) {
    // CSS 파일도 블록 전체 검사 (여러 줄 CSS 규칙 검출)
    results.push(...lintBlockWhole(content, filePath, styleRules));
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
    lines.push("✅ 접근성/UX 문제가 발견되지 않았습니다.");
    return lines.join("\n");
  }

  // 파일별 그룹화
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
    // 파일 내 결과를 line, column 기준 정렬
    const sorted = fileResults.sort((a, b) => a.line - b.line || a.column - b.column);
    for (const r of sorted) {
      const icon =
        r.rule.severity === "error"
          ? "❌"
          : r.rule.severity === "warning"
            ? "⚠️"
            : "💡";
      lines.push(`  ${icon} L${r.line}:${r.column} [${r.rule.id}]`);
      lines.push(`     ${r.rule.name}: "${r.match}"`);
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
  // severity 필터 확장: --errors-only, --warnings-only, --infos-only
  const FILTER_SEVERITY = process.argv.includes("--errors-only")
    ? "error"
    : process.argv.includes("--warnings-only")
      ? "warning"
      : process.argv.includes("--infos-only")
        ? "info"
        : null;

  console.log(`🔍 접근성/UX 패턴 스캔: ${TARGET}`);

  try {
    const targetStat = await stat(TARGET);
    let files: string[];

    if (targetStat.isFile()) {
      const ext = extname(TARGET);
      if (!VALID_EXTENSIONS.includes(ext)) {
        console.log(`Error: 지원 확장자는 ${VALID_EXTENSIONS.join(", ")} 입니다.`);
        return;
      }
      files = [TARGET];
    } else {
      files = await walk(TARGET);
    }

    console.log(`📁 ${files.length}개 파일 발견\n`);

    // 동시 실행 제한으로 안정성 향상 (파일 핸들 한도 방지)
    const resultsArrays = await runWithLimit(files, 16, lintFile);
    const allFound: LintResult[] = resultsArrays.flat();

    // 필터링 전에 에러 카운트 계산 (CI exit code용)
    const errorCount = allFound.filter((r) => r.rule.severity === "error").length;

    // 심각도 필터링 (출력용)
    let allResults = allFound;
    if (FILTER_SEVERITY) {
      allResults = allFound.filter((r) => r.rule.severity === FILTER_SEVERITY);
    }

    // basePath 처리: 파일일 때는 디렉토리 기준
    const basePath = targetStat.isFile() ? dirname(TARGET) : TARGET;
    const report = formatResults(allResults, basePath);
    console.log(report);

    // 리포트 파일로 저장
    const scriptDir = dirname(fileURLToPath(import.meta.url));
    const reportPath = join(scriptDir, "reports", "a11y-ux-report.txt");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const header = `A11y/UX Report - ${timestamp}\nTarget: ${TARGET}\n${"=".repeat(40)}\n`;
    await writeFile(reportPath, header + report, "utf-8");
    console.log(`\n📝 리포트 저장됨: ${reportPath}`);

    // CI/CD 통합: 에러 발견 시 exit code 1 반환 (필터와 무관하게 원본 기준)
    if (errorCount > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
