// Phase 0–1: staff accounts, permissions, invites, onboarding, offboarding, audit log.
// Needs ADMIN_EMAIL / ADMIN_PASSWORD for a super_admin (npm run create-user).
// The role-permission test also uses the demo staff from `npm run db:seed`.
import { test, before } from "node:test";
import assert from "node:assert/strict";
import { RUN, actor, newCustomer, signIn } from "./helpers.mjs";

const needsAdmin = { skip: !process.env.ADMIN_EMAIL && "set ADMIN_EMAIL/ADMIN_PASSWORD" };
let admin;

before(async () => {
  if (process.env.ADMIN_EMAIL) admin = await signIn(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
});

async function invite(label, role = "Sales Rep") {
  const email = `${label}-${RUN}@staff.test`;
  const res = await admin.post("/api/v1/admin/employees", { fullName: `${label} Person`, email, role });
  assert.equal(res.status, 201, JSON.stringify(res.json));
  return { ...res.json, email, name: `${label} Person` };
}

async function acceptedEmployee(label, role) {
  const created = await invite(label, role);
  const employee = actor();
  assert.equal((await employee.post("/api/v1/auth/accept-invite", { token: created.invite.token })).status, 200);
  // Welcome stays open until "Get Started"
  assert.equal((await employee.get("/api/v1/onboarding")).json.current, "welcome");
  assert.equal((await employee.post("/api/v1/onboarding/start")).json.current, "policies");
  return { ...created, employee };
}

test("admin APIs: customers and anonymous users are refused", needsAdmin, async () => {
  assert.equal((await actor().get("/api/v1/admin/employees")).status, 401);
  const customer = await newCustomer("staff-cust");
  assert.equal((await customer.get("/api/v1/admin/employees")).status, 403);
  assert.equal((await customer.get("/api/v1/onboarding")).status, 403);
});

test("invite: validation, duplicate email, pending status and readable employee id", needsAdmin, async () => {
  assert.equal((await admin.post("/api/v1/admin/employees", { fullName: "", email: "x@y.z", role: "Sales Rep" })).status, 400);
  assert.equal((await admin.post("/api/v1/admin/employees", { fullName: "No Role", email: `norole-${RUN}@staff.test`, role: "Wizard" })).status, 400);
  const created = await invite("inv");
  assert.equal(created.employee.status, "invited");
  assert.match(created.employee.employeeId, /^EMP-\d+$/);
  assert.equal((await admin.post("/api/v1/admin/employees", { fullName: "Dup", email: created.email, role: "Sales Rep" })).status, 409);
  const { json } = await admin.get(`/api/v1/admin/employees?tab=pending&search=${encodeURIComponent(created.email)}`);
  assert.equal(json.total, 1);
  // No password exists yet, so password sign-in explains what to do
  const res = await actor().post("/api/v1/auth/sign-in", { email: created.email, password: "anything-123" });
  assert.equal(res.status, 401);
  assert.match(res.json.error, /invite link/);
});

test("invite links: single use, and a new link replaces the old one", needsAdmin, async () => {
  const created = await invite("link");
  const fresh = await admin.post(`/api/v1/admin/employees/${created.employee.id}/invite`);
  assert.equal(fresh.status, 201);
  assert.equal((await actor().post("/api/v1/auth/accept-invite", { token: created.invite.token })).status, 410);
  assert.equal((await actor().post("/api/v1/auth/accept-invite", { token: fresh.json.invite.token })).status, 200);
  assert.equal((await actor().post("/api/v1/auth/accept-invite", { token: fresh.json.invite.token })).status, 410);
  assert.equal((await actor().post("/api/v1/auth/accept-invite", { token: "not-a-real-token-at-all-123" })).status, 404);
});

test("onboarding: steps in order, signatures, password rules, then the employee becomes active", needsAdmin, async () => {
  const { employee, email, name } = await acceptedEmployee("onb");
  let { json: state } = await employee.get("/api/v1/onboarding");
  assert.equal(state.variant, "sales-rep");
  assert.equal(state.current, "policies");
  // Portal stays closed until onboarding is finished
  const portal = await fetch(`${process.env.BASE || "http://127.0.0.1:3000"}/internal-sales-representative/dashboard`, { headers: { Cookie: employee.cookie() }, redirect: "manual" });
  // Portal layouts redirect while streaming (HTTP 200 + a NEXT_REDIRECT instruction the browser follows)
  const target = portal.headers.get("location") ?? /NEXT_REDIRECT;replace;([^;]+);/.exec(await portal.text())?.[1];
  assert.equal(target, "/onboarding");

  assert.equal((await employee.put("/api/v1/onboarding/security", { mfaMethod: "sms" })).status, 409);
  assert.equal((await employee.post("/api/v1/onboarding/policies/infosec/acknowledge", { signature: "Somebody Else" })).status, 400);
  for (const policy of [...state.policies, ...state.aiPolicies]) {
    assert.equal((await employee.post(`/api/v1/onboarding/policies/${policy.id}/acknowledge`, { signature: name.toLowerCase() })).status, 200);
  }
  assert.equal((await employee.post("/api/v1/onboarding/password", { password: "weak", confirm: "weak" })).status, 400);
  assert.equal((await employee.post("/api/v1/onboarding/password", { password: "Str0ng!Pass", confirm: "Other!Pass1" })).status, 400);
  assert.equal((await employee.post("/api/v1/onboarding/password", { password: "Str0ng!Pass", confirm: "Str0ng!Pass" })).status, 200);
  assert.equal((await employee.put("/api/v1/onboarding/security", { mfaMethod: "fax" })).status, 400);
  ({ json: state } = await employee.put("/api/v1/onboarding/security", { mfaMethod: "mail" }));
  assert.equal(state.current, "training");

  const modules = state.training[0].modules;
  assert.equal((await employee.post(`/api/v1/onboarding/training/modules/${modules.at(-1).id}/complete`)).status, 409);
  for (const trainingModule of modules) assert.equal((await employee.post(`/api/v1/onboarding/training/modules/${trainingModule.id}/complete`)).status, 200);
  assert.equal((await employee.post("/api/v1/onboarding/final", { signature: name, statements: [true, true] })).status, 400);
  ({ json: state } = await employee.post("/api/v1/onboarding/final", { signature: name, statements: [true, true, true, true, true] }));
  assert.equal(state.current, "voice");
  ({ json: state } = await employee.post("/api/v1/onboarding/voice", { durationSeconds: 240 }));
  assert.equal(state.completed, true);

  assert.equal((await employee.get("/api/v1/onboarding")).status, 409);
  const signedIn = await signIn(email, "Str0ng!Pass");
  assert.equal((await signedIn.get("/api/v1/me")).json.user.staffStatus, "active");
});

test("team onboarding has no voice step", needsAdmin, async () => {
  const { employee } = await acceptedEmployee("team", "Support");
  const { json } = await employee.get("/api/v1/onboarding");
  assert.equal(json.variant, "team");
  assert.ok(!json.steps.some((step) => step.id === "voice"));
});

test("role changes, deactivation and reactivation", needsAdmin, async () => {
  const { employee: person } = await invite("roles");
  const changed = await admin.patch(`/api/v1/admin/employees/${person.id}`, { role: "Auditor" });
  assert.equal(changed.json.employee.role, "auditor");
  const { json: me } = await admin.get("/api/v1/me");
  assert.equal((await admin.patch(`/api/v1/admin/employees/${me.user.id}`, { role: "Sales Rep" })).status, 400);
  assert.equal((await admin.patch(`/api/v1/admin/employees/${person.id}`, { status: "active" })).status, 400);
  assert.equal((await admin.patch(`/api/v1/admin/employees/${person.id}`, { status: "deactivated" })).json.employee.status, "deactivated");
  assert.equal((await admin.patch(`/api/v1/admin/employees/${person.id}`, { status: "active" })).json.employee.status, "active");
});

test("offboarding: ordered checklist, revoking access ends sessions, completion deactivates", needsAdmin, async () => {
  const { employee, email, name } = await acceptedEmployee("off", "Support");
  // Finish onboarding quickly so the employee is active
  let { json: state } = await employee.get("/api/v1/onboarding");
  for (const policy of [...state.policies, ...state.aiPolicies]) await employee.post(`/api/v1/onboarding/policies/${policy.id}/acknowledge`, { signature: name });
  await employee.post("/api/v1/onboarding/password", { password: "Str0ng!Pass", confirm: "Str0ng!Pass" });
  ({ json: state } = await employee.put("/api/v1/onboarding/security", { mfaMethod: "sms" }));
  for (const trainingModule of state.training[0].modules) await employee.post(`/api/v1/onboarding/training/modules/${trainingModule.id}/complete`);
  await employee.post("/api/v1/onboarding/final", { signature: name, statements: [true, true, true, true, true] });
  const session = await signIn(email, "Str0ng!Pass");

  const { json: list } = await admin.get(`/api/v1/admin/employees?search=${encodeURIComponent(email)}`);
  const userId = list.results[0].id;
  const started = await admin.post("/api/v1/admin/offboarding", { userId, lastDay: "2031-05-01" });
  assert.equal(started.status, 201);
  assert.equal((await admin.post("/api/v1/admin/offboarding", { userId, lastDay: "2031-05-01" })).status, 409);
  const caseId = started.json.case.id;
  assert.equal((await admin.put(`/api/v1/admin/offboarding/${caseId}/steps/collect-devices`, { done: true })).status, 409);
  await admin.put(`/api/v1/admin/offboarding/${caseId}/steps/disable-sso`, { done: true });
  const revoked = await admin.put(`/api/v1/admin/offboarding/${caseId}/steps/revoke-access`, { done: true });
  assert.equal(revoked.json.case.access, "Revoked");
  assert.equal((await session.get("/api/v1/me")).status, 401);
  assert.equal((await actor().post("/api/v1/auth/sign-in", { email, password: "Str0ng!Pass" })).status, 403);
  for (const step of ["transfer-leads", "collect-devices", "export-evidence", "final-acknowledgment"]) {
    await admin.put(`/api/v1/admin/offboarding/${caseId}/steps/${step}`, { done: true });
  }
  const { json: board } = await admin.get("/api/v1/admin/offboarding");
  assert.equal(board.results.find((item) => item.id === caseId).status, "completed");
});

test("audit log records staff changes", needsAdmin, async () => {
  const { employee } = await invite("audit");
  const { json } = await admin.get(`/api/v1/admin/audit-logs?entityType=user&entityId=${employee.id}`);
  assert.ok(json.results.some((entry) => entry.action === "staff.invited"));
});

test("role sections: support can't open compliance, auditor can read but not write", needsAdmin, async () => {
  const support = await signIn("emily.brown@pitchprox.test", "password-123").catch(() => null);
  const auditor = await signIn("jessica.lee@pitchprox.test", "password-123").catch(() => null);
  if (!support || !auditor) return; // demo staff not seeded
  assert.equal((await support.get("/api/v1/admin/employees")).status, 403);
  assert.equal((await auditor.get("/api/v1/admin/employees")).status, 200);
  assert.equal((await auditor.post("/api/v1/admin/employees", { fullName: "Nope", email: `nope-${RUN}@staff.test`, role: "Sales Rep" })).status, 403);
});
