/**
 * API Catalog Database 스키마 및 초기화
 * bun:sqlite 기반 SQLite 데이터베이스
 */
import { Database } from "bun:sqlite";

// DB 파일 경로 (스크립트 위치 기준)
const DB_PATH = new URL("./api-catalog.sqlite", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");

/**
 * 데이터베이스 연결 및 스키마 초기화
 */
export function initDatabase(): Database {
  const db = new Database(DB_PATH, { create: true });

  // WAL 모드 활성화 (성능 향상)
  db.exec("PRAGMA journal_mode = WAL;");

  // 카테고리 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );
  `);

  // API 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS apis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      url TEXT,
      description TEXT,
      auth TEXT,
      https TEXT,
      cors TEXT,
      integration TEXT,
      rating INTEGER,
      tags TEXT,
      category_id INTEGER,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );
  `);

  // 인덱스 생성
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_apis_category ON apis(category_id);
    CREATE INDEX IF NOT EXISTS idx_apis_auth ON apis(auth);
    CREATE INDEX IF NOT EXISTS idx_apis_cors ON apis(cors);
    CREATE INDEX IF NOT EXISTS idx_apis_rating ON apis(rating);
  `);

  return db;
}

/**
 * 카테고리 삽입 또는 ID 조회
 */
export function getOrCreateCategory(db: Database, name: string): number {
  const existing = db.query<{ id: number; }, [string]>(
    "SELECT id FROM categories WHERE name = ?"
  ).get(name);

  if (existing) return existing.id;

  const result = db.query<{ id: number; }, [string]>(
    "INSERT INTO categories (name) VALUES (?) RETURNING id"
  ).get(name);

  if (!result) throw new Error(`카테고리 생성 실패: ${name}`);
  return result.id;
}

/**
 * API 엔트리 타입
 */
export interface ApiEntry {
  name: string;
  url: string | null;
  description: string;
  auth: string;
  https: string;
  cors: string;
  integration: string;
  rating: number | null;
  tags: string;
  categoryId: number;
}

/**
 * API 일괄 삽입
 */
export function insertApis(db: Database, apis: ApiEntry[]): void {
  const insert = db.prepare(`
    INSERT INTO apis (name, url, description, auth, https, cors, integration, rating, tags, category_id)
    VALUES ($name, $url, $description, $auth, $https, $cors, $integration, $rating, $tags, $categoryId)
  `);

  const insertMany = db.transaction((entries: ApiEntry[]) => {
    for (const api of entries) {
      insert.run({
        $name: api.name,
        $url: api.url,
        $description: api.description,
        $auth: api.auth,
        $https: api.https,
        $cors: api.cors,
        $integration: api.integration,
        $rating: api.rating,
        $tags: api.tags,
        $categoryId: api.categoryId,
      });
    }
  });

  insertMany(apis);
}

/**
 * 모든 데이터 삭제 (동기화 전 초기화)
 */
export function clearAllData(db: Database): void {
  db.exec("DELETE FROM apis;");
  db.exec("DELETE FROM categories;");
}

export { DB_PATH };

