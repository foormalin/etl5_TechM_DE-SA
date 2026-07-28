import test from "node:test";
import assert from "node:assert/strict";

const transitions = {
  NEW: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["READY_FOR_PICKUP", "CANCELLED"],
  READY_FOR_PICKUP: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

function transition(from, to) {
  if (!transitions[from]?.includes(to)) {
    throw new Error("ORDER_TRANSITION_FORBIDDEN");
  }
  return to;
}

test("allows the documented pickup happy path", () => {
  let status = "NEW";
  status = transition(status, "CONFIRMED");
  status = transition(status, "READY_FOR_PICKUP");
  status = transition(status, "COMPLETED");
  assert.equal(status, "COMPLETED");
});

test("terminal orders cannot transition", () => {
  assert.throws(
    () => transition("COMPLETED", "CANCELLED"),
    /ORDER_TRANSITION_FORBIDDEN/,
  );
});
