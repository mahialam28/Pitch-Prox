// Post-call report (AI-4) built from the Core's handoff (Spec 01 §14). Everything here is derived
// from what was said and what the Core recorded; nothing is invented. Tone of voice isn't measured
// (text + timing only, Spec 07), and no outside statistics are quoted (Spec 06 §6).
// Conversation quality and the business outcome are scored separately (Spec 09 §9).

export const REPORT_VERSION = "call_report_v1.0";

// Conversation score weights (configurable starting values, like the other scoring weights)
export const CONVERSATION_SCORE_WEIGHTS = Object.freeze({ trust: 0.2, objections: 0.25, engagement: 0.15, pacing: 0.15, adherence: 0.15, compliance: 0.1 });

const ACTION_NAMES = { acknowledge: "Acknowledge", clarify: "Clarify", validate: "Validate", mirror: "Mirror", reframe: "Reframe", educate: "Answer", quantify: "Quantify", differentiate: "Differentiate", "de-risk": "De-risk", social_proof: "Social proof", challenge: "Challenge", future_pace: "Future pace", question: "Question", close: "Ask for the meeting" };
const BEHAVIOR_NAMES = { exact: "Used as written", strategic_paraphrase: "Used in own words", useful_deviation: "Own approach (worked)", harmful_deviation: "Own approach (hurt the call)", skipped: "Not used", interrupted: "Interrupted", deviation_pending: "Not used" };
const RESOLUTION_NAMES = { unresolved: "Still open", reactivated: "Came back", clarified: "Clarified", partial: "Partly resolved", resolved: "Resolved", boundary: "Boundary" };
const MEETING_NAMES = { walkthrough: "Walkthrough", tour: "Showing", strategy_meeting: "Meeting", professional_meeting: "Meeting" };
const METRIC_REASON = {
  "openness+": "opened up and shared more", "openness-": "answers got shorter", "reciprocity+": "asked questions back", "reciprocity-": "pulled back from the conversation",
  "framing+": "agreed with the point", "framing-": "pushed back on the point", "objection+": "a concern was settled", "objection-": "the same concern came back",
  "toneSafety+": "positive wording", "toneSafety-": "negative or tense wording", "transparency-": "questioned honesty", "commitment+": "moved toward a next step", "commitment-": "backed away from a next step",
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const avg = (values) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : null);
const pct = (part, total) => (total ? Math.round((part / total) * 100) : 0);

// "Thursday at six" / "tomorrow at 5" / "Saturday at 10am" → { date: "YYYY-MM-DD", time: "HH:MM"|null } relative to the call date.
// Only clear day words are used; anything vague returns null (no guessing).
const NUMBER_WORDS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, noon: 12 };
const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
export function parseMeetingTime(text, callDate) {
  const value = String(text ?? "").toLowerCase();
  const base = new Date(callDate ?? Date.now());
  if (Number.isNaN(base.getTime())) return null;
  let day = null;
  if (/\btomorrow\b/.test(value)) day = new Date(base.getTime() + 86_400_000);
  else if (/\btoday\b|\btonight\b/.test(value)) day = new Date(base);
  else {
    const index = DAYS.findIndex((d) => new RegExp(`\\b${d}\\b`).test(value));
    if (index >= 0) {
      const ahead = (index - base.getDay() + 7) % 7 || 7;
      day = new Date(base.getTime() + ahead * 86_400_000);
    }
  }
  if (!day) return null;
  const match = value.match(/\b(?:at\s+)?(\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|noon)(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.|o'?clock)?\b/);
  let time = null;
  if (match && (match[3] || /\bat\s+/.test(match[0]) || NUMBER_WORDS[match[1]])) {
    let hour = Number.isNaN(Number(match[1])) ? NUMBER_WORDS[match[1]] : Number(match[1]);
    const minutes = match[2] ?? "00";
    const marker = match[3] ?? "";
    if (hour >= 1 && hour <= 12) {
      if (/p/.test(marker) && hour < 12) hour += 12;
      else if (/a/.test(marker) && hour === 12) hour = 0;
      else if (!/[ap]/.test(marker) && hour >= 1 && hour <= 6) hour += 12; // "at six" for a meeting = evening
      time = `${String(hour).padStart(2, "0")}:${minutes}`;
    }
  }
  const date = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
  const phrase = value.match(/\b(today|tonight|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b(\s+(morning|afternoon|evening|night))?(\s+at\s+(\d{1,2}(:\d{2})?|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|noon)(\s*(am|pm|a\.m\.|p\.m\.|o'?clock))?)?/);
  return { date, time, text: phrase ? phrase[0].trim() : null };
}

const turnText = (turns, id) => turns.find((t) => t.turn_id === id)?.text ?? null;

export function buildCallReport(handoff, { callStartedAt = null, mode = "live", prospectName = null } = {}) {
  const state = handoff.final_state ?? {};
  const turns = handoff.transcript ?? [];
  const timeline = handoff.state_timeline ?? [];
  const prompts = (handoff.prompts ?? []).filter((p) => ["displayed", "consumed", "skipped"].includes(p.status));
  const outcomes = handoff.prompt_outcomes ?? [];
  const objections = handoff.objections ?? [];
  const words = (who) => turns.filter((t) => t.speaker === who).reduce((n, t) => n + String(t.text).split(/\s+/).filter(Boolean).length, 0);
  const repWords = words("rep");
  const prospectWords = words("prospect");
  const durationMs = Math.max(0, ...turns.map((t) => t.end_ms ?? 0));
  const prospectSnaps = timeline.filter((s) => turns.find((t) => t.turn_id === s.event_id)?.speaker === "prospect");

  // ── Outcome (business result, separate from quality) ──
  const conversion = handoff.conversion ?? null;
  let meetingTime = null;
  if (conversion) {
    for (const id of [...(conversion.source_turn_ids ?? [])].reverse()) {
      meetingTime = parseMeetingTime(turnText(turns, id), callStartedAt);
      if (meetingTime) break;
    }
  }
  const boundary = state.boundary ?? null;
  const outcome = {
    label: conversion?.status === "confirmed" ? `${MEETING_NAMES[conversion.conversion_type] ?? "Meeting"} confirmed` : conversion ? `${MEETING_NAMES[conversion.conversion_type] ?? "Meeting"} ${conversion.status}` : boundary?.type === "do_not_contact" ? "Asked not to be contacted" : "No meeting set",
    success: conversion?.status === "confirmed",
    conversion: conversion ? { type: conversion.conversion_type, status: conversion.status, confidence: conversion.confirmation_confidence, when: meetingTime, blocking_items: conversion.blocking_items ?? [] } : null,
    boundary: boundary ? { type: boundary.type, at_ms: boundary.at_ms ?? null } : null,
    follow_up_is_not_success: conversion?.status !== "confirmed" && (handoff.follow_up_obligations ?? []).some((i) => i.type === "send_info"),
  };

  // ── Objections ──
  const objectionList = objections
    .filter((o) => o.recurrence_count > 0 || !o.from_history)
    .map((o) => {
      const mentions = turns.filter((t) => t.speaker === "prospect" && (handoff.state_timeline ?? []).some((s) => s.event_id === t.turn_id && s.objection?.id === o.objection_id));
      return {
        id: o.objection_id,
        label: o.label,
        root: o.root_categories ?? [],
        resolution: o.resolution,
        resolution_label: RESOLUTION_NAMES[o.resolution] ?? o.resolution,
        times_raised: o.recurrence_count,
        strategies: (o.strategies_attempted ?? []).map((a) => ACTION_NAMES[a] ?? a),
        first_quote: mentions[0]?.text ?? null,
        first_at_ms: o.first_at_ms ?? mentions[0]?.end_ms ?? null,
      };
    });

  // ── Trust & sentiment ──
  const trustGain = handoff.trust_gain ?? { value: null };
  const trustEvents = (handoff.evidence ?? [])
    .filter((e) => e.metric === "trust" && Math.abs(e.delta) >= 1.5)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 6)
    .sort((a, b) => a.at_ms - b.at_ms)
    .map((e) => ({ at_ms: e.at_ms, delta: e.delta, from: e.prior, to: e.new, quote: turnText(turns, e.source_turn_id), why: String(e.reason ?? "").split(", ").map((r) => METRIC_REASON[r]).filter(Boolean).join("; ") || (e.delta > 0 ? "the conversation warmed up" : "the conversation cooled") }));
  const chart = prospectSnaps.map((s) => ({ at_ms: s.at_ms, trust: Math.round(s.trust), engagement: Math.round(s.engagement), momentum: Math.round(s.momentum), tension: Math.round(s.tension ?? 0), valence: s.valence ?? null, emotion: s.emotion?.[0]?.state ?? null }));
  const emotionsSeen = {};
  for (const s of prospectSnaps) for (const e of s.emotion ?? []) if (e.probability >= 0.3) emotionsSeen[e.state] = (emotionsSeen[e.state] ?? 0) + 1;
  const valences = prospectSnaps.map((s) => s.valence).filter((v) => typeof v === "number");
  const endValence = valences.at(-1) ?? 0;
  const sentiment = {
    overall: endValence > 12 ? "Positive" : endValence < -12 ? "Negative" : "Neutral",
    start: valences[0] ?? null,
    end: valences.at(-1) ?? null,
    emotions_seen: Object.entries(emotionsSeen).sort((a, b) => b[1] - a[1]).map(([state, count]) => ({ state, turns: count })),
    basis: "Read from the words used and the conversation's timing. Tone of voice isn't measured.",
  };

  // ── Prompt use / adherence (strategic intent, not verbatim: Spec 01 §12) ──
  const behaviorCounts = {};
  for (const o of outcomes) behaviorCounts[o.rep_behavior] = (behaviorCounts[o.rep_behavior] ?? 0) + 1;
  const used = (behaviorCounts.exact ?? 0) + (behaviorCounts.strategic_paraphrase ?? 0);
  const modified = behaviorCounts.useful_deviation ?? 0;
  const offScript = (behaviorCounts.harmful_deviation ?? 0) + (behaviorCounts.skipped ?? 0) + (behaviorCounts.interrupted ?? 0) + (behaviorCounts.deviation_pending ?? 0);
  const adherencePct = outcomes.length ? Math.round(avg(outcomes.map((o) => o.adherence_score)) * 100) : null;
  const moments = prompts.map((p) => {
    const outcomeRow = outcomes.find((o) => o.prompt_id === p.prompt_id);
    const repTurn = outcomeRow ? turnText(turns, outcomeRow.rep_turn_ids?.[0]) : null;
    const reaction = outcomeRow ? turnText(turns, outcomeRow.prospect_reaction_turn_ids?.[0]) : null;
    const delta = outcomeRow?.observed_state_delta ?? null;
    const impact = !delta ? null : delta.trust + delta.momentum >= 5 ? "High impact" : delta.trust + delta.momentum >= 0 ? "Effective" : "Lost ground";
    const decision = (handoff.decisions ?? []).find((d) => d.decision_id === p.decision_id);
    return {
      at_ms: turns.find((t) => t.turn_id === (outcomeRow?.rep_turn_ids?.[0] ?? ""))?.start_ms ?? null,
      action: ACTION_NAMES[p.strategic_action] ?? p.strategic_action,
      objective: p.strategic_objective,
      reasons: decision?.reason_codes ?? [],
      prompt: p.text,
      rep_said: repTurn,
      behavior: outcomeRow ? BEHAVIOR_NAMES[outcomeRow.rep_behavior] ?? outcomeRow.rep_behavior : "No reply yet",
      prospect_reaction: reaction,
      impact,
      delta,
    };
  });
  const latencies = prompts.map((p) => p.latency?.decision_to_display_ms).filter((v) => typeof v === "number").sort((a, b) => a - b);

  // ── Scores: conversation quality (not outcome) ──
  const engagementAvg = avg(prospectSnaps.map((s) => s.engagement));
  const pacingValues = timeline.filter((s) => turns.find((t) => t.turn_id === s.event_id)?.speaker === "rep").map((s) => s.pacing).filter((v) => typeof v === "number");
  const pacingAvg = avg(pacingValues);
  const resolutionScore = { resolved: 1, partial: 0.7, clarified: 0.5, reactivated: 0.25, unresolved: 0.2, boundary: 0.6 };
  const objectionScore = objectionList.length ? avg(objectionList.map((o) => resolutionScore[o.resolution] ?? 0.3)) : 0.7;
  const disclosureGiven = (handoff.compliance_events ?? []).some((e) => e.event_type === "disclosure_detected");
  const parts = {
    trust: trustGain.value === null || trustGain.value === undefined ? 0.5 : clamp(0.5 + trustGain.value / 40, 0, 1),
    objections: objectionScore,
    engagement: engagementAvg === null ? 0.5 : engagementAvg / 100,
    pacing: pacingAvg === null ? 0.6 : pacingAvg / 100,
    adherence: adherencePct === null ? 0.6 : adherencePct / 100,
    compliance: disclosureGiven ? 1 : 0.4,
  };
  const conversationScore = Math.round(100 * Object.entries(CONVERSATION_SCORE_WEIGHTS).reduce((sum, [k, w]) => sum + w * parts[k], 0));

  // ── Coaching (strengths and what to work on), only from measured facts ──
  const coaching = [];
  const talkPct = pct(repWords, repWords + prospectWords);
  if (repWords + prospectWords > 60) {
    if (talkPct > 65) coaching.push({ type: "improve", title: "Talk less, ask more", text: `You spoke ${talkPct}% of the words. Short questions give the prospect room to tell you what matters.` });
    else if (talkPct <= 50) coaching.push({ type: "strength", title: "Good listening balance", text: `The prospect did ${100 - talkPct}% of the talking.` });
  }
  if (used && outcomes.length && used / outcomes.length >= 0.7) coaching.push({ type: "strength", title: "Followed the strategy", text: `You used ${used} of ${outcomes.length} suggested lines (as written or in your own words).` });
  if ((behaviorCounts.harmful_deviation ?? 0) > 0) coaching.push({ type: "improve", title: "Avoid pressure lines", text: "At least once your own line made the prospect pull back. Staying with the suggested approach would have kept trust." });
  if ((behaviorCounts.interrupted ?? 0) > 0 || (pacingAvg !== null && pacingAvg < 60)) coaching.push({ type: "improve", title: "Give them space", text: "You started speaking while the prospect was still talking. Let them finish, especially when they're explaining a concern." });
  const repeated = objectionList.filter((o) => o.times_raised >= 3 && o.resolution !== "resolved");
  if (repeated.length) coaching.push({ type: "improve", title: "Find the root of the concern", text: `"${repeated[0].label}" came up ${repeated[0].times_raised} times. Ask what's behind it before answering again.` });
  if (objectionList.some((o) => o.resolution === "resolved")) coaching.push({ type: "strength", title: "Resolved a concern", text: `You moved past ${objectionList.filter((o) => o.resolution === "resolved").map((o) => `"${o.label}"`).join(", ")}.` });
  if (!disclosureGiven) coaching.push({ type: "improve", title: "Read the disclosure", text: "The AI disclosure wasn't confirmed on this call. Read it at the start of every call." });
  if (outcome.success) coaching.push({ type: "strength", title: "Booked the next step", text: `${outcome.label}${meetingTime?.text ? ` (${meetingTime.text})` : ""}.` });

  // ── Action items + follow-up email facts (only what was said) ──
  const obligations = handoff.follow_up_obligations ?? [];
  const actions = [];
  if (outcome.success) actions.push({ type: "confirm_meeting", text: `Confirm the ${outcome.label.toLowerCase().replace(" confirmed", "")}${meetingTime?.text ? ` for ${meetingTime.text}` : ""} in writing today.` });
  for (const item of obligations.filter((i) => i.type === "send_info")) actions.push({ type: "send_info", text: "Send the information they asked for.", quote: item.text });
  for (const item of obligations.filter((i) => i.type === "prior_promise")) actions.push({ type: "prior_promise", text: `From an earlier call: ${item.text}` });
  for (const o of objectionList.filter((x) => ["unresolved", "reactivated", "clarified", "partial"].includes(x.resolution))) actions.push({ type: "prepare_objection", text: `Prepare for "${o.label}" next time (${o.resolution_label.toLowerCase()}).` });
  if (state.decision_structure?.status === "participant_not_present") actions.push({ type: "decision_maker", text: "Include the other decision maker in the next conversation." });
  if (boundary?.type === "do_not_contact") actions.push({ type: "do_not_call", text: "They asked not to be contacted: the number is marked Do not call." });

  const openConcern = objectionList.find((o) => ["unresolved", "reactivated", "clarified", "partial"].includes(o.resolution));
  const infoAsked = obligations.find((i) => i.type === "send_info");
  const followUp = boundary?.type === "do_not_contact"
    ? { suggested_purpose: null, reason: "They asked not to be contacted, so no follow-up email is suggested.", facts: {} }
    : outcome.success
      ? { suggested_purpose: "Appointment Confirmation", reason: "A meeting was confirmed on the call.", facts: { appointmentAt: meetingTime ? (meetingTime.time ? `${meetingTime.date}T${meetingTime.time}` : meetingTime.date) : null, meetingTopic: openConcern ? openConcern.label.toLowerCase() : null } }
      : infoAsked
        ? { suggested_purpose: "Requested Information", reason: "They asked for information.", facts: { requestedInformation: null } }
        : openConcern
          ? { suggested_purpose: "Unresolved Objection Follow-Up", reason: `"${openConcern.label}" is still open.`, facts: { concern: openConcern.label.toLowerCase() } }
          : { suggested_purpose: null, reason: "No follow-up was agreed on the call.", facts: {} };

  // ── Key insights (basic report) ──
  const keyInsights = [{ title: "Outcome", text: outcome.label + (meetingTime?.text ? ` (${meetingTime.text})` : "") + "." }];
  if (objectionList.length) keyInsights.push({ title: "Main concern", text: `${objectionList[0].label}: ${objectionList[0].resolution_label.toLowerCase()}${objectionList[0].times_raised > 1 ? `, raised ${objectionList[0].times_raised} times` : ""}.`, quote: objectionList[0].first_quote });
  const needs = turns.filter((t) => t.speaker === "prospect" && /\b(we need|i need|we want|i want|we have to|need to move|looking for)\b/i.test(t.text)).slice(0, 2);
  for (const t of needs) keyInsights.push({ title: "What they need", text: t.text });
  if (state.decision_structure?.type === "spouse_partner") keyInsights.push({ title: "Decision makers", text: state.decision_structure.status === "participant_present" ? "Another decision maker is involved and will join." : "Another decision maker is involved but wasn't on the call." });
  if (state.sensitive_context) keyInsights.push({ title: "Handle with care", text: { deceased: "A death in the family came up.", divorce: "A divorce came up.", illness: "A health issue came up.", hardship: "Financial hardship came up." }[state.sensitive_context] ?? "A sensitive situation came up." });
  if (trustGain.value !== null && trustGain.value !== undefined) {
    const change = Math.round(trustGain.value);
    keyInsights.push({ title: "Trust", text: `${change === 0 ? `Steady at ${Math.round(trustGain.end)}` : `${Math.round(trustGain.start)} → ${Math.round(trustGain.end)} (${change > 0 ? "+" : ""}${change})`}${trustGain.low_confidence ? ", early reading" : ""}.` });
  }

  const minutes = Math.max(1, Math.round(durationMs / 60000));
  const narrative = [
    `${durationMs < 60_000 ? "A short" : `A ${minutes}-minute`} ${mode === "practice" ? "practice call" : "call"} with ${prospectName || "the prospect"}.`,
    objectionList.length ? `They raised ${objectionList.map((o) => `${o.label.toLowerCase()} (${o.resolution_label.toLowerCase()})`).join(" and ")}.` : "No objections came up.",
    outcome.success ? `${outcome.label}${meetingTime?.text ? ` for ${meetingTime.text}` : ""}.` : boundary?.type === "do_not_contact" ? "They asked not to be contacted again." : "No meeting was set.",
    prompts.length ? `PitchProX suggested ${prompts.length} line${prompts.length === 1 ? "" : "s"}${adherencePct !== null ? `, followed ${adherencePct}% of the time` : ""}.` : "",
  ].filter(Boolean).join(" ");

  return {
    version: REPORT_VERSION,
    generated_at: new Date().toISOString(),
    mode,
    duration_ms: durationMs,
    narrative,
    outcome,
    key_insights: keyInsights,
    action_items: actions,
    follow_up: followUp,
    // Detailed sections (count against the plan's reports for live calls)
    detailed: {
      scores: { conversation: conversationScore, parts: Object.fromEntries(Object.entries(parts).map(([k, v]) => [k, Math.round(v * 100)])), weights: CONVERSATION_SCORE_WEIGHTS, trust: trustGain, engagement_avg: engagementAvg === null ? null : Math.round(engagementAvg), pacing_avg: pacingAvg === null ? null : Math.round(pacingAvg), readiness_end: state.readiness_state?.overall ?? null, momentum_end: state.momentum_state ? { score: Math.round(state.momentum_state.score), trend: state.momentum_state.trend } : null },
      objections: objectionList,
      moments,
      prompt_use: { shown: prompts.length, used_as_is_or_own_words: used, own_approach: modified, off_script: offScript, used_pct: pct(used, outcomes.length), own_approach_pct: pct(modified, outcomes.length), off_script_pct: pct(offScript, outcomes.length), adherence_pct: adherencePct, median_prompt_ms: latencies.length ? latencies[Math.floor(latencies.length / 2)] : null, cancelled: handoff.latency?.cancelled ?? 0 },
      talk_ratio: repWords + prospectWords ? { rep: talkPct, prospect: 100 - talkPct } : null,
      trust_events: trustEvents,
      chart,
      sentiment,
      coaching,
    },
    disclosure: { confirmed: disclosureGiven, at_ms: (handoff.compliance_events ?? []).find((e) => e.event_type === "disclosure_detected")?.at_ms ?? null, events: (handoff.compliance_events ?? []).map((e) => ({ type: e.event_type, at_ms: e.at_ms ?? null })) },
    versions: { ...(handoff.versions ?? {}), report: REPORT_VERSION },
  };
}
