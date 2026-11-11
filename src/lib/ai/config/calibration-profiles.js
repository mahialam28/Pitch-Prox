// Calibration score → prompting profile (Spec 04 §16). The score (44–100) is a routing key, not a
// grade: it picks HOW the Core's chosen line is built (length, clauses, warmth, pacing), never the
// strategy. Values come from Bryce's routing table; tune here without touching code elsewhere.
// Score 100 is the spec's proposed extension and is used only when approved (APPROVE_SCORE_100).

export const PROMPTING_LEVEL_VERSION = "calibration_levels_v1.0";
export const APPROVE_SCORE_100 = false;

// The six styles repeat in this order from 44 upwards
const STYLES = [
  { key: "CLARITY_HIGH_PACING", level: "Clarity-High-Pacing", clarity: 0.9, empathy: 0.3, pace: "fast", clauses: [1, 2], pause: "short", leadTime: "fast", chunking: "single", instructions: "Direct, fact-first phrasing. 1–2 short clauses, minimal emotional preamble, surface the answer early, concrete nouns and verbs, no layered metaphors, one question or call to action at a time." },
  { key: "CLARITY_MEDIUM_PACING", level: "Clarity-Medium-Pacing", clarity: 0.8, empathy: 0.4, pace: "moderate", clauses: [2, 3], pause: "balanced", leadTime: "moderate", chunking: "single", instructions: "Structured, orderly phrasing. 2–3 clauses at most: lead with the point, then one supporting reason. One concise clarification is allowed before the call to action." },
  { key: "CLARITY_LOW_PACING", level: "Clarity-Low-Pacing", clarity: 0.8, empathy: 0.4, pace: "slow", clauses: [2, 4], pause: "longer", leadTime: "early", chunking: "sequential", instructions: "Methodical, step-by-step phrasing with explicit transitions. Explain one idea fully before moving on; prefer precision over speed; split complex strategy into sequential prompts." },
  { key: "EMPATHY_HIGH_PACING", level: "Empathy-High-Pacing", clarity: 0.5, empathy: 0.8, pace: "fast", clauses: [1, 2], pause: "short", leadTime: "fast", chunking: "single", instructions: "Warm acknowledgment immediately, then move quickly: one empathy phrase plus one strategic move. Energetic but controlled; mirror emotion without dwelling." },
  { key: "EMPATHY_MEDIUM_PACING", level: "Empathy-Medium-Pacing", clarity: 0.5, empathy: 0.8, pace: "moderate", clauses: [2, 3], pause: "after_emotion", leadTime: "moderate", chunking: "single", instructions: "Warm, conversational phrasing at a measured speed: acknowledge, reframe or clarify, then the next step. Don't overexplain; keep a natural human rhythm." },
  { key: "EMPATHY_LOW_PACING", level: "Empathy-Low-Pacing", clarity: 0.4, empathy: 0.9, pace: "slow", clauses: [2, 3], pause: "longer_after_objection", leadTime: "early", chunking: "single", instructions: "Reflective, low-pressure phrasing. Validate before advancing, softer transitions, fewer stacked benefits; protect trust and give the prospect room to process." },
];

// Target words per score (Spec 04 §16 table; "or less" for the Clarity-High scores)
const TARGET_WORDS = {
  44: 18, 45: 22, 46: 27, 47: 20, 48: 24, 49: 29, 50: 18, 51: 23, 52: 28, 53: 21, 54: 25, 55: 29,
  56: 19, 57: 23, 58: 28, 59: 21, 60: 25, 61: 30, 62: 19, 63: 24, 64: 29, 65: 22, 66: 26, 67: 30,
  68: 20, 69: 24, 70: 30, 71: 22, 72: 26, 73: 31, 74: 20, 75: 25, 76: 30, 77: 22, 78: 27, 79: 32,
  80: 21, 81: 25, 82: 31, 83: 23, 84: 28, 85: 32, 86: 21, 87: 26, 88: 32, 89: 23, 90: 28, 91: 33,
  92: 21, 93: 26, 94: 32, 95: 24, 96: 29, 97: 34, 98: 22, 99: 27,
};

export const MIN_SCORE = 44;
export const MAX_SCORE = APPROVE_SCORE_100 ? 100 : 99;

function profileFor(score) {
  if (score === 100) {
    return {
      score: 100,
      profile_id: "CAL_100_ADAPTIVE_PREMIUM_BALANCED",
      prompting_level: "Adaptive-Premium-Balanced",
      target_word_range: [22, 34],
      sentence_complexity: "adaptive",
      empathy_weight: 0.7,
      clarity_weight: 0.7,
      pace: "adaptive",
      pause_behavior: "precise",
      prompt_lead_time: "adaptive",
      chunking: "adaptive",
      instructions: "Vary between concise/direct and reflective/empathic construction while keeping the user's calibrated cadence. 22–34 words depending on the moment; advanced clause structure only when the user's measured delivery supports it.",
      notes: "Proposed extension (Spec 04 §16.3); not in the historical source.",
    };
  }
  const style = STYLES[(score - MIN_SCORE) % STYLES.length];
  const target = TARGET_WORDS[score];
  const isUpperBound = style.key === "CLARITY_HIGH_PACING";
  return {
    score,
    profile_id: `CAL_${score}_${style.key}`,
    prompting_level: style.level,
    target_word_range: isUpperBound ? [Math.max(8, target - 8), target] : [target - 4, target + 3],
    sentence_complexity: `${style.clauses[0]}-${style.clauses[1]} clauses`,
    empathy_weight: style.empathy,
    clarity_weight: style.clarity,
    pace: style.pace,
    pause_behavior: style.pause,
    prompt_lead_time: style.leadTime,
    chunking: style.chunking,
    instructions: style.instructions,
    notes: "Spec 04 §16 routing table",
  };
}

export const CALIBRATION_PROFILES = Object.freeze(
  Object.fromEntries(Array.from({ length: 100 - MIN_SCORE + 1 }, (_, i) => MIN_SCORE + i).map((score) => [score, Object.freeze(profileFor(score))]))
);

// Before calibration (or with an unknown score) the Core uses a neutral, mid-range profile
export const DEFAULT_PROFILE = Object.freeze({ ...profileFor(75), profile_id: "CAL_DEFAULT_UNCALIBRATED", notes: "No completed calibration; neutral defaults." });

export function calibrationProfile(score) {
  const value = Math.round(Number(score));
  if (!Number.isFinite(value) || value < MIN_SCORE) return DEFAULT_PROFILE;
  return CALIBRATION_PROFILES[Math.min(value, MAX_SCORE)];
}

// Hard upper limit for a live line: the profile's range, tightened when the moment needs speed
export function maxPromptWords(profile, { urgency = "normal" } = {}) {
  const [, upper] = profile.target_word_range;
  return urgency === "immediate" ? Math.max(10, Math.round(upper * 0.85)) : upper;
}
