// Phase 7: Postmark delivery, the Postmark webhook and forgot / reset password.
// The test server talks to a stand-in for api.postmarkapp.com that this file starts on :3002
// (`npm run test:server` sets POSTMARK_API_URL, POSTMARK_SERVER_TOKEN and POSTMARK_WEBHOOK_SECRET).
// Skipped when the server was started without them.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { RUN, actor, newCustomer, signIn } from "./helpers.mjs";

const PASSWORD = "password-123";
const MOCK_PORT = 3002;
const WEBHOOK_SECRET = "test-webhook-secret";
const api = "/api/v1/campaigns";

const received = []; // { headers, body, messageId }
let server;
before(async () => {
  server = createServer((request, response) => {
    let raw = "";
    request.on("data", (chunk) => (raw += chunk));
    request.on("end", () => {
      const body = JSON.parse(raw || "{}");
      response.setHeader("Content-Type", "application/json");
      if (request.url !== "/email" || request.headers["x-postmark-server-token"] !== "test-token") {
        response.statusCode = 401;
        return response.end(JSON.stringify({ ErrorCode: 10, Message: "No Account or Server API tokens were supplied" }));
      }
      if (/^inactive-/.test(body.To)) {
        response.statusCode = 422;
        return response.end(JSON.stringify({ ErrorCode: 406, Message: "You tried to send to recipient(s) that have been marked as inactive." }));
      }
      const messageId = randomUUID();
      received.push({ headers: request.headers, body, messageId });
      response.end(JSON.stringify({ To: body.To, SubmittedAt: new Date().toISOString(), MessageID: messageId, ErrorCode: 0, Message: "OK" }));
    });
  });
  await new Promise((resolve, reject) => server.once("error", reject).listen(MOCK_PORT, "127.0.0.1", resolve));
});
after(() => server?.close());

const [superAdmin, manager, support] = await Promise.all(
  ["sarah.johnson", "mike.davis", "emily.brown"].map((name) => signIn(`${name}@pitchprox.test`, PASSWORD).catch(() => null))
);
const webhookProbe = await actor().post("/api/v1/public/postmark/webhook", { RecordType: "Open" });
const configured = webhookProbe.status !== 503;
const needsSetup = () => ({ skip: (!configured && "test server started without the Postmark test settings (npm run test:server)") || (!(superAdmin && manager && support) && "demo staff not seeded (npm run test:db)") });

const waitFor = async (find, label) => {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const found = find();
    if (found) return found;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`timed out waiting for ${label}`);
};

const webhook = (event, secret = WEBHOOK_SECRET) =>
  fetch(`${process.env.BASE || "http://127.0.0.1:3000"}/api/v1/public/postmark/webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Basic ${Buffer.from(`postmark:${secret}`).toString("base64")}` },
    body: JSON.stringify(event),
  });

const runJobsUntil = async (find, label) => {
  for (let pass = 0; pass < 10; pass += 1) {
    const found = find();
    if (found) return found;
    const result = await superAdmin.post("/api/v1/jobs/run");
    assert.equal(result.status, 200, JSON.stringify(result.json));
    if (result.json.skipped) await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  return waitFor(find, label);
};

test("forgot / reset password: emailed on the Transactional stream, one use, signs out everywhere", needsSetup(), async () => {
  const email = `reset-${RUN}@test.dev`;
  const customer = await newCustomer("reset");
  assert.equal((await customer.get("/api/v1/me")).status, 200);

  assert.equal((await actor().post("/api/v1/auth/forgot-password", { email: "not-an-email" })).status, 400);
  const unknown = await actor().post("/api/v1/auth/forgot-password", { email: `nobody-${RUN}@test.dev` });
  const known = await actor().post("/api/v1/auth/forgot-password", { email: email.toUpperCase() });
  assert.equal(unknown.status, 200);
  assert.deepEqual(known.json, unknown.json, "same answer whether or not the account exists");

  const message = await waitFor(() => received.find((item) => item.body.To === email && /reset/i.test(item.body.Subject)), "the reset email");
  assert.equal(message.body.MessageStream, "outbound");
  assert.equal(message.body.Tag, "system");
  assert.equal(message.body.TrackLinks, "None", "reset links aren't rewritten by click tracking");
  assert.match(message.body.From, /PitchProX/);
  assert.ok(message.body.TextBody.includes("/reset-password?token="), "plain-text part has the link");
  assert.ok(message.body.Metadata.deliveryId.startsWith("mail"));
  assert.ok(!received.some((item) => item.body.To === `nobody-${RUN}@test.dev`));
  const token = decodeURIComponent(message.body.HtmlBody.match(/reset-password\?token=([^"&<\s]+)/)[1]);

  assert.equal((await actor().get("/api/v1/auth/reset-password?token=not-a-real-token-at-all")).status, 404);
  assert.equal((await actor().get(`/api/v1/auth/reset-password?token=${encodeURIComponent(token)}`)).json.valid, true);
  assert.equal((await actor().post("/api/v1/auth/reset-password", { token, password: "short" })).status, 400);
  const reset = await actor().post("/api/v1/auth/reset-password", { token, password: "new-password-456" });
  assert.equal(reset.status, 200, JSON.stringify(reset.json));
  assert.equal((await customer.get("/api/v1/me")).status, 401, "old sessions are signed out");
  assert.equal((await actor().post("/api/v1/auth/reset-password", { token, password: "another-pass-789" })).status, 410, "one use only");
  assert.equal((await actor().post("/api/v1/auth/sign-in", { email, password: PASSWORD })).status, 401);
  assert.equal((await actor().post("/api/v1/auth/sign-in", { email, password: "new-password-456" })).status, 200);

  // The outbox lists it as a sent system email (kept out of the campaign numbers)
  const outbox = await support.get(`${api}/deliveries?source=system&search=${encodeURIComponent(email)}`);
  assert.equal(outbox.status, 200);
  assert.ok(outbox.json.results.some((row) => row.status === "sent" && row.stream === "transactional"));
});

test("employee invites are emailed with the activation link", needsSetup(), async () => {
  const email = `invitee-${RUN}@pitchprox.test`;
  const invited = await superAdmin.post("/api/v1/admin/employees", { fullName: "Mail Invitee", email, role: "support" });
  assert.equal(invited.status, 201, JSON.stringify(invited.json));
  const message = await waitFor(() => received.find((item) => item.body.To === email), "the invite email");
  assert.equal(message.body.MessageStream, "outbound");
  assert.ok(message.body.HtmlBody.includes(`/accept-invite?token=${encodeURIComponent(invited.json.invite.token)}`));
});

test("broadcasts go out on the Broadcast stream; webhook events update the outbox and suppression list", needsSetup(), async () => {
  const email = `pm-${RUN}@test.dev`;
  const customer = await newCustomer("pm");
  await customer.get("/api/v1/me");
  const userId = (await superAdmin.get(`${api}/segments`)).json.users.find((user) => user.email === email)?.id;
  const segment = (await manager.post(`${api}/segments`, { type: "Static", name: `Postmark ${RUN}`, userIds: [userId] })).json.segment;
  const template = (await manager.post(`${api}/templates`, { name: `PM promo ${RUN}`, emailType: "Marketing", category: "Promotional", subject: "Hello {First Name}", fromName: "Bryce at PitchProX", replyTo: "support@pitchprox.test", creationMethod: "build", status: "Active", content: { heading: "News", body: "Hi" } })).json.template;
  const sent = await manager.post(`${api}/broadcasts`, { name: `PM ${RUN}`, segmentId: segment.id, templateId: template.id, sendOption: "now" });
  assert.equal(sent.status, 201, JSON.stringify(sent.json));

  const message = await runJobsUntil(() => received.find((item) => item.body.To === email && item.body.Tag === "campaign"), "the broadcast email");
  assert.equal(message.body.MessageStream, "broadcast");
  assert.equal(message.body.From, '"Bryce at PitchProX" <no-reply@pitchprox.com>');
  assert.equal(message.body.ReplyTo, "support@pitchprox.test");
  assert.equal(message.body.TrackOpens, true);
  const unsubscribe = message.body.Headers.find((header) => header.Name === "List-Unsubscribe");
  assert.match(unsubscribe.Value, /^<http.*\/api\/v1\/public\/unsubscribe\?e=.*&s=.*>$/);
  assert.ok(message.body.Headers.some((header) => header.Name === "List-Unsubscribe-Post"));

  // Webhook: Basic auth required
  assert.equal((await webhook({ RecordType: "Open", MessageID: message.messageId }, "wrong-secret")).status, 401);
  assert.equal((await webhook({ RecordType: "Delivery", MessageID: message.messageId, Recipient: email, DeliveredAt: new Date().toISOString() })).status, 200);
  assert.equal((await (await webhook({ RecordType: "Open", Metadata: message.body.Metadata, Recipient: email, ReceivedAt: new Date().toISOString() })).json()).matched, true);
  assert.equal((await webhook({ RecordType: "Click", MessageID: message.messageId, Recipient: email, OriginalLink: "https://pitchprox.com" })).status, 200);
  const row = (await support.get(`${api}/deliveries?source=campaign&search=${encodeURIComponent(email)}`)).json.results.find((item) => item.email === email);
  assert.equal(row.status, "sent");
  assert.equal(row.stream, "broadcast");
  assert.ok(row.deliveredAt && row.openedAt && row.clickedAt, JSON.stringify(row));

  // Spam complaint → suppressed → the next broadcast to them is skipped
  const before = (await support.get(`${api}/overview`)).json.suppressed;
  assert.equal((await webhook({ RecordType: "SpamComplaint", MessageID: message.messageId, Email: email, BouncedAt: new Date().toISOString() })).status, 200);
  assert.equal((await support.get(`${api}/overview`)).json.suppressed, before + 1);
  const again = await manager.post(`${api}/broadcasts`, { name: `PM again ${RUN}`, segmentId: segment.id, templateId: template.id, sendOption: "now" });
  assert.equal(again.json.campaign.stats.skipped, 1, "no broadcasts after a spam complaint");

  // Reactivated in Postmark → back on the list; a hard bounce takes them off again
  assert.equal((await webhook({ RecordType: "SubscriptionChange", Recipient: email, SuppressSending: false, MessageStream: "broadcast" })).status, 200);
  assert.equal((await support.get(`${api}/overview`)).json.suppressed, before);
  assert.equal((await webhook({ RecordType: "Bounce", Type: "HardBounce", Inactive: true, MessageID: message.messageId, Email: email, Description: "The server was unable to deliver your message" })).status, 200);
  assert.equal((await support.get(`${api}/overview`)).json.suppressed, before + 1);
  const bounced = (await support.get(`${api}/deliveries?source=campaign&search=${encodeURIComponent(email)}`)).json.results.find((item) => item.id === row.id);
  assert.ok(bounced.bouncedAt);
  assert.match(bounced.providerStatus, /^Bounced/);

  // Unknown or malformed events don't break the webhook (Postmark would keep retrying)
  assert.equal((await webhook({ RecordType: "SomethingNew" })).status, 200);
  assert.equal((await webhook({ hello: "world" })).status, 200);
});

test("Postmark webhook is closed to anyone without the secret", async () => {
  const response = await actor().post("/api/v1/public/postmark/webhook", { RecordType: "Open" });
  assert.ok([401, 503].includes(response.status));
});

// ── Phase 10: Mail sent through Postmark, drafts, merge fields, invoices ──
test("Mail: sent as \"Name via PitchProX\" with replies to the sender; status follows Postmark", needsSetup(), async () => {
  const customer = await newCustomer("mailpm");
  const me = (await customer.get("/api/v1/me")).json.user;
  const to = `mail-to-${RUN}@test.dev`;
  const sent = await customer.post("/api/v1/mail/messages", { to, cc: `mail-cc-${RUN}@test.dev`, subject: "Quick follow-up", body: "Hi there,\n\nLine one\nline two", trackOpens: false });
  assert.equal(sent.status, 201, JSON.stringify(sent.json));
  const message = await waitFor(() => received.find((item) => item.body.To === to), "the Mail email");
  assert.equal(message.body.From, '"mailpm Tester via PitchProX" <no-reply@pitchprox.com>');
  assert.equal(message.body.ReplyTo, me.email);
  assert.equal(message.body.Cc, `mail-cc-${RUN}@test.dev`);
  assert.equal(message.body.MessageStream, "outbound");
  assert.equal(message.body.Tag, "mail");
  assert.equal(message.body.TrackOpens, false, "the sender's Track email switch");
  assert.equal(message.body.TrackLinks, "None", "links stay as written");
  assert.match(message.body.HtmlBody, /<p[^>]*>Hi there,<\/p><p[^>]*>Line one<br>line two<\/p>/);

  const id = sent.json.message.id;
  for (let attempt = 0; attempt < 20 && (await customer.get(`/api/v1/mail/messages/${id}`)).json.message.status !== "sent"; attempt += 1) await new Promise((resolve) => setTimeout(resolve, 250));
  assert.equal((await customer.get(`/api/v1/mail/messages/${id}`)).json.message.status, "sent");
  await webhook({ RecordType: "Delivery", MessageID: message.messageId, Recipient: to });
  assert.equal((await customer.get(`/api/v1/mail/messages/${id}`)).json.message.status, "delivered");
  await webhook({ RecordType: "Open", MessageID: message.messageId, Recipient: to });
  const opened = (await customer.get(`/api/v1/mail/messages/${id}`)).json.message;
  assert.equal(opened.status, "opened");
  assert.ok(opened.sentAt && opened.deliveredAt && opened.openedAt);

  // A hard bounce blocks further emails to that address
  await webhook({ RecordType: "Bounce", Type: "HardBounce", Inactive: true, MessageID: message.messageId, Email: to });
  assert.equal((await customer.get(`/api/v1/mail/messages/${id}`)).json.message.status, "bounced");
  const again = await customer.post("/api/v1/mail/messages", { to, subject: "Again", body: "Hello" });
  assert.equal(again.status, 409);
  assert.match(again.json.error, /bounced/);
});

test("Mail drafts: private, editable, sent once; merge fields filled or the send stops", needsSetup(), async () => {
  const customer = await newCustomer("maildraft");
  const other = await newCustomer("maildraft2");
  assert.equal((await customer.post("/api/v1/mail/messages", { draft: true })).status, 400, "nothing to save");
  assert.equal((await customer.post("/api/v1/mail/messages", { draft: true, to: "not-an-email" })).status, 400);
  const draft = await customer.post("/api/v1/mail/messages", { draft: true, subject: "Half written" });
  assert.equal(draft.status, 201);
  assert.equal(draft.json.message.status, "draft");
  const id = draft.json.message.id;
  assert.equal((await other.get(`/api/v1/mail/messages/${id}`)).status, 404);
  assert.equal((await other.patch(`/api/v1/mail/messages/${id}`, { subject: "x" })).status, 404);
  assert.equal((await other.del(`/api/v1/mail/messages/${id}`)).status, 404);

  // Merge fields come from the prospect with that address
  const prospectEmail = `merge-${RUN}@test.dev`;
  await customer.post("/api/v1/crm/prospects", { name: "Jamie Rivera", email: prospectEmail, propertyAddress: "12 Oak St", stage: "New", status: "Warm" });
  const edited = await customer.patch(`/api/v1/mail/messages/${id}`, { to: prospectEmail, subject: "About {Property Address}", body: "Hi {First Name},\n\nThanks!" });
  assert.equal(edited.json.message.status, "draft");
  assert.equal(edited.json.message.subject, "About {Property Address}", "drafts keep the merge fields");
  assert.equal((await customer.patch(`/api/v1/mail/messages/${id}`, { send: true, to: prospectEmail, subject: "", body: "x" })).status, 400, "a send needs a subject");
  const sent = await customer.patch(`/api/v1/mail/messages/${id}`, { send: true, to: prospectEmail, subject: "About {Property Address}", body: "Hi {First Name},\n\nThanks!" });
  assert.equal(sent.status, 200, JSON.stringify(sent.json));
  assert.equal(sent.json.message.subject, "About 12 Oak St");
  assert.match(sent.json.message.body, /^Hi Jamie,/);
  const delivered = await waitFor(() => received.find((item) => item.body.To === prospectEmail), "the draft email");
  assert.match(delivered.body.HtmlBody, /Hi Jamie,/);
  assert.equal((await customer.patch(`/api/v1/mail/messages/${id}`, { subject: "late edit" })).status, 409, "sent emails can't change");
  assert.equal((await customer.del(`/api/v1/mail/messages/${id}`)).status, 409);

  // A merge field we can't fill stops the send and leaves nothing behind
  const before = (await customer.get("/api/v1/mail/messages")).json.count;
  const unknown = await customer.post("/api/v1/mail/messages", { to: `nobody-${RUN}@test.dev`, subject: "Hi", body: "Hi {First Name}" });
  assert.equal(unknown.status, 400);
  assert.match(unknown.json.error, /\{First Name\}/);
  assert.equal((await customer.get("/api/v1/mail/messages")).json.count, before);

  // Delete a draft
  const throwaway = (await customer.post("/api/v1/mail/messages", { draft: true, body: "temp" })).json.message;
  assert.equal((await customer.del(`/api/v1/mail/messages/${throwaway.id}`)).json.deleted, true);
  assert.equal((await customer.get(`/api/v1/mail/messages/${throwaway.id}`)).status, 404);
});

test("Invoice Management: billing staff and reps (own accounts); not customers", needsSetup(), async () => {
  const listed = await superAdmin.get("/api/v1/billing/invoices");
  assert.equal(listed.status, 200);
  assert.ok(Array.isArray(listed.json.results));
  assert.equal(typeof listed.json.paymentsConnected, "boolean");
  const rep = await signIn("ryan.anderson@pitchprox.test", PASSWORD);
  assert.equal((await rep.get("/api/v1/billing/invoices")).status, 200);
  const customer = await newCustomer("invoicecheck");
  assert.equal((await customer.get("/api/v1/billing/invoices")).status, 403);
  const orgId = (await customer.get("/api/v1/me")).json.user.organizationId;
  const history = await superAdmin.get(`/api/v1/billing/invoices?organizationId=${orgId}`);
  assert.equal(history.status, 200);
  assert.equal(history.json.account.company, "invoicecheck Tester Organization");
  assert.deepEqual(history.json.results, []);
  assert.equal((await rep.get(`/api/v1/billing/invoices?organizationId=${orgId}`)).status, 404, "not the rep's account");
  assert.equal((await superAdmin.get("/api/v1/billing/invoices?organizationId=org_missing")).status, 404);
});

// ── Phase 14: "See how it works" — video right away, link by email, a prospect for the sales team ──
test("See how it works: saved as a CRM prospect, video emailed, managers notified, watching recorded", needsSetup(), async () => {
  const visitor = actor();
  assert.equal((await visitor.post("/api/v1/public/demo-requests", { workEmail: "a@b.co" })).status, 400, "name required");
  assert.equal((await visitor.post("/api/v1/public/demo-requests", { fullName: "No Email", workEmail: "nope" })).status, 400);
  const email = `demo-${RUN}@test.dev`;
  const created = await visitor.post("/api/v1/public/demo-requests", {
    fullName: `Demo Visitor ${RUN}`, workEmail: email, phoneNumber: "(555) 700-0001", company: "Visitor Realty", roleDescription: "sales-manager", referralSource: "google", additionalNotes: "Team of 12",
  });
  assert.equal(created.status, 201, JSON.stringify(created.json));
  assert.match(created.json.id, /^demo_/);

  const message = await waitFor(() => received.find((item) => item.body.To === email), "the video email");
  assert.equal(message.body.Subject, "Your PitchProX video is ready");
  assert.ok(message.body.HtmlBody.includes(`/see-how-it-works?r=${created.json.id}`));
  assert.equal(message.body.MessageStream, "outbound");

  const prospect = (await manager.get("/api/v1/crm/prospects")).json.results.find((item) => item.email === email);
  assert.ok(prospect, "a prospect in PitchProX's CRM");
  assert.equal(prospect.propertyAddress, "Visitor Realty", "company in the company column");
  assert.match(prospect.notes, /Sales Manager \/ Director/);
  assert.match(prospect.notes, /Team of 12/);
  assert.equal(prospect.phones[0].number, "(555) 700-0001");
  const bell = (await manager.get("/api/v1/notifications?limit=50")).json.results.find((item) => item.title === `New demo request: Demo Visitor ${RUN}`);
  assert.ok(bell, "Admin Managers are told");
  assert.equal(bell.type, "lead");

  const events = `/api/v1/public/demo-requests/${created.json.id}/events`;
  assert.equal((await visitor.post(events, { event: "started" })).json.recorded, true);
  assert.equal((await visitor.post(events, { event: "completed" })).json.recorded, true);
  assert.equal((await visitor.post(events, { event: "liked" })).status, 400);
  assert.equal((await visitor.post("/api/v1/public/demo-requests/demo_missing/events", { event: "started" })).status, 404);

  // Plans for the pop-up, no sign-in needed
  const plans = (await actor().get("/api/v1/public/plans")).json.results;
  assert.ok(plans.some((plan) => plan.isTrial && plan.callsPerMonth === 10));
  assert.ok(plans.some((plan) => !plan.isTrial && /^\$\d/.test(plan.priceMonthly)), "paid plans with their price (other tests edit the prices)");
  // The emailed link opens the video page
  assert.equal((await actor().get(`/see-how-it-works?r=${created.json.id}`)).status, 200);
});

test("See how it works: 10 requests per hour per IP", async () => {
  const ip = `203.0.113.${Math.floor(Math.random() * 250) + 1}`;
  const send = (index) => fetch(`${process.env.BASE || "http://127.0.0.1:3000"}/api/v1/public/demo-requests`, { method: "POST", headers: { "Content-Type": "application/json", "X-Real-IP": ip }, body: JSON.stringify({ fullName: "Limit Test", workEmail: `limit-${RUN}-${index}@test.dev` }) });
  for (let index = 0; index < 10; index += 1) assert.equal((await send(index)).status, 201);
  assert.equal((await send(99)).status, 429);
});

// ── Phase 15: legal pages and data deletion requests ──
test("legal pages are public", async () => {
  for (const path of ["/privacy", "/terms", "/data-deletion"]) {
    const page = await actor().get(path);
    assert.equal(page.status, 200, path);
    assert.match(page.bytes.toString(), /Draft/, `${path} is marked as a draft for legal review`);
  }
});

test("data deletion: request, confirmation email, Super Admins told, staff close it", needsSetup(), async () => {
  const visitor = actor();
  assert.equal((await visitor.post("/api/v1/public/data-deletion", { email: "a@b.co", scope: "account" })).status, 400, "name required");
  assert.equal((await visitor.post("/api/v1/public/data-deletion", { name: "X", email: "a@b.co", scope: "everything" })).status, 400);
  assert.equal((await visitor.post("/api/v1/public/data-deletion", { name: "X", email: "a@b.co", scope: "other" })).status, 400, "other needs details");
  const email = `delete-me-${RUN}@test.dev`;
  const created = await visitor.post("/api/v1/public/data-deletion", { name: `Delete Me ${RUN}`, email, scope: "calls", details: "Only the recordings please" });
  assert.equal(created.status, 201, JSON.stringify(created.json));
  assert.match(created.json.reference, /^DEL-\d+$/);
  const confirmation = await waitFor(() => received.find((item) => item.body.To === email), "the confirmation email");
  assert.match(confirmation.body.Subject, new RegExp(created.json.reference));

  const bell = (await superAdmin.get("/api/v1/notifications?limit=50")).json.results.find((item) => item.title === `Data deletion request ${created.json.reference}`);
  assert.ok(bell, "Super Admins are told");
  assert.equal(bell.link, "/super-admin/compliance-audit/data-deletion");

  const list = await superAdmin.get("/api/v1/compliance/data-deletion?status=open");
  const row = list.json.results.find((item) => item.reference === created.json.reference);
  assert.ok(row);
  assert.equal(row.scopeLabel, "Call recordings and transcripts");
  assert.equal(row.isCustomer, false);
  assert.equal((await support.get("/api/v1/compliance/data-deletion")).status, 403, "Support has no Compliance section");
  const auditor = await signIn("jessica.lee@pitchprox.test", PASSWORD);
  assert.equal((await auditor.get("/api/v1/compliance/data-deletion")).status, 200, "Auditors can read");
  assert.equal((await auditor.patch(`/api/v1/compliance/data-deletion/${row.id}`, { status: "done" })).status, 403);

  assert.equal((await superAdmin.patch(`/api/v1/compliance/data-deletion/${row.id}`, { status: "rejected" })).status, 400, "a reason is required");
  assert.equal((await superAdmin.patch(`/api/v1/compliance/data-deletion/${row.id}`, { status: "in_progress" })).json.request.status, "in_progress");
  const done = await superAdmin.patch(`/api/v1/compliance/data-deletion/${row.id}`, { status: "done", note: "Recordings and transcripts removed." });
  assert.equal(done.json.request.status, "done");
  assert.ok(done.json.request.completedAt);
  await waitFor(() => received.find((item) => item.body.To === email && /has been deleted/.test(item.body.Subject)), "the done email");
  assert.equal((await superAdmin.patch(`/api/v1/compliance/data-deletion/${row.id}`, { status: "rejected", note: "x" })).status, 409, "closed requests stay closed");
});
