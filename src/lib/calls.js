import { createId, hashToken, query } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { calibrationStatus } from "@/lib/calibration";
import { activePlaybookRuntime } from "@/lib/playbooks";
import { limit } from "@/lib/rate-limit";
import { recordUserEvent } from "@/lib/campaigns/events";
import { signCallToken } from "@/lib/ai/call-token";
import { practiceScript } from "@/lib/ai/practice-scripts";
import { calibrationProfile } from "@/lib/ai/config/calibration-profiles";
import { buildCallReport } from "@/lib/ai/report";
import { userOutcomeOptions } from "@/utils.js/lead-options";

const DISPOSITIONS = userOutcomeOptions.map((option) => option.value);

// ── Calls (AI phase 2) ──
// The app owns accounts, limits and records; the call service (services/call-service.mjs) owns the
// live connection and runs the AI Core. Starting a call here checks calibration and the plan's
// allowance, assembles the Core's context and returns a short-lived token for the call service.
// When the call ends, the call service hands the post-call record back (completeCall).

export const DEFAULT_DISCLOSURE = "Before we begin, this call uses an AI assistant to help me take notes.";
const ACTIVE_CALL_TIMEOUT_MINUTES = 120; // an "active" call older than this was abandoned

export const telephonyConfigured = () => Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_API_KEY && process.env.TWILIO_API_SECRET);
export const callServiceUrl = () => process.env.CALL_SERVICE_PUBLIC_URL || "ws://localhost:3010";
const json = (value) => (value === null || value === undefined ? null : JSON.stringify(value));
const parse = (value, fallback = null) => {
  if (value === null || value === undefined) return fallback;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

// Live calls this billing period vs the plan's allowance (+ applied bonus calls). Practice calls don't count.
export async function callUsage(organizationId) {
  const [row] = await query(
    `SELECT plans.calls_per_month AS included, subscriptions.current_period_start AS periodStart,
       (SELECT COALESCE(SUM(quantity), 0) FROM account_adjustments WHERE account_adjustments.organization_id = subscriptions.organization_id AND account_adjustments.kind = 'calls' AND account_adjustments.status = 'applied' AND account_adjustments.decided_at >= subscriptions.current_period_start) AS bonus,
       (SELECT COUNT(*) FROM calls WHERE calls.organization_id = subscriptions.organization_id AND calls.mode = 'live' AND calls.status = 'completed' AND calls.started_at >= subscriptions.current_period_start) AS used
     FROM subscriptions JOIN plans ON plans.id = subscriptions.plan_id WHERE subscriptions.organization_id = ?`,
    [organizationId]
  );
  if (!row) return { used: 0, total: 0, remaining: 0 };
  const total = Number(row.included ?? 0) + Number(row.bonus ?? 0);
  const used = Number(row.used ?? 0);
  return { used, total, remaining: Math.max(0, total - used) };
}

// Detailed reports unlocked for live calls this billing period vs the plan's reports (+ applied bonus reports)
export async function reportUsage(organizationId) {
  const [row] = await query(
    `SELECT plans.reports_per_month AS included,
       (SELECT COALESCE(SUM(quantity), 0) FROM account_adjustments WHERE account_adjustments.organization_id = subscriptions.organization_id AND account_adjustments.kind = 'reports' AND account_adjustments.status = 'applied' AND account_adjustments.decided_at >= subscriptions.current_period_start) AS bonus,
       (SELECT COUNT(*) FROM calls WHERE calls.organization_id = subscriptions.organization_id AND calls.mode = 'live' AND calls.report_unlocked_at >= subscriptions.current_period_start) AS used
     FROM subscriptions JOIN plans ON plans.id = subscriptions.plan_id WHERE subscriptions.organization_id = ?`,
    [organizationId]
  );
  if (!row) return { used: 0, total: 0, remaining: 0 };
  const total = Number(row.included ?? 0) + Number(row.bonus ?? 0);
  const used = Number(row.used ?? 0);
  return { used, total, remaining: Math.max(0, total - used) };
}

async function loadContact(user, body) {
  const kind = ["lead", "prospect"].includes(body.contactKind) ? body.contactKind : null;
  if (!kind || !body.contactId) {
    return { kind: null, id: null, phoneId: null, name: String(body.leadName ?? "").trim().slice(0, 255) || null, number: String(body.phoneNumber ?? "").trim().slice(0, 64) || null, leadType: String(body.leadType ?? "").trim().slice(0, 60) || null };
  }
  const table = kind === "lead" ? "leads" : "prospects";
  const [row] = await query(`SELECT id, name, phone_number AS phoneNumber, lead_type AS leadType FROM ${table} WHERE id = ? AND organization_id = ?`, [body.contactId, user.organizationId]);
  if (!row) throw new ApiError("That contact wasn't found.", 404);
  let number = row.phoneNumber;
  let phoneId = null;
  if (body.phoneId) {
    const [phone] = await query(`SELECT id, number, status FROM contact_phones WHERE id = ? AND ${kind}_id = ?`, [body.phoneId, row.id]);
    if (!phone) throw new ApiError("That phone number wasn't found.", 404);
    if (["bad", "wrong", "disconnected", "fax", "do_not_call"].includes(phone.status)) throw new ApiError("That number is marked as not callable. Choose another number.", 409);
    number = phone.number;
    phoneId = phone.id;
  }
  return { kind, id: row.id, phoneId, name: row.name, number, leadType: body.leadType || row.leadType || null };
}

// Prospect memory (Spec 05 §4): what the last call with this contact left open
async function priorCallMemory(contact) {
  if (!contact.kind || !contact.id) return null;
  const [last] = await query("SELECT summary, ended_at AS endedAt FROM calls WHERE contact_kind = ? AND contact_id = ? AND status = 'completed' ORDER BY ended_at DESC LIMIT 1", [contact.kind, contact.id]);
  if (!last) return null;
  const summary = parse(last.summary, {});
  return { last_call_at: last.endedAt, open_objections: summary.open_objections ?? [], promises: summary.promises ?? [] };
}

export async function startCall(user, body = {}) {
  const mode = body.mode === "practice" ? "practice" : "live";
  const calibration = await calibrationStatus(user);
  if (calibration.required && !calibration.completed) throw new ApiError("Complete calibration first. It unlocks calling.", 403);

  let script = null;
  if (mode === "live") {
    if (!telephonyConfigured()) throw new ApiError("Phone calls aren't connected yet. Start a practice call to see the AI coaching.", 409);
    const usage = await callUsage(user.organizationId);
    if (usage.remaining <= 0) throw new ApiError("You've used all the calls in your plan this month. Buy more calls or upgrade to keep calling.", 402);
  } else {
    await limit("practice-call-user", user.id);
    if (!body.roleplay) {
      script = practiceScript(body.scriptId);
      if (!script) throw new ApiError("Choose a practice scenario.");
    }
  }

  const contact = mode === "practice" && script ? { kind: null, id: null, phoneId: null, name: script.prospect_name, number: null, leadType: script.lead_type } : await loadContact(user, body);
  const [history, playbook, [org]] = await Promise.all([
    priorCallMemory(contact),
    activePlaybookRuntime(user).catch(() => null),
    query("SELECT name FROM organizations WHERE id = ?", [user.organizationId]),
  ]);
  const profile = calibrationProfile(null); // measured calibration scores arrive in AI-5
  const id = createId("call");
  const context = {
    call_id: id,
    user_id: user.id,
    organization_id: user.organizationId,
    rep_name: user.name,
    company: org?.name ?? null,
    mode,
    lead_type: contact.leadType ? String(contact.leadType).toLowerCase().replace(/[^a-z]+/g, "_").replace(/^_|_$/g, "") : null,
    lead_type_label: contact.leadType,
    lead_side: script?.lead_side ?? (/buyer/i.test(contact.leadType ?? "") ? "buyer" : "seller"),
    prospect_name: contact.name,
    contact: { kind: contact.kind, id: contact.id, phone_id: contact.phoneId, number: contact.number },
    playbook: playbook?.playbook ?? null,
    playbook_name: playbook?.title ?? "PitchProX Standard",
    playbook_version: playbook?.version ?? null,
    calibration_score: null,
    calibration_profile_id: profile.profile_id,
    prospect_history: history,
    disclosure: DEFAULT_DISCLOSURE,
    practice: mode === "practice" ? { script_id: script?.id ?? null, roleplay: !script } : null,
  };
  let token;
  try {
    token = signCallToken({ callId: id, userId: user.id });
  } catch {
    throw new ApiError("Calling isn't configured on this server yet (CALL_SERVICE_SECRET is missing).", 503);
  }
  await query(
    "INSERT INTO calls (id, organization_id, user_id, mode, contact_kind, contact_id, phone_id, contact_name, phone_number, lead_type, playbook_id, playbook_title, playbook_version, calibration_profile_id, practice_script, context, token_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [id, user.organizationId, user.id, mode, contact.kind, contact.id, contact.phoneId, contact.name, contact.number, contact.leadType, playbook?.playbookId ?? null, context.playbook_name, playbook?.version ?? null, profile.profile_id, script?.id ?? (mode === "practice" ? "roleplay" : null), json(context), hashToken(token)]
  );
  return {
    call: { id, mode, contactName: contact.name, phoneNumber: contact.number, leadType: contact.leadType, playbook: context.playbook_name, disclosure: DEFAULT_DISCLOSURE, practiceScript: script ? { id: script.id, title: script.title } : null, hasPriorCalls: Boolean(history) },
    token,
    serviceUrl: callServiceUrl(),
  };
}

// For the call service only (authenticated with CALL_SERVICE_SECRET)
export async function callContextForService(callId) {
  const [row] = await query("SELECT id, status, context, started_at AS startedAt FROM calls WHERE id = ?", [callId]);
  if (!row) throw new ApiError("Call not found.", 404);
  if (row.status !== "active") throw new ApiError("This call has already ended.", 409);
  return { ...parse(row.context, {}), started_at: row.startedAt };
}

const average = (values) => (values.length ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) : null);

// The numbers lists, usage and the next call need (the full record stays in `handoff`)
export function summarize(handoff) {
  const state = handoff.final_state ?? {};
  const prospectTurns = (handoff.transcript ?? []).filter((t) => t.speaker === "prospect").length;
  const objections = (handoff.objections ?? []).map((o) => ({ objection_id: o.objection_id, label: o.label, root_categories: o.root_categories, resolution: o.resolution, recurrence_count: o.recurrence_count, strategies_attempted: o.strategies_attempted }));
  return {
    prospect_turns: prospectTurns,
    turns: (handoff.transcript ?? []).length,
    duration_ms: Math.max(0, ...(handoff.transcript ?? []).map((t) => t.end_ms ?? 0)),
    prompts_shown: (handoff.prompts ?? []).filter((p) => ["displayed", "consumed", "skipped"].includes(p.status)).length,
    prompts_cancelled: handoff.latency?.cancelled ?? 0,
    adherence_pct: average((handoff.prompt_outcomes ?? []).map((o) => o.adherence_score)),
    trust: state.trust_state ? Math.round(state.trust_state.score) : null,
    trust_gain: handoff.trust_gain ?? null,
    engagement: state.engagement_state ? Math.round(state.engagement_state.score) : null,
    momentum: state.momentum_state ? Math.round(state.momentum_state.score) : null,
    readiness: state.readiness_state?.overall ?? null,
    pacing: state.pacing_state && state.counters?.rep_turns ? Math.round(state.pacing_state.rep_alignment_score) : null,
    talk_ratio: (() => { const words = (who) => (handoff.transcript ?? []).filter((t) => t.speaker === who).reduce((n, t) => n + String(t.text).split(/\s+/).filter(Boolean).length, 0); const rep = words("rep"); const total = rep + words("prospect"); return total ? { rep: Math.round((rep / total) * 100), prospect: 100 - Math.round((rep / total) * 100) } : null; })(),
    stage: state.conversation_stage?.value ?? null,
    conversion: handoff.conversion ? { type: handoff.conversion.conversion_type, status: handoff.conversion.status } : null,
    objections,
    open_objections: objections.filter((o) => ["unresolved", "reactivated", "clarified", "partial"].includes(o.resolution)),
    promises: (handoff.follow_up_obligations ?? []).filter((i) => i.type === "send_info" || i.type === "prior_promise").map((i) => ({ text: i.text })),
    boundary: state.boundary ?? null,
    compliance_events: (handoff.compliance_events ?? []).map((e) => e.event_type),
    median_prompt_ms: handoff.latency?.median_decision_to_display_ms ?? null,
    versions: handoff.versions ?? null,
  };
}

export async function completeCall(callId, handoff, { endedReason = "hangup" } = {}) {
  const [row] = await query("SELECT id, organization_id AS organizationId, user_id AS userId, mode, status, phone_id AS phoneId, contact_name AS contactName, started_at AS startedAt FROM calls WHERE id = ?", [callId]);
  if (!row) throw new ApiError("Call not found.", 404);
  if (row.status !== "active") return { alreadyCompleted: true }; // idempotent
  const summary = summarize(handoff ?? {});
  const status = summary.prospect_turns > 0 ? "completed" : "abandoned";
  let report = null;
  try {
    report = status === "completed" ? buildCallReport(handoff, { callStartedAt: row.startedAt, mode: row.mode, prospectName: row.contactName }) : null;
  } catch (error) {
    console.error("call report failed", callId, error); // the call is still saved; the report can be rebuilt
  }
  if (report) {
    summary.conversation_score = report.detailed.scores.conversation;
    summary.outcome_label = report.outcome.label;
    summary.narrative = report.narrative;
  }
  // Default disposition from what happened (the user can change it)
  const disposition = status !== "completed" ? null : summary.conversion?.status === "confirmed" ? "Appointment Set" : summary.boundary?.type === "do_not_contact" ? "Do Not Contact" : (handoff?.follow_up_obligations ?? []).some((i) => i.type === "send_info") ? "Information Requested" : summary.open_objections.length || summary.conversion ? "Follow-Up Required" : null;
  const seconds = Math.max(1, Math.round((Date.now() - new Date(row.startedAt).getTime()) / 1000));
  await query("UPDATE calls SET status = ?, ended_at = NOW(), duration_seconds = ?, ended_reason = ?, summary = ?, handoff = ?, report = ?, disposition = ?, token_hash = NULL WHERE id = ? AND status = 'active'", [status, seconds, String(endedReason).slice(0, 40), json(summary), json(handoff), json(report), disposition, callId]);
  const turns = (handoff?.transcript ?? []).slice(0, 2000);
  if (turns.length) {
    await query(`INSERT INTO call_turns (call_id, seq, speaker, text, start_ms, end_ms, intent) VALUES ${turns.map(() => "(?, ?, ?, ?, ?, ?, ?)").join(", ")}`, turns.flatMap((t, i) => [callId, i + 1, t.speaker, String(t.text).slice(0, 5000), Math.max(0, Math.round(t.start_ms ?? 0)), Math.max(0, Math.round(t.end_ms ?? 0)), t.intent ?? null]));
  }
  if (row.mode === "live" && status === "completed") {
    if (row.phoneId) await query("UPDATE contact_phones SET last_called_at = NOW() WHERE id = ?", [row.phoneId]);
    // "Don't call me again" on a live call: that number becomes Do not call (they can still be reached on others only if they agree)
    if (row.phoneId && summary.boundary?.type === "do_not_contact") await query("UPDATE contact_phones SET status = 'do_not_call', status_changed_at = NOW(), status_changed_by = ? WHERE id = ?", [row.userId, row.phoneId]);
    const [{ total }] = await query("SELECT COUNT(*) AS total FROM calls WHERE user_id = ? AND mode = 'live' AND status = 'completed'", [row.userId]);
    if (Number(total) === 1) await recordUserEvent(row.userId, "first_call_completed", { callId });
  }
  return { status, summary };
}

// Calls left "active" (browser closed, service restarted) are closed as abandoned
export async function closeStaleCalls() {
  await query(`UPDATE calls SET status = 'abandoned', ended_at = NOW(), ended_reason = 'timeout', token_hash = NULL WHERE status = 'active' AND started_at < DATE_SUB(NOW(), INTERVAL ${ACTIVE_CALL_TIMEOUT_MINUTES} MINUTE)`);
}

const presentCall = (row) => ({
  id: row.id,
  mode: row.mode,
  status: row.status,
  contactName: row.contactName,
  contactKind: row.contactKind ?? null,
  contactId: row.contactId ?? null,
  phoneNumber: row.phoneNumber,
  leadType: row.leadType,
  playbook: row.playbookTitle,
  startedAt: row.startedAt,
  endedAt: row.endedAt,
  durationSeconds: row.durationSeconds,
  disposition: row.disposition ?? null,
  summary: parse(row.summary, null),
});

const CALL_COLUMNS = "id, mode, status, contact_kind AS contactKind, contact_id AS contactId, contact_name AS contactName, phone_number AS phoneNumber, lead_type AS leadType, playbook_title AS playbookTitle, started_at AS startedAt, ended_at AS endedAt, duration_seconds AS durationSeconds, disposition, summary";

export async function listCalls(user, { mode = null, limit: max = 50 } = {}) {
  await closeStaleCalls();
  const filters = ["user_id = ?", "status <> 'active'"];
  const values = [user.id];
  if (mode === "live" || mode === "practice") {
    filters.push("mode = ?");
    values.push(mode);
  }
  const rows = await query(`SELECT ${CALL_COLUMNS} FROM calls WHERE ${filters.join(" AND ")} ORDER BY started_at DESC LIMIT ${Math.min(200, Math.max(1, Number(max) || 50))}`, values);
  return rows.map(presentCall);
}

export async function getCall(user, callId) {
  const [row] = await query(`SELECT ${CALL_COLUMNS}, user_id AS userId FROM calls WHERE id = ? AND organization_id = ?`, [callId, user.organizationId]);
  if (!row || (row.userId !== user.id && user.role !== "customer_admin")) throw new ApiError("Call not found.", 404);
  const turns = await query("SELECT seq, speaker, text, start_ms AS startMs, end_ms AS endMs, intent FROM call_turns WHERE call_id = ? ORDER BY seq", [callId]);
  return { ...presentCall(row), transcript: turns };
}

// The report for one call. Live calls show the basic report (outcome, insights, transcript, action
// items, disclosure) always; the detailed analysis is unlocked per call and uses one of the plan's
// reports. Practice calls are always fully open.
export async function getCallReport(user, callId) {
  const call = await getCall(user, callId);
  const [row] = await query("SELECT report, report_unlocked_at AS unlockedAt, mode FROM calls WHERE id = ?", [callId]);
  const report = parse(row?.report, null);
  const unlocked = row?.mode === "practice" || Boolean(row?.unlockedAt);
  return {
    call,
    report: report ? (unlocked ? report : { ...report, detailed: null }) : null,
    locked: Boolean(report) && !unlocked,
    usage: await reportUsage(user.organizationId),
  };
}

export async function unlockCallReport(user, callId) {
  const call = await getCall(user, callId);
  if (call.mode === "practice") return getCallReport(user, callId);
  const [row] = await query("SELECT report IS NOT NULL AS hasReport, report_unlocked_at AS unlockedAt FROM calls WHERE id = ?", [callId]);
  if (!Number(row?.hasReport)) throw new ApiError("This call has no report.", 404);
  if (!row.unlockedAt) {
    const usage = await reportUsage(user.organizationId);
    if (usage.remaining <= 0) throw new ApiError("You've used all the detailed reports in your plan this month. Buy more reports to unlock this one.", 402);
    await query("UPDATE calls SET report_unlocked_at = NOW() WHERE id = ? AND report_unlocked_at IS NULL", [callId]);
  }
  return getCallReport(user, callId);
}

export async function setCallDisposition(user, callId, disposition) {
  await getCall(user, callId); // access check
  if (disposition !== null && !DISPOSITIONS.includes(disposition)) throw new ApiError("Choose a valid outcome.");
  await query("UPDATE calls SET disposition = ? WHERE id = ?", [disposition, callId]);
  return getCall(user, callId);
}
