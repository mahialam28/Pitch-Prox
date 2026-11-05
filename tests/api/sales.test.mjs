// Phase 2: the Sales Rep portal — pipeline ownership, customer accounts and activation,
// the staff side of support tickets, the sales dashboard, calendar, staff mail and rep tools.
// Uses the demo staff from `npm run db:seed` (skipped when they aren't there).
import { test } from "node:test";
import assert from "node:assert/strict";
import { RUN, actor, form, newCustomer, signIn } from "./helpers.mjs";

const PASSWORD = "password-123";
// Signed in before the tests are declared, so a missing seed skips them cleanly
const [rep, otherRep, manager, support, auditor, superAdmin] = await Promise.all(
  ["ryan.anderson", "david.martinez", "mike.davis", "emily.brown", "jessica.lee", "sarah.johnson"].map((name) => signIn(`${name}@pitchprox.test`, PASSWORD).catch(() => null))
);
const needsStaff = () => ({ skip: !(rep && otherRep && manager && support && auditor && superAdmin) && "demo staff not seeded (npm run test:db)" });

// A customer account created by `owner` from the User Portal
async function createAccount(owner, label) {
  const plans = (await owner.get("/api/v1/plans")).json.results;
  const plan = plans.find((item) => !item.isTrial);
  const email = `${label}-${RUN}@customer.test`;
  const res = await owner.post("/api/v1/customers", { fullName: `${label} Owner`, company: `${label} Co ${RUN}`, email, planId: plan.id, billingCycle: "monthly", seats: 3 });
  assert.equal(res.status, 201, JSON.stringify(res.json));
  return { ...res.json, email };
}

test("pipeline: reps own their leads, managers see all, support has no CRM", needsStaff(), async () => {
  const created = await rep.post("/api/v1/leads", { name: `Rep Lead ${RUN}`, leadType: "Solo agent" });
  assert.equal(created.status, 201, JSON.stringify(created.json));
  const id = created.json.lead.id;
  assert.equal((await rep.get(`/api/v1/leads/${id}`)).status, 200);
  assert.equal((await otherRep.get(`/api/v1/leads/${id}`)).status, 404);
  assert.equal((await otherRep.patch(`/api/v1/leads/${id}`, { name: "Taken" })).status, 404);
  assert.ok((await manager.get("/api/v1/leads")).json.results.some((lead) => lead.id === id));
  assert.equal((await support.get("/api/v1/leads")).status, 403);
  // Customer lead types are not valid for PitchProX's own pipeline
  assert.equal((await rep.post("/api/v1/leads", { name: "Wrong type", leadType: "Buyer" })).status, 400);
});

test("customers: rep creates an account, only they see it, activation link works once", needsStaff(), async () => {
  const { account, invite, email } = await createAccount(rep, "acct");
  assert.equal(account.status, "Invited");
  assert.equal(account.subscriptionStatus, "pending_payment");
  assert.ok((await rep.get("/api/v1/customers")).json.results.some((item) => item.organizationId === account.organizationId));
  assert.ok(!(await otherRep.get("/api/v1/customers")).json.results.some((item) => item.organizationId === account.organizationId));
  assert.ok((await superAdmin.get("/api/v1/customers")).json.results.some((item) => item.organizationId === account.organizationId));
  assert.equal((await manager.get("/api/v1/customers")).status, 403, "Admin Manager has no Customers section");
  assert.equal((await rep.post("/api/v1/customers", { fullName: "Dup", company: "Dup", email, planId: account.planId })).status, 409);
  assert.equal((await rep.post("/api/v1/customers", { fullName: "Bad", company: "Bad", email: `bad-${RUN}@x.test`, planId: "nope" })).status, 400);

  // No password until activation
  assert.equal((await actor().post("/api/v1/auth/sign-in", { email, password: "anything-123" })).status, 401);
  assert.equal((await otherRep.post(`/api/v1/customers/${account.organizationId}/activation`)).status, 404);
  const customer = actor();
  assert.equal((await customer.post("/api/v1/auth/activate", { token: invite.token, password: "short" })).status, 400);
  assert.equal((await customer.post("/api/v1/auth/activate", { token: invite.token, password: "customer-pass-123" })).status, 200);
  assert.equal((await actor().post("/api/v1/auth/activate", { token: invite.token, password: "customer-pass-123" })).status, 410);
  assert.equal((await signIn(email, "customer-pass-123").then(() => 200)), 200);
  assert.equal((await rep.post(`/api/v1/customers/${account.organizationId}/activation`)).status, 400);
});

test("staff tickets: reply, internal notes stay internal, customer reply reopens", needsStaff(), async () => {
  const customer = await newCustomer("tkt");
  const ticket = (await customer.post("/api/v1/support/tickets", form({ category: "billing", priority: "urgent", subject: "Charged twice", description: "Please refund" }))).json.ticket;
  assert.equal((await customer.get("/api/v1/staff/tickets")).status, 403);
  assert.equal((await manager.get("/api/v1/staff/tickets")).status, 403);

  const listed = (await support.get("/api/v1/staff/tickets")).json.results.find((item) => item.id === ticket.id);
  assert.equal(listed.sla.status, "On Track");
  const reply = await support.post(`/api/v1/staff/tickets/${ticket.id}/messages`, form({ body: "Refund on its way" }));
  assert.equal(reply.status, 201, JSON.stringify(reply.json));
  assert.equal(reply.json.ticket.status, "Waiting");
  assert.equal(reply.json.ticket.sla.status, "Met");
  assert.equal(reply.json.ticket.assignedTo.name, "Emily Brown");
  await support.post(`/api/v1/staff/tickets/${ticket.id}/notes`, { body: `secret-note-${RUN}` });

  const seen = (await customer.get(`/api/v1/support/tickets/${ticket.id}`)).json.ticket;
  assert.ok(seen.messages.some((message) => message.body === "Refund on its way"));
  assert.ok(!JSON.stringify(seen).includes(`secret-note-${RUN}`));
  await customer.post(`/api/v1/support/tickets/${ticket.id}/messages`, form({ body: "Thanks!" }));
  assert.equal((await support.get(`/api/v1/staff/tickets/${ticket.id}`)).json.ticket.status, "Open");

  assert.equal((await support.patch(`/api/v1/staff/tickets/${ticket.id}`, { status: "Bogus" })).status, 400);
  assert.equal((await support.patch(`/api/v1/staff/tickets/${ticket.id}`, { status: "Resolved" })).json.ticket.status, "Resolved");
});

test("staff tickets: a rep opens tickets only for their own customers", needsStaff(), async () => {
  const { account } = await createAccount(rep, "tktacct");
  const fields = { organizationId: account.organizationId, category: "technical", priority: "medium", subject: "Can't log in", description: "Customer locked out" };
  assert.equal((await otherRep.post("/api/v1/staff/tickets", form(fields))).status, 400);
  const res = await rep.post("/api/v1/staff/tickets", form(fields));
  assert.equal(res.status, 201, JSON.stringify(res.json));
  assert.equal(res.json.ticket.customer.company, account.company);
  const mine = (await rep.get("/api/v1/staff/tickets?opened=me")).json.results;
  assert.ok(mine.some((item) => item.id === res.json.ticket.id));
  assert.ok(!(await otherRep.get("/api/v1/staff/tickets?opened=me")).json.results.some((item) => item.id === res.json.ticket.id));
  assert.equal((await auditor.post("/api/v1/staff/tickets", form(fields))).status, 403);
});

test("sales dashboard: rep sees their own numbers, admins the company, auditors nothing", needsStaff(), async () => {
  const mine = await rep.get("/api/v1/sales/dashboard");
  assert.equal(mine.status, 200);
  assert.equal(mine.json.scope, "rep");
  assert.equal(mine.json.trend.length, 7);
  assert.equal(mine.json.insights.length, 8);
  const company = await manager.get("/api/v1/sales/dashboard");
  assert.equal(company.json.scope, "company");
  assert.ok(company.json.overview.accounts >= mine.json.overview.accounts);
  assert.equal((await auditor.get("/api/v1/sales/dashboard")).status, 403);
  assert.equal((await (await newCustomer("dash")).get("/api/v1/sales/dashboard")).status, 403);
});

test("calendar: visibility, owner-only edits, validation", needsStaff(), async () => {
  const base = { eventType: "Sales", department: "Sales", startDate: "2031-03-04", startTime: "09:30 AM", endTime: "10:15 AM" };
  const range = "/api/v1/calendar/events?from=2031-03-01&to=2031-03-31";
  const pub = (await rep.post("/api/v1/calendar/events", { ...base, title: `Public ${RUN}` })).json.event;
  const priv = (await rep.post("/api/v1/calendar/events", { ...base, title: `Private ${RUN}`, visibility: "Private" })).json.event;
  const mgmt = (await manager.post("/api/v1/calendar/events", { ...base, title: `Mgmt ${RUN}`, visibility: "Management Only", startTime: "13:00", endTime: "14:00" })).json.event;
  assert.equal(pub.startsAt, "2031-03-04T09:30");
  assert.equal(mgmt.endsAt, "2031-03-04T14:00");

  const titles = async (who) => (await who.get(range)).json.results.map((event) => event.title);
  assert.deepEqual((await titles(rep)).filter((title) => title.endsWith(RUN)).sort(), [`Private ${RUN}`, `Public ${RUN}`]);
  assert.deepEqual((await titles(manager)).filter((title) => title.endsWith(RUN)).sort(), [`Mgmt ${RUN}`, `Public ${RUN}`]);
  assert.deepEqual((await titles(support)).filter((title) => title.endsWith(RUN)), [`Public ${RUN}`]);

  assert.equal((await otherRep.put(`/api/v1/calendar/events/${pub.id}`, { ...base, title: "Hijack" })).status, 403);
  assert.equal((await auditor.post("/api/v1/calendar/events", { ...base, title: "Audit" })).status, 403);
  assert.equal((await rep.post("/api/v1/calendar/events", { ...base, title: "Backwards", endTime: "09:00 AM" })).status, 400);
  assert.equal((await rep.post("/api/v1/calendar/events", { ...base, title: "Bad type", eventType: "Party" })).status, 400);
  assert.equal((await rep.put(`/api/v1/calendar/events/${pub.id}`, { ...base, title: `Public v2 ${RUN}` })).json.event.title, `Public v2 ${RUN}`);
  for (const [who, event] of [[rep, pub], [rep, priv], [manager, mgmt]]) assert.equal((await who.del(`/api/v1/calendar/events/${event.id}`)).status, 200);
  assert.equal((await actor().get(range)).status, 401);
  assert.equal((await (await newCustomer("cal")).get(range)).status, 403);
});

test("staff mail: each staff member sees only their own emails", needsStaff(), async () => {
  const sent = await rep.post("/api/v1/mail/messages", { to: "prospect@example.com", subject: `Hello ${RUN}`, body: "Hi there" });
  assert.equal(sent.status, 201);
  assert.equal(sent.json.message.status, "queued");
  assert.ok((await rep.get("/api/v1/mail/messages")).json.results.some((mail) => mail.id === sent.json.message.id));
  assert.ok(!(await otherRep.get("/api/v1/mail/messages")).json.results.some((mail) => mail.id === sent.json.message.id));
  assert.equal((await otherRep.get(`/api/v1/mail/messages/${sent.json.message.id}`)).status, 404);
  assert.equal((await auditor.post("/api/v1/mail/messages", { to: "a@b.co", subject: "x", body: "y" })).status, 403);
});

test("rep tools: own custom playbooks, premium included, own calibration sessions", needsStaff(), async () => {
  const created = await rep.post("/api/v1/playbooks", { title: `Rep Playbook ${RUN}`, status: "published", content: { baseId: "pitchprox-standard" } });
  assert.equal(created.status, 201, JSON.stringify(created.json));
  const id = created.json.playbook.id;
  const list = (await rep.get("/api/v1/playbooks")).json.results;
  assert.ok(list.some((playbook) => playbook.id === id));
  assert.ok(list.filter((playbook) => playbook.kind === "premium").every((playbook) => playbook.isAvailable));
  assert.ok(!(await otherRep.get("/api/v1/playbooks")).json.results.some((playbook) => playbook.id === id));
  assert.equal((await otherRep.del(`/api/v1/playbooks/${id}`)).status, 404);
  assert.equal((await rep.put("/api/v1/playbooks/active", { playbookId: id })).status, 200);
  assert.equal((await rep.del(`/api/v1/playbooks/${id}`)).status, 200);

  const before = (await rep.get("/api/v1/calibration/sessions")).json.total;
  assert.equal((await rep.post("/api/v1/calibration/sessions", { durationSeconds: 90 })).json.total, before + 1);
  assert.equal((await support.get("/api/v1/calibration/sessions")).status, 403);
});
