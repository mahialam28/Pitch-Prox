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
};

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
    const json = await res.json().catch(() => ({}));
    return { status: res.status, json };
  };
  const responses = {};
  for (const path of LISTS) {
    const key = path.startsWith("/api/v1/calendar/events") ? "/api/v1/calendar/events" : path.startsWith("/api/v1/admin/employees?") ? "/api/v1/admin/employees" : path;
    responses[key] = await get(path);
    const detail = DETAILS[path];
    const items = responses[key].json?.results ?? responses[key].json?.employees;
    if (detail && responses[key].status === 200 && Array.isArray(items)) {
      for (const item of items) for (const sub of detail(item.id)) responses[sub] = await get(sub);
    }
  }
  out.personas[persona] = { email, responses };
  console.log(persona, Object.keys(responses).length, "responses");
}
mkdirSync(new URL("./overlay/src/preview/", import.meta.url), { recursive: true });
writeFileSync(new URL("./overlay/src/preview/fixtures.json", import.meta.url), JSON.stringify(out));
console.log("saved");
