/**
 * README.md → SQLite 동기화 스크립트
 * 마크다운 테이블을 파싱하여 데이터베이스에 저장
 */
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { type ApiEntry, clearAllData, getOrCreateCategory, initDatabase, insertApis } from "./db";

// README.md 경로 (스크립트 위치 기준)
const __dirname = dirname(fileURLToPath(import.meta.url));
const README_PATH = resolve(__dirname, "../../PUBLIC_APIS/README.md");

/**
 * 마크다운 링크에서 URL과 텍스트 추출
 * [Text](URL) → { text: "Text", url: "URL" }
 */
function parseMarkdownLink(cell: string): { text: string; url: string | null; } {
  const match = cell.match(/\[([^\]]+)\]\(([^)]+)\)/);
  if (match) {
    return { text: match[1], url: match[2] };
  }
  return { text: cell.trim(), url: null };
}

/**
 * 테이블 행 파싱
 * | col1 | col2 | ... | → ["col1", "col2", ...]
 */
function parseTableRow(line: string): string[] {
  return line
    .split("|")
    .slice(1, -1) // 앞뒤 빈 요소 제거
    .map((cell) => cell.trim());
}

/**
 * 구분선인지 확인 (|---|---|...)
 */
function isSeparatorRow(line: string): boolean {
  return /^\|[\s-:|]+\|$/.test(line);
}

/**
 * 카테고리 헤더인지 확인 (### 카테고리명)
 */
function isCategoryHeader(line: string): string | null {
  const match = line.match(/^### (.+)$/);
  return match ? match[1].trim() : null;
}

/**
 * 추천도 파싱 (숫자 또는 "-")
 */
function parseRating(value: string): number | null {
  const num = parseInt(value, 10);
  return Number.isNaN(num) ? null : num;
}

/**
 * README.md 파싱 및 API 엔트리 추출
 */
async function parseReadme(): Promise<{ category: string; apis: Omit<ApiEntry, "categoryId">[]; }[]> {
  // 파일 존재 확인
  const file = Bun.file(README_PATH);
  if (!(await file.exists())) {
    throw new Error(`README.md를 찾을 수 없습니다: ${README_PATH}`);
  }

  const rawContent = await file.text();
  // Windows CRLF → LF 정규화
  const content = rawContent.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = content.split("\n");

  const result: { category: string; apis: Omit<ApiEntry, "categoryId">[]; }[] = [];
  let currentCategory: string | null = null;
  let currentApis: Omit<ApiEntry, "categoryId">[] = [];
  let inTable = false;
  let headerParsed = false;

  for (const line of lines) {
    // 카테고리 헤더 감지
    const category = isCategoryHeader(line);
    if (category) {
      // 이전 카테고리 저장
      if (currentCategory && currentApis.length > 0) {
        result.push({ category: currentCategory, apis: currentApis });
      }
      currentCategory = category;
      currentApis = [];
      inTable = false;
      headerParsed = false;
      continue;
    }

    // 테이블 시작 감지 (| API | 용도 | ...)
    const trimmed = line.trimStart();
    if (currentCategory && trimmed.startsWith("| API |")) {
      inTable = true;
      headerParsed = false;
      continue;
    }

    // 구분선 스킵
    if (inTable && isSeparatorRow(trimmed)) {
      headerParsed = true;
      continue;
    }

    // 테이블 행 파싱
    if (inTable && headerParsed && trimmed.startsWith("|")) {
      const cells = parseTableRow(trimmed);
      if (cells.length >= 8) {
        const { text: name, url } = parseMarkdownLink(cells[0]);
        currentApis.push({
          name,
          url,
          description: cells[1],
          auth: cells[2],
          https: cells[3],
          cors: cells[4],
          integration: cells[5],
          rating: parseRating(cells[6]),
          tags: cells[7],
        });
      }
    }

    // 테이블 종료 감지 (빈 줄 또는 다른 헤더)
    if (inTable && !trimmed.startsWith("|") && trimmed !== "") {
      inTable = false;
    }
  }

  // 마지막 카테고리 저장
  if (currentCategory && currentApis.length > 0) {
    result.push({ category: currentCategory, apis: currentApis });
  }

  return result;
}

/**
 * 메인 동기화 함수
 */
async function main() {
  console.log("🔄 API Catalog 동기화 시작...\n");

  // DB 초기화
  const db = initDatabase();
  console.log("📦 데이터베이스 초기화 완료");

  try {
    // README.md 파싱 (트랜잭션 외부에서 수행)
    const parsed = await parseReadme();
    console.log(`📖 ${parsed.length}개 카테고리 파싱 완료\n`);

    // 전체 동기화를 하나의 트랜잭션으로 처리 (원자성 보장)
    const syncAll = db.transaction(() => {
      // 기존 데이터 삭제
      clearAllData(db);
      console.log("🗑️  기존 데이터 삭제 완료");

      let totalApis = 0;

      // 카테고리별 삽입
      for (const { category, apis } of parsed) {
        const categoryId = getOrCreateCategory(db, category);
        const entries: ApiEntry[] = apis.map((api) => ({
          ...api,
          categoryId,
        }));
        insertApis(db, entries);
        totalApis += apis.length;
        console.log(`  ✅ ${category}: ${apis.length}개`);
      }

      return totalApis;
    });

    const totalApis = syncAll();
    console.log(`\n🎉 동기화 완료! 총 ${totalApis}개 API 저장됨`);
  } finally {
    db.close();
  }
}

main().catch(console.error);
