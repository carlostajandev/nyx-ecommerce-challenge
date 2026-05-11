/**
 * Mock backend — adapta FakeStoreAPI al contrato nuevo (Page<T>, AI stubs)
 * Corre en :8080, el mismo puerto que espera el frontend.
 *
 * Uso: node mock-server.js
 */

const http = require("http");
const https = require("https");

const PORT = 8080;
const FAKE_STORE = "https://fakestoreapi.com";

// ─── helpers ────────────────────────────────────────────────────────────────

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}

function toPage(items, page, size) {
  const totalPages = Math.ceil(items.length / size);
  const start = page * size;
  return {
    content: items.slice(start, start + size),
    totalElements: items.length,
    totalPages,
    number: page,
    size,
    first: page === 0,
    last: page >= totalPages - 1,
  };
}

function parseBody(req) {
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      try {
        resolve(JSON.parse(raw || "{}"));
      } catch {
        resolve({});
      }
    });
  });
}

function sendJson(res, data, status = 200) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

// ─── server ─────────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const { pathname: path, searchParams: qs } = url;
  const method = req.method;

  // CORS preflight
  if (method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.writeHead(204);
    res.end();
    return;
  }

  console.log(`${method} ${path}`);

  try {
    // GET /products/categories
    if (method === "GET" && path === "/products/categories") {
      const cats = await fetchJson(`${FAKE_STORE}/products/categories`);
      return sendJson(res, cats);
    }

    // GET /products/{id}/recommendations
    const recMatch = path.match(/^\/products\/(\d+)\/recommendations$/);
    if (method === "GET" && recMatch) {
      const id = parseInt(recMatch[1]);
      const all = await fetchJson(`${FAKE_STORE}/products`);
      const current = all.find((p) => p.id === id);
      const related = current
        ? all
            .filter((p) => p.category === current.category && p.id !== id)
            .sort((a, b) => b.rating.rate - a.rating.rate)
            .slice(0, 3)
        : [];
      return sendJson(res, related);
    }

    // GET /products/{id}
    const productMatch = path.match(/^\/products\/(\d+)$/);
    if (method === "GET" && productMatch) {
      const id = productMatch[1];
      const product = await fetchJson(`${FAKE_STORE}/products/${id}`);
      if (!product?.id) {
        return sendJson(
          res,
          { status: 404, message: `Product with id ${id} not found`, path },
          404,
        );
      }
      return sendJson(res, product);
    }

    // GET /products
    if (method === "GET" && path === "/products") {
      const page = parseInt(qs.get("page") ?? "0");
      const size = parseInt(qs.get("size") ?? "20");
      const category = qs.get("category");
      const search = qs.get("search")?.toLowerCase();

      let products = await fetchJson(`${FAKE_STORE}/products`);
      if (category) products = products.filter((p) => p.category === category);
      if (search)
        products = products.filter(
          (p) =>
            p.title.toLowerCase().includes(search) ||
            p.category.toLowerCase().includes(search),
        );

      return sendJson(res, toPage(products, page, size));
    }

    // POST /api/v1/ai/search  (stub — simula búsqueda semántica)
    if (method === "POST" && path === "/api/v1/ai/search") {
      const body = await parseBody(req);
      const all = await fetchJson(`${FAKE_STORE}/products`);
      const topK = Math.min(body.topK ?? 5, all.length);

      // Stub: devuelve productos ordenados por rating para simular relevancia
      const results = [...all]
        .sort((a, b) => b.rating.rate - a.rating.rate)
        .slice(0, topK);

      const scores = Object.fromEntries(
        results.map((p, i) => [String(p.id), parseFloat((0.97 - i * 0.04).toFixed(2))]),
      );

      return sendJson(res, {
        query: body.query,
        results,
        scores,
        strategy: "semantic",
        processingMs: 210,
      });
    }

    // POST /api/v1/ai/chat  (stub — simula asistente)
    if (method === "POST" && path === "/api/v1/ai/chat") {
      const body = await parseBody(req);
      const all = await fetchJson(`${FAKE_STORE}/products`);

      // Stub: sugiere los 2 productos con mejor rating
      const suggested = [...all]
        .sort((a, b) => b.rating.rate - a.rating.rate)
        .slice(0, 2);

      return sendJson(res, {
        reply: `[MOCK] Based on "${body.message}", here are some products you might like:`,
        suggestedProducts: suggested,
        processingMs: 920,
      });
    }

    // POST /products  (stub admin)
    if (method === "POST" && path === "/products") {
      const body = await parseBody(req);
      return sendJson(res, { id: Math.floor(Math.random() * 900) + 100, ...body }, 201);
    }

    // 404 fallback
    sendJson(res, { status: 404, message: "Not found", path }, 404);
  } catch (err) {
    console.error("Error:", err.message);
    sendJson(res, { status: 500, message: err.message }, 500);
  }
});

server.listen(PORT, () => {
  console.log("");
  console.log(`  Mock backend:  http://localhost:${PORT}`);
  console.log(`  Data source:   FakeStoreAPI (proxied)`);
  console.log(`  AI endpoints:  stub responses`);
  console.log("");
  console.log("  Endpoints available:");
  console.log("  GET  /products");
  console.log("  GET  /products/:id");
  console.log("  GET  /products/categories");
  console.log("  GET  /products/:id/recommendations");
  console.log("  POST /api/v1/ai/search");
  console.log("  POST /api/v1/ai/chat");
  console.log("");
});
