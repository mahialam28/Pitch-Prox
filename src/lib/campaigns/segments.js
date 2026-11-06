import { createId, query } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { recordAudit } from "@/lib/audit";
import { requireSection } from "@/lib/permissions";
import { ROLES } from "@/utils.js/roles";
import { SYSTEM_SEGMENTS, membersOf, ruleError } from "@/lib/campaigns/rules";
import { loadProfiles } from "@/lib/campaigns/profiles";

// ── Segments (Campaigns & Journeys → Segments) ──
// Dynamic: rules decide membership, re-evaluated on every read and by the job runner.
// Static: the users an admin picked. Both work for broadcasts and journeys.

export const canManageCampaigns = (user) => [ROLES.SUPER_ADMIN, ROLES.ADMIN_MANAGER].includes(user.role);

// Super Admin and Admin Manager build and send; Support can look
export async function requireCampaigns({ write = false } = {}) {
  const user = await requireSection("campaigns");
  if (write && !canManageCampaigns(user)) throw new Error("FORBIDDEN");
  return user;
}

let seeded = false;
async function seedSystemSegments() {
  if (seeded) return;
  for (const segment of SYSTEM_SEGMENTS) {
    await query(
      "INSERT IGNORE INTO campaign_segments (id, name, description, type, rules, system_key, created_by_name) VALUES (?, ?, ?, 'Dynamic', ?, ?, 'PitchProX (system)')",
      [`seg_${segment.key}`, segment.name, segment.description, JSON.stringify(segment.rules), segment.key]
    );
  }
  seeded = true;
}

const parse = (value) => (typeof value === "string" ? JSON.parse(value) : value);
const COLUMNS = "id, name, description, type, rules, system_key AS systemKey, created_by_name AS creator, created_at AS createdAt, updated_at AS updatedAt";

async function rawSegments({ ids = null } = {}) {
  await seedSystemSegments();
  const rows = await query(`SELECT ${COLUMNS} FROM campaign_segments WHERE archived_at IS NULL ${ids ? `AND id IN (${ids.map(() => "?").join(", ")})` : ""} ORDER BY system_key IS NULL, created_at`, ids ?? []);
  if (!rows.length) return [];
  const members = await query(`SELECT segment_id AS segmentId, user_id AS userId FROM campaign_segment_members WHERE segment_id IN (${rows.map(() => "?").join(", ")})`, rows.map((row) => row.id));
  return rows.map((row) => ({
    ...row,
    rules: parse(row.rules),
    system: Boolean(row.systemKey),
    userIds: members.filter((member) => member.segmentId === row.id).map((member) => member.userId),
  }));
}

// Where each segment is used (campaigns and journeys)
async function usage() {
  const campaigns = await query("SELECT id, name, status, segment_id AS segmentId, recipients, sent_at AS sentAt FROM campaigns WHERE segment_id IS NOT NULL AND status <> 'canceled'");
  const journeys = await query("SELECT id, name, status, audience, trigger_config AS triggerConfig FROM journeys WHERE status <> 'archived'");
  return { campaigns, journeys: journeys.map((row) => ({ ...row, audience: parse(row.audience), triggerConfig: parse(row.triggerConfig) })) };
}

function present(segment, profiles, used, now) {
  const members = membersOf(segment, profiles, now);
  const campaigns = used.campaigns.filter((campaign) => campaign.segmentId === segment.id);
  const journeys = used.journeys.filter((journey) => journey.audience?.segmentId === segment.id || journey.triggerConfig?.segmentId === segment.id);
  return {
    ...segment,
    memberIds: members.map((member) => member.id),
    memberCount: members.length,
    usedInCampaign: Boolean(campaigns.length || journeys.length),
    campaigns: campaigns.map((campaign) => ({ id: campaign.id, name: campaign.name, status: campaign.status, recipients: campaign.recipients, kind: "campaign" })),
    journeys: journeys.map((journey) => ({ id: journey.id, name: journey.name, status: journey.status, kind: "journey" })),
  };
}

// Segments page: every user profile (for the table and the live rule preview) and every segment
export async function segmentsOverview() {
  const now = new Date();
  const [profiles, segments, used] = await Promise.all([loadProfiles({ now }), rawSegments(), usage()]);
  const plans = await query("SELECT name FROM plans WHERE active = 1 ORDER BY sort_order");
  return { users: profiles, segments: segments.map((segment) => present(segment, profiles, used, now)), plans: plans.map((row) => row.name), today: now.toISOString() };
}

export async function getSegment(id) {
  const now = new Date();
  const [segment] = await rawSegments({ ids: [id] });
  if (!segment) throw new ApiError("Segment not found.", 404);
  const [profiles, used] = await Promise.all([loadProfiles({ now }), usage()]);
  const result = present(segment, profiles, used, now);
  return { segment: result, members: profiles.filter((profile) => result.memberIds.includes(profile.id)), users: profiles };
}

// Members right now (campaign sends, journeys)
export async function segmentMembers(id, { profiles = null, now = new Date() } = {}) {
  const [segment] = await rawSegments({ ids: [id] });
  if (!segment) throw new ApiError("That segment no longer exists.", 404);
  return membersOf(segment, profiles ?? (await loadProfiles({ now })), now);
}

export const allSegments = rawSegments;

const cleanText = (value, label, max, { required = false } = {}) => {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (required && !trimmed) throw new ApiError(`${label} is required.`);
  if (trimmed.length > max) throw new ApiError(`${label} must be ${max} characters or fewer.`);
  return trimmed || null;
};

function cleanRules(rules) {
  const match = rules?.match === "any" ? "any" : "all";
  const conditions = Array.isArray(rules?.conditions) ? rules.conditions : [];
  if (!conditions.length) throw new ApiError("Add at least one entry rule.");
  if (conditions.length > 20) throw new ApiError("A segment can have up to 20 rules.");
  const clean = conditions.map((condition) => {
    const error = ruleError(condition);
    if (error) throw new ApiError(error);
    return { field: condition.field, operator: condition.operator, value: typeof condition.value === "string" ? condition.value.trim() : Number(condition.value) };
  });
  return { match, conditions: clean };
}

async function cleanUserIds(userIds) {
  const ids = [...new Set(Array.isArray(userIds) ? userIds.filter((id) => typeof id === "string") : [])];
  if (!ids.length) return [];
  if (ids.length > 5000) throw new ApiError("A static segment can have up to 5,000 users.");
  const found = await loadProfiles({ userIds: ids });
  if (found.length !== ids.length) throw new ApiError("Some of those users no longer exist.");
  return ids;
}

export async function createSegment(user, body) {
  const type = body?.type === "Static" ? "Static" : "Dynamic";
  const name = cleanText(body?.name, "Segment name", 120, { required: true });
  const description = cleanText(body?.description, "Description", 300);
  const [clash] = await query("SELECT id FROM campaign_segments WHERE name = ? AND archived_at IS NULL", [name]);
  if (clash) throw new ApiError("A segment with this name already exists.", 409);
  const rules = type === "Dynamic" ? cleanRules(body.rules) : null;
  const userIds = type === "Static" ? await cleanUserIds(body.userIds) : [];
  if (type === "Static" && !userIds.length) throw new ApiError("Choose at least one user for a static segment.");
  const id = createId("seg");
  await query("INSERT INTO campaign_segments (id, name, description, type, rules, created_by, created_by_name) VALUES (?, ?, ?, ?, ?, ?, ?)", [id, name, description, type, rules ? JSON.stringify(rules) : null, user.id, user.name]);
  for (const userId of userIds) await query("INSERT INTO campaign_segment_members (segment_id, user_id) VALUES (?, ?)", [id, userId]);
  await recordAudit(user, { action: "campaigns.segment_created", entityType: "segment", entityId: id, summary: `Created the ${type.toLowerCase()} segment "${name}"` });
  return (await getSegment(id)).segment;
}

// System segments keep their type and name, but their rules (e.g. the usage threshold) can change
export async function updateSegment(user, id, body) {
  const [segment] = await rawSegments({ ids: [id] });
  if (!segment) throw new ApiError("Segment not found.", 404);
  const sets = ["updated_at = NOW()"];
  const values = [];
  if (body.name !== undefined && !segment.system) {
    const name = cleanText(body.name, "Segment name", 120, { required: true });
    const [clash] = await query("SELECT id FROM campaign_segments WHERE name = ? AND id <> ? AND archived_at IS NULL", [name, id]);
    if (clash) throw new ApiError("A segment with this name already exists.", 409);
    sets.push("name = ?");
    values.push(name);
  }
  if (body.description !== undefined) { sets.push("description = ?"); values.push(cleanText(body.description, "Description", 300)); }
  if (segment.type === "Dynamic" && body.rules !== undefined) { sets.push("rules = ?"); values.push(JSON.stringify(cleanRules(body.rules))); }
  if (segment.type === "Static" && body.userIds !== undefined) {
    const userIds = await cleanUserIds(body.userIds);
    if (!userIds.length) throw new ApiError("A static segment needs at least one user.");
    await query("DELETE FROM campaign_segment_members WHERE segment_id = ?", [id]);
    for (const userId of userIds) await query("INSERT INTO campaign_segment_members (segment_id, user_id) VALUES (?, ?)", [id, userId]);
  }
  await query(`UPDATE campaign_segments SET ${sets.join(", ")} WHERE id = ?`, [...values, id]);
  await recordAudit(user, { action: "campaigns.segment_updated", entityType: "segment", entityId: id, summary: `Updated the segment "${segment.name}"` });
  return (await getSegment(id)).segment;
}

// "Add to Static Segment" from the users table
export async function addSegmentUsers(user, id, userIds) {
  const [segment] = await rawSegments({ ids: [id] });
  if (!segment) throw new ApiError("Segment not found.", 404);
  if (segment.type !== "Static") throw new ApiError("Users can only be added by hand to static segments. Dynamic segments follow their rules.");
  const ids = await cleanUserIds(userIds);
  if (!ids.length) throw new ApiError("Choose at least one user.");
  for (const userId of ids) await query("INSERT IGNORE INTO campaign_segment_members (segment_id, user_id) VALUES (?, ?)", [id, userId]);
  await query("UPDATE campaign_segments SET updated_at = NOW() WHERE id = ?", [id]);
  await recordAudit(user, { action: "campaigns.segment_updated", entityType: "segment", entityId: id, summary: `Added ${ids.length} user${ids.length === 1 ? "" : "s"} to "${segment.name}"` });
  return (await getSegment(id)).segment;
}

// Built-in segments can't be deleted; segments in use by a scheduled campaign or a live journey can't either
export async function deleteSegment(user, id) {
  const [segment] = await rawSegments({ ids: [id] });
  if (!segment) throw new ApiError("Segment not found.", 404);
  if (segment.system) throw new ApiError("Built-in segments can't be deleted.", 409);
  const [scheduled] = await query("SELECT name FROM campaigns WHERE segment_id = ? AND status IN ('scheduled', 'sending') LIMIT 1", [id]);
  if (scheduled) throw new ApiError(`The campaign "${scheduled.name}" is still going to use this segment.`, 409);
  const used = (await usage()).journeys.find((journey) => journey.status === "active" && (journey.audience?.segmentId === id || journey.triggerConfig?.segmentId === id));
  if (used) throw new ApiError(`The live journey "${used.name}" uses this segment. Pause it first.`, 409);
  await query("UPDATE campaign_segments SET archived_at = NOW() WHERE id = ?", [id]);
  await recordAudit(user, { action: "campaigns.segment_deleted", entityType: "segment", entityId: id, summary: `Deleted the segment "${segment.name}"` });
}
