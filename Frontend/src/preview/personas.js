// The roles a visitor can preview, with the signed-in user each one shows.
// Users come from the recorded sample data (fixtures.json). Shared by the server
// pages (lib/auth.js) and the in-browser API (mock-api.js).
import FIXTURES from "./fixtures.json";

const userOf = (persona) => FIXTURES.personas[persona]?.responses["/api/v1/me"]?.json?.user;

export const PERSONAS = {
  customer: { label: "User (Customer)", description: "Real-estate team: dashboard, leads, CRM, playbooks, calls, support, billing.", user: userOf("customer") },
  "sales-rep": { label: "Sales Rep", description: "Internal sales rep: own pipeline, customers, user portal, tickets, calendar, mail.", user: userOf("sales-rep") },
  "super-admin": { label: "Super Admin", description: "Everything: users, sales reps, plans, billing, campaigns, compliance & audit.", user: userOf("super-admin") },
  "admin-manager": { label: "Admin Manager", description: "The manager's view of the admin portal.", user: userOf("admin-manager") },
  support: { label: "Support", description: "Support dashboard and support tickets.", user: userOf("support") },
  auditor: { label: "Auditor", description: "Read-only Compliance & Audit.", user: userOf("auditor") },
  "new-employee": {
    label: "New Employee",
    description: "The onboarding steps a new staff member completes.",
    user: { id: "user_preview_new_employee", name: "Tom Wilson", email: "tom.wilson@pitchprox.test", role: "sales_rep", organizationId: "org_pitchprox_internal", organizationName: "PitchProX", staffStatus: "onboarding" },
  },
};
for (const [key, persona] of Object.entries(PERSONAS)) persona.email = persona.user?.email ?? key;

const readCookie = (source, name) => {
  const match = String(source || "").split(/;\s*/).find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
};

// Browser side
export function personaFromCookie() {
  if (typeof document === "undefined") return null;
  const value = readCookie(document.cookie, "pitchprox_session");
  return value && PERSONAS[value] ? value : null;
}
export function previewIdentity() {
  if (typeof document === "undefined") return null;
  try { return JSON.parse(readCookie(document.cookie, "pitchprox_preview_identity")); } catch { return null; }
}
