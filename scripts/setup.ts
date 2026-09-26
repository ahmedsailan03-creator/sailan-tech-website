import { initializeDatabase, getDb } from "../lib/database";
async function main() {
  await initializeDatabase();
  getDb().close();
  console.log(
    "Database schema ready. Sample catalog is not purchasable. No admin password was created.",
  );
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
