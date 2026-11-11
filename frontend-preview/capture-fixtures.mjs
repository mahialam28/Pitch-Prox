// Records the sample data the design-only Frontend shows. Run against a dev server
// that has the demo data loaded (npm run db:seed:demo):
//   node frontend-preview/capture-fixtures.mjs [http://localhost:3000]
// Writes frontend-preview/overlay/src/preview/fixtures.json (one block per role).
import { writeFileSync, mkdirSync } from "node:fs";

const BASE = process.argv[2] || "http://localhost:3000";
const PERSONAS = {
  customer: "olivia.bennett@sunriserealty.demo",
  "sales-rep": "ryan.anderson@pitchprox.test",
  "super-admin": "sarah.johnson@pitchprox.test",
  "admin-manager": "mike.davis@pitchprox.test",
  support: "emily.brown@pitchprox.test",
  auditor: "jessica.lee@pitchprox.test",
};
const day = (offset) => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);
const LISTS = [
  "/api/v1/me", "/api/v1/settings/profile", "/api/v1/settings/preferences", "/api/v1/settings/notifications",
  "/api/v1/me/sessions", "/api/v1/me/login-activity", "/api/v1/dashboard", "/api/v1/sales/dashboard",
  "/api/v1/leads", "/api/v1/crm/prospects", "/api/v1/customers", "/api/v1/plans", "/api/v1/billing",
  "/api/v1/playbooks", "/api/v1/ai-training/assets", "/api/v1/calibration/sessions", "/api/v1/support/tickets",
  "/api/v1/mail/messages", "/api/v1/staff/tickets", "/api/v1/staff/tickets?opened=me", "/api/v1/staff/agents",
  `/api/v1/calendar/events?from=${day(-60)}&to=${day(120)}`,
  "/api/v1/admin/employees?tab=all&page=1&pageSize=500", "/api/v1/admin/employees/stats", "/api/v1/admin/managers",
  "/api/v1/admin/access-changes", "/api/v1/admin/offboarding",
  // Phases 3-5 screens
  "/api/v1/onboarding", "/api/v1/admin/pricing", "/api/v1/admin/plans", "/api/v1/admin/promo-codes", "/api/v1/billing/adjustments",
  "/api/v1/admin/sales-reps", "/api/v1/admin/sales-reps/quotas", "/api/v1/admin/analytics", "/api/v1/support/dashboard?range=7d",
  "/api/v1/announcements?tab=active", "/api/v1/mail/templates", "/api/v1/me/coaching-notes",
  "/api/v1/campaigns/overview", "/api/v1/campaigns/journeys", "/api/v1/campaigns/segments", "/api/v1/campaigns/templates", "/api/v1/campaigns/broadcasts",
  // Phase 6: Compliance & Audit
  "/api/v1/compliance/overview", "/api/v1/compliance/audit-logs?pageSize=100", "/api/v1/compliance/policies", "/api/v1/compliance/policies/overdue",
  "/api/v1/compliance/training", "/api/v1/compliance/training/courses", "/api/v1/compliance/training/materials", "/api/v1/compliance/training/categories",
  "/api/v1/compliance/training/employees", "/api/v1/compliance/incidents", "/api/v1/compliance/evidence", "/api/v1/compliance/soc2",
  "/api/v1/me/policies", "/api/v1/me/training",
  // Phases 6-11: calibration gate, Playbook Builder, follow-up emails, notifications, invoices, two-step login
  "/api/v1/calibration/status", "/api/v1/me/playbook-runtime", "/api/v1/admin/playbook-builds", "/api/v1/admin/playbook-resources",
  "/api/v1/follow-up", "/api/v1/notifications?limit=30", "/api/v1/billing/invoices", "/api/v1/me/mfa",
  "/api/v1/campaigns/deliveries?pageSize=100",
];
// Detail pages: for each list item, these sub-resources
const DETAILS = {
  "/api/v1/leads": (id) => [`/api/v1/leads/${id}`, `/api/v1/leads/${id}/notes`, `/api/v1/leads/${id}/follow-ups`],
  "/api/v1/crm/prospects": (id) => [`/api/v1/crm/prospects/${id}`, `/api/v1/crm/prospects/${id}/notes`, `/api/v1/crm/prospects/${id}/follow-ups`],
  "/api/v1/support/tickets": (id) => [`/api/v1/support/tickets/${id}`],
  "/api/v1/staff/tickets": (id) => [`/api/v1/staff/tickets/${id}`],
  "/api/v1/mail/messages": (id) => [`/api/v1/mail/messages/${id}`],
  "/api/v1/playbooks": (id) => [`/api/v1/playbooks/${id}`],
  "/api/v1/admin/employees?tab=all&page=1&pageSize=500": (id) => [`/api/v1/admin/employees/${id}`, `/api/v1/admin/employees/${id}/onboarding`],
  "/api/v1/customers": (id) => [`/api/v1/customers/${id}`],
  "/api/v1/admin/sales-reps": (id) => [`/api/v1/admin/sales-reps/${id}`, `/api/v1/admin/sales-reps/${id}/notes?kind=coaching`, `/api/v1/admin/sales-reps/${id}/activity`],
  "/api/v1/mail/templates": (id) => [`/api/v1/mail/templates/${id}`],
  "/api/v1/campaigns/journeys": (id) => [`/api/v1/campaigns/journeys/${id}`],
  "/api/v1/campaigns/segments": (id) => [`/api/v1/campaigns/segments/${id}`],
  "/api/v1/campaigns/templates": (id) => [`/api/v1/campaigns/templates/${id}`],
  "/api/v1/compliance/policies": (id) => [`/api/v1/compliance/policies/${id}`],
  "/api/v1/compliance/incidents": (id) => [`/api/v1/compliance/incidents/${id}`],
  "/api/v1/compliance/evidence": (id) => [`/api/v1/compliance/evidence/${id}`],
  "/api/v1/admin/playbook-builds": (id) => [`/api/v1/admin/playbook-builds/${id}`],
};
// The preview answers by path, so query strings are dropped from the keys (except "opened by me")
const keyOf = (path) => (path.includes("?opened=me") ? path : path.split("?")[0]);
// The list inside a response, whatever the screen calls it
const itemsOf = (json) => [json?.results, json?.employees, json?.reps, json?.segments, json?.templates, json?.journeys, json?.drafts].find(Array.isArray);

// Leftovers from automated test runs against this database ("bcast Tester Organization",
// "Welcome mw4pz5qw", "Smoke journey"…) don't belong in the client preview: any list item that
// mentions one is dropped, at any depth.
const TEST_LEFTOVER = /Tester Organization|Erin Endtoend|Olivia Owner|Tina Ticket|Bell Browser|Bell check|Jordan Fields|Two Step|Reset Browser|Draft check|Browser Organization|@test\.dev|-\d{13}@(cust|realty)\.test|^Smoke |"Smoke |\b(?=[a-z0-9]*\d)mw[a-z0-9]{6}\b/;
function scrub(value) {
  if (Array.isArray(value)) return value.filter((item) => !(item && (typeof item === "object" || typeof item === "string") && TEST_LEFTOVER.test(typeof item === "string" ? item : JSON.stringify(item)))).map(scrub);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, scrub(item)]));
  return value;
}

async function signIn(email) {
  const res = await fetch(`${BASE}/api/v1/auth/sign-in`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password: "password-123" }) });
  if (!res.ok) throw new Error(`sign-in ${email}: ${res.status}`);
  return res.headers.getSetCookie().find((cookie) => cookie.startsWith("pitchprox_session=")).split(";")[0];
}

const out = { capturedAt: new Date().toISOString(), personas: {} };
for (const [persona, email] of Object.entries(PERSONAS)) {
  const cookie = await signIn(email);
  const get = async (path) => {
    const res = await fetch(BASE + path, { headers: { Cookie: cookie } });
    const json = scrub(await res.json().catch(() => ({})));
    return { status: res.status, json };
  };
  const responses = {};
  for (const path of LISTS) {
    const key = keyOf(path);
    responses[key] = await get(path);
    const detail = DETAILS[path];
    const items = itemsOf(responses[key].json);
    if (detail && responses[key].status === 200 && items) {
      for (const item of items.slice(0, 40)) for (const sub of detail(item.id ?? item.organizationId)) responses[keyOf(sub)] = await get(sub);
    }
  }
  out.personas[persona] = { email, responses };
  console.log(persona, Object.keys(responses).length, "responses");
}
mkdirSync(new URL("./overlay/src/preview/", import.meta.url), { recursive: true });
writeFileSync(new URL("./overlay/src/preview/fixtures.json", import.meta.url), JSON.stringify(out));
console.log("saved");
