// PitchProX call service (AI phase 2). Holds the live connection for each call and runs the AI Core.
//
//   npm run calls                       # development (port 3010)
//   pm2 start ecosystem.config.cjs      # production: the "pitchprox-calls" app
//
// The browser connects to ws(s)://<service>/?token=… with the token from POST /api/v1/calls. The
// service loads the call's context from the app, runs the Core on every utterance and streams the
// transcript, the teleprompter line, session status and live metrics back. When the call ends it
// hands the post-call record to the app (POST /api/v1/internal/calls/:id/complete).
//
// Practice calls: a scripted prospect (or the user typing the prospect's side) stands in for the
// phone audio, so live coaching can be seen before Twilio is connected (AI-3 adds real calls here).
//
// Settings (.env.local): CALL_SERVICE_SECRET (same as the app), CALL_SERVICE_PORT (3010),
// CALL_SERVICE_APP_URL (how to reach the app; defaults to APP_URL), OPENAI_API_KEY / AI_* (optional).

import http from "node:http";
import { WebSocketServer } from "ws";

try {
  process.loadEnvFile(new URL("../.env.local", import.meta.url));
} catch {
  /* settings come from the environment */
}

const { verifyCallToken, callServiceSecret, SERVICE_HEADER } = await import("../src/lib/ai/call-token.js");
const { createCallSession } = await import("../src/lib/ai/core/session.js");
const { defaultLlmProvider } = await import("../src/lib/ai/providers/llm.js");
const { llmInterpreter } = await import("../src/lib/ai/core/interpret-llm.js");
const { practiceScript } = await import("../src/lib/ai/practice-scripts.js");

const PORT = Number(process.env.CALL_SERVICE_PORT || 3010);
const APP_URL = (process.env.CALL_SERVICE_APP_URL || process.env.APP_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const SECRET = callServiceSecret();
const IDLE_LIMIT_MS = 15 * 60_000;
const MAX_CALL_MS = 2 * 60 * 60_000;
const PROSPECT_DELAY_MS = Number(process.env.PRACTICE_PROSPECT_DELAY_MS ?? 1400);
const llm = defaultLlmProvider();
const interpreter = llm.configured && !llm.name.startsWith("mock") ? llmInterpreter(llm) : null;
const calls = new Map(); // callId → call

const log = (...args) => console.log(new Date().toISOString(), ...args);

async function app(path, { method = "GET", body } = {}) {
  const response = await fetch(`${APP_URL}${path}`, { method, headers: { [SERVICE_HEADER]: SECRET, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `App answered ${response.status}`);
  return data;
}

// ── What the screen shows (rounded, with honest labels when confidence is low) ──
function metricsOf(session) {
  const s = session.state;
  const outcomes = session.outcomes;
  const adherence = outcomes.length ? Math.round((outcomes.reduce((sum, o) => sum + o.adherence_score, 0) / outcomes.length) * 100) : null;
  const emotionKnown = s.emotion_state.confidence >= 0.45;
  const valence = s.emotion_state.valence;
  const pacing = s.pacing_state.rep_alignment_score;
  const objection = s.objection_state && s.objection_state.resolution !== "boundary" ? s.objection_state : null;
  return {
    stage: s.conversation_stage.value,
    trust: Math.round(s.trust_state.score),
    trustTrend: s.trust_state.trend,
    trustConfident: s.trust_state.confidence >= 0.45,
    engagement: Math.round(s.engagement_state.score),
    momentum: Math.round(s.momentum_state.score),
    momentumTrend: s.momentum_state.trend,
    readiness: s.readiness_state.overall,
    readinessLevel: s.readiness_state.level,
    objection: objection ? { label: objection.label, resolution: objection.resolution, times: objection.recurrence_count, root: objection.root_categories?.[0] ?? null } : null,
    // Sentiment = positive/negative wording (valence); "Unclear" only before the prospect has spoken
    // or with poor transcription. Emotion labels below need more confidence (Spec 08 §9).
    sentiment: s.counters.prospect_turns === 0 ? "Unclear" : valence > 12 ? "Positive" : valence < -12 ? "Negative" : "Neutral",
    emotion: emotionKnown ? s.emotion_state.top_states[0]?.state ?? null : null,
    pacing: s.counters.rep_turns === 0 ? null : { score: Math.round(pacing), label: pacing >= 75 ? "In sync" : pacing >= 55 ? "Slightly off" : "Off pace" },
    adherence,
    conversion: s.conversion ? { type: s.conversion.conversion_type, status: s.conversion.status } : null,
    boundary: s.boundary?.type ?? null,
    aiAllowed: s.compliance_state.ai_processing_allowed,
    disclosureGiven: s.compliance_state.disclosure_given,
  };
}

function send(call, message) {
  if (call.socket.readyState === 1) call.socket.send(JSON.stringify(message));
}

const wordsOf = (text) => String(text).trim().split(/\s+/).filter(Boolean).length;

// One utterance through the Core; messages for the same call are processed strictly in order
function enqueue(call, task) {
  call.queue = call.queue.then(task).catch((error) => {
    log("call", call.id, "error", error.message);
    send(call, { type: "error", message: "Something went wrong with the AI. The call continues." });
  });
  return call.queue;
}

async function utterance(call, speaker, text) {
  const clean = String(text ?? "").trim().slice(0, 1000);
  if (!clean || call.ended) return;
  call.lastActivity = Date.now();
  const end = Date.now() - call.startedAt;
  const start = Math.max(call.lastEndMs + 200, end - Math.round((wordsOf(clean) / 150) * 60_000));
  call.lastEndMs = end;
  call.seq += 1;
  const eventId = `${call.id}_${call.seq}`;
  send(call, { type: "turn", turn: { id: eventId, speaker, text: clean, atMs: end } });
  if (speaker === "prospect") send(call, { type: "status", status: "thinking" });
  // The line is written in the background: a newer utterance can still cancel it (Spec 11 §10)
  const result = await call.session.ingest({ event_id: eventId, speaker, text: clean, start_ms: start, end_ms: end, provider: call.mode === "practice" ? "practice" : "live" }, { awaitPrompt: false });
  if (result.duplicate) return;
  send(call, { type: "metrics", metrics: metricsOf(call.session) });
  const decision = result.decision;
  if (decision?.should_prompt) send(call, { type: "status", status: "thinking", action: decision.strategic_action });
  else send(call, { type: "status", status: idleStatus(call), reason: decision?.reason_codes?.[0] ?? null });
}

const idleStatus = (call) => (!call.session.state.compliance_state.ai_processing_allowed ? "ai_paused" : call.session.state.boundary ? "boundary" : "listening");

function scheduleProspect(call) {
  if (call.mode !== "practice" || !call.script || call.ended) return;
  const line = call.script.lines[call.scriptIndex];
  if (!line) {
    send(call, { type: "status", status: "script_finished" });
    return;
  }
  call.scriptIndex += 1;
  clearTimeout(call.prospectTimer);
  call.prospectTimer = setTimeout(() => enqueue(call, () => utterance(call, "prospect", line)), PROSPECT_DELAY_MS);
}

async function endCall(call, { reason = "hangup", abrupt = false } = {}) {
  if (call.ended) return;
  call.ended = true;
  clearTimeout(call.prospectTimer);
  clearInterval(call.watchdog);
  await call.queue.catch(() => {});
  const handoff = call.session.end({ reason, abrupt });
  let summary = null;
  try {
    const result = await app(`/api/v1/internal/calls/${encodeURIComponent(call.id)}/complete`, { method: "POST", body: { handoff, endedReason: reason } });
    summary = result.summary ?? null;
  } catch (error) {
    log("call", call.id, "could not save the call:", error.message);
  }
  send(call, { type: "ended", callId: call.id, summary });
  calls.delete(call.id);
  log("call", call.id, "ended", reason, `${handoff.transcript.length} turns, ${handoff.prompts.filter((p) => p.status !== "cancelled" && p.status !== "stale").length} prompts`);
  if (call.socket.readyState === 1) call.socket.close(1000, "call ended");
}

async function openCall(socket, token) {
  const claims = verifyCallToken(token, SECRET);
  if (!claims) {
    socket.close(4401, "invalid or expired token");
    return;
  }
  if (calls.has(claims.callId)) {
    socket.close(4409, "this call is already open in another window");
    return;
  }
  let context;
  try {
    ({ context } = await app(`/api/v1/internal/calls/${encodeURIComponent(claims.callId)}`));
  } catch (error) {
    socket.close(4404, error.message.slice(0, 100));
    return;
  }
  if (context.user_id !== claims.userId) {
    socket.close(4403, "not your call");
    return;
  }

  const call = {
    id: claims.callId,
    socket,
    mode: context.mode,
    script: context.practice?.script_id ? practiceScript(context.practice.script_id) : null,
    scriptIndex: 0,
    startedAt: Date.now(),
    lastActivity: Date.now(),
    lastEndMs: 0,
    seq: 0,
    queue: Promise.resolve(),
    ended: false,
  };
  call.session = createCallSession({
    context: { ...context, conversion_type: null },
    llm,
    interpreter,
    knowledge: [], // AI Training retrieval arrives in AI-5
    onPrompt: (prompt) => {
      send(call, { type: "prompt", prompt: { id: prompt.prompt_id, text: prompt.text, action: prompt.strategic_action, objective: prompt.strategic_objective, latencyMs: prompt.latency.decision_to_display_ms } });
      send(call, { type: "status", status: "prompt_ready" });
    },
    onCancel: (prompt) => {
      send(call, { type: "prompt_cancelled", id: prompt.prompt_id, reason: prompt.cancel_reason });
      if (!call.session.pending) send(call, { type: "status", status: idleStatus(call) });
    },
  });
  calls.set(call.id, call);
  call.watchdog = setInterval(() => {
    if (Date.now() - call.lastActivity > IDLE_LIMIT_MS) endCall(call, { reason: "idle_timeout", abrupt: true });
    else if (Date.now() - call.startedAt > MAX_CALL_MS) endCall(call, { reason: "max_duration" });
  }, 30_000);

  const opener = call.script ? call.script.opener.replace("{rep}", String(context.rep_name ?? "").split(" ")[0] || "me").replace("{company}", context.company || "our team") : null;
  send(call, {
    type: "ready",
    call: { id: call.id, mode: call.mode, prospectName: context.prospect_name, leadType: context.lead_type_label, playbook: context.playbook_name, disclosure: context.disclosure, calibrationProfile: call.session.profile.prompting_level, ai: llm.name.startsWith("mock") ? "demo" : "live", practice: call.mode === "practice" ? { scenario: call.script?.title ?? "Role-play", roleplay: !call.script } : null, hasPriorCalls: Boolean(context.prospect_history) },
    opener,
    metrics: metricsOf(call.session),
  });
  log("call", call.id, "opened", call.mode, call.script?.id ?? "", `llm=${llm.name}`);

  socket.on("message", (raw) => {
    let message;
    try {
      message = JSON.parse(String(raw));
    } catch {
      return;
    }
    call.lastActivity = Date.now();
    switch (message.type) {
      case "rep_said":
        enqueue(call, async () => {
          await utterance(call, "rep", message.text);
          scheduleProspect(call);
        });
        break;
      case "prospect_said":
        if (call.mode === "practice") enqueue(call, () => utterance(call, "prospect", message.text));
        break;
      case "disclosure_read":
        enqueue(call, async () => {
          call.session.compliance("disclosure_detected", { by: "rep_confirmed" }, Date.now() - call.startedAt);
          send(call, { type: "metrics", metrics: metricsOf(call.session) });
        });
        break;
      case "stop_ai":
      case "resume_ai":
        enqueue(call, async () => {
          call.session.compliance(message.type === "stop_ai" ? "ai_stopped" : "ai_resumed", { by: "rep" }, Date.now() - call.startedAt);
          send(call, { type: "metrics", metrics: metricsOf(call.session) });
          send(call, { type: "status", status: message.type === "stop_ai" ? "ai_paused" : "listening" });
        });
        break;
      case "end":
        endCall(call, { reason: "hangup" });
        break;
      case "ping":
        send(call, { type: "pong" });
        break;
      default:
        break;
    }
  });
  socket.on("close", () => endCall(call, { reason: "disconnected", abrupt: true }));
}

const server = http.createServer((request, response) => {
  if (request.url === "/health") {
    response.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-store" });
    response.end(JSON.stringify({ status: "ok", activeCalls: calls.size, llm: llm.name.startsWith("mock") ? "mock" : "configured" }));
    return;
  }
  response.writeHead(404).end();
});

const wss = new WebSocketServer({ server, maxPayload: 64 * 1024 });
wss.on("connection", (socket, request) => {
  const token = new URL(request.url, "http://localhost").searchParams.get("token");
  openCall(socket, token).catch((error) => {
    log("open failed", error.message);
    socket.close(1011, "could not open the call");
  });
});

server.listen(PORT, process.env.CALL_SERVICE_HOST || "127.0.0.1", () => log(`PitchProX call service on :${PORT} (app: ${APP_URL}, llm: ${llm.name})`));

// Finish open calls cleanly on restart/deploy
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    await Promise.all([...calls.values()].map((call) => endCall(call, { reason: "service_restart", abrupt: true })));
    process.exit(0);
  });
}
