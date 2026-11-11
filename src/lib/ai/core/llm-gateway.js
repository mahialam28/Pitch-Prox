// LLM gateway (Spec 11 §7): turns a StrategicDecision into ONE exact line. The model receives a
// bounded, structured context assembled after the Core chose the strategy, never "here's the
// transcript, what should they say?". It may improve wording but not change the action, invent
// facts, add labels/commentary, or exceed the calibrated length.

import { wordCount, withDeadline } from "./text.js";

export const GENERATION_CONTRACT_VERSION = "generation_contract_v1.0";

export const SYSTEM_PROMPT = [
  "You write the exact next words a human real-estate salesperson will say on a live phone call.",
  "PitchProX has already decided the strategy. Express that strategy; do not choose a different one.",
  "Rules:",
  "- Return JSON: {\"response_text\": \"...\"}. response_text is one natural spoken response, nothing else.",
  "- No labels, coaching notes, stage directions, quotes, emojis or multiple options.",
  "- Respect max_words and the calibration instructions (length, clauses, warmth, pacing).",
  "- Use only facts given in verified_knowledge or the conversation. Never invent numbers, sales, clients, results, credentials, guarantees or statistics. If a fact is missing, use truthful language that doesn't need it.",
  "- Obey every item in do_not_do and the playbook language rules. Compliance constraints override everything.",
  "- Sound like a person: plain words, contractions, no hype, no pressure.",
].join("\n");

const recentTurns = (turns, count = 6) => turns.slice(-count).map((t) => ({ speaker: t.speaker, text: t.text }));

export function buildGenerationInput({ decision, state, context, facts = [], conflicts = [], turns = [] }) {
  const profile = context.profile;
  const playbook = context.playbook;
  const voice = playbook?.voice_language ?? {};
  const record = decision.objection_id ? state.objections[decision.objection_id] : null;
  return {
    contract: GENERATION_CONTRACT_VERSION,
    decision_id: decision.decision_id,
    source_state_version: decision.source_state_version,
    current_strategic_decision: {
      objective: decision.strategic_objective,
      action: decision.strategic_action,
      secondary_action: decision.secondary_action,
      push_strength: decision.push_strength,
      reason_codes: decision.reason_codes,
      do_not_do: decision.do_not_do,
    },
    current_conversation_truth: {
      recent_turns: recentTurns(turns),
      stage: state.conversation_stage.value,
      prospect_intent: state.primary_intent.value,
      underlying_meaning: state.underlying_meaning.hypothesis,
      objection: record ? { label: record.label, root: record.root_categories, depth: record.depth, times_raised: record.recurrence_count, already_tried: record.strategies_attempted } : null,
      trust: { score: Math.round(state.trust_state.score), trend: state.trust_state.trend },
      expressed_emotion: state.emotion_state.confidence >= 0.45 ? state.emotion_state.top_states.map((s) => s.state) : ["uncertain_low_confidence"],
      decision_structure: state.decision_structure,
      conversion: state.conversion ? { type: state.conversion.conversion_type, status: state.conversion.status } : null,
      unresolved_items: state.unresolved_items.slice(-3),
    },
    lead_context: { lead_type: state.call_context.lead_type, prospect_name: context.prospect_name ?? null, sensitive_context: state.sensitive_context, prior_calls: context.prospect_history ? { open_objections: context.prospect_history.open_objections ?? [], promises: context.prospect_history.promises ?? [] } : null },
    verified_knowledge: facts.map((f) => ({ source_id: f.source_id, text: f.text, verification: f.verification_status })),
    disputed_facts_do_not_assert: conflicts.filter((c) => c.resolution === "unresolved_do_not_assert").map((c) => c.fact_key),
    playbook_constraints: {
      name: state.call_context.active_playbook,
      prompt_voice: voice.prompt_voice ?? voice.voice ?? null,
      preferred_words: voice.preferred_words ?? voice.use ?? [],
      avoid_words: voice.avoid_words ?? voice.avoid ?? [],
      boundaries: playbook?.boundaries ?? playbook?.do_dont ?? null,
    },
    calibration_constraints: {
      profile_id: profile.profile_id,
      level: profile.prompting_level,
      target_word_range: profile.target_word_range,
      max_words: decision.max_prompt_words,
      sentence_complexity: profile.sentence_complexity,
      instructions: profile.instructions,
    },
    compliance_constraints: { ai_processing_allowed: state.compliance_state.ai_processing_allowed, required_wording: context.compliance?.required_wording ?? null },
    generation_instruction: "Return one exact natural response the salesperson can say next. No commentary.",
  };
}

const LABEL = /^(\s*(prompt|response|say|rep|salesperson|agent|line|strategy|action|option \d+)\s*[:-])/i;
const STAGE_DIRECTION = /\[[^\]]*\]|\((pause|smile|laugh|softly|warmly)[^)]*\)/gi;

// Cleans and checks the model's line; returns { text, valid, issues }
export function validateResponse(raw, decision) {
  const issues = [];
  let text = String(raw ?? "").trim();
  try {
    if (text.startsWith("{")) text = String(JSON.parse(text).response_text ?? "");
  } catch {
    issues.push("invalid_json");
  }
  text = text.replace(/^["'“”]+|["'“”]+$/g, "").replace(LABEL, "").replace(STAGE_DIRECTION, "").replace(/\s+/g, " ").trim();
  if (/\b(option (1|2|a|b)|alternatively,? you could say)\b/i.test(text)) issues.push("multiple_options");
  if (!text) return { text: "", valid: false, issues: [...issues, "empty"] };
  const limit = decision.max_prompt_words;
  if (wordCount(text) > limit) {
    // Keep whole sentences that fit; a shorter timely line beats a longer one (Spec 11 §9)
    const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [text];
    let kept = "";
    for (const sentence of sentences) {
      if (wordCount(kept + sentence) > limit) break;
      kept += sentence;
    }
    text = kept.trim() || text.split(/\s+/).slice(0, limit).join(" ").replace(/[,;:]$/, "") + "…";
    issues.push("trimmed_to_limit");
  }
  return { text, valid: !issues.includes("multiple_options") && !issues.includes("empty"), issues };
}

// generate(): provider call with a timeout; never throws, returns { text, valid, issues, latency_ms, model }
export async function generateLine(provider, input, decision, { timeoutMs = 2500, signal } = {}) {
  const started = Date.now();
  try {
    const result = await withDeadline(provider.generate({ system: SYSTEM_PROMPT, input, maxWords: decision.max_prompt_words, timeoutMs, signal }), timeoutMs + 50, "generation");
    const checked = validateResponse(result.text, decision);
    return { ...checked, latency_ms: Date.now() - started, model: result.model ?? provider.name };
  } catch (error) {
    return { text: "", valid: false, issues: [error.name === "AbortError" ? "aborted" : "provider_error"], error: error.message, latency_ms: Date.now() - started, model: provider.name };
  }
}
