import test from "node:test";
import assert from "node:assert/strict";

test("purchase total is the exact sum of integer minor units", () => {
  const lines = [
    { priceMinor: 9_999_000, quantity: 2 },
    { priceMinor: 1_250_000, quantity: 3 },
  ];
  const total = lines.reduce(
    (sum, line) => sum + line.priceMinor * line.quantity,
    0,
  );
  assert.equal(total, 23_748_000);
  assert.equal(Number.isSafeInteger(total), true);
});

test("reservation preserves physical >= reserved >= 0", () => {
  const reserve = (physical, reserved, requested) => {
    if (!Number.isInteger(requested) || requested <= 0) throw new Error("QTY");
    if (physical - reserved < requested) throw new Error("OUT_OF_STOCK");
    return { physical, reserved: reserved + requested };
  };
  assert.deepEqual(reserve(5, 2, 3), { physical: 5, reserved: 5 });
  assert.throws(() => reserve(5, 5, 1), /OUT_OF_STOCK/);
});
