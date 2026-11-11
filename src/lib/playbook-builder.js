import { createId, query } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { recordAudit } from "@/lib/audit";
import { requireSection } from "@/lib/permissions";
import { formatBytes, readUpload, saveUpload } from "@/lib/storage";
import { changedSections, checkPlaybook, compilePlaybook, normalizeObjection, visibilityKey } from "@/lib/playbook-compile";

// ── Playbook Builder: saving drafts (backend phase "Playbook Builder 1") ──
// The builder's whole form is stored as one JSON document per build, with the step the editor was
// on. Every save sends the revision it started from; if someone saved in between, the save is
// refused (409) instead of overwriting their work.
// Publishing (phase 2) compiles the draft into an immutable numbered version (Spec 12 §9–§11).
// Super Admin only (the "playbook" section).

const MAX_CONTENT_BYTES = 2 * 1024 * 1024;
const STEPS = 7;
const STORAGE_AREA = "playbook-builder";
const FILE_RULES = {
  cover: { types: ["png", "jpg", "jpeg", "webp"], maxBytes: 5 * 1024 * 1024 },
  asset: { types: ["pdf", "pptx", "ppt", "docx", "doc", "xlsx", "png", "jpg", "jpeg", "mp4", "mov", "mp3", "wav", "m4a"], maxBytes: 100 * 1024 * 1024 },
  audio: { types: ["mp3", "wav", "m4a", "aac", "ogg"], maxBytes: 50 * 1024 * 1024 },
  // A file attached to a resource (script document, guide, recording)
  resource: { types: ["pdf", "docx", "doc", "txt", "pptx", "ppt", "xlsx", "csv", "png", "jpg", "jpeg", "mp3", "wav", "m4a", "mp4", "mov"], maxBytes: 50 * 1024 * 1024 },
};

export const requireBuilder = () => requireSection("playbook");

const parse = (value) => (typeof value === "string" ? JSON.parse(value) : value);
const titleOf = (content) => String(content?.playbookName ?? "").trim().slice(0, 255);

const SELECT = `SELECT playbook_builds.*, creator.name AS createdByName, editor.name AS updatedByName, playbooks.title AS playbookTitle
  FROM playbook_builds
  LEFT JOIN users AS creator ON creator.id = playbook_builds.created_by
  LEFT JOIN users AS editor ON editor.id = playbook_builds.updated_by
  LEFT JOIN playbooks ON playbooks.id = playbook_builds.playbook_id`;

const toSummary = (row) => ({
  id: row.id,
  playbookId: row.playbook_id,
  playbookTitle: row.playbookTitle ?? null,
  baseVersion: row.base_version ?? null,
  title: row.title || "Untitled playbook",
  status: row.status,
  currentStep: row.current_step,
  revision: row.revision,
  createdBy: row.createdByName ?? "—",
  updatedBy: row.updatedByName ?? row.createdByName ?? "—",
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// Playbook Library: platform playbooks (from the database) and the drafts being built
export async function builderLibrary() {
  const [playbooks, drafts] = await Promise.all([
    query("SELECT id, kind, title, subtitle, description, price_cents AS priceCents, icon_letter AS iconLetter, avatar_url AS avatarUrl, status, version, visibility, active_version_id AS activeVersionId, published_at AS publishedAt FROM playbooks WHERE organization_id IS NULL ORDER BY kind = 'standard' DESC, created_at"),
    query(`${SELECT} WHERE playbook_builds.status = 'draft' ORDER BY playbook_builds.updated_at DESC`),
  ]);
  const summaries = drafts.map(toSummary);
  return {
    playbooks: playbooks.map((playbook) => ({ ...playbook, draftId: summaries.find((draft) => draft.playbookId === playbook.id)?.id ?? null })),
    drafts: summaries,
  };
}

async function findBuild(id) {
  const [row] = await query(`${SELECT} WHERE playbook_builds.id = ?`, [id]);
  if (!row) throw new ApiError("Draft not found.", 404);
  return row;
}

export async function getBuild(id) {
  const row = await findBuild(id);
  return { build: { ...toSummary(row), content: parse(row.content) } };
}

function cleanContent(content) {
  if (!content || typeof content !== "object" || Array.isArray(content)) throw new ApiError("The playbook content is missing.");
  const json = JSON.stringify(content);
  if (Buffer.byteLength(json) > MAX_CONTENT_BYTES) throw new ApiError("This playbook is too large to save (2 MB of text max). Remove some content and try again.", 413);
  // Browser-only file links (blob:) can't be opened later; files must be uploaded first
  if (json.includes('"blob:')) throw new ApiError("A file in this playbook hasn't finished uploading. Wait for it, then save again.");
  return json;
}

const cleanStep = (value) => {
  const step = Number.parseInt(value, 10);
  return Number.isFinite(step) && step >= 1 && step <= STEPS ? step : 1;
};

// New draft: blank, or the working copy of an existing platform playbook (one draft per playbook)
// Editing a published playbook starts from the version in force (Spec 12 §11): its builder form
// is copied into the new draft and `content` from the browser is ignored.
export async function createBuild(user, { playbookId = null, content, currentStep = 1 }) {
  let baseVersion = null;
  if (playbookId) {
    const [playbook] = await query("SELECT id, title, active_version_id AS activeVersionId, version FROM playbooks WHERE id = ? AND organization_id IS NULL", [playbookId]);
    if (!playbook) throw new ApiError("That platform playbook doesn't exist.", 404);
    const [existing] = await query("SELECT id FROM playbook_builds WHERE playbook_id = ? AND status = 'draft'", [playbookId]);
    if (existing) throw new ApiError("This playbook already has a draft. Open it from the Playbook Library.", 409);
    if (playbook.activeVersionId) {
      const [active] = await query("SELECT source FROM playbook_versions WHERE id = ?", [playbook.activeVersionId]);
      content = parse(active.source);
      baseVersion = playbook.version;
    }
  }
  const json = cleanContent(content);
  const id = createId("pbuild");
  await query(
    "INSERT INTO playbook_builds (id, playbook_id, title, content, current_step, base_version, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [id, playbookId, titleOf(content), json, cleanStep(currentStep), baseVersion, user.id, user.id]
  );
  await recordAudit(user, { action: "playbook.draft_created", entityType: "playbook_build", entityId: id, summary: `Started a playbook draft${titleOf(content) ? `: ${titleOf(content)}` : ""}${playbookId ? " (editing a published playbook)" : ""}` });
  return getBuild(id);
}

// Save: { content, currentStep, revision } — revision is the one this editor loaded or last saved
export async function saveBuild(user, id, { content, currentStep, revision }) {
  const row = await findBuild(id);
  if (row.status !== "draft") throw new ApiError("Only drafts can be edited.", 409);
  if (!Number.isInteger(revision)) throw new ApiError("Missing revision.");
  const json = content === undefined ? null : cleanContent(content);
  const result = await query(
    `UPDATE playbook_builds SET ${json ? "content = ?, title = ?, " : ""}current_step = ?, revision = revision + 1, updated_by = ? WHERE id = ? AND revision = ?`,
    [...(json ? [json, titleOf(content)] : []), cleanStep(currentStep ?? row.current_step), user.id, id, revision]
  );
  if (!result.affectedRows) {
    const latest = await findBuild(id);
    throw new ApiError(`${latest.updatedByName ?? "Someone"} saved this draft after you opened it. Reload to see their changes.`, 409);
  }
  const saved = await findBuild(id);
  return { build: toSummary(saved) };
}

export async function deleteBuild(user, id) {
  const row = await findBuild(id);
  if (row.status !== "draft") throw new ApiError("Only drafts can be deleted.", 409);
  await query("DELETE FROM playbook_builds WHERE id = ?", [id]);
  await recordAudit(user, { action: "playbook.draft_deleted", entityType: "playbook_build", entityId: id, summary: `Deleted the playbook draft ${row.title || "Untitled playbook"}` });
  return { deleted: true };
}

// ── Files (cover image, assets, voice audio) ──
export async function uploadBuilderFile(user, form) {
  const purpose = String(form.get("purpose") ?? "");
  const rules = FILE_RULES[purpose];
  if (!rules) throw new ApiError("Unknown file purpose.");
  const file = form.get("file");
  const saved = await saveUpload(STORAGE_AREA, file, { maxBytes: rules.maxBytes, allowed: rules.types });
  const id = createId("pbfile");
  await query("INSERT INTO playbook_build_files (id, purpose, file_path, file_name, file_size, file_mime, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?)", [id, purpose, saved.storagePath, saved.name, saved.size, saved.mime, user.id]);
  return { file: { id, name: saved.name, size: formatBytes(saved.size), type: saved.extension.toUpperCase(), url: `/api/v1/admin/playbook-builds/files/${id}` } };
}

export async function builderFile(id) {
  const [file] = await query("SELECT file_path, file_name, file_mime FROM playbook_build_files WHERE id = ?", [id]);
  if (!file) throw new ApiError("File not found.", 404);
  return { bytes: await readUpload(file.file_path), name: file.file_name, mime: file.file_mime || "application/octet-stream" };
}


// ── Publishing (build phase 2) ──
// Checks run on the saved draft (what's in the database, not what's on screen).
export async function checkBuild(id) {
  const row = await findBuild(id);
  const content = parse(row.content);
  const result = checkPlaybook(content);
  let previous = null;
  if (row.playbook_id) {
    const [active] = await query("SELECT playbook_versions.source, playbook_versions.version FROM playbooks JOIN playbook_versions ON playbook_versions.id = playbooks.active_version_id WHERE playbooks.id = ?", [row.playbook_id]);
    previous = active ?? null;
  }
  return {
    ...result,
    revision: row.revision,
    nextVersion: (previous?.version ?? 0) + 1,
    changedSections: previous ? changedSections(parse(previous.source), content) : null,
    releaseNotesRequired: Boolean(previous),
  };
}

const slugify = (name) => String(name).toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50) || "playbook";

// { revision, releaseNotes, acknowledgeWarnings } → publishes the draft as the next version.
// Returns { ok: false, errors, warnings } when checks block it.
export async function publishBuild(user, id, { revision, releaseNotes, acknowledgeWarnings = false }) {
  const row = await findBuild(id);
  if (row.status !== "draft") throw new ApiError("This draft was already published.", 409);
  if (revision !== row.revision) throw new ApiError("The draft changed since you reviewed it. Check it again before publishing.", 409);
  const content = parse(row.content);
  const check = await checkBuild(id);
  if (!check.ok) return { ok: false, errors: check.errors, warnings: check.warnings };
  if (check.warnings.length && !acknowledgeWarnings) return { ok: false, errors: [], warnings: check.warnings, needsAcknowledgement: true };
  const notes = String(releaseNotes ?? "").trim();
  if (check.releaseNotesRequired && notes.length < 10) throw new ApiError("Describe what changed in this version (release notes, at least 10 characters).");
  if (notes.length > 2000) throw new ApiError("Release notes are too long (2,000 characters max).");

  // The platform playbook: existing, or created on the first publish
  let playbookId = row.playbook_id;
  if (!playbookId) {
    const base = slugify(content.playbookName);
    const taken = new Set((await query("SELECT id FROM playbooks WHERE id = ? OR id LIKE ?", [base, `${base}-%`])).map((item) => item.id));
    playbookId = base;
    for (let suffix = 2; taken.has(playbookId); suffix += 1) playbookId = `${base}-${suffix}`;
  }
  const version = check.nextVersion;
  const versionId = createId("pbver");
  const publishedAt = new Date();
  const compiled = compilePlaybook(content, { playbookId, version, publishedBy: user.id, publishedAt: publishedAt.toISOString(), releaseNotes: notes || null, basedOn: row.base_version });
  const source = { ...content, objections: (content.objections ?? []).map(normalizeObjection) };
  const commerce = compiled.commerce;
  const kind = "premium";
  const priceCents = commerce.access_type === "free" ? null : Math.round(commerce.price * 100);
  const words = String(content.playbookName).trim().split(/\s+/);
  const iconLetter = (words.length > 1 ? words[0][0] + words[1][0] : words[0].slice(0, 2)).toUpperCase();

  if (row.playbook_id) {
    await query(
      "UPDATE playbooks SET title = ?, subtitle = ?, description = ?, price_cents = ?, avatar_url = COALESCE(?, avatar_url), visibility = ?, status = 'published' WHERE id = ?",
      [compiled.identity.name, compiled.identity.author, compiled.identity.description, priceCents, commerce.cover_image, commerce.visibility, playbookId]
    );
  } else {
    await query(
      "INSERT INTO playbooks (id, organization_id, kind, title, subtitle, description, price_cents, icon_letter, avatar_url, status, visibility, created_by) VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?)",
      [playbookId, kind, compiled.identity.name, compiled.identity.author, compiled.identity.description, priceCents, iconLetter, commerce.cover_image, commerce.visibility, user.id]
    );
  }
  await query(
    "INSERT INTO playbook_versions (id, playbook_id, version, content, source, release_notes, changed_sections, warnings_acknowledged, build_id, published_by, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [versionId, playbookId, version, JSON.stringify(compiled), JSON.stringify(source), notes || null, check.changedSections ? JSON.stringify(check.changedSections) : null, check.warnings.length ? JSON.stringify(check.warnings) : null, id, user.id, publishedAt]
  );
  await query("UPDATE playbooks SET active_version_id = ?, version = ?, published_at = ? WHERE id = ?", [versionId, version, publishedAt, playbookId]);
  await query("UPDATE playbook_builds SET status = 'published', playbook_id = ?, published_version_id = ? WHERE id = ?", [playbookId, versionId, id]);
  await recordAudit(user, {
    action: "playbook.published",
    entityType: "playbook",
    entityId: playbookId,
    summary: `Published ${compiled.identity.name} v${version}${check.warnings.length ? ` (${check.warnings.length} review warning${check.warnings.length === 1 ? "" : "s"} acknowledged)` : ""}`,
    metadata: { version, changedSections: check.changedSections, releaseNotes: notes || null },
  });
  return { ok: true, playbookId, version, versionId };
}

const toVersion = (row, activeId) => ({
  id: row.id,
  version: row.version,
  releaseNotes: row.release_notes,
  changedSections: parse(row.changed_sections) ?? [],
  warningsAcknowledged: (parse(row.warnings_acknowledged) ?? []).length,
  rolledBackFrom: row.rolled_back_from,
  publishedBy: row.publisherName ?? "—",
  publishedAt: row.published_at,
  active: row.id === activeId,
});

// A platform playbook's version history (newest first)
export async function listVersions(playbookId) {
  const [playbook] = await query("SELECT id, title, active_version_id AS activeVersionId, version FROM playbooks WHERE id = ? AND organization_id IS NULL", [playbookId]);
  if (!playbook) throw new ApiError("Playbook not found.", 404);
  const rows = await query("SELECT playbook_versions.*, users.name AS publisherName FROM playbook_versions LEFT JOIN users ON users.id = playbook_versions.published_by WHERE playbook_id = ? ORDER BY version DESC", [playbookId]);
  return { playbook: { id: playbook.id, title: playbook.title, version: playbook.version }, versions: rows.map((row) => toVersion(row, playbook.activeVersionId)) };
}

// The compiled PremiumPlaybook object of one version (immutable)
export async function getVersion(playbookId, version) {
  const [row] = await query("SELECT content FROM playbook_versions WHERE playbook_id = ? AND version = ?", [playbookId, Number(version)]);
  if (!row) throw new ApiError("Version not found.", 404);
  return { playbook: parse(row.content) };
}

// Rollback (§11): an earlier version's content becomes the newest version; nothing is overwritten
export async function rollbackVersion(user, playbookId, { version, releaseNotes }) {
  const [playbook] = await query("SELECT id, title, version, active_version_id AS activeVersionId FROM playbooks WHERE id = ? AND organization_id IS NULL", [playbookId]);
  if (!playbook) throw new ApiError("Playbook not found.", 404);
  const [target] = await query("SELECT * FROM playbook_versions WHERE playbook_id = ? AND version = ?", [playbookId, Number(version)]);
  if (!target) throw new ApiError("Version not found.", 404);
  if (target.id === playbook.activeVersionId) throw new ApiError(`v${target.version} is already the version in force.`, 409);
  const reason = String(releaseNotes ?? "").trim();
  if (reason.length < 10) throw new ApiError("Say why you're rolling back (at least 10 characters).");
  const next = playbook.version + 1;
  const versionId = createId("pbver");
  const publishedAt = new Date();
  const compiled = parse(target.content);
  compiled.identity = { ...compiled.identity, version: next };
  compiled.publication = { ...compiled.publication, version: next, published_at: publishedAt.toISOString(), published_by: user.id, release_notes: reason, based_on_version: target.version, rolled_back_from: playbook.version };
  await query(
    "INSERT INTO playbook_versions (id, playbook_id, version, content, source, release_notes, changed_sections, rolled_back_from, published_by, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [versionId, playbookId, next, JSON.stringify(compiled), target.source, `Rolled back to v${target.version}: ${reason}`, JSON.stringify(["Rollback"]), playbook.version, user.id, publishedAt]
  );
  const source = parse(target.source);
  await query("UPDATE playbooks SET active_version_id = ?, version = ?, published_at = ?, title = ?, subtitle = ?, description = ? WHERE id = ?", [versionId, next, publishedAt, compiled.identity.name, compiled.identity.author, compiled.identity.description, playbookId]);
  await recordAudit(user, { action: "playbook.rolled_back", entityType: "playbook", entityId: playbookId, summary: `Rolled ${playbook.title} back to v${target.version} (now v${next}): ${reason}`, metadata: { from: playbook.version, to: target.version, version: next, visibility: visibilityKey(source.visibility) } });
  return listVersions(playbookId);
}
