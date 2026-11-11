// Playbook Builder phase 1: drafts save, reopen, guard against overwrites, files upload.
// Super Admin only. Uses the demo staff from `npm run db:seed`.
import { test } from "node:test";
import assert from "node:assert/strict";
import { RUN, actor, form, newCustomer, signIn } from "./helpers.mjs";

const PASSWORD = "password-123";
const [superAdmin, manager, auditor] = await Promise.all(["sarah.johnson", "mike.davis", "jessica.lee"].map((name) => signIn(`${name}@pitchprox.test`, PASSWORD).catch(() => null)));
const rep = () => signRep;
const signRep = await signIn("ryan.anderson@pitchprox.test", PASSWORD).catch(() => null);
const needsStaff = () => ({ skip: !(superAdmin && manager && auditor) && "demo staff not seeded (npm run test:db)" });
const builds = "/api/v1/admin/playbook-builds";

test("playbook builder: only a Super Admin opens it", needsStaff(), async () => {
  assert.equal((await actor().get(builds)).status, 401);
  assert.equal((await manager.get(builds)).status, 403);
  assert.equal((await auditor.get(builds)).status, 403);
  const library = await superAdmin.get(builds);
  assert.equal(library.status, 200);
  assert.ok(library.json.playbooks.some((playbook) => playbook.id === "pitchprox-standard"), "platform playbooks come from the database");
  assert.ok(Array.isArray(library.json.drafts));
});

test("playbook builder: a draft saves, reopens and refuses stale saves", needsStaff(), async () => {
  const content = { playbookName: `Builder Test ${RUN}`, shortDescription: "Saved from the API test", tones: ["confident"], stages: [{ id: 1, title: "Opening" }] };
  assert.equal((await superAdmin.post(builds, { content: "not an object" })).status, 400);
  assert.equal((await superAdmin.post(builds, { content: { ...content, coverImage: "blob:http://localhost/123" } })).status, 400, "browser-only file links are refused");
  assert.equal((await superAdmin.post(builds, { content: { notes: "x".repeat(2.1 * 1024 * 1024) } })).status, 413, "too large");

  const created = await superAdmin.post(builds, { content, currentStep: 2 });
  assert.equal(created.status, 201, JSON.stringify(created.json));
  const { build } = created.json;
  assert.equal(build.title, `Builder Test ${RUN}`);
  assert.equal(build.currentStep, 2);
  assert.equal(build.revision, 1);

  const saved = await superAdmin.patch(`${builds}/${build.id}`, { content: { ...content, tones: ["confident", "direct"] }, currentStep: 4, revision: 1 });
  assert.equal(saved.status, 200, JSON.stringify(saved.json));
  assert.equal(saved.json.build.revision, 2);
  const reopened = (await superAdmin.get(`${builds}/${build.id}`)).json.build;
  assert.deepEqual(reopened.content.tones, ["confident", "direct"], "the saved content comes back");
  assert.equal(reopened.currentStep, 4, "it reopens on the step you were on");

  const stale = await superAdmin.patch(`${builds}/${build.id}`, { content, revision: 1 });
  assert.equal(stale.status, 409, "a save based on an older copy is refused");
  assert.match(stale.json.error, /Sarah Johnson saved this draft/);
  assert.equal((await superAdmin.patch(`${builds}/${build.id}`, { content })).status, 400, "the revision is required");
  assert.equal((await superAdmin.patch(`${builds}/${build.id}`, { currentStep: 99, revision: 2 })).json.build.currentStep, 1, "unknown steps fall back to step 1");

  const listed = (await superAdmin.get(builds)).json.drafts.find((draft) => draft.id === build.id);
  assert.equal(listed.title, `Builder Test ${RUN}`);
  assert.equal((await superAdmin.del(`${builds}/${build.id}`)).json.deleted, true);
  assert.equal((await superAdmin.get(`${builds}/${build.id}`)).status, 404);
});

test("playbook builder: one draft per published playbook", needsStaff(), async () => {
  const content = { playbookName: "SPIN Selling" };
  assert.equal((await superAdmin.post(builds, { content, playbookId: "no-such-playbook" })).status, 404);
  const first = await superAdmin.post(builds, { content, playbookId: "spin-selling" });
  const draftId = first.status === 201 ? first.json.build.id : (await superAdmin.get(builds)).json.playbooks.find((item) => item.id === "spin-selling").draftId;
  assert.ok(draftId);
  assert.equal((await superAdmin.post(builds, { content, playbookId: "spin-selling" })).status, 409);
  const library = (await superAdmin.get(builds)).json;
  assert.equal(library.playbooks.find((item) => item.id === "spin-selling").draftId, draftId, "the library points at the draft");
  await superAdmin.del(`${builds}/${draftId}`);
});

test("playbook builder: cover, asset and audio uploads", needsStaff(), async () => {
  const cover = await superAdmin.post(`${builds}/files`, form({ purpose: "cover" }, { file: { name: "cover.png", content: "png-bytes", type: "image/png" } }));
  assert.equal(cover.status, 201, JSON.stringify(cover.json));
  assert.match(cover.json.file.url, /^\/api\/v1\/admin\/playbook-builds\/files\/pbfile_/);
  assert.equal((await superAdmin.get(cover.json.file.url)).status, 200);
  assert.equal((await manager.get(cover.json.file.url)).status, 403);
  assert.equal((await superAdmin.post(`${builds}/files`, form({ purpose: "cover" }, { file: { name: "cover.pdf", content: "%PDF", type: "application/pdf" } }))).status, 400, "covers are images");
  assert.equal((await superAdmin.post(`${builds}/files`, form({ purpose: "audio" }, { file: { name: "voice.mp3", content: "ID3", type: "audio/mpeg" } }))).status, 201);
  assert.equal((await superAdmin.post(`${builds}/files`, form({ purpose: "asset" }, { file: { name: "deck.pptx", content: "PK", type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" } }))).status, 201);
  assert.equal((await superAdmin.post(`${builds}/files`, form({ purpose: "virus" }, { file: { name: "a.exe", content: "MZ" } }))).status, 400);
});

// ── Phase 2: publishing (Spec 12 §9–§11) ──
const validForm = (name, extra = {}) => ({
  playbookName: name,
  author: "PitchProX Test",
  shortDescription: "A playbook made by the API tests.",
  category: "sales-methodology",
  industry: "real-estate",
  experienceLevel: "intermediate",
  style: "consultative",
  leadTypes: ["Expired", "FSBO"],
  price: "29.00",
  distribution: "one-time",
  accessType: "premium",
  visibility: "marketplace",
  internalNotes: "Internal only: margin notes",
  tones: ["confident"],
  stages: [{ id: 1, title: "Opening" }, { id: 2, title: "Discovery" }, { id: 3, title: "Close" }],
  objections: [
    { id: 1, title: "I don't want to pay commission.", category: "Pricing" },
    { id: 2, title: "We're happy with our agent.", rootCategory: "Relationship", subtype: "Loyalty" },
  ],
  resources: [{ id: 1, name: "Opening script", type: "Script", content: "Hi, it's..." }],
  aiFramework: { systemPrompt: "Coach the rep.", idealLength: "20 words", minLength: "10 words", maxLength: "25 words", doDontBoundaries: { dontList: ["Use pressure tactics"], doList: ["Add value first"] }, logicRules: [] },
  ...extra,
});
const publish = (buildId, body) => superAdmin.post(`${builds}/${buildId}/publish`, body);

test("publishing: checks block incomplete drafts and flag contradictions", needsStaff(), async () => {
  const incomplete = (await superAdmin.post(builds, { content: { playbookName: "x" } })).json.build;
  const check = (await superAdmin.get(`${builds}/${incomplete.id}/check`)).json;
  assert.equal(check.ok, false);
  assert.ok(check.errors.some((item) => /3–80 characters/.test(item.message)));
  assert.ok(check.errors.some((item) => /conversation stages/.test(item.message)));
  assert.equal(check.nextVersion, 1);
  const blocked = await publish(incomplete.id, { revision: incomplete.revision });
  assert.equal(blocked.status, 422);
  assert.ok(blocked.json.errors.length > 0);
  await superAdmin.del(`${builds}/${incomplete.id}`);

  const wrongLengths = validForm(`Lengths ${RUN}`, { aiFramework: { ...validForm("x").aiFramework, idealLength: "40 words" } });
  const lengthDraft = (await superAdmin.post(builds, { content: wrongLengths })).json.build;
  assert.ok((await superAdmin.get(`${builds}/${lengthDraft.id}/check`)).json.errors.some((item) => /between the minimum and maximum/.test(item.message)), "min ≤ ideal ≤ max");
  await superAdmin.del(`${builds}/${lengthDraft.id}`);

  const badObjection = validForm(`Roots ${RUN}`, { objections: [{ id: 1, title: "It's too expensive", category: "Vibes" }, { id: 2, title: "it's too expensive", rootCategory: "Financial" }] });
  const objectionDraft = (await superAdmin.post(builds, { content: badObjection })).json.build;
  const objectionCheck = (await superAdmin.get(`${builds}/${objectionDraft.id}/check`)).json;
  assert.ok(objectionCheck.errors.some((item) => /root category/.test(item.message)), "only the four root categories");
  assert.ok(objectionCheck.errors.some((item) => /repeated/.test(item.message)), "duplicates are caught (ignoring capitals)");
  await superAdmin.del(`${builds}/${objectionDraft.id}`);

  const contradiction = validForm(`Contradiction ${RUN}`, { aiFramework: { ...validForm("x").aiFramework, logicRules: [{ id: 1, condition: "Prospect resists", action: "Challenge resistance hard", enabled: true }] } });
  const contradictionDraft = (await superAdmin.post(builds, { content: contradiction })).json.build;
  const warned = (await superAdmin.get(`${builds}/${contradictionDraft.id}/check`)).json;
  assert.equal(warned.ok, true, "contradictions don't block outright");
  assert.ok(warned.warnings.some((item) => item.kind === "contradiction" && /never pressure/.test(item.message)));
  const needsAck = await publish(contradictionDraft.id, { revision: contradictionDraft.revision });
  assert.equal(needsAck.status, 422);
  assert.equal(needsAck.json.needsAcknowledgement, true, "a reviewer must confirm the intended behavior");
  await superAdmin.del(`${builds}/${contradictionDraft.id}`);
});

test("publishing: versions are fixed; edits make a new draft; rollback adds a version", needsStaff(), async () => {
  assert.equal((await manager.post(`${builds}/x/publish`, {})).status, 403);
  const name = `Published ${RUN}`;
  const draft = (await superAdmin.post(builds, { content: validForm(name) })).json.build;
  assert.equal((await publish(draft.id, { revision: draft.revision + 5 })).status, 409, "the draft changed since it was checked");
  const first = await publish(draft.id, { revision: draft.revision });
  assert.equal(first.status, 200, JSON.stringify(first.json));
  assert.equal(first.json.version, 1);
  const playbookId = first.json.playbookId;
  assert.match(playbookId, /^published-/);
  assert.equal((await superAdmin.patch(`${builds}/${draft.id}`, { content: validForm(name), revision: draft.revision })).status, 409, "a published draft can't be edited");

  // The compiled object (Spec 12 §5)
  const v1 = (await superAdmin.get(`/api/v1/admin/playbooks/${playbookId}/versions/1`)).json.playbook;
  for (const key of ["identity", "commerce", "methodology", "voice_language", "conversation_flow", "objection_library", "resources", "prompt_framework", "prompt_dna", "logic_rules", "prompt_delivery", "safety_boundaries", "advanced", "publication"]) assert.ok(key in v1, key);
  assert.deepEqual(v1.objection_library.map((item) => [item.root_category, item.subtype]), [["Financial", "Affordability"], ["Relationship", "Loyalty"]], "old labels become root + subtype");
  assert.equal(v1.commerce.runtime_use, false, "price and access aren't used for live strategy");
  assert.equal(v1.internal.runtime_use, false, "internal notes stay out of the AI");
  assert.ok(v1.safety_boundaries.hard_boundaries.includes("Use pressure tactics"));

  // Customers see marketplace playbooks
  const customer = await newCustomer("playbook");
  assert.ok((await customer.get("/api/v1/playbooks")).json.results.some((item) => item.id === playbookId));

  // Editing starts a new draft from v1; v2 needs release notes
  const second = (await superAdmin.post(builds, { playbookId, content: {} })).json.build;
  assert.equal(second.baseVersion, 1);
  assert.equal(second.content.playbookName, name, "the new draft starts from the version in force");
  const edited = { ...second.content, visibility: "team", tones: ["confident", "direct"] };
  const saved = (await superAdmin.patch(`${builds}/${second.id}`, { content: edited, revision: second.revision })).json.build;
  const check = (await superAdmin.get(`${builds}/${second.id}/check`)).json;
  assert.equal(check.nextVersion, 2);
  assert.deepEqual(check.changedSections, ["Style & Voice", "Review & Publish"]);
  assert.equal((await publish(second.id, { revision: saved.revision })).status, 400, "release notes are required for v2");
  const v2 = await publish(second.id, { revision: saved.revision, releaseNotes: "Added a direct tone and limited it to the team." });
  assert.equal(v2.json.version, 2);
  assert.ok(!(await customer.get("/api/v1/playbooks")).json.results.some((item) => item.id === playbookId), "team-only playbooks are hidden from customers");
  assert.ok((await rep().get("/api/v1/playbooks")).json.results.some((item) => item.id === playbookId), "employees still see team playbooks");

  // Rollback re-publishes v1 as v3
  assert.equal((await superAdmin.post(`/api/v1/admin/playbooks/${playbookId}/rollback`, { version: 1, releaseNotes: "short" })).status, 400);
  assert.equal((await superAdmin.post(`/api/v1/admin/playbooks/${playbookId}/rollback`, { version: 2, releaseNotes: "Already current, should refuse." })).status, 409);
  const rolled = (await superAdmin.post(`/api/v1/admin/playbooks/${playbookId}/rollback`, { version: 1, releaseNotes: "v2 tone change confused reps." })).json;
  assert.equal(rolled.playbook.version, 3);
  assert.equal(rolled.versions[0].version, 3);
  assert.equal(rolled.versions[0].active, true);
  assert.equal(rolled.versions[0].rolledBackFrom, 2);
  assert.deepEqual((await superAdmin.get(`/api/v1/admin/playbooks/${playbookId}/versions/3`)).json.playbook.voice_language.tones, ["confident"], "v3 has v1's methodology");
  assert.deepEqual((await superAdmin.get(`/api/v1/admin/playbooks/${playbookId}/versions/2`)).json.playbook.voice_language.tones, ["confident", "direct"], "v2 is unchanged");
});

test("premium playbooks for customers: overview for all, inside for owners, AI-safe runtime", needsStaff(), async () => {
  const paid = (await superAdmin.post(builds, { content: validForm(`Paid ${RUN}`, { focusAreas: ["build-trust"], keyOutcomes: [{ text: "Book more listing appointments" }] }) })).json.build;
  const paidId = (await publish(paid.id, { revision: paid.revision })).json.playbookId;
  const free = (await superAdmin.post(builds, { content: validForm(`Free ${RUN}`, { accessType: "free", price: "" }) })).json.build;
  const freeId = (await publish(free.id, { revision: free.revision })).json.playbookId;
  assert.ok(paidId && freeId);

  const customer = await newCustomer("premium");
  const listed = (await customer.get("/api/v1/playbooks")).json.results;
  const paidCard = listed.find((item) => item.id === paidId);
  assert.equal(paidCard.price, "$29.00");
  assert.equal(paidCard.isAvailable, false);
  assert.deepEqual(paidCard.overview.focusAreas, ["build-trust"]);
  assert.deepEqual(paidCard.overview.keyOutcomes, ["Book more listing appointments"]);
  assert.deepEqual(paidCard.overview.counts, { stages: 3, objections: 2, resources: 1, rules: 0 });
  assert.equal(listed.find((item) => item.id === freeId).price, "Free");
  for (const card of listed) assert.ok(!("activeVersionId" in card) && !("content" in card));

  // Not bought: the overview only. Free: readable and usable.
  const paidDetail = (await customer.get(`/api/v1/playbooks/${paidId}`)).json.playbook;
  assert.equal(paidDetail.inside, null, "the methodology stays locked until purchase");
  assert.equal((await customer.put("/api/v1/playbooks/active", { playbookId: paidId })).status, 400);
  const freeDetail = (await customer.get(`/api/v1/playbooks/${freeId}`)).json.playbook;
  assert.equal(freeDetail.isAvailable, true);
  assert.deepEqual(freeDetail.inside.stages.map((stage) => stage.title), ["Opening", "Discovery", "Close"]);
  assert.deepEqual(freeDetail.inside.objections[0], { phrase: "I don't want to pay commission.", rootCategory: "Financial", subtype: "Affordability", responseStyle: null, goal: null });
  assert.equal(freeDetail.inside.resources[0].content, "Hi, it's...");
  // Staff get premium playbooks free
  assert.ok((await rep().get(`/api/v1/playbooks/${paidId}`)).json.playbook.inside, "employees can read premium playbooks");

  // The live-call AI: standard has no compiled version; the free one does, AI-safe
  const before = (await customer.get("/api/v1/me/playbook-runtime")).json;
  assert.equal(before.playbookId, "pitchprox-standard");
  assert.equal(before.playbook, null);
  assert.equal((await customer.put("/api/v1/playbooks/active", { playbookId: freeId })).status, 200);
  const runtime = (await customer.get("/api/v1/me/playbook-runtime")).json;
  assert.equal(runtime.playbookId, freeId);
  assert.equal(runtime.version, 1);
  assert.equal(runtime.playbook.contract, "pitchprox.premium-playbook/1");
  assert.equal(runtime.playbook.publication.version, 1);
  for (const key of ["commerce", "internal"]) assert.ok(!(key in runtime.playbook), `${key} is removed`);
  for (const key of ["description", "internal_tags", "status"]) assert.ok(!(key in runtime.playbook.identity), `identity.${key} is removed`);
  assert.ok(!JSON.stringify(runtime.playbook).includes("margin notes"), "internal notes never reach the AI");
  assert.equal((await manager.get("/api/v1/me/playbook-runtime")).status, 403);

  // The AI developer's export
  assert.equal((await manager.get(`/api/v1/admin/playbooks/${paidId}/export`)).status, 403);
  const exported = await superAdmin.get(`/api/v1/admin/playbooks/${paidId}/export?version=1`);
  assert.equal(exported.status, 200);
  assert.match(exported.headers.get("content-disposition"), new RegExp(`${paidId}-v1-ai\\.json`));
  assert.ok(!("commerce" in exported.json) && !("internal" in exported.json));
  assert.ok(!JSON.stringify(exported.json).includes("29"), "no price in the AI export");
  assert.equal((await superAdmin.get(`/api/v1/admin/playbooks/${paidId}/export?version=9`)).status, 404);
});

// ── Phase 4: Resource Library ──
test("resource library: pin, search, update and remove shared resources", needsStaff(), async () => {
  const library = "/api/v1/admin/playbook-resources";
  assert.equal((await manager.get(library)).status, 403);
  assert.equal((await auditor.post(library, { name: "x", type: "Script", content: "y" })).status, 403);

  assert.equal((await superAdmin.post(library, { type: "Script", content: "x" })).status, 400, "a name is required");
  assert.equal((await superAdmin.post(library, { name: "x", type: "Podcast", content: "x" })).status, 400, "only the builder's resource types");
  assert.equal((await superAdmin.post(library, { name: "x", type: "Script" })).status, 400, "something to reuse");
  assert.equal((await superAdmin.post(library, { name: "x", type: "Script", file: { url: "https://evil.example/file.pdf" } })).status, 400, "only files uploaded to the builder");

  const upload = await superAdmin.post(`${builds}/files`, form({ purpose: "resource" }, { file: { name: "objections.txt", content: "Fee: reframe on net.", type: "text/plain" } }));
  assert.equal(upload.status, 201, JSON.stringify(upload.json));
  const name = `Library Script ${RUN}`;
  const pinned = await superAdmin.post(library, { name, type: "Script", description: "Opening lines", content: "Hi, it's…", file: upload.json.file, iconColor: "sky" });
  assert.equal(pinned.status, 201, JSON.stringify(pinned.json));
  const resource = pinned.json.resource;
  assert.equal(resource.addedBy, "Sarah Johnson", "provenance comes from the signed-in user");
  assert.equal(resource.file.name, "objections.txt");
  const again = await superAdmin.post(library, { name: name.toUpperCase(), type: "Script", content: "other text" });
  assert.equal(again.status, 200);
  assert.equal(again.json.alreadyPinned, true);
  assert.equal(again.json.resource.id, resource.id, "pinning the same name + type links to the existing one");
  const guide = (await superAdmin.post(library, { name: `Library Guide ${RUN}`, type: "Guide", content: `Value guide ${RUN}` })).json.resource;

  const found = (query) => superAdmin.get(`${library}?${new URLSearchParams(query)}`).then((res) => res.json.resources.map((item) => item.id));
  assert.deepEqual(await found({ search: `Library Script ${RUN}` }), [resource.id], "search by name");
  assert.deepEqual(await found({ search: `Value guide ${RUN}` }), [guide.id], "search inside the text");
  assert.ok((await found({ search: RUN, type: "Guide" })).every((id) => id === guide.id), "filter by type");
  const listing = (await superAdmin.get(library)).json;
  const sarah = listing.contributors.find((person) => person.name === "Sarah Johnson");
  assert.ok(sarah, "added-by filter options");
  assert.ok((await found({ search: RUN, addedBy: sarah.id })).includes(resource.id));
  assert.deepEqual(await found({ search: RUN, addedBy: "nobody" }), []);
  assert.equal((await superAdmin.get(`${library}?type=Podcast`)).status, 400);
  assert.deepEqual(await found({ search: "100%_" }), [], "wildcards are matched literally");

  const updated = await superAdmin.patch(`${library}/${resource.id}`, { description: "Updated", file: null });
  assert.equal(updated.status, 200, JSON.stringify(updated.json));
  assert.equal(updated.json.resource.description, "Updated");
  assert.equal(updated.json.resource.content, "Hi, it's…", "fields left out are kept");
  assert.equal(updated.json.resource.file, null);
  assert.equal((await superAdmin.patch(`${library}/${resource.id}`, { name: guide.name, type: "Guide" })).status, 409, "no two library resources with the same name and type");

  assert.equal((await superAdmin.del(`${library}/${guide.id}`)).json.removed, true);
  assert.deepEqual(await found({ search: `Value guide ${RUN}` }), [], "removed resources leave the library");
  assert.equal((await superAdmin.patch(`${library}/${guide.id}`, { description: "x" })).status, 404);
  await superAdmin.del(`${library}/${resource.id}`);
});
