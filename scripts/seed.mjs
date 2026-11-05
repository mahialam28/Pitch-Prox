// Demo data for local development and client previews:
//
//   npm run db:seed
//
// Safe to run more than once (existing demo records are left alone). Refuses to
// run against production. Every demo account's password is "password-123".
// Later phases add their own demo data here (customers, leads, tickets, …).
import { randomBytes } from "node:crypto";

try { process.loadEnvFile(".env.local"); } catch { /* fall back to the shell environment */ }
if (process.env.NODE_ENV === "production") {
  console.error("Refusing to seed demo data with NODE_ENV=production.");
  process.exit(1);
}

const { createId, hashPassword, hashToken, query, default: database } = await import("../src/lib/db.js");
const { OFFBOARDING_STEPS, ONBOARDING_COURSE, POLICIES } = await import("../src/lib/catalogs/onboarding-catalog.js");

const PASSWORD = "password-123";
const ORG = { id: "org_pitchprox_internal", name: "PitchProX" };
const day = (offset) => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);

// status: active | onboarding | invited | expired
const STAFF = [
  { name: "Sarah Johnson", email: "sarah.johnson@pitchprox.test", role: "super_admin", title: "Security Lead", department: "Security", status: "active", mfa: "sms" },
  { name: "Mike Davis", email: "mike.davis@pitchprox.test", role: "admin_manager", title: "Operations Manager", department: "Operations", status: "active", mfa: "sms" },
  { name: "Emily Brown", email: "emily.brown@pitchprox.test", role: "support", title: "Support Lead", department: "Support", status: "active", mfa: "mail" },
  { name: "Jessica Lee", email: "jessica.lee@pitchprox.test", role: "auditor", title: "Compliance Auditor", department: "Legal", status: "active", mfa: "sms" },
  { name: "Ryan Anderson", email: "ryan.anderson@pitchprox.test", role: "sales_rep", title: "Senior Closer", department: "Sales", status: "active", mfa: "sms", manager: "mike.davis@pitchprox.test" },
  { name: "David Martinez", email: "david.martinez@pitchprox.test", role: "sales_rep", title: "Closer", department: "Sales", status: "active", mfa: null, manager: "mike.davis@pitchprox.test" },
  { name: "Michael Carter", email: "michael.carter@pitchprox.test", role: "sales_rep", title: "Closing Specialist", department: "Sales", status: "active", mfa: "sms", manager: "mike.davis@pitchprox.test" },
  { name: "Chris Taylor", email: "chris.taylor@pitchprox.test", role: "sales_rep", title: "Sales Rep", department: "Sales", status: "active", mfa: "sms", manager: "mike.davis@pitchprox.test" },
  { name: "Tom Wilson", email: "tom.wilson@pitchprox.test", role: "support", title: "Support Agent", department: "Support", status: "onboarding", mfa: null, manager: "emily.brown@pitchprox.test" },
  { name: "Alex Rodriguez", email: "alex.rodriguez@pitchprox.test", role: "support", title: "Support Assistant", department: "Support", status: "invited", manager: "emily.brown@pitchprox.test" },
  { name: "Jennifer Smith", email: "jennifer.smith@pitchprox.test", role: "sales_rep", title: "Sales Representative", department: "Sales", status: "expired", manager: "mike.davis@pitchprox.test" },
];

const created = [];
try {
  await query("INSERT IGNORE INTO organizations (id, name) VALUES (?, ?)", [ORG.id, ORG.name]);
  const ids = {};

  for (const person of STAFF) {
    const [existing] = await query("SELECT id FROM users WHERE email = ?", [person.email]);
    if (existing) { ids[person.email] = existing.id; continue; }
    const id = createId("user");
    ids[person.email] = id;
    const { hash, salt } = hashPassword(PASSWORD);
    await query("INSERT INTO users (id, organization_id, name, email, password_hash, password_salt, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY))", [
      id, ORG.id, person.name, person.email, hash, salt, person.role, person.status === "active" ? 120 : 5,
    ]);
    const pending = person.status === "invited" || person.status === "expired";
    await query(
      "INSERT INTO staff_profiles (user_id, department, job_title, manager_id, start_date, onboarding_due, status, mfa_method, password_set) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, person.department, person.title, person.manager ? ids[person.manager] ?? null : null, day(pending ? 3 : -120), day(pending ? 17 : -106), pending ? "invited" : person.status, person.mfa ?? null, pending ? 0 : 1]
    );
    if (pending) {
      // Pending: a live link; expired: a link that ran out. Real links come from Add Employee.
      await query("INSERT INTO staff_invites (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL ? DAY))", [
        createId("invite"), id, hashToken(randomBytes(32).toString("base64url")), person.status === "expired" ? -2 : 6,
      ]);
    }
    if (person.status === "active") {
      // Active staff have finished onboarding: policies signed, training done
      await query("INSERT IGNORE INTO onboarding_records (user_id, started_at, policies_done_at, ethics_done_at, security_done_at, training_done_at, final_signed_at, final_signature, completed_at) VALUES (?, DATE_SUB(NOW(), INTERVAL 118 DAY), DATE_SUB(NOW(), INTERVAL 118 DAY), DATE_SUB(NOW(), INTERVAL 118 DAY), DATE_SUB(NOW(), INTERVAL 117 DAY), DATE_SUB(NOW(), INTERVAL 116 DAY), DATE_SUB(NOW(), INTERVAL 116 DAY), ?, DATE_SUB(NOW(), INTERVAL 116 DAY))", [id, person.name]);
      for (const policy of POLICIES) {
        await query("INSERT IGNORE INTO policy_acknowledgments (id, user_id, policy_id, version, signature_name) VALUES (?, ?, ?, ?, ?)", [createId("ack"), id, policy.id, policy.version, person.name]);
      }
      for (const trainingModule of ONBOARDING_COURSE.modules) await query("INSERT IGNORE INTO training_module_progress (user_id, module_id) VALUES (?, ?)", [id, trainingModule.id]);
    }
    if (person.status === "onboarding") {
      // Part-way: company policies signed, AI policies still to do
      await query("INSERT IGNORE INTO onboarding_records (user_id, started_at, policies_done_at) VALUES (?, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY))", [id]);
      for (const policy of POLICIES.filter((item) => item.category === "company")) {
        await query("INSERT IGNORE INTO policy_acknowledgments (id, user_id, policy_id, version, signature_name) VALUES (?, ?, ?, ?, ?)", [createId("ack"), id, policy.id, policy.version, person.name]);
      }
    }
    await query("INSERT INTO audit_logs (id, actor_name, actor_role, action, entity_type, entity_id, summary) VALUES (?, 'System', 'system', 'staff.invited', 'user', ?, ?)", [createId("audit"), id, `Demo data: added ${person.name}`]);
    created.push(person.email);
  }

  // One overdue offboarding case, part-way through the checklist
  const leaver = ids["chris.taylor@pitchprox.test"];
  const [open] = await query("SELECT id FROM offboarding_cases WHERE user_id = ?", [leaver]);
  if (!open) {
    const caseId = createId("offboard");
    await query("INSERT INTO offboarding_cases (id, user_id, last_day, owner_id, reason, status) VALUES (?, ?, ?, ?, 'Resigned', 'in_progress')", [caseId, leaver, day(-3), ids["mike.davis@pitchprox.test"]]);
    for (const step of OFFBOARDING_STEPS.slice(0, 1)) await query("INSERT INTO offboarding_case_steps (case_id, step_key) VALUES (?, ?)", [caseId, step.key]);
    await query("UPDATE staff_profiles SET status = 'offboarding' WHERE user_id = ?", [leaver]);
  }

  console.log(created.length ? `Added ${created.length} demo staff accounts (password "${PASSWORD}"):\n  ${created.join("\n  ")}` : "Demo staff already present; nothing to add.");
} catch (error) {
  console.error(`Seeding failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await database.end();
}
