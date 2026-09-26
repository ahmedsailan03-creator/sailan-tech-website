import { saveProduct, archiveProduct } from "@/lib/inventory";
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";
import {
  getDb,
  query,
  getProducts,
  getDevices,
  getPolicy,
  getSettings,
  databaseConfigured,
} from "@/lib/database";
import { calculateQuote } from "@/lib/quote";
import {
  ApiError,
  hashPassword,
  verifyPassword,
  requireRole,
  assertOwner,
  assertTransition,
  checkOrigin,
  tokenHash,
} from "@/lib/security";
import {
  currentUser,
  createSession,
  rateLimit,
  audit,
  COOKIE,
} from "@/lib/auth";
import {
  credentials,
  quoteInput,
  contact,
  addressSchema,
  productSchema,
  deviceSchema,
  policySchema,
  settingsSchema,
  serviceSchema,
} from "@/lib/validation";
import { createCheckout, processWebhook, reconcileOrder } from "@/lib/commerce";
import { buyStatuses } from "@/lib/types";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const ok = (data: unknown, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
async function body(req: Request) {
  const s = await req.text();
  if (s.length > 100000) throw new ApiError("The request is too large.", 413);
  try {
    return JSON.parse(s);
  } catch {
    throw new ApiError("Invalid request.");
  }
}
const reference = (kind: string) =>
  `ST-${kind}-${randomUUID().slice(0, 8).toUpperCase()}`;
const mapRecord = (r: Record<string, unknown>) => ({
  ...r,
  body: JSON.parse(String(r.body || "{}")),
});
async function handle(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path } = await params;
    const route = path.join("/");
    const method = req.method;
    if (route === "webhooks/stripe" && method === "POST")
      return ok(await processWebhook(req));
    if (method !== "GET") checkOrigin(req);
    if (route === "me" && method === "GET")
      return ok({
        user: await currentUser(),
        configured: databaseConfigured(),
      });
    if (route === "catalog" && method === "GET")
      return ok({
        products: await getProducts(),
        devices: await getDevices(),
        settings: await getSettings(),
      });
    if (route === "quote" && method === "POST") {
      const input = quoteInput.parse(await body(req));
      const [devices, policy] = await Promise.all([getDevices(), getPolicy()]);
      return ok({
        estimate: calculateQuote(
          input,
          devices.find((d) => d.id === input.modelId),
          policy,
        ),
      });
    }
    if (!databaseConfigured())
      throw new ApiError(
        "This preview is not accepting accounts or submissions yet. The store owner needs to finish setup.",
        503,
      );
    if (["auth/register", "auth/login"].includes(route) && method === "POST") {
      const b = credentials.parse(await body(req));
      await rateLimit(`auth:${b.email}`, 10);
      await rateLimit(
        `auth-ip:${tokenHash(req.headers.get("x-forwarded-for") || "local")}`,
        50,
      );
      let uid = "";
      if (route === "auth/register") {
        if (!b.name) throw new ApiError("Enter your full name.");
        if (
          (await query("SELECT id FROM users WHERE email=?", [b.email])).length
        )
          throw new ApiError(
            "An account already uses this email. Sign in instead.",
            409,
          );
        uid = randomUUID();
        await query(
          "INSERT INTO users(id,name,email,password,role,phone,created_at) VALUES(?,?,?,?,?,?,?)",
          [
            uid,
            b.name,
            b.email,
            await hashPassword(b.password),
            "customer",
            "",
            new Date().toISOString(),
          ],
        );
      } else {
        const row = (
          await query("SELECT id,password FROM users WHERE email=?", [b.email])
        )[0];
        const valid = await verifyPassword(
          b.password,
          String(
            row?.password ||
              "0123456789abcdef0123456789abcdef:" + "0".repeat(128),
          ),
        );
        if (!row || !valid)
          throw new ApiError("The email or password is incorrect.", 401);
        uid = String(row.id);
      }
      const token = await createSession(uid);
      const res = ok({ success: true });
      res.cookies.set(COOKIE, token, {
        httpOnly: true,
        secure: Boolean(process.env.VERCEL),
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 86400,
      });
      return res;
    }
    const user = await currentUser();
    if (route === "auth/logout" && method === "POST") {
      const token = (await cookies()).get(COOKIE)?.value;
      if (token)
        await query("DELETE FROM sessions WHERE token=?", [tokenHash(token)]);
      const res = ok({ success: true });
      res.cookies.set(COOKIE, "", {
        maxAge: 0,
        path: "/",
        httpOnly: true,
        secure: Boolean(process.env.VERCEL),
        sameSite: "lax",
      });
      return res;
    }
    if (route === "requests" && method === "POST") {
      const b = serviceSchema.parse(await body(req));
      await rateLimit(
        `request:${tokenHash(req.headers.get("x-forwarded-for") || "local")}`,
        15,
      );
      if (b.certificate) {
        const f = (
          await query(
            "SELECT user_id FROM uploads WHERE id=? AND kind='certificate'",
            [b.certificate],
          )
        )[0];
        if (!f || !user || f.user_id !== user.id)
          throw new ApiError(
            "Please upload the certificate from your own account.",
          );
      }
      const id = randomUUID(),
        ref = reference(b.kind === "wholesale" ? "WHOLE" : "HELP");
      await query(
        "INSERT INTO requests(id,reference,user_id,kind,status,body,created_at) VALUES(?,?,?,?,?,?,?)",
        [
          id,
          ref,
          user?.id ?? null,
          b.kind,
          "New",
          JSON.stringify(b),
          new Date().toISOString(),
        ],
      );
      return ok({ id, reference: ref }, 201);
    }
    if (route === "uploads" && method === "POST") {
      const u = requireRole(user);
      await rateLimit(`upload:${u.id}`, 30);
      if (Number(req.headers.get("content-length") || 0) > 5 * 1024 * 1024)
        throw new ApiError("Files must be under 4 MB.", 413);
      const form = await req.formData();
      const file = form.get("file");
      const kind = form.get("kind");
      if (
        !(file instanceof File) ||
        !["image", "certificate"].includes(String(kind))
      )
        throw new ApiError("Choose a valid file.");
      if (kind === "image") requireRole(user, true);
      if (file.size > 4 * 1024 * 1024 || file.size < 8)
        throw new ApiError("Files must be under 4 MB.");
      const bytes = Buffer.from(await file.arrayBuffer());
      const png = bytes
        .subarray(0, 8)
        .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
      const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
      const webp =
        bytes.subarray(0, 4).toString() === "RIFF" &&
        bytes.subarray(8, 12).toString() === "WEBP";
      const pdf = bytes.subarray(0, 5).toString() === "%PDF-";
      const mime = png
        ? "image/png"
        : jpeg
          ? "image/jpeg"
          : webp
            ? "image/webp"
            : pdf
              ? "application/pdf"
              : "";
      if (!mime || (kind === "image" && pdf))
        throw new ApiError("Use a PNG, JPEG, WebP image or a PDF certificate.");
      const id = randomUUID();
      await query(
        "INSERT INTO uploads(id,user_id,kind,mime,name,bytes,created_at) VALUES(?,?,?,?,?,?,?)",
        [
          id,
          u.id,
          String(kind),
          mime,
          file.name.replace(/[^\w .-]/g, "").slice(0, 120),
          bytes,
          new Date().toISOString(),
        ],
      );
      return ok(
        {
          id,
          url: kind === "image" ? `/api/images/${id}` : `/api/files/${id}`,
        },
        201,
      );
    }
    if (["images", "files"].includes(path[0]) && path[1] && method === "GET") {
      const f = (await query("SELECT * FROM uploads WHERE id=?", [path[1]]))[0];
      if (!f) throw new ApiError("File not found.", 404);
      if (path[0] === "images" && f.kind !== "image")
        throw new ApiError("File not found.", 404);
      if (f.kind !== "image") assertOwner(requireRole(user), String(f.user_id));
      return new Response(new Uint8Array(f.bytes as ArrayBuffer), {
        headers: {
          "Content-Type": String(f.mime),
          "X-Content-Type-Options": "nosniff",
          "Content-Disposition": `${f.kind === "image" ? "inline" : "attachment"}; filename="${String(f.name)}"`,
          "Cache-Control":
            f.kind === "image" ? "public,max-age=86400" : "private,no-store",
        },
      });
    }
    if (route === "reviews" && method === "GET") {
      const id = new URL(req.url).searchParams.get("productId") || "";
      return ok({
        reviews: await query(
          "SELECT r.id,r.rating,r.body,r.created_at,u.name FROM reviews r JOIN users u ON u.id=r.user_id WHERE r.product_id=? ORDER BY r.created_at DESC",
          [id],
        ),
      });
    }
    const u = requireRole(user);
    if (route === "account" && method === "GET") {
      const [orders, quotes, requests, addresses, favorites, payouts] =
        await Promise.all([
          query(
            "SELECT id,reference,status,total,body,created_at,updated_at FROM orders WHERE user_id=? ORDER BY created_at DESC",
            [u.id],
          ),
          query(
            "SELECT * FROM quotes WHERE user_id=? ORDER BY created_at DESC",
            [u.id],
          ),
          query(
            "SELECT * FROM requests WHERE user_id=? ORDER BY created_at DESC",
            [u.id],
          ),
          query("SELECT * FROM addresses WHERE user_id=?", [u.id]),
          query("SELECT product_id FROM favorites WHERE user_id=?", [u.id]),
          query(
            "SELECT p.* FROM payouts p JOIN quotes q ON p.quote_id=q.id WHERE q.user_id=?",
            [u.id],
          ),
        ]);
      return ok({
        user: u,
        orders: orders.map(mapRecord),
        quotes: quotes.map(mapRecord),
        requests: requests.map(mapRecord),
        addresses: addresses.map(mapRecord),
        favorites: favorites.map((x) => x.product_id),
        payouts,
      });
    }
    if (route === "profile" && method === "PATCH") {
      const b = z
        .object({
          name: z.string().trim().min(2).max(100),
          phone: z.string().trim().max(30),
        })
        .parse(await body(req));
      await query("UPDATE users SET name=?,phone=? WHERE id=?", [
        b.name,
        b.phone,
        u.id,
      ]);
      return ok({ success: true });
    }
    if (route === "addresses" && method === "POST") {
      const b = addressSchema.parse(await body(req));
      const id = randomUUID();
      await query("INSERT INTO addresses(id,user_id,body) VALUES(?,?,?)", [
        id,
        u.id,
        JSON.stringify(b),
      ]);
      return ok({ id });
    }
    if (path[0] === "addresses" && path[1] && method === "DELETE") {
      await query("DELETE FROM addresses WHERE id=? AND user_id=?", [
        path[1],
        u.id,
      ]);
      return ok({ success: true });
    }
    if (route === "favorites" && method === "POST") {
      const b = z
        .object({ productId: z.string().max(100) })
        .parse(await body(req));
      if (
        !(
          await query("SELECT id FROM products WHERE id=? AND deleted=0", [
            b.productId,
          ])
        ).length
      )
        throw new ApiError("Device not found.", 404);
      await query(
        "INSERT OR IGNORE INTO favorites(user_id,product_id) VALUES(?,?)",
        [u.id, b.productId],
      );
      return ok({ success: true });
    }
    if (path[0] === "favorites" && path[1] && method === "DELETE") {
      await query("DELETE FROM favorites WHERE user_id=? AND product_id=?", [
        u.id,
        path[1],
      ]);
      return ok({ success: true });
    }
    if (route === "quotes" && method === "POST") {
      await rateLimit(`quotes:${u.id}`, 20);
      const b = await body(req);
      const input = quoteInput.parse(b.input);
      const customer = contact.parse(b.contact);
      const [models, policy, settings] = await Promise.all([
        getDevices(),
        getPolicy(),
        getSettings(),
      ]);
      const model = models.find((x) => x.id === input.modelId);
      const estimate = calculateQuote(input, model, policy);
      if (estimate.eligibility !== "eligible")
        throw new ApiError(
          estimate.reason || "This device needs a manual review.",
        );
      if (b.expectedTotal !== estimate.total)
        throw new ApiError(
          "Pricing changed since your estimate. Refresh the estimate before accepting it.",
          409,
        );
      const id = randomUUID(),
        ref = reference("BUY"),
        now = new Date().toISOString();
      const details = {
        input,
        customer,
        model: model?.name,
        estimate,
        policy,
        sample: !settings.live || estimate.sample,
        shippingInstructions:
          customer.method === "Ship Device"
            ? settings.shipInstructions
            : settings.dropoffInstructions,
        inspectionInstructions: settings.inspectionText,
      };
      await query(
        "INSERT INTO quotes(id,reference,user_id,status,amount,body,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)",
        [
          id,
          ref,
          u.id,
          "Quote Accepted",
          estimate.total,
          JSON.stringify(details),
          now,
          now,
        ],
      );
      await audit(u.id, "quote.accepted", id, { amount: estimate.total });
      return ok({ id, reference: ref, ...details }, 201);
    }
    if (path[0] === "quotes" && path[1] && method === "PATCH") {
      const b = z
        .object({
          action: z.enum([
            "accept-revision",
            "decline-revision",
            "mark-shipped",
          ]),
        })
        .parse(await body(req));
      const tx = await getDb().transaction("write");
      try {
        const q = (
          await tx.execute({
            sql: "SELECT * FROM quotes WHERE id=? AND user_id=?",
            args: [path[1], u.id],
          })
        ).rows[0];
        if (!q) throw new ApiError("Quote not found.", 404);
        let status = "";
        if (b.action === "mark-shipped") {
          if (q.status !== "Awaiting Device")
            throw new ApiError("Wait for shipping instructions.", 409);
          status = "Device In Transit";
        } else {
          if (q.status !== "Revised Offer" || q.revised_amount === null)
            throw new ApiError("There is no revised offer to answer.", 409);
          status =
            b.action === "accept-revision" ? "Offer Accepted" : "Cancelled";
        }
        await tx.execute({
          sql: "UPDATE quotes SET status=?,amount=?,updated_at=? WHERE id=?",
          args: [
            status,
            b.action === "accept-revision" ? q.revised_amount : q.amount,
            new Date().toISOString(),
            path[1],
          ],
        });
        await tx.commit();
      } catch (e) {
        if (!tx.closed) await tx.rollback();
        throw e;
      } finally {
        tx.close();
      }
      await audit(u.id, b.action, path[1]);
      return ok({ success: true });
    }
    if (route === "reviews" && method === "POST") {
      const b = z
        .object({
          productId: z.string(),
          rating: z.number().int().min(1).max(5),
          body: z.string().trim().min(10).max(2000),
        })
        .parse(await body(req));
      const purchase = await query(
        "SELECT o.id FROM orders o JOIN order_items i ON i.order_id=o.id WHERE o.user_id=? AND i.product_id=? AND o.status IN ('Paid','Shipped','Completed')",
        [u.id, b.productId],
      );
      if (!purchase.length)
        throw new ApiError(
          "Reviews are available after a verified purchase.",
          403,
        );
      await query(
        "INSERT INTO reviews(id,product_id,user_id,rating,body,created_at) VALUES(?,?,?,?,?,?)",
        [
          randomUUID(),
          b.productId,
          u.id,
          b.rating,
          b.body,
          new Date().toISOString(),
        ],
      );
      return ok({ success: true });
    }
    if (
      path[0] === "orders" &&
      path[1] &&
      path[2] === "resume" &&
      method === "POST"
    ) {
      await rateLimit(`checkout:${u.id}`, 12);
      const order = (
        await query("SELECT * FROM orders WHERE id=? AND user_id=?", [
          path[1],
          u.id,
        ])
      )[0];
      if (!order) throw new ApiError("Order not found.", 404);
      if (order.status !== "Pending payment")
        throw new ApiError("This order no longer needs payment.", 409);
      const saved = JSON.parse(String(order.body));
      return ok(
        await createCheckout(
          u.id,
          u.email,
          saved.items.map((item: { id: string; quantity: number }) => ({
            id: item.id,
            quantity: item.quantity,
          })),
          saved.promo || "",
          String(order.id),
        ),
      );
    }
    if (route === "checkout" && method === "POST") {
      await rateLimit(`checkout:${u.id}`, 12);
      const b = z
        .object({
          items: z
            .array(
              z.object({
                id: z.string(),
                quantity: z.number().int().min(1).max(20),
              }),
            )
            .min(1)
            .max(30),
          promo: z.string().max(40).default(""),
        })
        .parse(await body(req));
      return ok(await createCheckout(u.id, u.email, b.items, b.promo));
    }
    if (route === "promo" && method === "POST") {
      const b = z
        .object({ code: z.string().trim().max(40) })
        .parse(await body(req));
      const p = (
        await query(
          "SELECT code,percent,expires_at FROM promos WHERE code=? AND active=1",
          [b.code.toUpperCase()],
        )
      )[0];
      if (
        !p ||
        (p.expires_at && String(p.expires_at) < new Date().toISOString())
      )
        throw new ApiError("This promo code is not available.");
      return ok({ code: p.code, percent: p.percent });
    }
    if (path[0] !== "admin")
      throw new ApiError("This endpoint was not found.", 404);
    requireRole(u, true);
    if (route === "admin" && method === "GET") {
      const [
        products,
        devices,
        policy,
        settings,
        quotes,
        orders,
        requests,
        customers,
        payouts,
        promos,
      ] = await Promise.all([
        getProducts(true),
        getDevices(),
        getPolicy(),
        getSettings(),
        query("SELECT * FROM quotes ORDER BY created_at DESC"),
        query("SELECT * FROM orders ORDER BY created_at DESC"),
        query("SELECT * FROM requests ORDER BY created_at DESC"),
        query(
          "SELECT id,name,email,phone,role,created_at FROM users ORDER BY created_at DESC",
        ),
        query("SELECT * FROM payouts ORDER BY created_at DESC"),
        query("SELECT * FROM promos"),
      ]);
      return ok({
        products,
        devices,
        policy,
        settings,
        quotes: quotes.map(mapRecord),
        orders: orders.map(mapRecord),
        requests: requests.map(mapRecord),
        customers,
        payouts,
        promos,
        ready: {
          database: true,
          stripe: Boolean(process.env.STRIPE_SECRET_KEY),
          webhook: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
          origin: Boolean(process.env.APP_URL),
          email: false,
        },
      });
    }
    if (route === "admin/products" && method === "POST") {
      const b = productSchema.parse(await body(req)),
        id = b.id || randomUUID();
      const record = {
        ...b,
        id,
        createdAt: b.createdAt || new Date().toISOString(),
      };
      if (!b.sample && !b.images.some((s) => s.startsWith("/api/images/")))
        throw new ApiError(
          "Upload actual device photos before publishing live inventory.",
        );
      await saveProduct(getDb(), record);
      await audit(u.id, "product.saved", id);
      return ok({ id });
    }
    if (path[1] === "products" && path[2] && method === "DELETE") {
      await archiveProduct(getDb(), path[2]);
      await audit(u.id, "product.archived", path[2]);
      return ok({ success: true });
    }
    if (route === "admin/devices" && method === "POST") {
      const b = deviceSchema.parse(await body(req));
      await query(
        "INSERT INTO devices(id,body) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET body=excluded.body",
        [b.id, JSON.stringify(b)],
      );
      await audit(u.id, "pricing.device", b.id);
      return ok({ success: true });
    }
    if (route === "admin/policy" && method === "POST") {
      const b = policySchema.parse(await body(req));
      await query("UPDATE settings SET value=? WHERE key='policy'", [
        JSON.stringify(b),
      ]);
      await audit(u.id, "pricing.policy", "policy");
      return ok({ success: true });
    }
    if (route === "admin/settings" && method === "POST") {
      const b = settingsSchema.parse(await body(req));
      if (
        b.live &&
        (!process.env.STRIPE_SECRET_KEY ||
          !process.env.STRIPE_WEBHOOK_SECRET ||
          !process.env.APP_URL ||
          !b.supportEmail ||
          !b.privacyText ||
          !b.termsText)
      )
        throw new ApiError(
          "Complete payment setup, support email, privacy terms, and store terms before opening sales.",
        );
      await query("UPDATE settings SET value=? WHERE key='store'", [
        JSON.stringify(b),
      ]);
      await audit(u.id, "store.settings", "store");
      return ok({ success: true });
    }
    if (path[1] === "quotes" && path[2] && method === "PATCH") {
      const b = z
        .object({
          action: z.enum(["status", "inspect-match", "revise", "payout"]),
          status: z.enum(buyStatuses).optional(),
          amount: z.number().int().min(0).max(100000000).optional(),
          reason: z.string().trim().max(3000).optional(),
          method: z
            .enum(["ACH", "PayPal", "Business Check", "Other"])
            .optional(),
          reference: z.string().trim().max(200).optional(),
        })
        .parse(await body(req));
      const tx = await getDb().transaction("write");
      try {
        const q = (
          await tx.execute({
            sql: "SELECT * FROM quotes WHERE id=?",
            args: [path[2]],
          })
        ).rows[0];
        if (!q) throw new ApiError("Quote not found.", 404);
        let status = String(q.status);
        let revised = q.revised_amount,
          reason = q.revision_reason;
        if (b.action === "status") {
          if (!b.status) throw new ApiError("Choose a status.");
          assertTransition(status, b.status);
          if (b.status === "Revised Offer")
            throw new ApiError("Use the inspection revision form.");
          status = b.status;
        }
        if (b.action === "inspect-match") {
          if (status !== "Inspection")
            throw new ApiError("Start inspection first.", 409);
          status = "Offer Accepted";
        }
        if (b.action === "revise") {
          if (status !== "Inspection" || b.amount === undefined || !b.reason)
            throw new ApiError(
              "Revisions require an inspection, amount, and explanation.",
              409,
            );
          status = "Revised Offer";
          revised = b.amount;
          reason = b.reason;
        }
        if (b.action === "payout") {
          if (status !== "Payment Processing" || !b.method || !b.reference)
            throw new ApiError(
              "A payment method and external payment reference are required after processing.",
              409,
            );
          if (JSON.parse(String(q.body)).sample)
            throw new ApiError("A sample quote cannot receive a payout.");
          await tx.execute({
            sql: "INSERT INTO payouts(id,quote_id,method,reference,amount,created_at) VALUES(?,?,?,?,?,?)",
            args: [
              randomUUID(),
              path[2],
              b.method,
              b.reference,
              q.amount,
              new Date().toISOString(),
            ],
          });
          status = "Paid";
        }
        await tx.execute({
          sql: "UPDATE quotes SET status=?,revised_amount=?,revision_reason=?,updated_at=? WHERE id=?",
          args: [status, revised, reason, new Date().toISOString(), path[2]],
        });
        await tx.commit();
      } catch (e) {
        if (!tx.closed) await tx.rollback();
        throw e;
      } finally {
        tx.close();
      }
      await audit(u.id, `quote.${b.action}`, path[2], b);
      return ok({ success: true });
    }
    if (path[1] === "orders" && path[2] && method === "PATCH") {
      const b = z
        .object({
          status: z.enum(["Shipped", "Completed"]).optional(),
          tracking: z.string().max(300).optional(),
          action: z.literal("reconcile").optional(),
        })
        .parse(await body(req));
      const o = (await query("SELECT * FROM orders WHERE id=?", [path[2]]))[0];
      if (!o) throw new ApiError("Order not found.", 404);
      if (b.action === "reconcile") {
        await reconcileOrder(o);
      } else {
        if (!(
          (o.status === "Paid" && b.status === "Shipped") ||
          (o.status === "Shipped" && b.status === "Completed")
        ))
          throw new ApiError(
            "Orders must be paid before shipment and shipped before completion.",
            409,
          );
        if (b.status === "Shipped" && !b.tracking)
          throw new ApiError("Enter a shipment tracking reference.");
        await query(
          "UPDATE orders SET status=?,body=?,updated_at=? WHERE id=?",
          [
            b.status!,
            JSON.stringify({
              ...JSON.parse(String(o.body)),
              tracking: b.tracking || JSON.parse(String(o.body)).tracking,
            }),
            new Date().toISOString(),
            path[2],
          ],
        );
      }
      await audit(u.id, "order.updated", path[2], b);
      return ok({ success: true });
    }
    if (path[1] === "requests" && path[2] && method === "PATCH") {
      const b = z
        .object({
          status: z.enum([
            "New",
            "In review",
            "Contacted",
            "Approved",
            "Completed",
            "Closed",
          ]),
        })
        .parse(await body(req));
      await query("UPDATE requests SET status=? WHERE id=?", [
        b.status,
        path[2],
      ]);
      await audit(u.id, "request.updated", path[2], b);
      return ok({ success: true });
    }
    if (route === "admin/promos" && method === "POST") {
      const b = z
        .object({
          code: z
            .string()
            .trim()
            .min(2)
            .max(30)
            .regex(/^[A-Za-z0-9_-]+$/),
          percent: z.number().int().min(1).max(90),
          active: z.boolean(),
          expiresAt: z.string().optional(),
        })
        .parse(await body(req));
      await query(
        "INSERT INTO promos(code,percent,active,expires_at) VALUES(?,?,?,?) ON CONFLICT(code) DO UPDATE SET percent=excluded.percent,active=excluded.active,expires_at=excluded.expires_at",
        [
          b.code.toUpperCase(),
          b.percent,
          b.active ? 1 : 0,
          b.expiresAt || null,
        ],
      );
      await audit(u.id, "promo.saved", b.code);
      return ok({ success: true });
    }
    throw new ApiError("This endpoint was not found.", 404);
  } catch (e) {
    if (e instanceof z.ZodError)
      return ok(
        { error: e.issues[0]?.message || "Please check the form." },
        400,
      );
    if (e instanceof ApiError) return ok({ error: e.message }, e.status);
    console.error(
      "Marketplace request failed:",
      e instanceof Error ? e.message : "Unknown error",
    );
    return ok(
      {
        error:
          "We could not save that request. Please try again or contact support.",
      },
      500,
    );
  }
}
export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const DELETE = handle;
