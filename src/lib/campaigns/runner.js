import { createId, query } from "@/lib/db";
import { loadProfiles } from "@/lib/campaigns/profiles";
import { allSegments } from "@/lib/campaigns/segments";
import { membersOf } from "@/lib/campaigns/rules";
import { getTemplate, listTemplates, renderTemplate } from "@/lib/campaigns/templates";
import { dispatchDueCampaigns } from "@/lib/campaigns/broadcasts";
import { deliverQueued, queueEmail, suppressedSet } from "@/lib/campaigns/outbox";
import { DELAY_UNITS, eventByLabel } from "@/lib/campaigns/catalog";

// ── Campaigns & Journeys job runner ──
// Run every few minutes (Vercel Cron → POST /api/v1/jobs/run, or `npm run jobs` locally).
// One pass:
//   1. update segment membership snapshots (who entered / left each segment)
//   2. send due broadcast campaigns
//   3. send transactional emails for new events (client item 299)
//   4. enroll users into live journeys (triggers + audience + re-entry rules)
//   5. move enrollments along their steps; before every email the user's current state is
//      checked again (exit conditions and the trigger still holding — item 270)
//   6. hand queued emails to the email provider (none until phase 7)

const parse = (value) => (typeof value === "string" ? JSON.parse(value) : value);
const MAX_STEPS_PER_PASS = 50;
const GOAL_EVENTS = { "Trial Converted to Paid": ["trial_converted"], "Plan Upgraded": ["plan_upgraded", "trial_converted"], "Calibration Completed": ["calibration_completed"], "Payment Succeeded": ["payment_succeeded"], "Subscription Started": ["subscription_started", "trial_converted"] };
const GOAL_STATE = {
  "Trial Converted to Paid": (profile) => profile.trialStatus === "Converted",
  "Calibration Completed": (profile) => profile.calibrationStatus === "Completed",
};
const minutesAgo = (date, now) => (now - new Date(date)) / 60000;
const monthKey = (now) => `${now.getFullYear()}-${now.getMonth() + 1}`;

async function withLock(job, fn) {
  // A run that crashed half-way is considered over after 15 minutes
  await query("INSERT IGNORE INTO job_runs (job) VALUES (?)", [job]);
  const claimed = await query(
    "UPDATE job_runs SET last_started_at = NOW() WHERE job = ? AND (last_started_at IS NULL OR last_finished_at >= last_started_at OR last_started_at < DATE_SUB(NOW(), INTERVAL 15 MINUTE))",
    [job]
  );
  if (claimed.affectedRows === 0) return { skipped: "Another run is in progress." };
  try {
    const result = await fn();
    await query("UPDATE job_runs SET last_finished_at = NOW(), last_result = ?, last_error = NULL WHERE job = ?", [JSON.stringify(result), job]);
    return result;
  } catch (error) {
    await query("UPDATE job_runs SET last_finished_at = NOW(), last_error = ? WHERE job = ?", [String(error.message).slice(0, 500), job]);
    throw error;
  }
}

export async function runCampaignJobs() {
  return withLock("campaigns", runOnce);
}

export async function lastRun() {
  const [row] = await query("SELECT last_started_at AS startedAt, last_finished_at AS finishedAt, last_result AS result, last_error AS error FROM job_runs WHERE job = 'campaigns'");
  return row ? { ...row, result: parse(row.result) } : null;
}

async function runOnce() {
  const now = new Date();
  const profiles = await loadProfiles({ now });
  const byId = new Map(profiles.map((profile) => [profile.id, profile]));
  const segments = await allSegments();
  const members = new Map(segments.map((segment) => [segment.id, new Set(membersOf(segment, profiles, now).map((profile) => profile.id))]));

  // 1. Segment snapshots → entered / exited
  const entered = new Map();
  const exited = new Map();
  for (const segment of segments) {
    const before = new Set((await query("SELECT user_id AS userId FROM campaign_segment_snapshot WHERE segment_id = ?", [segment.id])).map((row) => row.userId));
    const nowIn = members.get(segment.id);
    const added = [...nowIn].filter((id) => !before.has(id));
    const removed = [...before].filter((id) => !nowIn.has(id));
    for (const userId of added) await query("INSERT IGNORE INTO campaign_segment_snapshot (segment_id, user_id) VALUES (?, ?)", [segment.id, userId]);
    if (removed.length) await query(`DELETE FROM campaign_segment_snapshot WHERE segment_id = ? AND user_id IN (${removed.map(() => "?").join(", ")})`, [segment.id, ...removed]);
    entered.set(segment.id, added);
    exited.set(segment.id, removed);
  }

  // 2. Broadcasts
  const broadcasts = await dispatchDueCampaigns();

  // New events since the last pass
  const events = (await query("SELECT id, user_id AS userId, event, data, occurred_at AS occurredAt FROM user_events WHERE processed_at IS NULL ORDER BY occurred_at LIMIT 2000")).map((row) => ({ ...row, data: parse(row.data) }));

  // 3. Transactional emails on events
  const templates = await listTemplates();
  let transactional = 0;
  for (const event of events) {
    const template = templates.find((item) => item.emailType === "Transactional" && item.status === "Active" && item.triggerEvent === event.event);
    const profile = byId.get(event.userId);
    if (!template || !profile?.email) continue;
    const { subject, html } = await renderTemplate(template, profile);
    await queueEmail({ source: "transactional", sourceId: event.id, template, userId: profile.id, email: profile.email, subject, html });
    transactional += 1;
  }

  // 4 + 5. Journeys
  const journeys = (await query("SELECT id, name, trigger_config AS triggerConfig, audience, reentry, exit_conditions AS exitConditions, goal, steps, published_at AS publishedAt FROM journeys WHERE status = 'active'")).map((row) => ({
    ...row,
    triggerConfig: parse(row.triggerConfig),
    audience: parse(row.audience),
    reentry: parse(row.reentry),
    exitConditions: parse(row.exitConditions),
    steps: parse(row.steps),
  }));
  const context = { now, profiles, byId, members, entered, exited, events };
  let enrolled = 0;
  for (const journey of journeys) enrolled += await enroll(journey, context);
  const progress = await advance(journeys, context);

  if (events.length) await query(`UPDATE user_events SET processed_at = NOW() WHERE id IN (${events.map(() => "?").join(", ")})`, events.map((event) => event.id));

  // 6. Outbox
  const delivery = await deliverQueued();
  return { at: now.toISOString(), profiles: profiles.length, broadcasts, transactional, journeys: journeys.length, enrolled, ...progress, events: events.length, delivery };
}

// ── Enrollment ──
function triggerCandidates(journey, { now, profiles, entered, exited, events }) {
  const trigger = journey.triggerConfig;
  const out = []; // { userId, key }
  if (trigger.type === "Enters Segment") return (entered.get(trigger.segmentId) ?? []).map((userId) => ({ userId, key: `enter:${trigger.segmentId}:${now.toISOString().slice(0, 16)}` }));
  if (trigger.type === "Exits Segment") return (exited.get(trigger.segmentId) ?? []).map((userId) => ({ userId, key: `exit:${trigger.segmentId}:${now.toISOString().slice(0, 16)}` }));
  if (trigger.type === "Date / Relative Date") {
    if (trigger.mode === "fixed") {
      if (new Date(trigger.at) <= now) for (const profile of profiles) out.push({ userId: profile.id, key: `date:${trigger.at}` });
      return out;
    }
    for (const profile of profiles) {
      const base = profile[trigger.field];
      if (!base) continue;
      const target = new Date(`${base}T00:00:00`);
      target.setDate(target.getDate() + trigger.offsetDays);
      // Due today (or yesterday, in case a run was missed)
      const age = (now - target) / 86400000;
      if (age >= 0 && age < 2) out.push({ userId: profile.id, key: `rel:${trigger.field}:${base}:${trigger.offsetDays}` });
    }
    return out;
  }
  // User Event
  const key = trigger.event;
  const recorded = events.filter((event) => event.event === key);
  for (const event of recorded) out.push({ userId: event.userId, key: `event:${event.id}` });
  for (const profile of profiles) {
    if (key === "trial_ending_soon" && profile.trialStatus === "Active Trial" && profile.trialEnd) {
      const daysLeft = (new Date(`${profile.trialEnd}T23:59:59`) - now) / 86400000;
      if (daysLeft >= 0 && daysLeft <= trigger.amount) out.push({ userId: profile.id, key: `trial_ending:${profile.trialEnd}` });
    }
    if (key === "trial_expired" && profile.trialStatus === "Trial Expired") out.push({ userId: profile.id, key: `trial_expired:${profile.trialEnd}` });
    if (key === "calibration_not_completed" && profile.calibrationStatus !== "Completed" && minutesAgo(profile.signupAt, now) >= trigger.amount * 60) out.push({ userId: profile.id, key: `calibration:${profile.signupDate}` });
    if (key === "user_became_inactive") {
      const since = profile.lastLoginAt ?? profile.signupAt;
      if (minutesAgo(since, now) >= trigger.amount * 1440) out.push({ userId: profile.id, key: `inactive:${since}` });
    }
    if (key === "call_usage_threshold" && profile.callUsagePct >= trigger.usagePct) out.push({ userId: profile.id, key: `usage:${trigger.usagePct}:${monthKey(now)}` });
    if (key === "call_limit_reached" && profile.callsRemaining === 0 && profile.subscriptionStatus !== "Canceled") out.push({ userId: profile.id, key: `limit:${monthKey(now)}` });
  }
  return out;
}

const inAudience = (journey, profile, members) => {
  if (!profile || profile.accountStatus !== "active") return false;
  if (journey.audience.type === "All Eligible Users") return true;
  return members.get(journey.audience.segmentId)?.has(profile.id) ?? false;
};

async function enroll(journey, context) {
  const seen = new Set();
  let count = 0;
  for (const candidate of triggerCandidates(journey, context)) {
    if (seen.has(candidate.userId)) continue;
    seen.add(candidate.userId);
    const profile = context.byId.get(candidate.userId);
    if (!inAudience(journey, profile, context.members)) continue;
    const history = await query("SELECT status, trigger_key AS triggerKey, entered_at AS enteredAt FROM journey_enrollments WHERE journey_id = ? AND user_id = ? ORDER BY entered_at DESC", [journey.id, candidate.userId]);
    if (history.some((row) => row.status === "active")) continue; // already on the journey
    if (history.some((row) => row.triggerKey === candidate.key)) continue; // this occurrence already counted
    if (journey.reentry.mode === "Never" && history.length) continue;
    if (journey.reentry.mode === "After X Days" && history.length && (context.now - new Date(history[0].enteredAt)) / 86400000 < journey.reentry.days) continue;
    await query(
      "INSERT INTO journey_enrollments (id, journey_id, user_id, status, position, trigger_key, context, next_run_at) VALUES (?, ?, ?, 'active', ?, ?, ?, NOW())",
      [createId("enr"), journey.id, candidate.userId, JSON.stringify([0]), candidate.key.slice(0, 160), JSON.stringify({ planId: profile.planId })]
    );
    count += 1;
  }
  return count;
}

// ── Running steps ──
const stepAt = (steps, position) => (position.length === 1 ? steps[position[0]] : steps[position[0]]?.branches?.[position[1]]?.[position[2]]);
function nextPosition(steps, position) {
  if (position.length === 1) return [position[0] + 1];
  const branch = steps[position[0]]?.branches?.[position[1]] ?? [];
  return position[2] + 1 < branch.length ? [position[0], position[1], position[2] + 1] : [position[0] + 1];
}

async function eventsSince(userId, since, keys) {
  if (!keys.length) return [];
  return query(`SELECT event FROM user_events WHERE user_id = ? AND occurred_at >= ? AND event IN (${keys.map(() => "?").join(", ")})`, [userId, since, ...keys]);
}

// Why the user should leave the journey now, or null
async function exitReason(journey, enrollment, profile, members, now) {
  if (!profile) return "User no longer exists";
  if (profile.accountStatus !== "active") return "Account suspended";
  const since = enrollment.enteredAt;
  for (const exit of journey.exitConditions) {
    if (exit.type === "Goal Completed" && journey.goal && (await goalReached(journey.goal, profile, since))) return "Goal completed";
    if (exit.type === "User Exits Segment" && journey.audience.segmentId && !members.get(journey.audience.segmentId)?.has(profile.id)) return "Left the audience segment";
    if (exit.type === "Plan Changed" && (profile.planId !== enrollment.context?.planId || (await eventsSince(profile.id, since, ["plan_upgraded", "plan_downgraded", "trial_converted"])).length)) return "Plan changed";
    if (exit.type === "Subscription Cancelled" && (/cancel/i.test(profile.subscriptionStatus) || (await eventsSince(profile.id, since, ["subscription_cancelled"])).length)) return "Subscription cancelled";
    if (exit.type === "Subscription Upgraded" && (await eventsSince(profile.id, since, ["plan_upgraded", "trial_converted"])).length) return "Subscription upgraded";
    if (exit.type === "Payment Succeeded" && (await eventsSince(profile.id, since, ["payment_succeeded"])).length) return "Payment succeeded";
    if (exit.type === "Custom User Event" && exit.event && (await eventsSince(profile.id, since, [exit.event])).length) return `${exit.event.replace(/_/g, " ")} happened`;
  }
  // The reason the user entered must still be true (e.g. don't send a trial reminder after they upgraded)
  const trigger = journey.triggerConfig;
  if (trigger.type === "Enters Segment" && !members.get(trigger.segmentId)?.has(profile.id)) return "No longer in the trigger segment";
  if (trigger.type === "User Event") {
    if (["trial_ending_soon", "trial_started"].includes(trigger.event) && profile.trialStatus === "Converted") return "Trial converted to paid";
    if (trigger.event === "trial_ending_soon" && profile.trialStatus !== "Active Trial") return "No longer on an active trial";
    if (trigger.event === "calibration_not_completed" && profile.calibrationStatus === "Completed") return "Calibration completed";
    if (trigger.event === "user_became_inactive" && profile.lastLoginAt && new Date(profile.lastLoginAt) > new Date(since)) return "Signed in again";
    if (["payment_failed", "payment_method_update_required"].includes(trigger.event) && profile.paymentStatus === "Paid") return "Payment issue resolved";
    if (trigger.event === "call_limit_reached" && profile.callsRemaining > 0) return "Calls available again";
  }
  return null;
}

async function goalReached(goal, profile, since) {
  if (GOAL_STATE[goal]?.(profile)) return true;
  return (await eventsSince(profile.id, since, GOAL_EVENTS[goal] ?? [])).length > 0;
}

async function conditionHolds(step, enrollment, profile, members, now) {
  const value = step.conditionValue;
  switch (step.condition) {
    case "Event Occurred":
      return (await eventsSince(profile.id, enrollment.enteredAt, [value])).length > 0;
    case "Event Did Not Occur":
      return (await eventsSince(profile.id, enrollment.enteredAt, [value])).length === 0;
    case "User Is In Segment":
      return members.get(value)?.has(profile.id) ?? false;
    case "User Is Not In Segment":
      return !(members.get(value)?.has(profile.id) ?? false);
    case "Plan":
      return profile.plan === value;
    case "Subscription Status":
      return profile.subscriptionStatus === value;
    case "Trial Status":
      return profile.trialStatus === value;
    case "Calibration Status":
      return profile.calibrationStatus === value;
    case "Payment Status":
      return profile.paymentStatus === value;
    case "Call Usage %":
      return profile.callUsagePct >= Number(value);
    case "Last Login":
      return Boolean(profile.lastLoginAt) && minutesAgo(profile.lastLoginAt, now) <= Number(value) * 1440;
    case "Email Opened":
    case "Email Clicked": {
      const column = step.condition === "Email Opened" ? "opened_at" : "clicked_at";
      const [row] = await query(`SELECT COUNT(*) AS count FROM email_deliveries WHERE enrollment_id = ? AND template_id = ? AND ${column} IS NOT NULL`, [enrollment.id, value]);
      return Number(row.count) > 0;
    }
    default:
      return false;
  }
}

async function finish(enrollmentId, status, reason, goal = false) {
  await query(`UPDATE journey_enrollments SET status = ?, finished_at = NOW(), exit_reason = ?, next_run_at = NULL${goal ? ", goal_reached_at = COALESCE(goal_reached_at, NOW())" : ""} WHERE id = ?`, [status, reason, enrollmentId]);
}

async function advance(journeys, { now, byId, members }) {
  const live = new Map(journeys.map((journey) => [journey.id, journey]));
  if (!live.size) return { stepsRun: 0, emails: 0, finished: 0 };
  const due = (await query(
    `SELECT id, journey_id AS journeyId, user_id AS userId, position, context, entered_at AS enteredAt FROM journey_enrollments WHERE status = 'active' AND next_run_at <= NOW() AND journey_id IN (${[...live.keys()].map(() => "?").join(", ")}) ORDER BY next_run_at LIMIT 1000`,
    [...live.keys()]
  )).map((row) => ({ ...row, position: parse(row.position) ?? [0], context: parse(row.context) ?? {} }));
  const suppressed = await suppressedSet(due.map((row) => byId.get(row.userId)?.email).filter(Boolean));
  let stepsRun = 0;
  let emails = 0;
  let finished = 0;

  for (const enrollment of due) {
    const journey = live.get(enrollment.journeyId);
    const profile = byId.get(enrollment.userId);
    let position = enrollment.position;
    let nextRunAt = null;
    let done = null;
    for (let guard = 0; guard < MAX_STEPS_PER_PASS; guard += 1) {
      const step = stepAt(journey.steps, position);
      if (!step) {
        done = { status: "completed", reason: "Reached the end" };
        break;
      }
      // Re-check the user's state before every step that does something
      if (step.type !== "delay") {
        const reason = await exitReason(journey, enrollment, profile, members, now);
        if (reason) {
          done = { status: reason === "Goal completed" ? "completed" : "exited", reason, goal: reason === "Goal completed" };
          break;
        }
      }
      stepsRun += 1;
      if (step.type === "delay") {
        nextRunAt = new Date(now.getTime() + step.amount * DELAY_UNITS[step.unit]);
        position = nextPosition(journey.steps, position);
        break;
      }
      if (step.type === "email") {
        const template = await getTemplate(step.templateId).catch(() => null);
        if (template && template.status === "Active" && profile.email) {
          const { subject, html } = await renderTemplate(template, profile);
          await queueEmail({ source: "journey", sourceId: journey.id, enrollmentId: enrollment.id, template, userId: profile.id, email: profile.email, subject, html, suppressed: suppressed.has(profile.email.toLowerCase()) });
          emails += 1;
        }
      } else if (step.type === "condition") {
        const side = (await conditionHolds(step, enrollment, profile, members, now)) ? "yes" : "no";
        if (step.branches?.[side]?.length) {
          position = [position[0], side, 0];
          continue;
        }
      } else if (step.type === "update") {
        await query("INSERT INTO customer_user_fields (user_id, field, value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)", [profile.id, step.field, step.status]);
      } else if (step.type === "tag") {
        await query("INSERT IGNORE INTO customer_user_tags (user_id, tag) VALUES (?, ?)", [profile.id, step.tag]);
      } else if (step.type === "untag") {
        await query("DELETE FROM customer_user_tags WHERE user_id = ? AND tag = ?", [profile.id, step.tag]);
      } else if (step.type === "goal") {
        const goal = step.goal ?? journey.goal;
        if (goal && (await goalReached(goal, profile, enrollment.enteredAt))) {
          done = { status: "completed", reason: "Goal completed", goal: true };
          break;
        }
      } else if (step.type === "end") {
        done = { status: "completed", reason: "Reached End Journey" };
        break;
      }
      position = nextPosition(journey.steps, position);
    }
    if (done) {
      await finish(enrollment.id, done.status, done.reason, done.goal);
      finished += 1;
    } else {
      // Paused on a wait (or hit the per-pass limit: continue next pass)
      await query("UPDATE journey_enrollments SET position = ?, next_run_at = ?, steps_run = steps_run + 1 WHERE id = ?", [JSON.stringify(position), nextRunAt ?? now, enrollment.id]);
    }
  }
  return { stepsRun, emails, finished };
}

export { eventByLabel };
