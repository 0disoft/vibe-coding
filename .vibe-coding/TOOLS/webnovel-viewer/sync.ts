/**
 * WEBNOVEL 마크다운 → SQLite 동기화 스크립트
 * 마크다운 테이블을 파싱하여 데이터베이스에 저장
 */
import { readdir } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  type ElementEntry,
  DB_PATH,
  deleteAllRows,
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
 * | **키** | 값 | 또는 | 키 | 값 | 형식 파싱 (볼드 선택적)
 */
function parseMarkdownTable(content: string): Map<string, string> {
  const result = new Map<string, string>();
  const lines = content.split("\n");

  for (const line of lines) {
    // 테이블 행 패턴: | **키** | 값 | 또는 | 키 | 값 | (볼드 선택적)
    const match = line.match(/^\|\s*(?:\*\*)?(.+?)(?:\*\*)?\s*\|\s*(.+?)\s*\|/);
    if (match) {
      const key = match[1].trim();
      // 구분선 행(| --- |, | :--- |, | ---: | 등) 스킵
      if (/^:?-+:?$/.test(key)) continue;
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
  if (!match) return null;
  const num = parseInt(match[1], 10);
  // DB CHECK (first_appear > 0) 정합성 유지
  return num > 0 ? num : null;
}

/**
 * 태그 파싱 (#태그1 #태그2 → "태그1,태그2")
 */
function parseTags(value: string | undefined): string | null {
  if (!value || value.startsWith("(예:") || value === "(작성 예정)") return null;
  const tags = value.match(/#([^\s#]+)/g);
  if (!tags) return null;
  // 태그 끝 구두점 제거 (, . ) ] 등)
  return tags.map((t) => t.slice(1).replace(/[,.)\]]+$/, "").trim()).filter(Boolean).join(",") || null;
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
  try {
    const files = await readdir(folderPath);
    const mdFiles = files.filter((f) => f.endsWith(".md"));

    // 병렬로 모든 파일 파싱 (I/O 대기 시간 최소화)
    const results = await Promise.all(
      mdFiles.map((file) => parseElementFile(join(folderPath, file), typeId))
    );

    // null 제외한 유효한 엔트리만 반환
    return results.filter((entry): entry is ElementEntry => entry !== null);
  } catch (e) {
    // 폴더 없음은 데이터 손실 위험이 있으므로 throw (엄격 모드)
    if ((e as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(
        `❌ 필수 폴더가 없습니다: ${folderPath}\n` +
        `   폴더를 생성하거나 경로를 확인하세요.`
      );
    }
    throw e;
  }
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

    // 줄거리 섹션 시작 (### 줄거리 헤딩만 매칭)
    if (/^###\s*줄거리\b/.test(line)) {
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
    // 요소 파싱 (트랜잭션 밖에서 수행 - I/O 완료 후 DB 삭제+삽입 원자적 처리)
    const allElements: { folder: string; elements: ElementEntry[]; }[] = [];
    for (const { folder, type } of TYPE_FOLDERS) {
      const typeId = getTypeId(db, type);
      if (!typeId) {
        throw new Error(
          `❌ 유형 ID를 찾을 수 없음: ${type}\n` +
          `   다음 파일을 삭제 후 재동기화하세요:\n` +
          `   "${DB_PATH}"`
        );
      }

      const folderPath = join(WEBNOVEL_PATH, folder);
      const elements = await parseElementsInFolder(folderPath, typeId);
      allElements.push({ folder, elements });
    }

    const episodes = await parseEpisodes();

    // 트랜잭션으로 삭제+삽입 일괄 처리 (원자성 보장, 성능 향상)
    let totalElements = 0;
    db.transaction(() => {
      // 기존 데이터 삭제 (트랜잭션 안에서 수행)
      deleteAllRows(db);

      for (const { folder, elements } of allElements) {
        for (const element of elements) {
          upsertElement(db, element);
        }
        console.log(`  ✅ ${folder}: ${elements.length}개`);
        totalElements += elements.length;
      }

      for (const ep of episodes) {
        upsertEpisode(db, ep.num, ep.summary);
      }
    })();
    console.log(`\n  ✅ episodes: ${episodes.length}개`);

    console.log(`\n🎉 동기화 완료! 총 ${totalElements}개 요소, ${episodes.length}개 에피소드`);
  } finally {
    db.close();
  }
}

main().catch(console.error);
