// Observation engine (Spec 01 §12, Spec 11 §4.5): did the rep keep the prompt's strategic intent,
// and how did the prospect react? Adherence is about intent, not verbatim reading.

import { overlap, matchesAny, normalize } from "./text.js";
import { LEXICON } from "./lexicon.js";

const INTENT_MARKERS = {
  question: (t) => t.includes("?") || /^(what|when|how|would|could|is|are|do|does|can)\b/.test(t),
  clarify: (t) => t.includes("?") || /\b(what do you mean|help me understand|is it|which part)\b/.test(t),
  validate: (t) => matchesAny(t, ["makes sense", "understand", "fair", "hear you", "totally", "of course", "i get it", "completely"]),
  acknowledge: (t) => matchesAny(t, ["understood", "makes sense", "i hear you", "got it", "no problem", "of course", "fair", "sorry", "thank"]),
  reframe: (t) => /\b(what if|think of it|really about|the real question|instead of|rather than)\b/.test(t),
  quantify: (t) => /\d|percent|%|dollars|math|numbers/.test(t),
  "de-risk": (t) => matchesAny(t, ["no obligation", "no commitment", "nothing to lose", "if it doesn't", "no pressure", "you decide", "risk"]),
  differentiate: (t) => /\b(different|difference|unlike|compare)\b/.test(t),
  educate: (t) => /\b(how it works|here's how|the way it works|what happens is|first|then)\b/.test(t),
  close: (t) => LEXICON.time.some((re) => re.test(t)) || matchesAny(t, ["walkthrough", "walk through", "come by", "meet", "showing", "set up", "schedule", "calendar"]),
  future_pace: (t) => /\b(picture|imagine|a month from now|down the road)\b/.test(t),
};

// Provisional outcome right after the rep speaks
export function observeRep(prompt, repText, { interrupted = false } = {}) {
  const text = normalize(repText);
  const similarity = overlap(prompt.text, repText);
  const intentKept = (INTENT_MARKERS[prompt.strategic_action] ?? (() => false))(text);
  let behavior;
  if (interrupted) behavior = "interrupted";
  else if (matchesAny(text, LEXICON.pressure)) behavior = "harmful_deviation";
  else if (similarity >= 0.6) behavior = "exact";
  else if (similarity >= 0.22 || (intentKept && similarity >= 0.08)) behavior = "strategic_paraphrase";
  else if (intentKept) behavior = "strategic_paraphrase";
  else behavior = "deviation_pending"; // useful or harmful is decided by the prospect's reaction
  const adherence = behavior === "exact" ? 1 : behavior === "strategic_paraphrase" ? Math.max(0.6, Math.min(0.95, 0.6 + similarity)) : behavior === "harmful_deviation" ? 0 : behavior === "interrupted" ? 0.2 : 0.3;
  return { prompt_id: prompt.prompt_id, rep_behavior: behavior, adherence_score: Math.round(adherence * 100) / 100, similarity: Math.round(similarity * 100) / 100, intent_kept: intentKept };
}

// Final outcome once the prospect reacts
export function finalizeOutcome(outcome, before, after, { repTurnId, prospectTurnId }) {
  const delta = {
    trust: Math.round((after.trust_state.score - before.trust_state.score) * 10) / 10,
    engagement: Math.round((after.engagement_state.score - before.engagement_state.score) * 10) / 10,
    momentum: Math.round((after.momentum_state.score - before.momentum_state.score) * 10) / 10,
  };
  let behavior = outcome.rep_behavior;
  if (behavior === "deviation_pending") behavior = delta.trust >= 0 && delta.momentum >= -1 ? "useful_deviation" : "harmful_deviation";
  if (behavior === "strategic_paraphrase" && outcome.similarity < 0.1 && delta.trust < -4) behavior = "harmful_deviation";
  return {
    ...outcome,
    rep_behavior: behavior,
    rep_turn_ids: [repTurnId],
    prospect_reaction_turn_ids: [prospectTurnId],
    observed_state_delta: delta,
    confidence: Math.round(Math.min(0.85, 0.5 + Math.abs(delta.trust) / 40 + (outcome.intent_kept ? 0.15 : 0)) * 100) / 100,
  };
}
