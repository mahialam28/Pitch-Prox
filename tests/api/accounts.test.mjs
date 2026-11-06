// Phase 3: managing customer accounts from the staff portals — the customer detail page,
// credits & adjustments (with approvals and reversals), refunds, subscription changes,
// notes, suspending accounts and impersonation.
// Uses the demo staff from `npm run db:seed` (skipped when they aren't there).
import { test } from "node:test";
import assert from "node:assert/strict";
import { RUN, actor, newCustomer, signIn } from "./helpers.mjs";

const PASSWORD = "password-123";
const [rep, otherRep, manager, support, auditor, superAdmin] = await Promise.all(
  ["ryan.anderson", "david.martinez", "mike.davis", "emily.brown", "jessica.lee", "sarah.johnson"].map((name) => signIn(`${name}@pitchprox.test`, PASSWORD).catch(() => null))
);
const needsStaff = () => ({ skip: !(rep && otherRep && manager && support && auditor && superAdmin) && "demo staff not seeded (npm run test:db)" });

// A customer account owned by `rep`
let repAccount;
async function repOrg() {
  if (repAccount) return repAccount;
  const plans = (await rep.get("/api/v1/plans")).json.results;
  const plan = plans.find((item) => !item.isTrial);
  const res = await rep.post("/api/v1/customers", { fullName: `Ledger Owner`, company: `Ledger Co ${RUN}`, email: `ledger-${RUN}@customer.test`, planId: plan.id, billingCycle: "monthly", seats: 2 });
  assert.equal(res.status, 201, JSON.stringify(res.json));
  repAccount = { id: res.json.account.organizationId, plans };
  return repAccount;
}
const path = (id, rest = "") => `/api/v1/customers/${id}${rest}`;

test("detail: reps see only their accounts; Users-section roles see all", needsStaff(), async () => {
  const { id } = await repOrg();
  const detail = await rep.get(path(id));
  assert.equal(detail.status, 200, JSON.stringify(detail.json));
  assert.equal(detail.json.company, `Ledger Co ${RUN}`);
  assert.deepEqual([detail.json.status, detail.json.profile.seats, detail.json.owner.activated], ["active", 2, false]);
  assert.deepEqual(detail.json.permissions.limits, { calls: 50, reports: 50, credit: 5000, discount: 5000 });
  assert.equal(detail.json.permissions.canImpersonate, false);
  assert.equal((await otherRep.get(path(id))).status, 404);
  assert.equal((await superAdmin.get(path(id))).status, 200);
  assert.equal((await support.get(path(id))).status, 200);
  assert.equal((await manager.get(path(id))).status, 403, "Admin Manager has no Users section");
  assert.equal((await auditor.get(path(id))).status, 403);
  assert.equal((await actor().get(path(id))).status, 401);
  assert.equal((await superAdmin.get(path("org_missing"))).status, 404);
  assert.ok(Array.isArray(detail.json.tickets) && Array.isArray(detail.json.invoices) && Array.isArray(detail.json.impersonations));
});

test("adjustments: rep caps, support requests, Super Admin approves and reverses", needsStaff(), async () => {
  const { id } = await repOrg();
  // Validation
  assert.equal((await rep.post(path(id, "/adjustments"), { kind: "calls", quantity: 10 })).status, 400, "reason required");
  assert.equal((await rep.post(path(id, "/adjustments"), { kind: "minutes", quantity: 10, reason: "x" })).status, 400);
  assert.equal((await rep.post(path(id, "/adjustments"), { kind: "calls", quantity: 0, reason: "x" })).status, 400);
  // Rep: applied directly, up to the cap
  const calls = await rep.post(path(id, "/adjustments"), { kind: "calls", quantity: 10, reason: "Onboarding goodwill" });
  assert.equal(calls.status, 201, JSON.stringify(calls.json));
  assert.deepEqual([calls.json.status, calls.json.value], ["applied", "+10 calls"]);
  assert.match(calls.json.reference, /^ADJ-\d+$/);
  assert.equal((await rep.post(path(id, "/adjustments"), { kind: "calls", quantity: 60, reason: "Too many" })).status, 400);
  assert.equal((await rep.post(path(id, "/adjustments"), { kind: "credit", amount: 60, reason: "Too much" })).status, 400);
  assert.equal((await otherRep.post(path(id, "/adjustments"), { kind: "calls", quantity: 1, reason: "Not mine" })).status, 404);
  // Support: request waits for approval and changes nothing yet
  const request = await support.post(path(id, "/adjustments"), { kind: "credit", amount: 20, applyTo: "Next Invoice", reason: "Billing mistake" });
  assert.equal(request.status, 201);
  assert.equal(request.json.status, "pending");
  let detail = (await superAdmin.get(path(id))).json;
  assert.deepEqual([detail.balances.calls.added, detail.balances.creditCents], [10, 0]);
  // Only a Super Admin decides
  assert.equal((await rep.patch(`/api/v1/billing/adjustments/${request.json.id}`, { decision: "approve" })).status, 403);
  assert.equal((await support.patch(`/api/v1/billing/adjustments/${request.json.id}`, { decision: "approve" })).status, 403);
  const approved = await superAdmin.patch(`/api/v1/billing/adjustments/${request.json.id}`, { decision: "approve", note: "OK" });
  assert.equal(approved.status, 200);
  assert.equal(approved.json.status, "applied");
  assert.equal((await superAdmin.patch(`/api/v1/billing/adjustments/${request.json.id}`, { decision: "reject" })).status, 400, "already decided");
  detail = (await superAdmin.get(path(id))).json;
  assert.equal(detail.balances.creditCents, 2000);
  // Reversal: a new opposite row; the original stays
  assert.equal((await rep.post(`/api/v1/billing/adjustments/${calls.json.id}/reverse`, { reason: "Mistake" })).status, 403);
  assert.equal((await superAdmin.post(`/api/v1/billing/adjustments/${calls.json.id}/reverse`, {})).status, 400, "reason required");
  const reversal = await superAdmin.post(`/api/v1/billing/adjustments/${calls.json.id}/reverse`, { reason: "Added to the wrong account" });
  assert.equal(reversal.status, 201);
  assert.deepEqual([reversal.json.value, reversal.json.isReversal], ["−10 calls", true]);
  assert.equal((await superAdmin.post(`/api/v1/billing/adjustments/${calls.json.id}/reverse`, { reason: "Again" })).status, 400);
  detail = (await superAdmin.get(path(id))).json;
  assert.equal(detail.balances.calls.added, 0);
  const original = detail.adjustments.find((row) => row.id === calls.json.id);
  assert.deepEqual([original.status, original.reversed], ["applied", true]);
});

test("refunds: Super Admin only; recorded in the ledger and the overview", needsStaff(), async () => {
  const { id } = await repOrg();
  assert.equal((await rep.post(path(id, "/adjustments"), { kind: "refund", amount: 10, reason: "Unhappy" })).status, 403);
  assert.equal((await support.post(path(id, "/adjustments"), { kind: "refund", amount: 10, reason: "Unhappy" })).status, 403);
  const refund = await superAdmin.post(path(id, "/adjustments"), { kind: "refund", amount: 12.5, invoice: "INV-1", reason: "Double charge" });
  assert.equal(refund.status, 201);
  assert.equal(refund.json.value, "$12.50");
  const overview = (await superAdmin.get("/api/v1/billing/adjustments")).json;
  assert.ok(overview.results.some((row) => row.id === refund.json.id));
  assert.ok(overview.stats.refundsThisMonthCents >= 1250);
  // A rep sees their own accounts' ledger; another rep doesn't
  assert.ok((await rep.get("/api/v1/billing/adjustments")).json.results.some((row) => row.organizationId === id));
  assert.ok(!(await otherRep.get("/api/v1/billing/adjustments")).json.results.some((row) => row.organizationId === id));
  assert.equal((await auditor.get("/api/v1/billing/adjustments")).status, 403);
});

test("notes: anyone with access adds; only the author or a Super Admin deletes", needsStaff(), async () => {
  const { id } = await repOrg();
  assert.equal((await rep.post(path(id, "/notes"), { body: "  " })).status, 400);
  const added = await rep.post(path(id, "/notes"), { body: "Wants a demo of AI training", pinned: true });
  assert.equal(added.status, 201);
  const note = added.json.results.find((item) => item.body === "Wants a demo of AI training");
  assert.ok(note);
  assert.equal(note.type, "Lead Insight");
  const edited = await rep.patch(path(id, `/notes/${note.id}`), { title: "Demo request", type: "Communication" });
  assert.equal(edited.status, 200);
  const after = edited.json.results.find((item) => item.id === note.id);
  assert.deepEqual([after.title, after.type, after.body, Boolean(after.updatedAt)], ["Demo request", "Communication", "Wants a demo of AI training", true]);
  assert.equal((await rep.patch(path(id, `/notes/${note.id}`), { type: "Gossip" })).status, 400);
  assert.equal((await support.patch(path(id, `/notes/${note.id}`), { title: "Mine now" })).status, 403);
  assert.equal((await support.del(path(id, `/notes/${note.id}`))).status, 403);
  assert.equal((await superAdmin.del(path(id, `/notes/${note.id}`))).status, 200);
  assert.ok(!(await rep.get(path(id, "/notes"))).json.results.some((item) => item.id === note.id));
});

test("subscription: proration preview, scheduled change, pause and cancel", needsStaff(), async () => {
  const { id, plans } = await repOrg();
  const other = plans.filter((plan) => !plan.isTrial).at(-1);
  const preview = await rep.post(path(id, "/subscription/preview"), { planId: other.id, billingCycle: "annual", when: "now" });
  assert.equal(preview.status, 200, JSON.stringify(preview.json));
  assert.equal(preview.json.when, "now");
  assert.ok(preview.json.dueNowCents >= 0 && preview.json.summary.includes("due today"));
  assert.equal((await rep.post(path(id, "/subscription/preview"), { planId: "nope" })).status, 400);
  const scheduled = await rep.patch(path(id, "/subscription"), { planId: other.id, billingCycle: "annual", when: "renewal" });
  assert.equal(scheduled.status, 200);
  assert.deepEqual([scheduled.json.account.subscription.scheduledPlanId, scheduled.json.account.subscription.scheduledCycle], [other.id, "annual"]);

  assert.equal((await rep.post(path(id, "/subscription/pause"), { until: "2020-01-01" })).status, 400);
  const paused = await rep.post(path(id, "/subscription/pause"), { until: `${new Date().getFullYear() + 1}-01-15` });
  assert.equal(paused.status, 200);
  assert.equal(paused.json.subscription.status, "paused");
  const resumed = await rep.post(path(id, "/subscription/pause"), { resume: true });
  assert.equal(resumed.json.subscription.pausedUntil, null);

  assert.equal((await rep.post(path(id, "/subscription/cancel"), {})).json.subscription.cancelAtPeriodEnd, true);
  assert.equal((await rep.post(path(id, "/subscription/cancel"), { undo: true })).json.subscription.cancelAtPeriodEnd, false);
});

test("profile and owner: validated and audited", needsStaff(), async () => {
  const { id } = await repOrg();
  assert.equal((await rep.patch(path(id, "/profile"), { seats: 0 })).status, 400);
  const updated = await rep.patch(path(id, "/profile"), { industry: "Real Estate", website: "https://ledger.test", timezone: "America/New_York", seats: 4 });
  assert.equal(updated.status, 200);
  assert.deepEqual([updated.json.profile.industry, updated.json.profile.seats], ["Real Estate", 4]);
  assert.equal((await rep.patch(path(id, "/owner"), { name: "New Owner", email: "not-an-email" })).status, 400);
  const owner = await rep.patch(path(id, "/owner"), { name: "New Owner", email: `ledger-owner-${RUN}@customer.test` });
  assert.equal(owner.status, 200);
  assert.equal(owner.json.owner.name, "New Owner");
  assert.ok(owner.json.activity.some((entry) => entry.action === "account.owner_updated"));
});

test("status: suspending ends the customer's sessions and blocks sign-in", needsStaff(), async () => {
  const email = `suspend-${RUN}@test.dev`;
  const customer = actor();
  assert.equal((await customer.post("/api/v1/auth/sign-up", { name: "Suspend Me", email, password: PASSWORD })).status, 201);
  const id = (await customer.get("/api/v1/me")).json.user.organizationId;
  assert.equal((await rep.post(path(id, "/status"), { status: "suspended", reason: "x" })).status, 404, "not the rep's account");
  assert.equal((await auditor.post(path(id, "/status"), { status: "suspended", reason: "x" })).status, 403);
  assert.equal((await support.post(path(id, "/status"), { status: "suspended" })).status, 400, "reason required");
  const suspended = await support.post(path(id, "/status"), { status: "suspended", reason: "Chargeback" });
  assert.equal(suspended.status, 200);
  assert.deepEqual([suspended.json.status, suspended.json.statusReason], ["suspended", "Chargeback"]);
  assert.equal((await customer.get("/api/v1/me")).status, 401, "session ended");
  assert.equal((await actor().post("/api/v1/auth/sign-in", { email, password: PASSWORD })).status, 403);
  // Changes are blocked only for deleted accounts; reactivating restores sign-in
  assert.equal((await support.post(path(id, "/status"), { status: "deleted", reason: "Closing" })).status, 403, "Super Admin only");
  assert.equal((await support.post(path(id, "/status"), { status: "active" })).status, 200);
  assert.ok(await signIn(email, PASSWORD));
  assert.equal((await superAdmin.post(path(id, "/status"), { status: "deleted", reason: "Closing" })).status, 200);
  assert.equal((await superAdmin.patch(path(id, "/profile"), { industry: "x" })).status, 400, "deleted accounts can't change");
  assert.equal((await actor().post("/api/v1/auth/sign-in", { email, password: PASSWORD })).status, 403);
});

test("impersonation: real session, read-only enforced, exit restores the staff session", needsStaff(), async () => {
  const email = `imp-${RUN}@test.dev`;
  const customer = actor();
  assert.equal((await customer.post("/api/v1/auth/sign-up", { name: "Imp Customer", email, password: PASSWORD })).status, 201);
  const id = (await customer.get("/api/v1/me")).json.user.organizationId;
  // A separate Super Admin actor so the shared one stays signed in as staff
  const admin = await signIn("sarah.johnson@pitchprox.test", PASSWORD);
  assert.equal((await rep.post(path(id, "/impersonate"), { reason: "x" })).status, 404);
  assert.equal((await admin.post(path(id, "/impersonate"), { accessLevel: "readonly" })).status, 400, "reason required");
  const started = await admin.post(path(id, "/impersonate"), { accessLevel: "readonly", duration: "15m", reason: "Checking billing page" });
  assert.equal(started.status, 201, JSON.stringify(started.json));
  assert.equal(started.json.redirectTo, "/user/dashboard");
  assert.ok(admin.hasCookie("pitchprox_staff_session"));
  const me = (await admin.get("/api/v1/me")).json.user;
  assert.deepEqual([me.email, me.impersonation.access, me.impersonation.staffName], [email, "readonly", "Sarah Johnson"]);
  // Read-only: reading works, changing doesn't
  assert.equal((await admin.get("/api/v1/billing")).status, 200);
  const blocked = await admin.post("/api/v1/leads", { name: "Should fail" });
  assert.equal(blocked.status, 403);
  assert.match(blocked.json.error, /read-only/);
  // The customer's device list doesn't show the staff session
  assert.equal((await customer.get("/api/v1/me/sessions")).json.results.length, 1);
  // Exit: back to the Super Admin session
  const ended = await admin.del("/api/v1/auth/impersonation");
  assert.equal(ended.status, 200);
  assert.deepEqual([ended.json.restored, ended.json.redirectTo], [true, `/super-admin/users/${id}`]);
  assert.equal((await admin.get("/api/v1/me")).json.user.role, "super_admin");
  assert.ok(!admin.hasCookie("pitchprox_staff_session"));
  const detail = (await admin.get(path(id))).json;
  assert.ok(detail.impersonations[0].endedAt);
  assert.ok(["account.impersonation_started", "account.impersonation_ended"].every((action) => detail.activity.some((entry) => entry.action === action)));
});

test("impersonation: full access changes are attributed to the staff member", needsStaff(), async () => {
  const customer = await newCustomer("imp-full");
  const id = (await customer.get("/api/v1/me")).json.user.organizationId;
  const helper = await signIn("emily.brown@pitchprox.test", PASSWORD);
  assert.equal((await helper.post(path(id, "/impersonate"), { accessLevel: "full", duration: "1h", reason: "Set up their profile" })).status, 201);
  assert.equal((await helper.post(path(id, "/impersonate"), { accessLevel: "full", reason: "Nested" })).status, 403, "the impersonated customer is not staff");
  const changed = await helper.post("/api/v1/leads", { name: `Imp Lead ${RUN}`, leadType: "FSBO" });
  assert.equal(changed.status, 201, JSON.stringify(changed.json));
  assert.equal((await helper.del("/api/v1/auth/impersonation")).json.restored, true);
  assert.ok((await customer.get("/api/v1/leads")).json.results.some((lead) => lead.name === `Imp Lead ${RUN}`));
});
