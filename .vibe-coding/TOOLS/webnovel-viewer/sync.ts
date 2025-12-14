/**
 * WEBNOVEL 마크다운 → SQLite 동기화 스크립트
 * 마크다운 테이블을 파싱하여 데이터베이스에 저장
 */
import { readdir } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  type ElementEntry,
  clearAllData,
  getTypeId,
  initDatabase,
  upsertElement,
  upsertEpisode,
} from "./db";

// 경로 설정
const __dirname = dirname(fileURLToPath(import.meta.url));
const WEBNOVEL_PATH = join(__dirname, "../../WEBNOVEL");

// 요소 유형별 폴더 매핑
const TYPE_FOLDERS = [
  { folder: "characters", type: "character" },
  { folder: "objects", type: "object" },
  { folder: "phenomena", type: "phenomenon" },
] as const;

/**
 * 마크다운 테이블에서 키-값 추출
 * | **키** | 값 | 형식 파싱
 */
function parseMarkdownTable(content: string): Map<string, string> {
  const result = new Map<string, string>();
  const lines = content.split("\n");

  for (const line of lines) {
    // 테이블 행 패턴: | **키** | 값 |
    const match = line.match(/^\|\s*\*\*(.+?)\*\*\s*\|\s*(.+?)\s*\|/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      result.set(key, value);
    }
  }

  return result;
}

/**
 * 등장화 파싱 (숫자 또는 null)
 */
function parseFirstAppear(value: string | undefined): number | null {
  if (!value || value === "(몇 화에서 등장)" || value === "(작성 예정)") return null;
  const match = value.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * 태그 파싱 (#태그1 #태그2 → "태그1,태그2")
 */
function parseTags(value: string | undefined): string | null {
  if (!value || value.startsWith("(예:") || value === "(작성 예정)") return null;
  const tags = value.match(/#([^\s#]+)/g);
  return tags ? tags.map((t) => t.slice(1)).join(",") : null;
}

/**
 * 요소 파일 파싱
 */
async function parseElementFile(
  filePath: string,
  typeId: number
): Promise<ElementEntry | null> {
  const file = Bun.file(filePath);
  if (!(await file.exists())) return null;

  const content = await file.text();
  const slug = basename(filePath, ".md");

  // 템플릿 파일 스킵
  if (slug === "_template") return null;

  const table = parseMarkdownTable(content);

  // 표시명 추출
  const displayName = table.get("표시명") ?? slug;
  if (displayName.startsWith("(")) return null; // 미작성 파일 스킵

  // 역할 추출 (캐릭터용)
  const role = table.get("역할") ?? null;

  // 등장화 추출
  const firstAppear = parseFirstAppear(table.get("등장화"));

  // 태그 추출
  const tags = parseTags(table.get("태그"));

  return {
    slug,
    displayName,
    typeId,
    role: role?.startsWith("(") ? null : role,
    firstAppear,
    tags,
    rawContent: content,
  };
}

/**
 * 폴더 내 모든 요소 파싱
 */
async function parseElementsInFolder(
  folderPath: string,
  typeId: number
): Promise<ElementEntry[]> {
  const entries: ElementEntry[] = [];

  try {
    const files = await readdir(folderPath);
    for (const file of files) {
      if (!file.endsWith(".md")) continue;

      const filePath = join(folderPath, file);
      const entry = await parseElementFile(filePath, typeId);
      if (entry) entries.push(entry);
    }
  } catch (e) {
    // 폴더가 없으면 무시
    console.log(`  (폴더 없음: ${folderPath})`);
  }

  return entries;
}

/**
 * EPISODES.md 파싱
 */
async function parseEpisodes(): Promise<{ num: number; summary: string; }[]> {
  const file = Bun.file(join(WEBNOVEL_PATH, "EPISODES.md"));
  if (!(await file.exists())) return [];

  const content = await file.text();
  const lines = content.split("\n");
  const episodes: { num: number; summary: string; }[] = [];

  let currentEpisode: number | null = null;
  let inSummary = false;
  let summary = "";

  for (const line of lines) {
    // 에피소드 헤더 (## 1화, ## 2화, ...)
    const episodeMatch = line.match(/^## (\d+)화/);
    if (episodeMatch) {
      // 이전 에피소드 저장
      if (currentEpisode !== null && summary.trim()) {
        episodes.push({ num: currentEpisode, summary: summary.trim() });
      }
      currentEpisode = parseInt(episodeMatch[1], 10);
      summary = "";
      inSummary = false;
      continue;
    }

    // 줄거리 섹션 시작
    if (line.includes("줄거리")) {
      inSummary = true;
      continue;
    }

    // 다른 섹션 시작 시 줄거리 종료
    if (line.startsWith("###") || line.startsWith("---")) {
      inSummary = false;
      continue;
    }

    // 줄거리 내용 수집
    if (inSummary && currentEpisode !== null) {
      summary += line + "\n";
    }
  }

  // 마지막 에피소드 저장
  if (currentEpisode !== null && summary.trim()) {
    episodes.push({ num: currentEpisode, summary: summary.trim() });
  }

  return episodes;
}

/**
 * 메인 동기화 함수
 */
async function main() {
  console.log("🔄 Webnovel 동기화 시작...\n");

  const db = initDatabase();
  console.log("📦 데이터베이스 초기화 완료");

  try {
    // 기존 데이터 삭제
    clearAllData(db);
    console.log("🗑️  기존 데이터 삭제 완료\n");

    // 요소 동기화
    let totalElements = 0;
    for (const { folder, type } of TYPE_FOLDERS) {
      const typeId = getTypeId(db, type);
      if (!typeId) {
        console.error(`유형 ID를 찾을 수 없음: ${type}`);
        continue;
      }

      const folderPath = join(WEBNOVEL_PATH, folder);
      const elements = await parseElementsInFolder(folderPath, typeId);

      for (const element of elements) {
        upsertElement(db, element);
      }

      console.log(`  ✅ ${folder}: ${elements.length}개`);
      totalElements += elements.length;
    }

    // 에피소드 동기화
    const episodes = await parseEpisodes();
    for (const ep of episodes) {
      upsertEpisode(db, ep.num, ep.summary);
    }
    console.log(`\n  ✅ episodes: ${episodes.length}개`);

    console.log(`\n🎉 동기화 완료! 총 ${totalElements}개 요소, ${episodes.length}개 에피소드`);
  } finally {
    db.close();
  }
}

main().catch(console.error);
