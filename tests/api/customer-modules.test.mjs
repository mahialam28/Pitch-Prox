// Modules 1.2 – 1.9: AI training, support, mail, lead notes, security, billing,
// calibration and team members.
import { test, before } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { RUN, actor, form, newCustomer, signIn, CHROME_MAC, SAFARI_IPHONE } from "./helpers.mjs";

const PNG = { name: "screen.png", content: Buffer.from("89504e470d0a1a0a-fake-image"), type: "image/png" };
const PDF = { name: "About me - sales bio.pdf", content: Buffer.from("%PDF-1.4 fake pdf for tests"), type: "application/pdf" };
let a, b;
const aEmail = `mod-a-${RUN}@test.dev`;

before(async () => {
  a = actor({ userAgent: CHROME_MAC });
  const res = await a.post("/api/v1/auth/sign-up", { name: "Mods Admin", email: aEmail, password: "password-123" });
  assert.equal(res.status, 201);
  b = await newCustomer("mod-b");
});

// ── 1.2 AI training ──
test("AI training: empty account starts at 0%", async () => {
  assert.equal((await actor().get("/api/v1/ai-training/assets")).status, 401);
  const { json } = await a.get("/api/v1/ai-training/assets");
  assert.deepEqual([json.results.length, json.summary.progress, json.summary.totalCategories], [0, 0, 7]);
});

test("AI training: upload validation", async () => {
  assert.equal((await a.post("/api/v1/ai-training/assets", form({ category: "nope" }, { file: PDF }))).status, 400);
  assert.equal((await a.post("/api/v1/ai-training/assets", form({ category: "sales-bio" }))).status, 400);
  assert.equal((await a.post("/api/v1/ai-training/assets", form({ category: "sales-bio" }, { file: { name: "virus.exe", content: "MZ" } }))).status, 400);
  assert.equal((await a.post("/api/v1/ai-training/assets", form({ category: "sales-bio" }, { file: { name: "empty.pdf", content: "" } }))).status, 400);
  assert.equal((await a.post("/api/v1/ai-training/assets", undefined, { raw: "not multipart" })).status, 400);
});

let assetId;
test("AI training: upload, pause, resume, delete", async () => {
  const up = await a.post("/api/v1/ai-training/assets", form({ category: "sales-bio" }, { file: PDF }));
  assert.equal(up.status, 201);
  assetId = up.json.asset.id;
  assert.deepEqual([up.json.asset.name, up.json.asset.type, up.json.asset.category, up.json.asset.status], [PDF.name, "PDF", "Sales Bio", "Active"]);
  let list = (await a.get("/api/v1/ai-training/assets")).json;
  assert.deepEqual([list.results.length, list.summary.coveredCategories, list.summary.progress], [1, 1, 14]);

  assert.equal((await a.patch(`/api/v1/ai-training/assets/${assetId}`, { status: "paused" })).status, 200);
  list = (await a.get("/api/v1/ai-training/assets")).json;
  assert.deepEqual([list.results[0].status, list.summary.progress], ["Paused", 0], "paused material doesn't count");
  assert.equal((await a.patch(`/api/v1/ai-training/assets/${assetId}`, { status: "deleted" })).status, 400);
  assert.equal((await a.patch(`/api/v1/ai-training/assets/${assetId}`, { status: "active" })).status, 200);
});

test("AI training: other companies can't touch it", async () => {
  assert.equal((await b.get("/api/v1/ai-training/assets")).json.results.length, 0);
  assert.equal((await b.patch(`/api/v1/ai-training/assets/${assetId}`, { status: "paused" })).status, 404);
  assert.equal((await b.del(`/api/v1/ai-training/assets/${assetId}`)).status, 404);
  assert.equal((await a.del(`/api/v1/ai-training/assets/${assetId}`)).status, 200);
  assert.equal((await a.get("/api/v1/ai-training/assets")).json.results.length, 0);
});

// ── 1.3 Support tickets ──
let ticket;
test("Support: validation", async () => {
  const valid = { category: "technical", priority: "high", subject: "Can't connect Gmail", description: "Authorization error" };
  assert.equal((await a.post("/api/v1/support/tickets", form({ ...valid, category: "x" }))).status, 400);
  assert.equal((await a.post("/api/v1/support/tickets", form({ ...valid, priority: "x" }))).status, 400);
  assert.equal((await a.post("/api/v1/support/tickets", form({ ...valid, subject: "  " }))).status, 400);
  assert.equal((await a.post("/api/v1/support/tickets", form(valid, { file: { name: "a.exe", content: "MZ" } }))).status, 400);
});

test("Support: create with attachment, list, detail", async () => {
  const res = await a.post("/api/v1/support/tickets", form({ category: "technical", priority: "high", subject: "Can't connect Gmail", description: "Authorization error" }, { file: PNG }));
  assert.equal(res.status, 201);
  ticket = res.json.ticket;
  assert.ok(ticket.number >= 1001);
  assert.deepEqual([ticket.status, ticket.messages.length, ticket.messages[0].role, ticket.messages[0].attachment.name], ["Open", 1, "customer", "screen.png"]);
  assert.deepEqual([ticket.customer.plan, ticket.customer.name], ["Free Trial", "Mods Admin"]);
  const list = (await a.get("/api/v1/support/tickets")).json;
  assert.equal(list.count, 1);
});

test("Support: attachment download is private", async () => {
  const path = `/api/v1/support/tickets/${ticket.id}/messages/${ticket.messages[0].id}/attachment`;
  const file = await a.get(path);
  assert.equal(file.status, 200);
  assert.deepEqual(file.bytes, PNG.content);
  assert.match(file.headers.get("content-disposition"), /screen\.png/);
  assert.equal((await b.get(path)).status, 404);
  assert.equal((await actor().get(path)).status, 401);
});

test("Support: reply; other companies can't read or reply", async () => {
  const res = await a.post(`/api/v1/support/tickets/${ticket.id}/messages`, form({ body: "Here is more detail" }));
  assert.equal(res.status, 201);
  assert.equal(res.json.ticket.messages.length, 2);
  assert.equal((await a.post(`/api/v1/support/tickets/${ticket.id}/messages`, form({ body: " " }))).status, 400);
  assert.equal((await b.get(`/api/v1/support/tickets/${ticket.id}`)).status, 404);
  assert.equal((await b.post(`/api/v1/support/tickets/${ticket.id}/messages`, form({ body: "hi" }))).status, 404);
  assert.equal((await b.get("/api/v1/support/tickets")).json.count, 0);
});

// ── 1.4 Mail ──
test("Mail: validation", async () => {
  const valid = { to: "sarah@example.com", subject: "Hello", body: "Hi Sarah" };
  assert.equal((await a.post("/api/v1/mail/messages", { ...valid, to: "not-an-email" })).status, 400);
  assert.equal((await a.post("/api/v1/mail/messages", { ...valid, subject: "" })).status, 400);
  assert.equal((await a.post("/api/v1/mail/messages", { ...valid, body: " " })).status, 400);
  assert.equal((await a.post("/api/v1/mail/messages", { ...valid, cc: "ok@x.com, bad" })).status, 400);
});

test("Mail: saved as waiting, listed, private", async () => {
  const res = await a.post("/api/v1/mail/messages", { to: "sarah@example.com", cc: "boss@example.com; team@example.com", subject: "Hello", body: "Hi Sarah\n\nThanks!" });
  assert.equal(res.status, 201);
  const message = res.json.message;
  assert.deepEqual([message.cc, message.senderName], ["boss@example.com, team@example.com", "Mods Admin"]);
  assert.ok(["waiting", "sending"].includes(message.status), message.status);
  assert.equal((await a.get("/api/v1/mail/messages")).json.count, 1);
  assert.equal((await a.get(`/api/v1/mail/messages/${message.id}`)).json.message.subject, "Hello");
  assert.equal((await b.get(`/api/v1/mail/messages/${message.id}`)).status, 404);
  assert.equal((await b.get("/api/v1/mail/messages")).json.count, 0);
});

// ── 1.5 Lead notes & follow-ups ──
test("Leads: notes and follow-ups", async () => {
  const lead = (await a.post("/api/v1/leads", { name: "Noted Lead" })).json.lead;
  assert.equal(lead.followUpAt, null);
  const note = await a.post(`/api/v1/leads/${lead.id}/notes`, { body: "  Wants a call in June  " });
  assert.equal(note.status, 201);
  assert.deepEqual([note.json.note.body, note.json.note.authorName], ["Wants a call in June", "Mods Admin"]);
  assert.equal((await a.post(`/api/v1/leads/${lead.id}/notes`, { body: "" })).status, 400);
  assert.equal((await a.get(`/api/v1/leads/${lead.id}/notes`)).json.count, 1);
  assert.equal((await a.post(`/api/v1/leads/${lead.id}/follow-ups`, { followUpAt: "2020-01-01T00:00:00Z" })).status, 400);
  const future = new Date(Date.now() + 2 * 864e5).toISOString();
  const follow = await a.post(`/api/v1/leads/${lead.id}/follow-ups`, { followUpAt: future });
  assert.equal(follow.status, 200);
  assert.ok(Math.abs(new Date(follow.json.lead.followUpAt) - new Date(future)) < 1000);
  assert.equal((await b.get(`/api/v1/leads/${lead.id}/notes`)).status, 404);
  assert.equal((await b.post(`/api/v1/leads/${lead.id}/notes`, { body: "x" })).status, 404);
  assert.equal((await b.post(`/api/v1/leads/${lead.id}/follow-ups`, { followUpAt: future })).status, 404);
});

// ── 1.6 Security ──
test("Security: devices list with the current one first", async () => {
  const phone = await signIn(aEmail, "password-123", { userAgent: SAFARI_IPHONE });
  const { json } = await a.get("/api/v1/me/sessions");
  assert.equal(json.count, 2);
  assert.deepEqual([json.results[0].isCurrent, json.results[0].device, json.results[0].browser], [true, "Mac", "Chrome 124"]);
  const other = json.results[1];
  assert.deepEqual([other.device, other.isMobile], ["iPhone", true]);

  assert.equal((await a.del(`/api/v1/me/sessions/${json.results[0].id}`)).status, 400, "can't remove the current device");
  assert.equal((await a.patch(`/api/v1/me/sessions/${other.id}`)).status, 200, "refresh another device");
  assert.equal((await b.del(`/api/v1/me/sessions/${other.id}`)).status, 404, "other users can't touch it");
  assert.equal((await a.del(`/api/v1/me/sessions/${other.id}`)).status, 200);
  assert.equal((await phone.get("/api/v1/me")).status, 401, "removed device is signed out");
});

test("Security: log out of all other devices", async () => {
  const laptop2 = await signIn(aEmail, "password-123");
  const laptop3 = await signIn(aEmail, "password-123");
  const res = await a.del("/api/v1/me/sessions");
  assert.deepEqual([res.status, res.json.revoked], [200, 2]);
  assert.equal((await laptop2.get("/api/v1/me")).status, 401);
  assert.equal((await laptop3.get("/api/v1/me")).status, 401);
  assert.equal((await a.get("/api/v1/me")).status, 200, "this device stays signed in");
});

test("Security: login activity records failures and successes", async () => {
  await actor().post("/api/v1/auth/sign-in", { email: aEmail, password: "wrong-password" });
  const { json } = await a.get("/api/v1/me/login-activity");
  assert.equal(json.results[0].success, false);
  assert.ok(json.results.some((item) => item.success));
  assert.ok(json.results.length >= 4);
  assert.equal((await b.get("/api/v1/me/login-activity")).json.results.length, 0, "only your own history (B only signed up)");
});

test("Security: changing the password signs out other devices", async () => {
  const other = await signIn(aEmail, "password-123");
  assert.equal((await a.patch("/api/v1/settings/password", { currentPassword: "password-123", newPassword: "password-456" })).status, 200);
  assert.equal((await other.get("/api/v1/me")).status, 401);
  assert.equal((await a.get("/api/v1/me")).status, 200);
  await a.patch("/api/v1/settings/password", { currentPassword: "password-456", newPassword: "password-123" });
});

// ── 1.7 Billing ──
test("Billing: new company is on the Free Trial; plans from the pricing page", async () => {
  const { status, json } = await a.get("/api/v1/billing");
  assert.equal(status, 200);
  assert.deepEqual([json.subscription.plan.id, json.subscription.status, json.subscription.usage.calls.total], ["free-trial", "trialing", 10]);
  assert.deepEqual(json.plans.map((plan) => [plan.name, plan.priceMonthly, plan.callsPerMonth]), [["Free Trial", "$0", 10], ["Basic", "$99", 150], ["Pro", "$199", 400], ["Elite", "$349", 750]]);
  assert.deepEqual(json.invoices, []);
});

// ── 1.8 Calibration ──
test("Calibration: sessions are saved per user", async () => {
  assert.equal((await a.post("/api/v1/calibration/sessions", { durationSeconds: -5 })).status, 400);
  assert.equal((await a.post("/api/v1/calibration/sessions", { durationSeconds: "120" })).status, 400);
  const res = await a.post("/api/v1/calibration/sessions", { durationSeconds: 120 });
  assert.deepEqual([res.status, res.json.total, res.json.session.durationSeconds, res.json.session.roundsCompleted], [201, 1, 120, null]);
  assert.equal((await a.get("/api/v1/calibration/sessions")).json.total, 1);
  assert.equal((await b.get("/api/v1/calibration/sessions")).json.total, 0);
});

test("Calibration gate: new customers start there, can do it later, calling unlocks after one session", async () => {
  const email = `gate-${RUN}@test.dev`;
  const user = actor();
  const signUp = await user.post("/api/v1/auth/sign-up", { name: "Gate Tester", email, password: "password-123" });
  assert.equal(signUp.json.user.needsCalibration, true, "sign-up sends new customers to calibration");
  assert.deepEqual((await user.get("/api/v1/calibration/status")).json, { required: true, completed: false, deferredAt: null, sessions: 0 });
  assert.equal((await actor().post("/api/v1/auth/sign-in", { email, password: "password-123" })).json.user.needsCalibration, true, "and every sign-in until they choose");

  const deferred = await user.post("/api/v1/calibration/defer");
  assert.equal(deferred.status, 200);
  assert.ok(deferred.json.deferredAt, "Do it later is remembered");
  assert.equal(deferred.json.completed, false, "calling stays locked");
  assert.equal((await actor().post("/api/v1/auth/sign-in", { email, password: "password-123" })).json.user.needsCalibration, false, "no more automatic trip to calibration");

  await user.post("/api/v1/calibration/sessions", { durationSeconds: 300 });
  const done = (await user.get("/api/v1/calibration/status")).json;
  assert.deepEqual([done.completed, done.sessions], [true, 1], "one session unlocks calling");

  const rep = await signIn("ryan.anderson@pitchprox.test", "password-123").catch(() => null);
  if (rep) {
    assert.equal((await rep.get("/api/v1/calibration/status")).json.required, false, "employees aren't gated");
    assert.equal((await rep.post("/api/v1/calibration/defer")).status, 403);
    assert.equal((await actor().post("/api/v1/auth/sign-in", { email: "ryan.anderson@pitchprox.test", password: "password-123" })).json.user.needsCalibration, false);
  }
  assert.equal((await actor().get("/api/v1/calibration/status")).status, 401);
});

// ── 1.9 Team member ──
test("Team member: joins the company and sees its data", { skip: !process.env.MYSQL_HOST && "needs MYSQL_* env to run the CLI" }, async () => {
  const memberEmail = `member-${RUN}@test.dev`;
  execFileSync(process.execPath, ["scripts/create-user.mjs", "--email", memberEmail, "--name", "Sam Member", "--password", "member-pass-1", "--role", "customer_member", "--company-of", aEmail], { stdio: "pipe" });
  const member = await signIn(memberEmail, "member-pass-1");
  assert.equal((await member.get("/api/v1/me")).json.user.role, "customer_member");
  const leads = (await member.get("/api/v1/leads")).json.results;
  assert.ok(leads.some((lead) => lead.name === "Noted Lead"), "member sees the company's leads");
  assert.equal((await member.get("/api/v1/support/tickets")).json.count, 1, "and its tickets");
  // A member can't be attached to a staff account's organization
  assert.throws(() => execFileSync(process.execPath, ["scripts/create-user.mjs", "--email", `x-${RUN}@test.dev`, "--name", "X", "--password", "member-pass-1", "--role", "customer_member", "--company-of", process.env.ADMIN_EMAIL || "nobody@nowhere.dev"], { stdio: "pipe" }));
});

test("Admins are blocked from the calling modules; their own mail and tickets stay their own", { skip: !process.env.ADMIN_EMAIL && "set ADMIN_EMAIL/ADMIN_PASSWORD" }, async () => {
  const admin = await signIn(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
  // Training material, billing and calibration belong to customers (and, for training/calibration, sales reps)
  for (const path of ["/api/v1/ai-training/assets", "/api/v1/billing", "/api/v1/calibration/sessions"]) {
    assert.equal((await admin.get(path)).status, 403, path);
  }
  // Staff can send email and raise their own support tickets; they see only their own, never a customer's
  for (const path of ["/api/v1/support/tickets", "/api/v1/mail/messages"]) {
    const { status, json } = await admin.get(path);
    assert.equal(status, 200, path);
    assert.ok(json.results.every((item) => !item.organizationId || item.organizationId === "org_pitchprox_internal"), path);
  }
  assert.equal((await admin.get("/api/v1/me/sessions")).status, 200, "everyone manages their own devices");
});
