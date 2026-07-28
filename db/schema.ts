// Logical D1 schema for the TechM prototype.
// Runtime initialization and the deployable migration use the same tables.
export const tables = [
  "companies",
  "products",
  "listings",
  "carts",
  "cart_items",
  "purchases",
  "orders",
  "order_items",
  "complaints",
  "audit_log",
] as const;
