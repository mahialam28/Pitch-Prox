// AI-4: the post-call report built from the Core's handoff.
import { test } from "node:test";
import assert from "node:assert/strict";
import { SCENARIOS } from "./scenarios.mjs";
import { replayCall } from "../../src/lib/ai/replay.js";
import { buildCallReport, parseMeetingTime } from "../../src/lib/ai/report.js";

const report = async (id, options = {}) => buildCallReport((await replayCall(SCENARIOS.find((s) => s.id === id))).handoff, { callStartedAt: "2026-11-11T15:00:00", prospectName: "Dana", ...options });

test("meeting times: only clear days and times are turned into a date (no guessing)", () => {
  const wednesday = "2026-11-11T15:00:00"; // a Wednesday
  assert.deepEqual(parseMeetingTime("Thursday at six works for us", wednesday), { date: "2026-11-12", time: "18:00", text: "thursday at six" });
  assert.equal(parseMeetingTime("Saturday at 10am works", wednesday).time, "10:00");
  assert.equal(parseMeetingTime("tomorrow at 5:30", wednesday).date, "2026-11-12");
  assert.equal(parseMeetingTime("Wednesday morning", wednesday).date, "2026-11-18", "same weekday means next week");
  assert.equal(parseMeetingTime("Wednesday morning", wednesday).time, null, "no exact time, no invented one");
  assert.equal(parseMeetingTime("sometime soon", wednesday), null);
});

test("confirmed walkthrough: outcome, appointment facts and the Appointment Confirmation email", async () => {
  const r = await report("31_spouse_wants_to_attend_then_books");
  assert.equal(r.outcome.label, "Walkthrough confirmed");
  assert.equal(r.outcome.success, true);
  assert.equal(r.follow_up.suggested_purpose, "Appointment Confirmation");
  assert.equal(r.follow_up.facts.appointmentAt, "2026-11-12T18:00");
  assert.ok(r.action_items.some((a) => a.type === "confirm_meeting"));
  assert.ok(r.key_insights.some((i) => i.title === "Decision makers"));
});

test("open objection: unresolved follow-up suggested, coaching to find the root, strategies listed", async () => {
  const r = await report("01_fsbo_commission_x3");
  assert.equal(r.outcome.success, false);
  const objection = r.detailed.objections[0];
  assert.equal(objection.label, "Commission / fee");
  assert.equal(objection.times_raised, 3);
  assert.deepEqual(objection.strategies.slice(0, 3), ["Clarify", "Reframe", "Quantify"]);
  assert.equal(r.follow_up.suggested_purpose, "Unresolved Objection Follow-Up");
  assert.ok(r.detailed.coaching.some((c) => c.title === "Find the root of the concern"));
});

test("'send me something' is not success; do-not-contact gets no follow-up email", async () => {
  const info = await report("10_send_me_something");
  assert.equal(info.outcome.success, false);
  assert.equal(info.outcome.follow_up_is_not_success, true);
  assert.equal(info.follow_up.suggested_purpose, "Requested Information");
  const stop = await report("20_do_not_contact");
  assert.equal(stop.outcome.label, "Asked not to be contacted");
  assert.equal(stop.follow_up.suggested_purpose, null);
  assert.ok(stop.action_items.some((a) => a.type === "do_not_call"));
});

test("rep pressure shows up as harmful deviation and a coaching point", async () => {
  const r = await report("12_rep_ignores_and_damages_trust");
  assert.equal(r.detailed.moments[0].behavior, "Own approach (hurt the call)");
  assert.ok(r.detailed.coaching.some((c) => c.title === "Avoid pressure lines"));
  assert.equal(r.detailed.prompt_use.off_script_pct, 100);
});

test("quality is scored separately from the outcome (Spec 09 §9)", async () => {
  const noFit = await report("25_great_conversation_no_fit");
  const booked = await report("26_confirmed_walkthrough");
  assert.equal(noFit.outcome.success, false);
  assert.equal(booked.outcome.success, true);
  assert.ok(noFit.detailed.scores.conversation >= 45, `a good conversation without a meeting still scores fairly (${noFit.detailed.scores.conversation})`);
});

test("honest report: no tone-of-voice claims, every trust move has a reason and a quote", async () => {
  const r = await report("02_expired_guarded_then_discloses");
  const text = JSON.stringify(r).toLowerCase();
  for (const banned of ["tone of voice was", "energy level", "study", "research shows", "% higher conversion"]) assert.ok(!text.includes(banned), `no "${banned}"`);
  assert.match(r.detailed.sentiment.basis, /tone of voice isn't measured/i);
  for (const event of r.detailed.trust_events) {
    assert.ok(event.why, "each trust move explains itself");
    assert.ok(event.quote, "and points to what was said");
  }
  assert.ok(r.detailed.chart.length >= 3);
});
