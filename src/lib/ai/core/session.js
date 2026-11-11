// One live (or replayed) call: the Spec 11 §3 event loop.
//   transcript event → dedupe → features → interpretation → state (version+1) → observation →
//   stale-prompt invalidation → decision → (retrieval) → LLM line → stale check → display
// Async generation is version-aware: a line for an old moment is cancelled, never shown (§10).
// Every step is logged with event → state_version → decision → prompt lineage and latency (§12).

import { createFeatureEngine } from "./features.js";
import { interpretRules } from "./interpret.js";
import { createConversationState, applyTurn, recordStrategy, applyCompliance, trustGain } from "./state.js";
import { decide } from "./decision.js";
import { retrieve, hasVerifiedProof } from "./retrieval.js";
import { buildGenerationInput, generateLine } from "./llm-gateway.js";
import { observeRep, finalizeOutcome } from "./observation.js";
import { calibrationProfile } from "../config/calibration-profiles.js";
import { SCORING } from "../config/scoring.js";
import { makeId } from "./text.js";

const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

// Provider events → provider-neutral TranscriptEvent (Spec 11 §4.1)
export function normalizeEvent(raw, callId) {
  const speaker = ["prospect", "rep"].includes(raw.speaker) ? raw.speaker : "unknown";
  return {
    event_id: raw.event_id ?? makeId("evt"),
    call_id: raw.call_id ?? callId,
    provider: raw.provider ?? "replay",
    speaker,
    utterance_text: String(raw.utterance_text ?? raw.text ?? ""),
    utterance_start_ms: Number(raw.utterance_start_ms ?? raw.start_ms ?? 0),
    utterance_end_ms: Number(raw.utterance_end_ms ?? raw.end_ms ?? raw.utterance_start_ms ?? 0),
    words: Array.isArray(raw.words) ? raw.words : [],
    asr_confidence: typeof raw.asr_confidence === "number" ? raw.asr_confidence : 0.9,
    is_final: raw.is_final !== false,
    received_at: raw.received_at ?? new Date().toISOString(),
  };
}

export function createCallSession({ context = {}, llm, interpreter = null, knowledge = [], staleAfterMs = SCORING.timing.staleAfterMs, onPrompt = null, onCancel = null } = {}) {
  if (!llm) throw new Error("createCallSession needs an llm provider (use mockProvider() without keys)");
  const callId = context.call_id ?? makeId("call");
  const profile = context.calibration_profile ?? calibrationProfile(context.calibration_score);
  const scope = { user_id: context.user_id ?? null, organization_id: context.organization_id ?? null };
  const coreContext = { profile, playbook: context.playbook ?? null, has_verified_proof: hasVerifiedProof(knowledge, scope), lead_side: context.lead_side ?? "seller", prospect_name: context.prospect_name ?? null, prospect_history: context.prospect_history ?? null, compliance: context.compliance ?? null, conversion_type: context.conversion_type ?? null, previousRepTurn: null };

  let state = createConversationState({ ...context, call_id: callId, calibration_profile: profile });
  const features = createFeatureEngine();
  const seen = new Set();
  const turns = [];
  const decisions = [];
  const prompts = [];
  const outcomes = [];
  const complianceEvents = [];
  const lineage = [];
  const timeline = [];
  let materialVersion = 0; // bumps only on semantically material changes
  let pending = null; // { decision, prompt, controller, materialVersion, startedAt }
  let displayed = null; // last displayed prompt still awaiting the rep
  let awaitingReaction = null; // { outcome, before, repTurnId }
  let ended = false;

  const snapshot = (s, atMs, eventId) => ({ state_version: s.state_version, at_ms: atMs, event_id: eventId, stage: s.conversation_stage.value, intent: s.primary_intent.value, objection: s.objection_state ? { id: s.objection_state.objection_id, resolution: s.objection_state.resolution, recurrence: s.objection_state.recurrence_count } : null, trust: s.trust_state.score, engagement: s.engagement_state.score, momentum: s.momentum_state.score, momentum_trend: s.momentum_state.trend, readiness: s.readiness_state.overall, emotion: s.emotion_state.top_states, valence: s.emotion_state.valence, tension: s.tension_state.score, pacing: s.counters.rep_turns ? s.pacing_state.rep_alignment_score : null, conversion: s.conversion?.status ?? null });

  function cancelPending(reason) {
    if (!pending) return;
    pending.controller.abort();
    pending.prompt.status = "cancelled";
    pending.prompt.cancel_reason = reason;
    onCancel?.(pending.prompt);
    pending = null;
  }

  async function interpret(text, speaker) {
    const started = now();
    let result;
    if (interpreter) {
      try {
        result = await interpreter(text, { speaker, state });
      } catch {
        result = null;
      }
    }
    if (!result) result = interpretRules(text, { speaker, state });
    return { result, ms: now() - started };
  }

  async function startGeneration(decision, atMs) {
    const prompt = { prompt_id: makeId("prm"), decision_id: decision.decision_id, source_state_version: decision.source_state_version, text: null, strategic_action: decision.strategic_action, strategic_objective: decision.strategic_objective, generated_at: null, displayed_at: null, status: "generating", expires_at: null, latency: {} };
    prompts.push(prompt);
    const controller = new AbortController();
    const mine = { decision, prompt, controller, materialVersion, startedAt: now() };
    pending = mine;

    let facts = [];
    let conflicts = [];
    if (decision.retrieval_needed) {
      const t = now();
      const found = retrieve(knowledge, { question: decision.required_facts.map((f) => f.question).join(" "), topic: decision.required_facts[0]?.topic, scope });
      facts = found.facts;
      conflicts = found.conflicts;
      prompt.latency.retrieval_ms = Math.round(now() - t);
      prompt.retrieval = { source_ids: facts.map((f) => f.source_id), conflicts };
    }
    const input = buildGenerationInput({ decision, state, context: coreContext, facts, conflicts, turns });
    const generated = await generateLine(llm, input, decision, { timeoutMs: staleAfterMs, signal: controller.signal });
    prompt.latency.llm_ms = generated.latency_ms;
    prompt.model = generated.model;
    prompt.generation_issues = generated.issues;

    if (pending !== mine) return prompt; // cancelled meanwhile (status already set)
    pending = null;
    const age = now() - mine.startedAt;
    // Stale rules: the moment changed, or the line missed its moment (Spec 11 §10, scenario 30)
    if (!generated.valid) {
      prompt.status = "cancelled";
      prompt.cancel_reason = `GENERATION_${(generated.issues[0] ?? "invalid").toUpperCase()}`;
      onCancel?.(prompt);
      return prompt;
    }
    if (materialVersion !== mine.materialVersion) {
      prompt.status = "stale";
      prompt.cancel_reason = "STATE_CHANGED_MATERIALLY";
      onCancel?.(prompt);
      return prompt;
    }
    if (age > staleAfterMs) {
      prompt.status = "stale";
      prompt.cancel_reason = "MISSED_THE_MOMENT";
      onCancel?.(prompt);
      return prompt;
    }
    prompt.text = generated.text;
    prompt.generated_at = new Date().toISOString();
    prompt.displayed_at = prompt.generated_at;
    prompt.status = "displayed";
    prompt.latency.decision_to_display_ms = Math.round(age);
    state = recordStrategy(state, decision, atMs);
    state.prompt_state = { last_prompt_id: displayed?.prompt_id ?? null, current_prompt_id: prompt.prompt_id, shown_at_ms: atMs, status: "displayed" };
    displayed = prompt;
    lineage.push({ decision_id: decision.decision_id, prompt_id: prompt.prompt_id, state_version: decision.source_state_version, status: "displayed" });
    onPrompt?.(prompt);
    return prompt;
  }

  // Process one transcript event. `awaitPrompt: false` returns before the line is generated.
  async function ingest(raw, { awaitPrompt = true } = {}) {
    if (ended) return { ignored: "call_ended" };
    const event = normalizeEvent(raw, callId);
    if (seen.has(event.event_id)) return { duplicate: true, state }; // idempotent (Spec 11 §5)
    if (!event.is_final) return { partial: true, state };
    seen.add(event.event_id);
    const t0 = now();

    const { result: interp, ms: interpretMs } = await interpret(event.utterance_text, event.speaker);
    const t1 = now();
    const feature = features.update(event);
    const before = state;
    const prospectWasDisclosing = before.last_turn?.speaker === "prospect" && (before.last_turn.disclosure > 0.3 || ["objection", "concern"].includes(before.last_turn.intent));
    const applied = applyTurn(state, { event, interp, features: feature, profile, rates: { prospect: features.rateOf("prospect"), rep: features.rateOf("rep") } });
    state = applied.state;
    const stateMs = now() - t1;
    turns.push({ turn_id: event.event_id, speaker: event.speaker, text: event.utterance_text, start_ms: event.utterance_start_ms, end_ms: event.utterance_end_ms, intent: interp.intent, interpretation_source: interp.source, asr_confidence: event.asr_confidence });
    timeline.push(snapshot(state, event.utterance_end_ms, event.event_id));
    if (applied.material.length) materialVersion += 1;

    // Observation: rep vs the displayed prompt, then the prospect's reaction
    let outcome = null;
    if (event.speaker === "rep") {
      coreContext.previousRepTurn = { interrupted: feature.interrupted, prospectWasDisclosing };
      // The rep already started a real answer before the line was ready: it's no longer usable
      if (pending && interp.word_count > 3) cancelPending("REP_ALREADY_RESPONDING");
      if (displayed && displayed.status === "displayed") {
        const provisional = observeRep(displayed, event.utterance_text, { interrupted: feature.interrupted });
        displayed.status = provisional.rep_behavior === "deviation_pending" ? "skipped" : "consumed";
        awaitingReaction = { outcome: provisional, before, repTurnId: event.event_id };
        displayed = null;
      }
    } else if (event.speaker === "prospect") {
      if (awaitingReaction) {
        outcome = finalizeOutcome(awaitingReaction.outcome, awaitingReaction.before, state, { repTurnId: awaitingReaction.repTurnId, prospectTurnId: event.event_id });
        outcomes.push(outcome);
        const last = [...state.strategy_history].reverse().find((s) => s.result === null);
        if (last) last.result = { rep_behavior: outcome.rep_behavior, delta: outcome.observed_state_delta };
        awaitingReaction = null;
      }
      if (pending && applied.material.length) cancelPending(`PROSPECT_${applied.material[0]}`);
    }

    const t2 = now();
    const decision = decide(state, coreContext, { interp, material: applied.material, objection: applied.objection, nowMs: event.utterance_end_ms });
    const decisionMs = now() - t2;
    decisions.push(decision);
    if (event.speaker === "prospect") coreContext.previousRepTurn = null;
    lineage.push({ event_id: event.event_id, state_version: state.state_version, decision_id: decision.decision_id, should_prompt: decision.should_prompt, action: decision.strategic_action });

    let generation = null;
    if (decision.should_prompt) {
      if (pending) cancelPending("SUPERSEDED_BY_NEW_DECISION");
      generation = startGeneration(decision, event.utterance_end_ms);
    }
    const latency = { interpretation_ms: Math.round(interpretMs), state_ms: Math.round(stateMs), decision_ms: Math.round(decisionMs), intake_to_decision_ms: Math.round(now() - t0) };
    const prompt = generation && awaitPrompt ? await generation : null;
    return { event, interp, features: feature, state, material: applied.material, objection: applied.objection, decision, prompt, generation, outcome, latency };
  }

  function compliance(eventType, details = {}, atMs = null) {
    const record = { event_type: eventType, occurred_at: new Date().toISOString(), at_ms: atMs, source_turn_ids: details.source_turn_ids ?? [], details };
    complianceEvents.push(record);
    state = applyCompliance(state, record);
    materialVersion += 1;
    if (!state.compliance_state.ai_processing_allowed) cancelPending("COMPLIANCE_STOP");
    return record;
  }

  // Spec 01 §14 / Spec 11 step 16: freeze the call and hand everything to post-call analysis
  function end({ reason = "hangup", abrupt = false } = {}) {
    cancelPending(abrupt ? "CALL_DISCONNECTED" : "CALL_ENDED");
    ended = true;
    const promptLatencies = prompts.filter((p) => p.latency.decision_to_display_ms !== undefined).map((p) => p.latency.decision_to_display_ms);
    return {
      call_id: callId,
      ended_reason: reason,
      incomplete: abrupt,
      final_state: state,
      transcript: turns,
      prompts,
      prompt_outcomes: outcomes,
      decisions: decisions.map(({ decision_id, source_state_version, should_prompt, strategic_action, strategic_objective, reason_codes, objection_id }) => ({ decision_id, source_state_version, should_prompt, strategic_action, strategic_objective, reason_codes, objection_id })),
      state_timeline: timeline,
      evidence: state.evidence,
      trust_gain: trustGain(state),
      objections: Object.values(state.objections),
      conversion: state.conversion,
      micro_commitments: state.micro_commitments,
      follow_up_obligations: state.unresolved_items,
      compliance_events: complianceEvents,
      learning_candidates: state.learning_candidates,
      lineage,
      latency: { prompts_displayed: promptLatencies.length, median_decision_to_display_ms: promptLatencies.length ? promptLatencies.sort((a, b) => a - b)[Math.floor(promptLatencies.length / 2)] : null, cancelled: prompts.filter((p) => ["cancelled", "stale"].includes(p.status)).length },
      versions: { scoring: state.scoring_version, core_rules: decisions[0]?.core_rules_version ?? null, calibration_profile: profile.profile_id, playbook: state.call_context.active_playbook, playbook_version: state.call_context.playbook_version, llm: llm.name },
    };
  }

  return {
    ingest,
    compliance,
    end,
    get state() { return state; },
    get prompts() { return prompts; },
    get outcomes() { return outcomes; },
    get decisions() { return decisions; },
    get profile() { return profile; },
    get pending() { return pending?.prompt ?? null; },
  };
}
