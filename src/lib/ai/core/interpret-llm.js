// LLM interpretation (Spec 01 §5: meaning in context, not keywords). A small, fast model labels the
// utterance into a fixed JSON shape; the rule-based reading supplies the measurable fields and is
// the fallback when the model is slow, unavailable or returns something invalid. The model never
// chooses strategy here; it only says what the prospect most likely meant.

import { interpretRules } from "./interpret.js";
import { LEXICON } from "./lexicon.js";
import { clamp, withDeadline } from "./text.js";

export const LLM_INTERPRETATION_VERSION = "interpret_llm_v1.0";

const OBJECTION_IDS = LEXICON.objections.map((o) => o.id).concat(["logistics:decision_maker_absent", "stall:send_info"]);
const INTENTS = ["question", "concern", "objection", "resistance", "curiosity", "buying_signal", "rejection", "negotiation", "commitment", "request", "agreement", "statement", "boundary"];

const SYSTEM = [
  "You label one utterance from a live real-estate sales call. You do not write responses or advice.",
  "Read it in the context of the recent turns and call state. Return only JSON with these keys:",
  `intent (one of ${INTENTS.join(", ")}),`,
  `objection_id (one of ${OBJECTION_IDS.join(", ")}, "other", or null),`,
  "objection_categories (subset of financial, risk, logistics, relationship),",
  "boundary (do_not_contact | representation | legal | privacy | null),",
  "decision_maker (present | not_present | null), meeting (walkthrough | tour | strategy_meeting | null),",
  "meeting_accepted (true/false: an explicit yes to a specific time), sentiment (-1..1), future_language (0..1),",
  "value_recognition (0..1), sensitive_context (deceased | divorce | illness | hardship | null), confidence (0..1).",
  "If unsure, lower confidence; never guess tone of voice from text.",
].join("\n");

export function llmInterpreter(provider, { timeoutMs = 700 } = {}) {
  return async function interpret(text, { speaker, state }) {
    const rules = interpretRules(text, { speaker, state });
    if (speaker !== "prospect" || !provider?.configured) return rules;
    const input = {
      utterance: text,
      recent_turns: state?.last_turn ? [{ speaker: state.last_turn.speaker, text: state.last_turn.text }] : [],
      call_state: { stage: state?.conversation_stage?.value, open_objection: state?.objection_state?.objection_id ?? null, decision_structure: state?.decision_structure?.status, meeting_offered: state?.conversion?.status ?? null, lead_type: state?.call_context?.lead_type },
    };
    let parsed;
    try {
      const { text: raw } = await withDeadline(provider.generate({ system: SYSTEM, input, maxWords: 80, timeoutMs }), timeoutMs + 50, "interpretation");
      parsed = JSON.parse(String(raw).replace(/^```(json)?|```$/g, "").trim());
    } catch {
      return rules; // slow or invalid: the rules reading stands (lower confidence)
    }
    if (!parsed || !INTENTS.includes(parsed.intent)) return rules;

    const confidence = clamp(Number(parsed.confidence) || 0.6, 0, 0.95);
    const known = OBJECTION_IDS.includes(parsed.objection_id);
    const objection = known
      ? { id: parsed.objection_id, categories: LEXICON.objections.find((o) => o.id === parsed.objection_id)?.categories ?? (parsed.objection_categories ?? []), label: LEXICON.objections.find((o) => o.id === parsed.objection_id)?.label ?? parsed.objection_id }
      : rules.objection;
    return {
      ...rules,
      source: "llm",
      version: LLM_INTERPRETATION_VERSION,
      confidence,
      intent: parsed.intent,
      objection: parsed.intent === "boundary" ? null : objection,
      boundary: parsed.boundary ? { type: parsed.boundary } : rules.boundary,
      decision_structure: parsed.decision_maker ? { type: "spouse_partner", status: parsed.decision_maker === "present" ? "participant_present" : "participant_not_present" } : rules.decision_structure,
      meeting: parsed.meeting || rules.meeting ? { ...(rules.meeting ?? { has_time: false, soft_accept: false, decline: false }), type: parsed.meeting ?? rules.meeting?.type ?? null, explicit_accept: Boolean(parsed.meeting_accepted) && Boolean(rules.meeting?.has_time || state?.conversion?.has_time) } : null,
      sentiment: clamp(Number(parsed.sentiment ?? rules.sentiment), -1, 1),
      future_language: clamp(Number(parsed.future_language ?? rules.future_language), 0, 1),
      value_recognition: clamp(Number(parsed.value_recognition ?? rules.value_recognition), 0, 1),
      sensitive_context: parsed.sensitive_context ?? rules.sensitive_context,
      // "other" = an objection the library doesn't know yet → learning candidate (Spec 05 §5)
      learning_candidate: parsed.objection_id === "other" || rules.learning_candidate,
    };
  };
}
