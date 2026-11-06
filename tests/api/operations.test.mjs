// Phase 4: operations — Support Dashboard, announcements, staff email templates and
// Performance Analytics. Uses the demo staff from `npm run db:seed` (skipped when they aren't there).
import { test } from "node:test";
import assert from "node:assert/strict";
import { RUN, signIn } from "./helpers.mjs";

const PASSWORD = "password-123";
const [superAdmin, manager, support, rep, auditor] = await Promise.all(
  ["sarah.johnson", "mike.davis", "emily.brown", "ryan.anderson", "jessica.lee"].map((name) => signIn(`${name}@pitchprox.test`, PASSWORD).catch(() => null))
);
const needsStaff = () => ({ skip: !(superAdmin && manager && support && rep && auditor) && "demo staff not seeded (npm run test:db)" });

test("support dashboard: Super Admin and Support; ranges; CSV export", needsStaff(), async () => {
  for (const range of ["7d", "30d"]) {
    const dashboard = await support.get(`/api/v1/support/dashboard?range=${range}`);
    assert.equal(dashboard.status, 200);
    for (const key of ["kpis", "volume", "status", "queue", "workload", "performance", "activity", "attention"]) assert.ok(key in dashboard.json, key);
    assert.equal(dashboard.json.kpis.csat, null, "CSAT needs surveys");
  }
  assert.equal((await superAdmin.get("/api/v1/support/dashboard")).status, 200);
  assert.equal((await support.get("/api/v1/support/dashboard?range=1y")).status, 400);
  assert.equal((await manager.get("/api/v1/support/dashboard")).status, 403, "Admin Manager has no Support section");
  assert.equal((await rep.get("/api/v1/support/dashboard")).status, 403);
  const csv = await support.get("/api/v1/support/dashboard/export?range=30d");
  assert.equal(csv.status, 200);
  assert.match(csv.bytes.toString(), /^"Ticket","Subject"/);
});

test("announcements: managers post for an audience; others see only theirs and can dismiss", needsStaff(), async () => {
  assert.equal((await rep.post("/api/v1/announcements", { title: "x", body: "y" })).status, 403, "reps don't post");
  assert.equal((await auditor.post("/api/v1/announcements", { title: "x", body: "y" })).status, 403);
  assert.equal((await superAdmin.post("/api/v1/announcements", { title: "", body: "y" })).status, 400);
  assert.equal((await superAdmin.post("/api/v1/announcements", { title: "x", body: "y", audience: "Everyone ever" })).status, 400);
  const past = new Date(Date.now() - 86400000).toISOString();
  assert.equal((await superAdmin.post("/api/v1/announcements", { title: "x", body: "y", publishAt: past })).status, 400);

  const forReps = await superAdmin.post("/api/v1/announcements", { title: `Reps only ${RUN}`, body: "Quota reset Monday.", priority: "important", audience: "All Sales Reps" });
  assert.equal(forReps.status, 201, JSON.stringify(forReps.json));
  const forSupport = await manager.post("/api/v1/announcements", { title: `Support only ${RUN}`, body: "New macros.", audience: "Support Team" });
  assert.equal(forSupport.status, 201);
  const later = await superAdmin.post("/api/v1/announcements", { title: `Later ${RUN}`, body: "Soon.", publishAt: new Date(Date.now() + 2 * 86400000).toISOString() });
  assert.equal(later.json.announcement.status, "scheduled");

  const repView = await rep.get("/api/v1/announcements?tab=active");
  assert.ok(repView.json.results.some((item) => item.id === forReps.json.announcement.id));
  assert.ok(!repView.json.results.some((item) => item.id === forSupport.json.announcement.id), "not for reps");
  assert.equal(repView.json.canManage, false);
  assert.deepEqual((await rep.get("/api/v1/announcements?tab=scheduled")).json.results, [], "only managers see scheduled ones");
  assert.ok((await superAdmin.get("/api/v1/announcements?tab=scheduled")).json.results.some((item) => item.id === later.json.announcement.id));

  // Dismiss hides it for that person only
  assert.equal((await rep.post(`/api/v1/announcements/${forReps.json.announcement.id}/dismiss`)).status, 200);
  assert.ok(!(await rep.get("/api/v1/announcements")).json.results.some((item) => item.id === forReps.json.announcement.id));
  assert.equal((await rep.post(`/api/v1/announcements/${forSupport.json.announcement.id}/dismiss`)).status, 404, "not in their audience");

  // Author or Super Admin edits/archives; published ones can't be deleted
  assert.equal((await support.patch(`/api/v1/announcements/${forReps.json.announcement.id}`, { archived: true })).status, 403);
  assert.equal((await superAdmin.patch(`/api/v1/announcements/${forSupport.json.announcement.id}`, { title: `Support macros ${RUN}` })).status, 200, "Super Admin edits anyone's");
  assert.equal((await superAdmin.del(`/api/v1/announcements/${forReps.json.announcement.id}`)).status, 409);
  const archived = await superAdmin.patch(`/api/v1/announcements/${forReps.json.announcement.id}`, { archived: true });
  assert.equal(archived.json.announcement.status, "archived");
  assert.equal((await superAdmin.del(`/api/v1/announcements/${later.json.announcement.id}`)).status, 200);
  await manager.patch(`/api/v1/announcements/${forSupport.json.announcement.id}`, { archived: true });
});

test("email templates: built-in library, personal and team templates", needsStaff(), async () => {
  const list = await rep.get("/api/v1/mail/templates");
  assert.equal(list.status, 200);
  assert.ok(list.json.results.some((item) => item.scope === "library"));
  assert.equal(list.json.canShare, false);

  assert.equal((await rep.post("/api/v1/mail/templates", { title: "x", category: "Nope", subject: "s", body: "b" })).status, 400);
  assert.equal((await rep.post("/api/v1/mail/templates", { title: "x", subject: "s", body: "b", scope: "team" })).status, 403, "reps can't share");
  assert.equal((await auditor.post("/api/v1/mail/templates", { title: "x", subject: "s", body: "b" })).status, 403);
  const mine = await rep.post("/api/v1/mail/templates", { title: `My follow-up ${RUN}`, category: "Follow Up", subject: "Checking in", body: "Hi {First Name}," });
  assert.equal(mine.status, 201, JSON.stringify(mine.json));
  assert.equal(mine.json.template.scope, "personal");
  assert.equal((await superAdmin.get(`/api/v1/mail/templates/${mine.json.template.id}`)).status, 404, "personal templates are private");

  const team = await manager.post("/api/v1/mail/templates", { title: `Team renewal ${RUN}`, category: "Pricing", subject: "Renewal", body: "Hi {First Name}, your renewal…", scope: "team" });
  assert.equal(team.status, 201);
  assert.ok((await rep.get("/api/v1/mail/templates")).json.results.some((item) => item.id === team.json.template.id), "team templates reach everyone");
  assert.equal((await rep.patch(`/api/v1/mail/templates/${team.json.template.id}`, { title: "Mine now" })).status, 403);
  assert.equal((await superAdmin.patch(`/api/v1/mail/templates/1`, { title: "x" })).status, 403, "built-ins are read-only");

  assert.equal((await rep.patch(`/api/v1/mail/templates/${mine.json.template.id}`, { subject: "Quick check-in" })).json.template.subject, "Quick check-in");
  assert.equal((await rep.del(`/api/v1/mail/templates/${mine.json.template.id}`)).status, 200);
  assert.equal((await superAdmin.del(`/api/v1/mail/templates/${team.json.template.id}`)).status, 200);
});

test("performance analytics: Super Admin only; live sections", needsStaff(), async () => {
  const analytics = await superAdmin.get("/api/v1/admin/analytics");
  assert.equal(analytics.status, 200);
  for (const key of ["kpis", "revenue", "upgrades", "bonus", "insights", "cancellations", "riskAccounts", "alerts", "history"]) assert.ok(key in analytics.json, key);
  assert.equal(typeof analytics.json.kpis.mrrCents, "number");
  assert.ok(analytics.json.history.length >= 1, "today's snapshot is saved");
  assert.equal((await manager.get("/api/v1/admin/analytics")).status, 403);
  assert.equal((await support.get("/api/v1/admin/analytics")).status, 403);
  assert.equal((await rep.get("/api/v1/admin/analytics")).status, 403);
});
