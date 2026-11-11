// The authoritative ConversationState for one call (Spec 01 §4, Spec 11 §4.2 and §5).
// Every accepted change makes a new state with state_version + 1; the previous state is never
// edited. Score movements keep an explainability record (Spec 10 §7) so a report can say WHY
// trust or momentum moved.

import { SCORING, SCORING_VERSION } from "../config/scoring.js";
import { scoreTrust, scoreEngagement, scorePacing, scoreEmotion, scoreTension, scoreMomentum, scoreReadiness } from "./scoring.js";
import { round } from "./text.js";

export const SENSITIVE_LEAD_TYPES = { deceased: "deceased", probate: "deceased", estate: "deceased", divorce: "divorce", pre_foreclosure: "hardship", foreclosure: "hardship" };

const MEANING = {
  "financial:commission": "Commission/value concern: is the fee worth what they get?",
  "financial:price": "Cost concern: can they justify or afford it?",
  "financial:value": "Unsure the result is worth the money",
  "risk:past_failure": "Fear of repeating a failed past experience",
  "risk:uncertainty": "Uncertainty about the outcome; wants less risk",
  "risk:trust": "Doubts the rep's credibility",
  "logistics:timing": "Timing doesn't feel right yet",
  "logistics:situation": "Practical blocker (access, tenants, repairs)",
  "logistics:decision_maker_absent": "The decision maker isn't on the call",
  "relationship:existing": "Loyalty to someone they already work with",
  "relationship:diy": "Believes they can do it alone and save the fee",
  "stall:send_info": "Deflecting a next step by asking for information",
};

export function createConversationState(context = {}) {
  const leadSensitive = SENSITIVE_LEAD_TYPES[String(context.lead_type ?? "").toLowerCase()] ?? null;
  const objections = {};
  const unresolved = [];
  // Prospect memory (Spec 05 §4): a second call starts with what is still open
  for (const item of context.prospect_history?.open_objections ?? []) {
    objections[item.objection_id] = { objection_id: item.objection_id, root_categories: item.root_categories ?? [item.objection_id.split(":")[0]], label: item.label ?? item.objection_id, depth: "underlying", recurrence_count: 0, resolution: item.resolution ?? "unresolved", strategies_attempted: item.strategies_attempted ?? [], from_history: true, first_at_ms: null, last_at_ms: null, last_turn: null };
  }
  for (const promise of context.prospect_history?.promises ?? []) unresolved.push({ type: "prior_promise", text: promise.text ?? String(promise), from_history: true });

  return {
    call_id: context.call_id ?? null,
    state_version: 0,
    scoring_version: SCORING_VERSION,
    updated_at: null,
    call_context: {
      call_id: context.call_id ?? null,
      user_id: context.user_id ?? null,
      prospect_id: context.prospect_id ?? null,
      lead_type: context.lead_type ?? null,
      active_playbook: context.playbook?.identity?.name ?? context.playbook_name ?? "PitchProX Standard",
      playbook_version: context.playbook?.publication?.version ?? null,
      calibration_profile_id: context.calibration_profile?.profile_id ?? null,
      started_at: context.started_at ?? null,
      has_prior_calls: Boolean(context.prospect_history),
    },
    speaker_state: "silence",
    conversation_stage: { value: context.prospect_history ? "engagement" : "opening", confidence: 0.6 },
    primary_intent: { value: null, confidence: 0 },
    underlying_meaning: { hypothesis: null, confidence: 0 },
    objection_state: null,
    objections,
    trust_state: { score: SCORING.trust.start, trend: "stable", confidence: 0.2, history: [SCORING.trust.start], start: null, start_confidence: null },
    emotion_state: { valence: 0, arousal: 40, control_agency: 50, social_safety: 50, top_states: [], probabilities: {}, confidence: 0, basis: "text+timing" },
    tension_state: { score: 30, root: null },
    pacing_state: { prospect_wpm: null, rep_wpm: null, prospect_wpm_delta_pct: null, rep_alignment_score: 80, conversation_tempo: "steady", confidence: 0.3 },
    engagement_state: { score: SCORING.engagement.start, trend: "stable", confidence: 0.2, history: [SCORING.engagement.start] },
    momentum_state: { score: SCORING.momentum.start, trend: "stable", confidence: 0.2 },
    readiness_state: { emotional: 50, logical: 30, logistical: 45, decision_confidence: 70, overall: 40, blocker: null, level: "exploratory" },
    identity_state: { role: context.prospect_role ?? null },
    decision_structure: { type: "unknown", status: "unknown" },
    strategy_history: [],
    prompt_state: { last_prompt_id: null, current_prompt_id: null, shown_at_ms: null, status: null },
    micro_commitments: [],
    unresolved_items: unresolved,
    conversion: null,
    compliance_state: { ai_processing_allowed: true, disclosure_given: false, write_protected: true },
    boundary: null,
    sensitive_context: leadSensitive,
    recent_topics: [],
    running: { problem_clarity: 0, value_recognition: 0, future_language: 0, meeting_time: false },
    counters: { prospect_turns: 0, rep_turns: 0, prospect_open_turns: 0, active_objections: Object.values(objections).filter((o) => o.resolution !== "resolved").length, questions_answered: 0, pending_questions: 0 },
    learning_candidates: [],
    evidence: [],
    last_turn: null,
  };
}

const clone = (value) => structuredClone(value);
const POSITIVE_MOVE = (interp) => interp.value_recognition > 0 || interp.future_language > 0.3 || (interp.agreement >= 0.7 && interp.word_count > 3) || interp.question_type === "logistics" || interp.meeting?.has_time;

function depthFor(record) {
  if (record.resolution === "partial") return "partial_resolution";
  if (record.recurrence_count <= 1) return record.strategies_attempted.length ? "underlying" : "surface";
  if (record.recurrence_count === 2) return "first_pushback";
  return "repeated_resistance";
}

// Objection state machine (Spec 09 §4–5): unresolved → clarified / partial → resolved; reactivated; boundary
function updateObjections(state, interp, atMs, turnId) {
  const window = SCORING.objection.recurrenceWindowTurns;
  let event = null;
  let record = null;
  // "How did you get my number?" deserves an honest answer; it isn't a request to stop (do-not-contact is)
  if (interp.boundary && interp.boundary.type !== "privacy") {
    state.boundary = { type: interp.boundary.type, at_ms: atMs, turn_id: turnId };
    record = state.objection_state ? state.objections[state.objection_state.objection_id] : null;
    if (record) record.resolution = "boundary";
    return { event: "boundary", record };
  }
  if (interp.objection) {
    const id = interp.objection.id;
    record = state.objections[id];
    if (record && (record.from_history || state.counters.prospect_turns - (record.last_turn ?? 0) <= window)) {
      record.recurrence_count += 1;
      event = record.resolution === "resolved" ? "reactivated" : record.from_history && record.recurrence_count === 1 ? "repeat_from_history" : "repeat";
      record.resolution = event === "reactivated" ? "reactivated" : "unresolved";
      if (event === "repeat_from_history") event = "repeat";
    } else {
      record = { objection_id: id, root_categories: interp.objection.categories, label: interp.objection.label, recurrence_count: 1, resolution: "unresolved", strategies_attempted: [], first_at_ms: atMs };
      state.objections[id] = record;
      event = "new";
    }
    record.last_at_ms = atMs;
    record.last_turn = state.counters.prospect_turns;
    record.from_history = false;
    record.depth = depthFor(record);
    record.categories_known = record.root_categories.length > 0;
    for (const category of record.root_categories) if (!state.recent_topics.includes(category)) state.recent_topics.push(category);
    state.recent_topics = state.recent_topics.slice(-4);
    return { event, record };
  }

  // No objection in this turn: does the behavior show the active one moving? (polite "okay" alone isn't enough)
  const active = state.objection_state ? state.objections[state.objection_state.objection_id] : null;
  if (active && ["unresolved", "reactivated", "clarified", "partial"].includes(active.resolution) && active.strategies_attempted.length) {
    if (POSITIVE_MOVE(interp)) {
      active.resolution = active.resolution === "partial" || interp.meeting?.has_time || interp.question_type === "logistics" ? "resolved" : "partial";
      active.depth = depthFor(active);
      return { event: active.resolution === "resolved" ? "resolved" : "partial", record: active };
    }
    if (interp.disclosure > 0.3 || interp.specificity > 0.4) {
      if (active.resolution === "unresolved") active.resolution = "clarified";
      return { event: "clarified", record: active };
    }
  }
  return { event: null, record: null };
}

function updateConversion(state, interp, speaker, atMs, turnId) {
  const meeting = interp.meeting;
  if (!meeting) return null;
  const current = state.conversion;
  if (speaker === "rep") {
    if (meeting.type && (!current || current.status === "declined")) {
      state.conversion = { conversion_type: meeting.type, status: "offered", start_at: null, has_time: meeting.has_time, participants: [], confirmation_confidence: 0.3, source_turn_ids: [turnId], blocking_items: [], followup_is_conversion: false };
      return "offered";
    }
    if (current && meeting.has_time) current.has_time = true;
    return null;
  }
  if (meeting.decline && current) {
    current.status = "declined";
    current.source_turn_ids.push(turnId);
    return "declined";
  }
  const type = meeting.type ?? current?.conversion_type ?? null;
  const timeKnown = meeting.has_time || current?.has_time;
  if (!current && type) {
    state.conversion = { conversion_type: type, status: meeting.explicit_accept && timeKnown ? "confirmed" : "tentative", start_at: null, has_time: Boolean(timeKnown), participants: [], confirmation_confidence: meeting.explicit_accept && timeKnown ? 0.75 : 0.45, source_turn_ids: [turnId], blocking_items: [], followup_is_conversion: false };
    return state.conversion.status;
  }
  if (!current) return null;
  current.has_time = Boolean(timeKnown);
  current.source_turn_ids.push(turnId);
  if (type) current.conversion_type = type;
  // Confirmed only with a type, a time and an explicit yes (Spec 09 §8, Spec 11 scenario 9)
  if (current.conversion_type && timeKnown && meeting.explicit_accept) {
    current.status = "confirmed";
    current.confirmation_confidence = round(Math.min(0.96, 0.7 + (meeting.has_time ? 0.15 : 0.05) + (state.decision_structure.status === "participant_not_present" ? -0.2 : 0.1)), 2);
    current.blocking_items = state.decision_structure.status === "participant_not_present" ? ["decision_maker_absent"] : [];
    return "confirmed";
  }
  if (meeting.soft_accept || meeting.has_time) {
    if (current.status === "offered") current.status = "tentative";
    current.confirmation_confidence = Math.max(current.confirmation_confidence, 0.5);
    return current.status;
  }
  return null;
}

function stageFor(state, interp, objectionEvent) {
  if (state.boundary) return "closing";
  if (state.conversion?.status === "confirmed") return "closing";
  if (state.conversion && ["offered", "tentative"].includes(state.conversion.status)) return "commitment";
  if (objectionEvent?.event === "resolved") return "resolution";
  if (state.objection_state && ["unresolved", "reactivated", "clarified", "partial"].includes(state.objection_state.resolution)) return "objection";
  if (interp.stall === "send_info") return "follow-up";
  if (state.counters.prospect_turns <= 2 && !state.call_context.has_prior_calls) return "opening";
  if (interp.value_recognition) return "value";
  if (interp.problem_clarity || interp.question_type) return "discovery";
  return state.conversation_stage.value === "opening" ? "engagement" : state.conversation_stage.value;
}

function pushEvidence(state, metric, prior, next, atMs, turnId, reason, confidence) {
  if (prior === null || prior === undefined || next === null || next === undefined) return;
  const delta = round(next - prior, 1);
  if (Math.abs(delta) < 1.5) return; // small moves are noise; larger ones explain the score later (Spec 10 §7)
  state.evidence.push({ metric, prior: round(prior, 1), new: round(next, 1), delta, at_ms: atMs, source_turn_id: turnId, reason, confidence, scoring_version: SCORING_VERSION });
}

// Apply one finalized utterance. Returns the new state and what materially changed.
export function applyTurn(previous, { event, interp, features, profile, rates }) {
  const state = clone(previous);
  const speaker = event.speaker;
  const at = event.utterance_end_ms;
  const turnId = event.event_id;
  state.state_version += 1;
  state.updated_at = new Date().toISOString();
  state.speaker_state = speaker === "prospect" ? "prospect_spoke" : speaker === "rep" ? "rep_spoke" : "unknown_spoke";
  const prospectWasDisclosing = previous.last_turn?.speaker === "prospect" && (previous.last_turn.disclosure > 0.3 || ["objection", "concern"].includes(previous.last_turn.intent));

  if (speaker === "rep") {
    state.counters.rep_turns += 1;
    if (previous.counters.pending_questions > 0 && interp.word_count > 3) {
      state.counters.questions_answered += 1;
      state.counters.pending_questions = 0;
    }
    updateConversion(state, interp, "rep", at, turnId);
    state.pacing_state = { ...state.pacing_state, ...scorePacing(previous, { interp, features }, { prospectWpm: rates.prospect, repWpm: rates.rep, profile, prospectWasDisclosing }) };
    state.last_turn = { speaker, text: event.utterance_text, at_ms: at, event_id: turnId, intent: interp.intent, interrupted: features.interrupted, pressure: interp.pressure };
    if (state.decision_structure.status === "unknown" && interp.decision_structure) state.decision_structure = interp.decision_structure;
    return { state, material: [], objection: null };
  }
  if (speaker !== "prospect") {
    state.last_turn = { speaker, text: event.utterance_text, at_ms: at, event_id: turnId, intent: interp.intent };
    return { state, material: [], objection: null };
  }

  state.counters.prospect_turns += 1;
  if (interp.word_count > 6) state.counters.prospect_open_turns += 1;
  if (interp.question_type && interp.question_type !== "hostile") state.counters.pending_questions += 1;
  state.primary_intent = { value: interp.intent, confidence: interp.confidence };
  if (interp.decision_structure) state.decision_structure = { ...state.decision_structure, ...interp.decision_structure };
  const absentDm = state.objections["logistics:decision_maker_absent"];
  if (absentDm && state.decision_structure.status === "participant_present" && absentDm.resolution !== "resolved") {
    absentDm.resolution = "resolved";
    if (state.objection_state?.objection_id === absentDm.objection_id) state.objection_state = { ...absentDm };
  }
  if (interp.sensitive_context && !state.sensitive_context) state.sensitive_context = interp.sensitive_context;
  if (interp.learning_candidate) state.learning_candidates.push({ text: event.utterance_text, at_ms: at, turn_id: turnId, status: "candidate", context: { stage: previous.conversation_stage.value, lead_type: state.call_context.lead_type } });

  const objection = updateObjections(state, interp, at, turnId);
  if (objection.record && objection.event !== "boundary") {
    state.objection_state = { ...objection.record };
    state.underlying_meaning = { hypothesis: MEANING[objection.record.objection_id] ?? objection.record.label, confidence: objection.record.root_categories.length ? interp.confidence : 0.35 };
  } else if (objection.event === "boundary") {
    state.objection_state = state.objection_state ? { ...state.objection_state, resolution: "boundary" } : { objection_id: `boundary:${interp.boundary.type}`, root_categories: [], label: "Boundary", depth: "boundary", recurrence_count: 1, resolution: "boundary", strategies_attempted: [] };
    state.underlying_meaning = { hypothesis: "Boundary: not an objection to overcome", confidence: 0.8 };
  }
  state.counters.active_objections = Object.values(state.objections).filter((o) => ["unresolved", "reactivated", "clarified", "partial"].includes(o.resolution)).length;

  const conversionChange = updateConversion(state, interp, "prospect", at, turnId);
  if (interp.meeting?.has_time) state.running.meeting_time = true;
  state.running.problem_clarity = Math.max(interp.problem_clarity, previous.running.problem_clarity * 0.9);
  state.running.value_recognition = Math.max(interp.value_recognition, previous.running.value_recognition * 0.9);
  state.running.future_language = Math.max(interp.future_language, previous.running.future_language * 0.85);
  if (interp.stall === "send_info") state.unresolved_items.push({ type: "send_info", text: event.utterance_text, at_ms: at });
  if (interp.agreement >= 0.7 || interp.meeting?.explicit_accept) state.micro_commitments.push({ type: interp.meeting?.explicit_accept ? "meeting_accepted" : "agreement", text: event.utterance_text, at_ms: at, turn_id: turnId });
  if (interp.disclosure > 0.4) state.micro_commitments.push({ type: "information_shared", text: event.utterance_text, at_ms: at, turn_id: turnId });

  const turn = { interp, features, objection };
  const trust = scoreTrust(state, turn);
  pushEvidence(state, "trust", previous.trust_state.score, trust.score, at, turnId, trust.reasons.join(", ") || interp.intent, trust.confidence);
  state.trust_state = { ...state.trust_state, ...trust };
  if (state.trust_state.start === null && state.counters.prospect_turns >= SCORING.trust.stableAfterTurns) {
    state.trust_state.start = trust.score;
    state.trust_state.start_confidence = trust.confidence;
  }
  const engagement = scoreEngagement(state, turn);
  pushEvidence(state, "engagement", previous.engagement_state.score, engagement.score, at, turnId, interp.intent, engagement.confidence);
  state.engagement_state = engagement;
  state.emotion_state = scoreEmotion(state, turn);
  state.tension_state = scoreTension(state, turn);
  state.pacing_state = { ...state.pacing_state, prospect_wpm: rates.prospect, prospect_wpm_delta_pct: features.speech_rate_delta_pct, conversation_tempo: features.speech_rate_delta_pct === null ? state.pacing_state.conversation_tempo : features.speech_rate_delta_pct <= -15 ? "slowing" : features.speech_rate_delta_pct >= 15 ? "speeding_up" : "steady" };
  const momentum = scoreMomentum(state, turn);
  pushEvidence(state, "momentum", previous.momentum_state.score, momentum.score, at, turnId, objection.event ?? interp.intent, momentum.confidence);
  state.momentum_state = momentum;
  const readiness = scoreReadiness(state);
  pushEvidence(state, "readiness", previous.readiness_state.overall, readiness.overall, at, turnId, readiness.blocker ?? interp.intent, 0.6);
  state.readiness_state = readiness;
  state.conversation_stage = { value: stageFor(state, interp, objection), confidence: interp.confidence };
  state.last_turn = { speaker, text: event.utterance_text, at_ms: at, event_id: turnId, intent: interp.intent, disclosure: interp.disclosure, sensitive: Boolean(interp.sensitive_context) };

  // What changed in a way that makes a pending prompt stale (Spec 11 §10 semantic invalidation)
  const material = [];
  if (previous.primary_intent.value !== state.primary_intent.value) material.push("INTENT_CHANGED");
  if (objection.event && objection.event !== "clarified") material.push(`OBJECTION_${objection.event.toUpperCase()}`);
  if (state.boundary && !previous.boundary) material.push("BOUNDARY");
  if (interp.boundary?.type === "privacy") material.push("PRIVACY_QUESTION");
  if (previous.conversation_stage.value !== state.conversation_stage.value) material.push("STAGE_CHANGED");
  if (previous.decision_structure.status !== state.decision_structure.status) material.push("DECISION_STRUCTURE_CHANGED");
  if (conversionChange) material.push(`CONVERSION_${conversionChange.toUpperCase()}`);
  if (interp.question_type) material.push("PROSPECT_QUESTION");
  return { state, material, objection };
}

// Record the strategy actually put in front of the rep (strategies_attempted drives "don't repeat")
export function recordStrategy(previous, decision, atMs) {
  const state = clone(previous);
  state.state_version += 1;
  state.strategy_history.push({ decision_id: decision.decision_id, action: decision.strategic_action, objective: decision.strategic_objective, objection_id: decision.objection_id ?? null, at_ms: atMs, rep_turns: state.counters.rep_turns, result: null });
  if (decision.objection_id && state.objections[decision.objection_id]) {
    const record = state.objections[decision.objection_id];
    record.strategies_attempted.push(decision.strategic_action); // repeats stay in the history
    if (state.objection_state?.objection_id === decision.objection_id) state.objection_state = { ...record };
  }
  return state;
}

export function applyCompliance(previous, complianceEvent) {
  const state = clone(previous);
  state.state_version += 1;
  if (complianceEvent.event_type === "ai_stopped" || complianceEvent.event_type === "stop_ai_prompted") state.compliance_state.ai_processing_allowed = complianceEvent.event_type !== "ai_stopped";
  if (complianceEvent.event_type === "disclosure_detected") state.compliance_state.disclosure_given = true;
  if (complianceEvent.event_type === "consent_issue") state.compliance_state.ai_processing_allowed = false;
  if (complianceEvent.event_type === "ai_resumed") state.compliance_state.ai_processing_allowed = true;
  state.compliance_state.last_event = complianceEvent.event_type;
  return state;
}

export function trustGain(state) {
  if (state.trust_state.start === null) return { value: null, confidence: 0, low_confidence: true };
  const value = round(state.trust_state.score - state.trust_state.start, 1);
  const confidence = round(Math.min(state.trust_state.confidence, state.trust_state.start_confidence ?? 0), 2);
  return { value, start: state.trust_state.start, end: state.trust_state.score, confidence, low_confidence: confidence < SCORING.confidence.lowBelow };
}
