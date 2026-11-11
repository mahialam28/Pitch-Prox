// AI Core replay suite (Spec 11 §13): the 30 required scenarios plus unit checks for the
// calibration table, retrieval and the LLM output contract. No server, database or API keys.
//   npm run test:ai
import { test } from "node:test";
import assert from "node:assert/strict";
import { SCENARIOS } from "./scenarios.mjs";
import { replayCall, evaluate } from "../../src/lib/ai/replay.js";
import { calibrationProfile, CALIBRATION_PROFILES, DEFAULT_PROFILE } from "../../src/lib/ai/config/calibration-profiles.js";
import { validateResponse } from "../../src/lib/ai/core/llm-gateway.js";
import { retrieve } from "../../src/lib/ai/core/retrieval.js";
import { createCallSession } from "../../src/lib/ai/core/session.js";
import { mockProvider } from "../../src/lib/ai/providers/llm.js";

for (const scenario of SCENARIOS) {
  test(`scenario ${scenario.id}: ${scenario.title}`, async () => {
    const result = await replayCall(scenario);
    const failures = [];
    for (const step of result.steps) {
      if (!step.item?.expect) continue;
      for (const failure of evaluate(step, step.item.expect)) failures.push(`event ${step.index} ("${step.item.text.slice(0, 40)}…") ${failure}`);
    }
    assert.deepEqual(failures, []);
    if (scenario.final) await scenario.final(result, assert, { replayCall });
  });
}

test("calibration: every score 44–99 maps to a profile; no pass/fail; reproducible", () => {
  for (let score = 44; score <= 99; score += 1) assert.ok(CALIBRATION_PROFILES[score].profile_id.startsWith(`CAL_${score}_`));
  assert.equal(calibrationProfile(47).profile_id, "CAL_47_EMPATHY_HIGH_PACING");
  assert.deepEqual(calibrationProfile(61), calibrationProfile(61));
  assert.equal(calibrationProfile(null), DEFAULT_PROFILE);
  assert.equal(calibrationProfile(100).score, 99, "score 100 waits for approval (Spec 04 §16.3)");
  assert.ok(!JSON.stringify(CALIBRATION_PROFILES).match(/pass|fail/i));
});

test("LLM output contract: labels removed, length enforced, option lists rejected", () => {
  const decision = { max_prompt_words: 12 };
  assert.equal(validateResponse('{"response_text":"Prompt: What matters most to you?"}', decision).text, "What matters most to you?");
  const long = validateResponse("That makes sense. When you think about the timing, what would need to happen first for you to feel ready to move?", decision);
  assert.ok(long.text.split(" ").length <= 12 && long.issues.includes("trimmed_to_limit"));
  assert.equal(validateResponse("Option 1: ask about price. Option 2: ask about timing.", decision).valid, false);
});

test("retrieval: other users' and deleted knowledge never returned; unverified performance claims ignored", () => {
  const knowledge = [
    { knowledge_id: "mine", owner_scope: "user", owner_id: "u1", organization_id: "o1", knowledge_class: "profile", verification_status: "user_supplied", topic_tags: ["experience"], text: "I have sold homes in Oak Park for eight years." },
    { knowledge_id: "theirs", owner_scope: "user", owner_id: "u2", organization_id: "o1", knowledge_class: "profile", verification_status: "user_supplied", topic_tags: ["experience"], text: "I have sold homes in Oak Park for twenty years." },
    { knowledge_id: "deleted", owner_scope: "user", owner_id: "u1", organization_id: "o1", deleted: true, knowledge_class: "profile", verification_status: "user_supplied", topic_tags: ["experience"], text: "I have sold homes in Oak Park for nine years." },
    { knowledge_id: "claim", owner_scope: "user", owner_id: "u1", organization_id: "o1", knowledge_class: "performance", verification_status: "user_supplied", topic_tags: ["experience"], text: "I sold 200 homes in Oak Park last year." },
  ];
  const { facts } = retrieve(knowledge, { question: "how long have you sold homes in Oak Park", scope: { user_id: "u1", organization_id: "o1" } });
  assert.deepEqual(facts.map((f) => f.source_id), ["mine"]);
});

test("state: duplicate provider events are ignored and versions only go up", async () => {
  const session = createCallSession({ llm: mockProvider() });
  const event = { event_id: "dup1", speaker: "prospect", text: "The commission is too high.", start_ms: 0, end_ms: 1500 };
  const first = await session.ingest(event);
  const again = await session.ingest(event);
  assert.equal(again.duplicate, true);
  assert.equal(session.state.objection_state.recurrence_count, 1);
  assert.ok(session.state.state_version >= first.state.state_version);
});

test("post-call handoff can explain the major trust changes", async () => {
  const result = await replayCall(SCENARIOS.find((s) => s.id === "02_expired_guarded_then_discloses"));
  const trustEvidence = result.handoff.evidence.filter((e) => e.metric === "trust");
  assert.ok(trustEvidence.length > 0, "trust movements recorded");
  for (const item of trustEvidence) {
    assert.ok(item.source_turn_id && item.reason && item.scoring_version, "each has a source turn, reason and version");
  }
  assert.ok(result.handoff.lineage.some((l) => l.prompt_id), "event → decision → prompt lineage kept");
});

test("LLM interpreter: model labels are used; slow/invalid output falls back to the rules", async () => {
  const { llmInterpreter } = await import("../../src/lib/ai/core/interpret-llm.js");
  const fake = (reply, delay = 0) => ({ name: "fake", configured: true, generate: async () => { if (delay) await new Promise((r) => setTimeout(r, delay)); return { text: reply }; } });
  const labelled = await llmInterpreter(fake(JSON.stringify({ intent: "objection", objection_id: "relationship:existing", sentiment: -0.2, confidence: 0.85 })))("My nephew just got his license, so we're kind of covered.", { speaker: "prospect", state: null });
  assert.equal(labelled.source, "llm");
  assert.equal(labelled.objection.id, "relationship:existing", "context the keyword rules can't see");
  const invalid = await llmInterpreter(fake("not json"))("The commission is too high.", { speaker: "prospect", state: null });
  assert.equal(invalid.source, "rules");
  assert.equal(invalid.objection.id, "financial:commission");
  const slow = await llmInterpreter({ name: "slow", configured: true, generate: () => new Promise(() => {}) }, { timeoutMs: 20 });
  const fallback = await Promise.race([slow("The commission is too high.", { speaker: "prospect", state: null }), new Promise((r) => setTimeout(() => r("hung"), 200))]);
  assert.notEqual(fallback, "hung", "a hanging provider must not hang the call");
});
