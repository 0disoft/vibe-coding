#!/usr/bin/env bun
/**
 * find-word.ts
 * 프로젝트에서 특정 단어/패턴을 검색하는 도구
 *
 * 사용법:
 *   bun .vibe-coding/TOOLS/find-word.ts <패턴> [경로] [옵션]
 *
 * 예시:
 *   bun .vibe-coding/TOOLS/find-word.ts TODO
 *   bun .vibe-coding/TOOLS/find-word.ts "TODO|FIXME|HACK"
 *   bun .vibe-coding/TOOLS/find-word.ts "console\\.log" src/lib
 */

import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

// ─────────────────────────────────────────────────────────────────────────────
// 설정
// ─────────────────────────────────────────────────────────────────────────────

/** 검사 대상 확장자 */
const TARGET_EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
  ".svelte", ".vue", ".html",
  ".css", ".scss", ".sass",
  ".json", ".yaml", ".yml", ".toml",
  ".md", ".mdx",
]);

/** 무시할 경로 패턴 */
const IGNORE_PATTERNS = [
  "node_modules",
  ".git",
  "dist",
  "build",
  ".svelte-kit",
  ".vite",
  "coverage",
  "__snapshots__",
  "paraglide",
  "bun.lock",
];

// ─────────────────────────────────────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────────────────────────────────────

interface Match {
  file: string;
  relativePath: string;
  line: number;
  column: number;
  content: string;
  matchText: string;
}

interface SearchResult {
  pattern: string;
  matches: Match[];
  filesSearched: number;
  filesWithMatches: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// 유틸리티 함수
// ─────────────────────────────────────────────────────────────────────────────

function shouldIgnore(path: string): boolean {
  const segments = path.split(/[\\/]/);
  return IGNORE_PATTERNS.some((pattern) => segments.includes(pattern));
}

function isTargetFile(path: string): boolean {
  const ext = extname(path).toLowerCase();
  return TARGET_EXTENSIONS.has(ext);
}

function searchInFile(
  filePath: string,
  basePath: string,
  regex: RegExp,
): Match[] {
  const matches: Match[] = [];

  try {
    const content = readFileSync(filePath, "utf-8");
    const lines = content.split(/\r?\n/);
    const relativePath = relative(basePath, filePath);

    // 파일 단위로 regex 재사용, 줄마다 lastIndex만 리셋
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      regex.lastIndex = 0;

      for (; ;) {
        const match = regex.exec(line);
        if (match === null) break;

        // 빈 문자열 매치 시 무한 루프 방지
        if (match[0].length === 0) {
          regex.lastIndex += 1;
          continue;
        }

        matches.push({
          file: filePath,
          relativePath,
          line: i + 1,
          column: match.index + 1,
          content: line.trimEnd(),
          matchText: match[0],
        });
      }
    }
  } catch {
    // 바이너리 파일 등 읽기 실패 시 무시
  }

  return matches;
}

function walkDirectory(dir: string, basePath: string, regex: RegExp): { matches: Match[]; filesSearched: number; } {
  const allMatches: Match[] = [];
  let filesSearched = 0;

  try {
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (shouldIgnore(fullPath)) continue;

      if (entry.isDirectory()) {
        const result = walkDirectory(fullPath, basePath, regex);
        allMatches.push(...result.matches);
        filesSearched += result.filesSearched;
      } else if (entry.isFile() && isTargetFile(entry.name)) {
        filesSearched++;
        const matches = searchInFile(fullPath, basePath, regex);
        allMatches.push(...matches);
      }
    }
  } catch {
    console.error(`디렉토리 읽기 실패: ${dir}`);
  }

  return { matches: allMatches, filesSearched };
}

function search(pattern: string, targetPath: string, caseSensitive: boolean): SearchResult {
  const flags = caseSensitive ? "g" : "gi";
  const regex = new RegExp(pattern, flags);
  const stat = statSync(targetPath);
  // process.cwd() 기준으로 상대 경로 계산 (README 예시와 일치)
  const basePath = process.cwd();

  let matches: Match[] = [];
  let filesSearched = 0;

  if (stat.isDirectory()) {
    const result = walkDirectory(targetPath, basePath, regex);
    matches = result.matches;
    filesSearched = result.filesSearched;
  } else if (isTargetFile(targetPath)) {
    filesSearched = 1;
    matches = searchInFile(targetPath, basePath, regex);
  }

  const filesWithMatches = new Set(matches.map((m) => m.file)).size;

  return {
    pattern,
    matches,
    filesSearched,
    filesWithMatches,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 출력 함수
// ─────────────────────────────────────────────────────────────────────────────

function printResult(result: SearchResult, noColor: boolean, caseSensitive: boolean): void {
  const { pattern, matches, filesSearched, filesWithMatches } = result;

  console.log(`\n🔍 패턴: ${pattern}`);
  console.log(`대소문자: ${caseSensitive ? "구분" : "무시"}\n`);
  console.log(`검색: ${filesSearched}개 파일 | 매치: ${matches.length}개 | 파일: ${filesWithMatches}개\n`);

  if (matches.length === 0) {
    console.log("❌ 매치되는 항목이 없습니다.\n");
    return;
  }

  // 파일별로 그룹화 후 알파벳순 정렬
  const byFile = new Map<string, Match[]>();
  for (const match of matches) {
    const existing = byFile.get(match.relativePath) ?? [];
    existing.push(match);
    byFile.set(match.relativePath, existing);
  }
  const sortedEntries = [...byFile.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  for (const [relativePath, fileMatches] of sortedEntries) {
    console.log(`📄 ${relativePath} (${fileMatches.length})`);

    for (const match of fileMatches) {
      const lineNum = String(match.line).padStart(4, " ");
      if (noColor) {
        console.log(`   ${lineNum}: ${match.content}`);
      } else {
        // 매치 부분만 하이라이트 (터미널 색상) - caseSensitive 반영
        const hlFlags = caseSensitive ? "g" : "gi";
        const highlighted = match.content.replace(
          new RegExp(`(${escapeRegex(match.matchText)})`, hlFlags),
          "\x1b[33m$1\x1b[0m",
        );
        console.log(`   ${lineNum}: ${highlighted}`);
      }
    }
    console.log();
  }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function printHelp(): void {
  console.log(`
🔍 find-word.ts — 프로젝트 단어 검색 도구

사용법:
  bun .vibe-coding/TOOLS/find-word.ts <패턴> [경로] [옵션]

인자:
  <패턴>        검색할 단어 또는 정규식 (따옴표로 감싸기 권장)
  [경로]        검색 대상 경로 (기본: src)

옵션:
  --case-sensitive, -s  대소문자 구분 검색 (기본: 무시)
  --no-color            색상 하이라이트 없이 출력
  --no-report           리포트 파일 생성 생략
  --json                JSON 형식으로 출력
  --help, -h            도움말 표시

예시:
  bun .vibe-coding/TOOLS/find-word.ts TODO                    # TODO 검색
  bun .vibe-coding/TOOLS/find-word.ts "TODO|FIXME|HACK"       # OR 검색
  bun .vibe-coding/TOOLS/find-word.ts "console\\.log" src/lib  # 특정 경로
  bun .vibe-coding/TOOLS/find-word.ts "function\\s+\\w+"       # 정규식
`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 메인
// ─────────────────────────────────────────────────────────────────────────────

function main(): void {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h") || args.length === 0) {
    printHelp();
    process.exit(0);
  }

  const jsonOutput = args.includes("--json");
  const noColor = args.includes("--no-color");
  const noReport = args.includes("--no-report");
  const caseSensitive = args.includes("--case-sensitive") || args.includes("-s");

  // 옵션이 아닌 인자 추출
  const positional = args.filter((arg) => !arg.startsWith("--") && arg !== "-s");
  const pattern = positional[0];
  const targetPath = positional[1] ?? "src";

  if (!pattern) {
    console.error("오류: 검색 패턴을 지정해주세요.");
    process.exit(1);
  }

  try {
    const startTime = performance.now();
    const result = search(pattern, targetPath, caseSensitive);
    const elapsed = performance.now() - startTime;
    const elapsedStr = elapsed < 1000 ? `${elapsed.toFixed(0)}ms` : `${(elapsed / 1000).toFixed(2)}s`;

    if (jsonOutput) {
      console.log(JSON.stringify({ ...result, elapsed: elapsedStr }, null, 2));
    } else {
      printResult(result, noColor, caseSensitive);
      console.log(`⏱️ 소요 시간: ${elapsedStr}\n`);
    }

    // 리포트 저장 (매치가 있을 때만)
    if (!noReport && result.matches.length > 0) {
      const scriptDir = dirname(fileURLToPath(import.meta.url));
      const reportsDir = join(scriptDir, "reports");
      mkdirSync(reportsDir, { recursive: true });
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const safePattern = pattern.replace(/[\\/:*?"<>|]/g, "_").slice(0, 30);
      const reportPath = join(reportsDir, `find-word-${safePattern}-${timestamp}.txt`);

      const lines: string[] = [
        `Find Word Report - ${timestamp}`,
        `Pattern: ${pattern}`,
        `Case Sensitive: ${caseSensitive ? "Yes" : "No"}`,
        `Target: ${targetPath}`,
        `Elapsed: ${elapsedStr}`,
        "=".repeat(50),
        "",
        `검색: ${result.filesSearched}개 파일 | 매치: ${result.matches.length}개 | 파일: ${result.filesWithMatches}개`,
        "",
      ];

      // 파일별로 그룹화 후 알파벳순 정렬
      const byFile = new Map<string, typeof result.matches>();
      for (const match of result.matches) {
        const existing = byFile.get(match.relativePath) ?? [];
        existing.push(match);
        byFile.set(match.relativePath, existing);
      }
      const sortedEntries = [...byFile.entries()].sort((a, b) => a[0].localeCompare(b[0]));

      for (const [relativePath, fileMatches] of sortedEntries) {
        lines.push(`📄 ${relativePath} (${fileMatches.length})`);
        for (const match of fileMatches) {
          const lineNum = String(match.line).padStart(4, " ");
          lines.push(`   ${lineNum}: ${match.content}`);
        }
        lines.push("");
      }

      writeFileSync(reportPath, lines.join("\n"), "utf-8");
      console.log(`📝 리포트 저장됨: ${reportPath}`);
    }

    process.exit(result.matches.length > 0 ? 0 : 1);
  } catch (error) {
    console.error(`오류: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}

main();
