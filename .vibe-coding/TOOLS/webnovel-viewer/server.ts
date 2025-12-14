/**
 * Webnovel Viewer 로컬 서버
 * Bun.serve 기반 REST API + 정적 파일 서빙
 */
import { Database } from "bun:sqlite";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DB_PATH } from "./db";

function getArgValue(names: string[]): string | null {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const a = args[i];

    for (const name of names) {
      if (a === name) {
        const v = args[i + 1];
        if (!v || v.startsWith("-")) return null;
        return v;
      }
      if (a.startsWith(`${name}=`)) {
        return a.slice(name.length + 1);
      }
    }
  }
  return null;
}

function parsePort(raw: string | null, fallback: number): number {
  if (!raw) return fallback;
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1 || n > 65535) return fallback;
  return n;
}

// Viewer 경로
const __dirname = dirname(fileURLToPath(import.meta.url));
const VIEWER_PATH = join(__dirname, "viewer.html");

// 포트 설정 (유효성 검증 포함)
const PORT = parsePort(
  getArgValue(["--port", "-p"]) ?? process.env.WEBNOVEL_VIEWER_PORT ?? process.env.PORT ?? null,
  3334
);
// 호스트 설정 (기본 localhost). 외부 바인딩(0.0.0.0)은 명시 설정 시에만 사용하세요.
const HOSTNAME = (getArgValue(["--host"]) ?? process.env.WEBNOVEL_VIEWER_HOST ?? "127.0.0.1").trim() ||
  "127.0.0.1";

/**
 * DB 연결 (읽기 전용)
 */
function getDb(): Database {
  const db = new Database(DB_PATH, { readonly: true });
  db.run("PRAGMA foreign_keys = ON;");
  db.run("PRAGMA busy_timeout = 3000;");
  return db;
}

/**
 * JSON 응답 생성
 */
function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

/**
 * 에러 응답 생성
 */
function errorResponse(message: string, status = 500): Response {
  console.error(`[API Error] ${message}`);
  return jsonResponse({ error: message }, status);
}

/**
 * 405 Method Not Allowed
 */
function methodNotAllowed(): Response {
  return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
    status: 405,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      Allow: "GET",
    },
  });
}

/**
 * 404 Not Found
 */
function notFound(): Response {
  return jsonResponse({ error: "Not Found" }, 404);
}

/**
 * 요소 목록 쿼리 빌드
 */
function buildElementsQuery(params: URLSearchParams): {
  sql: string;
  bindings: Record<string, string | number>;
  error?: string;
} {
  const conditions: string[] = [];
  const bindings: Record<string, string | number> = {};

  // 유형 필터
  const type = params.get("type");
  if (type) {
    conditions.push("t.name = $type");
    bindings.$type = type;
  }

  // 역할 필터
  const role = params.get("role");
  if (role) {
    conditions.push("e.role = $role");
    bindings.$role = role;
  }

  // 등장화 필터 (숫자 검증)
  const firstAppearRaw = params.get("first_appear");
  if (firstAppearRaw) {
    const firstAppearNum = parseInt(firstAppearRaw, 10);
    if (Number.isNaN(firstAppearNum) || firstAppearNum <= 0) {
      return { sql: "", bindings: {}, error: "first_appear는 양의 정수여야 합니다" };
    }
    conditions.push("e.first_appear = $firstAppear");
    bindings.$firstAppear = firstAppearNum;
  }

  // 태그 필터 (정확한 매칭: 공백 제거 후 ,tag, 패턴)
  const tag = params.get("tag")?.trim();
  if (tag) {
    conditions.push("(',' || REPLACE(e.tags, ' ', '') || ',') LIKE $tag");
    bindings.$tag = `%,${tag},%`;
  }

  // 키워드 검색 (200자 제한)
  const q = params.get("q")?.trim().slice(0, 200);
  if (q) {
    conditions.push("(e.display_name LIKE $q OR e.tags LIKE $q OR e.raw_content LIKE $q)");
    bindings.$q = `%${q}%`;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // 정렬 (정규화된 sortKey로 분기)
  const sortRaw = params.get("sort") || "first_appear";
  const order = params.get("order") === "desc" ? "DESC" : "ASC";
  const validSorts = ["first_appear", "display_name", "type"] as const;
  type SortKey = (typeof validSorts)[number];
  const sortKey: SortKey = validSorts.includes(sortRaw as SortKey)
    ? (sortRaw as SortKey)
    : "first_appear";
  const sortColumn = sortKey === "type" ? "t.display_name" : `e.${sortKey}`;

  // NULL 처리 (정규화된 sortKey 기준)
  const orderClause =
    sortKey === "first_appear"
      ? `ORDER BY e.first_appear IS NULL, ${sortColumn} ${order}`
      : `ORDER BY ${sortColumn} ${order}`;

  // 페이지네이션 (limit: 1~2000, offset: 0~)
  const limitRaw = params.get("limit");
  const offsetRaw = params.get("offset");
  let limit = 1000; // 기본값 (웹소설 도구는 데이터가 작으므로 충분)
  let offset = 0;
  if (limitRaw) {
    const parsed = parseInt(limitRaw, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      limit = Math.min(parsed, 2000); // 상한 2000
    }
  }
  if (offsetRaw) {
    const parsed = parseInt(offsetRaw, 10);
    if (!Number.isNaN(parsed) && parsed >= 0) {
      offset = parsed;
    }
  }

  const sql = `
    SELECT 
      e.id, e.slug, e.display_name, e.role, e.first_appear, e.tags,
      t.name as type, t.display_name as type_display
    FROM elements e
    LEFT JOIN element_types t ON e.type_id = t.id
    ${whereClause}
    ${orderClause}
    LIMIT $limit OFFSET $offset
  `;
  bindings.$limit = limit;
  bindings.$offset = offset;

  return { sql, bindings };
}

/**
 * 서버 시작
 */
void Bun.serve({
  port: PORT,
  hostname: HOSTNAME,

  async fetch(req: Request) {
    const url = new URL(req.url);
    const path = url.pathname;

    // OPTIONS 요청은 405 반환 (CORS 불필요 - same-origin)
    if (req.method === "OPTIONS") {
      return methodNotAllowed();
    }

    // 정적 파일: viewer.html
    if (path === "/" || path === "/index.html") {
      const file = Bun.file(VIEWER_PATH);
      if (await file.exists()) {
        return new Response(file, {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }
      return notFound();
    }

    // API: 요소 목록
    if (path === "/api/elements") {
      if (req.method !== "GET") return methodNotAllowed();
      const db = getDb();
      try {
        const result = buildElementsQuery(url.searchParams);
        // 입력 검증 에러 처리
        if (result.error) {
          return jsonResponse({ error: result.error }, 400);
        }
        const elements = db.query(result.sql).all(result.bindings);
        return jsonResponse(elements);
      } catch (e) {
        return errorResponse((e as Error).message);
      } finally {
        db.close();
      }
    }

    // API: 요소 상세
    if (path.startsWith("/api/elements/")) {
      if (req.method !== "GET") return methodNotAllowed();
      const slugRaw = path.split("/").pop();
      if (!slugRaw) return notFound();

      // slug 디코딩 및 검증 (길이 200자 제한)
      let slug: string;
      try {
        slug = decodeURIComponent(slugRaw).trim().slice(0, 200);
      } catch {
        return jsonResponse({ error: "잘못된 slug 형식입니다" }, 400);
      }
      if (!slug) return notFound();

      const db = getDb();
      try {
        const element = db
          .query<
            {
              id: number;
              slug: string;
              display_name: string;
              role: string | null;
              first_appear: number | null;
              tags: string | null;
              raw_content: string;
              type: string;
              type_display: string;
            },
            [string]
          >(
            `
            SELECT 
              e.id, e.slug, e.display_name, e.role, e.first_appear, e.tags, e.raw_content,
              t.name as type, t.display_name as type_display
            FROM elements e
            LEFT JOIN element_types t ON e.type_id = t.id
            WHERE e.slug = ?
          `
          )
          .get(slug);

        if (!element) return notFound();
        return jsonResponse(element);
      } catch (e) {
        return errorResponse((e as Error).message);
      } finally {
        db.close();
      }
    }

    // API: 에피소드 목록
    if (path === "/api/episodes") {
      if (req.method !== "GET") return methodNotAllowed();
      const db = getDb();
      try {
        const episodes = db
          .query("SELECT id, episode_num, plot_summary FROM episodes ORDER BY episode_num")
          .all();
        return jsonResponse(episodes);
      } catch (e) {
        return errorResponse((e as Error).message);
      } finally {
        db.close();
      }
    }

    // API: 통계
    if (path === "/api/stats") {
      if (req.method !== "GET") return methodNotAllowed();
      const db = getDb();
      try {
        const totalElements = db.query("SELECT COUNT(*) as count FROM elements").get() as { count: number; };
        const totalEpisodes = db.query("SELECT COUNT(*) as count FROM episodes").get() as { count: number; };
        const byType = db
          .query(
            `
            SELECT t.display_name as type, COUNT(*) as count
            FROM elements e
            LEFT JOIN element_types t ON e.type_id = t.id
            GROUP BY t.display_name
            ORDER BY count DESC
          `
          )
          .all();
        return jsonResponse({
          totalElements: totalElements.count,
          totalEpisodes: totalEpisodes.count,
          byType,
        });
      } catch (e) {
        return errorResponse((e as Error).message);
      } finally {
        db.close();
      }
    }

    // API: 필터 옵션
    if (path === "/api/options") {
      if (req.method !== "GET") return methodNotAllowed();
      const db = getDb();
      try {
        const types = db.query<{ name: string; display_name: string; }, []>(
          "SELECT name, display_name FROM element_types ORDER BY id"
        ).all();
        const roles = db.query<{ role: string; }, []>(
          "SELECT DISTINCT role FROM elements WHERE role IS NOT NULL ORDER BY role"
        ).all();
        const firstAppears = db.query<{ first_appear: number; }, []>(
          "SELECT DISTINCT first_appear FROM elements WHERE first_appear IS NOT NULL ORDER BY first_appear"
        ).all();

        // 태그 수집 (쉼표 분리된 태그 파싱, 빈 문자열 제외)
        const allTags = db.query<{ tags: string; }, []>(
          "SELECT DISTINCT tags FROM elements WHERE tags IS NOT NULL"
        ).all();
        const tagSet = new Set<string>();
        for (const row of allTags) {
          for (const t of row.tags.split(",")) {
            const cleaned = t.trim();
            if (cleaned) tagSet.add(cleaned);
          }
        }

        return jsonResponse({
          types,
          roles: roles.map((r) => r.role),
          firstAppears: firstAppears.map((f) => f.first_appear),
          tags: Array.from(tagSet).sort(),
        });
      } catch (e) {
        return errorResponse((e as Error).message);
      } finally {
        db.close();
      }
    }

    return notFound();
  },
});

// 접속 URL 안내 (바인딩 주소 반영)
const displayHost = HOSTNAME === "0.0.0.0" ? "localhost" : HOSTNAME;
const bindingNote = HOSTNAME === "0.0.0.0"
  ? `   (바인딩: ${HOSTNAME} - 접속은 localhost 또는 로컬 IP 사용)\n`
  : "";

console.log(`
🚀 Webnovel Viewer 서버 실행 중!

   로컬:  http://${displayHost}:${PORT}
   힌트:  bun .vibe-coding/TOOLS/webnovel-viewer/server.ts --port ${PORT} --host ${HOSTNAME}
${bindingNote}
   API 엔드포인트:
   - GET /api/elements       요소 목록 (필터/정렬 지원)
   - GET /api/elements/:slug 요소 상세
   - GET /api/episodes       에피소드 목록
   - GET /api/stats          통계
   - GET /api/options        필터 옵션

   종료: Ctrl+C
`);
