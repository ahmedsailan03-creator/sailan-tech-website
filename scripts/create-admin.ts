import { randomUUID } from "node:crypto";
import { getDb, initializeDatabase } from "../lib/database";
import { hashPassword } from "../lib/security";
import { credentials } from "../lib/validation";
async function main() {
  const input = credentials.parse({
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    name: "Store owner",
  });
  await initializeDatabase();
  const existing = await getDb().execute({
    sql: "SELECT id FROM users WHERE email=?",
    args: [input.email],
  });
  if (existing.rows.length)
    throw new Error(
      "Account already exists. Use an explicit operator role update after verifying ownership.",
    );
  await getDb().execute({
    sql: "INSERT INTO users(id,name,email,password,role,phone,created_at) VALUES(?,?,?,?,?,?,?)",
    args: [
      randomUUID(),
      input.name!,
      input.email,
      await hashPassword(input.password),
      "admin",
      "",
      new Date().toISOString(),
    ],
  });
  getDb().close();
  console.log("Admin account created. Password has not been printed.");
}
main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
