// AI phase 2: starting calls, the call service over WebSocket, saving the call, usage and events.
// This file starts the real call service on :3011 against the test server (CALL_SERVICE_SECRET and
// test Twilio settings come from `npm run test:server`).
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { BASE, RUN, newCustomer, actor } from "./helpers.mjs";
import { replayCall } from "../../src/lib/ai/replay.js";
import { SCENARIOS } from "../ai/scenarios.mjs";
import mysql from "mysql2/promise";

try {
  process.loadEnvFile(new URL("../../.env.local", import.meta.url));
} catch {
  /* CI provides MYSQL_* */
}
const db = await mysql.createConnection({ host: process.env.MYSQL_HOST || "127.0.0.1", port: Number(process.env.MYSQL_PORT || 3306), user: process.env.MYSQL_USER, password: process.env.MYSQL_PASSWORD, database: process.env.MYSQL_DATABASE || "pitchprox_test" });

const SECRET = "test-call-secret";
const PORT = 3011;
const service = spawn(process.execPath, ["--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", fileURLToPath(new URL("../../services/call-service.mjs", import.meta.url))], {
  env: { ...process.env, CALL_SERVICE_PORT: String(PORT), CALL_SERVICE_APP_URL: BASE, CALL_SERVICE_SECRET: SECRET, PRACTICE_PROSPECT_DELAY_MS: "20", OPENAI_API_KEY: "", ANTHROPIC_API_KEY: "" },
  stdio: "ignore",
});
after(async () => {
  service.kill();
  await db.end();
});
for (let i = 0; i < 50; i += 1) {
  try {
    if ((await fetch(`http://127.0.0.1:${PORT}/health`)).ok) break;
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

const caller = await newCustomer("caller");
await caller.post("/api/v1/calibration/sessions", { durationSeconds: 120, roundsCompleted: 3 });
const internal = (path, body) => fetch(`${BASE}${path}`, { method: body ? "POST" : "GET", headers: { "x-call-service-secret": SECRET, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });

// Plays a practice call: says each line PitchProX gives (or the opener), until the scenario ends
function playPracticeCall(start, { maxTurns = 30 } = {}) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(`ws://127.0.0.1:${PORT}/?token=${encodeURIComponent(start.token)}`);
    const seen = { ready: null, prompts: [], turns: [], statuses: [], metrics: null, ended: null, cancelled: [] };
    const timer = setTimeout(() => reject(new Error("practice call timed out")), 20_000);
    let replyTimer = null;
    const say = (text) => socket.send(JSON.stringify({ type: "rep_said", text }));
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "ready") {
        seen.ready = message;
        socket.send(JSON.stringify({ type: "disclosure_read" }));
        say(message.opener);
      } else if (message.type === "turn") {
        seen.turns.push(message.turn);
        if (message.turn.speaker === "prospect") {
          clearTimeout(replyTimer);
          replyTimer = setTimeout(() => say("I hear you, tell me more."), 600); // the rep keeps talking if no line comes
        }
      } else if (message.type === "prompt") {
        clearTimeout(replyTimer);
        seen.prompts.push(message.prompt);
        if (seen.turns.length < maxTurns) say(message.prompt.text);
      } else if (message.type === "prompt_cancelled") seen.cancelled.push(message);
      else if (message.type === "metrics") seen.metrics = message.metrics;
      else if (message.type === "status") {
        seen.statuses.push(message.status);
        if (message.status === "script_finished" || message.status === "boundary") socket.send(JSON.stringify({ type: "end" }));
      } else if (message.type === "ended") {
        clearTimeout(timer);
        clearTimeout(replyTimer);
        seen.ended = message;
        resolve(seen);
      }
    };
    socket.onclose = (event) => {
      if (!seen.ended) {
        clearTimeout(timer);
        resolve({ ...seen, closeCode: event.code });
      }
    };
  });
}

test("call options: practice scenarios, live availability and usage", async () => {
  const res = await caller.get("/api/v1/calls/options");
  assert.equal(res.status, 200);
  assert.equal(res.json.liveAvailable, true, "test server has Twilio settings");
  assert.ok(res.json.practiceScripts.length >= 4);
  assert.equal(res.json.usage.used, 0);
});

test("calling stays locked until calibration; practice needs a scenario", async () => {
  const fresh = await newCustomer("uncalibrated");
  const locked = await fresh.post("/api/v1/calls", { mode: "practice", scriptId: "fsbo_commission" });
  assert.equal(locked.status, 403);
  assert.match(locked.json.error, /calibration/i);
  const noScript = await caller.post("/api/v1/calls", { mode: "practice", scriptId: "nope" });
  assert.equal(noScript.status, 400);
});

test("practice call end to end: real Core coaching over WebSocket, saved with transcript, no plan usage", async () => {
  const start = await caller.post("/api/v1/calls", { mode: "practice", scriptId: "fsbo_commission" });
  assert.equal(start.status, 201);
  assert.match(start.json.token, /^call_/);
  const seen = await playPracticeCall(start.json);
  assert.equal(seen.ready.call.prospectName, "Dana Whitfield");
  assert.equal(seen.ready.call.ai, "demo", "no AI key in tests: sample wording, real strategy");
  assert.ok(seen.prompts.length >= 4, `coaching lines shown (${seen.prompts.length})`);
  const actions = seen.prompts.map((p) => p.action);
  assert.deepEqual(actions.slice(0, 3), ["clarify", "reframe", "quantify"], "commission objection: a different strategy each time");
  assert.equal(seen.metrics.disclosureGiven, true);
  assert.equal(seen.ended.summary.conversion?.status, "confirmed", "walkthrough confirmed");
  assert.equal(seen.ended.summary.compliance_events[0], "disclosure_detected");

  const list = await caller.get("/api/v1/calls?mode=practice");
  const saved = list.json.results.find((c) => c.id === start.json.call.id);
  assert.equal(saved.status, "completed");
  assert.equal(saved.mode, "practice");
  const one = await caller.get(`/api/v1/calls/${start.json.call.id}`);
  assert.ok(one.json.call.transcript.length >= 10);
  assert.equal(one.json.call.transcript[0].speaker, "rep");
  assert.equal((await caller.get("/api/v1/calls/options")).json.usage.used, 0, "practice calls never use the plan's calls");
});

test("call service rejects bad tokens and someone else's call", async () => {
  const bad = await new Promise((resolve) => {
    const socket = new WebSocket(`ws://127.0.0.1:${PORT}/?token=call_x.user_y.9999999999.forged`);
    socket.onclose = (event) => resolve(event.code);
  });
  assert.equal(bad, 4401);
  assert.equal((await fetch(`${BASE}/api/v1/internal/calls/anything`)).status, 404, "internal API hidden without the secret");
  const other = await newCustomer("othercaller");
  assert.equal((await other.get(`/api/v1/calls/${(await caller.get("/api/v1/calls")).json.results[0].id}`)).status, 404);
});

test("live call: counts against the plan, fires First Call Completed once, remembers open objections for the next call", async () => {
  const lead = await caller.post("/api/v1/leads", { name: `Call Lead ${RUN}`, leadType: "FSBO", phones: [{ number: "(555) 610-0001", label: "Mobile" }] });
  assert.equal(lead.status, 201);
  const leadId = lead.json.lead?.id ?? lead.json.id;
  const phoneId = (lead.json.lead ?? lead.json).phones[0].id;
  const start = await caller.post("/api/v1/calls", { mode: "live", contactKind: "lead", contactId: leadId, phoneId });
  assert.equal(start.status, 201);
  assert.equal(start.json.call.phoneNumber, "(555) 610-0001");

  // The call service would stream this; here the Core replays a scripted call and hands it back
  const { handoff } = await replayCall(SCENARIOS.find((s) => s.id === "01_fsbo_commission_x3"));
  const done = await internal(`/api/v1/internal/calls/${start.json.call.id}/complete`, { handoff, endedReason: "hangup" });
  assert.equal(done.status, 200);
  const result = await done.json();
  assert.equal(result.status, "completed");
  assert.equal(result.summary.open_objections[0].objection_id, "financial:commission");
  assert.equal((await internal(`/api/v1/internal/calls/${start.json.call.id}/complete`, { handoff })).status, 200, "completing twice is harmless");
  assert.equal((await caller.get("/api/v1/calls/options")).json.usage.used, 1, "one live call used");
  const [events] = await db.query("SELECT COUNT(*) AS n FROM user_events WHERE event = 'first_call_completed' AND user_id = (SELECT user_id FROM calls WHERE id = ?)", [start.json.call.id]);
  assert.equal(Number(events[0].n), 1, "First Call Completed recorded for the journeys");

  // Second call to the same lead starts with what the first left open (Spec 05 §4)
  const second = await caller.post("/api/v1/calls", { mode: "live", contactKind: "lead", contactId: leadId, phoneId });
  assert.equal(second.json.call.hasPriorCalls, true);
  const context = await (await internal(`/api/v1/internal/calls/${second.json.call.id}`)).json();
  assert.equal(context.context.prospect_history.open_objections[0].objection_id, "financial:commission");
  await internal(`/api/v1/internal/calls/${second.json.call.id}/complete`, { handoff });
  const [again] = await db.query("SELECT COUNT(*) AS n FROM user_events WHERE event = 'first_call_completed' AND user_id = (SELECT user_id FROM calls WHERE id = ?)", [start.json.call.id]);
  assert.equal(Number(again[0].n), 1, "only for the first call");

  // A bad number can't be dialled
  await caller.patch(`/api/v1/leads/${leadId}/phones/${phoneId}`, { status: "wrong" });
  assert.equal((await caller.post("/api/v1/calls", { mode: "live", contactKind: "lead", contactId: leadId, phoneId })).status, 409);
});

test("someone else's lead can't be called", async () => {
  const other = await newCustomer("leadowner");
  const lead = await other.post("/api/v1/leads", { name: `Private Lead ${RUN}`, phones: [{ number: "(555) 620-0001" }] });
  const leadId = lead.json.lead?.id ?? lead.json.id;
  assert.equal((await caller.post("/api/v1/calls", { mode: "live", contactKind: "lead", contactId: leadId })).status, 404);
  const anonymous = actor();
  assert.equal((await anonymous.post("/api/v1/calls", { mode: "practice", scriptId: "fsbo_commission" })).status, 401);
});

// ── AI-4: reports, disposition, follow-up drafts ──
async function liveCallWith(scenarioId, label) {
  const lead = await caller.post("/api/v1/leads", { name: `${label} ${RUN}`, leadType: "FSBO", phones: [{ number: `(555) 7${String(Math.floor(Math.random() * 100)).padStart(2, "0")}-${String(Date.now()).slice(-4)}` }] });
  const record = lead.json.lead;
  const start = await caller.post("/api/v1/calls", { mode: "live", contactKind: "lead", contactId: record.id, phoneId: record.phones[0].id });
  assert.equal(start.status, 201);
  const { handoff } = await replayCall(SCENARIOS.find((s) => s.id === scenarioId));
  const done = await internal(`/api/v1/internal/calls/${start.json.call.id}/complete`, { handoff });
  assert.equal(done.status, 200);
  return { callId: start.json.call.id, lead: record };
}

test("practice call reports are fully open; live reports unlock per call and stop at the plan's limit", async () => {
  const practice = (await caller.get("/api/v1/calls?mode=practice")).json.results[0];
  const open = await caller.get(`/api/v1/calls/${practice.id}/report`);
  assert.equal(open.status, 200);
  assert.equal(open.json.locked, false);
  assert.ok(open.json.report.detailed.moments.length > 0);
  assert.equal(open.json.report.outcome.success, true);

  const { callId } = await liveCallWith("01_fsbo_commission_x3", "Report Lead");
  const locked = await caller.get(`/api/v1/calls/${callId}/report`);
  assert.equal(locked.json.locked, true);
  assert.equal(locked.json.report.detailed, null, "detailed analysis hidden until unlocked");
  assert.ok(locked.json.report.key_insights.length > 0, "basic report always available");
  const before = locked.json.usage;

  let last = null;
  for (let i = 0; i <= before.remaining; i += 1) {
    const { callId: id } = i === 0 ? { callId } : await liveCallWith("01_fsbo_commission_x3", `Report Lead ${i}`);
    last = await caller.post(`/api/v1/calls/${id}/report/unlock`);
    if (i < before.remaining) {
      assert.equal(last.status, 200);
      assert.equal(last.json.locked, false);
      assert.ok(last.json.report.detailed.objections.length > 0);
    }
  }
  assert.equal(last.status, 402, "no detailed reports left");
  assert.equal((await caller.post(`/api/v1/calls/${callId}/report/unlock`)).status, 200, "an unlocked report stays open (no second charge)");
  assert.equal((await caller.get("/api/v1/calls/options")).json.reportUsage.used, before.total);
});

test("the call outcome defaults from what happened and can be changed", async () => {
  const { callId } = await liveCallWith("01_fsbo_commission_x3", "Outcome Lead");
  assert.equal((await caller.get(`/api/v1/calls/${callId}`)).json.call.disposition, "Follow-Up Required");
  assert.equal((await caller.patch(`/api/v1/calls/${callId}`, { disposition: "Banana" })).status, 400);
  const changed = await caller.patch(`/api/v1/calls/${callId}`, { disposition: "Appointment Set" });
  assert.equal(changed.json.call.disposition, "Appointment Set");
  const booked = await liveCallWith("31_spouse_wants_to_attend_then_books", "Booked Lead");
  assert.equal((await caller.get(`/api/v1/calls/${booked.callId}`)).json.call.disposition, "Appointment Set");
});

test("follow-up email from a call: the call's contact and the agreed appointment, never guessed", async () => {
  const { callId, lead } = await liveCallWith("31_spouse_wants_to_attend_then_books", "Email Lead");
  const report = (await caller.get(`/api/v1/calls/${callId}/report`)).json.report;
  assert.equal(report.follow_up.suggested_purpose, "Appointment Confirmation");
  const options = await caller.get("/api/v1/follow-up");
  const template = options.json.templates.find((t) => t.purpose === "Appointment Confirmation");
  const draft = await caller.post("/api/v1/follow-up/draft", { templateId: template.id, callId, facts: report.follow_up.facts });
  assert.equal(draft.status, 200);
  assert.equal(draft.json.contact.id, lead.id, "the call's own lead");
  assert.match(draft.json.body, /^Hi Email,/);
  assert.match(draft.json.body, /at 6:00 PM/);
  const stranger = await newCustomer("emailstranger");
  assert.equal((await stranger.post("/api/v1/follow-up/draft", { templateId: template.id, callId })).status, 404);
});

test("'don't call me again' on a live call marks that number Do not call", async () => {
  const { lead } = await liveCallWith("20_do_not_contact", "Stop Lead");
  const phones = (await caller.get(`/api/v1/leads/${lead.id}`)).json.lead.phones;
  assert.equal(phones[0].status, "do_not_call");
});
