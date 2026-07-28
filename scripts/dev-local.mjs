import { createServer as createHttpServer } from "node:http";
import { createServer as createViteServer } from "vite";

const products = [
  { id: 1, name: "Сервер Dell PowerEdge R760", category: "Серверы", seller: "IT Distribution", rating: "4.9", stock: 18, price: 782400, old: 815000, code: "DELL-R760-4410Y", kind: "server", status: "В наличии" },
  { id: 2, name: "Коммутатор Cisco C9300-48P", category: "Сетевое оборудование", seller: "NetSystems", rating: "4.8", stock: 42, price: 526900, code: "C9300-48P-A", kind: "switch", status: "В наличии" },
  { id: 3, name: "ThinkPad X1 Carbon Gen 12", category: "Ноутбуки", seller: "ProDevice", rating: "4.7", stock: 63, price: 214500, old: 229900, code: "21KC00AERT", kind: "laptop", status: "В наличии" },
  { id: 4, name: "СХД Synology RS3621xs+", category: "Хранение данных", seller: "DataCore", rating: "4.9", stock: 7, price: 648000, code: "RS3621XS-RU", kind: "storage", status: "Осталось мало" },
  { id: 5, name: "Монитор Dell UltraSharp U2724D", category: "Периферия", seller: "Office Tech", rating: "4.6", stock: 124, price: 68400, code: "DELL-U2724D", kind: "monitor", status: "В наличии" },
  { id: 6, name: "ИБП APC Smart-UPS SRT 3000VA", category: "Электропитание", seller: "Powerline", rating: "4.8", stock: 21, price: 297600, code: "SRT3000XLI", kind: "ups", status: "В наличии" },
  { id: 7, name: "HPE ProLiant DL380 Gen11", category: "Серверы", seller: "ServerLab", rating: "4.9", stock: 11, price: 914000, code: "HPE-DL380-G11", kind: "server", status: "Под заказ" },
  { id: 8, name: "МФУ Kyocera ECOSYS M3645idn", category: "Периферия", seller: "Office Tech", rating: "4.7", stock: 35, price: 167900, code: "1102V73NL0", kind: "printer", status: "В наличии" },
];

const cart = new Map();
const purchases = new Map();
const orders = new Map();
const complaints = [];
const audit = [];

function send(response, status, payload) {
  response.writeHead(status, {
    "content-type": status >= 400
      ? "application/problem+json; charset=utf-8"
      : "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

function problem(response, status, code, message, extra = {}) {
  send(response, status, {
    type: `https://techm.local/problems/${code.toLowerCase()}`,
    title: code,
    status,
    detail: message,
    code,
    error: { code, message, ...extra },
  });
}

async function body(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return null;
  }
}

function role(request) {
  return String(request.headers["x-techm-role"] || "buyer").toLowerCase();
}

function requireRole(request, response, allowed) {
  if (allowed.includes(role(request))) return true;
  problem(response, 403, "ROLE_FORBIDDEN", "Недостаточно прав для операции");
  return false;
}

function cartPayload() {
  return {
    id: "cart:local:cmp-vector",
    items: [...cart.entries()].map(([listingId, quantity]) => {
      const product = products.find(({ id }) => id === listingId);
      return {
        listing_id: listingId,
        quantity,
        price_snapshot_minor: product.price * 100,
        name: product.name,
        code: product.code,
        seller_name: product.seller,
      };
    }),
  };
}

async function handleApi(request, response) {
  const url = new URL(request.url, "http://localhost");
  const path = url.pathname;
  const method = request.method || "GET";

  if (path === "/api/health" && method === "GET") {
    return send(response, 200, {
      status: "ok",
      service: "techm-local-api",
      database: "in-memory",
      time: new Date().toISOString(),
    });
  }

  if (path === "/api/session" && method === "GET") {
    const currentRole = role(request);
    return send(response, 200, {
      user: { email: `${currentRole}@techm.local` },
      role: currentRole,
      companyId: currentRole === "seller" ? "seller-itd" : "cmp-vector",
    });
  }

  if (path === "/api/catalog" && method === "GET") {
    const query = String(url.searchParams.get("query") || "").toLowerCase();
    const category = url.searchParams.get("category");
    const items = products.filter((product) =>
      (!query || `${product.name} ${product.code} ${product.seller}`.toLowerCase().includes(query))
      && (!category || product.category === category)
    );
    return send(response, 200, { items });
  }

  if (path === "/api/cart" && method === "GET") {
    if (!requireRole(request, response, ["buyer"])) return;
    return send(response, 200, cartPayload());
  }

  const cartMatch = path.match(/^\/api\/cart\/(\d+)$/);
  if (cartMatch && method === "PUT") {
    if (!requireRole(request, response, ["buyer"])) return;
    const payload = await body(request);
    const listingId = Number(cartMatch[1]);
    const quantity = Number(payload?.quantity);
    const product = products.find(({ id }) => id === listingId);
    if (!product) return problem(response, 404, "LISTING_NOT_FOUND", "Предложение не найдено");
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > 999) {
      return problem(response, 400, "INVALID_QUANTITY", "Количество должно быть целым числом от 0 до 999");
    }
    if (quantity > product.stock) {
      return problem(response, 409, "INSUFFICIENT_STOCK", "Недостаточно доступного остатка", { available: product.stock });
    }
    if (quantity === 0) cart.delete(listingId);
    else cart.set(listingId, quantity);
    audit.unshift({ action: "cart.item.updated", entity: String(listingId), role: role(request), at: new Date().toISOString() });
    return send(response, 200, cartPayload());
  }

  if (path === "/api/checkout" && method === "POST") {
    if (!requireRole(request, response, ["buyer"])) return;
    const idempotencyKey = request.headers["idempotency-key"];
    if (!idempotencyKey) {
      return problem(response, 400, "IDEMPOTENCY_KEY_REQUIRED", "Для checkout требуется Idempotency-Key");
    }
    if (purchases.has(idempotencyKey)) {
      return send(response, 200, { ...purchases.get(idempotencyKey), replayed: true });
    }
    if (!cart.size) return problem(response, 409, "CART_EMPTY", "Корзина пуста");

    const lines = [...cart.entries()].map(([id, quantity]) => ({
      product: products.find((product) => product.id === id),
      quantity,
    }));
    const insufficient = lines.find(({ product, quantity }) => quantity > product.stock);
    if (insufficient) {
      return problem(response, 409, "INSUFFICIENT_STOCK", "Остаток изменился во время оформления");
    }
    const purchaseId = `TM-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const total = lines.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0);
    const sellers = new Map();
    for (const line of lines) {
      if (!sellers.has(line.product.seller)) sellers.set(line.product.seller, []);
      sellers.get(line.product.seller).push(line);
      line.product.stock -= line.quantity;
    }
    for (const [seller, sellerLines] of sellers) {
      const id = `ORD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
      orders.set(id, { id, purchaseId, seller, status: "new", lines: sellerLines });
    }
    const result = { purchaseId, status: "created", total, orderCount: sellers.size };
    purchases.set(idempotencyKey, result);
    cart.clear();
    audit.unshift({ action: "purchase.created", entity: purchaseId, role: "buyer", at: new Date().toISOString() });
    return send(response, 201, result);
  }

  const orderMatch = path.match(/^\/api\/orders\/([^/]+)$/);
  if (orderMatch && method === "PATCH") {
    if (!requireRole(request, response, ["seller", "admin"])) return;
    const order = orders.get(decodeURIComponent(orderMatch[1]));
    if (!order) return problem(response, 404, "ORDER_NOT_FOUND", "Заказ не найден");
    const payload = await body(request);
    const transitions = {
      new: ["confirmed", "cancelled"],
      confirmed: ["assembling", "cancelled"],
      assembling: ["ready_to_ship"],
      ready_to_ship: ["shipped"],
      shipped: ["completed"],
    };
    if (!transitions[order.status]?.includes(payload?.status)) {
      return problem(response, 409, "INVALID_ORDER_TRANSITION", "Недопустимый переход статуса");
    }
    order.status = payload.status;
    return send(response, 200, { id: order.id, status: order.status });
  }

  if (path === "/api/complaints" && method === "POST") {
    if (!requireRole(request, response, ["buyer"])) return;
    const payload = await body(request);
    if (!payload?.purchaseId || !payload?.type || !payload?.description) {
      return problem(response, 400, "VALIDATION_ERROR", "Укажите закупку, тип и описание");
    }
    const item = { id: `CMP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, ...payload, status: "opened" };
    complaints.push(item);
    return send(response, 201, item);
  }

  if (path === "/api/admin/audit" && method === "GET") {
    if (!requireRole(request, response, ["admin"])) return;
    return send(response, 200, { items: audit });
  }

  return problem(response, 404, "API_ROUTE_NOT_FOUND", "API endpoint не найден");
}

const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: "spa",
});

const server = createHttpServer((request, response) => {
  if (request.url?.startsWith("/api/")) {
    handleApi(request, response).catch((error) => {
      console.error(error);
      if (!response.headersSent) {
        problem(response, 500, "LOCAL_API_ERROR", "Ошибка локального API");
      }
    });
    return;
  }
  vite.middlewares(request, response, () => {
    response.statusCode = 404;
    response.end("Not found");
  });
});

const port = Number(process.env.PORT || 5173);
server.listen(port, "0.0.0.0", () => {
  console.log(`\n  TechM local: http://localhost:${port}`);
  console.log("  API mode: in-memory demo\n");
});

async function shutdown() {
  await vite.close();
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
