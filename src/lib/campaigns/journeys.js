import { createId, query } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { recordAudit } from "@/lib/audit";
import { allSegments } from "@/lib/campaigns/segments";
import { getTemplate, listTemplates, renderTemplate } from "@/lib/campaigns/templates";
import { loadProfiles } from "@/lib/campaigns/profiles";
import { queueEmail } from "@/lib/campaigns/outbox";
import {
  AUDIENCE_TYPES, CONDITION_TYPES, DATE_FIELDS, DELAY_UNITS, EXIT_CONDITIONS, GOALS, REENTRY_OPTIONS, TRIGGER_TYPES, USER_FIELDS, eventByKey, eventByLabel,
} from "@/lib/campaigns/catalog";

// ── Lifecycle journeys ──
// Saved as a draft while being built; Publish validates everything and makes it live, after
// which the job runner (lib/campaigns/runner) enrolls users and runs the steps.

const parse = (value) => (typeof value === "string" ? JSON.parse(value) : value);
const COLUMNS = "id, name, description, trigger_config AS triggerConfig, audience, reentry, exit_conditions AS exitConditions, goal, steps, status, published_at AS publishedAt, created_by_name AS createdByName, created_at AS createdAt, updated_at AS updatedAt";
const toJourney = (row) => ({ ...row, triggerConfig: parse(row.triggerConfig), audience: parse(row.audience), reentry: parse(row.reentry), exitConditions: parse(row.exitConditions), steps: parse(row.steps) });

const DEFAULTS = {
  triggerConfig: { type: "User Event", event: "trial_started" },
  audience: { type: "All Eligible Users" },
  reentry: { mode: "Never" },
  exitConditions: [{ type: "Goal Completed" }],
  goal: "Trial Converted to Paid",
  steps: [],
};

async function stats(ids) {
  if (!ids.length) return new Map();
  const rows = await query(
    `SELECT journey_id AS id, COUNT(*) AS entered, SUM(status = 'active') AS active, SUM(status = 'completed') AS completed, SUM(status = 'exited') AS exited, SUM(goal_reached_at IS NOT NULL) AS goals
     FROM journey_enrollments WHERE journey_id IN (${ids.map(() => "?").join(", ")}) GROUP BY journey_id`,
    ids
  );
  const mail = await query(
    `SELECT journey_enrollments.journey_id AS id, COUNT(*) AS emails, SUM(email_deliveries.opened_at IS NOT NULL) AS opened, SUM(email_deliveries.clicked_at IS NOT NULL) AS clicked, SUM(email_deliveries.status = 'sent') AS sent
     FROM email_deliveries JOIN journey_enrollments ON journey_enrollments.id = email_deliveries.enrollment_id
     WHERE journey_enrollments.journey_id IN (${ids.map(() => "?").join(", ")}) GROUP BY journey_enrollments.journey_id`,
    ids
  );
  const map = new Map(rows.map((row) => [row.id, { entered: Number(row.entered), active: Number(row.active), completed: Number(row.completed), exited: Number(row.exited), goals: Number(row.goals) }]));
  for (const row of mail) map.set(row.id, { ...(map.get(row.id) ?? {}), emails: Number(row.emails), sent: Number(row.sent), opened: Number(row.opened), clicked: Number(row.clicked) });
  return map;
}

const EMPTY_STATS = { entered: 0, active: 0, completed: 0, exited: 0, goals: 0, emails: 0, sent: 0, opened: 0, clicked: 0 };
const withStats = (journey, map) => {
  const s = { ...EMPTY_STATS, ...(map.get(journey.id) ?? {}) };
  return { ...journey, stats: s, conversionRate: s.entered ? Math.round((s.goals / s.entered) * 1000) / 10 : null };
};

export async function listJourneys() {
  const rows = (await query(`SELECT ${COLUMNS} FROM journeys WHERE status <> 'archived' ORDER BY FIELD(status, 'active', 'paused', 'draft'), COALESCE(updated_at, created_at) DESC`)).map(toJourney);
  const map = await stats(rows.map((row) => row.id));
  return rows.map((row) => withStats(row, map));
}

export async function getJourney(id) {
  const [row] = await query(`SELECT ${COLUMNS} FROM journeys WHERE id = ?`, [id]);
  if (!row || row.status === "archived") throw new ApiError("Journey not found.", 404);
  return withStats(toJourney(row), await stats([id]));
}

// Recent enrollments of one journey (journey detail)
export async function journeyEnrollments(id) {
  await getJourney(id);
  return query(
    `SELECT journey_enrollments.id, journey_enrollments.status, journey_enrollments.entered_at AS enteredAt, journey_enrollments.finished_at AS finishedAt,
      journey_enrollments.exit_reason AS exitReason, journey_enrollments.next_run_at AS nextRunAt, journey_enrollments.goal_reached_at AS goalReachedAt,
      users.name, users.email, organizations.name AS company
     FROM journey_enrollments JOIN users ON users.id = journey_enrollments.user_id JOIN organizations ON organizations.id = users.organization_id
     WHERE journey_enrollments.journey_id = ? ORDER BY journey_enrollments.entered_at DESC LIMIT 200`,
    [id]
  );
}

// ── Validation ──
const fail = (message) => {
  throw new ApiError(message);
};
const positiveInt = (value, label, max) => {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1 || number > max) fail(`${label} must be a whole number from 1 to ${max}.`);
  return number;
};

function cleanTrigger(trigger, segments) {
  const type = trigger?.type;
  if (!TRIGGER_TYPES.includes(type)) fail("Choose a trigger type.");
  if (type === "User Event") {
    const event = eventByKey(trigger.event) ?? eventByLabel(trigger.event);
    if (!event) fail("Choose the user event that starts the journey.");
    const clean = { type, event: event.key };
    if (event.timed) clean.amount = positiveInt(trigger.amount ?? event.timed.default, event.timed.label, event.timed.unit === "hours" ? 24 * 90 : 365);
    if (event.usage) clean.usagePct = positiveInt(trigger.usagePct ?? 80, "Usage percentage", 1000);
    return clean;
  }
  if (type === "Enters Segment" || type === "Exits Segment") {
    if (!segments.some((segment) => segment.id === trigger.segmentId)) fail("Choose the segment for the trigger.");
    return { type, segmentId: trigger.segmentId };
  }
  // Date / Relative Date
  if (trigger.mode === "fixed") {
    const at = new Date(trigger.at);
    if (!trigger.at || Number.isNaN(at.getTime())) fail("Choose the date and time the journey starts.");
    return { type, mode: "fixed", at: at.toISOString() };
  }
  if (!DATE_FIELDS.some((field) => field.key === trigger.field)) fail("Choose the profile date the journey is relative to.");
  const offsetDays = Number(trigger.offsetDays ?? 0);
  if (!Number.isInteger(offsetDays) || Math.abs(offsetDays) > 365) fail("The day offset must be between -365 and 365.");
  return { type, mode: "relative", field: trigger.field, offsetDays };
}

function cleanAudience(audience, segments) {
  if (!AUDIENCE_TYPES.includes(audience?.type)) fail("Choose the journey audience.");
  if (audience.type === "All Eligible Users") return { type: audience.type };
  const segment = segments.find((item) => item.id === audience.segmentId);
  const wanted = audience.type === "Dynamic Segment" ? "Dynamic" : "Static";
  if (!segment || segment.type !== wanted) fail(`Choose a ${wanted.toLowerCase()} segment for the audience.`);
  return { type: audience.type, segmentId: segment.id };
}

function cleanReentry(reentry) {
  if (!REENTRY_OPTIONS.includes(reentry?.mode)) fail("Choose a re-entry option.");
  return reentry.mode === "After X Days" ? { mode: reentry.mode, days: positiveInt(reentry.days, "Re-entry days", 365) } : { mode: reentry.mode };
}

function cleanExits(exits) {
  const list = Array.isArray(exits) ? exits : [];
  return list.map((exit) => {
    if (!EXIT_CONDITIONS.includes(exit?.type)) fail("Choose a valid exit condition.");
    if (exit.type === "Custom User Event") {
      const event = eventByKey(exit.event) ?? eventByLabel(exit.event);
      if (!event) fail("Choose the event for the custom exit condition.");
      return { type: exit.type, event: event.key };
    }
    return { type: exit.type };
  });
}

// Steps: the builder's tree (main path + one level of Yes/No branches)
function cleanSteps(steps, { templates, segments, publish }) {
  if (!Array.isArray(steps)) fail("The journey steps are invalid.");
  let count = 0;
  const walk = (list, depth) =>
    list.map((step) => {
      count += 1;
      if (count > 100) fail("A journey can have up to 100 steps.");
      const defaultTitle = { email: "Send email", delay: `Wait ${step.amount} ${step.unit}${Number(step.amount) === 1 ? "" : "s"}`, condition: `${step.condition}?`, update: "Update user field", tag: "Add user tag", untag: "Remove user tag", goal: `${step.goal ?? "Goal"}?`, end: "End journey" }[step.type] ?? "Step";
      const base = { id: String(step.id ?? createId("step")).slice(0, 80), type: step.type, title: String(step.title || defaultTitle).slice(0, 160), subtitle: String(step.subtitle ?? "").slice(0, 200) };
      switch (step.type) {
        case "trigger":
          return null; // the trigger lives in trigger_config
        case "email": {
          const template = templates.find((item) => item.id === step.templateId);
          if (publish && (!template || template.status !== "Active")) fail(`"${step.title || "Send email"}" needs an Active template.`);
          if (publish && template.emailType === "Transactional") fail(`"${template.name}" is Transactional. Journeys send Lifecycle or Marketing emails.`);
          return { ...base, templateId: step.templateId ?? null, subtitle: template?.name ?? base.subtitle };
        }
        case "delay":
          if (!DELAY_UNITS[step.unit]) fail("Choose minutes, hours, days or weeks for every Wait step.");
          return { ...base, amount: positiveInt(step.amount, "Wait time", 1000), unit: step.unit };
        case "condition": {
          if (depth > 0) fail("Conditions can't be nested inside another condition's branch.");
          if (!CONDITION_TYPES.includes(step.condition)) fail("Choose what every Condition step checks.");
          const clean = { ...base, condition: step.condition, conditionValue: step.conditionValue ?? null };
          if (["User Is In Segment", "User Is Not In Segment"].includes(step.condition) && publish && !segments.some((segment) => segment.id === step.conditionValue)) fail(`"${step.title}" needs a segment.`);
          if (["Event Occurred", "Event Did Not Occur"].includes(step.condition) && publish && !eventByKey(step.conditionValue)) fail(`"${step.title}" needs an event.`);
          if (["Email Opened", "Email Clicked"].includes(step.condition) && publish && !templates.some((item) => item.id === step.conditionValue)) fail(`"${step.title}" needs the email it checks.`);
          if (["Call Usage %", "Last Login"].includes(step.condition) && publish) positiveInt(step.conditionValue, step.condition === "Last Login" ? "Last login days" : "Call usage %", 1000);
          return { ...clean, branches: { yes: walk(step.branches?.yes ?? [], depth + 1).filter(Boolean), no: walk(step.branches?.no ?? [], depth + 1).filter(Boolean) } };
        }
        case "update":
          if (!USER_FIELDS[step.field] || !USER_FIELDS[step.field].includes(step.status)) fail("Choose a field and value for every Update User Field step.");
          return { ...base, field: step.field, status: step.status };
        case "tag":
        case "untag": {
          const tag = typeof step.tag === "string" ? step.tag.trim() : "";
          if (!tag || tag.length > 60) fail("Every tag step needs a tag (up to 60 characters).");
          return { ...base, tag };
        }
        case "goal":
          return { ...base, goal: GOALS.includes(step.goal) ? step.goal : null };
        case "end":
          return base;
        default:
          return fail("Unknown journey step.");
      }
    });
  const clean = walk(steps, 0).filter(Boolean);
  if (publish && !clean.some((step) => step.type === "email" || step.type === "condition")) fail("Add at least one Send Email step before publishing.");
  return clean;
}

async function clean(body, { publish }) {
  const [segments, templates] = await Promise.all([allSegments(), listTemplates()]);
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) fail("Journey name is required.");
  if (name.length > 160) fail("Journey name must be 160 characters or fewer.");
  if (body.goal && !GOALS.includes(body.goal)) fail("Choose a valid goal.");
  return {
    name,
    description: typeof body.description === "string" ? body.description.trim().slice(0, 500) || null : null,
    trigger_config: JSON.stringify(cleanTrigger(body.triggerConfig, segments)),
    audience: JSON.stringify(cleanAudience(body.audience, segments)),
    reentry: JSON.stringify(cleanReentry(body.reentry)),
    exit_conditions: JSON.stringify(cleanExits(body.exitConditions)),
    goal: body.goal || null,
    steps: JSON.stringify(cleanSteps(body.steps ?? [], { templates, segments, publish })),
  };
}

export async function createJourney(user, body) {
  const item = await clean({ ...DEFAULTS, ...body }, { publish: false });
  const id = createId("jrny");
  await query(`INSERT INTO journeys (id, ${Object.keys(item).join(", ")}, status, created_by, created_by_name) VALUES (?, ${Object.keys(item).map(() => "?").join(", ")}, 'draft', ?, ?)`, [id, ...Object.values(item), user.id, user.name]);
  await recordAudit(user, { action: "campaigns.journey_created", entityType: "journey", entityId: id, summary: `Created the journey "${item.name}"` });
  return getJourney(id);
}

// Live journeys are edited in place; users already in the journey continue from their current step
export async function updateJourney(user, id, body) {
  const journey = await getJourney(id);
  const item = await clean({ ...journey, ...body }, { publish: journey.status === "active" });
  await query(`UPDATE journeys SET ${Object.keys(item).map((key) => `${key} = ?`).join(", ")}, updated_at = NOW() WHERE id = ?`, [...Object.values(item), id]);
  await recordAudit(user, { action: "campaigns.journey_updated", entityType: "journey", entityId: id, summary: `Updated the journey "${item.name}"` });
  return getJourney(id);
}

// action: publish | pause | resume | archive
export async function setJourneyStatus(user, id, action) {
  const journey = await getJourney(id);
  if (action === "publish" || action === "resume") {
    await clean(journey, { publish: true });
    await query("UPDATE journeys SET status = 'active', published_at = COALESCE(published_at, NOW()), updated_at = NOW() WHERE id = ?", [id]);
  } else if (action === "pause") {
    if (journey.status !== "active") throw new ApiError("Only live journeys can be paused.", 409);
    await query("UPDATE journeys SET status = 'paused', updated_at = NOW() WHERE id = ?", [id]);
  } else if (action === "archive") {
    await query("UPDATE journeys SET status = 'archived', updated_at = NOW() WHERE id = ?", [id]);
    await query("UPDATE journey_enrollments SET status = 'exited', finished_at = NOW(), exit_reason = 'Journey archived' WHERE journey_id = ? AND status = 'active'", [id]);
  } else {
    throw new ApiError("Unknown action.");
  }
  const labels = { publish: "Published", resume: "Resumed", pause: "Paused", archive: "Archived" };
  await recordAudit(user, { action: "campaigns.journey_status", entityType: "journey", entityId: id, summary: `${labels[action]} the journey "${journey.name}"` });
  return action === "archive" ? { archived: true } : getJourney(id);
}

export const JOURNEY_DEFAULTS = DEFAULTS;

// "Test Journey": every email step's template, rendered for one user (or sample values),
// queued to a staff address. Marked as a test; nothing is sent to customers.
export async function testJourney(user, id, { email, userId }) {
  if (typeof email !== "string" || !/^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(email.trim())) throw new ApiError("Enter the email address to send the test to.");
  const journey = await getJourney(id);
  const [profile] = userId ? await loadProfiles({ userIds: [userId] }) : [];
  const sample = profile ?? { name: "Jordan Lee", email: email.trim(), company: "Lee Realty", plan: "Pro", trialEnd: null, callsRemaining: 120 };
  const ids = [];
  const walk = (steps) => steps.forEach((step) => (step.type === "email" && step.templateId ? ids.push(step.templateId) : step.type === "condition" && (walk(step.branches?.yes ?? []), walk(step.branches?.no ?? []))));
  walk(journey.steps);
  if (!ids.length) throw new ApiError("Add a Send Email step with a template first.");
  for (const templateId of ids) {
    const template = await getTemplate(templateId);
    const { subject, html } = await renderTemplate(template, sample, { preview: true });
    await queueEmail({ source: "test", sourceId: id, template, userId: null, email: email.trim(), subject: `[Test] ${subject}`, html });
  }
  await recordAudit(user, { action: "campaigns.journey_tested", entityType: "journey", entityId: id, summary: `Sent ${ids.length} test email${ids.length === 1 ? "" : "s"} of "${journey.name}" to ${email.trim()}` });
  return { emails: ids.length };
}
