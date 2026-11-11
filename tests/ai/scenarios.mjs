// The 30 required replay scenarios (Spec 11 §13.1). Each checks state class, direction, strategy
// and prohibited behaviour, not exact wording (§13.2). `final(result, assert)` runs extra checks.

const NOT_CLOSE = { not: "close" };
const promptedActions = (result, objectionId) => result.handoff.decisions.filter((d) => d.should_prompt && (!objectionId || d.objection_id === objectionId)).map((d) => d.strategic_action);
const displayed = (result) => result.handoff.prompts.filter((p) => p.status === "displayed");

const commissionCall = (extra = {}) => ({
  context: { lead_type: "fsbo", calibration_score: 60, ...extra },
  events: [
    { speaker: "rep", text: "Hi, it's Sam with Sunrise Realty. I saw your home listed for sale by owner." },
    { speaker: "prospect", text: "Yeah, we're selling it ourselves because we don't want to pay a commission." },
    { speaker: "rep", text: "When you say the fee feels high, is it the number or not knowing what you'd get for it?" },
  ],
});

export const SCENARIOS = [
  {
    id: "01_fsbo_commission_x3",
    title: "FSBO commission objection repeats three times",
    context: { lead_type: "fsbo", calibration_score: 60 },
    events: [
      { speaker: "rep", text: "Hi, it's Sam with Sunrise Realty. I saw your home listed for sale by owner." },
      { speaker: "prospect", text: "We're selling it ourselves, we don't want to pay a commission.", expect: { "state.objection_state.root_categories": { includes: "financial" }, "decision.should_prompt": true } },
      { speaker: "rep", text: "When you say the fee feels high, is it the number or what you'd get for it?" },
      { speaker: "prospect", text: "Six percent is just too much money for what agents do.", expect: { "state.objection_state.recurrence_count": 2 } },
      { speaker: "rep", text: "The fee only matters if it doesn't come back to you. What matters is what you net." },
      { speaker: "prospect", text: "I hear you but the commission is still the problem for us.", expect: { "state.objection_state.objection_id": "financial:commission", "state.objection_state.recurrence_count": 3, "state.objection_state.resolution": "unresolved", "state.momentum_state.trend": ["stalling", "regressing", "stable"], "decision.strategic_action": { notIn: ["close"] } } },
    ],
    final(result, assert) {
      const actions = promptedActions(result, "financial:commission");
      assert.equal(actions.length, 3, "three prompts for the three objections");
      assert.equal(new Set(actions).size, 3, `strategy changes each time, got ${actions}`);
    },
  },
  {
    id: "02_expired_guarded_then_discloses",
    title: "Expired listing: guarded, then discloses the past failure",
    context: { lead_type: "expired", calibration_score: 66 },
    events: [
      { speaker: "rep", text: "Hi, it's Sam from Sunrise Realty, calling about your home that came off the market." },
      { speaker: "prospect", text: "Yeah.", gap: 2800, expect: { "decision.strategic_action": NOT_CLOSE } },
      { speaker: "rep", text: "What did you think of how the last few months went?" },
      { speaker: "prospect", text: "Not great.", gap: 3000, expect: { "decision.strategic_action": NOT_CLOSE } },
      { speaker: "rep", text: "I'm sorry to hear that. What happened, if you don't mind me asking?" },
      { speaker: "prospect", text: "Honestly our last agent did nothing. It sat for six months with two showings and we got burned, we're frustrated.", expect: { "state.objection_state.objection_id": "risk:past_failure", "decision.strategic_action": ["validate", "clarify", "acknowledge"] } },
      { speaker: "rep", text: "After what happened, being careful makes complete sense." },
      { speaker: "prospect", text: "Yeah, I mean the real reason is we need to move by June for my job, so we can't wait another six months, and the price was off by about forty thousand I think.", expect: { "state.trust_state.trend": ["rising", "stable"] } },
    ],
    final(result, assert) {
      const timeline = result.handoff.state_timeline.filter((s) => s.trust !== undefined);
      const guarded = timeline[3].trust;
      const last = timeline[timeline.length - 1].trust;
      assert.ok(last > guarded, `trust rises with disclosure (${guarded} → ${last})`);
      assert.ok(!promptedActions(result).slice(0, 2).includes("close"), "no close while guarded");
    },
  },
  {
    id: "03_think_about_it_after_price",
    title: "'I need to think about it' after a price discussion",
    context: { lead_type: "fsbo", calibration_score: 70 },
    events: [
      { speaker: "rep", text: "Our commission is a bit under the area average, and here's what it includes." },
      { speaker: "prospect", text: "The fee still seems expensive to me honestly.", expect: { "state.objection_state.root_categories": { includes: "financial" } } },
      { speaker: "rep", text: "That's fair. Is it the number itself or what you'd get for it?" },
      { speaker: "prospect", text: "I don't know. I need to think about it.", expect: { "state.objection_state.root_categories": { includes: "financial" }, "decision.strategic_action": ["reframe", "quantify", "de-risk", "differentiate", "question"], "decision.strategic_objective": { not: "involve_decision_maker" } } },
    ],
  },
  {
    id: "04_think_about_it_spouse_absent",
    title: "Same phrase with the spouse absent",
    context: { lead_type: "fsbo", calibration_score: 70 },
    events: [
      { speaker: "rep", text: "Would it make sense to look at the numbers together this week?" },
      { speaker: "prospect", text: "I need to think about it and talk to my wife, she isn't here right now.", expect: { "state.decision_structure.status": "participant_not_present", "state.objection_state.objection_id": "logistics:decision_maker_absent", "decision.strategic_objective": "involve_decision_maker", "decision.strategic_action": NOT_CLOSE } },
    ],
  },
  {
    id: "05_slows_after_sensitive_disclosure",
    title: "Prospect slows down after a sensitive disclosure",
    context: { lead_type: "absentee", calibration_score: 61 },
    events: [
      { speaker: "rep", text: "Hi, I'm calling about the property on Maple Street. Are you the owner?" },
      { speaker: "prospect", text: "Yes, that's my mother's house, it has three bedrooms and a big yard and we grew up there.", wpm: 160 },
      { speaker: "rep", text: "That sounds like a special place. What are you thinking of doing with it?" },
      { speaker: "prospect", text: "We have not decided yet, my brother lives out of state and the roof needs some work before anything.", wpm: 158 },
      { speaker: "rep", text: "Got it. Is anyone living there right now?" },
      { speaker: "prospect", text: "Well... my mom passed away in March. So it's... it's been hard to even go over there.", wpm: 95, gap: 3200, expect: { "state.sensitive_context": "deceased", "state.emotion_state.probabilities.processing": { min: 0.15 }, "decision.strategic_action": { notIn: ["close", "challenge", "quantify"] } } },
    ],
    final(result, assert) {
      const last = result.steps[result.steps.length - 1];
      assert.ok(!("fear" in last.state.emotion_state.probabilities), "no fear label from speed alone");
      assert.ok(last.state.emotion_state.confidence <= 0.7, "text-only emotion confidence capped");
    },
  },
  {
    id: "06_accelerates_detailed_future_questions",
    title: "Prospect speeds up and asks detailed future questions",
    context: { lead_type: "expired", calibration_score: 75 },
    events: [
      { speaker: "rep", text: "Hi, it's Sam from Sunrise Realty about your home on Oak Street." },
      { speaker: "prospect", text: "Okay, sure, we listed it last year but it did not sell and we took it off the market in the fall.", wpm: 140 },
      { speaker: "rep", text: "What do you think kept it from selling?" },
      { speaker: "prospect", text: "Probably the price and the photos, the listing just looked flat to be honest.", wpm: 142 },
      { speaker: "rep", text: "That's common. What would you want done differently?" },
      { speaker: "prospect", text: "How would you price it and what's the next step if we wanted to relist in March, how long would photos take?", wpm: 195, expect: { "state.engagement_state.trend": ["rising", "stable"], "state.momentum_state.trend": ["advancing", "stable"] } },
    ],
    final(result, assert) {
      const last = result.steps[result.steps.length - 1];
      assert.ok((last.state.emotion_state.probabilities.excited ?? 0) < 0.3, "speed alone isn't excitement");
      assert.ok(last.state.engagement_state.score > result.steps[3].state.engagement_state.score, "engagement rises");
    },
  },
  {
    id: "07_friendly_no_movement",
    title: "Friendly call with no operational movement",
    context: { lead_type: "sphere", calibration_score: 65 },
    events: [
      { speaker: "rep", text: "Hi, just checking in to see how you're enjoying the new place." },
      { speaker: "prospect", text: "Haha thanks, it's great, we love the neighborhood, really nice people.", expect: { "state.emotion_state.valence": { min: 1 }, "decision.strategic_action": NOT_CLOSE } },
      { speaker: "rep", text: "That's great to hear. Anything you'd change about it?" },
      { speaker: "prospect", text: "Nah, we're happy, thanks for calling, that's nice of you.", expect: { "state.readiness_state.overall": { max: 60 }, "decision.strategic_action": NOT_CLOSE } },
    ],
  },
  {
    id: "08_engaged_but_objection_open",
    title: "High engagement but a major objection is unresolved",
    context: { lead_type: "fsbo", calibration_score: 72 },
    events: [
      { speaker: "rep", text: "Hi, I saw your home is for sale by owner." },
      { speaker: "prospect", text: "Yes, we're selling it ourselves, the commission is just too high.", expect: { "state.objection_state.root_categories": { includes: "financial" } } },
      { speaker: "rep", text: "When you say too high, is it the number or what you'd get for it?" },
      { speaker: "prospect", text: "The commission. But how does it work, what would the next step be, and how soon could you list it?", expect: { "decision.strategic_action": NOT_CLOSE, "state.objection_state.resolution": ["unresolved", "reactivated"] } },
    ],
  },
  {
    id: "09_meeting_logistics_become_specific",
    title: "Meeting logistics become specific",
    context: { lead_type: "expired", calibration_score: 70 },
    events: [
      { speaker: "rep", text: "Would it help if I came by for a quick walkthrough to show you the plan?" },
      { speaker: "prospect", text: "Maybe, that could be good.", expect: { "state.conversion.status": ["offered", "tentative"] } },
      { speaker: "rep", text: "Great. Would Thursday at six or Saturday morning work better?" },
      { speaker: "prospect", text: "Thursday at six could work I guess.", expect: { "state.conversion.status": { not: "confirmed" } } },
      { speaker: "rep", text: "Perfect, so Thursday at six at the house?" },
      { speaker: "prospect", text: "Yes, Thursday at six works for me, see you then.", expect: { "state.conversion.status": "confirmed", "state.conversion.conversion_type": "walkthrough" } },
    ],
  },
  {
    id: "10_send_me_something",
    title: "'Send me something' is not success",
    context: { lead_type: "expired", calibration_score: 70 },
    events: [
      { speaker: "rep", text: "Would you be open to a quick walkthrough this week?" },
      { speaker: "prospect", text: "Just send me something by email and I'll look at it.", expect: { "state.conversion.status": { not: "confirmed" }, "decision.strategic_objective": "convert_info_request_to_next_step", "decision.strategic_action": NOT_CLOSE } },
    ],
    final(result, assert) {
      assert.ok(result.handoff.follow_up_obligations.some((i) => i.type === "send_info"), "send-info is a follow-up obligation");
      assert.notEqual(result.handoff.conversion?.status, "confirmed");
    },
  },
  {
    id: "11_rep_paraphrases",
    title: "Rep paraphrases the prompt effectively",
    ...commissionCall(),
    events: [
      ...commissionCall().events.slice(0, 2),
      { speaker: "rep", text: "Can I ask, is it the fee itself that bothers you, or not being sure what you'd actually get?" },
      { speaker: "prospect", text: "It's more what we'd get, honestly, our neighbor paid a lot and the house still sat for months.", expect: { "outcome.rep_behavior": ["strategic_paraphrase", "exact"] } },
    ],
  },
  {
    id: "12_rep_ignores_and_damages_trust",
    title: "Rep ignores the prompt and damages trust",
    ...commissionCall(),
    events: [
      ...commissionCall().events.slice(0, 2),
      { speaker: "rep", text: "Look, you need to list with me today, trust me, you'd be crazy to sell it yourself." },
      { speaker: "prospect", text: "Wow, that's ridiculous. I'm not interested in being pushed around.", expect: { "outcome.rep_behavior": "harmful_deviation", "outcome.observed_state_delta.trust": { max: -0.1 } } },
    ],
  },
  {
    id: "13_new_utterance_while_generating",
    title: "New prospect utterance arrives while the LLM is still writing",
    context: { lead_type: "fsbo", calibration_score: 70 },
    llm: { delayMs: 120 },
    staleAfterMs: 2000,
    events: [
      { speaker: "rep", text: "Hi, I saw your home is for sale by owner." },
      { speaker: "prospect", text: "Yes, we don't want to pay a commission.", no_wait: true },
      { speaker: "prospect", text: "Actually, my husband handles all of this and he isn't home, you'd have to talk to him.", gap: 300 },
    ],
    final(result, assert) {
      const [first, second] = result.handoff.prompts;
      assert.ok(["cancelled", "stale"].includes(first.status), `old prompt cancelled (got ${first.status})`);
      assert.match(first.cancel_reason, /PROSPECT_|SUPERSEDED|STATE_CHANGED/);
      assert.equal(second.status, "displayed");
      assert.equal(second.strategic_objective, "involve_decision_maker");
    },
  },
  {
    id: "14_relevant_verified_proof",
    title: "AI Training has a relevant verified proof point",
    context: { lead_type: "expired", calibration_score: 70, user_id: "u1", organization_id: "o1" },
    knowledge: [
      { knowledge_id: "k_sales", owner_scope: "user", owner_id: "u1", organization_id: "o1", knowledge_class: "performance", verification_status: "company_approved", source_title: "2025 sales record", topic_tags: ["experience", "sold", "homes"], text: "Sam sold 23 homes in the Oak Park area in 2025." },
      { knowledge_id: "k_bio", owner_scope: "user", owner_id: "u1", organization_id: "o1", knowledge_class: "profile", verification_status: "user_supplied", source_title: "Bio", topic_tags: ["experience"], text: "Sam has been a licensed agent since 2016." },
    ],
    events: [
      { speaker: "rep", text: "Hi, it's Sam about your home in Oak Park." },
      { speaker: "prospect", text: "How many homes have you sold around here, though?", expect: { "decision.retrieval_needed": true, "decision.strategic_action": "educate", "prompt.retrieval.source_ids": { includes: "k_sales" } } },
    ],
  },
  {
    id: "15_irrelevant_similar_text",
    title: "AI Training contains irrelevant, similar-looking text",
    context: { lead_type: "expired", calibration_score: 70, user_id: "u1", organization_id: "o1" },
    knowledge: [
      { knowledge_id: "k_kitchen", owner_scope: "user", owner_id: "u1", organization_id: "o1", knowledge_class: "other", verification_status: "user_supplied", source_title: "Kitchen remodel tips", topic_tags: ["remodel", "kitchen"], text: "Painting cabinets white and new hardware brighten a kitchen cheaply." },
    ],
    events: [
      { speaker: "rep", text: "Hi, it's Sam about your home in Oak Park." },
      { speaker: "prospect", text: "How many homes have you sold around here, though?", expect: { "decision.retrieval_needed": true, "prompt.retrieval.source_ids": { excludes: "k_kitchen" } } },
    ],
  },
  {
    id: "16_conflicting_documents",
    title: "Two uploaded documents conflict",
    context: { lead_type: "expired", calibration_score: 70, user_id: "u1", organization_id: "o1" },
    knowledge: [
      { knowledge_id: "k_a", owner_scope: "user", owner_id: "u1", organization_id: "o1", knowledge_class: "profile", verification_status: "user_supplied", uploaded_at: "2026-01-01", fact_key: "years_experience", value: "10", source_title: "Bio A", topic_tags: ["experience"], text: "Sam has 10 years of experience selling homes." },
      { knowledge_id: "k_b", owner_scope: "user", owner_id: "u1", organization_id: "o1", knowledge_class: "profile", verification_status: "user_supplied", uploaded_at: "2026-01-01", fact_key: "years_experience", value: "12", source_title: "Bio B", topic_tags: ["experience"], text: "Sam has 12 years of experience selling homes." },
    ],
    events: [
      { speaker: "rep", text: "Hi, it's Sam about your home." },
      { speaker: "prospect", text: "What's your experience, how long have you been selling homes?", expect: { "decision.retrieval_needed": true, "prompt.retrieval.source_ids": { excludes: "k_a" } } },
    ],
    final(result, assert) {
      const prompt = result.handoff.prompts.find((p) => p.retrieval);
      assert.ok(prompt.retrieval.conflicts.some((c) => c.fact_key === "years_experience" && c.resolution === "unresolved_do_not_assert"));
      assert.ok(!prompt.retrieval.source_ids.includes("k_b"));
    },
  },
  {
    id: "17_premium_playbook_changes_method",
    title: "Premium playbook changes the method, not Core truth or compliance",
    context: { lead_type: "fsbo", calibration_score: 70, playbook: { identity: { name: "Value Differentiator" }, publication: { version: 3 }, objections: [{ objection: "Commission is too high", category: ["Financial"], response_style: "Differentiate" }] } },
    events: [
      { speaker: "rep", text: "Hi, I saw your home is for sale by owner." },
      { speaker: "prospect", text: "We're selling it ourselves, we don't want to pay a commission.", expect: { "decision.strategic_action": "differentiate", "decision.playbook_influence": "high", "state.call_context.active_playbook": "Value Differentiator" } },
      { speaker: "rep", text: "What I'd bring is a different way of pricing and marketing it." },
      { speaker: "prospect", text: "Please take me off your list and don't call again.", expect: { "state.boundary.type": "do_not_contact", "decision.strategic_objective": "respect_boundary_and_exit" } },
    ],
  },
  {
    id: "18_calibration_profiles_same_state",
    title: "Different calibration profiles on the same state",
    context: { lead_type: "fsbo", calibration_score: 44 },
    events: commissionCall().events.slice(0, 2),
    async final(result, assert, { replayCall }) {
      const other = await replayCall({ id: "18b", context: { lead_type: "fsbo", calibration_score: 97 }, events: commissionCall().events.slice(0, 2) });
      const a = result.steps[1].decision;
      const b = other.steps[1].decision;
      assert.equal(a.strategic_action, b.strategic_action, "same strategy");
      assert.notEqual(a.max_prompt_words, b.max_prompt_words, "different construction limits");
      assert.ok(a.max_prompt_words < b.max_prompt_words);
    },
  },
  {
    id: "19_consent_issue",
    title: "Disclosure / consent issue stops the AI",
    context: { lead_type: "expired", calibration_score: 70 },
    events: [
      { speaker: "rep", text: "Hi, it's Sam from Sunrise Realty." },
      { speaker: "prospect", text: "Are you recording this call? I didn't agree to that." },
      { compliance: "consent_issue", details: { reason: "prospect objected to recording" } },
      { speaker: "prospect", text: "Anyway, the commission is too high for us.", expect: { "decision.should_prompt": false, "decision.reason_codes": { includes: "COMPLIANCE_STOP" } } },
    ],
    final(result, assert) {
      assert.equal(result.handoff.compliance_events[0].event_type, "consent_issue");
    },
  },
  {
    id: "20_do_not_contact",
    title: "Explicit do-not-contact boundary",
    context: { lead_type: "expired", calibration_score: 70 },
    events: [
      { speaker: "rep", text: "Hi, it's Sam from Sunrise Realty about your home." },
      { speaker: "prospect", text: "Take me off your list and do not call me again.", expect: { "state.boundary.type": "do_not_contact", "decision.strategic_action": "acknowledge", "decision.strategic_objective": "respect_boundary_and_exit", "decision.do_not_do": { includes: "persuade" } } },
      { speaker: "rep", text: "Understood, I'll respect that. Thanks for your time." },
      { speaker: "prospect", text: "But just so you know, the commission was the problem.", expect: { "decision.should_prompt": false, "decision.reason_codes": { includes: "BOUNDARY_RESPECTED" } } },
    ],
  },
  {
    id: "21_second_call_recall",
    title: "Second call to the same prospect recalls the open objection",
    context: { lead_type: "fsbo", calibration_score: 70, prospect_history: { open_objections: [{ objection_id: "financial:commission", label: "Commission / fee", root_categories: ["financial"], resolution: "unresolved", strategies_attempted: ["clarify", "reframe"] }], promises: [{ text: "Send a net sheet comparison" }] } },
    events: [
      { speaker: "rep", text: "Hi, it's Sam again, following up on the net sheet I promised." },
      { speaker: "prospect", text: "Right, but honestly the commission is still what bothers me.", expect: { "state.objection_state.objection_id": "financial:commission", "decision.reason_codes": { includes: "PRIOR_CALL_CONTEXT" }, "decision.strategic_action": { notIn: ["clarify", "reframe", "close"] } } },
    ],
    final(result, assert) {
      assert.ok(result.handoff.follow_up_obligations.some((i) => i.type === "prior_promise"), "prior promise surfaced");
    },
  },
  {
    id: "22_novel_objection_learning_candidate",
    title: "A novel objection becomes a learning candidate, not doctrine",
    context: { lead_type: "expired", calibration_score: 70 },
    events: [
      { speaker: "rep", text: "Would you be open to putting a sign in the yard this time?" },
      { speaker: "prospect", text: "The HOA won't let us put up signs, that's the issue for us.", expect: { "state.learning_candidates.length": 1, "interp.learning_candidate": true } },
    ],
    final(result, assert) {
      assert.equal(Object.keys(result.handoff.final_state.objections).length, 0, "no new objection doctrine created");
      assert.equal(result.handoff.learning_candidates[0].status, "candidate");
    },
  },
  {
    id: "23_low_asr_poor_diarization",
    title: "Low ASR confidence and poor speaker separation",
    context: { lead_type: "expired", calibration_score: 70 },
    events: [
      { speaker: "rep", text: "Hi, it's Sam from Sunrise Realty.", asr: 0.4 },
      { speaker: "prospect", text: "yeah we uh the house it did not sell", asr: 0.35 },
      { speaker: "unknown", text: "maybe we could talk", asr: 0.3 },
      { speaker: "prospect", text: "not sure what happened with it", asr: 0.35, expect: { "state.emotion_state.confidence": { max: 0.44 }, "state.trust_state.confidence": { max: 0.5 } } },
    ],
  },
  {
    id: "24_naturally_slow_speaker",
    title: "A naturally slow speaker isn't read as disengaged",
    context: { lead_type: "expired", calibration_score: 49 },
    events: [
      { speaker: "rep", text: "Hi, it's Sam about your home on Pine Street." },
      { speaker: "prospect", text: "Yes, we had it listed for about five months last year, and we had a few showings but no real offers came in.", wpm: 92 },
      { speaker: "rep", text: "What do you think held it back?" },
      { speaker: "prospect", text: "I think the price was a bit high for the kitchen, it still has the original cabinets from nineteen ninety eight.", wpm: 90 },
      { speaker: "rep", text: "That's helpful. What would you want to do next?" },
      { speaker: "prospect", text: "We still want to sell before the school year, we would want to know what to fix first and what it might sell for now.", wpm: 91, expect: { "state.engagement_state.score": { min: 45 }, "state.emotion_state.probabilities.detached": { max: 0.15 } } },
    ],
    async final(result, assert, { replayCall }) {
      // Same words at a normal pace: speed alone must not change the engagement reading
      const fast = await replayCall({ id: "24b", context: { lead_type: "expired", calibration_score: 49 }, events: result.steps.map((s) => ({ ...s.item, wpm: s.item.speaker === "prospect" ? 160 : s.item.wpm })) });
      const slowScore = result.steps[result.steps.length - 1].state.engagement_state.score;
      const fastScore = fast.steps[fast.steps.length - 1].state.engagement_state.score;
      assert.ok(Math.abs(slowScore - fastScore) <= 2, `slow ${slowScore} vs normal ${fastScore}`);
    },
  },
  {
    id: "25_great_conversation_no_fit",
    title: "Excellent conversation, no fit: quality ≠ outcome",
    context: { lead_type: "sphere", calibration_score: 70 },
    events: [
      { speaker: "rep", text: "Hi, I wanted to see if you'd thought about selling this year." },
      { speaker: "prospect", text: "We have, honestly, we're thinking about the timing since the kids are in school here until twenty twenty eight.", },
      { speaker: "rep", text: "That makes a lot of sense. What would make the timing feel right?" },
      { speaker: "prospect", text: "That's a good point. We want to be sure about the schools first, that makes sense to plan around.", },
      { speaker: "rep", text: "Would it help to know what it might sell for now, just for planning?" },
      { speaker: "prospect", text: "Thanks, this was really helpful, but we've decided to wait a few years, we're not ready.", expect: { "state.conversion": { exists: false } } },
    ],
    final(result, assert) {
      assert.equal(result.handoff.conversion, null, "no appointment recorded");
      assert.ok(result.handoff.trust_gain.value === null || result.handoff.trust_gain.value >= -5, "conversation stayed healthy");
    },
  },
  {
    id: "26_confirmed_walkthrough",
    title: "Confirmed property walkthrough",
    context: { lead_type: "expired", calibration_score: 70 },
    events: [
      { speaker: "rep", text: "Could I come by and see the house this week?" },
      { speaker: "prospect", text: "Sure, come by Wednesday at four, that works for me.", expect: { "state.conversion.status": "confirmed", "state.conversion.conversion_type": "walkthrough", "decision.strategic_objective": "confirm_details_and_next_step" } },
    ],
  },
  {
    id: "27_buyer_tour",
    title: "Buyer call confirms a showing / tour",
    context: { lead_type: "open_house_buyer", lead_side: "buyer", calibration_score: 70 },
    events: [
      { speaker: "rep", text: "Thanks for stopping by the open house. Want to see a few similar homes?" },
      { speaker: "prospect", text: "Yes, can we see some homes Saturday morning?", expect: { "state.conversion.conversion_type": "tour" } },
      { speaker: "rep", text: "Saturday at ten? I'll line up three that fit what you described." },
      { speaker: "prospect", text: "Saturday at ten works for me.", expect: { "state.conversion.status": "confirmed", "state.conversion.conversion_type": "tour" } },
    ],
  },
  {
    id: "28_sensitive_divorce_restraint",
    title: "Divorce context: restraint overrides generic push",
    context: { lead_type: "divorce", calibration_score: 70 },
    events: [
      { speaker: "rep", text: "Hi, I understand you may be thinking about selling the house." },
      { speaker: "prospect", text: "We're going through a divorce and need to sell. When could you come by?", expect: { "state.sensitive_context": "divorce", "decision.strategic_action": { notIn: ["close", "challenge"] }, "decision.do_not_do": { includes: "premature_close" } } },
    ],
  },
  {
    id: "29_rep_interrupts_disclosure",
    title: "Rep interrupts during the prospect's disclosure",
    context: { lead_type: "expired", calibration_score: 70 },
    events: [
      { speaker: "rep", text: "What happened with the last listing?" },
      { speaker: "prospect", text: "Honestly what happened was our agent stopped returning calls after the second month and we had no idea what was going on with it.", expect: { "state.pacing_state.rep_alignment_score": { min: 60 } } },
      { speaker: "rep", text: "Right, well, we do things very differently, we have a whole marketing team and a great system.", overlap: 1500 },
      { speaker: "prospect", text: "Okay, sure, but I was saying, we felt totally ignored, and I don't want that again, that's what matters to me.", expect: { "decision.should_prompt": false, "decision.reason_codes": { includes: "GIVE_SPACE_AFTER_INTERRUPTION" } } },
    ],
    final(result, assert) {
      const before = result.steps[1].state.pacing_state.rep_alignment_score;
      const after = result.steps[2].state.pacing_state.rep_alignment_score;
      assert.ok(after < before, `pacing alignment declines (${before} → ${after})`);
    },
  },
  {
    id: "30_llm_misses_the_moment",
    title: "Generation is too slow: cancelled, not shown late",
    context: { lead_type: "fsbo", calibration_score: 70 },
    llm: { delayMs: 150 },
    staleAfterMs: 40,
    events: [
      { speaker: "rep", text: "Hi, I saw your home is for sale by owner." },
      { speaker: "prospect", text: "We don't want to pay a commission." },
    ],
    final(result, assert) {
      const prompt = result.handoff.prompts[0];
      assert.ok(["stale", "cancelled"].includes(prompt.status), `late prompt not shown (got ${prompt.status})`);
      assert.equal(prompt.text, null);
    },
  },
  {
    id: "31_spouse_wants_to_attend_then_books",
    title: "Practice script: decision maker wants to be there, then the walkthrough is booked for both",
    context: { lead_type: "fsbo", calibration_score: 60 },
    events: [
      { speaker: "rep", text: "Besides that one piece, is there anything else holding you back?" },
      { speaker: "prospect", text: "Hm. My husband would want to be there for anything like that.", expect: { "state.decision_structure.status": "participant_not_present", "decision.strategic_objective": "involve_decision_maker" } },
      { speaker: "rep", text: "That makes sense. When would be a good time for both of you to take a quick look together?", expect: { "state.conversion.status": "offered", "state.conversion.conversion_type": "walkthrough" } },
      { speaker: "prospect", text: "He's home after five most days. Thursday at six could work.", expect: { "state.conversion.status": "tentative", "state.decision_structure.status": "participant_present" } },
      { speaker: "rep", text: "Perfect, so Thursday at six for both of you?" },
      { speaker: "prospect", text: "Yes, Thursday at six works for us. See you then.", expect: { "state.conversion.status": "confirmed", "decision.strategic_objective": "confirm_details_and_next_step" } },
    ],
  },
  {
    id: "32_privacy_question_is_not_exit",
    title: "'How did you get my number?' gets an honest answer; 'take me off' ends it",
    context: { lead_type: "circle_prospecting", calibration_score: 70 },
    events: [
      { speaker: "rep", text: "Hi, we just sold a home on your street. Have you thought about what yours is worth?" },
      { speaker: "prospect", text: "How did you get my number?", expect: { "state.boundary": { exists: false }, "decision.strategic_objective": "answer_privacy_question_honestly", "decision.do_not_do": { includes: "persuade" } } },
      { speaker: "rep", text: "Fair question, it's from a public directory, and I can take you off my list." },
      { speaker: "prospect", text: "Take me off your list and do not call me again.", expect: { "state.boundary.type": "do_not_contact", "decision.strategic_objective": "respect_boundary_and_exit" } },
    ],
  },
];
