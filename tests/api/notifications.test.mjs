// Phase 9: in-app notifications behind the bell — created where things happen, per person,
// mark read / unread / read all / delete, and muted by Settings → Notifications.
import { test } from "node:test";
import assert from "node:assert/strict";
import { RUN, actor, form, newCustomer, signIn } from "./helpers.mjs";

const PASSWORD = "password-123";
const [superAdmin, manager, support, rep] = await Promise.all(
  ["sarah.johnson", "mike.davis", "emily.brown", "ryan.anderson"].map((name) => signIn(`${name}@pitchprox.test`, PASSWORD).catch(() => null))
);
const needsStaff = () => ({ skip: !(superAdmin && manager && support && rep) && "demo staff not seeded (npm run test:db)" });
const api = "/api/v1/notifications";
const latest = async (user, match) => (await user.get(`${api}?limit=50`)).json.results.find(match);
const idOf = async (user) => (await user.get("/api/v1/me")).json.user.id;

test("notifications: signed in only; empty for a new user", async () => {
  assert.equal((await actor().get(api)).status, 401);
  const customer = await newCustomer("bell");
  const empty = await customer.get(api);
  assert.equal(empty.status, 200);
  assert.deepEqual([empty.json.results.length, empty.json.unreadCount, empty.json.hasMore], [0, 0, false]);
});

test("support tickets: the team hears about new tickets, the customer about replies; read, unread, delete, read all", needsStaff(), async () => {
  const customer = await newCustomer("bellticket");
  const ticket = (await customer.post("/api/v1/support/tickets", form({ category: "technical", priority: "high", subject: `Bell ticket ${RUN}`, description: "It broke" }))).json.ticket;
  const reference = `TKT-${ticket.number}`;

  const forSupport = await latest(support, (item) => item.title === `New support ticket: ${reference}`);
  assert.ok(forSupport, "Support is told about the new ticket");
  assert.equal(forSupport.type, "ticket");
  assert.equal(forSupport.link, `/super-admin/support-tickets?ticket=${encodeURIComponent(ticket.id)}`);
  assert.equal(forSupport.isUnread, true);
  assert.match(forSupport.body, new RegExp(`Bell ticket ${RUN}`));

  assert.equal((await support.post(`/api/v1/staff/tickets/${ticket.id}/messages`, form({ body: "We're on it" }))).status, 201);
  const reply = await latest(customer, (item) => item.title === `New reply on ${reference}`);
  assert.ok(reply, "the customer hears about the reply");
  assert.equal(reply.link, "/user/settings/support-ticket/tickets");
  assert.equal(reply.actorName, "Emily Brown");
  assert.match(reply.body, /We're on it/);
  assert.ok(!(await latest(support, (item) => item.title === `New reply on ${reference}`)), "nobody is notified about their own action");

  // The customer answers: the agent now on the ticket hears about it
  await customer.post(`/api/v1/support/tickets/${ticket.id}/messages`, form({ body: "Thanks" }));
  assert.ok(await latest(support, (item) => item.title === `Customer replied on ${reference}`));

  // Read / unread / delete / read all; only your own
  const before = (await customer.get(api)).json.unreadCount;
  assert.ok(before >= 1);
  const read = await customer.patch(`${api}/${reply.id}`, { read: true });
  assert.equal(read.status, 200);
  assert.equal(read.json.notification.isUnread, false);
  assert.equal(read.json.unreadCount, before - 1);
  assert.equal((await customer.patch(`${api}/${reply.id}`, { read: false })).json.notification.isUnread, true);
  assert.equal((await support.patch(`${api}/${reply.id}`, { read: true })).status, 404, "someone else's notification");
  assert.equal((await support.del(`${api}/${reply.id}`)).status, 404);
  assert.equal((await customer.get(`${api}?unread=1`)).json.results.every((item) => item.isUnread), true);
  assert.equal((await customer.post(`${api}/read-all`)).json.unreadCount, 0);
  assert.equal((await customer.get(api)).json.unreadCount, 0);
  assert.equal((await customer.del(`${api}/${reply.id}`)).json.deleted, true);
  assert.ok(!(await latest(customer, (item) => item.id === reply.id)));

  // Resolving tells the customer
  await support.patch(`/api/v1/staff/tickets/${ticket.id}`, { status: "Resolved" });
  assert.ok(await latest(customer, (item) => item.title === `${reference} is resolved`));
});

test("coaching notes, incident assignment and approvals reach the right person", needsStaff(), async () => {
  // Coaching note → the rep (private manager notes don't notify)
  const repId = await idOf(rep);
  const note = await manager.post(`/api/v1/admin/sales-reps/${repId}/notes`, { kind: "coaching", type: "Action Item", title: `Bell coaching ${RUN}`, body: "Shorter intros.", priority: "High" });
  assert.equal(note.status, 201, JSON.stringify(note.json));
  const coaching = await latest(rep, (item) => item.title === `New coaching note: Bell coaching ${RUN}`);
  assert.ok(coaching);
  assert.equal(coaching.type, "coaching");
  assert.equal(coaching.link, "/internal-sales-representative/dashboard");
  await manager.post(`/api/v1/admin/sales-reps/${repId}/notes`, { kind: "manager", body: `private ${RUN}` });
  assert.ok(!(await rep.get(`${api}?limit=50`)).json.results.some((item) => item.body?.includes(`private ${RUN}`)));

  // Incident assigned to someone else → them
  const incident = (await manager.post("/api/v1/compliance/incidents", form({ title: `Bell incident ${RUN}`, category: "Security Incident", severity: "High", description: "x", occurredAt: new Date(Date.now() - 3600000).toISOString() }))).json.incident;
  await manager.patch(`/api/v1/compliance/incidents/${incident.id}`, { assignedTo: await idOf(superAdmin) });
  const assigned = await latest(superAdmin, (item) => item.title === `Incident assigned to you: ${incident.reference}`);
  assert.ok(assigned);
  assert.equal(assigned.link, `/super-admin/compliance-audit/incident-management/${incident.id}`);

  // Support asks for a credit → Super Admins approve → Support hears the decision
  const plans = (await rep.get("/api/v1/plans")).json.results;
  const plan = plans.find((item) => !item.isTrial);
  const account = (await rep.post("/api/v1/customers", { fullName: "Bell Owner", company: `Bell Co ${RUN}`, email: `bell-owner-${RUN}@customer.test`, planId: plan.id, billingCycle: "monthly", seats: 1 })).json.account;
  const request = await support.post(`/api/v1/customers/${account.organizationId}/adjustments`, { kind: "credit", amount: 15, applyTo: "Next Invoice", reason: `Bell credit ${RUN}` });
  assert.equal(request.status, 201, JSON.stringify(request.json));
  const approval = await latest(superAdmin, (item) => item.type === "approval" && item.body?.includes(`Bell credit ${RUN}`));
  assert.ok(approval, "Super Admins are asked to approve");
  assert.equal(approval.link, "/super-admin/billing/credits-adjustments");
  await superAdmin.patch(`/api/v1/billing/adjustments/${request.json.id}`, { decision: "approve", note: "Fine" });
  assert.ok(await latest(support, (item) => item.type === "approval" && /approved/.test(item.title) && item.body?.includes("Fine")));
});

test("In-App Notifications set to Off: nothing lands in the bell", needsStaff(), async () => {
  const customer = await newCustomer("bellmuted");
  assert.equal((await customer.put("/api/v1/settings/notifications", { inAppNotifications: "off" })).status, 200);
  const ticket = (await customer.post("/api/v1/support/tickets", form({ category: "technical", priority: "low", subject: `Muted ${RUN}`, description: "x" }))).json.ticket;
  await support.post(`/api/v1/staff/tickets/${ticket.id}/messages`, form({ body: "Hello" }));
  assert.equal((await customer.get(api)).json.results.length, 0);
});
