import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

// 규칙 스코프 정의
type RuleScope = "script" | "markup" | "all" | "server-only";

// 감지할 코드 패턴 정의
interface LintRule {
  id: string;
  name: string;
  description: string;
  pattern: RegExp;
  suggestion: string;
  severity: "error" | "warning" | "info";
  scope: RuleScope; // 규칙이 적용되는 영역
}

interface LintResult {
  file: string;
  line: number;
  column: number;
  rule: LintRule;
  match: string;
}

// 서버 파일 패턴 (윈도우 경로 대응을 위해 슬래시로 정규화 후 검사)
const SERVER_FILE_PATTERNS = [
  /\+page\.server\.(ts|js)$/,
  /\+layout\.server\.(ts|js)$/,
  /hooks\.server\.(ts|js)$/,
  /\/server\//,
  /\.server\.(ts|js)$/, // src/lib/whatever.server.ts 형태
];

function isServerFile(filePath: string): boolean {
  // 윈도우 역슬래시를 슬래시로 정규화
  const normalized = filePath.replace(/\\/g, "/");
  return SERVER_FILE_PATTERNS.some((p) => p.test(normalized));
}

const RULES: LintRule[] = [
  // 레벨 1: 기본적인 타입 안전성 문제 (script scope)
  {
    id: "no-explicit-any",
    name: "명시적 any 사용 금지",
    description: ": any 또는 as any 사용 감지",
    pattern: /\b(?::\s*any\b|as\s+any\b)/g,
    suggestion: "unknown + 타입 가드 또는 구체적인 타입으로 교체",
    severity: "error",
    scope: "script",
  },
  {
    id: "no-ts-ignore",
    name: "@ts-ignore 사용 금지",
    description: "@ts-ignore 또는 @ts-nocheck 주석 감지",
    pattern: /@ts-(?:ignore|nocheck)/g,
    suggestion: "@ts-expect-error + 구체적인 사유 명시, 또는 타입 수정",
    severity: "error",
    scope: "script",
  },
  {
    id: "no-non-null-assertion",
    name: "Non-null assertion (!) 사용",
    description: "변수 뒤 ! 사용 감지",
    pattern: /\w+!(?:\.|[\[(])/g, // foo!. , foo![0], foo!() 모두 감지
    suggestion: "옵셔널 체이닝(?.) 또는 명시적 null 체크로 교체",
    severity: "info",
    scope: "script",
  },

  // 레벨 2: 패턴 기반 권장사항 (script scope)
  {
    id: "prefer-isdef-filter",
    name: "filter에서 isDef 타입 가드 권장",
    description: "filter 내 != null 패턴 감지",
    pattern: /\.filter\s*\([^)]*(?:!=\s*null|!==\s*null)/g,
    suggestion: "isDef 타입 가드 함수로 교체하면 타입 추론 향상",
    severity: "info",
    scope: "script",
  },
  {
    id: "no-console-outside-dev",
    name: "DEV 블록 외 console 사용",
    description: "console.log/warn/error 감지 (DEV 가드 없이)",
    pattern: /console\.(?:log|warn|error|info|debug)\s*\(/g,
    suggestion: "import.meta.env.DEV 조건문으로 감싸거나 제거",
    severity: "warning",
    scope: "script",
  },
  {
    id: "prefer-set-over-includes",
    name: "배열 .includes() 대신 Set 권장",
    description: "상수 배열에 .includes() 호출 감지",
    pattern: /(?:ALLOWED|VALUES|LIST|ITEMS|KEYS|IDS)\w*\.includes\s*\(/gi,
    suggestion: "new Set()으로 변환 후 .has()로 O(1) 조회",
    severity: "info",
    scope: "script",
  },

  // Svelte 5 / SvelteKit 2 안티패턴 (script scope)
  {
    id: "no-app-stores",
    name: "$app/stores 사용 금지 (deprecated)",
    description: "$app/stores import 감지",
    pattern: /from\s+['"]?\$app\/stores['"]?/g,
    suggestion: "$app/state로 마이그레이션 필요 (SvelteKit 2.12+)",
    severity: "warning",
    scope: "script",
  },
  {
    id: "no-legacy-store",
    name: "레거시 스토어 사용 (Svelte 4)",
    description: "writable/readable import 감지",
    pattern: /from\s+['"]?svelte\/store['"]?/g,
    suggestion: "Svelte 5 runes ($state, $derived) 사용 권장",
    severity: "info",
    scope: "script",
  },
  {
    id: "no-reactive-statement",
    name: "$: 반응성 문법 (Svelte 4)",
    description: "$: 반응성 문 감지",
    pattern: /^\s*\$:\s+/gm,
    suggestion: "Svelte 5: $derived 또는 $effect 사용",
    severity: "info",
    scope: "script",
  },

  // Svelte 마크업 전용 규칙 (markup scope)
  {
    id: "no-html-tag",
    name: "@html 사용 주의 (XSS 위험)",
    description: "{@html ...} 사용 감지",
    pattern: /\{@html\s+/g,
    suggestion: "신뢰할 수 없는 입력에 사용 시 XSS 위험. DOMPurify 등 sanitize 필수",
    severity: "warning",
    scope: "markup",
  },
  {
    id: "no-on-directive",
    name: "on:event 문법 (Svelte 4)",
    description: "on:click, on:submit 등 레거시 이벤트 문법 감지",
    pattern: /\bon:[a-z]+\s*=/gi,
    suggestion: "Svelte 5: onclick, onsubmit 등 네이티브 속성 사용",
    severity: "info",
    scope: "markup",
  },

  // SvelteKit 보안 규칙
  {
    id: "no-private-env-client",
    name: "클라이언트에서 private env 사용",
    description: "$env/static/private 또는 $env/dynamic/private import 감지",
    pattern: /from\s+['"]?\$env\/(?:static|dynamic)\/private['"]?/g,
    suggestion: "서버 전용 환경변수입니다. 클라이언트에서 사용 불가. .server 파일로 이동",
    severity: "error",
    scope: "script",
  },
  {
    id: "no-browser-globals-server",
    name: "서버 파일에서 브라우저 전역 객체 사용",
    description: "window, document, localStorage 등 감지",
    pattern: /\b(?:window|document|localStorage|sessionStorage|navigator)\b(?!:)/g,
    suggestion: "서버에서 실행 불가. browser 가드로 감싸거나 클라이언트로 이동",
    severity: "error",
    scope: "server-only",
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
  /\/scripts\//, // 빌드 스크립트 폴더 (console 허용)
];

// Svelte 파일에서 script/style 블록 추출 (시작 라인 오프셋 포함)
interface CodeBlock {
  content: string;
  startLine: number; // 원본 파일에서의 시작 라인 (0-indexed)
  endLine: number;   // 끝 라인 (마크업 제외용)
}

function extractScriptBlocks(content: string): CodeBlock[] {
  const blocks: CodeBlock[] = [];
  const regex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    // <script> 태그의 끝 위치(>)를 찾아서 content 시작점 계산
    const tagEndIndex = match.index + match[0].indexOf(">") + 1;
    const beforeContent = content.slice(0, tagEndIndex);
    const startLine = (beforeContent.match(/\n/g) || []).length;

    // 전체 매치의 끝까지 줄바꿈 개수
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

    // 무시 패턴 체크 (윈도우 역슬래시 정규화)
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

function lintLines(
  lines: string[],
  filePath: string,
  rules: LintRule[],
  lineOffset: number = 0,
  skipLineRanges: Array<{ start: number; end: number; }> = []
): LintResult[] {
  const results: LintResult[] = [];
  let inBlockComment = false;
  let devBlockDepth = 0;

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const actualLine = lineNum + lineOffset;

    // 제외 범위 체크 (script/style 블록 등) - half-open으로 경계 오차 방지
    if (skipLineRanges.some((r) => actualLine >= r.start && actualLine < r.end)) {
      continue;
    }

    let line = lines[lineNum];
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

    // 인라인 블록 주석 제거 (/* ... */ 형태)
    line = line.replace(/\/\*.*?\*\//g, "");
    // 줄 끝에서 시작하는 블록 주석 처리
    const inlineCommentStart = line.indexOf("/*");
    if (inlineCommentStart !== -1) {
      line = line.slice(0, inlineCommentStart);
      inBlockComment = true;
    }

    // 한 줄 주석 건너뜀
    if (trimmed.startsWith("//")) continue;

    // DEV 블록 추적 (개선: 중괄호 카운팅 대칭화)
    const hasDevGuard = /import\.meta\.env\.DEV/.test(line);
    const hasBrace = /{/.test(line);

    if (hasDevGuard && hasBrace && devBlockDepth === 0) {
      devBlockDepth = 1;
    }
    if (devBlockDepth > 0) {
      devBlockDepth += (line.match(/{/g) || []).length;
      devBlockDepth -= (line.match(/}/g) || []).length;
      if (devBlockDepth < 0) devBlockDepth = 0;
    }

    for (const rule of rules) {
      // DEV 블록 내부이거나, 같은 줄에 DEV 가드가 있으면 console 규칙 건너뜀
      if (rule.id === "no-console-outside-dev" && (devBlockDepth > 0 || hasDevGuard)) continue;

      // private env 규칙: 서버 파일이면 건너뜀
      if (rule.id === "no-private-env-client" && isServerFile(filePath)) continue;

      // regex 재사용 (lastIndex 리셋)
      const regex = rule.pattern;
      regex.lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = regex.exec(line)) !== null) {
        results.push({
          file: filePath,
          line: lineNum + 1 + lineOffset, // 오프셋 적용
          column: match.index + 1,
          rule,
          match: match[0],
        });
      }
    }
  }

  return results;
}

function lintContent(content: string, filePath: string): LintResult[] {
  const results: LintResult[] = [];
  const isSvelte = filePath.endsWith(".svelte");
  const isServer = isServerFile(filePath);

  // script scope 규칙
  const scriptRules = RULES.filter((r) => r.scope === "script");
  // markup scope 규칙
  const markupRules = RULES.filter((r) => r.scope === "markup");
  // server-only scope 규칙
  const serverRules = RULES.filter((r) => r.scope === "server-only");

  if (isSvelte) {
    // Svelte 파일: script 블록과 마크업을 분리하여 검사
    const scriptBlocks = extractScriptBlocks(content);
    const styleBlocks = extractStyleBlocks(content);

    // Script 블록 검사 (라인 오프셋 적용)
    for (const block of scriptBlocks) {
      const lines = block.content.split("\n");
      results.push(...lintLines(lines, filePath, scriptRules, block.startLine));
    }

    // 마크업 검사 (script/style 블록 제외)
    const skipRanges = [
      ...scriptBlocks.map((b) => ({ start: b.startLine, end: b.endLine })),
      ...styleBlocks.map((b) => ({ start: b.startLine, end: b.endLine })),
    ];
    const fullLines = content.split("\n");
    results.push(...lintLines(fullLines, filePath, markupRules, 0, skipRanges));
  } else {
    // 일반 TS/JS 파일
    const lines = content.split("\n");
    results.push(...lintLines(lines, filePath, scriptRules));

    // 서버 파일이면 브라우저 전역 객체 검사
    if (isServer) {
      results.push(...lintLines(lines, filePath, serverRules));
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
