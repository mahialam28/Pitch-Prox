// Scoring weights and thresholds (Specs 08–09). Spec 00: these are configurable starting values,
// not scientific truth, until Bryce and the developer approve them. Every score stores this version.

export const SCORING_VERSION = "behavioral_scoring_v1.0";

export const SCORING = Object.freeze({
  version: SCORING_VERSION,

  trust: {
    weights: { openness: 0.2, reciprocity: 0.15, framing: 0.15, objection: 0.2, toneSafety: 0.1, transparency: 0.1, commitment: 0.1 },
    smoothing: 0.25, // trust_t = 0.75 × previous + 0.25 × observed
    start: 50,
    stableAfterTurns: 3, // trust_start is taken after the first stable window
  },

  engagement: {
    weights: { depth: 0.2, questions: 0.2, reciprocity: 0.15, future: 0.2, disclosure: 0.15, lowBoundary: 0.1 },
    smoothing: 0.35,
    start: 50,
  },

  pacing: {
    weights: { rate: 0.35, timing: 0.2, interruptions: 0.2, pauses: 0.15, calibration: 0.1 },
    rateTolerancePct: 0.25, // WPM difference allowed before penalties start
    earlyResponseMs: 150, // rep answering faster than this is "jumping in"
    deadAirMs: 3500, // longer silences are unusable gaps
  },

  momentum: {
    weights: { clarity: 0.15, value: 0.15, objection: 0.2, trust: 0.15, decision: 0.1, future: 0.15, commitment: 0.1 },
    smoothing: 0.4,
    start: 40,
  },

  readiness: {
    weights: { emotional: 0.25, logical: 0.25, logistical: 0.25, decision: 0.25 },
    logisticalBlockerBelow: 30,
    logisticalBlockerCap: 60, // overall readiness can't exceed this while logistics are blocked
    smoothing: 0.4,
  },

  objection: {
    recurrenceWindowTurns: 12, // same objection within this many prospect turns counts as a repeat
  },

  confidence: {
    textOnlyEmotionCap: 0.7, // without acoustic features, emotion confidence stays below this
    lowBelow: 0.45, // below this a score is weak context only (no strong UI labels, no aggressive moves)
    ruleInterpreter: 0.6, // confidence of the rule-based fallback interpretation
  },

  closeGate: {
    minTrust: 40,
    minEngagement: 45,
    minReadiness: 55,
  },

  timing: {
    staleAfterMs: 2500, // a prompt not ready within this window has missed its moment
    cooldownMs: 4000, // default gap between prompts when nothing material changed
  },
});
