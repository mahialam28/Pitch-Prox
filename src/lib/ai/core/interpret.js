// Conversation understanding: what an utterance means in context (Spec 01 §3 stage 3, §5).
//
// interpretRules() is the fallback that runs without any AI service (and in the replay tests). It
// reads phrase evidence AND the current call state, e.g. "I need to think about it" means a money
// concern right after a price discussion, but a decision-maker issue when the spouse is absent
// (Spec 11 scenarios 3–4). Its confidence is capped (SCORING.confidence.ruleInterpreter) so the Core
// never acts on it as if it were certain. The LLM classifier (llm-gateway.js) returns the same shape.

import { LEXICON } from "./lexicon.js";
import { SCORING } from "../config/scoring.js";
import { clamp, matchesAny, countMatches, normalize, wordCount } from "./text.js";

export const INTERPRETATION_VERSION = "interpret_rules_v1.0";

const has = (text, patterns) => matchesAny(text, patterns);
const firstMatch = (text, entries) => entries.find((entry) => has(text, entry.patterns)) ?? null;

function detectQuestion(text) {
  const value = normalize(text);
  if (!value) return null;
  const isQuestion = value.includes("?") || LEXICON.questionWords.test(value);
  if (!isQuestion) return null;
  if (has(value, LEXICON.hostileQuestion) || has(value, LEXICON.accusation)) return "hostile";
  if (LEXICON.time.some((re) => re.test(value)) || has(value, ["schedule", "available", "availability", "what time", "which day"])) return "logistics";
  if (has(value, LEXICON.future)) return "evaluation";
  return "clarification";
}

function detectMeeting(text, state) {
  const value = normalize(text).replace(/\b(nice|good|great|pleasure) to meet you\b/g, "");
  const meeting = firstMatch(value, LEXICON.meetings);
  const hasTime = LEXICON.time.some((re) => re.test(value));
  const offered = state?.conversion?.status && state.conversion.status !== "declined";
  const hedged = has(value, LEXICON.hedges);
  const firmAccept = has(value, LEXICON.firmAccept) && !hedged;
  const softAccept = has(value, LEXICON.accept) || hedged;
  const decline = has(value, LEXICON.decline.filter((p) => p !== "no")) || /^no[.!]?$/.test(value);
  const isQuestion = value.includes("?");
  if (!meeting && !hasTime && !(offered && (firmAccept || softAccept || decline))) return null;
  return {
    type: meeting?.type ?? state?.conversion?.type ?? null,
    has_time: hasTime,
    explicit_accept: !isQuestion && !hedged && (firmAccept || (offered && softAccept && hasTime)),
    soft_accept: softAccept,
    decline: decline && !firmAccept,
  };
}

function detectDecisionStructure(text, state) {
  const mentionsOther = has(text, LEXICON.decisionMakers);
  if (has(text, LEXICON.present)) return { type: "spouse_partner", status: "participant_present" };
  if (mentionsOther && has(text, LEXICON.absent)) return { type: "spouse_partner", status: "participant_not_present" };
  if (mentionsOther && /\b(we|our|us)\b/.test(normalize(text))) return { type: "spouse_partner", status: state?.decision_structure?.status ?? "unknown" };
  if (has(text, ["it's just me", "i'm the only", "i decide", "my decision", "just my name"])) return { type: "single_decision_maker", status: "participant_present" };
  return null;
}

function sentimentOf(text) {
  const positive = countMatches(text, LEXICON.positive) + (has(text, LEXICON.laughter) ? 1 : 0);
  const negative = countMatches(text, LEXICON.negative) + (has(text, LEXICON.accusation) ? 2 : 0);
  if (!positive && !negative) return 0;
  return clamp((positive - negative) / (positive + negative + 1), -1, 1);
}

function specificityOf(text) {
  const value = normalize(text);
  let score = 0;
  if (/\$?\d/.test(value)) score += 0.35; // amounts, dates, numbers
  if (LEXICON.time.some((re) => re.test(value))) score += 0.25;
  if (/\b(bedroom|bath|sq ?ft|square feet|acre|garage|kitchen|roof|school|commute|closing|mortgage|equity|offer)s?\b/.test(value)) score += 0.25;
  if (has(value, LEXICON.decisionMakers)) score += 0.15;
  if (wordCount(value) > 18) score += 0.15;
  return clamp(score, 0, 1);
}

// The objection a stall refers to, read from the call so far
function stallMeaning(stallId, state, decisionStructure) {
  if (stallId === "send_info") return { intent: "request", categories: [], id: "stall:send_info", label: "Asked for information instead of a next step" };
  const structure = decisionStructure ?? state?.decision_structure;
  if (structure?.status === "participant_not_present") return { intent: "concern", categories: ["logistics"], id: "logistics:decision_maker_absent", label: "Decision maker not on the call" };
  const recent = state?.objection_state;
  const recentFinancial = recent?.root_categories?.includes("financial") || (state?.recent_topics ?? []).includes("financial");
  if (recentFinancial) return { intent: "objection", categories: ["financial"], id: recent?.objection_id?.startsWith("financial") ? recent.objection_id : "financial:value", label: "Money concern behind 'think about it'" };
  return { intent: "concern", categories: [], id: `stall:${stallId}`, label: "Hesitation, reason unknown" };
}

export function interpretRules(text, { speaker = "prospect", state = null } = {}) {
  const value = normalize(text);
  const out = {
    source: "rules",
    version: INTERPRETATION_VERSION,
    confidence: SCORING.confidence.ruleInterpreter,
    speaker,
    intent: "statement",
    sentiment: sentimentOf(value),
    objection: null,
    stall: null,
    boundary: null,
    question_type: detectQuestion(value),
    future_language: 0,
    agreement: 0,
    disagreement: 0,
    accusation: has(value, LEXICON.accusation),
    specificity: specificityOf(value),
    disclosure: 0,
    sensitive_context: null,
    decision_structure: null,
    meeting: null,
    value_recognition: 0,
    problem_clarity: 0,
    pressure: speaker === "rep" ? has(value, LEXICON.pressure) : false,
    learning_candidate: false,
    word_count: wordCount(value),
  };
  if (!value) return { ...out, intent: "silence", confidence: 0.2 };

  const boundary = firstMatch(value, LEXICON.boundaries);
  if (boundary) out.boundary = { type: boundary.type };
  const sensitive = firstMatch(value, LEXICON.sensitive);
  if (sensitive) out.sensitive_context = sensitive.type;
  out.decision_structure = detectDecisionStructure(value, state);
  out.meeting = detectMeeting(value, state);
  out.future_language = clamp(countMatches(value, LEXICON.future) * 0.4 + (out.meeting?.has_time ? 0.4 : 0) + (out.question_type === "logistics" ? 0.3 : 0), 0, 1);
  out.agreement = has(value, LEXICON.agreement) ? (wordCount(value) <= 3 ? 0.4 : 0.7) : 0;
  out.disagreement = has(value, LEXICON.disagreement) ? 0.8 : 0;
  // Volunteered, specific detail counts as disclosure, not just "honestly…" phrases (Spec 08 §8)
  out.disclosure = clamp(countMatches(value, LEXICON.disclosure) * 0.4 + out.specificity * 0.5 + (out.sensitive_context ? 0.4 : 0), 0, 1);
  out.value_recognition = has(value, LEXICON.value) ? 0.7 : 0;
  out.problem_clarity = has(value, LEXICON.problem) ? 0.6 : 0;

  if (speaker !== "prospect") {
    out.intent = out.question_type ? "question" : "statement";
    return out;
  }

  const objection = firstMatch(value, LEXICON.objections);
  const stall = firstMatch(value, LEXICON.stalls);

  if (out.boundary?.type === "privacy") {
    out.intent = "question";
    out.question_type = "privacy";
  } else if (out.boundary) {
    out.intent = "boundary";
    out.confidence = Math.max(out.confidence, 0.75);
  } else if (out.meeting?.decline && state?.conversion?.status) {
    out.intent = "rejection";
  } else if (out.meeting?.explicit_accept || (out.meeting?.has_time && out.meeting?.soft_accept)) {
    out.intent = "commitment";
  } else if (objection) {
    out.objection = { id: objection.id, categories: objection.categories, label: objection.label };
    out.intent = out.question_type === "evaluation" ? "concern" : "objection";
  } else if (stall) {
    const meaning = stallMeaning(stall.id, state, out.decision_structure);
    out.stall = stall.id;
    out.intent = meaning.intent;
    if (meaning.categories.length || stall.id === "send_info") out.objection = { id: meaning.id, categories: meaning.categories, label: meaning.label, from_stall: true };
    else out.objection = { id: meaning.id, categories: [], label: meaning.label, from_stall: true };
    out.confidence = Math.min(out.confidence, 0.55);
  } else if (out.question_type === "hostile") {
    out.intent = "resistance";
  } else if (out.question_type === "evaluation" || out.question_type === "logistics") {
    out.intent = out.future_language > 0.3 ? "buying_signal" : "question";
  } else if (out.question_type) {
    out.intent = "question";
  } else if (has(value, LEXICON.decline.filter((p) => p !== "no")) || /^no[.!]?$/.test(value)) {
    out.intent = "rejection";
  } else if (out.value_recognition || (out.sentiment > 0.3 && out.future_language > 0)) {
    out.intent = "curiosity";
  } else if (out.agreement) {
    out.intent = "agreement";
  } else if (out.sentiment < -0.3) {
    out.intent = "concern";
  }

  // An objection-like statement with no known category is a learning candidate (Spec 05 §5),
  // never new doctrine by itself
  if (out.intent === "statement" && out.sentiment <= 0 && /\b(problem|issue|concern|won't let|doesn't allow|not allowed)\b/.test(value) && !out.objection) {
    out.intent = "concern";
    out.learning_candidate = true;
  }
  return out;
}
