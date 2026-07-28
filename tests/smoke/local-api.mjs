import assert from "node:assert/strict";
import { spawn } from "node:child_process";

const port = 5199;
const child = spawn(process.execPath, ["scripts/dev-local.mjs"], {
  cwd: process.cwd(),
  env: { ...process.env, PORT: String(port) },
  stdio: "ignore",
});

async function waitForHealth() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/health`);
      if (response.ok) return response.json();
    } catch {
      // The dev server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Local API did not become ready");
}

try {
  const health = await waitForHealth();
  assert.equal(health.status, "ok");
  assert.equal(health.service, "techm-local-api");

  const catalogResponse = await fetch(`http://127.0.0.1:${port}/api/catalog`);
  const catalog = await catalogResponse.json();
  assert.equal(catalog.items.length, 8);

  const headers = {
    "content-type": "application/json",
    "x-techm-role": "buyer",
  };
  const cartResponse = await fetch(`http://127.0.0.1:${port}/api/cart/1`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ quantity: 2 }),
  });
  assert.equal(cartResponse.status, 200);

  const checkoutResponse = await fetch(`http://127.0.0.1:${port}/api/checkout`, {
    method: "POST",
    headers: { ...headers, "idempotency-key": "local-smoke-test" },
    body: "{}",
  });
  const checkout = await checkoutResponse.json();
  assert.equal(checkoutResponse.status, 201);
  assert.match(checkout.purchaseId, /^TM-/);
  assert.equal(checkout.orderCount, 1);

  console.log("local API smoke: health, catalog, cart and checkout passed");
} finally {
  child.kill();
}
