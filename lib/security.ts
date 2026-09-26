import {
  randomBytes,
  scrypt as rawScrypt,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { promisify } from "node:util";
import type { User, BuyStatus } from "./types";
import { transitions } from "./flow";
const scrypt = promisify(rawScrypt);
export class ApiError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${hash.toString("hex")}`;
}
export async function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash || hash.length !== 128) return false;
  const key = (await scrypt(password, salt, 64)) as Buffer;
  return timingSafeEqual(Buffer.from(hash, "hex"), key);
}
export const tokenHash = (v: string) =>
  createHash("sha256").update(v).digest("hex");
export function requireRole(user: User | null, admin = false): User {
  if (!user) throw new ApiError("Sign in to continue.", 401);
  if (admin && user.role !== "admin")
    throw new ApiError("Administrator access is required.", 403);
  return user;
}
export function assertOwner(user: User, owner: string) {
  if (user.id !== owner && user.role !== "admin")
    throw new ApiError("This record was not found.", 404);
}
export function assertTransition(from: string, to: string) {
  if (!transitions[from as BuyStatus]?.includes(to as BuyStatus))
    throw new ApiError(
      `Cannot change ${from} to ${to}. Complete the required step first.`,
      409,
    );
}
export function validateCart(lines: { id: string; quantity: number }[]) {
  if (!Array.isArray(lines) || !lines.length || lines.length > 30)
    throw new ApiError("Your bag must contain 1–30 items.");
  const ids = new Set<string>();
  for (const l of lines) {
    if (
      !l.id ||
      ids.has(l.id) ||
      !Number.isInteger(l.quantity) ||
      l.quantity < 1 ||
      l.quantity > 20
    )
      throw new ApiError("Invalid item quantity or duplicate item.");
    ids.add(l.id);
  }
  return lines;
}
export function checkOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin)
    throw new ApiError(
      "Please submit this request from the Sailan Tech website.",
      403,
    );
  let host = "";
  try {
    host = new URL(origin).host;
  } catch {}
  if (host !== req.headers.get("host"))
    throw new ApiError("This request origin is not allowed.", 403);
}
