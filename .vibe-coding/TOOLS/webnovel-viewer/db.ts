/**
 * Webnovel Viewer Database 스키마 및 초기화
 * bun:sqlite 기반 SQLite 데이터베이스
 */
import { Database } from "bun:sqlite";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// DB 파일 경로 (스크립트 위치 기준)
const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "webnovel.sqlite");

/**
 * 데이터베이스 연결 및 스키마 초기화
 */
export function initDatabase(): Database {
  const db = new Database(DB_PATH, { create: true });

  // 외래 키 제약조건 활성화
  db.run("PRAGMA foreign_keys = ON;");

  // WAL 모드 활성화 (성능 향상)
  db.run("PRAGMA journal_mode = WAL;");

  // busy_timeout 설정 (동시 접근 시 대기, 3초)
  db.run("PRAGMA busy_timeout = 3000;");

  // 요소 유형 테이블
  db.run(`
    CREATE TABLE IF NOT EXISTS element_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL
    );
  `);

  // 기본 유형 삽입
  db.run(`
    INSERT OR IGNORE INTO element_types (name, display_name) VALUES
    ('character', '캐릭터'),
    ('object', '사물'),
    ('phenomenon', '현상');
  `);

  // 등장요소 테이블
  db.run(`
    CREATE TABLE IF NOT EXISTS elements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      type_id INTEGER NOT NULL,
      role TEXT,
      first_appear INTEGER,
      tags TEXT,
      raw_content TEXT,
      FOREIGN KEY (type_id) REFERENCES element_types(id)
    );
  `);

  // 에피소드 테이블
  db.run(`
    CREATE TABLE IF NOT EXISTS episodes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      episode_num INTEGER UNIQUE NOT NULL,
      plot_summary TEXT
    );
  `);

  // 에피소드-요소 연결 테이블 (M:N)
  db.run(`
    CREATE TABLE IF NOT EXISTS episode_elements (
      episode_id INTEGER NOT NULL,
      element_id INTEGER NOT NULL,
      PRIMARY KEY (episode_id, element_id),
      FOREIGN KEY (episode_id) REFERENCES episodes(id),
      FOREIGN KEY (element_id) REFERENCES elements(id)
    );
  `);

  // 인덱스 생성
  db.run("CREATE INDEX IF NOT EXISTS idx_elements_type ON elements(type_id);");
  db.run("CREATE INDEX IF NOT EXISTS idx_elements_first_appear ON elements(first_appear);");
  db.run("CREATE INDEX IF NOT EXISTS idx_episode_elements_episode ON episode_elements(episode_id);");
  db.run("CREATE INDEX IF NOT EXISTS idx_episode_elements_element ON episode_elements(element_id);");

  return db;
}

/**
 * 요소 유형 ID 조회
 */
export function getTypeId(db: Database, typeName: string): number | null {
  const result = db.query<{ id: number; }, [string]>(
    "SELECT id FROM element_types WHERE name = ?"
  ).get(typeName);
  return result?.id ?? null;
}

/**
 * 요소 엔트리 타입
 */
export interface ElementEntry {
  slug: string;
  displayName: string;
  typeId: number;
  role: string | null;
  firstAppear: number | null;
  tags: string | null;
  rawContent: string;
}

/**
 * 요소 삽입 (UPSERT)
 */
export function upsertElement(db: Database, element: ElementEntry): void {
  db.run(`
    INSERT INTO elements (slug, display_name, type_id, role, first_appear, tags, raw_content)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET
      display_name = excluded.display_name,
      type_id = excluded.type_id,
      role = excluded.role,
      first_appear = excluded.first_appear,
      tags = excluded.tags,
      raw_content = excluded.raw_content
  `, [
    element.slug,
    element.displayName,
    element.typeId,
    element.role,
    element.firstAppear,
    element.tags,
    element.rawContent,
  ]);
}

/**
 * 에피소드 삽입 (UPSERT)
 */
export function upsertEpisode(db: Database, episodeNum: number, plotSummary: string): number {
  const result = db.query<{ id: number; }, [number, string]>(`
    INSERT INTO episodes (episode_num, plot_summary)
    VALUES (?, ?)
    ON CONFLICT(episode_num) DO UPDATE SET plot_summary = excluded.plot_summary
    RETURNING id
  `).get(episodeNum, plotSummary);
  if (!result) throw new Error(`에피소드 생성 실패: ${episodeNum}`);
  return result.id;
}

/**
 * 모든 데이터 삭제 (동기화 전 초기화)
 */
export function clearAllData(db: Database): void {
  db.run("DELETE FROM episode_elements;");
  db.run("DELETE FROM elements;");
  db.run("DELETE FROM episodes;");
}

export { DB_PATH };

