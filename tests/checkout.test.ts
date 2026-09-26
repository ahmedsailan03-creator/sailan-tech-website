import test from "node:test";
import assert from "node:assert/strict";
import type Stripe from "stripe";
import { removePurchased } from "../lib/cart";
import { validatePaidSession } from "../lib/commerce";
test("confirmed purchases remove only purchased quantities and preserve other cart items", () => {
  assert.deepEqual(
    removePurchased(
      [
        { id: "a", quantity: 3 },
        { id: "b", quantity: 2 },
        { id: "c", quantity: 1 },
      ],
      [
        { id: "a", quantity: 1 },
        { id: "b", quantity: 2 },
      ],
    ),
    [
      { id: "a", quantity: 2 },
      { id: "c", quantity: 1 },
    ],
  );
});
test("provider verification rejects wrong order, amounts, currency and unpaid sessions", () => {
  const order = {
    id: "order",
    stripe_session: "session",
    body: JSON.stringify({ subtotal: 10000, shipping: 1500 }),
  };
  const paid = {
    id: "session",
    client_reference_id: "order",
    metadata: { orderId: "order" },
    payment_status: "paid",
    currency: "usd",
    amount_subtotal: 10000,
    amount_total: 12000,
    shipping_cost: { amount_subtotal: 1500 },
  } as unknown as Stripe.Checkout.Session;
  assert.doesNotThrow(() => validatePaidSession(order, paid));
  for (const patch of [
    { currency: "eur" },
    { amount_subtotal: 1 },
    { amount_total: 1 },
    { payment_status: "unpaid" },
    { metadata: { orderId: "another" } },
    { id: "another" },
  ])
    assert.throws(() =>
      validatePaidSession(order, {
        ...paid,
        ...patch,
      } as Stripe.Checkout.Session),
    );
});
