import assert from "node:assert/strict";
import worker from "../../dist/server/index.js";

const response = await worker.fetch(
  new Request("https://techm.local/api/health"),
  {},
);
assert.ok([200, 503].includes(response.status));
const payload = await response.json();
assert.ok(payload.status || payload.code || payload.error?.code);
console.log(`demo worker smoke: /api/health -> ${response.status}`);
