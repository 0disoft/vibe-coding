
import { readdir, readFile, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";

const TARGET_DIR = process.argv[2] || "src/content";
const DRY_RUN = process.argv.includes("--dry-run");

// 조언에 기반한 정규식:
// 1. 구두점(.,:;!?)으로 끝나는 볼드체 뒤에 공백이 아닌 문자가 바로 붙는 경우.
//    예시: **Text:**Next -> 깨짐 발생
//    Regex: /(\*\*(?:(?!\*\*).)+?[.:;!?)]\*\*)(?=[^ \t\r\n\u00A0\u200B\u3000\uFEFF])/g

// 2. 고위험 CJK 스티키 볼드 (사용자가 언급한 한자 뒤 히라가나 등).
//    현재는 가장 명확하게 "깨지는" 규칙인 구두점 규칙에 집중합니다.
//    필요 시 패턴을 추가할 수 있습니다.

// Zero Width Space (폭 없는 공백)
const ZWS = "&#8203;";

async function walk(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(path)));
    } else if (entry.isFile() && extname(path) === ".md") {
      files.push(path);
    }
  }
  return files;
}

async function fixFile(path: string) {
  let content = await readFile(path, "utf-8");
  let originalContent = content;

  // 패턴 1: 구두점으로 끝나는 볼드체가 공백/ZWS 없이 문자와 이어질 때
  // 볼드 부분($1)을 캡처하고, 뒤에 공백이 아닌지 확인(lookahead)
  const punctuationRegex = /(\*\*(?:(?!\*\*).)+?[.:;!?)]\*\*)(?=[^ \t\r\n\u00A0\u200B\u3000\uFEFF.:;!?])/g;

  // 패턴 1 교체
  content = content.replace(punctuationRegex, (match) => {
    // 수정이 필요한지 결정
    // Lookahead가 매칭되었으므로 수정 대상임.
    return match + ZWS;
  });

  // 패턴 2: (사용자 피드백에 따라 추가 가능)
  // 현재는 "까다로운 케이스"에 대한 명시적 조언에 따라 구두점 수정만 적용합니다.

  if (content !== originalContent) {
    console.log(`[FIX] ${path}`);
    if (!DRY_RUN) {
      await writeFile(path, content, "utf-8");
    }
  } else {
    // console.log(`[OK] ${path}`);
  }
}

async function main() {
  console.log(`Scanning directory: ${TARGET_DIR}`);
  if (DRY_RUN) console.log("DRY RUN MODE: No files will be modified.");

  try {
    const files = await walk(TARGET_DIR);
    console.log(`Found ${files.length} markdown files.`);

    for (const file of files) {
      await fixFile(file);
    }

    console.log("Done.");
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
