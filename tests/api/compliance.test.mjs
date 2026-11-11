// Phase 6: Compliance & Audit — audit logs (more areas are added as they're built).
// Uses the demo staff from `npm run db:seed` (skipped when they aren't there).
import { test } from "node:test";
import assert from "node:assert/strict";
import { RUN, actor, form, newCustomer, signIn } from "./helpers.mjs";

const PASSWORD = "password-123";
const [superAdmin, manager, support, rep, auditor] = await Promise.all(
  ["sarah.johnson", "mike.davis", "emily.brown", "ryan.anderson", "jessica.lee"].map((name) => signIn(`${name}@pitchprox.test`, PASSWORD).catch(() => null))
);
const emilyActor = () => signIn("emily.brown@pitchprox.test", PASSWORD);
const needsStaff = () => ({ skip: !(superAdmin && manager && support && rep && auditor) && "demo staff not seeded (npm run test:db)" });
const logs = "/api/v1/compliance/audit-logs";

test("audit logs: who can read; sign-ins recorded; categories add up", needsStaff(), async () => {
  assert.equal((await support.get(logs)).status, 403, "Support has no Compliance section");
  assert.equal((await rep.get(logs)).status, 403);
  assert.equal((await actor().get(logs)).status, 401);

  // A failed attempt and an employee sign-in both land in the log
  const email = `nobody-${RUN}@test.dev`;
  assert.equal((await actor().post("/api/v1/auth/sign-in", { email, password: "wrong-password" })).status, 401);
  await signIn("mike.davis@pitchprox.test", PASSWORD);

  const page = await auditor.get(`${logs}?pageSize=50`);
  assert.equal(page.status, 200, JSON.stringify(page.json));
  for (const key of ["results", "total", "page", "pages", "stats", "options"]) assert.ok(key in page.json, key);
  const { stats } = page.json;
  assert.equal(stats.categories.length, 6);
  assert.equal(stats.categories.reduce((sum, card) => sum + card.total, 0), stats.total.total, "the six categories add up to Total Events");

  const failed = await auditor.get(`${logs}?action=security.sign_in_failed&search=${encodeURIComponent(email)}`);
  assert.equal(failed.json.total, 1);
  assert.equal(failed.json.results[0].action, "Sign-in Failed");
  assert.equal(failed.json.results[0].categoryKey, "security");
  const signIns = await auditor.get(`${logs}?action=security.sign_in&user=${encodeURIComponent("Mike Davis")}`);
  assert.ok(signIns.json.total >= 1);
  assert.ok(signIns.json.results.every((row) => row.user.name === "Mike Davis" && row.action === "Sign-in Success"));
  assert.ok(page.json.options.actions.some((option) => option.value === "security.sign_in"));
});

test("audit logs: filters, paging and bad input", needsStaff(), async () => {
  const security = await superAdmin.get(`${logs}?category=security&pageSize=100`);
  assert.equal(security.status, 200);
  assert.ok(security.json.results.every((row) => row.categoryKey === "security"));
  const today = new Date().toISOString().slice(0, 10);
  const lastWeek = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const recent = await manager.get(`${logs}?from=${lastWeek}&pageSize=100`);
  assert.equal(recent.status, 200);
  assert.ok(recent.json.total > 0, "the sign-ins above are within the range");
  assert.equal((await manager.get(`${logs}?from=${today}&to=2000-01-01`)).json.total, 0, "an empty range finds nothing");

  // Paging over events from before today, so new events can't shift the pages
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const first = await superAdmin.get(`${logs}?pageSize=2&page=1&to=${yesterday}`);
  const second = await superAdmin.get(`${logs}?pageSize=2&page=2&to=${yesterday}`);
  if (first.json.total < 4) return; // a fresh test database has no older events yet
  assert.equal(first.json.results.length, 2);
  assert.notEqual(first.json.results[0].id, second.json.results[0].id);

  assert.equal((await superAdmin.get(`${logs}?category=gossip`)).status, 400);
  assert.equal((await superAdmin.get(`${logs}?from=yesterday`)).status, 400);
  // Search text with SQL wildcards is matched literally
  assert.equal((await superAdmin.get(`${logs}?search=${encodeURIComponent("%_%")}`)).status, 200);
});

test("audit logs: export as CSV / JSON, never with secrets, and the export is audited", needsStaff(), async () => {
  const csv = await auditor.get(`${logs}/export?format=csv&range=30d`);
  assert.equal(csv.status, 200);
  assert.match(csv.headers.get("content-disposition"), /audit-logs-.*\.csv/);
  assert.match(csv.bytes.toString(), /^"Time \(UTC\)","User","Role","Action"/);

  const json = await superAdmin.get(`${logs}/export?format=json&range=filters&category=security&context=1`);
  assert.equal(json.status, 200);
  const records = json.json; // the helper parses JSON responses
  assert.ok(Array.isArray(records) && records.length > 0);
  assert.ok(records.every((record) => record.category === "Security"));
  assert.ok("userAgent" in records[0] && "eventId" in records[0], "context adds IDs and the browser");
  assert.doesNotMatch(JSON.stringify(records), /password_hash|token_hash|"(password|token|secret|cookie)"\s*:/i);

  const plain = (await superAdmin.get(`${logs}/export?format=json&range=7d`)).json;
  assert.ok(!("userAgent" in plain[0]), "no client context unless asked");

  assert.equal((await superAdmin.get(`${logs}/export?format=xml`)).status, 400);
  assert.equal((await superAdmin.get(`${logs}/export?range=forever`)).status, 400);
  assert.equal((await support.get(`${logs}/export`)).status, 403);

  const exported = await superAdmin.get(`${logs}?action=audit.exported&user=${encodeURIComponent("Jessica Lee")}`);
  assert.ok(exported.json.total >= 1, "the auditor's export is in the log");
  assert.equal(exported.json.results[0].categoryKey, "compliance");
});

// ── Policy Documents ──
const policies = "/api/v1/compliance/policies";
const PDF = { name: "policy.pdf", content: "%PDF-1.4\n% test policy\n", type: "application/pdf" };
const findPolicy = async (who, id) => (await who.get(`${policies}/${id}`)).json.policy;

test("policies: permissions and the draft → review → approval flow", needsStaff(), async () => {
  assert.equal((await support.get(policies)).status, 403);
  assert.equal((await rep.get(policies)).status, 403);
  const list = await auditor.get(policies);
  assert.equal(list.status, 200);
  assert.ok(list.json.results.some((policy) => policy.name === "Information Security Policy" && policy.status === "Approved"), "the onboarding policies are listed");
  assert.equal(list.json.permissions.manage, false, "auditors read only");
  assert.equal((await auditor.post(policies, { name: "x", category: "Security", version: "1.0", action: "draft" })).status, 403);

  assert.equal((await manager.post(policies, { name: "", category: "Security", version: "1.0", action: "draft" })).status, 400);
  assert.equal((await manager.post(policies, { name: "x", category: "Astrology", version: "1.0", action: "draft" })).status, 400);
  assert.equal((await manager.post(policies, { name: "x", category: "Security", version: "one", action: "draft" })).status, 400);
  assert.equal((await manager.post(policies, { name: "x", category: "Security", version: "1.0", action: "submit" })).status, 400, "submitting needs the dates");
  assert.equal((await manager.post(policies, { name: "x", category: "Security", version: "1.0", effectiveDate: "2026-12-01", nextReviewDate: "2026-11-01", action: "submit" })).status, 400, "review date after effective date");

  const name = `Clean Desk Policy ${RUN}`;
  const created = await manager.post(policies, { name, category: "Security", version: "v1.0", description: "Keep desks clear of customer data.", action: "draft" });
  assert.equal(created.status, 201, JSON.stringify(created.json));
  let policy = created.json.policy;
  assert.equal(policy.status, "Draft");
  assert.equal(policy.version, "v1.0");
  assert.equal(policy.owner.name, "Mike Davis", "the uploader owns it by default");
  const draftVersion = policy.versions[0];

  const submit = await manager.post(`${policies}/${policy.id}/versions/${draftVersion.id}`, { action: "submit" });
  assert.equal(submit.status, 400, "a draft without dates can't be submitted");
  const today = new Date().toISOString().slice(0, 10);
  const nextYear = `${Number(today.slice(0, 4)) + 1}${today.slice(4)}`;
  const edited = await manager.patch(`${policies}/${policy.id}`, { effectiveDate: today, nextReviewDate: nextYear, action: "submit" });
  assert.equal(edited.status, 200, JSON.stringify(edited.json));
  assert.equal(edited.json.policy.status, "Under Review");
  assert.ok((await superAdmin.get(policies)).json.pendingApprovals.some((item) => item.policyId === policy.id), "listed under Pending Approvals");

  assert.equal((await manager.post(`${policies}/${policy.id}/versions/${draftVersion.id}`, { action: "approve" })).status, 403, "only a Super Admin approves");
  assert.equal((await superAdmin.post(`${policies}/${policy.id}/versions/${draftVersion.id}`, { action: "reject" })).status, 400, "sending back needs a note");
  const rejected = await superAdmin.post(`${policies}/${policy.id}/versions/${draftVersion.id}`, { action: "reject", note: "Add the screen-lock rule." });
  assert.equal(rejected.json.policy.versions[0].statusLabel, "Changes Requested");
  assert.equal(rejected.json.policy.status, "Draft");

  await manager.patch(`${policies}/${policy.id}`, { description: "Keep desks clear; lock screens.", action: "submit" });
  const approved = await superAdmin.post(`${policies}/${policy.id}/versions/${draftVersion.id}`, { action: "approve" });
  assert.equal(approved.status, 200, JSON.stringify(approved.json));
  policy = approved.json.policy;
  assert.equal(policy.status, "Approved");
  assert.ok(policy.acknowledgment.total >= 5, "every active employee must sign");
  assert.equal(policy.acknowledgment.acknowledged, 0);
  assert.ok(policy.employees.every((employee) => employee.status === "Pending"));

  const audit = await superAdmin.get(`/api/v1/compliance/audit-logs?search=${encodeURIComponent(name)}&pageSize=50`);
  for (const action of ["Policy Created", "Policy Submitted", "Policy Changes Requested", "Policy Approved"]) assert.ok(audit.json.results.some((row) => row.action === action), action);
});

test("policies: employees sign the version in force; a new version asks again", needsStaff(), async () => {
  const today = new Date().toISOString().slice(0, 10);
  const later = `${Number(today.slice(0, 4)) + 1}${today.slice(4)}`;
  const name = `Visitor Policy ${RUN}`;
  const created = await superAdmin.post(policies, { name, category: "HR & People", version: "1.0", effectiveDate: today, nextReviewDate: later, action: "submit" });
  const id = created.json.policy.id;
  await superAdmin.post(`${policies}/${id}/versions/${created.json.policy.versions[0].id}`, { action: "approve" });

  const mine = await rep.get("/api/v1/me/policies");
  assert.equal(mine.status, 200);
  assert.ok(mine.json.results.some((policy) => policy.id === id && !policy.acknowledgedAt));
  assert.equal((await rep.post(`/api/v1/me/policies/${id}/acknowledge`, { signature: "Someone Else" })).status, 400);
  const signed = await rep.post(`/api/v1/me/policies/${id}/acknowledge`, { signature: "ryan  anderson" });
  assert.equal(signed.status, 200, JSON.stringify(signed.json));
  assert.ok(signed.json.results.find((policy) => policy.id === id).acknowledgedAt);
  let detail = await findPolicy(superAdmin, id);
  assert.equal(detail.employees.find((employee) => employee.name === "Ryan Anderson").status, "Acknowledged");
  assert.equal(detail.acknowledgment.acknowledged, 1);

  // Details change without a new version; a lower version number is refused
  const details = await manager.patch(`${policies}/${id}`, { nextReviewDate: `${Number(today.slice(0, 4)) + 2}${today.slice(4)}` });
  assert.equal(details.status, 200);
  assert.equal(details.json.policy.version, "v1.0");
  assert.equal(details.json.policy.versions.length, 1);
  assert.equal((await manager.patch(`${policies}/${id}`, { version: "0.9", action: "draft" })).status, 400);

  // v1.1 with a PDF: employees must sign again once it's approved
  const upload = new FormData();
  upload.append("version", "1.1");
  upload.append("changeNote", "Visitors wear badges.");
  upload.append("action", "submit");
  upload.append("file", new File([PDF.content], PDF.name, { type: PDF.type }));
  const newVersion = await manager.patch(`${policies}/${id}`, upload);
  assert.equal(newVersion.status, 200, JSON.stringify(newVersion.json));
  assert.equal(newVersion.json.policy.version, "v1.0", "v1.0 stays in force while v1.1 is reviewed");
  assert.equal(newVersion.json.policy.pendingVersion.version, "v1.1");
  const pending = newVersion.json.policy.versions.find((version) => version.version === "1.1");
  assert.equal(pending.file.isPdf, true);
  const pdf = await auditor.get(`${policies}/${id}/file?version=${pending.id}&inline=1`);
  assert.equal(pdf.status, 200);
  assert.match(pdf.headers.get("content-disposition"), /^inline/);
  assert.equal((await rep.get(`/api/v1/me/policies/${id}/file`)).status, 404, "employees only get the version in force (v1.0 has no file)");

  await superAdmin.post(`${policies}/${id}/versions/${pending.id}`, { action: "approve" });
  detail = await findPolicy(superAdmin, id);
  assert.equal(detail.version, "v1.1");
  assert.equal(detail.employees.find((employee) => employee.name === "Ryan Anderson").status, "Pending", "signing v1.0 doesn't cover v1.1");
  assert.equal(detail.versions.find((version) => version.version === "1.0").statusLabel, "Previous");
  assert.equal((await rep.get(`/api/v1/me/policies/${id}/file`)).status, 200);

  // Restoring v1.0 makes v1.2 with its content, sent for approval
  const old = detail.versions.find((version) => version.version === "1.0");
  const restored = await manager.post(`${policies}/${id}/versions/${old.id}`, { action: "restore" });
  assert.equal(restored.status, 200, JSON.stringify(restored.json));
  const copy = restored.json.policy.versions.find((version) => version.version === "1.2");
  assert.equal(copy.status, "under_review");
  assert.equal(copy.restoredFrom, "1.0");
  assert.equal((await manager.post(`${policies}/${id}/versions/${old.id}`, { action: "restore" })).status, 409, "one version in preparation at a time");
  const withdrawn = await manager.post(`${policies}/${id}/versions/${copy.id}`, { action: "withdraw" });
  assert.equal(withdrawn.json.policy.versions.find((version) => version.id === copy.id).status, "draft");
  const discarded = await manager.post(`${policies}/${id}/versions/${copy.id}`, { action: "discard" });
  assert.ok(!discarded.json.policy.versions.some((version) => version.id === copy.id));
});

test("policies: delete drafts, archive approved ones, overdue list and reminders", needsStaff(), async () => {
  const draft = await manager.post(policies, { name: `Scratch ${RUN}`, category: "Legal", version: "0.1", action: "draft" });
  const draftId = draft.json.policy.id;
  assert.equal((await manager.del(`${policies}/${draftId}`)).status, 403, "only a Super Admin deletes");
  assert.equal((await superAdmin.del(`${policies}/${draftId}`)).json.deleted, true);
  assert.equal((await superAdmin.get(`${policies}/${draftId}`)).status, 404);

  const today = new Date().toISOString().slice(0, 10);
  const made = await superAdmin.post(policies, { name: `Archive Me ${RUN}`, category: "Legal", version: "1.0", effectiveDate: today, nextReviewDate: `${Number(today.slice(0, 4)) + 1}${today.slice(4)}`, action: "submit" });
  const id = made.json.policy.id;
  await superAdmin.post(`${policies}/${id}/versions/${made.json.policy.versions[0].id}`, { action: "approve" });
  assert.equal((await superAdmin.del(`${policies}/${id}`)).json.archived, true);
  const archived = await findPolicy(superAdmin, id);
  assert.equal(archived.status, "Archived");
  assert.ok(!(await rep.get("/api/v1/me/policies")).json.results.some((policy) => policy.id === id), "archived policies aren't signed");
  assert.equal((await manager.patch(`${policies}/${id}`, { description: "x" })).status, 409);
  assert.equal((await superAdmin.post(`${policies}/${id}/restore`)).json.policy.status, "Approved");

  const overdue = await auditor.get(`${policies}/overdue`);
  assert.equal(overdue.status, 200);
  assert.ok(Array.isArray(overdue.json.results));
  assert.equal((await auditor.post(`${policies}/reminders`, {})).status, 403);
  const reminded = await superAdmin.post(`${policies}/reminders`, {});
  assert.ok([200, 409].includes(reminded.status), "200 when someone is overdue, otherwise 409");
});

// ── Training Logs ──
const training = "/api/v1/compliance/training";
const inDays = (days) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

test("training: categories are unique and move their Trainings before deletion", needsStaff(), async () => {
  assert.equal((await rep.get(`${training}/categories`)).status, 403);
  assert.equal((await auditor.post(`${training}/categories`, { name: "x" })).status, 403);
  const made = await manager.post(`${training}/categories`, { name: `Cat ${RUN}`, description: "Test" });
  assert.equal(made.status, 201, JSON.stringify(made.json));
  assert.equal((await manager.post(`${training}/categories`, { name: `CAT ${RUN}` })).status, 409, "capitals don't make a new name");
  assert.equal((await manager.post(`${training}/categories`, { name: "Security" })).status, 409);
  const renamed = await manager.patch(`${training}/categories/${made.json.category.id}`, { name: `Category ${RUN}` });
  assert.equal(renamed.json.category.name, `Category ${RUN}`);

  const material = await manager.post(`${training}/materials`, form({ title: `Moved material ${RUN}`, categoryId: made.json.category.id }, { file: { name: "guide.pdf", content: "%PDF-1.4 guide", type: "application/pdf" } }));
  assert.equal(material.status, 201, JSON.stringify(material.json));
  assert.equal((await manager.del(`${training}/categories/${made.json.category.id}`)).status, 409, "a category with content needs a destination");
  const security = (await manager.get(`${training}/categories`)).json.results.find((category) => category.name === "Security");
  assert.equal((await manager.del(`${training}/categories/${made.json.category.id}?moveTo=${security.id}`)).json.deleted, true);
  const moved = (await manager.get(`${training}/materials?search=${encodeURIComponent(`Moved material ${RUN}`)}`)).json.results[0];
  assert.equal(moved.category, "Security");
  await manager.del(`${training}/materials/${moved.id}`);
});

test("training: library, Trainings, bulk assign and the employee completing it", needsStaff(), async () => {
  const categories = (await manager.get(`${training}/categories`)).json.results;
  const privacy = categories.find((category) => category.name === "Privacy");

  // Library: PDF, Doc, video link; formats are PDF / Doc / Video
  const pdf = await manager.post(`${training}/materials`, form({ title: `Privacy guide ${RUN}`, categoryId: privacy.id }, { file: { name: "privacy.pdf", content: "%PDF-1.4 privacy", type: "application/pdf" } }));
  const doc = await manager.post(`${training}/materials`, form({ title: `Checklist ${RUN}`, categoryId: privacy.id }, { file: { name: "checklist.docx", content: "PK docx", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" } }));
  const video = await manager.post(`${training}/materials`, form({ title: `Walkthrough ${RUN}`, categoryId: privacy.id, videoUrl: "https://videos.example.com/privacy" }));
  assert.deepEqual([pdf.json.material.format, doc.json.material.format, video.json.material.format], ["PDF", "Doc", "Video"]);
  assert.equal((await manager.post(`${training}/materials`, form({ title: "x", categoryId: privacy.id, videoUrl: "javascript:alert(1)" }))).status, 400);
  assert.equal((await manager.post(`${training}/materials`, form({ title: "x", categoryId: privacy.id }, { file: { name: "run.exe", content: "MZ", type: "application/octet-stream" } }))).status, 400);
  assert.equal((await auditor.get(`${training}/materials/${pdf.json.material.id}/file?inline=1`)).status, 200);

  // A Training made of the three materials, with a 6-month certificate
  assert.equal((await manager.post(`${training}/courses`, { title: `Privacy ${RUN}`, categoryId: privacy.id, materialIds: [] })).status, 400, "needs materials");
  assert.equal((await manager.post(`${training}/courses`, { title: `Privacy ${RUN}`, categoryId: privacy.id, materialIds: [pdf.json.material.id], issueCertificate: true, certificateValidity: "Custom" })).status, 400, "custom validity needs months");
  const course = await manager.post(`${training}/courses`, { title: `Privacy ${RUN}`, categoryId: privacy.id, description: "Handling personal data.", minutes: 30, materialIds: [pdf.json.material.id, doc.json.material.id, video.json.material.id], requirement: "Required", issueCertificate: true, certificateValidity: "6 Months" });
  assert.equal(course.status, 201, JSON.stringify(course.json));
  const courseId = course.json.training.id;
  assert.deepEqual(course.json.training.formats.sort(), ["Doc", "PDF", "Video"]);
  assert.equal((await manager.del(`${training}/materials/${pdf.json.material.id}`)).status, 409, "materials in a Training stay");
  const second = await manager.post(`${training}/courses`, { title: `Phishing ${RUN}`, categoryId: privacy.id, materialIds: [pdf.json.material.id] });

  // Bulk assign: 2 Trainings × 2 employees = 4 assignments
  const employees = (await manager.get(`${training}/employees`)).json.results;
  const ryan = employees.find((person) => person.name === "Ryan Anderson");
  const emily = employees.find((person) => person.name === "Emily Brown");
  assert.equal(ryan.department, "Sales & Growth");
  assert.equal((await manager.post(`${training}/assignments`, { courseIds: [courseId], userIds: [ryan.id], dueDate: inDays(-1), requirement: "Required" })).status, 400, "no due dates in the past");
  const assigned = await manager.post(`${training}/assignments`, { courseIds: [courseId, second.json.training.id], userIds: [ryan.id, emily.id], dueDate: inDays(14), requirement: "Required", notify: true });
  assert.equal(assigned.status, 201, JSON.stringify(assigned.json));
  assert.equal(assigned.json.created, 4);
  // Phase 9: each employee gets one bell notification for the batch
  const bell = (await rep.get("/api/v1/notifications?limit=50")).json.results.find((item) => item.type === "training" && item.title === "2 new trainings assigned" && item.body.includes(inDays(14)));
  assert.ok(bell, "the employee is notified in the app");
  const again = await manager.post(`${training}/assignments`, { courseIds: [courseId], userIds: [ryan.id], dueDate: inDays(14), requirement: "Required" });
  assert.equal(again.json.created, 0);
  assert.equal(again.json.skipped[0].reason, "Already assigned");

  let overview = (await auditor.get(training)).json;
  const ryanRow = overview.employees.find((row) => row.employee.id === ryan.id);
  assert.ok(ryanRow.total >= 2);
  assert.equal(overview.stats.total, overview.statuses.reduce((sum, item) => sum + item.count, 0), "the four statuses add up to the total");
  assert.ok(overview.upcoming.some((item) => item.trainingId === courseId && item.employees === 2));

  // Ryan opens each material, then completes; he gets a certificate valid 6 months
  const mine = (await rep.get("/api/v1/me/training")).json.results.find((item) => item.trainingId === courseId);
  assert.equal(mine.status, "Not Started");
  assert.equal(mine.canComplete, false);
  assert.equal((await rep.post(`/api/v1/me/training/${mine.id}/complete`)).status, 409, "open every material first");
  assert.equal((await rep.get(`/api/v1/me/training/${mine.id}/materials/${pdf.json.material.id}/file`)).status, 200);
  assert.equal((await emilyActor().then((emilyUser) => emilyUser.get(`/api/v1/me/training/${mine.id}/materials/${pdf.json.material.id}/file`))).status, 404, "not someone else's assignment");
  await rep.get(`/api/v1/me/training/${mine.id}/materials/${doc.json.material.id}/file`);
  const afterVideo = await rep.post(`/api/v1/me/training/${mine.id}/materials/${video.json.material.id}/view`);
  const progressed = afterVideo.json.results.find((item) => item.id === mine.id);
  assert.equal(progressed.status, "In Progress");
  assert.equal(progressed.canComplete, true);
  const done = (await rep.post(`/api/v1/me/training/${mine.id}/complete`)).json.results.find((item) => item.id === mine.id);
  assert.equal(done.status, "Completed");
  assert.match(done.certificate.number, /^CERT-[0-9A-F]{8}$/);
  assert.equal(done.certificate.expiresOn, (() => { const date = new Date(); date.setMonth(date.getMonth() + 6); return date.toISOString().slice(0, 10); })());

  overview = (await superAdmin.get(training)).json;
  const ryanAfter = overview.employees.find((row) => row.employee.id === ryan.id);
  assert.match(ryanAfter.status, /^\d+ of \d+ Completed$/, "an employee with several Trainings shows 'x of y Completed'");

  // Reassigning a completed Training needs the switch and keeps the old record
  assert.equal((await manager.post(`${training}/assignments`, { courseIds: [courseId], userIds: [ryan.id], dueDate: inDays(30), requirement: "Required" })).json.skipped[0].reason, "Already completed");
  const reassigned = await manager.post(`${training}/assignments`, { courseIds: [courseId], userIds: [ryan.id], dueDate: inDays(30), requirement: "Required", allowReassign: true });
  assert.equal(reassigned.json.created, 1);
  const ryanRows = (await superAdmin.get(training)).json.results.filter((row) => row.trainingId === courseId && row.employee.id === ryan.id);
  assert.equal(ryanRows.length, 2);
  assert.ok(ryanRows.some((row) => row.status === "Completed"));

  // Due date change, removal, reminder
  const emilyOpen = (await superAdmin.get(training)).json.results.find((row) => row.trainingId === courseId && row.employee.id === emily.id);
  assert.equal((await manager.patch(`${training}/assignments/${emilyOpen.id}`, { dueDate: inDays(21) })).status, 200);
  assert.equal((await manager.post(`${training}/assignments/${emilyOpen.id}/remind`)).json.reminded, true);
  assert.equal((await manager.del(`${training}/assignments/${emilyOpen.id}`)).status, 200);
  const completed = ryanRows.find((row) => row.status === "Completed");
  assert.equal((await manager.del(`${training}/assignments/${completed.id}`)).status, 409, "completions stay on record");

  // Report: CSV with the chosen fields; count only
  const count = await auditor.get(`${training}/export?training=${courseId}&count=1`);
  assert.equal(count.json.rows, 2);
  const csv = await auditor.get(`${training}/export?training=${courseId}&status=Completed&fields=${encodeURIComponent("Employee Name,Training,Status,Certificate")}`);
  assert.equal(csv.status, 200);
  const lines = csv.bytes.toString().split("\n");
  assert.equal(lines[0], '"Employee Name","Training","Status","Certificate"');
  assert.equal(lines.length, 2);
  assert.match(lines[1], /"Ryan Anderson",".*","Completed","CERT-/);
  assert.equal((await auditor.get(`${training}/export?status=Lost`)).status, 400);

  // Retiring a Training removes open assignments and keeps completions
  const retired = await manager.del(`${training}/courses/${courseId}`);
  assert.equal(retired.json.archived, true);
  const left = (await superAdmin.get(training)).json.results.filter((row) => row.trainingId === courseId);
  assert.ok(left.length >= 1 && left.every((row) => row.status === "Completed"));
});

test("training: the onboarding course shows up as an assignment for employees who onboard", needsStaff(), async () => {
  const trainings = (await auditor.get(`${training}/courses`)).json.results;
  const onboarding = trainings.find((item) => item.onboarding);
  assert.ok(onboarding, "the onboarding Training is listed");
  assert.ok(onboarding.modules > 0);
  assert.equal((await manager.post(`${training}/assignments`, { courseIds: [onboarding.id], userIds: [(await manager.get(`${training}/employees`)).json.results[0].id], dueDate: inDays(5), requirement: "Required" })).status, 400, "onboarding training is assigned automatically");
});

// ── Incident Management ──
const incidents = "/api/v1/compliance/incidents";

test("incidents: report, investigate, resolve, close, reopen — with the client's rules", needsStaff(), async () => {
  assert.equal((await support.get(incidents)).status, 403);
  assert.equal((await auditor.post(incidents, form({ title: "x" }))).status, 403, "auditors read only");
  const base = { title: `Brute force ${RUN}`, category: "Security Incident", severity: "High", description: "Repeated failed sign-ins.", occurredAt: new Date(Date.now() - 3600000).toISOString() };
  assert.equal((await manager.post(incidents, form({ ...base, category: "Data Leakage" }))).status, 400, "only the client's category list");
  assert.equal((await manager.post(incidents, form({ ...base, severity: "Severe" }))).status, 400);
  assert.equal((await manager.post(incidents, form({ ...base, occurredAt: new Date(Date.now() + 86400000).toISOString() }))).status, 400, "not in the future");
  assert.equal((await manager.post(incidents, form({ ...base, assignedTo: (await rep.get("/api/v1/me")).json.user.id }))).status, 400, "only incident managers can own it");
  assert.equal((await manager.post(incidents, form({ ...base, relatedTicket: "TKT-99999999" }))).status, 400);

  // A customer's ticket that gets escalated to an incident
  const customer = await newCustomer("incident");
  const ticket = await customer.post("/api/v1/support/tickets", form({ category: "technical", priority: "high", subject: "Someone logged into my account", description: "Unknown device" }));
  const reference = `TKT-${ticket.json.ticket.number}`;

  const reported = await manager.post(incidents, form({ ...base, relatedTicket: reference }, { file: { name: "log.txt", content: "failed login x50", type: "text/plain" } }));
  assert.equal(reported.status, 201, JSON.stringify(reported.json));
  let incident = reported.json.incident;
  assert.equal(incident.status, "Open", "new incidents start Open");
  assert.equal(incident.reportedBy.name, "Mike Davis", "Reported By is the signed-in user");
  assert.ok(incident.reportedAt, "Reported At is set automatically");
  assert.match(incident.reference, /^INC-\d{4}-\d{4}$/);
  assert.equal(incident.relatedTicket.reference, reference);
  assert.equal(incident.files.length, 1);
  const id = incident.id;
  const act = (who, body) => who.post(`${incidents}/${id}/actions`, body);

  assert.equal((await act(manager, { action: "resolve", findings: "a", actionsTaken: "b", conclusion: "c" })).status, 409, "investigate first");
  incident = (await act(manager, { action: "start" })).json.incident;
  assert.equal(incident.status, "Investigating");
  assert.equal(incident.assignedTo.name, "Mike Davis", "whoever starts it owns it");
  assert.equal((await act(manager, { action: "resolve", findings: "Bot traffic", actionsTaken: "Blocked IPs" })).status, 400, "all three fields are required");
  incident = (await act(superAdmin, { action: "resolve", findings: "Bot traffic", actionsTaken: "Blocked IPs", conclusion: "No access gained" })).json.incident;
  assert.equal(incident.status, "Resolved");
  assert.equal(incident.investigatedBy, "Sarah Johnson", "Investigated By is automatic");
  assert.ok(incident.investigationCompletedAt, "Investigation Completed At is automatic");
  incident = (await act(manager, { action: "close" })).json.incident;
  assert.equal(incident.status, "Closed");
  assert.equal((await act(auditor, { action: "reopen" })).status, 403);
  incident = (await act(manager, { action: "reopen", reason: "Same IPs are back" })).json.incident;
  assert.equal(incident.status, "Investigating", "reopening goes back to Investigating");
  assert.equal(incident.reopenedCount, 1);

  // Notes, info request, evidence, reassignment
  assert.equal((await manager.post(`${incidents}/${id}/notes`, { note: "" })).status, 400);
  incident = (await manager.post(`${incidents}/${id}/notes`, { note: "Firewall rule added" })).json.incident;
  assert.equal(incident.timeline[0].body, "Firewall rule added");
  assert.equal((await manager.post(`${incidents}/${id}/request-info`, { message: "x" })).status, 409, "the reporter can't ask themselves");
  incident = (await superAdmin.post(`${incidents}/${id}/request-info`, { message: "Which device?" })).json.incident;
  assert.equal(incident.timeline[0].kind, "Request");
  const upload = new FormData();
  upload.append("files", new File(["a"], "screen.png", { type: "image/png" }));
  upload.append("files", new File(["b"], "notes.pdf", { type: "application/pdf" }));
  incident = (await manager.post(`${incidents}/${id}/files`, upload)).json.incident;
  assert.equal(incident.files.length, 3);
  assert.equal((await auditor.get(`${incidents}/${id}/files/${incident.files[0].id}`)).status, 200);
  assert.equal((await manager.del(`${incidents}/${id}/files/${incident.files[0].id}`)).status, 403, "only a Super Admin removes evidence");
  const sarah = (await superAdmin.get("/api/v1/me")).json.user.id;
  incident = (await manager.patch(`${incidents}/${id}`, { assignedTo: sarah, severity: "Critical" })).json.incident;
  assert.equal(incident.assignedTo.name, "Sarah Johnson");
  assert.equal((await manager.patch(`${incidents}/${id}`, { assignedTo: (await rep.get("/api/v1/me")).json.user.id })).status, 400);

  // A false positive is closed with a reason
  const other = await manager.post(incidents, form({ ...base, title: `False alarm ${RUN}`, severity: "Low", category: "Other" }));
  assert.equal((await manager.post(`${incidents}/${other.json.incident.id}/actions`, { action: "close" })).status, 400, "needs a reason when not investigated");
  assert.equal((await manager.post(`${incidents}/${other.json.incident.id}/actions`, { action: "close", reason: "False positive" })).json.incident.closeReason, "False positive");

  // Page numbers follow the client's definitions
  const page = (await auditor.get(incidents)).json;
  assert.equal(page.summary.reduce((sum, item) => sum + item.count, 0), page.stats.total, "the status summary adds up to Total Incidents");
  assert.equal(page.stats.active, page.results.filter((item) => ["Open", "Investigating"].includes(item.status)).length);
  assert.equal(page.stats.criticalHigh, page.results.filter((item) => ["Open", "Investigating"].includes(item.status) && ["Critical", "High"].includes(item.severity)).length);
  assert.ok(!page.managers.some((person) => person.name === "Ryan Anderson"), "owners are only people with incident permission");
  assert.ok(page.results.some((item) => item.relatedTicket?.reference === reference), "listed under Escalated Tickets");
});

// ── Evidence Repository & SOC 2 ──
const evidence = "/api/v1/compliance/evidence";
const evidenceForm = (fields, file = { name: "access-review.pdf", content: "%PDF-1.4 review", type: "application/pdf" }) =>
  form({ criteria: JSON.stringify(["Security"]), controls: JSON.stringify(["CC6.1", "CC6.2"]), expires: "never", ...fields }, file ? { file } : {});

test("evidence: upload, review, verify, versions, archive; counts leave archived out", needsStaff(), async () => {
  assert.equal((await support.get(evidence)).status, 403);
  assert.equal((await auditor.post(evidence, evidenceForm({ name: "x" }))).status, 403);
  assert.equal((await manager.post(evidence, evidenceForm({ name: "x", controls: JSON.stringify(["ZZ9.9"]) }))).status, 400, "controls come from the SOC 2 library");
  assert.equal((await manager.post(evidence, evidenceForm({ name: "x", criteria: JSON.stringify(["Speed"]) }))).status, 400);
  assert.equal((await manager.post(evidence, evidenceForm({ name: "x", expires: "on" }))).status, 400, "Expires On needs a date");
  assert.equal((await manager.post(evidence, evidenceForm({ name: "x" }, null))).status, 400, "submitting needs a file");

  const before = (await auditor.get(evidence)).json.stats;
  const nextYear = new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10);
  const made = await manager.post(evidence, evidenceForm({ name: `Access review ${RUN}`, description: "Quarterly attestation", expires: "on", expiryDate: nextYear, period: "Q4 2026" }));
  assert.equal(made.status, 201, JSON.stringify(made.json));
  let item = made.json.evidence;
  assert.equal(item.status, "Under Review", "Upload sends it for review");
  assert.equal(item.owner.name, "Mike Davis", "the uploader owns it by default");
  assert.match(item.reference, /^EV-\d{3,}$/);
  const id = item.id;
  const act = (who, body) => who.post(`${evidence}/${id}/actions`, body);

  assert.equal((await manager.patch(`${evidence}/${id}`, { name: "Renamed" })).status, 409, "only drafts / needs-changes are edited");
  assert.equal((await act(manager, { action: "request_changes" })).status, 400, "a note is required");
  item = (await act(superAdmin, { action: "request_changes", note: "Add the sign-off page" })).json.evidence;
  assert.equal(item.status, "Needs Changes");
  item = (await manager.patch(`${evidence}/${id}`, { description: "Quarterly attestation with sign-off" })).json.evidence;
  item = (await act(manager, { action: "submit" })).json.evidence;
  item = (await act(superAdmin, { action: "verify", note: "Matches the access list" })).json.evidence;
  assert.equal(item.status, "Verified");
  assert.equal(item.verifiedBy, "Sarah Johnson", "Verified By is automatic");
  assert.ok(item.verifiedAt);

  // A new version keeps the old file and goes back to review
  const version = new FormData();
  version.append("file", new File(["%PDF-1.4 v2"], "access-review-v2.pdf", { type: "application/pdf" }));
  version.append("note", "Signed copy");
  item = (await manager.post(`${evidence}/${id}/versions`, version)).json.evidence;
  assert.equal(item.status, "Under Review");
  assert.equal(item.versions.length, 2);
  assert.equal(item.file.name, "access-review-v2.pdf");
  assert.equal((await auditor.get(`${evidence}/${id}/file?version=${item.versions[1].id}`)).status, 200, "the first file is still there");
  await act(superAdmin, { action: "verify" });

  // Drafts are deleted; anything else is archived (and leaves the counts)
  const draft = await manager.post(evidence, evidenceForm({ name: `Draft ${RUN}`, action: "draft" }, null));
  assert.equal(draft.json.evidence.status, "Draft");
  assert.equal((await act(manager, { action: "archive" })).json.evidence.status, "Archived");
  assert.equal((await manager.del(`${evidence}/${id}`)).status, 409, "only drafts are deleted");
  assert.equal((await manager.del(`${evidence}/${draft.json.evidence.id}`)).json.deleted, true);
  const after = (await auditor.get(evidence)).json.stats;
  assert.equal(after.total, before.total, "archived evidence isn't counted");
  assert.equal((await act(manager, { action: "restore" })).json.evidence.status, "Under Review");

  // Expired evidence can't be verified
  const old = await manager.post(evidence, evidenceForm({ name: `Old ${RUN}`, expires: "on", expiryDate: "2020-01-01" }));
  assert.equal((await superAdmin.post(`${evidence}/${old.json.evidence.id}/actions`, { action: "verify" })).status, 409);
});

test("SOC 2 readiness: controls become ready with implementation + verified evidence", needsStaff(), async () => {
  const soc2 = "/api/v1/compliance/soc2";
  assert.equal((await rep.get(soc2)).status, 403);
  let page = (await auditor.get(soc2)).json;
  assert.equal(page.criteria.length, 5);
  assert.equal(page.kpis.total, page.controls.length);
  assert.equal(page.kpis.openGaps, page.gaps.length);
  assert.equal((await auditor.patch(`${soc2}/controls/A1.2`, { status: "Implemented" })).status, 403);
  assert.equal((await manager.patch(`${soc2}/controls/A1.2`, { status: "Done" })).status, 400);

  // A1.2 needs implementation and verified evidence
  page = (await manager.patch(`${soc2}/controls/A1.2`, { status: "Implemented", dueDate: "2026-12-31" })).json;
  let control = page.controls.find((item) => item.id === "A1.2");
  if (!control.evidence.some((item) => item.status === "Verified")) {
    assert.equal(control.ready, false);
    const backup = await manager.post(evidence, evidenceForm({ name: `Backup restore test ${RUN}`, criteria: JSON.stringify(["Availability"]), controls: JSON.stringify(["A1.2"]) }, { name: "restore.csv", content: "date,result", type: "text/csv" }));
    await superAdmin.post(`${evidence}/${backup.json.evidence.id}/actions`, { action: "verify" });
    page = (await auditor.get(soc2)).json;
    control = page.controls.find((item) => item.id === "A1.2");
  }
  assert.equal(control.ready, true, "implemented + verified evidence = ready");
  assert.ok(!page.gaps.some((gap) => gap.control === "A1.2"));

  const fieldwork = page.milestones.find((item) => item.title === "Auditor fieldwork");
  assert.equal((await manager.patch(`${soc2}/milestones/${fieldwork.id}`, { startsOn: "2027-02-10", endsOn: "2027-02-01" })).status, 400);
  page = (await manager.patch(`${soc2}/milestones/${fieldwork.id}`, { startsOn: "2027-02-01", endsOn: "2027-02-14" })).json;
  assert.equal(page.kpis.fieldworkStartsOn, "2027-02-01");
  const csv = await auditor.get(`${soc2}/gaps`);
  assert.equal(csv.status, 200);
  assert.match(csv.bytes.toString(), /^"Control","Name","Gap"/);
});
