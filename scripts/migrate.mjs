// Create or update the database tables and seed the default data
// (platform playbooks and subscription plans).
//
//   npm run db:migrate
//
// Safe to run any number of times: missing tables/columns are added, existing
// data is never changed. The app does the same automatically on its first
// database query; running it at deploy time just surfaces problems early.
// Reads MySQL settings from .env.local (same variables as the app).
try { process.loadEnvFile(".env.local"); } catch { /* fall back to the shell environment */ }

const { query, default: database } = await import("../src/lib/db.js");

try {
  // Any query runs the schema setup first
  const tables = await query("SELECT TABLE_NAME AS name FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() ORDER BY TABLE_NAME");
  const [{ playbooks }] = await query("SELECT COUNT(*) AS playbooks FROM playbooks WHERE organization_id IS NULL");
  const [{ plans }] = await query("SELECT COUNT(*) AS plans FROM plans");
  console.log(`Database ready: ${tables.length} tables (${tables.map((table) => table.name).join(", ")}).`);
  console.log(`Seed data: ${playbooks} platform playbooks, ${plans} plans.`);
} catch (error) {
  console.error(`Migration failed: ${error.message}`);
  console.error("Check MYSQL_HOST / MYSQL_DATABASE / MYSQL_USER / MYSQL_PASSWORD in .env.local.");
  process.exitCode = 1;
} finally {
  await database.end();
}
