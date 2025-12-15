#!/usr/bin/env bun
/**
 * 05-file-size-patterns.ts
 * 파일 크기 및 복잡도 검사 도구
 *
 * AGENTS.md의 '파일 크기 및 분리 기준'에 따라 파일을 분석합니다.
 * - ~150줄: 🟡 경고 — 책임 분리 점검
 * - ~300줄: 🟠 권장 — 파일 분리 권장
 * - ~600줄: 🔴 필수 — 즉시 분리
 * - 1000+줄: 💀 리스크 — 구조 리스크
 */

import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

// ─────────────────────────────────────────────────────────────────────────────
// 설정
// ─────────────────────────────────────────────────────────────────────────────

/** 줄 수 임계치 */
const THRESHOLDS = {
  WARNING: 150,   // 🟡 경고
  RECOMMEND: 300, // 🟠 권장
  REQUIRED: 600,  // 🔴 필수
  RISK: 1000,     // 💀 리스크
} as const;

/** import 개수 임계치 */
const IMPORT_THRESHOLD = 20;

/** 바이트 크기 임계치 (이하 파일은 줄 수 검사 생략) */
const BYTE_THRESHOLD = 4096;

/** 검사 대상 확장자 */
const TARGET_EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
  ".svelte", ".vue",
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
];

/** 진입 파일 패턴 (조립 파일) */
const ENTRY_FILE_PATTERNS = [
  /hooks\.server\.ts$/,
  /hooks\.client\.ts$/,
  /\+layout\.server\.ts$/,
  /\+layout\.ts$/,
  /\+page\.server\.ts$/,
  /\+server\.ts$/,        // API 라우트
  /\+error\.svelte$/,     // 에러 페이지
  /vite\.config\.(ts|js)$/,
  /svelte\.config\.(ts|js)$/,
  /uno\.config\.(ts|js)$/,
  /tailwind\.config\.(ts|js)$/,
  /eslint\.config\.(ts|js)$/,
];

// ─────────────────────────────────────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────────────────────────────────────

type Severity = "warning" | "recommend" | "required" | "risk";
type Emoji = "🟡" | "🟠" | "🔴" | "💀";

interface FileAnalysis {
  path: string;
  relativePath: string;
  lines: number;
  imports: number;
  isEntryFile: boolean;
  severity: Severity | null;
  issues: string[];
}

interface ScanResult {
  files: FileAnalysis[];
  totalFiles: number;
  skippedSmallFiles: number;
  issueCount: Record<Severity, number>;
}

// ─────────────────────────────────────────────────────────────────────────────
// 유틸리티 함수
// ─────────────────────────────────────────────────────────────────────────────

const SEVERITY_EMOJI: Record<Severity, Emoji> = {
  warning: "🟡",
  recommend: "🟠",
  required: "🔴",
  risk: "💀",
};

const SEVERITY_LABEL: Record<Severity, string> = {
  warning: "경고",
  recommend: "권장",
  required: "필수",
  risk: "리스크",
};

function shouldIgnore(path: string): boolean {
  // 세그먼트 기반 매칭으로 오탐 방지 (예: "dist"가 "distance"와 매칭되는 문제)
  const segments = path.split(/[\\/]/);
  return IGNORE_PATTERNS.some((pattern) => segments.includes(pattern));
}

function isTargetFile(path: string): boolean {
  const ext = extname(path).toLowerCase();
  return TARGET_EXTENSIONS.has(ext);
}

function isEntryFile(path: string): boolean {
  return ENTRY_FILE_PATTERNS.some((pattern) => pattern.test(path));
}

function countLines(content: string): number {
  // CRLF/CR 정규화 후 마지막 빈 줄 제거하여 정확한 줄 수 계산
  return content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trimEnd().split("\n").length;
}

function countImports(content: string): number {
  const importRegex = /^import\s+/gm;
  const matches = content.match(importRegex);
  return matches ? matches.length : 0;
}

function getSeverity(lines: number, isEntry: boolean): Severity | null {
  // 진입 파일은 더 엄격한 기준 적용 (50~150줄 목표)
  if (isEntry) {
    if (lines >= 300) return "risk";
    if (lines >= 200) return "required";
    if (lines >= 150) return "recommend";
    return null;
  }

  // 일반 모듈
  if (lines >= THRESHOLDS.RISK) return "risk";
  if (lines >= THRESHOLDS.REQUIRED) return "required";
  if (lines >= THRESHOLDS.RECOMMEND) return "recommend";
  if (lines >= THRESHOLDS.WARNING) return "warning";
  return null;
}

function analyzeFile(filePath: string, basePath: string): FileAnalysis {
  const content = readFileSync(filePath, "utf-8");
  const lines = countLines(content);
  const imports = countImports(content);
  const isEntry = isEntryFile(filePath);
  const relativePath = relative(basePath, filePath);
  let severity = getSeverity(lines, isEntry);

  const issues: string[] = [];

  // 줄 수 이슈
  if (severity) {
    if (isEntry) {
      issues.push(`진입 파일 ${lines}줄 (목표: 50~150줄)`);
    } else {
      issues.push(`${lines}줄 — ${SEVERITY_LABEL[severity]} 수준`);
    }
  }

  // import 개수 이슈 (초과 시 최소 warning으로 승격하여 출력 보장)
  if (imports > IMPORT_THRESHOLD) {
    issues.push(`import ${imports}개 (임계치: ${IMPORT_THRESHOLD}개)`);
    if (!severity) {
      severity = "warning";
    }
  }

  return {
    path: filePath,
    relativePath,
    lines,
    imports,
    isEntryFile: isEntry,
    severity,
    issues,
  };
}

function walkDirectory(dir: string, basePath: string): { files: string[]; skipped: number; } {
  const files: string[] = [];
  let skipped = 0;

  try {
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (shouldIgnore(fullPath)) continue;

      if (entry.isDirectory()) {
        const result = walkDirectory(fullPath, basePath);
        files.push(...result.files);
        skipped += result.skipped;
      } else if (entry.isFile() && isTargetFile(entry.name)) {
        // 진입 파일은 크기와 무관하게 항상 분석 (정책 준수)
        if (isEntryFile(fullPath)) {
          files.push(fullPath);
          continue;
        }
        // 4KB 이하 파일은 대부분 150줄 미달이므로 스킵 (I/O 최적화)
        const fileStat = statSync(fullPath);
        if (fileStat.size <= BYTE_THRESHOLD) {
          skipped++;
          continue;
        }
        files.push(fullPath);
      }
    }
  } catch (_error) {
    console.error(`디렉토리 읽기 실패: ${dir}`);
  }

  return { files, skipped };
}

function scan(targetPath: string): ScanResult {
  const stat = statSync(targetPath);
  const basePath = stat.isDirectory() ? targetPath : join(targetPath, "..");
  let files: string[] = [];
  let skippedSmallFiles = 0;

  if (stat.isDirectory()) {
    const result = walkDirectory(targetPath, basePath);
    files = result.files;
    skippedSmallFiles = result.skipped;
  } else if (isTargetFile(targetPath)) {
    files.push(targetPath);
  }

  const analyses: FileAnalysis[] = [];
  const issueCount: Record<Severity, number> = {
    warning: 0,
    recommend: 0,
    required: 0,
    risk: 0,
  };

  for (const file of files) {
    const analysis = analyzeFile(file, basePath);
    analyses.push(analysis);

    if (analysis.severity) {
      issueCount[analysis.severity]++;
    }
  }

  // 심각도 순으로 정렬 (risk > required > recommend > warning)
  const severityOrder: Record<Severity | "null", number> = {
    risk: 0,
    required: 1,
    recommend: 2,
    warning: 3,
    null: 4,
  };

  analyses.sort((a, b) => {
    const aOrder = severityOrder[a.severity ?? "null"];
    const bOrder = severityOrder[b.severity ?? "null"];
    if (aOrder !== bOrder) return aOrder - bOrder;
    return b.lines - a.lines;
  });

  return {
    files: analyses,
    totalFiles: files.length,
    skippedSmallFiles,
    issueCount,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 출력 함수
// ─────────────────────────────────────────────────────────────────────────────

function printResult(result: ScanResult, showAll: boolean): void {
  const { files, totalFiles, skippedSmallFiles, issueCount } = result;
  const issueFiles = files.filter((f) => f.issues.length > 0);

  console.log("\n📊 파일 크기 검사 결과\n");
  console.log(`분석: ${totalFiles}개 | 소형 스킵: ${skippedSmallFiles}개 | 총 대상: ${totalFiles + skippedSmallFiles}개\n`);

  // 요약
  const totalIssues = Object.values(issueCount).reduce((a, b) => a + b, 0);

  if (totalIssues === 0) {
    console.log("✅ 모든 파일이 기준을 충족합니다.\n");
    return;
  }

  console.log("── 요약 ────────────────────────────────────────");
  console.log(`💀 리스크:  ${issueCount.risk}개`);
  console.log(`🔴 필수:    ${issueCount.required}개`);
  console.log(`🟠 권장:    ${issueCount.recommend}개`);
  console.log(`🟡 경고:    ${issueCount.warning}개`);
  console.log("────────────────────────────────────────────────\n");

  // 상세 목록
  const displayFiles = showAll ? issueFiles : issueFiles.slice(0, 20);

  for (const file of displayFiles) {
    if (!file.severity) continue;

    const emoji = SEVERITY_EMOJI[file.severity];
    const entryTag = file.isEntryFile ? " [진입]" : "";

    console.log(`${emoji} ${file.relativePath}${entryTag}`);
    console.log(`   줄: ${file.lines} | import: ${file.imports}`);

    for (const issue of file.issues) {
      console.log(`   → ${issue}`);
    }
    console.log();
  }

  if (!showAll && issueFiles.length > 20) {
    console.log(`... 외 ${issueFiles.length - 20}개 파일 (전체: --all 옵션)\n`);
  }

  // 기준 안내
  console.log("── 기준 (AGENTS.md) ────────────────────────────");
  console.log("🟡 ~150줄  : 책임이 2개 이상인지 점검");
  console.log("🟠 ~300줄  : 모듈 경계 잡고 파일 분리");
  console.log("🔴 ~600줄  : 즉시 분리 (리뷰·테스트 비용 급증)");
  console.log("💀 1000+줄 : 진입 파일은 조립만, 로직 이동");
  console.log("────────────────────────────────────────────────\n");
}

function generateReportText(result: ScanResult, showAll: boolean): string {
  const { files, totalFiles, skippedSmallFiles, issueCount } = result;
  const issueFiles = files.filter((f) => f.issues.length > 0);
  const lines: string[] = [];

  lines.push(`📊 파일 크기 검사 결과\n`);
  lines.push(`분석: ${totalFiles}개 | 소형 스킵: ${skippedSmallFiles}개 | 총 대상: ${totalFiles + skippedSmallFiles}개\n`);

  const totalIssues = Object.values(issueCount).reduce((a, b) => a + b, 0);

  if (totalIssues === 0) {
    lines.push("✅ 모든 파일이 기준을 충족합니다.\n");
    return lines.join("\n");
  }

  lines.push("── 요약 ────────────────────────────────────────");
  lines.push(`💀 리스크:  ${issueCount.risk}개`);
  lines.push(`🔴 필수:    ${issueCount.required}개`);
  lines.push(`🟠 권장:    ${issueCount.recommend}개`);
  lines.push(`🟡 경고:    ${issueCount.warning}개`);
  lines.push("────────────────────────────────────────────────\n");

  const displayFiles = showAll ? issueFiles : issueFiles.slice(0, 20);

  for (const file of displayFiles) {
    if (!file.severity) continue;

    const emoji = SEVERITY_EMOJI[file.severity];
    const entryTag = file.isEntryFile ? " [진입]" : "";

    lines.push(`${emoji} ${file.relativePath}${entryTag}`);
    lines.push(`   줄: ${file.lines} | import: ${file.imports}`);

    for (const issue of file.issues) {
      lines.push(`   → ${issue}`);
    }
    lines.push("");
  }

  if (!showAll && issueFiles.length > 20) {
    lines.push(`... 외 ${issueFiles.length - 20}개 파일 (전체: --all 옵션)\n`);
  }

  lines.push("── 기준 (AGENTS.md) ────────────────────────────");
  lines.push("🟡 ~150줄  : 책임이 2개 이상인지 점검");
  lines.push("🟠 ~300줄  : 모듈 경계 잡고 파일 분리");
  lines.push("🔴 ~600줄  : 즉시 분리 (리뷰·테스트 비용 급증)");
  lines.push("💀 1000+줄 : 진입 파일은 조립만, 로직 이동");
  lines.push("────────────────────────────────────────────────\n");

  return lines.join("\n");
}

function printHelp(): void {
  console.log(`
📏 05-file-size-patterns.ts — 파일 크기 및 복잡도 검사

사용법:
  bun .vibe-coding/TOOLS/05-file-size-patterns.ts [경로] [옵션]

옵션:
  --all         모든 이슈 파일 표시 (기본: 상위 20개)
  --json        JSON 형식으로 출력
  --no-report   리포트 파일 생성 생략
  --help, -h    도움말 표시

예시:
  bun .vibe-coding/TOOLS/05-file-size-patterns.ts              # src 전체 스캔
  bun .vibe-coding/TOOLS/05-file-size-patterns.ts src/lib      # 특정 디렉토리
  bun .vibe-coding/TOOLS/05-file-size-patterns.ts --all        # 전체 목록
  bun .vibe-coding/TOOLS/05-file-size-patterns.ts --json       # JSON 출력

기준 (AGENTS.md):
  🟡 ~150줄   경고 — 책임 분리 점검
  🟠 ~300줄   권장 — 파일 분리 권장
  🔴 ~600줄   필수 — 즉시 분리
  💀 1000+줄  리스크 — 구조 리스크

  진입 파일 (hooks.server.ts 등): 50~150줄 목표
  import 20개 초과 시 별도 경고

최적화:
  디렉토리 스캔 시 4KB 이하 파일은 스킵 (I/O 최적화)
  단일 파일 지정 시는 항상 분석
  진입 파일은 크기와 무관하게 항상 분석
`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 메인
// ─────────────────────────────────────────────────────────────────────────────

function main(): void {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    printHelp();
    process.exit(0);
  }

  const showAll = args.includes("--all");
  const jsonOutput = args.includes("--json");
  const noReport = args.includes("--no-report");
  const targetPath = args.find((arg) => !arg.startsWith("--")) ?? "src";

  try {
    const startTime = performance.now();
    const result = scan(targetPath);
    const elapsed = performance.now() - startTime;
    const elapsedStr = elapsed < 1000 ? `${elapsed.toFixed(0)}ms` : `${(elapsed / 1000).toFixed(2)}s`;
    let output: string;

    if (jsonOutput) {
      output = JSON.stringify({ ...result, elapsed: elapsedStr }, null, 2);
      console.log(output);
    } else {
      // printResult는 console.log로 출력하므로 별도 처리
      printResult(result, showAll);
      console.log(`⏱️ 소요 시간: ${elapsedStr}\n`);
      // 리포트용 텍스트 생성
      output = generateReportText(result, showAll);
    }

    // 리포트 저장
    if (!noReport && (result.issueCount.required > 0 || result.issueCount.risk > 0 ||
      result.issueCount.recommend > 0 || result.issueCount.warning > 0)) {
      const scriptDir = dirname(fileURLToPath(import.meta.url));
      const reportsDir = join(scriptDir, "reports");
      mkdirSync(reportsDir, { recursive: true });
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const reportPath = join(reportsDir, "file-size-report.txt");
      const header = `File Size Report - ${timestamp}\nTarget: ${targetPath}\nElapsed: ${elapsedStr}\n${'='.repeat(50)}\n\n`;
      writeFileSync(reportPath, header + output, "utf-8");
      console.log(`📝 리포트 저장됨: ${reportPath}`);
    }

    // 필수/리스크 레벨이 있으면 exit code 1
    const hasErrors = result.issueCount.required > 0 || result.issueCount.risk > 0;
    process.exit(hasErrors ? 1 : 0);
  } catch (error) {
    console.error(`오류: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}

main();
