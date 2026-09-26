import { createClient, type Client, type InValue } from "@libsql/client";
import { mkdirSync } from "node:fs";
import {
  sampleProducts,
  sampleDevices,
  defaultPolicy,
  defaultSettings,
  publicProduct,
} from "./catalog";
import type {
  DeviceModel,
  PricingPolicy,
  PrivateProduct,
  StoreSettings,
} from "./types";

let db: Client | undefined;
export const databaseConfigured = () =>
  Boolean(process.env.TURSO_DATABASE_URL) || !process.env.VERCEL;
export function getDb() {
  if (!databaseConfigured())
    throw new Error(
      "The store is in preview. Accounts and submissions open after setup is complete.",
    );
  if (!db) {
    if (!process.env.TURSO_DATABASE_URL) mkdirSync("data", { recursive: true });
    db = createClient({
      url: process.env.TURSO_DATABASE_URL || "file:data/marketplace.db",
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return db;
}
export const schema = [
  `CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT NOT NULL UNIQUE,password TEXT NOT NULL,role TEXT NOT NULL DEFAULT 'customer' CHECK(role IN ('customer','admin')),phone TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,expires_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS products(id TEXT PRIMARY KEY,slug TEXT NOT NULL UNIQUE,body TEXT NOT NULL,price INTEGER NOT NULL CHECK(price>=0),quantity INTEGER NOT NULL CHECK(quantity>=0),status TEXT NOT NULL,sample INTEGER NOT NULL DEFAULT 0,deleted INTEGER NOT NULL DEFAULT 0)`,
  `CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY,value TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS devices(id TEXT PRIMARY KEY,body TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS quotes(id TEXT PRIMARY KEY,reference TEXT NOT NULL UNIQUE,user_id TEXT NOT NULL REFERENCES users(id),status TEXT NOT NULL,amount INTEGER NOT NULL CHECK(amount>=0),revised_amount INTEGER,revision_reason TEXT NOT NULL DEFAULT '',body TEXT NOT NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS quotes_owner ON quotes(user_id)`,
  `CREATE TABLE IF NOT EXISTS orders(id TEXT PRIMARY KEY,reference TEXT NOT NULL UNIQUE,user_id TEXT NOT NULL REFERENCES users(id),status TEXT NOT NULL,total INTEGER NOT NULL,body TEXT NOT NULL,stripe_session TEXT UNIQUE,created_at TEXT NOT NULL,updated_at TEXT NOT NULL,expires_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS order_items(order_id TEXT NOT NULL REFERENCES orders(id),product_id TEXT NOT NULL REFERENCES products(id),quantity INTEGER NOT NULL CHECK(quantity>0),price INTEGER NOT NULL CHECK(price>=0),PRIMARY KEY(order_id,product_id))`,
  `CREATE TABLE IF NOT EXISTS webhook_events(id TEXT PRIMARY KEY,created_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS requests(id TEXT PRIMARY KEY,reference TEXT NOT NULL UNIQUE,user_id TEXT REFERENCES users(id),kind TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'New',body TEXT NOT NULL,created_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS favorites(user_id TEXT NOT NULL REFERENCES users(id),product_id TEXT NOT NULL REFERENCES products(id),PRIMARY KEY(user_id,product_id))`,
  `CREATE TABLE IF NOT EXISTS addresses(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),body TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS reviews(id TEXT PRIMARY KEY,product_id TEXT NOT NULL REFERENCES products(id),user_id TEXT NOT NULL REFERENCES users(id),rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),body TEXT NOT NULL,created_at TEXT NOT NULL,UNIQUE(product_id,user_id))`,
  `CREATE TABLE IF NOT EXISTS uploads(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),kind TEXT NOT NULL,mime TEXT NOT NULL,name TEXT NOT NULL,bytes BLOB NOT NULL,created_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS payouts(id TEXT PRIMARY KEY,quote_id TEXT NOT NULL REFERENCES quotes(id),method TEXT NOT NULL,reference TEXT NOT NULL,amount INTEGER NOT NULL CHECK(amount>=0),created_at TEXT NOT NULL,UNIQUE(quote_id))`,
  `CREATE TABLE IF NOT EXISTS promos(code TEXT PRIMARY KEY,percent INTEGER NOT NULL CHECK(percent BETWEEN 0 AND 100),active INTEGER NOT NULL DEFAULT 1,expires_at TEXT)`,
  `CREATE TABLE IF NOT EXISTS audit(id TEXT PRIMARY KEY,actor TEXT NOT NULL,action TEXT NOT NULL,target TEXT NOT NULL,body TEXT NOT NULL,created_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS rate_limits(key TEXT PRIMARY KEY,count INTEGER NOT NULL,reset_at INTEGER NOT NULL)`,
];
export async function initializeDatabase(
  client: Client = getDb(),
  seed = true,
) {
  await client.execute("PRAGMA foreign_keys=ON");
  await client.batch(schema, "write");
  const columns = (await client.execute("PRAGMA table_info(products)")).rows;
  if (!columns.some((c) => c.name === "revision"))
    await client.execute(
      "ALTER TABLE products ADD COLUMN revision INTEGER NOT NULL DEFAULT 0",
    );
  await client.batch(
    [
      {
        sql: "INSERT OR IGNORE INTO settings(key,value) VALUES('policy',?)",
        args: [JSON.stringify(defaultPolicy)],
      },
      {
        sql: "INSERT OR IGNORE INTO settings(key,value) VALUES('store',?)",
        args: [JSON.stringify(defaultSettings)],
      },
    ],
    "write",
  );
  if (seed) {
    await client.batch(
      sampleProducts.map((p) => ({
        sql: "INSERT OR IGNORE INTO products(id,slug,body,price,quantity,status,sample) VALUES(?,?,?,?,?,?,1)",
        args: [p.id, p.slug, JSON.stringify(p), p.price, p.quantity, p.status],
      })),
      "write",
    );
    await client.batch(
      sampleDevices.map((p) => ({
        sql: "INSERT OR IGNORE INTO devices(id,body) VALUES(?,?)",
        args: [p.id, JSON.stringify(p)],
      })),
      "write",
    );
  }
}
export async function query(sql: string, args: InValue[] = []) {
  return (await getDb().execute({ sql, args })).rows;
}
export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  if (!databaseConfigured()) return fallback;
  const rows = await query("SELECT value FROM settings WHERE key=?", [key]);
  return rows[0] ? (JSON.parse(String(rows[0].value)) as T) : fallback;
}
export const getSettings = () =>
  getSetting<StoreSettings>("store", defaultSettings);
export const getPolicy = () =>
  getSetting<PricingPolicy>("policy", defaultPolicy);
export async function getDevices(): Promise<DeviceModel[]> {
  if (!databaseConfigured()) return sampleDevices;
  return (await query("SELECT body FROM devices")).map((r) =>
    JSON.parse(String(r.body)),
  );
}
export async function getProducts(privateFields = false) {
  const products: PrivateProduct[] = !databaseConfigured()
    ? sampleProducts
    : (await query("SELECT * FROM products WHERE deleted=0")).map((r) => ({
        ...JSON.parse(String(r.body)),
        price: Number(r.price),
        quantity: Number(r.quantity),
        status: String(r.status),
        sample: Boolean(r.sample),
        revision: Number(r.revision),
      }));
  return privateFields ? products : products.map(publicProduct);
}
