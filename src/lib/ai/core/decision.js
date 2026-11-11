// Core decision engine (Spec 01 §6–10, Spec 03 §5–6, Spec 09 §6–7, Spec 11 §4.3).
// Chooses the strategic action from the ConversationState BEFORE any language exists; the LLM only
// words the decision. Layer priority: compliance/safety → Core → live state/lead type → Playbook →
// AI Training → Calibration → wording.

import { SCORING } from "../config/scoring.js";
import { maxPromptWords } from "../config/calibration-profiles.js";
import { makeId, matchesAny } from "./text.js";

export const CORE_RULES_VERSION = "core_rules_v1.0";

export const ACTIONS = ["wait", "acknowledge", "clarify", "validate", "mirror", "reframe", "educate", "quantify", "differentiate", "de-risk", "social_proof", "challenge", "future_pace", "question", "close"];

// Progressive depth per objection root (Spec 01 §6): each repeat moves to a different angle
const LADDERS = {
  financial: ["clarify", "reframe", "quantify", "de-risk", "differentiate", "question"],
  risk: ["validate", "clarify", "de-risk", "social_proof", "educate", "question"],
  logistics: ["clarify", "question", "educate", "de-risk"],
  relationship: ["validate", "clarify", "differentiate", "reframe", "question"],
  unknown: ["clarify", "validate", "question"],
};
const OBJECTIVES = {
  financial: "resolve_value_concern",
  risk: "reduce_perceived_risk",
  logistics: "remove_logistical_blocker",
  relationship: "respect_relationship_and_show_difference",
  unknown: "diagnose_the_real_concern",
};
const STYLE_TO_ACTION = { Reframe: "reframe", Clarify: "clarify", Validate: "validate", Educate: "educate", Quantify: "quantify", Differentiate: "differentiate", "De-Risk": "de-risk", Challenge: "challenge", "Social Proof": "social_proof", "Future Pace": "future_pace", Direct: "close" };
const ACTIVE = ["unresolved", "reactivated", "clarified", "partial"];
const FACT_QUESTIONS = ["how long have you", "how many homes", "how many houses", "what makes you different", "why should i", "your experience", "your company", "your brokerage", "your team", "what do you do", "your track record", "have you sold"];

const lastPrompted = (state) => [...state.strategy_history].reverse()[0] ?? null;

// Premium/standard playbook objection library entry for this objection, if any (Spec 03 §4)
function playbookStyleFor(playbook, record) {
  const library = playbook?.objections ?? playbook?.objection_library ?? playbook?.logic?.objections ?? [];
  if (!Array.isArray(library) || !record) return null;
  const roots = record.root_categories.map((c) => c.toLowerCase());
  const entry = library.find((item) => {
    const categories = (Array.isArray(item.category) ? item.category : [item.category ?? item.categories]).flat().filter(Boolean).map((c) => String(c).toLowerCase());
    return categories.some((c) => roots.includes(c));
  });
  const style = entry?.response_style ?? entry?.responseStyle;
  return style ? STYLE_TO_ACTION[style] ?? null : null;
}

function closeGate(state, context) {
  const g = SCORING.closeGate;
  const failures = [];
  if (state.boundary) failures.push("BOUNDARY");
  if (state.trust_state.score < g.minTrust || (state.trust_state.trend === "falling" && state.trust_state.score < 50)) failures.push("TRUST_COLLAPSING");
  if (state.engagement_state.score < g.minEngagement) failures.push("LOW_ENGAGEMENT");
  const unresolved = Object.values(state.objections).filter((o) => ["unresolved", "reactivated"].includes(o.resolution) && o.recurrence_count > 0);
  if (unresolved.length) failures.push("MAJOR_OBJECTION_UNRESOLVED");
  if (state.decision_structure.status === "participant_not_present") failures.push("DECISION_MAKER_ABSENT");
  if (!(state.running.value_recognition > 0 || state.running.problem_clarity > 0 || state.running.future_language > 0.3)) failures.push("NO_VALUE_REASON");
  if (state.readiness_state.overall < g.minReadiness && !(state.running.future_language > 0.5)) failures.push("READINESS_LOW");
  if (state.sensitive_context && state.trust_state.score < 60) failures.push("SENSITIVE_CONTEXT");
  if (context.compliance?.blocked) failures.push("COMPLIANCE");
  return { open: failures.length === 0, failures };
}

function base(state, context, fields) {
  const urgency = fields.urgency ?? "normal";
  return {
    decision_id: makeId("dec"),
    call_id: state.call_id,
    source_state_version: state.state_version,
    should_prompt: true,
    strategic_objective: null,
    strategic_action: "wait",
    secondary_action: null,
    reason_codes: [],
    do_not_do: [],
    required_facts: [],
    retrieval_needed: false,
    urgency,
    max_prompt_words: maxPromptWords(context.profile, { urgency }),
    expires_on_state_change: true,
    objection_id: null,
    push_strength: null,
    playbook_influence: "none",
    sensitive_context: state.sensitive_context,
    core_rules_version: CORE_RULES_VERSION,
    ...fields,
  };
}

const wait = (state, context, reasons) => base(state, context, { should_prompt: false, strategic_action: "wait", strategic_objective: "hold", reason_codes: reasons });

function objectionDecision(state, context, record, reasons) {
  const root = record.root_categories[0] ?? "unknown";
  const attempted = new Set(record.strategies_attempted);
  const lowTrust = state.trust_state.score < 40 || state.trust_state.trend === "falling";
  const restrained = Boolean(state.sensitive_context) || lowTrust;
  const doNotDo = ["premature_close"];
  if (attempted.size) doNotDo.push("repeat_prior_strategy", ...[...attempted].map((a) => `repeat_${a}`));
  if (!context.has_verified_proof) doNotDo.push("invent_social_proof");
  if (restrained) doNotDo.push("challenge", "pressure");

  // Decision maker missing: the move is to involve them, not to argue (Spec 11 scenario 4)
  if (record.objection_id === "logistics:decision_maker_absent") {
    return base(state, context, { strategic_action: attempted.has("question") ? "acknowledge" : "question", secondary_action: "close", strategic_objective: "involve_decision_maker", reason_codes: [...reasons, "DECISION_MAKER_ABSENT"], do_not_do: [...doNotDo, "push_for_decision_now"], objection_id: record.objection_id, urgency: "immediate", push_strength: "include_decision_maker" });
  }
  // A request for information is not success; turn it into a reason for a live next step (Spec 09)
  if (record.objection_id === "stall:send_info") {
    return base(state, context, { strategic_action: attempted.has("clarify") ? "question" : "clarify", secondary_action: "close", strategic_objective: "convert_info_request_to_next_step", reason_codes: [...reasons, "INFO_REQUEST_NOT_CONVERSION"], do_not_do: doNotDo, objection_id: record.objection_id, urgency: "immediate", push_strength: "reduce_friction" });
  }

  let ladder = [...(LADDERS[root] ?? LADDERS.unknown)];
  if (record.resolution === "clarified") ladder = ladder.filter((a) => a !== "clarify");
  if (!context.has_verified_proof) ladder = ladder.filter((a) => a !== "social_proof");
  if (restrained) ladder = ladder.filter((a) => a !== "challenge" && a !== "quantify").concat(["acknowledge"]);
  // Challenge is a respectful pattern break, only with enough trust and repeated resistance
  if (!restrained && state.trust_state.score >= 60 && record.recurrence_count >= 3 && !state.sensitive_context) ladder.splice(2, 0, "challenge");

  let influence = "none";
  const styled = playbookStyleFor(context.playbook, record);
  if (styled && !attempted.has(styled) && !(restrained && styled === "challenge") && !(styled === "social_proof" && !context.has_verified_proof)) {
    ladder = [styled, ...ladder.filter((a) => a !== styled)];
    influence = "high";
  } else if (context.playbook) influence = "moderate";

  let action = ladder.find((a) => !attempted.has(a));
  if (record.resolution === "partial") action = attempted.has("question") ? ladder.find((a) => !attempted.has(a)) ?? "question" : "question";
  if (!action) action = record.recurrence_count >= 4 ? "acknowledge" : "question"; // everything tried: narrow or step back
  const objective = record.resolution === "partial" ? "narrow_remaining_concern" : `${OBJECTIVES[root] ?? OBJECTIVES.unknown}${state.readiness_state.overall >= 50 && !restrained ? "_then_earn_walkthrough" : ""}`;
  const extra = [];
  if (record.recurrence_count > 1) extra.push("OBJECTION_RECURRED");
  if (record.resolution === "reactivated") extra.push("OBJECTION_REACTIVATED");
  if (state.trust_state.trend === "rising") extra.push("TRUST_RISING");
  if (state.readiness_state.blocker) extra.push(`BLOCKER_${state.readiness_state.blocker.toUpperCase()}`);
  if (record.from_history || state.call_context.has_prior_calls) extra.push("PRIOR_CALL_CONTEXT");
  return base(state, context, { strategic_action: action, strategic_objective: objective, reason_codes: [...reasons, ...extra], do_not_do: doNotDo, objection_id: record.objection_id, urgency: "immediate", playbook_influence: influence, push_strength: restrained ? "protect_and_clarify" : record.recurrence_count > 1 ? "resolve_one_root_then_ask" : "resolve_then_ask" });
}

// decide(): the strategic decision for the current state. `turn` = what just happened.
export function decide(state, context, turn = {}) {
  const reasons = [];
  const { interp = null, material = [], objection = null, nowMs = 0 } = turn;

  if (!state.compliance_state.ai_processing_allowed) return wait(state, context, ["COMPLIANCE_STOP"]);
  if (state.last_turn?.speaker !== "prospect") return wait(state, context, ["WAIT_FOR_PROSPECT"]);

  // Hard boundary: acknowledge once, then stop all persuasion (Spec 09 §5, scenario 20)
  if (state.boundary) {
    if (state.strategy_history.some((s) => s.objective === "respect_boundary_and_exit")) return wait(state, context, ["BOUNDARY_RESPECTED"]);
    return base(state, context, { strategic_action: "acknowledge", strategic_objective: "respect_boundary_and_exit", reason_codes: ["BOUNDARY", `BOUNDARY_${state.boundary.type.toUpperCase()}`], do_not_do: ["persuade", "reframe", "close", "challenge", "ask_again"], urgency: "immediate", push_strength: "respect_record_exit" });
  }

  // The rep just cut into a disclosure: give space instead of another line (scenario 29)
  const previousRep = context.previousRepTurn;
  if (previousRep?.interrupted && previousRep.prospectWasDisclosing && interp?.word_count > 6) return wait(state, context, ["GIVE_SPACE_AFTER_INTERRUPTION"]);

  // Cooldown: nothing material happened since the last prompt
  const last = lastPrompted(state);
  const cooldown = context.playbook?.timing?.cooldown_ms ?? SCORING.timing.cooldownMs;
  // (a new rep turn since the last prompt means this is a new moment, not a repeat)
  if (last && (last.rep_turns ?? 0) === state.counters.rep_turns && nowMs - last.at_ms < cooldown && !material.length) return wait(state, context, ["COOLDOWN"]);

  // Confirmed walkthrough/tour/meeting: lock it in, then stop prompting
  if (state.conversion?.status === "confirmed") {
    if (state.strategy_history.some((s) => s.objective === "confirm_details_and_next_step")) return wait(state, context, ["CONVERSION_CONFIRMED"]);
    return base(state, context, { strategic_action: "acknowledge", strategic_objective: "confirm_details_and_next_step", reason_codes: ["CONVERSION_CONFIRMED"], do_not_do: ["reopen_objections", "add_new_asks"], push_strength: "confirm" });
  }

  // "How did you get my number?": answer honestly and offer to stop; never persuade past it
  if (interp?.question_type === "privacy") {
    return base(state, context, { strategic_action: "acknowledge", secondary_action: "educate", strategic_objective: "answer_privacy_question_honestly", reason_codes: ["PRIVACY_QUESTION"], do_not_do: ["invent_facts", "persuade", "dodge_the_question"], urgency: "immediate", push_strength: "respect_and_clarify" });
  }

  // The decision maker just turned out to be missing: involve them before anything else (scenario 4/13)
  if (material.includes("DECISION_STRUCTURE_CHANGED") && state.decision_structure.status === "participant_not_present") {
    return base(state, context, { strategic_action: "question", secondary_action: "close", strategic_objective: "involve_decision_maker", reason_codes: ["DECISION_MAKER_ABSENT"], do_not_do: ["premature_close", "push_for_decision_now"], urgency: "immediate", push_strength: "include_decision_maker" });
  }

  // An objection that is active right now
  const record = state.objection_state && ACTIVE.includes(state.objection_state.resolution) ? state.objections[state.objection_state.objection_id] : null;
  const objectionThisTurn = objection?.event && ["new", "repeat", "reactivated", "clarified"].includes(objection.event);
  const askedQuestion = interp?.question_type && interp.question_type !== "hostile";
  if (record && (objectionThisTurn || (objection?.event === "partial" && !askedQuestion))) return objectionDecision(state, context, record, reasons);

  // Low-confidence reading: neutral, never aggressive (Spec 10 §11)
  if (interp && interp.confidence < SCORING.confidence.lowBelow && !interp.question_type) {
    return base(state, context, { strategic_action: "clarify", strategic_objective: "understand_before_acting", reason_codes: ["LOW_CONFIDENCE"], do_not_do: ["premature_close", "challenge"], push_strength: "neutral" });
  }

  const gate = closeGate(state, context);
  const soonAsk = interp && (interp.intent === "buying_signal" || interp.intent === "commitment" || interp.question_type === "logistics" || interp.future_language >= 0.4 || state.conversion?.status === "tentative");
  const meetingType = context.conversion_type ?? (context.lead_side === "buyer" ? "tour" : "walkthrough");

  const hardBlockers = ["BOUNDARY", "TRUST_COLLAPSING", "MAJOR_OBJECTION_UNRESOLVED", "DECISION_MAKER_ABSENT", "COMPLIANCE", "SENSITIVE_CONTEXT"];
  // A "maybe" to a meeting can move to a time choice unless a concern is live right now (raised in
  // the last two turns or repeated); an older side concern doesn't block a meeting the prospect is open to
  const liveObjection = Object.values(state.objections).some((o) => ["unresolved", "reactivated"].includes(o.resolution) && (o.recurrence_count >= 2 || state.counters.prospect_turns - (o.last_turn ?? 0) <= 1));
  const tentativeOk = state.conversion?.status === "tentative" && !gate.failures.some((f) => hardBlockers.includes(f) && !(f === "MAJOR_OBJECTION_UNRESOLVED" && !liveObjection));
  if (soonAsk) {
    // A real question about how it works gets answered first, with the next step attached
    if (gate.open && (interp?.question_type === "evaluation" || interp?.question_type === "clarification") && !interp?.meeting?.type) {
      return base(state, context, { strategic_action: "educate", secondary_action: "close", strategic_objective: "answer_question_then_advance", reason_codes: ["PROSPECT_QUESTION", "CLOSE_GATE_OPEN"], do_not_do: ["invent_facts", "stack_closes"], urgency: "immediate", push_strength: "answer_then_ask" });
    }
    if (gate.open || tentativeOk) {
      const vague = state.conversion?.status === "tentative" && !state.conversion.has_time;
      return base(state, context, { strategic_action: "close", strategic_objective: `earn_${state.conversion?.conversion_type ?? meetingType}`, reason_codes: ["CLOSE_GATE_OPEN", vague ? "AGREEABLE_BUT_VAGUE" : "READY_FOR_DIRECT_ASK"], do_not_do: ["stack_closes", "pressure"], urgency: "immediate", push_strength: vague ? "two_window_choice" : "direct_meeting_ask" });
    }
    if (gate.failures.includes("DECISION_MAKER_ABSENT")) {
      return base(state, context, { strategic_action: "question", secondary_action: "close", strategic_objective: "involve_decision_maker", reason_codes: ["DECISION_MAKER_ABSENT", ...gate.failures.map((f) => `GATE_${f}`)], do_not_do: ["premature_close", "push_for_decision_now"], urgency: "immediate", push_strength: "include_decision_maker" });
    }
    if (gate.failures.includes("MAJOR_OBJECTION_UNRESOLVED")) {
      const open = Object.values(state.objections).find((o) => ["unresolved", "reactivated"].includes(o.resolution));
      if (open) return objectionDecision(state, context, open, ["ENGAGED_BUT_OBJECTION_OPEN", "GATE_MAJOR_OBJECTION_UNRESOLVED"]);
    }
  }

  // The prospect asked something: answer truthfully, use AI Training only for facts (Spec 02 §6)
  if (interp?.question_type && interp.question_type !== "hostile") {
    const factual = matchesAny(state.last_turn?.text ?? "", FACT_QUESTIONS);
    return base(state, context, { strategic_action: "educate", secondary_action: gate.open ? "close" : "question", strategic_objective: "answer_question_then_advance", reason_codes: ["PROSPECT_QUESTION", ...(factual ? ["FACTUAL_QUESTION"] : [])], do_not_do: ["invent_facts", ...(gate.open ? [] : ["premature_close"])], retrieval_needed: factual, required_facts: factual ? [{ topic: "rep_or_company", question: state.last_turn.text }] : [], urgency: "immediate" });
  }
  if (interp?.question_type === "hostile") {
    return base(state, context, { strategic_action: "acknowledge", secondary_action: "clarify", strategic_objective: "lower_defensiveness", reason_codes: ["HOSTILE_QUESTION"], do_not_do: ["argue", "challenge", "premature_close"], urgency: "immediate", push_strength: "protect_and_clarify" });
  }

  // Friendly with no operational movement: discover, don't close (scenario 7)
  if (interp && ["curiosity", "agreement", "statement"].includes(interp.intent) && interp.sentiment >= 0) {
    const sensitive = Boolean(state.sensitive_context);
    const action = sensitive ? "acknowledge" : state.conversation_stage.value === "opening" ? "question" : state.running.value_recognition > 0.5 && gate.open ? "future_pace" : "question";
    const guarded = interp.word_count <= 4 && !interp.agreement && interp.disclosure < 0.2;
    let objective = sensitive ? "protect_trust_and_understand" : guarded ? "invite_them_to_open_up" : state.conversation_stage.value === "opening" ? "open_discovery" : "discover_operational_need";
    let chosen = action;
    // They just answered the same question in detail: build on it instead of asking it again (Spec 05 §9)
    if (last && last.objective === objective && last.action === action && (interp.specificity >= 0.3 || interp.disclosure >= 0.3 || interp.problem_clarity > 0) && !sensitive) {
      chosen = "mirror";
      objective = "reflect_and_deepen";
    }
    return base(state, context, { strategic_action: chosen, strategic_objective: objective, reason_codes: [interp.sentiment > 0.2 ? "POSITIVE_WITHOUT_MOVEMENT" : "CONTINUE_DISCOVERY", ...(sensitive ? ["SENSITIVE_CONTEXT"] : []), ...(chosen === "mirror" ? ["AVOID_REPEATING_QUESTION"] : [])], do_not_do: ["premature_close", "repeat_last_question", ...(sensitive ? ["pressure", "challenge"] : [])], push_strength: sensitive ? "protect_and_clarify" : "discover" });
  }
  if (interp?.intent === "rejection") {
    return base(state, context, { strategic_action: "acknowledge", secondary_action: "clarify", strategic_objective: "understand_the_no_without_pressure", reason_codes: ["SOFT_NO"], do_not_do: ["pressure", "stack_closes", "challenge"], push_strength: "respect_and_clarify" });
  }
  if ((interp?.intent === "concern" || interp?.intent === "statement") && interp.word_count <= 4 && !interp.objection && !interp.learning_candidate) {
    return base(state, context, { strategic_action: "question", strategic_objective: "invite_them_to_open_up", reason_codes: ["SHORT_GUARDED_REPLY"], do_not_do: ["premature_close", "pitch"], push_strength: "protect_and_clarify" });
  }
  if (interp?.intent === "concern" || interp?.intent === "resistance") {
    return base(state, context, { strategic_action: "validate", secondary_action: "clarify", strategic_objective: "diagnose_the_real_concern", reason_codes: interp.learning_candidate ? ["UNCLASSIFIED_CONCERN", "LEARNING_CANDIDATE"] : ["CONCERN"], do_not_do: ["premature_close", "invent_facts"], urgency: "immediate", push_strength: "protect_and_clarify" });
  }
  return base(state, context, { strategic_action: "question", strategic_objective: "deepen_discovery", reason_codes: ["DEFAULT_DISCOVERY"], do_not_do: ["premature_close"] });
}
