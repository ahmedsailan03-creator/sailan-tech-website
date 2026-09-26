import test from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@libsql/client";
import { initializeDatabase } from "../lib/database";
import { reserveOrder, finishOrder, loadResumeOrder } from "../lib/commerce";
import { saveProduct, archiveProduct } from "../lib/inventory";
import { defaultSettings, sampleProducts } from "../lib/catalog";
async function fixture() {
  const db = createClient({ url: ":memory:" });
  await initializeDatabase(db, false);
  await db.execute(
    "INSERT INTO users(id,name,email,password,role,created_at) VALUES('u','Test','test@example.invalid','unused','customer','2026-01-01')",
  );
  const p = { ...sampleProducts[0], sample: false };
  await db.execute({
    sql: "INSERT INTO products(id,slug,body,price,quantity,status,sample) VALUES(?,?,?,?,?,?,0)",
    args: ["real", p.slug, JSON.stringify(p), 10000, 1, "Available"],
  });
  return db;
}
test("server pricing overrides submitted metadata and same cart reuses reservation", async () => {
  const db = await fixture();
  try {
    const a = await reserveOrder(
      db,
      "u",
      [{ id: "real", quantity: 1 }],
      defaultSettings,
    );
    assert.equal(a.subtotal, 10000);
    const b = await reserveOrder(
      db,
      "u",
      [{ id: "real", quantity: 1 }],
      defaultSettings,
    );
    assert.equal(a.id, b.id);
    assert.equal(
      Number(
        (await db.execute("SELECT quantity FROM products WHERE id='real'"))
          .rows[0].quantity,
      ),
      0,
    );
  } finally {
    db.close();
  }
});
test("stock reservation cannot oversell and failed order is rolled back", async () => {
  const db = await fixture();
  try {
    await assert.rejects(
      reserveOrder(db, "u", [{ id: "real", quantity: 2 }], defaultSettings),
    );
    assert.equal(
      Number((await db.execute("SELECT count(*) n FROM orders")).rows[0].n),
      0,
    );
    assert.equal(
      Number(
        (await db.execute("SELECT quantity FROM products")).rows[0].quantity,
      ),
      1,
    );
  } finally {
    db.close();
  }
});
test("duplicate payment webhook fulfills exactly once", async () => {
  const db = await fixture();
  try {
    const a = await reserveOrder(
      db,
      "u",
      [{ id: "real", quantity: 1 }],
      defaultSettings,
    );
    assert.equal(await finishOrder(db, a.id, "evt_1", "paid"), true);
    assert.equal(await finishOrder(db, a.id, "evt_1", "paid"), false);
    await finishOrder(db, a.id, "evt_2", "paid");
    const p = (await db.execute("SELECT * FROM products")).rows[0];
    assert.equal(JSON.parse(String(p.body)).soldCount, 1);
    assert.equal(p.status, "Sold");
  } finally {
    db.close();
  }
});
test("expired checkout releases stock only once", async () => {
  const db = await fixture();
  try {
    const a = await reserveOrder(
      db,
      "u",
      [{ id: "real", quantity: 1 }],
      defaultSettings,
    );
    await finishOrder(db, a.id, "evt_e", "expired");
    await finishOrder(db, a.id, "evt_e2", "expired");
    assert.equal(
      Number(
        (await db.execute("SELECT quantity FROM products")).rows[0].quantity,
      ),
      1,
    );
  } finally {
    db.close();
  }
});
test("sample inventory cannot be purchased", async () => {
  const db = await fixture();
  try {
    await db.execute("UPDATE products SET sample=1");
    await assert.rejects(
      reserveOrder(db, "u", [{ id: "real", quantity: 1 }], defaultSettings),
    );
  } finally {
    db.close();
  }
});
test("a retry keeps the original checkout expiry and fulfillment details", async () => {
  const db = await fixture();
  try {
    const a = await reserveOrder(
      db,
      "u",
      [{ id: "real", quantity: 1 }],
      defaultSettings,
    );
    const b = await reserveOrder(
      db,
      "u",
      [{ id: "real", quantity: 1 }],
      defaultSettings,
    );
    assert.equal(typeof a.checkoutExpires, "number");
    assert.equal(a.checkoutExpires, b.checkoutExpires);
    await finishOrder(db, a.id, "evt_address", "paid", 11500, {
      shippingAddress: { name: "Test buyer" },
    });
    assert.equal(
      JSON.parse(
        String((await db.execute("SELECT body FROM orders")).rows[0].body),
      ).shippingAddress.name,
      "Test buyer",
    );
  } finally {
    db.close();
  }
});
test("inventory edits and archiving are blocked during pending checkout", async () => {
  const db = await fixture();
  try {
    await reserveOrder(db, "u", [{ id: "real", quantity: 1 }], defaultSettings);
    await assert.rejects(
      saveProduct(db, { ...sampleProducts[0], id: "real", sample: false }),
      /pending checkout/,
    );
    await assert.rejects(archiveProduct(db, "real"), /pending checkout/);
    assert.equal(
      Number(
        (await db.execute("SELECT quantity FROM products")).rows[0].quantity,
      ),
      0,
    );
  } finally {
    db.close();
  }
});
test("paying one reservation and expiring another restores sellable inventory", async () => {
  const db = await fixture();
  try {
    await db.execute("UPDATE products SET quantity=2");
    const a = await reserveOrder(
      db,
      "u",
      [{ id: "real", quantity: 1 }],
      defaultSettings,
    );
    await db.execute({
      sql: "UPDATE orders SET body=? WHERE id=?",
      args: [JSON.stringify({ ...a, signature: "different" }), a.id],
    });
    const b = await reserveOrder(
      db,
      "u",
      [{ id: "real", quantity: 1 }],
      defaultSettings,
    );
    await finishOrder(db, a.id, "mixed-paid", "paid");
    await finishOrder(db, b.id, "mixed-expired", "expired");
    const p = (await db.execute("SELECT quantity,status FROM products"))
      .rows[0];
    assert.equal(p.quantity, 1);
    assert.equal(p.status, "Available");
    await reserveOrder(db, "u", [{ id: "real", quantity: 1 }], defaultSettings);
  } finally {
    db.close();
  }
});
test("a stale admin editor cannot restore inventory after a completed sale", async () => {
  const db = await fixture();
  try {
    const old = {
      ...sampleProducts[0],
      id: "real",
      sample: false,
      quantity: 1,
      revision: 0,
    };
    const a = await reserveOrder(
      db,
      "u",
      [{ id: "real", quantity: 1 }],
      defaultSettings,
    );
    await finishOrder(db, a.id, "editor-paid", "paid");
    await assert.rejects(saveProduct(db, old), /changed/);
    assert.equal(
      (await db.execute("SELECT quantity FROM products")).rows[0].quantity,
      0,
    );
  } finally {
    db.close();
  }
});
test("resuming after a missed paid webhook returns the original paid order", async () => {
  const db = await fixture();
  try {
    await db.execute("UPDATE products SET quantity=2");
    const a = await reserveOrder(
      db,
      "u",
      [{ id: "real", quantity: 1 }],
      defaultSettings,
    );
    await db.execute({
      sql: "UPDATE orders SET expires_at=? WHERE id=?",
      args: [Date.now() - 1, a.id],
    });
    const resumed = await loadResumeOrder(db, "u", a.id, async (order) => {
      await finishOrder(db, String(order.id), "resume-paid", "paid");
    });
    assert.equal(resumed.status, "Paid");
    assert.equal(resumed.id, a.id);
    assert.equal(
      (await db.execute("SELECT count(*) n FROM orders")).rows[0].n,
      1,
    );
    assert.equal(
      (await db.execute("SELECT quantity FROM products")).rows[0].quantity,
      1,
    );
    await assert.rejects(
      loadResumeOrder(db, "another-user", a.id, async () => {
        throw new Error("must not query provider");
      }),
      /not found/,
    );
  } finally {
    db.close();
  }
});
