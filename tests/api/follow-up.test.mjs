// Phase 8: Playbook Email Templates & Follow-Up (client's Google Doc). After the call, a draft is
// built from the ACTIVE playbook's template, filled only with real facts, never sent.
import { test } from "node:test";
import assert from "node:assert/strict";
import { RUN, actor, newCustomer, signIn } from "./helpers.mjs";

const PASSWORD = "password-123";
const [superAdmin, rep] = await Promise.all(["sarah.johnson", "ryan.anderson"].map((name) => signIn(`${name}@pitchprox.test`, PASSWORD).catch(() => null)));
const needsStaff = () => ({ skip: !(superAdmin && rep) && "demo staff not seeded (npm run test:db)" });
const builds = "/api/v1/admin/playbook-builds";

const draftFor = (user, template, body = {}) => user.post("/api/v1/follow-up/draft", { templateId: template.id, timeZone: "America/New_York", ...body });

test("follow-up drafts: Standard playbook templates, real facts only, contact rules", async () => {
  const customer = await newCustomer("followup");
  const options = await customer.get("/api/v1/follow-up");
  assert.equal(options.status, 200);
  assert.equal(options.json.playbook.id, "pitchprox-standard");
  assert.deepEqual(options.json.templates.map((item) => item.purpose), ["Appointment Confirmation", "Requested Information", "Agreed Follow-Up", "Post-Meeting Follow-Up", "Unresolved Objection Follow-Up"]);
  assert.equal(options.json.followUps.length, 5);
  assert.ok(options.json.facts.some((fact) => fact.key === "followUpAt"));
  const byPurpose = (purpose) => options.json.templates.find((item) => item.purpose === purpose);

  // A prospect the call can be matched to by phone number
  const prospect = await customer.post("/api/v1/crm/prospects", { name: "Dana Whitfield", email: `dana-${RUN}@test.dev`, phoneNumber: "(555) 201-7788", stage: "New", status: "Warm" });
  assert.equal(prospect.status, 201, JSON.stringify(prospect.json));

  const agreed = await draftFor(customer, byPurpose("Agreed Follow-Up"), { phoneNumber: "555-201-7788", leadName: "Someone Else", facts: { followUpAt: "2026-12-03T14:30", channel: "Phone call" } });
  assert.equal(agreed.status, 200, JSON.stringify(agreed.json));
  assert.equal(agreed.json.to, `dana-${RUN}@test.dev`);
  assert.equal(agreed.json.contact.name, "Dana Whitfield", "the phone number wins over the typed name");
  assert.match(agreed.json.body, /^Hi Dana,/);
  assert.match(agreed.json.body, /on Thursday, December 3 at 2:30 PM\./);
  assert.match(agreed.json.body, /by phone call\./);
  assert.match(agreed.json.body, /followup Tester/, "signed with the user's name");
  assert.ok(!agreed.json.body.includes("{"), "no placeholders left");
  assert.deepEqual(agreed.json.leftOut, []);

  // Nothing known about the appointment: those lines are left out, never invented
  const appointment = await draftFor(customer, byPurpose("Appointment Confirmation"), { phoneNumber: "5552017788" });
  assert.equal(appointment.json.subject, "Confirming our appointment");
  assert.ok(!/appointment on/i.test(appointment.json.body));
  assert.ok(!appointment.json.body.includes("{"));
  assert.ok(appointment.json.leftOut.includes("Appointment Date") && appointment.json.leftOut.includes("Meeting Topic"));
  assert.match(appointment.json.body, /If anything changes/);

  // No matching contact: the name typed for the call, no address
  const unknown = await draftFor(customer, byPurpose("Unresolved Objection Follow-Up"), { phoneNumber: "999", leadName: "Pat Jones", facts: { concern: "the commission rate" } });
  assert.equal(unknown.json.to, "");
  assert.equal(unknown.json.contact, null);
  assert.match(unknown.json.body, /^Hi Pat,/);
  assert.match(unknown.json.body, /concern regarding the commission rate/);
  const nameless = await draftFor(customer, byPurpose("Post-Meeting Follow-Up"), {});
  assert.match(nameless.json.body, /^Hi,\n/, "greeting without a name");

  // Only the active playbook's templates
  assert.equal((await draftFor(customer, { id: "v1-r0" })).status, 404);

  // Do Not Contact and unsubscribed addresses get no draft
  assert.equal((await customer.patch(`/api/v1/crm/prospects/${prospect.json.prospect.id}`, { outcome: "Do Not Contact" })).status, 200);
  const blocked = await draftFor(customer, byPurpose("Agreed Follow-Up"), { contactId: prospect.json.prospect.id, contactKind: "prospect" });
  assert.equal(blocked.status, 409);
  assert.match(blocked.json.error, /asked not to be contacted/);

  // Not for signed-out visitors or staff who don't run calls
  assert.equal((await actor().get("/api/v1/follow-up")).status, 401);
});

test("follow-up: premium playbook templates are the buyer's, read-only; the live AI never gets their text", needsStaff(), async () => {
  assert.equal((await superAdmin.get("/api/v1/follow-up")).status, 403);
  assert.equal((await rep.get("/api/v1/follow-up")).status, 200, "sales reps run calls too");

  const content = {
    playbookName: `Follow-Up PB ${RUN}`,
    author: "PitchProX Test",
    shortDescription: "Has email templates.",
    category: "sales-methodology",
    industry: "real-estate",
    experienceLevel: "intermediate",
    style: "consultative",
    leadTypes: ["Expired"],
    accessType: "free",
    price: "",
    visibility: "marketplace",
    tones: ["confident"],
    stages: [{ id: 1, title: "Opening" }, { id: 2, title: "Discovery" }, { id: 3, title: "Close" }],
    objections: [{ id: 1, title: "Too expensive", rootCategory: "Financial" }],
    resources: [
      { id: 1, name: "Opening script", type: "Script", content: "Hi, it's..." },
      { id: 2, name: "Listing appointment confirmation", type: "Email Template", purpose: "Appointment Confirmation", subject: "See you {Appointment Date}", content: "Hello {Prospect First Name},\nLooking forward to {Appointment Date} at {Appointment Time}.\nBring {Favorite Color}.\n{Your Name}" },
      { id: 3, name: "Confirm in writing", type: "Follow Up", followUpKind: "Appointment confirmed", templatePurpose: "Appointment Confirmation", content: "Confirm the same day." },
      { id: 4, name: "Callback", type: "Follow Up", followUpKind: "Call back later", templatePurpose: "Agreed Follow-Up", content: "Ask when." },
    ],
    aiFramework: { systemPrompt: "Coach the rep.", idealLength: "20 words", minLength: "10 words", maxLength: "25 words", doDontBoundaries: { dontList: ["Use pressure"], doList: ["Add value"] }, logicRules: [] },
  };
  const draft = (await superAdmin.post(builds, { content })).json.build;
  const checks = await superAdmin.get(`${builds}/${draft.id}/check`);
  const messages = checks.json.warnings.map((item) => item.message).join("\n");
  assert.match(messages, /Favorite Color/, "unknown placeholders are flagged");
  assert.match(messages, /"Agreed Follow-Up" email/, "a follow-up without its template is flagged");
  const published = await superAdmin.post(`${builds}/${draft.id}/publish`, { revision: draft.revision, acknowledgeWarnings: true });
  assert.equal(published.status, 200, JSON.stringify(published.json));
  const playbookId = published.json.playbookId;

  const buyer = await newCustomer("fubuyer");
  assert.equal((await buyer.put("/api/v1/playbooks/active", { playbookId })).status, 200);
  const options = (await buyer.get("/api/v1/follow-up")).json;
  assert.equal(options.playbook.id, playbookId);
  assert.deepEqual(options.templates.map((item) => item.name), ["Listing appointment confirmation"], "only the active playbook's templates");
  assert.deepEqual(options.followUps.map((item) => item.kind), ["Appointment confirmed", "Call back later"]);

  const filled = await draftFor(buyer, options.templates[0], { leadName: "Sam Reyes", facts: { appointmentAt: "2026-12-10T09:00" } });
  assert.equal(filled.json.subject, "See you Thursday, December 10");
  assert.equal(filled.json.body, "Hello Sam,\nLooking forward to Thursday, December 10 at 9:00 AM.\nfubuyer Tester");
  assert.deepEqual(filled.json.leftOut, ["Favorite Color"]);

  // The live-call AI export: templates without their text, both kinds marked after-call
  const runtime = (await buyer.get("/api/v1/me/playbook-runtime")).json.playbook;
  const template = runtime.resources.find((item) => item.type === "Email Template");
  assert.equal(template.use, "after_call");
  assert.equal(template.live_prompt, false);
  assert.equal(template.content, undefined);
  assert.equal(template.subject, undefined);
  assert.equal(template.purpose, "Appointment Confirmation");
  assert.equal(runtime.resources.find((item) => item.type === "Follow Up").use, "after_call");
  assert.equal(runtime.resources.find((item) => item.type === "Script").use, "live");

  // Back on Standard: the premium templates are no longer offered
  assert.equal((await buyer.put("/api/v1/playbooks/active", { playbookId: "pitchprox-standard" })).status, 200);
  assert.equal((await draftFor(buyer, options.templates[0])).status, 404);
});

test("Resource Library keeps an Email Template's purpose and subject", needsStaff(), async () => {
  const pinned = await superAdmin.post("/api/v1/admin/playbook-resources", { name: `FU template ${RUN}`, type: "Email Template", purpose: "Requested Information", subject: "Info for {Prospect First Name}", content: "Hi {Prospect First Name}" });
  assert.equal(pinned.status, 201, JSON.stringify(pinned.json));
  assert.equal(pinned.json.resource.purpose, "Requested Information");
  assert.equal(pinned.json.resource.subject, "Info for {Prospect First Name}");
  const updated = await superAdmin.patch(`/api/v1/admin/playbook-resources/${pinned.json.resource.id}`, { purpose: "Agreed Follow-Up" });
  assert.equal(updated.json.resource.purpose, "Agreed Follow-Up");
  assert.equal(updated.json.resource.subject, "Info for {Prospect First Name}");
  await superAdmin.del(`/api/v1/admin/playbook-resources/${pinned.json.resource.id}`);
});
