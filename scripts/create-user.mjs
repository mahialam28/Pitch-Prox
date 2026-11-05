// Create a PitchProX account from the command line.
//
// Staff (super_admin, admin_manager, support, auditor or sales_rep) — belong to the internal PitchProX organization.
// They are created active (no onboarding); use Add Employee in the app to invite someone through onboarding:
//   node scripts/create-user.mjs --email a@b.com --name "Jane Doe" --password "..." --role super_admin
//
// Customer team member — joins the company of an existing customer account:
//   node scripts/create-user.mjs --email b@c.com --name "Sam Lee" --password "..." --role customer_member --company-of owner@their-company.com
//
// Reads MySQL settings from .env.local (same variables as the app).
import { parseArgs } from "node:util";

try { process.loadEnvFile(".env.local"); } catch { /* fall back to the shell environment */ }

const { createId, hashPassword, query, default: database } = await import("../src/lib/db.js");
const { ROLES } = await import("../src/utils.js/roles.js");

const STAFF_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN_MANAGER, ROLES.SUPPORT, ROLES.AUDITOR, ROLES.SALES_REP];
const ALLOWED_ROLES = [...STAFF_ROLES, ROLES.CUSTOMER_MEMBER];
const INTERNAL_ORGANIZATION = { id: "org_pitchprox_internal", name: "PitchProX" };

function fail(message) {
  console.error(`Error: ${message}`);
  console.error("Usage: node scripts/create-user.mjs --email <email> --name <name> --password <password> --role super_admin|admin_manager|support|auditor|sales_rep|customer_member [--company-of <existing customer email>]");
  process.exit(1);
}

const { values } = parseArgs({
  options: { email: { type: "string" }, name: { type: "string" }, password: { type: "string" }, role: { type: "string" }, "company-of": { type: "string" } },
});
const email = values.email?.trim().toLowerCase();
const name = values.name?.trim();
const { password, role } = values;

if (!email || !/^\S+@\S+\.\S+$/.test(email)) fail("--email must be a valid email address.");
if (!name) fail("--name is required.");
if (!password || password.length < 8) fail("--password must be at least 8 characters.");
if (!ALLOWED_ROLES.includes(role)) fail(`--role must be one of: ${ALLOWED_ROLES.join(", ")}.`);
if (role === ROLES.CUSTOMER_MEMBER && !values["company-of"]) fail("--company-of <existing customer email> is required for customer_member.");

try {
  if ((await query("SELECT id FROM users WHERE email = ?", [email])).length) fail(`A user with email ${email} already exists.`);
  let organizationId = INTERNAL_ORGANIZATION.id;
  if (role === ROLES.CUSTOMER_MEMBER) {
    const ownerEmail = values["company-of"].trim().toLowerCase();
    const [owner] = await query("SELECT organization_id AS organizationId, role FROM users WHERE email = ?", [ownerEmail]);
    if (!owner) fail(`No account found for ${ownerEmail}.`);
    if (![ROLES.CUSTOMER_ADMIN, ROLES.CUSTOMER_MEMBER].includes(owner.role)) fail(`${ownerEmail} is not a customer account.`);
    organizationId = owner.organizationId;
  } else {
    await query("INSERT IGNORE INTO organizations (id, name) VALUES (?, ?)", [INTERNAL_ORGANIZATION.id, INTERNAL_ORGANIZATION.name]);
  }
  const { hash, salt } = hashPassword(password);
  const id = createId("user");
  await query("INSERT INTO users (id, organization_id, name, email, password_hash, password_salt, role) VALUES (?, ?, ?, ?, ?, ?, ?)", [id, organizationId, name, email, hash, salt, role]);
  // Staff get an active employee profile (they skip onboarding)
  if (STAFF_ROLES.includes(role)) {
    await query("INSERT INTO staff_profiles (user_id, status, password_set, start_date, department) VALUES (?, 'active', 1, CURDATE(), ?)", [id, role === ROLES.SALES_REP ? "Sales" : null]);
  }
  console.log(`Created ${role} ${email} (${id}).`);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
} finally {
  await database.end();
}
