import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { spawn, type ChildProcess } from "node:child_process";
import { createClient, type Client } from "@libsql/client";
import { initializeDatabase } from "../lib/database";
import { hashPassword } from "../lib/security";
import { sampleProducts } from "../lib/catalog";

const origin = "http://127.0.0.1:4499";
let dir: string, db: Client, server: ChildProcess;
const password = randomBytes(24).toString("base64url");
async function request(
  path: string,
  method = "GET",
  body?: unknown,
  cookie = "",
) {
  const res = await fetch(origin + path, {
    method,
    headers: {
      origin,
      ...(cookie ? { cookie } : {}),
      ...(body ? { "content-type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  return {
    status: res.status,
    data,
    cookie: res.headers.get("set-cookie")?.split(";")[0] || "",
    headers: res.headers,
  };
}
before(async () => {
  dir = await mkdtemp(join(tmpdir(), "sailan-integration-"));
  const url = `file:${join(dir, "test.db")}`;
  db = createClient({ url });
  await initializeDatabase(db);
  await db.execute({
    sql: "INSERT INTO users(id,name,email,password,role,created_at) VALUES(?,?,?,?,?,?)",
    args: [
      "admin",
      "Test operator",
      "operator@example.invalid",
      await hashPassword(password),
      "admin",
      new Date().toISOString(),
    ],
  });
  server = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "start",
      "--hostname",
      "127.0.0.1",
      "--port",
      "4499",
    ],
    {
      env: {
        ...process.env,
        TURSO_DATABASE_URL: url,
        TURSO_AUTH_TOKEN: "",
        VERCEL: "",
        STRIPE_SECRET_KEY: "",
        STRIPE_WEBHOOK_SECRET: "",
        NODE_ENV: "production",
      },
      stdio: "ignore",
    },
  );
  let ready = false;
  for (let n = 0; n < 50; n++) {
    try {
      const r = await fetch(origin + "/api/me");
      if (r.ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  assert.ok(ready, "isolated production server starts");
});
after(async () => {
  server?.kill("SIGTERM");
  if (server && server.exitCode === null)
    await new Promise<void>((r) => server.once("exit", () => r()));
  db?.close();
  if (dir) await rm(dir, { recursive: true, force: true });
});

test("accounts, ownership, quote inspection, admin CRUD and submissions work over HTTP", async (t) => {
  let customer = "",
    other = "",
    admin = "",
    quoteId = "";
  const input = {
    category: "iPhone",
    brand: "Apple",
    modelId: "iphone-15-pro-max",
    specs: { storage: "256GB" },
    condition: {
      power: "Yes",
      screen: "No",
      touch: "Yes",
      biometrics: "Yes",
      cosmetics: "None",
      back: "No",
      liquid: "No",
      carrier: "Unlocked",
      activation: "Yes",
      battery: "90–100%",
    },
    accessories: [],
  };
  await t.test(
    "registration cannot set its own admin role; anonymous access fails",
    async () => {
      assert.equal((await request("/api/admin")).status, 401);
      const a = await request("/api/auth/register", "POST", {
        name: "Test buyer",
        email: "buyer@example.invalid",
        password,
        role: "admin",
      });
      assert.equal(a.status, 200);
      customer = a.cookie;
      assert.match(a.headers.get("set-cookie") || "", /HttpOnly/i);
      assert.equal(
        (await request("/api/me", "GET", undefined, customer)).data.user.role,
        "customer",
      );
      const b = await request("/api/auth/register", "POST", {
        name: "Other buyer",
        email: "other@example.invalid",
        password,
      });
      other = b.cookie;
      assert.equal(
        (await request("/api/admin", "GET", undefined, customer)).status,
        403,
      );
      assert.equal(
        (
          await request(
            "/api/admin/products",
            "POST",
            sampleProducts[0],
            customer,
          )
        ).status,
        403,
      );
      const c = await request("/api/auth/login", "POST", {
        email: "operator@example.invalid",
        password,
      });
      assert.equal(c.status, 200);
      admin = c.cookie;
      assert.equal(
        (await request("/api/admin", "GET", undefined, admin)).status,
        200,
      );
    },
  );
  await t.test(
    "server estimate, price-change check and owner isolation",
    async () => {
      const q = await request("/api/quote", "POST", input);
      assert.equal(q.data.estimate.total, 52000);
      const contact = {
        name: "Test buyer",
        email: "buyer@example.invalid",
        phone: "5550101234",
        address: "123 Example Street, Test City, MI 00000",
        serial: "TEST-DEVICE-ONLY",
        method: "Ship Device",
        consent: true,
      };
      assert.equal(
        (
          await request(
            "/api/quotes",
            "POST",
            { input, contact, expectedTotal: 1 },
            customer,
          )
        ).status,
        409,
      );
      const a = await request(
        "/api/quotes",
        "POST",
        { input, contact, expectedTotal: 52000 },
        customer,
      );
      assert.equal(a.status, 201);
      quoteId = a.data.id;
      assert.equal(a.data.sample, true);
      assert.equal(
        (
          await request(
            `/api/quotes/${quoteId}`,
            "PATCH",
            { action: "mark-shipped" },
            other,
          )
        ).status,
        404,
      );
      assert.equal(
        (await request("/api/account", "GET", undefined, other)).data.quotes
          .length,
        0,
      );
    },
  );
  await t.test(
    "revised offers require customer acceptance and sample payouts are blocked",
    async () => {
      for (const status of ["Awaiting Device", "Device Received", "Inspection"])
        assert.equal(
          (
            await request(
              `/api/admin/quotes/${quoteId}`,
              "PATCH",
              { action: "status", status },
              admin,
            )
          ).status,
          200,
        );
      assert.equal(
        (
          await request(
            `/api/admin/quotes/${quoteId}`,
            "PATCH",
            {
              action: "revise",
              amount: 38000,
              reason: "Inspection test: battery condition differs",
            },
            admin,
          )
        ).status,
        200,
      );
      assert.equal(
        (
          await request(
            `/api/admin/quotes/${quoteId}`,
            "PATCH",
            { action: "status", status: "Offer Accepted" },
            admin,
          )
        ).status,
        409,
      );
      assert.equal(
        (
          await request(
            `/api/quotes/${quoteId}`,
            "PATCH",
            { action: "accept-revision" },
            other,
          )
        ).status,
        404,
      );
      assert.equal(
        (
          await request(
            `/api/quotes/${quoteId}`,
            "PATCH",
            { action: "accept-revision" },
            customer,
          )
        ).status,
        200,
      );
      const q = (await request("/api/account", "GET", undefined, customer)).data
        .quotes[0];
      assert.equal(q.amount, 38000);
      assert.equal(q.status, "Offer Accepted");
      await request(
        `/api/admin/quotes/${quoteId}`,
        "PATCH",
        { action: "status", status: "Payment Processing" },
        admin,
      );
      assert.equal(
        (
          await request(
            `/api/admin/quotes/${quoteId}`,
            "PATCH",
            { action: "payout", method: "Other", reference: "TEST-NO-PAYMENT" },
            admin,
          )
        ).status,
        400,
      );
    },
  );
  await t.test(
    "addresses and favorites persist only for their owner",
    async () => {
      const address = {
        name: "Test buyer",
        line1: "123 Example Street",
        line2: "",
        city: "Test City",
        state: "MI",
        postalCode: "00000",
        country: "US",
      };
      const a = await request("/api/addresses", "POST", address, customer);
      assert.equal(a.status, 200);
      await request(`/api/addresses/${a.data.id}`, "DELETE", undefined, other);
      await request(
        "/api/favorites",
        "POST",
        { productId: "sample-1" },
        customer,
      );
      const own = (await request("/api/account", "GET", undefined, customer))
        .data;
      assert.equal(own.addresses.length, 1);
      assert.deepEqual(own.favorites, ["sample-1"]);
      assert.equal(
        (await request("/api/account", "GET", undefined, other)).data.addresses
          .length,
        0,
      );
    },
  );
  await t.test(
    "repair and wholesale submissions are stored with references",
    async () => {
      const contact = {
        name: "Test buyer",
        email: "buyer@example.invalid",
        phone: "5550101234",
        message: "Test workflow only; no service requested.",
        consent: true,
      };
      const repair = await request(
        "/api/requests",
        "POST",
        { ...contact, kind: "repair", device: "iPhone", service: "Screen" },
        customer,
      );
      assert.equal(repair.status, 201);
      assert.match(repair.data.reference, /^ST-HELP-/);
      const wholesale = await request(
        "/api/requests",
        "POST",
        {
          ...contact,
          kind: "wholesale",
          businessName: "Example Test Business",
          businessType: "Reseller",
          monthlyVolume: "10–25",
          productsInterested: ["Phones"],
        },
        customer,
      );
      assert.equal(wholesale.status, 201);
      assert.equal(
        (await request("/api/account", "GET", undefined, customer)).data
          .requests.length,
        2,
      );
      assert.equal(
        (await request("/api/account", "GET", undefined, other)).data.requests
          .length,
        0,
      );
    },
  );
  await t.test(
    "private certificates require ownership and images require admin",
    async () => {
      const form = new FormData();
      form.set("kind", "certificate");
      form.set(
        "file",
        new File(["%PDF-1.7\nTest fixture only"], "test.pdf", {
          type: "application/pdf",
        }),
      );
      const result = await fetch(origin + "/api/uploads", {
        method: "POST",
        headers: { origin, cookie: customer },
        body: form,
      });
      assert.equal(result.status, 201);
      const file = await result.json();
      assert.equal(
        (await fetch(origin + file.url, { headers: { cookie: other } })).status,
        404,
      );
      assert.equal(
        (await fetch(origin + file.url, { headers: { cookie: customer } }))
          .status,
        200,
      );
      form.set("kind", "image");
      assert.equal(
        (
          await fetch(origin + "/api/uploads", {
            method: "POST",
            headers: { origin, cookie: customer },
            body: form,
          })
        ).status,
        403,
      );
    },
  );
  await t.test(
    "admin product edits are visible and private fields stay private",
    async () => {
      const p = {
        ...sampleProducts[0],
        id: "qa-product",
        slug: "qa-product",
        title: "QA example device",
        cost: 12345,
        serial: "SECRET-TEST-SERIAL",
        imei: "SECRET-TEST-IMEI",
        supplier: "PRIVATE-TEST-SUPPLIER",
      };
      assert.equal(
        (await request("/api/admin/products", "POST", p, admin)).status,
        200,
      );
      const item = (await request("/api/catalog")).data.products.find(
        (p: { id: string }) => p.id === "qa-product",
      );
      assert.equal(item.title, p.title);
      assert.equal(item.cost, undefined);
      assert.equal(item.serial, undefined);
      assert.equal(item.imei, undefined);
      assert.equal(item.supplier, undefined);
      assert.equal(
        (
          await request(
            "/api/admin/products/qa-product",
            "DELETE",
            undefined,
            admin,
          )
        ).status,
        200,
      );
      assert.equal(
        (await request("/api/catalog")).data.products.some(
          (p: { id: string }) => p.id === "qa-product",
        ),
        false,
      );
    },
  );
  await t.test(
    "checkout, store launch and unverified reviews cannot bypass gates",
    async () => {
      assert.equal(
        (
          await request(
            "/api/checkout",
            "POST",
            { items: [{ id: "sample-1", quantity: 1 }] },
            customer,
          )
        ).status,
        503,
      );
      assert.equal(
        (
          await request(
            "/api/reviews",
            "POST",
            {
              productId: "sample-1",
              rating: 5,
              body: "This should never become a public review.",
            },
            customer,
          )
        ).status,
        403,
      );
      const state = (await request("/api/admin", "GET", undefined, admin)).data;
      assert.equal(
        (
          await request(
            "/api/admin/settings",
            "POST",
            { ...state.settings, live: true },
            admin,
          )
        ).status,
        400,
      );
      const cross = await fetch(origin + "/api/profile", {
        method: "PATCH",
        headers: {
          origin: "https://example.invalid",
          cookie: customer,
          "content-type": "application/json",
        },
        body: JSON.stringify({ name: "Changed", phone: "" }),
      });
      assert.equal(cross.status, 403);
    },
  );
  await t.test("logout revokes the database session", async () => {
    assert.equal(
      (await request("/api/auth/logout", "POST", {}, customer)).status,
      200,
    );
    assert.equal(
      (await request("/api/account", "GET", undefined, customer)).status,
      401,
    );
  });
});
