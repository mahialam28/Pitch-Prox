// Module 1.1 — Playbooks
import { test, before } from "node:test";
import assert from "node:assert/strict";
import { actor, newCustomer, signIn } from "./helpers.mjs";

const STANDARD = "pitchprox-standard";
let a, b;

before(async () => {
  a = await newCustomer("pb-a");
  b = await newCustomer("pb-b");
});

const wizardContent = {
  version: 1,
  form: { playbookName: "Alpha Method", leadType: ["FSBO", "Probate"], experienceLevel: "Intermediate" },
  phases: [{ id: 1, title: "Opening", badgeGoal: "Goal: Engage", icon: "Hand", color: "text-emerald-500 bg-emerald-50" }],
  objections: [{ id: 1, title: "Too expensive", category: "Financial", icon: "UserX", leadTypes: ["FSBO"] }],
  frameworkSteps: [{ id: "acknowledge", label: "Acknowledge", icon: "Mic" }],
};

test("requires sign-in", async () => {
  assert.equal((await actor().get("/api/v1/playbooks")).status, 401);
});

test("new account sees the 7 platform playbooks with Standard active", async () => {
  const { status, json } = await a.get("/api/v1/playbooks");
  assert.equal(status, 200);
  assert.equal(json.results.length, 7);
  assert.equal(json.activePlaybookId, STANDARD);
  const standard = json.results.find((p) => p.id === STANDARD);
  assert.deepEqual([standard.isAvailable, standard.isActive, standard.isCustom], [true, true, false]);
  const premium = json.results.filter((p) => p.kind === "premium");
  assert.equal(premium.length, 6);
  assert.ok(premium.every((p) => !p.isAvailable && p.price === "$49.00"));
});

test("premium playbooks can't be activated before purchase", async () => {
  const res = await a.put("/api/v1/playbooks/active", { playbookId: "spin-selling" });
  assert.equal(res.status, 400);
  assert.match(res.json.error, /Purchase/);
});

test("unknown playbook → 404, missing id → 400", async () => {
  assert.equal((await a.put("/api/v1/playbooks/active", { playbookId: "nope" })).status, 404);
  assert.equal((await a.put("/api/v1/playbooks/active", {})).status, 400);
});

test("validation on create", async () => {
  assert.equal((await a.post("/api/v1/playbooks", { title: "  " })).status, 400);
  assert.equal((await a.post("/api/v1/playbooks", { title: "X", status: "live" })).status, 400);
  assert.equal((await a.post("/api/v1/playbooks", { title: "X", content: [1, 2] })).status, 400);
  assert.equal((await a.post("/api/v1/playbooks", { title: "X", content: { blob: "x".repeat(300 * 1024) } })).status, 400);
  assert.equal((await a.post("/api/v1/playbooks", undefined, { raw: "{bad" })).status, 400);
});

let draftId;
test("save a draft from the wizard; content round-trips", async () => {
  const res = await a.post("/api/v1/playbooks", { title: " Alpha Method ", description: "My way", status: "draft", content: wizardContent });
  assert.equal(res.status, 201);
  draftId = res.json.playbook.id;
  assert.deepEqual([res.json.playbook.title, res.json.playbook.status, res.json.playbook.isCustom, res.json.playbook.isAvailable], ["Alpha Method", "draft", true, false]);
  const fetched = await a.get(`/api/v1/playbooks/${draftId}`);
  assert.deepEqual(fetched.json.playbook.content, wizardContent);
});

test("drafts can't be activated", async () => {
  const res = await a.put("/api/v1/playbooks/active", { playbookId: draftId });
  assert.equal(res.status, 400);
  assert.match(res.json.error, /Publish/);
});

test("other companies can't see or change the custom playbook", async () => {
  assert.equal((await b.get(`/api/v1/playbooks/${draftId}`)).status, 404);
  assert.equal((await b.patch(`/api/v1/playbooks/${draftId}`, { title: "hacked" })).status, 404);
  assert.equal((await b.del(`/api/v1/playbooks/${draftId}`)).status, 404);
  assert.equal((await b.put("/api/v1/playbooks/active", { playbookId: draftId })).status, 404);
  const list = await b.get("/api/v1/playbooks");
  assert.equal(list.json.results.length, 7);
});

test("publish with activate makes it the active playbook", async () => {
  const res = await a.patch(`/api/v1/playbooks/${draftId}`, { title: "Alpha Method v2", status: "published", activate: true });
  assert.equal(res.status, 200);
  assert.deepEqual([res.json.playbook.title, res.json.playbook.status, res.json.playbook.isActive], ["Alpha Method v2", "published", true]);
  const list = await a.get("/api/v1/playbooks");
  assert.equal(list.json.activePlaybookId, draftId);
  assert.equal(list.json.results[0].id, draftId, "custom playbooks are listed first");
  assert.equal(list.json.results.filter((p) => p.isActive).length, 1);
});

test("partial edits keep the rest", async () => {
  await a.patch(`/api/v1/playbooks/${draftId}`, { description: "Updated" });
  const { json } = await a.get(`/api/v1/playbooks/${draftId}`);
  assert.deepEqual([json.playbook.title, json.playbook.description, json.playbook.status], ["Alpha Method v2", "Updated", "published"]);
  assert.deepEqual(json.playbook.content, wizardContent);
  assert.equal((await a.patch(`/api/v1/playbooks/${draftId}`, {})).status, 400);
});

test("switching back to Standard", async () => {
  const res = await a.put("/api/v1/playbooks/active", { playbookId: STANDARD });
  assert.equal(res.status, 200);
  assert.equal((await a.get("/api/v1/playbooks")).json.activePlaybookId, STANDARD);
});

test("platform playbooks can't be edited or deleted", async () => {
  assert.equal((await a.patch(`/api/v1/playbooks/${STANDARD}`, { title: "Mine now" })).status, 403);
  assert.equal((await a.del("/api/v1/playbooks/spin-selling")).status, 403);
});

test("a saved choice the user can no longer use falls back to Standard", async () => {
  // Preferences accepts any id; the playbooks API decides what is actually active
  assert.equal((await a.put("/api/v1/settings/preferences", { defaultPlaybook: "meddic" })).status, 200);
  assert.equal((await a.get("/api/v1/playbooks")).json.activePlaybookId, STANDARD);
});

test("deleting the active custom playbook falls back to Standard", async () => {
  await a.put("/api/v1/playbooks/active", { playbookId: draftId });
  assert.equal((await a.del(`/api/v1/playbooks/${draftId}`)).status, 200);
  assert.equal((await a.get(`/api/v1/playbooks/${draftId}`)).status, 404);
  assert.equal((await a.get("/api/v1/playbooks")).json.activePlaybookId, STANDARD);
});

test("preferences still save font size (settings helper was refactored)", async () => {
  assert.equal((await a.put("/api/v1/settings/preferences", { fontSize: 130 })).status, 200);
  const { json } = await a.get("/api/v1/settings/preferences");
  assert.equal(json.preferences.fontSize, 130);
  assert.equal((await a.get("/api/v1/settings/notifications")).json.notifications.inAppNotifications, "in-app-email");
});

test("staff roles can't use customer playbooks", { skip: !process.env.ADMIN_EMAIL && "set ADMIN_EMAIL/ADMIN_PASSWORD" }, async () => {
  const admin = await signIn(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
  assert.equal((await admin.get("/api/v1/playbooks")).status, 403);
  assert.equal((await admin.post("/api/v1/playbooks", { title: "x" })).status, 403);
});
