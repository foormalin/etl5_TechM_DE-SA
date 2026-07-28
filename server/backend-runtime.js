const json = (data, status = 200, extraHeaders = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...extraHeaders,
    },
  });

const apiError = (status, code, message, details) =>
  json({ error: { code, message, ...(details ? { details } : {}) } }, status);

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('buyer','seller','platform')),
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    kind TEXT NOT NULL,
    moderation_status TEXT NOT NULL DEFAULT 'published',
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS listings (
    id INTEGER PRIMARY KEY,
    product_id INTEGER NOT NULL,
    seller_id TEXT NOT NULL,
    seller_name TEXT NOT NULL,
    price_minor INTEGER NOT NULL CHECK(price_minor >= 0),
    old_price_minor INTEGER,
    stock INTEGER NOT NULL CHECK(stock >= 0),
    reserved INTEGER NOT NULL DEFAULT 0 CHECK(reserved >= 0),
    rating REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active',
    version INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY(product_id) REFERENCES products(id)
  )`,
  `CREATE TABLE IF NOT EXISTS carts (
    id TEXT PRIMARY KEY,
    buyer_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS cart_items (
    cart_id TEXT NOT NULL,
    listing_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    price_snapshot_minor INTEGER NOT NULL,
    PRIMARY KEY(cart_id, listing_id)
  )`,
  `CREATE TABLE IF NOT EXISTS purchases (
    id TEXT PRIMARY KEY,
    buyer_id TEXT NOT NULL,
    company_id TEXT NOT NULL,
    status TEXT NOT NULL,
    total_minor INTEGER NOT NULL,
    idempotency_key TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    purchase_id TEXT NOT NULL,
    seller_id TEXT NOT NULL,
    seller_name TEXT NOT NULL,
    status TEXT NOT NULL,
    total_minor INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(purchase_id) REFERENCES purchases(id)
  )`,
  `CREATE TABLE IF NOT EXISTS order_items (
    order_id TEXT NOT NULL,
    listing_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    code TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price_minor INTEGER NOT NULL,
    PRIMARY KEY(order_id, listing_id)
  )`,
  `CREATE TABLE IF NOT EXISTS complaints (
    id TEXT PRIMARY KEY,
    purchase_id TEXT NOT NULL,
    buyer_id TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'opened',
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor TEXT NOT NULL,
    role TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    payload TEXT,
    created_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS products_category_idx ON products(category)`,
  `CREATE INDEX IF NOT EXISTS listings_product_idx ON listings(product_id)`,
  `CREATE INDEX IF NOT EXISTS orders_purchase_idx ON orders(purchase_id)`,
  `CREATE INDEX IF NOT EXISTS complaints_purchase_idx ON complaints(purchase_id)`,
];

const seedProducts = [
  [1, "Сервер Dell PowerEdge R760", "Серверы", "DELL-R760-4410Y", "server", "IT Distribution", 78240000, 81500000, 18, 4.9],
  [2, "Коммутатор Cisco C9300-48P", "Сетевое оборудование", "C9300-48P-A", "switch", "NetSystems", 52690000, null, 42, 4.8],
  [3, "ThinkPad X1 Carbon Gen 12", "Ноутбуки", "21KC00AERT", "laptop", "ProDevice", 21450000, 22990000, 63, 4.7],
  [4, "СХД Synology RS3621xs+", "Хранение данных", "RS3621XS-RU", "storage", "DataCore", 64800000, null, 7, 4.9],
  [5, "Монитор Dell UltraSharp U2724D", "Периферия", "DELL-U2724D", "monitor", "Office Tech", 6840000, null, 124, 4.6],
  [6, "ИБП APC Smart-UPS SRT 3000VA", "Электропитание", "SRT3000XLI", "ups", "Powerline", 29760000, null, 21, 4.8],
  [7, "HPE ProLiant DL380 Gen11", "Серверы", "HPE-DL380-G11", "server", "ServerLab", 91400000, null, 11, 4.9],
  [8, "МФУ Kyocera ECOSYS M3645idn", "Периферия", "1102V73NL0", "printer", "Office Tech", 16790000, null, 35, 4.7],
];

let schemaReady = false;

async function ensureDatabase(db) {
  if (!db || schemaReady) return;
  await db.batch(schemaStatements.map((statement) => db.prepare(statement)));
  const row = await db.prepare("SELECT COUNT(*) AS count FROM products").first();
  if (Number(row?.count || 0) === 0) {
    const now = new Date().toISOString();
    const companyQueries = [
      ["cmp-vector", "ООО «Вектор»", "buyer"],
      ["seller-itd", "IT Distribution", "seller"],
      ["platform-techm", "TechM", "platform"],
    ].map((company) =>
      db.prepare("INSERT OR IGNORE INTO companies (id,name,type,status,created_at) VALUES (?,?,?,'active',?)")
        .bind(...company, now)
    );
    const productQueries = seedProducts.flatMap((item) => {
      const [id, name, category, code, kind, sellerName, price, oldPrice, stock, rating] = item;
      return [
        db.prepare("INSERT OR IGNORE INTO products (id,name,category,code,kind,moderation_status,created_at) VALUES (?,?,?,?,?,'published',?)")
          .bind(id, name, category, code, kind, now),
        db.prepare("INSERT OR IGNORE INTO listings (id,product_id,seller_id,seller_name,price_minor,old_price_minor,stock,reserved,rating,status,version) VALUES (?,?,?,?,?,?,?,0,?,'active',1)")
          .bind(id, id, id === 1 ? "seller-itd" : `seller-${id}`, sellerName, price, oldPrice, stock, rating),
      ];
    });
    await db.batch([...companyQueries, ...productQueries]);
  }
  schemaReady = true;
}

function requestContext(request) {
  const role = request.headers.get("x-techm-role") || "buyer";
  const email = request.headers.get("oai-authenticated-user-email") || "demo@techm.local";
  const company = role === "seller" ? "seller-itd" : role === "admin" ? "platform-techm" : "cmp-vector";
  return { role, email, company };
}

function requireRole(context, allowed) {
  return allowed.includes(context.role)
    ? null
    : apiError(403, "ROLE_FORBIDDEN", "Недостаточно прав для операции");
}

async function parseBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

async function audit(db, context, action, entityType, entityId, payload) {
  await db.prepare(
    "INSERT INTO audit_log (actor,role,action,entity_type,entity_id,payload,created_at) VALUES (?,?,?,?,?,?,?)"
  ).bind(
    context.email,
    context.role,
    action,
    entityType,
    String(entityId),
    payload ? JSON.stringify(payload) : null,
    new Date().toISOString()
  ).run();
}

async function catalog(db, url) {
  const query = (url.searchParams.get("q") || "").trim().toLowerCase();
  const category = url.searchParams.get("category");
  let sql = `SELECT p.id,p.name,p.category,p.code,p.kind,l.seller_name,l.rating,
    l.stock-l.reserved AS available,l.price_minor,l.old_price_minor,l.status,l.version
    FROM products p JOIN listings l ON l.product_id=p.id
    WHERE p.moderation_status='published' AND l.status='active'`;
  const bindings = [];
  if (query) {
    sql += " AND (lower(p.name) LIKE ? OR lower(p.code) LIKE ? OR lower(p.category) LIKE ? OR lower(l.seller_name) LIKE ?)";
    const like = `%${query}%`;
    bindings.push(like, like, like, like);
  }
  if (category) {
    sql += " AND p.category=?";
    bindings.push(category);
  }
  sql += " ORDER BY p.id LIMIT 100";
  const result = await db.prepare(sql).bind(...bindings).all();
  return result.results.map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    code: row.code,
    kind: row.kind,
    seller: row.seller_name,
    rating: String(row.rating),
    stock: row.available,
    price: Math.round(row.price_minor / 100),
    old: row.old_price_minor ? Math.round(row.old_price_minor / 100) : undefined,
    status: row.available > 10 ? "В наличии" : row.available > 0 ? "Осталось мало" : "Нет в наличии",
    version: row.version,
  }));
}

async function getCart(db, context) {
  const cartId = `cart:${context.company}:${context.email}`;
  await db.prepare("INSERT OR IGNORE INTO carts (id,buyer_id,status,updated_at) VALUES (?,?,'active',?)")
    .bind(cartId, context.email, new Date().toISOString()).run();
  const items = await db.prepare(
    `SELECT ci.listing_id,ci.quantity,ci.price_snapshot_minor,p.name,p.code,l.seller_name
     FROM cart_items ci JOIN listings l ON l.id=ci.listing_id
     JOIN products p ON p.id=l.product_id WHERE ci.cart_id=? ORDER BY ci.listing_id`
  ).bind(cartId).all();
  return { id: cartId, items: items.results };
}

async function putCartItem(db, request, context, listingId) {
  const forbidden = requireRole(context, ["buyer"]);
  if (forbidden) return forbidden;
  const body = await parseBody(request);
  const quantity = Number(body?.quantity);
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > 999) {
    return apiError(400, "INVALID_QUANTITY", "Количество должно быть целым числом от 0 до 999");
  }
  const listing = await db.prepare(
    "SELECT price_minor,stock-reserved AS available,status FROM listings WHERE id=?"
  ).bind(listingId).first();
  if (!listing || listing.status !== "active") return apiError(404, "LISTING_NOT_FOUND", "Предложение не найдено");
  if (quantity > listing.available) {
    return apiError(409, "INSUFFICIENT_STOCK", "Недостаточно доступного остатка", { available: listing.available });
  }
  const cart = await getCart(db, context);
  if (quantity === 0) {
    await db.prepare("DELETE FROM cart_items WHERE cart_id=? AND listing_id=?").bind(cart.id, listingId).run();
  } else {
    await db.prepare(
      `INSERT INTO cart_items (cart_id,listing_id,quantity,price_snapshot_minor) VALUES (?,?,?,?)
       ON CONFLICT(cart_id,listing_id) DO UPDATE SET quantity=excluded.quantity,price_snapshot_minor=excluded.price_snapshot_minor`
    ).bind(cart.id, listingId, quantity, listing.price_minor).run();
  }
  await db.prepare("UPDATE carts SET updated_at=? WHERE id=?").bind(new Date().toISOString(), cart.id).run();
  await audit(db, context, "cart.item.updated", "listing", listingId, { quantity });
  return json(await getCart(db, context));
}

async function checkout(db, request, context) {
  const forbidden = requireRole(context, ["buyer"]);
  if (forbidden) return forbidden;
  const body = await parseBody(request);
  const key = request.headers.get("idempotency-key") || body?.idempotencyKey;
  if (!key) return apiError(400, "IDEMPOTENCY_KEY_REQUIRED", "Для checkout требуется Idempotency-Key");
  const previous = await db.prepare("SELECT id,status,total_minor FROM purchases WHERE idempotency_key=?").bind(key).first();
  if (previous) {
    return json({ purchaseId: previous.id, status: previous.status, total: previous.total_minor / 100, replayed: true });
  }
  const cart = await getCart(db, context);
  const rows = await db.prepare(
    `SELECT ci.listing_id,ci.quantity,p.name,p.code,l.seller_id,l.seller_name,l.price_minor,
      l.stock-l.reserved AS available
     FROM cart_items ci JOIN listings l ON l.id=ci.listing_id
     JOIN products p ON p.id=l.product_id WHERE ci.cart_id=?`
  ).bind(cart.id).all();
  if (!rows.results.length) return apiError(409, "CART_EMPTY", "Корзина пуста");
  const insufficient = rows.results.find((item) => item.quantity > item.available);
  if (insufficient) {
    return apiError(409, "INSUFFICIENT_STOCK", "Остаток изменился во время оформления", {
      listingId: insufficient.listing_id,
      available: insufficient.available,
    });
  }
  const now = new Date().toISOString();
  const suffix = crypto.randomUUID().slice(0, 8).toUpperCase();
  const purchaseId = `TM-${suffix}`;
  const totalMinor = rows.results.reduce((sum, row) => sum + row.price_minor * row.quantity, 0);
  const grouped = new Map();
  for (const row of rows.results) {
    if (!grouped.has(row.seller_id)) grouped.set(row.seller_id, []);
    grouped.get(row.seller_id).push(row);
  }
  const statements = [
    db.prepare("INSERT INTO purchases (id,buyer_id,company_id,status,total_minor,idempotency_key,created_at) VALUES (?,?,?,'created',?,?,?)")
      .bind(purchaseId, context.email, context.company, totalMinor, key, now),
  ];
  for (const [sellerId, items] of grouped) {
    const orderId = `ORD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const orderTotal = items.reduce((sum, row) => sum + row.price_minor * row.quantity, 0);
    statements.push(
      db.prepare("INSERT INTO orders (id,purchase_id,seller_id,seller_name,status,total_minor,created_at) VALUES (?,?,?,?,'new',?,?)")
        .bind(orderId, purchaseId, sellerId, items[0].seller_name, orderTotal, now)
    );
    for (const item of items) {
      statements.push(
        db.prepare("UPDATE listings SET reserved=reserved+?,version=version+1 WHERE id=? AND stock-reserved>=?")
          .bind(item.quantity, item.listing_id, item.quantity),
        db.prepare("INSERT INTO order_items (order_id,listing_id,product_name,code,quantity,unit_price_minor) VALUES (?,?,?,?,?,?)")
          .bind(orderId, item.listing_id, item.name, item.code, item.quantity, item.price_minor)
      );
    }
  }
  statements.push(
    db.prepare("UPDATE carts SET status='checked_out',updated_at=? WHERE id=?").bind(now, cart.id),
    db.prepare("DELETE FROM cart_items WHERE cart_id=?").bind(cart.id)
  );
  await db.batch(statements);
  await audit(db, context, "purchase.created", "purchase", purchaseId, { totalMinor, orderCount: grouped.size });
  return json({ purchaseId, status: "created", total: totalMinor / 100, orderCount: grouped.size }, 201);
}

async function createComplaint(db, request, context) {
  const forbidden = requireRole(context, ["buyer"]);
  if (forbidden) return forbidden;
  const body = await parseBody(request);
  if (!body?.purchaseId || !body?.type || !body?.description) {
    return apiError(400, "VALIDATION_ERROR", "Укажите закупку, тип и описание");
  }
  const purchase = await db.prepare("SELECT id FROM purchases WHERE id=? AND buyer_id=?")
    .bind(body.purchaseId, context.email).first();
  if (!purchase) return apiError(404, "PURCHASE_NOT_FOUND", "Закупка не найдена или недоступна");
  const id = `CMP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  await db.prepare(
    "INSERT INTO complaints (id,purchase_id,buyer_id,type,description,status,created_at) VALUES (?,?,?,?,?,'opened',?)"
  ).bind(id, body.purchaseId, context.email, body.type, body.description, new Date().toISOString()).run();
  await audit(db, context, "complaint.created", "complaint", id, body);
  return json({ id, status: "opened" }, 201);
}

async function updateOrder(db, request, context, orderId) {
  const forbidden = requireRole(context, ["seller", "admin"]);
  if (forbidden) return forbidden;
  const body = await parseBody(request);
  const allowed = {
    new: ["confirmed", "cancelled"],
    confirmed: ["assembling", "cancelled"],
    assembling: ["ready_to_ship"],
    ready_to_ship: ["shipped"],
    shipped: ["completed"],
  };
  const current = await db.prepare("SELECT status,seller_id FROM orders WHERE id=?").bind(orderId).first();
  if (!current) return apiError(404, "ORDER_NOT_FOUND", "Заказ не найден");
  if (context.role === "seller" && current.seller_id !== "seller-itd") {
    return apiError(403, "ORDER_SCOPE_FORBIDDEN", "Заказ принадлежит другому продавцу");
  }
  if (!allowed[current.status]?.includes(body?.status)) {
    return apiError(409, "INVALID_ORDER_TRANSITION", "Недопустимый переход статуса", {
      from: current.status,
      to: body?.status,
    });
  }
  await db.prepare("UPDATE orders SET status=? WHERE id=?").bind(body.status, orderId).run();
  await audit(db, context, "order.status.changed", "order", orderId, { from: current.status, to: body.status });
  return json({ id: orderId, status: body.status });
}

async function handleApi(request, env) {
  if (!env?.DB) return apiError(503, "DATABASE_UNAVAILABLE", "Хранилище данных ещё не подключено");
  await ensureDatabase(env.DB);
  const url = new URL(request.url);
  const path = url.pathname;
  const context = requestContext(request);

  if (path === "/api/health" && request.method === "GET") {
    return json({ status: "ok", service: "techm-api", database: "connected", time: new Date().toISOString() });
  }
  if (path === "/api/session" && request.method === "GET") {
    return json({ user: { email: context.email }, role: context.role, companyId: context.company });
  }
  if (path === "/api/catalog" && request.method === "GET") {
    return json({ items: await catalog(env.DB, url) });
  }
  if (path === "/api/cart" && request.method === "GET") {
    const forbidden = requireRole(context, ["buyer"]);
    return forbidden || json(await getCart(env.DB, context));
  }
  const cartMatch = path.match(/^\/api\/cart\/(\d+)$/);
  if (cartMatch && request.method === "PUT") {
    return putCartItem(env.DB, request, context, Number(cartMatch[1]));
  }
  if (path === "/api/checkout" && request.method === "POST") {
    return checkout(env.DB, request, context);
  }
  if (path === "/api/complaints" && request.method === "POST") {
    return createComplaint(env.DB, request, context);
  }
  const orderMatch = path.match(/^\/api\/orders\/([^/]+)$/);
  if (orderMatch && request.method === "PATCH") {
    return updateOrder(env.DB, request, context, decodeURIComponent(orderMatch[1]));
  }
  if (path === "/api/admin/audit" && request.method === "GET") {
    const forbidden = requireRole(context, ["admin"]);
    if (forbidden) return forbidden;
    const rows = await env.DB.prepare("SELECT * FROM audit_log ORDER BY id DESC LIMIT 100").all();
    return json({ items: rows.results });
  }
  return apiError(404, "API_ROUTE_NOT_FOUND", "API endpoint не найден");
}
