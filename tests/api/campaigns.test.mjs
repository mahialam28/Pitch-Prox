// Phase 5: Campaigns & Journeys — segments, templates, broadcasts, journeys, transactional
// emails and the job runner. Uses the demo staff from `npm run db:seed` (skipped when absent).
import { test } from "node:test";
import assert from "node:assert/strict";
import { RUN, actor, newCustomer, signIn } from "./helpers.mjs";

const PASSWORD = "password-123";
const [superAdmin, manager, support, rep, auditor] = await Promise.all(
  ["sarah.johnson", "mike.davis", "emily.brown", "ryan.anderson", "jessica.lee"].map((name) => signIn(`${name}@pitchprox.test`, PASSWORD).catch(() => null))
);
const needsStaff = () => ({ skip: !(superAdmin && manager && support && rep && auditor) && "demo staff not seeded (npm run test:db)" });
const api = "/api/v1/campaigns";
const runJobs = async () => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const result = await superAdmin.post("/api/v1/jobs/run");
    assert.equal(result.status, 200, JSON.stringify(result.json));
    if (!result.json.skipped) return result.json;
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  throw new Error("job runner stayed busy");
};
const userIdOf = async (email) => (await superAdmin.get(`${api}/segments`)).json.users.find((user) => user.email === email)?.id;

test("campaigns: Super Admin and Admin Manager change; Support views; reps and auditors can't", needsStaff(), async () => {
  const overview = await support.get(`${api}/segments`);
  assert.equal(overview.status, 200);
  assert.ok(overview.json.segments.some((segment) => segment.systemKey === "trial-ending" && segment.type === "Dynamic"), "system segments are seeded");
  assert.ok(Array.isArray(overview.json.users));
  assert.equal((await support.post(`${api}/segments`, { type: "Static", name: "x", userIds: [] })).status, 403);
  assert.equal((await rep.get(`${api}/segments`)).status, 403);
  assert.equal((await auditor.get(`${api}/templates`)).status, 403);
  assert.equal((await manager.get(`${api}/overview`)).status, 200);
  assert.equal((await rep.post("/api/v1/jobs/run")).status, 403, "only Super Admins run jobs by hand");
  assert.equal((await actor().post("/api/v1/jobs/run")).status, 401);
});

test("segments: rules are checked; dynamic membership follows the rules; static lists are kept", needsStaff(), async () => {
  const email = `seg-${RUN}@test.dev`;
  await (await newCustomer(`seg`)).get("/api/v1/me");
  assert.equal((await manager.post(`${api}/segments`, { type: "Dynamic", name: `Bad ${RUN}`, rules: { match: "all", conditions: [{ field: "plan", operator: "Before", value: "x" }] } })).status, 400);
  assert.equal((await manager.post(`${api}/segments`, { type: "Dynamic", name: `Bad ${RUN}`, rules: { match: "all", conditions: [] } })).status, 400);
  const dynamic = await manager.post(`${api}/segments`, { type: "Dynamic", name: `New trials ${RUN}`, rules: { match: "all", conditions: [{ field: "trialStatus", operator: "Is", value: "Active Trial" }, { field: "signupDate", operator: "Within Last", value: 1 }] } });
  assert.equal(dynamic.status, 201, JSON.stringify(dynamic.json));
  const userId = await userIdOf(email);
  assert.ok(userId, "the new self sign-up has a profile");
  assert.ok(dynamic.json.segment.memberIds.includes(userId), "a fresh trial matches");
  assert.equal((await manager.post(`${api}/segments`, { type: "Dynamic", name: `New trials ${RUN}`, rules: dynamic.json.segment.rules })).status, 409, "names are unique");

  const fixed = await manager.post(`${api}/segments`, { type: "Static", name: `Hand-picked ${RUN}`, userIds: [userId] });
  assert.equal(fixed.status, 201);
  assert.deepEqual(fixed.json.segment.memberIds, [userId]);
  assert.equal((await manager.post(`${api}/segments/${dynamic.json.segment.id}/users`, { userIds: [userId] })).status, 400, "only static segments take users by hand");
  const system = (await manager.get(`${api}/segments`)).json.segments.find((segment) => segment.systemKey === "high-usage");
  assert.equal((await superAdmin.del(`${api}/segments/${system.id}`)).status, 409, "built-in segments stay");
  const threshold = await superAdmin.patch(`${api}/segments/${system.id}`, { rules: { match: "all", conditions: [{ field: "callUsagePct", operator: "Greater Than or Equal To", value: 90 }] } });
  assert.equal(threshold.status, 200, "the usage threshold is part of the rule");
  await superAdmin.patch(`${api}/segments/${system.id}`, { rules: { match: "all", conditions: [{ field: "callUsagePct", operator: "Greater Than or Equal To", value: 80 }] } });
  assert.equal((await manager.del(`${api}/segments/${dynamic.json.segment.id}`)).status, 200);
});

test("templates: fields, creation methods, HTML clean-up, transactional triggers, preview", needsStaff(), async () => {
  const list = await support.get(`${api}/templates`);
  assert.ok(list.json.results.some((template) => template.name === "Trial Welcome" && template.creationMethod === "build"), "starter templates exist");
  const base = { name: `Tpl ${RUN}`, emailType: "Lifecycle", category: "Onboarding", subject: "Hi {First Name}", fromName: "PitchProX", creationMethod: "build", content: { heading: "Hello", body: "Text", buttonLabel: "Go", buttonUrl: "https://pitchprox.com" } };
  assert.equal((await manager.post(`${api}/templates`, { ...base, emailType: "Newsletter" })).status, 400);
  assert.equal((await manager.post(`${api}/templates`, { ...base, category: "Leads" })).status, 400);
  assert.equal((await manager.post(`${api}/templates`, { ...base, triggerEvent: "payment_failed" })).status, 400, "only transactional templates have triggers");
  assert.equal((await manager.post(`${api}/templates`, { ...base, content: { ...base.content, buttonUrl: "javascript:alert(1)" } })).status, 400);
  const built = await manager.post(`${api}/templates`, base);
  assert.equal(built.status, 201, JSON.stringify(built.json));
  assert.equal(built.json.template.status, "Draft");

  const html = await manager.post(`${api}/templates`, { ...base, name: `Html ${RUN}`, creationMethod: "html", content: undefined, html: '<html><body><p onclick="x()">Hi {First Name}</p><script>alert(1)</script></body></html>' });
  assert.equal(html.status, 201, JSON.stringify(html.json));
  assert.ok(!/script|onclick/i.test(html.json.template.html), "scripts and handlers are removed");
  const preview = await support.get(`${api}/templates/${html.json.template.id}/preview`);
  assert.equal(preview.status, 200);
  assert.match(preview.bytes.toString(), /Hi Jordan/);

  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");
  const form = new FormData();
  form.append("file", new File([png], "design.png", { type: "image/png" }));
  const asset = await manager.post(`${api}/assets`, form);
  assert.equal(asset.status, 201, JSON.stringify(asset.json));
  const image = await actor().get(`/api/v1/public/campaign-assets/${asset.json.assetId}`);
  assert.equal(image.status, 200, "design images are public so they load in email apps");
  const design = await manager.post(`${api}/templates`, { ...base, name: `Design ${RUN}`, creationMethod: "design", content: { images: [{ assetId: asset.json.assetId, alt: "Banner", link: "https://pitchprox.com" }], cta: { on: true, label: "Start", url: "https://pitchprox.com", color: "#0EADAB" } } });
  assert.equal(design.status, 201, JSON.stringify(design.json));
  assert.equal((await manager.post(`${api}/templates`, { ...base, name: `Design2 ${RUN}`, creationMethod: "design", content: { images: [{ assetId: asset.json.assetId, alt: "" }] } })).status, 400, "alt text is required");

  // One Active transactional template per event
  const tx = { ...base, emailType: "Transactional", category: "Billing", triggerEvent: "call_bundle_purchased", status: "Active" };
  const first = await manager.post(`${api}/templates`, { ...tx, name: `Tx ${RUN}` });
  assert.equal(first.status, 201, JSON.stringify(first.json));
  assert.equal((await manager.post(`${api}/templates`, { ...tx, name: `Tx2 ${RUN}` })).status, 409);
  await manager.patch(`${api}/templates/${first.json.template.id}`, { status: "Archived" });

  assert.equal((await manager.del(`${api}/templates/${built.json.template.id}`)).json.archived, false, "unused templates are deleted");
});

test("broadcasts: Active non-transactional templates only; send now and schedule/cancel", needsStaff(), async () => {
  const customer = await newCustomer("bcast");
  await customer.get("/api/v1/me");
  const userId = await userIdOf(`bcast-${RUN}@test.dev`);
  const segment = (await manager.post(`${api}/segments`, { type: "Static", name: `Broadcast ${RUN}`, userIds: [userId] })).json.segment;
  const template = (await manager.post(`${api}/templates`, { name: `Promo ${RUN}`, emailType: "Marketing", category: "Promotional", subject: "News for {Company}", fromName: "PitchProX", creationMethod: "build", status: "Active", content: { heading: "News", body: "Hello {First Name}" } })).json.template;
  const draft = (await manager.post(`${api}/templates`, { name: `Promo draft ${RUN}`, emailType: "Marketing", category: "Promotional", subject: "x", fromName: "PitchProX", creationMethod: "build", content: { heading: "x", body: "x" } })).json.template;

  assert.equal((await manager.post(`${api}/broadcasts`, { name: "x", segmentId: segment.id, templateId: draft.id, sendOption: "now" })).status, 400, "draft templates can't be sent");
  assert.equal((await manager.post(`${api}/broadcasts`, { name: "x", segmentId: segment.id, templateId: template.id, sendOption: "schedule", scheduledAt: new Date(Date.now() - 60000).toISOString() })).status, 400);
  assert.equal((await manager.post(`${api}/broadcasts`, { name: "x", segmentId: segment.id, templateId: template.id, sendOption: "now", optimizeSendTime: true })).status, 400, "send-time optimization isn't on");

  const sent = await manager.post(`${api}/broadcasts`, { name: `Now ${RUN}`, segmentId: segment.id, templateId: template.id, sendOption: "now" });
  assert.equal(sent.status, 201, JSON.stringify(sent.json));
  assert.equal(sent.json.campaign.status, "sent");
  assert.equal(sent.json.campaign.recipients, 1);
  assert.equal(sent.json.campaign.stats.queued, 1, "waits in the outbox until an email service is connected");
  const outbox = await support.get(`${api}/deliveries?source=campaign&pageSize=50`);
  assert.ok(outbox.json.results.some((row) => row.email === `bcast-${RUN}@test.dev` && /bcast tester organization/i.test(row.subject)), "merge fields are filled in");

  const later = await manager.post(`${api}/broadcasts`, { name: `Later ${RUN}`, segmentId: segment.id, templateId: template.id, sendOption: "schedule", scheduledAt: new Date(Date.now() + 86400000).toISOString() });
  assert.equal(later.json.campaign.status, "scheduled");
  assert.equal((await support.post(`${api}/broadcasts/${later.json.campaign.id}/cancel`)).status, 403);
  assert.equal((await manager.post(`${api}/broadcasts/${later.json.campaign.id}/cancel`)).json.campaign.status, "canceled");
  assert.equal((await manager.post(`${api}/broadcasts/${later.json.campaign.id}/cancel`)).status, 409);
});

test("journeys + transactional: events enroll users, steps run, exits apply, tests queue", needsStaff(), async () => {
  const lifecycle = (await manager.post(`${api}/templates`, { name: `Welcome ${RUN}`, emailType: "Lifecycle", category: "Onboarding", subject: "Welcome {First Name}", fromName: "PitchProX", creationMethod: "build", status: "Active", content: { heading: "Welcome", body: "Hi" } })).json.template;
  const draftJourney = await manager.post(`${api}/journeys`, {
    name: `Signup journey ${RUN}`,
    triggerConfig: { type: "User Event", event: "user_signed_up" },
    audience: { type: "All Eligible Users" },
    reentry: { mode: "Never" },
    exitConditions: [{ type: "Subscription Cancelled" }],
    goal: "Calibration Completed",
    steps: [{ id: "e1", type: "email", templateId: null }],
  });
  assert.equal(draftJourney.status, 201, JSON.stringify(draftJourney.json));
  const id = draftJourney.json.journey.id;
  assert.equal((await manager.post(`${api}/journeys/${id}/status`, { action: "publish" })).status, 400, "email steps need an Active template to publish");
  const updated = await manager.patch(`${api}/journeys/${id}`, { steps: [{ id: "e1", type: "email", templateId: lifecycle.id }, { id: "d1", type: "delay", amount: 2, unit: "day" }, { id: "t1", type: "tag", tag: `Welcomed ${RUN}` }] });
  assert.equal(updated.status, 200, JSON.stringify(updated.json));
  assert.equal(updated.json.journey.steps[1].title, "Wait 2 days", "steps get default titles");
  assert.equal((await manager.post(`${api}/journeys/${id}/status`, { action: "publish" })).json.status, "active");

  // A transactional email on the same event
  const tx = await manager.post(`${api}/templates`, { name: `Signup receipt ${RUN}`, emailType: "Transactional", category: "Account", subject: "Account created", fromName: "PitchProX", creationMethod: "build", status: "Active", triggerEvent: "user_signed_up", content: { heading: "Account created", body: "Hi" } });
  assert.equal(tx.status, 201, JSON.stringify(tx.json));

  await newCustomer("journey");
  const email = `journey-${RUN}@test.dev`;
  const pass = await runJobs();
  assert.ok(pass.enrolled >= 1 && pass.transactional >= 1, JSON.stringify(pass));
  const enrollments = await support.get(`${api}/journeys/${id}/enrollments`);
  const mine = enrollments.json.results.find((row) => row.email === email);
  assert.ok(mine, "the new user entered the journey");
  assert.equal(mine.status, "active", "waiting on the 2-day step");
  const outbox = (await support.get(`${api}/deliveries?pageSize=100&search=${encodeURIComponent(email)}`)).json.results.filter((row) => row.email === email);
  assert.ok(outbox.some((row) => row.subject === "Welcome Journey") || outbox.some((row) => /Welcome/.test(row.subject)), "journey email queued");
  assert.ok(outbox.some((row) => row.subject === "Account created"), "transactional email queued");

  const again = await runJobs();
  assert.equal((await support.get(`${api}/journeys/${id}/enrollments`)).json.results.filter((row) => row.email === email).length, 1, "the same event never enrolls twice");
  assert.ok(again.events === 0 || again.enrolled === 0);

  assert.equal((await manager.post(`${api}/journeys/${id}/test`, { email: "qa@pitchprox.test" })).json.emails, 1);
  assert.equal((await manager.post(`${api}/journeys/${id}/status`, { action: "pause" })).json.status, "paused");
  assert.equal((await manager.post(`${api}/journeys/${id}/status`, { action: "archive" })).json.archived, true);
  await manager.patch(`${api}/templates/${tx.json.template.id}`, { status: "Archived" });
});

test("unsubscribe links must be genuine; overview reports the outbox", needsStaff(), async () => {
  const bad = await actor().get("/api/v1/public/unsubscribe?e=abc&s=def");
  assert.equal(bad.status, 200);
  assert.match(bad.bytes.toString(), /isn't valid/);
  const overview = await support.get(`${api}/overview`);
  assert.equal(overview.status, 200);
  assert.equal(typeof overview.json.providerConnected, "boolean");
  assert.ok(overview.json.mail.queued >= 1);
  assert.ok(overview.json.lastRun?.finishedAt, "the runner records its last pass");
});
