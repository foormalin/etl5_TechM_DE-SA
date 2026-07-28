CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('buyer','seller','platform')),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL,
  moderation_status TEXT NOT NULL DEFAULT 'published',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS listings (
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
);

CREATE TABLE IF NOT EXISTS carts (
  id TEXT PRIMARY KEY,
  buyer_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cart_items (
  cart_id TEXT NOT NULL,
  listing_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL CHECK(quantity > 0),
  price_snapshot_minor INTEGER NOT NULL,
  PRIMARY KEY(cart_id, listing_id)
);

CREATE TABLE IF NOT EXISTS purchases (
  id TEXT PRIMARY KEY,
  buyer_id TEXT NOT NULL,
  company_id TEXT NOT NULL,
  status TEXT NOT NULL,
  total_minor INTEGER NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  purchase_id TEXT NOT NULL,
  seller_id TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  status TEXT NOT NULL,
  total_minor INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(purchase_id) REFERENCES purchases(id)
);

CREATE TABLE IF NOT EXISTS order_items (
  order_id TEXT NOT NULL,
  listing_id INTEGER NOT NULL,
  product_name TEXT NOT NULL,
  code TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price_minor INTEGER NOT NULL,
  PRIMARY KEY(order_id, listing_id)
);

CREATE TABLE IF NOT EXISTS complaints (
  id TEXT PRIMARY KEY,
  purchase_id TEXT NOT NULL,
  buyer_id TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'opened',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor TEXT NOT NULL,
  role TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  payload TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS products_category_idx ON products(category);
CREATE INDEX IF NOT EXISTS listings_product_idx ON listings(product_id);
CREATE INDEX IF NOT EXISTS orders_purchase_idx ON orders(purchase_id);
CREATE INDEX IF NOT EXISTS complaints_purchase_idx ON complaints(purchase_id);
