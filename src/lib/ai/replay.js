// Deterministic replay harness (Spec 11 §13): replays a timestamped, speaker-separated scripted
// call through the real Core and checks state class, direction, strategy and prohibited behaviour,
// not exact wording. Used by tests/ai and, later, to replay real calls after tuning changes.

import { createCallSession } from "./core/session.js";
import { mockProvider } from "./providers/llm.js";

// Script event: { speaker, text, gap?: ms before it starts, wpm?, overlap?: ms it starts before
// the previous ends, asr?, words?, no_wait?, compliance?: "consent_issue"|…, expect?: {...} }
export async function replayCall(script, { llm = null } = {}) {
  const session = createCallSession({
    context: script.context ?? {},
    knowledge: script.knowledge ?? [],
    llm: llm ?? mockProvider(script.llm ?? {}),
    staleAfterMs: script.staleAfterMs,
  });
  const steps = [];
  const generations = [];
  let clock = 0;
  let index = 0;
  for (const item of script.events) {
    index += 1;
    if (item.compliance) {
      session.compliance(item.compliance, item.details ?? {}, clock);
      steps.push({ index, compliance: item.compliance, state: session.state });
      continue;
    }
    if (item.waitMs) await new Promise((resolve) => setTimeout(resolve, item.waitMs));
    const count = String(item.text).split(/\s+/).filter(Boolean).length;
    const duration = item.duration ?? Math.round((count / (item.wpm ?? (item.speaker === "rep" ? 165 : 150))) * 60_000);
    const start = item.overlap ? clock - item.overlap : clock + (item.gap ?? 700);
    const end = Math.max(start + 1, start + duration);
    clock = Math.max(clock, end);
    const result = await session.ingest(
      { event_id: item.event_id ?? `${script.id}_e${index}`, speaker: item.speaker, text: item.text, start_ms: start, end_ms: end, asr_confidence: item.asr, words: item.words },
      { awaitPrompt: !item.no_wait }
    );
    if (result.generation) generations.push(result.generation);
    steps.push({ index, item, ...result, state: session.state });
  }
  await Promise.all(generations);
  const handoff = session.end();
  return { session, steps, handoff };
}

// ── Assertions ───────────────────────────────────────────────────────────────────────────────
const get = (object, path) => path.split(".").reduce((value, key) => (value === null || value === undefined ? undefined : value[key]), object);

export function check(actual, matcher) {
  if (matcher && typeof matcher === "object" && !Array.isArray(matcher)) {
    if ("in" in matcher) return matcher.in.includes(actual);
    if ("notIn" in matcher) return !matcher.notIn.includes(actual);
    if ("includes" in matcher) return Array.isArray(actual) && actual.includes(matcher.includes);
    if ("excludes" in matcher) return !Array.isArray(actual) || !actual.includes(matcher.excludes);
    if ("not" in matcher) return actual !== matcher.not;
    if ("min" in matcher || "max" in matcher) return typeof actual === "number" && (matcher.min === undefined || actual >= matcher.min) && (matcher.max === undefined || actual <= matcher.max);
    if ("near" in matcher) return typeof actual === "number" && Math.abs(actual - matcher.near) <= (matcher.tolerance ?? 8);
    if ("exists" in matcher) return matcher.exists ? actual !== undefined && actual !== null : actual === undefined || actual === null;
  }
  if (Array.isArray(matcher)) return matcher.includes(actual);
  return actual === matcher;
}

// Returns a list of failures for one step's `expect` block
export function evaluate(step, expect) {
  const failures = [];
  const scope = { state: step.state, decision: step.decision, prompt: step.prompt, interp: step.interp, outcome: step.outcome, features: step.features };
  for (const [path, matcher] of Object.entries(expect)) {
    const actual = get(scope, path);
    if (!check(actual, matcher)) failures.push(`${path}: expected ${JSON.stringify(matcher)}, got ${JSON.stringify(actual)}`);
  }
  return failures;
}
