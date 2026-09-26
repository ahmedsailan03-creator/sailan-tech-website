import { randomBytes, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { query, getDb, databaseConfigured } from "./database";
import { ApiError, tokenHash } from "./security";
import type { User } from "./types";
export const COOKIE = "sailan_session";
export async function currentUser(): Promise<User | null> {
  if (!databaseConfigured()) return null;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const r = await query(
    "SELECT u.id,u.name,u.email,u.role,u.phone,u.created_at FROM sessions s JOIN users u ON s.user_id=u.id WHERE s.token=? AND s.expires_at>?",
    [tokenHash(token), Date.now()],
  );
  return r[0]
    ? {
        id: String(r[0].id),
        name: String(r[0].name),
        email: String(r[0].email),
        role: r[0].role as User["role"],
        phone: String(r[0].phone),
        createdAt: String(r[0].created_at),
      }
    : null;
}
export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  await query("INSERT INTO sessions(token,user_id,expires_at) VALUES(?,?,?)", [
    tokenHash(token),
    userId,
    Date.now() + 7 * 86400000,
  ]);
  return token;
}
export async function rateLimit(
  key: string,
  limit = 20,
  windowMs = 15 * 60000,
) {
  const now = Date.now();
  const r = await getDb().execute({
    sql: `INSERT INTO rate_limits(key,count,reset_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN reset_at<? THEN 1 ELSE count+1 END,reset_at=CASE WHEN reset_at<? THEN excluded.reset_at ELSE reset_at END RETURNING count`,
    args: [key, now + windowMs, now, now],
  });
  if (Number(r.rows[0].count) > limit)
    throw new ApiError("Too many attempts. Please try again later.", 429);
}
export async function audit(
  actor: string,
  action: string,
  target: string,
  body: unknown = {},
) {
  await query(
    "INSERT INTO audit(id,actor,action,target,body,created_at) VALUES(?,?,?,?,?,?)",
    [
      randomUUID(),
      actor,
      action,
      target,
      JSON.stringify(body),
      new Date().toISOString(),
    ],
  );
}
