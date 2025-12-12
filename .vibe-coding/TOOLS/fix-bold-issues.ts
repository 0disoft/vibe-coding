import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";

const DRY_RUN = process.argv.includes("--dry-run");

// 제로폭 공백을 HTML 엔티티로 삽입
const ZWS_ENTITY = "&#8203;";

// CJK 문자 판별 (한글, 한자, 히라가나, 가타카나)
function isCJK(char: string): boolean {
  if (!char) return false;
  const code = char.charCodeAt(0);
  return (
    (code >= 0xac00 && code <= 0xd7af) || // 한글 음절
    (code >= 0x1100 && code <= 0x11ff) || // 한글 자모
    (code >= 0x4e00 && code <= 0x9fff) || // CJK 통합 한자
    (code >= 0x3040 && code <= 0x309f) || // 히라가나
    (code >= 0x30a0 && code <= 0x30ff)    // 가타카나
  );
}

// 구두점으로 끝나는 볼드 패턴 (lookahead 없이)
// **...구두점** 형태를 캡처
const boldEndingWithPunct = /(\*\*(?:(?!\*\*).)+?[.:;!?)]\*\*)/g;

// 볼드 뒤에 CJK가 오는 경우에만 ZWS 삽입
function fixBoldBeforeCJK(text: string): { text: string; count: number; } {
  let count = 0;
  const result = text.replace(boldEndingWithPunct, (match, _bold, offset) => {
    const nextChar = text[offset + match.length];
    if (isCJK(nextChar)) {
      count++;
      return match + ZWS_ENTITY;
    }
    return match;
  });
  return { text: result, count };
}

async function walk(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(path)));
    } else if (entry.isFile()) {
      const ext = extname(path);
      if (ext === ".md" || ext === ".mdx") files.push(path);
    }
  }
  return files;
}

// 인라인 코드 구간을 피해 볼드 교정
function fixLineOutsideInlineCode(line: string): { line: string; count: number; } {
  // 백틱으로 split하고 짝수 인덱스(코드 외부)만 변환
  const parts = line.split("`");;
  let count = 0;

  for (let i = 0; i < parts.length; i += 2) {
    const fixed = fixBoldBeforeCJK(parts[i]);
    parts[i] = fixed.text;
    count += fixed.count;
  }

  return { line: parts.join("`"), count };
}

// 펜스 코드블록과 인라인 코드를 건너뛰며 마크다운 교정
function fixMarkdownKeepingCodeFences(content: string): { content: string; count: number; } {
  const lines = content.split("\n");
  let inFence = false;
  let fenceToken = "";
  let count = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trimStart();
    const fenceStarts = trimmed.startsWith("```") || trimmed.startsWith("~~~");

    if (!inFence && fenceStarts) {
      inFence = true;
      fenceToken = trimmed.slice(0, 3);
      continue;
    }

    if (inFence) {
      const fenceEnds = trimmed.startsWith(fenceToken);
      if (fenceEnds) {
        inFence = false;
        fenceToken = "";
      }
      continue;
    }

    const fixed = fixLineOutsideInlineCode(line);
    lines[i] = fixed.line;
    count += fixed.count;
  }

  return { content: lines.join("\n"), count };
}

async function fixFile(path: string): Promise<number> {
  const original = await readFile(path, "utf-8");
  const fixed = fixMarkdownKeepingCodeFences(original);

  if (fixed.content !== original) {
    console.log(`[FIX] ${path}  (${fixed.count}건)`);
    if (!DRY_RUN) {
      await writeFile(path, fixed.content, "utf-8");
    }
  }
  return fixed.count;
}

async function main() {
  // --로 시작하지 않는 첫 번째 인자를 경로로 사용
  const TARGET = process.argv.slice(2).find((arg) => !arg.startsWith("--")) || "src/content";
  console.log(`Scanning: ${TARGET}`);
  if (DRY_RUN) console.log("DRY RUN MODE: No files will be modified.");

  try {
    const targetStat = await stat(TARGET);
    let files: string[];

    if (targetStat.isFile()) {
      // 단일 파일 처리
      const ext = extname(TARGET);
      if (ext !== ".md" && ext !== ".mdx") {
        console.log("Error: Only .md or .mdx files are supported.");
        return;
      }
      files = [TARGET];
    } else {
      // 디렉토리 처리
      files = await walk(TARGET);
    }

    console.log(`Found ${files.length} markdown file(s).`);

    let totalFixed = 0;
    for (const file of files) {
      totalFixed += await fixFile(file);
    }

    console.log(`Done. Total fixes: ${totalFixed}`);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
