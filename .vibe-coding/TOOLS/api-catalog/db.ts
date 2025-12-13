/**
 * API Catalog Database 스키마 및 초기화
 * bun:sqlite 기반 SQLite 데이터베이스
 */
import { Database } from "bun:sqlite";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// DB 파일 경로 (스크립트 위치 기준)
const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "api-catalog.sqlite");

/**
 * 데이터베이스 연결 및 스키마 초기화
 */
export function initDatabase(): Database {
  const db = new Database(DB_PATH, { create: true });

  // 외래 키 제약조건 활성화 (참조 무결성)
  db.run("PRAGMA foreign_keys = ON;");

  // WAL 모드 활성화 (성능 향상)
  db.run("PRAGMA journal_mode = WAL;");

  // busy_timeout 설정 (동시 접근 시 대기, 3초)
  db.run("PRAGMA busy_timeout = 3000;");

  // 카테고리 테이블
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );
  `);

  // API 테이블
  db.run(`
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

  // 인덱스 생성 (개별 실행으로 런타임 호환성 보장)
  db.run("CREATE INDEX IF NOT EXISTS idx_apis_category ON apis(category_id);");
  db.run("CREATE INDEX IF NOT EXISTS idx_apis_auth ON apis(auth);");
  db.run("CREATE INDEX IF NOT EXISTS idx_apis_cors ON apis(cors);");
  db.run("CREATE INDEX IF NOT EXISTS idx_apis_rating ON apis(rating);");

  return db;
}

/**
 * 카테고리 삽입 또는 ID 조회 (UPSERT 패턴으로 경합 안전)
 */
export function getOrCreateCategory(db: Database, name: string): number {
  // INSERT ... ON CONFLICT 패턴으로 동시 실행 경합 방지
  // DO UPDATE는 RETURNING을 사용하기 위한 no-op (실제 값 변경 없음)
  const result = db.query<{ id: number; }, [string]>(
    `INSERT INTO categories (name) VALUES (?)
     ON CONFLICT(name) DO UPDATE SET name = excluded.name
     RETURNING id`
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
  db.run("DELETE FROM apis;");
  db.run("DELETE FROM categories;");
}

export { DB_PATH };

