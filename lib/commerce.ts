import { randomUUID } from "node:crypto";
import type { Client, Row } from "@libsql/client";
import Stripe from "stripe";
import { getDb, getSettings, query } from "./database";
import { ApiError, validateCart, tokenHash } from "./security";
import type { StoreSettings } from "./types";
export type CartLine = { id: string; quantity: number };
const signatureFor = (lines: CartLine[], promo: string) =>
  tokenHash(
    JSON.stringify([...lines].sort((a, b) => a.id.localeCompare(b.id))) + promo,
  );
export async function reserveOrder(
  client: Client,
  userId: string,
  lines: CartLine[],
  settings: StoreSettings,
  promo = "",
) {
  validateCart(lines);
  const tx = await client.transaction("write");
  const signature = signatureFor(lines, promo);
  try {
    const active = await tx.execute({
      sql: "SELECT * FROM orders WHERE user_id=? AND status='Pending payment' AND expires_at>?",
      args: [userId, Date.now()],
    });
    const reuse = active.rows.find(
      (r) => JSON.parse(String(r.body)).signature === signature,
    );
    if (reuse) {
      await tx.rollback();
      return {
        id: String(reuse.id),
        ...JSON.parse(String(reuse.body)),
        reused: true,
      };
    }
    let percent = 0;
    if (promo) {
      const p = (
        await tx.execute({
          sql: "SELECT * FROM promos WHERE code=? AND active=1",
          args: [promo.toUpperCase()],
        })
      ).rows[0];
      if (
        !p ||
        (p.expires_at && String(p.expires_at) < new Date().toISOString())
      )
        throw new ApiError("This promo code is not available.");
      percent = Number(p.percent);
    }
    const items = [];
    let subtotal = 0;
    for (const line of lines) {
      const p = (
        await tx.execute({
          sql: "SELECT * FROM products WHERE id=? AND deleted=0",
          args: [line.id],
        })
      ).rows[0];
      if (
        !p ||
        Number(p.sample) ||
        p.status !== "Available" ||
        Number(p.quantity) < line.quantity
      )
        throw new ApiError(
          "An item is unavailable or is a sample listing. Update your bag before checkout.",
          409,
        );
      const body = JSON.parse(String(p.body));
      const unit = Math.round(Number(p.price) * (1 - percent / 100));
      subtotal += unit * line.quantity;
      items.push({
        id: line.id,
        quantity: line.quantity,
        price: unit,
        title: body.title,
        slug: body.slug,
        image: body.images[0],
        sku: body.sku,
      });
    }
    if (subtotal < 50)
      throw new ApiError(
        "The order total is below the payment provider minimum.",
      );
    const id = randomUUID(),
      reference = `ST-ORD-${randomUUID().slice(0, 8).toUpperCase()}`,
      now = new Date().toISOString();
    const body = {
      signature,
      items,
      subtotal,
      shipping: settings.shippingCents,
      promo,
      discountPercent: percent,
      reference,
      checkoutExpires: Math.floor(Date.now() / 1000) + 35 * 60,
    };
    await tx.execute({
      sql: "INSERT INTO orders(id,reference,user_id,status,total,body,created_at,updated_at,expires_at) VALUES(?,?,?,?,?,?,?,?,?)",
      args: [
        id,
        reference,
        userId,
        "Pending payment",
        subtotal + settings.shippingCents,
        JSON.stringify(body),
        now,
        now,
        body.checkoutExpires * 1000,
      ],
    });
    for (const item of items) {
      await tx.execute({
        sql: "UPDATE products SET revision=revision+1,quantity=quantity-?,status=CASE WHEN quantity-?=0 THEN 'Reserved' ELSE status END WHERE id=?",
        args: [item.quantity, item.quantity, item.id],
      });
      await tx.execute({
        sql: "INSERT INTO order_items(order_id,product_id,quantity,price) VALUES(?,?,?,?)",
        args: [id, item.id, item.quantity, item.price],
      });
    }
    await tx.commit();
    return { id, ...body, reused: false };
  } catch (e) {
    if (!tx.closed) await tx.rollback();
    throw e;
  } finally {
    tx.close();
  }
}
export async function finishOrder(
  client: Client,
  orderId: string,
  eventId: string,
  result: "paid" | "expired",
  providerTotal?: number,
  fulfillmentDetails?: Record<string, unknown>,
) {
  const tx = await client.transaction("write");
  try {
    if (
      (
        await tx.execute({
          sql: "SELECT id FROM webhook_events WHERE id=?",
          args: [eventId],
        })
      ).rows.length
    ) {
      await tx.rollback();
      return false;
    }
    const o = (
      await tx.execute({
        sql: "SELECT * FROM orders WHERE id=?",
        args: [orderId],
      })
    ).rows[0];
    if (!o) throw new ApiError("Order not found.", 404);
    if (o.status === "Pending payment") {
      const lines = (
        await tx.execute({
          sql: "SELECT * FROM order_items WHERE order_id=?",
          args: [orderId],
        })
      ).rows;
      for (const l of lines) {
        if (result === "expired")
          await tx.execute({
            sql: "UPDATE products SET revision=revision+1,quantity=quantity+?,status=CASE WHEN status IN ('Reserved','Sold') THEN 'Available' ELSE status END WHERE id=?",
            args: [l.quantity, l.product_id],
          });
        else {
          const p = (
            await tx.execute({
              sql: "SELECT body FROM products WHERE id=?",
              args: [l.product_id],
            })
          ).rows[0];
          const body = JSON.parse(String(p.body));
          body.soldCount = (body.soldCount || 0) + Number(l.quantity);
          await tx.execute({
            sql: "UPDATE products SET revision=revision+1,status=CASE WHEN quantity=0 THEN 'Sold' ELSE status END,body=? WHERE id=?",
            args: [JSON.stringify(body), l.product_id],
          });
        }
      }
      await tx.execute({
        sql: "UPDATE orders SET status=?,total=?,body=?,updated_at=? WHERE id=?",
        args: [
          result === "paid" ? "Paid" : "Expired",
          providerTotal ?? o.total,
          JSON.stringify({
            ...JSON.parse(String(o.body)),
            ...fulfillmentDetails,
          }),
          new Date().toISOString(),
          orderId,
        ],
      });
    }
    await tx.execute({
      sql: "INSERT INTO webhook_events(id,created_at) VALUES(?,?)",
      args: [eventId, new Date().toISOString()],
    });
    await tx.commit();
    return true;
  } catch (e) {
    if (!tx.closed) await tx.rollback();
    throw e;
  } finally {
    tx.close();
  }
}
export function stripeClient() {
  if (!process.env.STRIPE_SECRET_KEY)
    throw new ApiError("Checkout opens after payment setup is complete.", 503);
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}
export async function loadResumeOrder(
  client: Client,
  userId: string,
  id: string,
  reconcile: (order: Row) => Promise<void>,
) {
  let order = (
    await client.execute({
      sql: "SELECT * FROM orders WHERE id=? AND user_id=?",
      args: [id, userId],
    })
  ).rows[0];
  if (!order) throw new ApiError("Order not found.", 404);
  if (
    order.status === "Pending payment" &&
    Number(order.expires_at) <= Date.now()
  ) {
    await reconcile(order);
    order = (
      await client.execute({
        sql: "SELECT * FROM orders WHERE id=? AND user_id=?",
        args: [id, userId],
      })
    ).rows[0];
  }
  if (
    !["Pending payment", "Paid", "Shipped", "Completed"].includes(
      String(order.status),
    )
  )
    throw new ApiError(
      "This checkout expired. Return to your bag to start a new checkout.",
      409,
    );
  return order;
}
export async function createCheckout(
  userId: string,
  email: string,
  lines: CartLine[],
  promo: string,
  resumeOrderId?: string,
) {
  validateCart(lines);
  const settings = await getSettings();
  if (!settings.live || !process.env.STRIPE_WEBHOOK_SECRET)
    throw new ApiError(
      "Purchases are not open yet. Your bag is saved for later.",
      503,
    );
  const base = process.env.APP_URL;
  if (!base || (!base.startsWith("https://") && process.env.VERCEL))
    throw new ApiError("Checkout is not configured yet.", 503);
  const stripe = stripeClient();
  let order: Awaited<ReturnType<typeof reserveOrder>>;
  if (resumeOrderId) {
    const resumed = await loadResumeOrder(
      getDb(),
      userId,
      resumeOrderId,
      (old) => reconcileOrder(old, stripe),
    );
    if (["Paid", "Shipped", "Completed"].includes(String(resumed.status)))
      return {
        url: `${base}/account?checkout=success&order=${resumed.id}`,
        reference: String(resumed.reference),
      };
    order = {
      id: String(resumed.id),
      ...JSON.parse(String(resumed.body)),
      reused: true,
    };
  } else {
    const signature = signatureFor(lines, promo);
    const expired = await query(
      "SELECT * FROM orders WHERE user_id=? AND status='Pending payment' AND expires_at<? LIMIT 20",
      [userId, Date.now()],
    );
    for (const old of expired) {
      const matches = JSON.parse(String(old.body)).signature === signature;
      try {
        await reconcileOrder(old, stripe);
      } catch (e) {
        if (matches || !(e instanceof ApiError) || e.status !== 409) throw e;
        continue;
      }
      const fresh = (
        await query("SELECT status FROM orders WHERE id=?", [String(old.id)])
      )[0];
      if (
        matches &&
        ["Paid", "Shipped", "Completed"].includes(String(fresh.status))
      )
        return {
          url: `${base}/account?checkout=success&order=${old.id}`,
          reference: String(old.reference),
        };
    }
    order = await reserveOrder(getDb(), userId, lines, settings, promo);
  }
  const saved = (await query("SELECT * FROM orders WHERE id=?", [order.id]))[0];
  if (saved.stripe_session) {
    const existing = await stripe.checkout.sessions.retrieve(
      String(saved.stripe_session),
    );
    if (existing.status === "open" && existing.url)
      return { url: existing.url, reference: order.reference };
    await settleSession(
      saved,
      existing,
      `retry-${existing.id}-${existing.status}`,
    );
    if (existing.payment_status === "paid")
      return {
        url: `${base}/account?checkout=success&order=${order.id}`,
        reference: order.reference,
      };
    throw new ApiError(
      "The previous checkout expired. Try checkout again to refresh your bag.",
      409,
    );
  }
  const candidate: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: email,
    client_reference_id: order.id,
    metadata: { orderId: order.id },
    line_items: order.items.map(
      (p: { title: string; price: number; quantity: number }) => ({
        price_data: {
          currency: "usd",
          unit_amount: p.price,
          product_data: { name: p.title },
        },
        quantity: p.quantity,
      }),
    ),
    shipping_address_collection: { allowed_countries: ["US"] },
    shipping_options: [
      {
        shipping_rate_data: {
          display_name: "Standard shipping",
          type: "fixed_amount",
          fixed_amount: { amount: order.shipping, currency: "usd" },
        },
      },
    ],
    automatic_tax: { enabled: process.env.STRIPE_AUTOMATIC_TAX === "true" },
    expires_at: order.checkoutExpires,
    success_url: `${base}/account?checkout=success&order=${order.id}`,
    cancel_url: `${base}/cart?checkout=cancelled`,
  };
  // Persist the exact request before the network call. A retry after a timeout
  // must use the same payload with Stripe's idempotency key.
  const tx = await getDb().transaction("write");
  let params: Stripe.Checkout.SessionCreateParams;
  try {
    const row = (
      await tx.execute({
        sql: "SELECT body FROM orders WHERE id=?",
        args: [order.id],
      })
    ).rows[0];
    const body = JSON.parse(String(row.body));
    params = body.checkoutParams || candidate;
    await tx.execute({
      sql: "UPDATE orders SET body=? WHERE id=?",
      args: [JSON.stringify({ ...body, checkoutParams: params }), order.id],
    });
    await tx.commit();
  } catch (e) {
    if (!tx.closed) await tx.rollback();
    throw e;
  } finally {
    tx.close();
  }
  const session = await stripe.checkout.sessions.create(params, {
    idempotencyKey: `sailan-${order.id}`,
  });
  await query("UPDATE orders SET stripe_session=? WHERE id=?", [
    session.id,
    order.id,
  ]);
  return { url: session.url, reference: order.reference };
}
export async function processWebhook(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new ApiError("Webhook is not configured.", 503);
  const stripe = stripeClient();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      await req.text(),
      req.headers.get("stripe-signature") || "",
      secret,
    );
  } catch {
    throw new ApiError("Invalid webhook signature.", 400);
  }
  if (
    ["checkout.session.completed", "checkout.session.expired"].includes(
      event.type,
    )
  ) {
    const session = event.data.object as Stripe.Checkout.Session;
    const id = session.metadata?.orderId;
    if (!id) throw new ApiError("Missing order reference.");
    const order = (await query("SELECT * FROM orders WHERE id=?", [id]))[0];
    if (!order) throw new ApiError("Order not found.", 404);
    await settleSession(order, session, event.id);
  }
  return { received: true };
}

export function validatePaidSession(
  order: Record<string, unknown>,
  session: Stripe.Checkout.Session,
) {
  const expected = JSON.parse(String(order.body));
  if (
    session.metadata?.orderId !== order.id ||
    session.client_reference_id !== order.id ||
    (order.stripe_session && order.stripe_session !== session.id)
  )
    throw new ApiError("Checkout session mismatch.");
  if (
    session.payment_status !== "paid" ||
    session.currency !== "usd" ||
    session.amount_subtotal !== expected.subtotal ||
    session.shipping_cost?.amount_subtotal !== expected.shipping ||
    session.amount_total === null ||
    session.amount_total < expected.subtotal + expected.shipping
  )
    throw new ApiError("Payment amount mismatch.");
}
async function settleSession(
  order: Row,
  session: Stripe.Checkout.Session,
  eventId: string,
) {
  if (
    session.metadata?.orderId !== order.id ||
    session.client_reference_id !== order.id ||
    (order.stripe_session && order.stripe_session !== session.id)
  )
    throw new ApiError("Checkout session mismatch.");
  if (session.payment_status === "paid") {
    validatePaidSession(order, session);
    await finishOrder(
      getDb(),
      String(order.id),
      eventId,
      "paid",
      session.amount_total!,
      {
        shippingAddress:
          session.collected_information?.shipping_details ?? null,
      },
    );
  } else if (session.status === "expired")
    await finishOrder(getDb(), String(order.id), eventId, "expired");
  else
    throw new ApiError(
      "Payment is still pending. Inventory remains reserved.",
      409,
    );
  await query("UPDATE orders SET stripe_session=? WHERE id=?", [
    session.id,
    String(order.id),
  ]);
}
export async function reconcileOrder(
  order: Row,
  stripe: Stripe = stripeClient(),
) {
  let session: Stripe.Checkout.Session | undefined;
  if (order.stripe_session)
    session = await stripe.checkout.sessions.retrieve(
      String(order.stripe_session),
    );
  else {
    // Recover a session created before a network interruption prevented linking it.
    const sessions = await stripe.checkout.sessions
      .list({
        created: {
          gte:
            Math.floor(new Date(String(order.created_at)).getTime() / 1000) -
            60,
          lte: Math.floor(Number(order.expires_at) / 1000) + 60,
        },
        limit: 100,
      })
      .autoPagingToArray({ limit: 1000 });
    session = sessions.find(
      (s) =>
        s.metadata?.orderId === order.id && s.client_reference_id === order.id,
    );
    if (!session) {
      if (
        sessions.length === 1000 ||
        Number(order.expires_at) + 3600000 > Date.now()
      )
        throw new ApiError(
          "The payment provider has not confirmed this checkout. Retry reconciliation after the reservation has been expired for an hour.",
          409,
        );
      await finishOrder(
        getDb(),
        String(order.id),
        `no-session-${order.id}`,
        "expired",
      );
      return;
    }
  }
  await settleSession(
    order,
    session,
    `reconcile-${session.id}-${session.status}`,
  );
}
