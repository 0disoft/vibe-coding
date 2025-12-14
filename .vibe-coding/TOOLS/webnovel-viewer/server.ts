/**
 * Webnovel Viewer 로컬 서버
 * Bun.serve 기반 REST API + 정적 파일 서빙
 */
import { Database } from "bun:sqlite";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DB_PATH } from "./db";

// Viewer 경로
const __dirname = dirname(fileURLToPath(import.meta.url));
const VIEWER_PATH = join(__dirname, "viewer.html");

// 포트 설정
const PORT = parseInt(process.env.PORT || "3334", 10);

/**
 * DB 연결 (읽기 전용)
 */
function getDb(): Database {
  const db = new Database(DB_PATH, { readonly: true });
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
      "Access-Control-Allow-Origin": "*",
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
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
      Allow: "GET, OPTIONS",
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
  bindings: Record<string, unknown>;
} {
  const conditions: string[] = [];
  const bindings: Record<string, unknown> = {};

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

  // 등장화 필터
  const firstAppear = params.get("first_appear");
  if (firstAppear) {
    conditions.push("e.first_appear = $firstAppear");
    bindings.$firstAppear = parseInt(firstAppear, 10);
  }

  // 태그 필터
  const tag = params.get("tag");
  if (tag) {
    conditions.push("e.tags LIKE $tag");
    bindings.$tag = `%${tag}%`;
  }

  // 키워드 검색 (200자 제한)
  const q = params.get("q")?.trim().slice(0, 200);
  if (q) {
    conditions.push("(e.display_name LIKE $q OR e.tags LIKE $q OR e.raw_content LIKE $q)");
    bindings.$q = `%${q}%`;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // 정렬
  const sort = params.get("sort") || "first_appear";
  const order = params.get("order") === "desc" ? "DESC" : "ASC";
  const validSorts = ["first_appear", "display_name", "type"];
  const sortColumn = validSorts.includes(sort)
    ? sort === "type"
      ? "t.display_name"
      : `e.${sort}`
    : "e.first_appear";

  // NULL 처리
  const orderClause =
    sort === "first_appear"
      ? `ORDER BY e.first_appear IS NULL, ${sortColumn} ${order}`
      : `ORDER BY ${sortColumn} ${order}`;

  const sql = `
    SELECT 
      e.id, e.slug, e.display_name, e.role, e.first_appear, e.tags,
      t.name as type, t.display_name as type_display
    FROM elements e
    LEFT JOIN element_types t ON e.type_id = t.id
    ${whereClause}
    ${orderClause}
  `;

  return { sql, bindings };
}

/**
 * 서버 시작
 */
void Bun.serve({
  port: PORT,

  async fetch(req: Request) {
    const url = new URL(req.url);
    const path = url.pathname;

    // CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "600",
        },
      });
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
        const { sql, bindings } = buildElementsQuery(url.searchParams);
        const elements = db.query(sql).all(bindings as unknown as import("bun:sqlite").SQLQueryBindings);
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
      const slug = path.split("/").pop();
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

        // 태그 수집 (쉼표 분리된 태그 파싱)
        const allTags = db.query<{ tags: string; }, []>(
          "SELECT DISTINCT tags FROM elements WHERE tags IS NOT NULL"
        ).all();
        const tagSet = new Set<string>();
        for (const row of allTags) {
          row.tags.split(",").forEach((t) => tagSet.add(t.trim()));
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

console.log(`
🚀 Webnovel Viewer 서버 실행 중!

   로컬:  http://localhost:${PORT}

   API 엔드포인트:
   - GET /api/elements       요소 목록 (필터/정렬 지원)
   - GET /api/elements/:slug 요소 상세
   - GET /api/episodes       에피소드 목록
   - GET /api/stats          통계
   - GET /api/options        필터 옵션

   종료: Ctrl+C
`);
