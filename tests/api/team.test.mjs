// Phase 4: the sales team (Super Admin → Sales Reps) — roster numbers, quotas, leaderboard,
// coaching and manager notes, rep settings and the activity log.
// Uses the demo staff from `npm run db:seed` (skipped when they aren't there).
import { test } from "node:test";
import assert from "node:assert/strict";
import { RUN, signIn } from "./helpers.mjs";

const PASSWORD = "password-123";
const [superAdmin, manager, support, rep, auditor] = await Promise.all(
  ["sarah.johnson", "mike.davis", "emily.brown", "ryan.anderson", "jessica.lee"].map((name) => signIn(`${name}@pitchprox.test`, PASSWORD).catch(() => null))
);
const needsStaff = () => ({ skip: !(superAdmin && manager && support && rep && auditor) && "demo staff not seeded (npm run test:db)" });
const base = "/api/v1/admin/sales-reps";
const thisMonth = () => new Date().toISOString().slice(0, 7);

let ryan;
async function ryanId() {
  if (ryan) return ryan;
  const team = await superAdmin.get(base);
  ryan = team.json.reps.find((item) => item.email === "ryan.anderson@pitchprox.test").id;
  return ryan;
}

test("sales reps: managers and Support can view; reps and auditors can't", needsStaff(), async () => {
  const team = await superAdmin.get(base);
  assert.equal(team.status, 200);
  assert.ok(team.json.reps.length >= 1);
  assert.deepEqual(team.json.distribution.map((tier) => tier.key), ["elite", "strong", "developing", "at-risk"]);
  const row = team.json.reps[0];
  for (const key of ["closed", "revenueCents", "leadToSubscription", "quotaCents", "attainment", "lastActiveAt"]) assert.ok(key in row, key);
  assert.equal(row.promptAdherence, null, "call scores wait for calling");
  assert.equal((await manager.get(base)).status, 200);
  assert.equal((await support.get(base)).status, 200);
  assert.equal((await rep.get(base)).status, 403);
  assert.equal((await auditor.get(base)).status, 403);
});

test("quotas: managers set them; they carry forward and drive attainment", needsStaff(), async () => {
  const id = await ryanId();
  assert.equal((await support.put(`${base}/quotas`, { quotas: [{ userId: id, quotaCents: 100000 }] })).status, 403, "Support views only");
  assert.equal((await superAdmin.put(`${base}/quotas`, { quotas: [{ userId: id, quotaCents: -5 }] })).status, 400);
  assert.equal((await superAdmin.put(`${base}/quotas`, { month: "2020-01", quotas: [{ userId: id, quotaCents: 100 }] })).status, 400, "past months are fixed");
  assert.equal((await superAdmin.put(`${base}/quotas`, { quotas: [{ userId: "user_nope", quotaCents: 100 }] })).status, 400);
  const saved = await manager.put(`${base}/quotas`, { quotas: [{ userId: id, quotaCents: 1234500 }] });
  assert.equal(saved.status, 200, JSON.stringify(saved.json));
  assert.equal(saved.json.quotas.find((item) => item.userId === id).quotaCents, 1234500);

  const team = await superAdmin.get(base);
  const row = team.json.reps.find((item) => item.id === id);
  assert.equal(row.quotaCents, 1234500);
  assert.equal(row.attainment, Math.round((row.revenueCents / 1234500) * 100));

  // A quota for next month applies from then on; this month keeps its own
  const [year, month] = thisMonth().split("-").map(Number);
  const next = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 7);
  assert.equal((await superAdmin.put(`${base}/quotas`, { month: next, quotas: [{ userId: id, quotaCents: 2000000 }] })).status, 200);
  assert.equal((await superAdmin.get(`${base}/quotas?month=${next}`)).json.quotas.find((item) => item.userId === id).quotaCents, 2000000);
  assert.equal((await superAdmin.get(`${base}/quotas`)).json.quotas.find((item) => item.userId === id).quotaCents, 1234500);
});

test("leaderboard: month, quarter and year", needsStaff(), async () => {
  for (const period of ["month", "quarter", "year"]) {
    const board = await support.get(`${base}/leaderboard?period=${period}`);
    assert.equal(board.status, 200);
    assert.equal(board.json.period, period);
    assert.ok(Array.isArray(board.json.reps));
  }
  assert.equal((await superAdmin.get(`${base}/leaderboard?period=decade`)).status, 400);
});

test("rep detail: numbers, history and edits", needsStaff(), async () => {
  const id = await ryanId();
  const detail = await support.get(`${base}/${id}`);
  assert.equal(detail.status, 200);
  assert.equal(detail.json.history.length, 6);
  assert.ok(detail.json.daily.length >= 28);
  assert.equal(detail.json.permissions.canManage, false);
  assert.deepEqual(detail.json.managerNotes, [], "Support doesn't see private notes");
  assert.equal((await superAdmin.get(`${base}/user_nope`)).status, 404);

  assert.equal((await support.patch(`${base}/${id}`, { jobTitle: "Closer" })).status, 403);
  const edited = await superAdmin.patch(`${base}/${id}`, { jobTitle: `Senior Closer ${RUN}`, phone: "(512) 555-0100", timezone: "(GMT-06:00) Central Time" });
  assert.equal(edited.status, 200, JSON.stringify(edited.json));
  assert.equal(edited.json.rep.jobTitle, `Senior Closer ${RUN}`);
  assert.equal((await superAdmin.patch(`${base}/${id}`, { name: "" })).status, 400);
  await superAdmin.patch(`${base}/${id}`, { jobTitle: "Senior Closer" });

  // Workspace settings are checked and saved
  assert.equal((await superAdmin.put(`${base}/${id}/settings`, { landingPage: "Nowhere" })).status, 400);
  assert.equal((await superAdmin.put(`${base}/${id}/settings`, { promptAdherenceAlert: 150 })).status, 400);
  const settings = await manager.put(`${base}/${id}/settings`, { landingPage: "Reports", exportData: false, lowTrustThreshold: -15 });
  assert.equal(settings.status, 200);
  assert.deepEqual([settings.json.settings.landingPage, settings.json.settings.exportData, settings.json.settings.lowTrustThreshold], ["Reports", false, -15]);
  assert.equal((await superAdmin.get(`${base}/${id}`)).json.settings.landingPage, "Reports");
});

test("coaching notes: managers write and complete; Support reads; manager notes stay private", needsStaff(), async () => {
  const id = await ryanId();
  assert.equal((await superAdmin.post(`${base}/${id}/notes`, { kind: "coaching", type: "Action Item", body: "No title" })).status, 400);
  assert.equal((await superAdmin.post(`${base}/${id}/notes`, { kind: "coaching", type: "Nope", title: "x", body: "y" })).status, 400);
  assert.equal((await support.post(`${base}/${id}/notes`, { kind: "coaching", title: "x", body: "y" })).status, 403);
  const added = await manager.post(`${base}/${id}/notes`, { kind: "coaching", type: "Action Item", title: `Recap faster ${RUN}`, body: "Send the recap within an hour.", priority: "High", dueDate: "2030-01-15" });
  assert.equal(added.status, 201, JSON.stringify(added.json));
  const noteId = added.json.note.id;
  assert.equal(added.json.note.authorName, "Mike Davis");

  const list = await support.get(`${base}/${id}/notes`);
  assert.equal(list.status, 200);
  assert.ok(list.json.notes.some((note) => note.id === noteId));
  assert.ok(list.json.focus.some((note) => note.id === noteId), "open action items are focus areas");

  const done = await superAdmin.patch(`${base}/${id}/notes/${noteId}`, { completed: true });
  assert.equal(done.status, 200);
  assert.ok(done.json.note.completedAt);
  // The author or a Super Admin may edit the text
  assert.equal((await superAdmin.patch(`${base}/${id}/notes/${noteId}`, { title: `Recap within an hour ${RUN}` })).status, 200);

  // Private manager notes
  const privateNote = await superAdmin.post(`${base}/${id}/notes`, { kind: "manager", body: "Ready for team lead." });
  assert.equal(privateNote.status, 201);
  assert.equal((await support.get(`${base}/${id}/notes?kind=manager`)).status, 403);
  assert.ok((await manager.get(`${base}/${id}`)).json.managerNotes.some((note) => note.id === privateNote.json.note.id));

  assert.equal((await manager.del(`${base}/${id}/notes/${privateNote.json.note.id}`)).status, 403, "not the author");
  assert.equal((await superAdmin.del(`${base}/${id}/notes/${privateNote.json.note.id}`)).status, 200);
  assert.equal((await manager.del(`${base}/${id}/notes/${noteId}`)).status, 200);
});

test("activity log: rep's own actions and changes to them, filterable", needsStaff(), async () => {
  const id = await ryanId();
  const all = await support.get(`${base}/${id}/activity?pageSize=50`);
  assert.equal(all.status, 200);
  assert.ok(all.json.results.some((row) => row.category === "Coaching"), "the notes above are logged");
  const coaching = await support.get(`${base}/${id}/activity?category=Coaching&performedBy=others`);
  assert.ok(coaching.json.results.every((row) => row.category === "Coaching" && !row.self));
  assert.equal((await support.get(`${base}/${id}/activity?category=Nope`)).status, 400);
});

test("coaching notes reach the rep, who can complete them", needsStaff(), async () => {
  const id = await ryanId();
  const added = await manager.post(`${base}/${id}/notes`, { kind: "coaching", type: "Action Item", title: `Practice the close ${RUN}`, body: "Role-play the pricing close twice this week.", priority: "Medium" });
  assert.equal(added.status, 201);
  const noteId = added.json.note.id;
  const mine = await rep.get("/api/v1/me/coaching-notes");
  assert.equal(mine.status, 200);
  assert.ok(mine.json.notes.some((note) => note.id === noteId && !note.completedAt));
  assert.ok(mine.json.notes.every((note) => note.kind === "coaching"), "manager notes stay private");
  const done = await rep.patch(`/api/v1/me/coaching-notes/${noteId}`, { completed: true });
  assert.equal(done.status, 200);
  assert.ok(done.json.note.completedAt);
  assert.equal((await support.get("/api/v1/me/coaching-notes")).status, 403, "only reps have their own notes");
  await manager.del(`${base}/${id}/notes/${noteId}`);
});
