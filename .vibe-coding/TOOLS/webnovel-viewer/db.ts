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

// 스키마 버전 (변경 시 증가, DB 재생성 필요)
const SCHEMA_VERSION = 2;

// 애플리케이션 식별자 (SQLite 내장 기능, "WVNL" = 0x57564E4C)
const APPLICATION_ID = 0x57564E4C;

// 필수 테이블 목록
const REQUIRED_TABLES = ["element_types", "elements", "episodes", "episode_elements"] as const;

/**
 * 레거시/불일치 DB를 현재 스키마로 재생성
 * (DB는 WEBNOVEL 마크다운에서 재생성 가능하므로, 동기화 스크립트 실행 시 안전하게 재구축합니다.)
 */
function rebuildDatabaseSchema(db: Database): void {
  db.transaction(() => {
    db.run("PRAGMA foreign_keys = OFF;");

    db.run("DROP TABLE IF EXISTS episode_elements;");
    db.run("DROP TABLE IF EXISTS elements;");
    db.run("DROP TABLE IF EXISTS episodes;");
    db.run("DROP TABLE IF EXISTS element_types;");

    db.run("DROP INDEX IF EXISTS idx_elements_type;");
    db.run("DROP INDEX IF EXISTS idx_elements_first_appear;");
    db.run("DROP INDEX IF EXISTS idx_elements_role;");
    db.run("DROP INDEX IF EXISTS idx_elements_type_first_appear;");
    db.run("DROP INDEX IF EXISTS idx_episode_elements_episode;");
    db.run("DROP INDEX IF EXISTS idx_episode_elements_element;");

    db.run("PRAGMA foreign_keys = ON;");
  })();
}

/**
 * 스키마 스모크 테스트: 주요 제약조건이 올바르게 적용되었는지 확인
 */
function validateSchemaIntegrity(db: Database): string | null {
  // elements.raw_content가 NOT NULL인지 확인
  const elementsInfo = db.query<{ name: string; notnull: number; }, []>(
    "SELECT name, \"notnull\" FROM pragma_table_info('elements') WHERE name = 'raw_content'"
  ).get();
  if (!elementsInfo || elementsInfo.notnull !== 1) {
    return "elements.raw_content NOT NULL 제약조건 누락";
  }

  // episodes.plot_summary가 NOT NULL인지 확인
  const episodesInfo = db.query<{ name: string; notnull: number; }, []>(
    "SELECT name, \"notnull\" FROM pragma_table_info('episodes') WHERE name = 'plot_summary'"
  ).get();
  if (!episodesInfo || episodesInfo.notnull !== 1) {
    return "episodes.plot_summary NOT NULL 제약조건 누락";
  }

  // episode_elements의 FK가 정확한 대상을 가리키고 CASCADE인지 확인
  // FK1: episode_id -> episodes(id) ON DELETE CASCADE
  const fk1 = db.query<{ count: number; }, []>(
    `SELECT COUNT(*) as count FROM pragma_foreign_key_list('episode_elements')
     WHERE "from" = 'episode_id' AND "table" = 'episodes' AND "to" = 'id' AND on_delete = 'CASCADE'`
  ).get();
  if (!fk1 || fk1.count !== 1) {
    return "episode_elements.episode_id FK 누락 또는 잘못된 설정";
  }
  // FK2: element_id -> elements(id) ON DELETE CASCADE
  const fk2 = db.query<{ count: number; }, []>(
    `SELECT COUNT(*) as count FROM pragma_foreign_key_list('episode_elements')
     WHERE "from" = 'element_id' AND "table" = 'elements' AND "to" = 'id' AND on_delete = 'CASCADE'`
  ).get();
  if (!fk2 || fk2.count !== 1) {
    return "episode_elements.element_id FK 누락 또는 잘못된 설정";
  }

  return null; // 모두 통과
}

/**
 * 데이터베이스 연결 및 스키마 초기화
 */
export function initDatabase(): Database {
  const db = new Database(DB_PATH, { create: true });
  let didRebuild = false;

  // 외래 키 제약조건 활성화
  db.run("PRAGMA foreign_keys = ON;");

  // WAL 모드 활성화 (성능 향상)
  db.run("PRAGMA journal_mode = WAL;");

  // busy_timeout 설정 (동시 접근 시 대기, 3초)
  db.run("PRAGMA busy_timeout = 3000;");

  // 테이블 존재 여부 확인
  const tableCount = db.query<{ count: number; }, []>(
    "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
  ).get();
  const hasAnyTable = tableCount && tableCount.count > 0;

  // 테이블이 하나라도 있으면 반드시 우리 DB인지 검증 (레거시 DB 자동 복구 포함)
  if (hasAnyTable) {
    const appId = db.query<{ application_id: number; }, []>("PRAGMA application_id;").get();
    const currentVersion = db.query<{ user_version: number; }, []>("PRAGMA user_version;").get();
    const dbVersion = currentVersion?.user_version ?? 0;

    // application_id가 우리 값이 아니면 중단 (단, 0은 레거시로 간주하고 복구 시도)
    if (!appId || (appId.application_id !== APPLICATION_ID && appId.application_id !== 0)) {
      db.close();
      throw new Error(
        `❌ 호환되지 않는 DB 파일입니다.\n` +
        `   다음 파일을 삭제하고 재동기화하세요:\n` +
        `   "${DB_PATH}"`
      );
    }

    // 필수 테이블 전부 존재 여부 확인
    const requiredTablesSql = `('${REQUIRED_TABLES.join("','")}')`;
    const requiredTableCount = db.query<{ count: number; }, []>(
      `SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name IN ${requiredTablesSql}`
    ).get();
    const hasAllTables = requiredTableCount && requiredTableCount.count === REQUIRED_TABLES.length;

    if (!hasAllTables) {
      db.close();
      throw new Error(
        `❌ DB 스키마가 손상되었거나 불완전합니다.\n` +
        `   다음 파일을 삭제하고 재동기화하세요:\n` +
        `   "${DB_PATH}"`
      );
    }

    // 스키마 스모크 테스트 (제약조건 검증)
    const schemaError = validateSchemaIntegrity(db);

    if (dbVersion > SCHEMA_VERSION) {
      db.close();
      throw new Error(
        `❌ DB 버전이 코드보다 높습니다: DB=${dbVersion}, 코드=${SCHEMA_VERSION}\n` +
        `   코드를 업데이트하거나 다음 파일을 삭제하세요:\n` +
        `   "${DB_PATH}"`
      );
    }

    // 레거시/불일치 DB는 동기화 시 재구축 (삭제 대신 DROP+CREATE로 복구)
    // - schemaError가 있으면 구버전/손상으로 보고 재구축
    // - dbVersion이 더 낮으면 마이그레이션 대신 재구축
    const needsRebuild =
      Boolean(schemaError) ||
      (dbVersion > 0 && dbVersion < SCHEMA_VERSION);

    if (needsRebuild) {
      rebuildDatabaseSchema(db);
      didRebuild = true;
      // 아래의 버전/스키마 검증은 새로 생성된 스키마 기준으로 수행합니다.
      // (CREATE TABLE은 아래 트랜잭션에서 처리)
    } else if (schemaError) {
      db.close();
      throw new Error(
        `❌ 스키마 불일치: ${schemaError}\n` +
        `   다음 파일을 삭제하고 재동기화하세요:\n` +
        `   "${DB_PATH}"`
      );
    }

    // 레거시 DB 자동 복구:
    // - application_id=0 또는 user_version=0 인 경우, 스키마 검증 통과 시 현재 값으로 설정
    if (appId.application_id === 0) {
      db.run(`PRAGMA application_id = ${APPLICATION_ID};`);
    }
    if (dbVersion === 0) {
      db.run(`PRAGMA user_version = ${SCHEMA_VERSION};`);
    }
  }

  // 신규 DB 여부 (테이블이 0개일 때만 신규)
  const isNewDb = !hasAnyTable || didRebuild;

  // 스키마/시드/인덱스 생성을 트랜잭션으로 감싸기 (원자성 보장, 속도 향상)
  db.transaction(() => {
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
      ('phenomenon', '현상'),
      ('hook', '복선/떡밥'),
      ('loop', '미해결 과제');
    `);

    // 등장요소 테이블 (CHECK 제약조건, raw_content NOT NULL)
    db.run(`
      CREATE TABLE IF NOT EXISTS elements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE NOT NULL,
        display_name TEXT NOT NULL,
        type_id INTEGER NOT NULL,
        role TEXT,
        first_appear INTEGER CHECK (first_appear IS NULL OR first_appear > 0),
        tags TEXT,
        raw_content TEXT NOT NULL,
        FOREIGN KEY (type_id) REFERENCES element_types(id) ON DELETE RESTRICT
      );
    `);

    // 에피소드 테이블 (CHECK 제약조건)
    db.run(`
      CREATE TABLE IF NOT EXISTS episodes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        episode_num INTEGER UNIQUE NOT NULL CHECK (episode_num > 0),
        plot_summary TEXT NOT NULL
      );
    `);

    // 에피소드-요소 연결 테이블 (M:N, ON DELETE CASCADE 추가)
    db.run(`
      CREATE TABLE IF NOT EXISTS episode_elements (
        episode_id INTEGER NOT NULL,
        element_id INTEGER NOT NULL,
        PRIMARY KEY (episode_id, element_id),
        FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE,
        FOREIGN KEY (element_id) REFERENCES elements(id) ON DELETE CASCADE
      );
    `);

    // 인덱스 생성
    db.run("CREATE INDEX IF NOT EXISTS idx_elements_type ON elements(type_id);");
    db.run("CREATE INDEX IF NOT EXISTS idx_elements_first_appear ON elements(first_appear);");
    db.run("CREATE INDEX IF NOT EXISTS idx_elements_role ON elements(role);");
    db.run("CREATE INDEX IF NOT EXISTS idx_elements_type_first_appear ON elements(type_id, first_appear);");
    db.run("CREATE INDEX IF NOT EXISTS idx_episode_elements_episode ON episode_elements(episode_id);");
    db.run("CREATE INDEX IF NOT EXISTS idx_episode_elements_element ON episode_elements(element_id);");

    // 스키마 버전 및 application_id 기록 (신규 DB일 때만)
    if (isNewDb) {
      db.run(`PRAGMA application_id = ${APPLICATION_ID};`);
      db.run(`PRAGMA user_version = ${SCHEMA_VERSION};`);
    }
  })();

  // 신규 DB 생성 후에도 스모크 테스트 실행 (DDL 실수 조기 발견)
  if (isNewDb) {
    const schemaError = validateSchemaIntegrity(db);
    if (schemaError) {
      db.close();
      throw new Error(
        `❌ 신규 DB 스키마 검증 실패: ${schemaError}\n` +
        `   다음 파일을 삭제하고 코드의 DDL을 확인하세요:\n` +
        `   "${DB_PATH}"`
      );
    }
  }

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
 * 모든 행 삭제 (동기화 전 초기화)
 * 주의: AUTOINCREMENT 시퀀스는 유지됨 (완전 초기화 필요 시 sqlite_sequence 초기화 필요)
 */
export function deleteAllRows(db: Database): void {
  db.run("DELETE FROM episode_elements;");
  db.run("DELETE FROM elements;");
  db.run("DELETE FROM episodes;");
}

// 하위 호환성을 위한 별칭 (deprecated)
export const clearAllData = deleteAllRows;

export { DB_PATH };

