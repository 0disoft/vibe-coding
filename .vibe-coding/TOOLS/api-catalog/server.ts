/**
 * API Catalog 로컬 서버
 * Bun.serve 기반 REST API + 정적 파일 서빙
 */
import { Database } from "bun:sqlite";

// DB 경로
const DB_PATH = new URL("./api-catalog.sqlite", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const VIEWER_PATH = new URL("./viewer.html", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");

// 포트 설정
const PORT = parseInt(process.env.PORT || "3333", 10);

/**
 * DB 연결 (읽기 전용)
 */
function getDb(): Database {
  return new Database(DB_PATH, { readonly: true });
}

/**
 * API 목록 조회 쿼리 빌드
 */
function buildApisQuery(params: URLSearchParams): { sql: string; bindings: Record<string, unknown>; } {
  const conditions: string[] = [];
  const bindings: Record<string, unknown> = {};

  // 카테고리 필터
  const category = params.get("category");
  if (category) {
    conditions.push("c.name = $category");
    bindings.$category = category;
  }

  // 인증 필터
  const auth = params.get("auth");
  if (auth) {
    conditions.push("a.auth = $auth");
    bindings.$auth = auth;
  }

  // CORS 필터
  const cors = params.get("cors");
  if (cors) {
    conditions.push("a.cors = $cors");
    bindings.$cors = cors;
  }

  // 통합방식 필터
  const integration = params.get("integration");
  if (integration) {
    conditions.push("a.integration = $integration");
    bindings.$integration = integration;
  }

  // 키워드 검색
  const q = params.get("q");
  if (q) {
    conditions.push("(a.name LIKE $q OR a.description LIKE $q OR a.tags LIKE $q)");
    bindings.$q = `%${q}%`;
  }

  // WHERE 절 조합
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // 정렬
  const sort = params.get("sort") || "rating";
  const order = params.get("order") === "asc" ? "ASC" : "DESC";
  const validSorts = ["rating", "name", "auth", "category"];
  const sortColumn = validSorts.includes(sort) ? (sort === "category" ? "c.name" : `a.${sort}`) : "a.rating";

  // NULL 처리: rating이 NULL인 경우 맨 뒤로
  const orderClause = sort === "rating"
    ? `ORDER BY a.rating IS NULL, ${sortColumn} ${order}`
    : `ORDER BY ${sortColumn} ${order}`;

  const sql = `
    SELECT 
      a.id, a.name, a.url, a.description, a.auth, a.https, a.cors, 
      a.integration, a.rating, a.tags, c.name as category
    FROM apis a
    LEFT JOIN categories c ON a.category_id = c.id
    ${whereClause}
    ${orderClause}
  `;

  return { sql, bindings };
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
    },
  });
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
      return new Response("viewer.html not found", { status: 404 });
    }

    // API: 목록 조회
    if (path === "/api/apis") {
      const db = getDb();
      try {
        const { sql, bindings } = buildApisQuery(url.searchParams);
        const apis = db.query(sql).all(bindings as unknown as import("bun:sqlite").SQLQueryBindings);
        return jsonResponse(apis);
      } finally {
        db.close();
      }
    }

    // API: 카테고리 목록
    if (path === "/api/categories") {
      const db = getDb();
      try {
        const categories = db.query<{ name: string; }, []>("SELECT name FROM categories ORDER BY name").all();
        return jsonResponse(categories.map((c) => c.name));
      } finally {
        db.close();
      }
    }

    // API: 통계
    if (path === "/api/stats") {
      const db = getDb();
      try {
        const total = db.query("SELECT COUNT(*) as count FROM apis").get() as { count: number; };
        const byCategory = db.query(`
          SELECT c.name as category, COUNT(*) as count 
          FROM apis a 
          LEFT JOIN categories c ON a.category_id = c.id 
          GROUP BY c.name
          ORDER BY count DESC
        `).all();
        const byAuth = db.query(`
          SELECT auth, COUNT(*) as count FROM apis GROUP BY auth ORDER BY count DESC
        `).all();
        return jsonResponse({ total: total.count, byCategory, byAuth });
      } finally {
        db.close();
      }
    }

    // API: 필터 옵션 (드롭다운용)
    if (path === "/api/options") {
      const db = getDb();
      try {
        const auth = db.query<{ auth: string; }, []>("SELECT DISTINCT auth FROM apis WHERE auth IS NOT NULL ORDER BY auth").all();
        const cors = db.query<{ cors: string; }, []>("SELECT DISTINCT cors FROM apis WHERE cors IS NOT NULL ORDER BY cors").all();
        const integration = db.query<{ integration: string; }, []>("SELECT DISTINCT integration FROM apis WHERE integration IS NOT NULL ORDER BY integration").all();
        return jsonResponse({
          auth: auth.map((a) => a.auth),
          cors: cors.map((c) => c.cors),
          integration: integration.map((i) => i.integration),
        });
      } finally {
        db.close();
      }
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`
🚀 API Catalog Server 실행 중!

   로컬:  http://localhost:${PORT}

   API 엔드포인트:
   - GET /api/apis        API 목록 (필터/정렬 지원)
   - GET /api/categories  카테고리 목록
   - GET /api/stats       통계
   - GET /api/options     필터 옵션

   종료: Ctrl+C
`);
