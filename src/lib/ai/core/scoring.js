// Trust, engagement, pacing, expressed emotion, tension, momentum and readiness (Specs 08–09).
// Pure functions: (previous state, this turn's interpretation + features) → new values + reasons.
// Heuristic, configurable and versioned (SCORING); never one cue → one emotion (Spec 08 §1).

import { SCORING } from "../config/scoring.js";
import { clamp, round } from "./text.js";

const smooth = (previous, observed, factor) => (previous === null || previous === undefined ? observed : previous * (1 - factor) + observed * factor);
const weighted = (weights, parts) => Object.entries(weights).reduce((sum, [key, weight]) => sum + weight * (parts[key] ?? 0), 0);
const trendOf = (history, value, up = 3, down = -3) => {
  const before = history.length >= 3 ? history[history.length - 3] : history[0];
  if (before === undefined) return "stable";
  const delta = value - before;
  return delta >= up ? "rising" : delta <= down ? "falling" : "stable";
};

// ── Trust (Spec 08 §3) ───────────────────────────────────────────────────────────────────
export function scoreTrust(state, turn) {
  const { interp, features, objection } = turn;
  const shrinking = features.baseline_ready && features.turn_depth_vs_baseline !== null && features.turn_depth_vs_baseline < 0.45 && state.counters.prospect_open_turns > 0;
  const parts = {
    openness: clamp(interp.disclosure * 0.9 + interp.specificity * 0.6 - (shrinking ? 0.7 : 0) - (interp.word_count <= 2 && !interp.agreement ? 0.3 : 0), -1, 1),
    reciprocity: clamp((interp.question_type && interp.question_type !== "hostile" ? 0.6 : 0) + (interp.word_count > 4 ? 0.2 : -0.1) - (interp.intent === "rejection" ? 0.6 : 0), -1, 1),
    framing: clamp(interp.agreement * 0.7 + interp.value_recognition * 0.7 - interp.disagreement - (interp.accusation ? 0.6 : 0), -1, 1),
    objection: clamp(objection?.event === "resolved" ? 0.8 : objection?.event === "partial" ? 0.4 : objection?.event === "repeat" ? -0.45 * Math.min(2, objection.record.recurrence_count - 1) : objection?.event === "reactivated" ? -0.5 : 0, -1, 1),
    toneSafety: clamp(interp.sentiment * 0.7 - (interp.accusation ? 0.6 : 0) - (features.interrupted && interp.sentiment < 0 ? 0.3 : 0), -1, 1),
    transparency: interp.accusation ? -1 : interp.agreement >= 0.7 && objection?.record ? 0.4 : 0,
    commitment: clamp((interp.meeting?.explicit_accept ? 1 : 0) + interp.future_language * 0.6 - (interp.meeting?.decline ? 0.8 : 0) - (state.conversion?.status === "tentative" && interp.stall ? 0.6 : 0), -1, 1),
  };
  const raw = weighted(SCORING.trust.weights, parts);
  const observed = clamp(50 + 50 * raw, 0, 100);
  let score = smooth(state.trust_state.score, observed, SCORING.trust.smoothing);
  // A boundary wins over everything; trust is not "high" while the prospect asks to stop (Spec 10 §8)
  if (turn.interp.boundary) score = Math.min(score, 45);
  const prospectTurns = state.counters.prospect_turns;
  const confidence = clamp((0.3 + 0.08 * prospectTurns) * (0.6 + 0.4 * features.feature_confidence) * (turn.interp.boundary ? 0.7 : 1), 0, 0.9);
  const history = [...state.trust_state.history, score];
  const reasons = Object.entries(parts).filter(([, v]) => Math.abs(v) >= 0.4).map(([k, v]) => `${k}${v > 0 ? "+" : "-"}`);
  return { score: round(score, 1), trend: trendOf(history, score), confidence: round(confidence, 2), history: history.slice(-12), parts, reasons };
}

// ── Engagement (Spec 08 §8): investment in the conversation, not happiness ────────────────
export function scoreEngagement(state, turn) {
  const { interp, features } = turn;
  // Depth = length against the speaker's own baseline + how specific the turn is (not speed)
  const length = features.baseline_ready && features.turn_depth_vs_baseline !== null ? clamp(features.turn_depth_vs_baseline / 1.5, 0, 1) : clamp(interp.word_count / 25, 0, 1);
  const depth = 0.6 * length + 0.4 * interp.specificity;
  const questionScore = { evaluation: 1, logistics: 1, clarification: 0.7, hostile: 0.55 }[interp.question_type] ?? 0.2;
  const parts = {
    depth,
    questions: questionScore,
    reciprocity: interp.word_count > 3 ? (features.response_latency_ms !== null && features.response_latency_ms > 6000 ? 0.5 : 0.85) : 0.3,
    future: interp.future_language,
    disclosure: interp.disclosure,
    lowBoundary: interp.boundary ? 0 : 1,
  };
  const observed = 100 * weighted(SCORING.engagement.weights, parts);
  const score = smooth(state.engagement_state.score, observed, SCORING.engagement.smoothing);
  const history = [...state.engagement_state.history, score];
  return { score: round(score, 1), trend: trendOf(history, score), confidence: round(clamp(0.35 + 0.07 * state.counters.prospect_turns, 0, 0.85) * features.feature_confidence, 2), history: history.slice(-12), parts };
}

// ── Pacing alignment (Spec 08 §7): judged on the rep's delivery against the prospect ───────
const CALIBRATION_WPM = { fast: [150, 195], moderate: [130, 170], slow: [105, 150], adaptive: [110, 195] };
export function scorePacing(state, turn, { prospectWpm, repWpm, profile, prospectWasDisclosing }) {
  const { features } = turn;
  const p = SCORING.pacing;
  const penalties = { rate: 0, timing: 0, interruptions: 0, pauses: 0, calibration: 0 };
  if (prospectWpm && repWpm) {
    const diff = Math.abs(repWpm - prospectWpm) / prospectWpm;
    penalties.rate = clamp((diff - p.rateTolerancePct) * 2.5, 0, 1);
  }
  const latency = features.response_latency_ms;
  if (latency !== null) {
    if (latency > -200 && latency < p.earlyResponseMs) penalties.timing = 0.5;
    if (latency > p.deadAirMs) {
      penalties.timing = Math.max(penalties.timing, 0.5);
      penalties.pauses = 0.6;
    }
  }
  if (features.interrupted) penalties.interruptions = prospectWasDisclosing ? 1 : 0.5;
  const comfort = CALIBRATION_WPM[profile?.pace] ?? CALIBRATION_WPM.moderate;
  if (features.speech_rate_wpm && (features.speech_rate_wpm < comfort[0] - 15 || features.speech_rate_wpm > comfort[1] + 15)) penalties.calibration = 0.5;
  const observed = clamp(100 - 100 * weighted(p.weights, penalties), 0, 100);
  const score = smooth(state.pacing_state.rep_alignment_score, observed, 0.4);
  const tempo = features.speech_rate_delta_pct === null ? "steady" : features.speech_rate_delta_pct <= -15 ? "slowing" : features.speech_rate_delta_pct >= 15 ? "speeding_up" : "steady";
  return { rep_alignment_score: round(score, 1), penalties, prospect_wpm: prospectWpm, rep_wpm: repWpm, conversation_tempo: tempo, confidence: round(features.feature_confidence * (prospectWpm && repWpm ? 0.95 : 0.6), 2) };
}

// ── Expressed emotional state (Spec 08 §5–6): probabilities, never one hard label ──────────
export function scoreEmotion(state, turn) {
  const { interp, features, objection } = turn;
  const rateDelta = features.speech_rate_delta_pct ?? 0;
  const slowing = rateDelta <= -15;
  const speeding = rateDelta >= 15;
  const longLatency = features.response_latency_ms !== null && features.response_latency_ms > 2500;
  const short = interp.word_count <= 4;
  const negative = interp.sentiment < -0.2;
  const positive = interp.sentiment > 0.2;
  const evidence = {
    guarded: (short && longLatency ? 0.5 : 0) + (short && !interp.agreement ? 0.25 : 0) + (interp.boundary ? 0.4 : 0) + (interp.question_type === "hostile" ? 0.2 : 0),
    overwhelmed: (negative && interp.sensitive_context ? 0.4 : 0) + (state.counters.active_objections >= 2 && negative ? 0.3 : 0) + (interp.sensitive_context === "hardship" ? 0.2 : 0),
    burned: objection?.record?.objection_id === "risk:past_failure" ? 0.7 : 0,
    detached: (short && !interp.question_type && state.engagement_state.score < 40 ? 0.5 : 0) + (slowing && short ? 0.2 : 0),
    annoyed: (interp.accusation ? 0.7 : 0) + (negative && features.interrupted ? 0.3 : 0) + (objection?.event === "repeat" && negative ? 0.2 : 0),
    anxious: (objection?.record?.objection_id === "risk:uncertainty" ? 0.5 : 0) + (negative && speeding ? 0.3 : 0),
    processing: (slowing ? 0.35 : 0) + (longLatency ? 0.25 : 0) + (interp.sensitive_context ? 0.25 : 0) + (features.pause_ratio !== null && features.pause_ratio > 0.25 ? 0.2 : 0),
    curious: interp.question_type === "clarification" || interp.question_type === "evaluation" ? 0.55 : 0,
    engaged: state.engagement_state.score > 60 ? 0.45 : 0,
    hopeful: positive && interp.future_language > 0 ? 0.5 : 0,
    confident: interp.specificity > 0.5 && !negative && interp.meeting ? 0.4 : 0,
    excited: positive && speeding ? 0.45 : positive && interp.meeting?.has_time ? 0.25 : 0,
    trusting: state.trust_state.score > 62 && interp.disclosure > 0.3 ? 0.5 : 0,
    eager: interp.meeting?.has_time && positive ? 0.5 : interp.question_type === "logistics" ? 0.35 : 0,
  };
  const total = Object.values(evidence).reduce((a, b) => a + b, 0);
  const neutral = Math.max(0.25, 1 - total);
  const probabilities = Object.fromEntries(Object.entries(evidence).map(([k, v]) => [k, v / (total + neutral)]));
  const top = Object.entries(probabilities).sort((a, b) => b[1] - a[1]).filter(([, v]) => v >= 0.12).slice(0, 2).map(([s, p]) => ({ state: s, probability: round(p, 2) }));
  const valence = smooth(state.emotion_state.valence, interp.sentiment * 100, 0.4);
  const arousal = clamp(smooth(state.emotion_state.arousal, 40 + rateDelta * 0.8 + (features.interrupted ? 12 : 0) + (interp.accusation ? 20 : 0) + (interp.meeting?.has_time && positive ? 10 : 0), 0.4), 0, 100);
  const agency = clamp(smooth(state.emotion_state.control_agency, 50 + (interp.specificity - 0.3) * 40 + (interp.meeting?.explicit_accept ? 20 : 0) - (objection?.record?.objection_id === "risk:uncertainty" ? 20 : 0), 0.35), 0, 100);
  const safety = clamp(smooth(state.emotion_state.social_safety, 50 + interp.disclosure * 30 + interp.agreement * 15 - (interp.boundary ? 40 : 0) - (interp.accusation ? 30 : 0) - evidence.guarded * 20, 0.35), 0, 100);
  // Text-only: emotion confidence stays capped; no claims about tone of voice (Spec 07 §1)
  const cap = features.acoustic ? 0.9 : SCORING.confidence.textOnlyEmotionCap;
  const confidence = clamp((top[0]?.probability ?? 0) + 0.25, 0, 1) * interp.confidence * features.feature_confidence;
  return {
    valence: round(valence, 1),
    arousal: round(arousal, 1),
    control_agency: round(agency, 1),
    social_safety: round(safety, 1),
    top_states: top,
    probabilities: Object.fromEntries(Object.entries(probabilities).map(([k, v]) => [k, round(v, 3)])),
    confidence: round(Math.min(cap, confidence), 2),
    basis: features.acoustic ? "text+timing+acoustic" : "text+timing",
  };
}

export function scoreTension(state, turn) {
  const { interp, objection } = turn;
  const observed = clamp(30 - interp.sentiment * 30 + (objection?.event === "repeat" ? 20 : 0) + (interp.accusation ? 30 : 0) + (interp.boundary ? 25 : 0) + (turn.features.interrupted ? 10 : 0) - (objection?.event === "resolved" ? 20 : 0), 0, 100);
  return { score: round(smooth(state.tension_state.score, observed, 0.4), 1), root: objection?.record?.root_categories?.[0] ?? state.tension_state.root ?? null };
}

// ── Momentum (Spec 09 §2): directional progress, not friendliness ──────────────────────────
export function scoreMomentum(state, turn) {
  const { interp, objection } = turn;
  const conversion = state.conversion?.status;
  const structure = state.decision_structure?.status;
  const parts = {
    clarity: Math.max(interp.problem_clarity, state.running.problem_clarity * 0.85),
    value: Math.max(interp.value_recognition, state.running.value_recognition * 0.85),
    objection: objection?.event === "resolved" ? 1 : objection?.event === "partial" ? 0.65 : objection?.event === "repeat" || objection?.event === "reactivated" ? 0.1 : objection?.event === "new" ? 0.35 : state.counters.active_objections ? 0.4 : 0.7,
    trust: state.trust_state.trend === "rising" ? 0.8 : state.trust_state.trend === "falling" ? 0.2 : 0.5,
    decision: structure === "participant_present" ? 1 : structure === "participant_not_present" ? 0.3 : 0.5,
    future: Math.max(interp.future_language, state.running.future_language * 0.8),
    commitment: { confirmed: 1, tentative: 0.7, offered: 0.5, declined: 0 }[conversion] ?? (interp.stall ? 0.15 : 0.3),
  };
  const observed = 100 * weighted(SCORING.momentum.weights, parts);
  const previous = state.momentum_state.score;
  const score = smooth(previous, observed, SCORING.momentum.smoothing);
  const delta = score - (previous ?? score);
  const trend = interp.boundary ? "regressing" : delta >= 2.5 ? "advancing" : delta <= -6 ? "regressing" : delta <= -1.5 || objection?.event === "repeat" ? "stalling" : "stable";
  return { score: round(score, 1), trend, parts, confidence: round(clamp(0.3 + 0.07 * state.counters.prospect_turns, 0, 0.85), 2) };
}

// ── Readiness (Spec 09 §3) with blocker caps ─────────────────────────────────────────────────
export function scoreReadiness(state) {
  const r = SCORING.readiness;
  const unresolved = Object.values(state.objections).filter((o) => ["unresolved", "reactivated", "clarified"].includes(o.resolution));
  const repeats = unresolved.reduce((sum, o) => sum + Math.max(0, o.recurrence_count - 1), 0);
  const emotional = clamp(0.5 * state.trust_state.score + 0.5 * state.emotion_state.social_safety - 0.3 * Math.max(0, state.tension_state.score - 40), 0, 100);
  const logical = clamp(30 + 35 * state.running.value_recognition + 25 * state.running.problem_clarity + 10 * state.counters.questions_answered, 0, 100);
  const structure = state.decision_structure?.status;
  const logisticsObjection = unresolved.some((o) => o.root_categories.includes("logistics"));
  let logistical = 45 + (state.running.meeting_time ? 25 : 0) + (structure === "participant_present" ? 20 : 0) - (structure === "participant_not_present" ? 35 : 0) - (logisticsObjection ? 20 : 0) + 20 * state.running.future_language;
  logistical = clamp(logistical, 0, 100);
  const decision = clamp(70 - 18 * unresolved.length - 10 * repeats + ({ confirmed: 25, tentative: 15 }[state.conversion?.status] ?? 0), 0, 100);
  const blended = r.weights.emotional * emotional + r.weights.logical * logical + r.weights.logistical * logistical + r.weights.decision * decision;
  const capped = logistical < r.logisticalBlockerBelow ? Math.min(blended, r.logisticalBlockerCap) : blended;
  const overall = smooth(state.readiness_state.overall, capped, r.smoothing);
  return {
    emotional: round(emotional),
    logical: round(logical),
    logistical: round(logistical),
    decision_confidence: round(decision),
    overall: round(logistical < r.logisticalBlockerBelow ? Math.min(overall, r.logisticalBlockerCap) : overall),
    blocker: logistical < r.logisticalBlockerBelow ? (structure === "participant_not_present" ? "decision_maker_absent" : "logistics") : null,
    level: overall >= 75 ? "commitment-ready" : overall >= 60 ? "evaluating" : overall >= 48 ? "receptive" : overall >= 35 ? "exploratory" : "not ready",
  };
}
