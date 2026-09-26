import test from "node:test";
import assert from "node:assert/strict";
import {
  hashPassword,
  verifyPassword,
  requireRole,
  assertOwner,
  assertTransition,
  validateCart,
  checkOrigin,
} from "../lib/security";
import type { User } from "../lib/types";
const user: User = {
  id: "customer-a",
  name: "Test",
  email: "test@example.invalid",
  role: "customer",
  phone: "",
  createdAt: "",
};
test("passwords are salted and wrong credentials fail", async () => {
  const a = await hashPassword("Long-test-password-123");
  const b = await hashPassword("Long-test-password-123");
  assert.notEqual(a, b);
  assert.equal(await verifyPassword("Long-test-password-123", a), true);
  assert.equal(await verifyPassword("wrong", a), false);
});
test("anonymous and customer callers cannot access admin data", () => {
  assert.throws(() => requireRole(null, true));
  assert.throws(() => requireRole(user, true));
  assert.equal(requireRole({ ...user, role: "admin" }, true).id, "customer-a");
});
test("another customer cannot read a private record", () =>
  assert.throws(() => assertOwner(user, "customer-b")));
test("admin cannot skip inspection or record a payout by changing status", () => {
  assert.throws(() => assertTransition("Quote Accepted", "Paid"));
  assert.throws(() => assertTransition("Revised Offer", "Offer Accepted"));
  assert.throws(() => assertTransition("Payment Processing", "Paid"));
  assert.doesNotThrow(() => assertTransition("Device Received", "Inspection"));
});
test("negative, fractional, duplicate and empty cart requests fail", () => {
  for (const c of [
    [],
    [{ id: "x", quantity: -1 }],
    [{ id: "x", quantity: 1.5 }],
    [
      { id: "x", quantity: 1 },
      { id: "x", quantity: 1 },
    ],
  ])
    assert.throws(() => validateCart(c));
  assert.equal(validateCart([{ id: "x", quantity: 2 }])[0].quantity, 2);
});
test("cross-origin and missing-origin mutations fail", () => {
  assert.throws(() =>
    checkOrigin(
      new Request("https://shop.example/api", {
        headers: { host: "shop.example", origin: "https://evil.example" },
      }),
    ),
  );
  assert.throws(() =>
    checkOrigin(
      new Request("https://shop.example/api", {
        headers: { host: "shop.example" },
      }),
    ),
  );
  assert.doesNotThrow(() =>
    checkOrigin(
      new Request("https://shop.example/api", {
        headers: { host: "shop.example", origin: "https://shop.example" },
      }),
    ),
  );
});
