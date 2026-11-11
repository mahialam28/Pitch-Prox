// LLM providers behind one interface: generate({ system, input, maxWords, timeoutMs, signal }) → { text, model }.
// OpenAI is the default (Bryce's account); Claude is a drop-in switch (AI_LLM_PROVIDER=anthropic).
// The mock writes deterministic lines from the Core's decision so the replay tests and the
// simulated call work without any key. Model names are env settings, not code.

const withTimeout = async (url, init, timeoutMs, signal) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  signal?.addEventListener?.("abort", () => controller.abort(), { once: true });
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

export function openAiProvider({ apiKey = process.env.OPENAI_API_KEY, model = process.env.AI_LIVE_MODEL || "gpt-4.1-mini", baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1" } = {}) {
  return {
    name: `openai:${model}`,
    configured: Boolean(apiKey),
    async generate({ system, input, maxWords, timeoutMs = 2500, signal }) {
      const response = await withTimeout(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, temperature: 0.4, max_tokens: Math.max(60, maxWords * 3), response_format: { type: "json_object" }, messages: [{ role: "system", content: system }, { role: "user", content: JSON.stringify(input) }] }),
      }, timeoutMs, signal);
      if (!response.ok) throw new Error(`OpenAI ${response.status}`);
      const data = await response.json();
      return { text: data.choices?.[0]?.message?.content ?? "", model };
    },
  };
}

export function anthropicProvider({ apiKey = process.env.ANTHROPIC_API_KEY, model = process.env.AI_LIVE_MODEL || "claude-haiku-5-5" } = {}) {
  return {
    name: `anthropic:${model}`,
    configured: Boolean(apiKey),
    async generate({ system, input, maxWords, timeoutMs = 2500, signal }) {
      const response = await withTimeout("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
        body: JSON.stringify({ model, max_tokens: Math.max(60, maxWords * 3), temperature: 0.4, system, messages: [{ role: "user", content: `${JSON.stringify(input)}\n\nReply with the JSON object only.` }] }),
      }, timeoutMs, signal);
      if (!response.ok) throw new Error(`Anthropic ${response.status}`);
      const data = await response.json();
      return { text: data.content?.find((part) => part.type === "text")?.text ?? "", model };
    },
  };
}

// ── Mock: realistic, deterministic lines per strategic action ───────────────────────────────
const MEETING = { walkthrough: "a quick walkthrough of the house", tour: "a showing", strategy_meeting: "a short sit-down", professional_meeting: "a short meeting" };
const LINES = {
  clarify: {
    financial: "When you say the fee feels high, is it the number itself, or not being sure what you'd get for it?",
    risk: "What would have to be different this time for you to feel comfortable?",
    logistics: "What would need to happen first for the timing to feel right?",
    relationship: "How involved are they right now with getting this sold?",
    stall: "Totally fair. So I send the right thing, what's the one question you'd want answered?",
    unknown: "Can I ask what's giving you pause, so I don't guess?",
  },
  validate: {
    risk: "After what happened last time, being careful makes complete sense.",
    relationship: "It's great you have someone you trust, and I wouldn't ask you to drop that.",
    unknown: "That's a fair concern, and I'd want to understand it before saying anything else.",
  },
  reframe: {
    financial: "The fee only matters if it doesn't come back to you, so the real question is what you'd net, not what you'd pay.",
    relationship: "Think of it less as replacing anyone and more as a second set of eyes before you decide.",
    unknown: "What if we looked at it as what this costs you if nothing changes?",
  },
  quantify: { financial: "If the right pricing and marketing get you even a little more at closing, the fee is covered. Want me to walk you through how that math works for your house?" },
  "de-risk": {
    financial: "There's no obligation to look at the numbers together, and if they don't make sense for you, you've lost nothing.",
    risk: "You'd see the plan and the numbers first, with no commitment, so nothing happens unless it makes sense to you.",
    logistics: "We can keep it short and work around your schedule, so it doesn't disrupt anything.",
  },
  differentiate: { financial: "The difference is in the plan behind the price, and I'd rather show you than tell you.", relationship: "What I'd bring is a different way of pricing and marketing it, so you can compare side by side." },
  question: {
    involve_decision_maker: "That makes sense. When would be a good time for both of you to take a quick look together?",
    narrow_remaining_concern: "Besides that one piece, is there anything else holding you back?",
    convert_info_request_to_next_step: "Happy to. Would it help more if I walked you through it in person for fifteen minutes?",
    discover_operational_need: "What would need to happen for this to actually work for you?",
    open_discovery: "What's got you thinking about selling right now?",
    invite_them_to_open_up: "Fair enough. What's been the most frustrating part of it so far?",
    answer_question_then_advance: "Good question. In short, we look at the numbers together first, then you decide.",
    default: "What matters most to you in how this goes?",
  },
  acknowledge: {
    respect_boundary_and_exit: "Understood, I'll respect that and won't call again. Thanks for your time.",
    answer_privacy_question_honestly: "Fair question. I'll tell you exactly where it came from, and if you'd rather not get calls, I'll take you off my list.",
    confirm_details_and_next_step: "Perfect, you're on my calendar. I'll text you a confirmation with the details.",
    involve_decision_maker: "That's important. Let's find a time that works for both of you.",
    lower_defensiveness: "Fair question, and I'd ask the same thing.",
    understand_the_no_without_pressure: "No problem at all. Can I ask what made it a no, so I don't bother you with the wrong thing?",
    protect_trust_and_understand: "I'm sorry you're dealing with all of that. There's no rush on anything.",
    default: "I hear you.",
  },
  educate: {
    answer_then_ask: "Good question. We'd start with the pricing and what buyers are paying nearby, then a plan you approve. Easiest is to show you in person. Want to set up a quick walkthrough?",
    default: "Good question. Here's how it works, in short: we look at the numbers together, then you decide.",
  },
  future_pace: { default: "Picture it a month from now: priced right, the right buyers coming through, and you choosing between offers." },
  challenge: { financial: "Can I push back a little? The cheapest option isn't always the one that leaves you with the most." },
  social_proof: { default: "A neighbor in a very similar spot felt the same way, and walking through the plan is what changed their mind." },
  mirror: {
    reflect_and_deepen: "That helps a lot. If we could line that up, how soon would you want to move on it?",
    default: "So what I'm hearing is you want to be sure before you commit.",
  },
  close: {
    two_window_choice: "Would tomorrow afternoon or Thursday evening work better for {meeting}?",
    direct_meeting_ask: "Let's set up {meeting}. Does tomorrow at five work?",
    default: "Would you be open to {meeting} this week?",
  },
};

const BUYER_LINES = {
  open_discovery: "What's most important to you in your next home?",
  discover_operational_need: "What would the right home need to have for you to move on it?",
  invite_them_to_open_up: "Fair enough. What's been the hardest part of the search so far?",
};
const TIME_RE = /\b((?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow)(?:\s+(?:at\s+\w+|morning|afternoon|evening))?)/i;

function mockLine(input) {
  const d = input.current_strategic_decision;
  const truth = input.current_conversation_truth;
  const buyer = /buyer/.test(String(input.lead_context?.lead_type ?? ""));
  if (buyer && d.action === "question" && BUYER_LINES[d.objective]) return BUYER_LINES[d.objective];
  // Echo a time the prospect already offered instead of proposing a different one
  const lastProspect = [...(truth.recent_turns ?? [])].reverse().find((t) => t.speaker === "prospect")?.text ?? "";
  const offered = lastProspect.match(TIME_RE)?.[1];
  if (d.action === "close" && offered) return `Great, let's lock in ${offered} for ${MEETING[truth.conversion?.type] ?? (buyer ? MEETING.tour : MEETING.walkthrough)}. Does that work for you?`;
  const root = truth.objection?.root?.[0] ?? (d.objective === "convert_info_request_to_next_step" ? "stall" : "unknown");
  const meeting = MEETING[truth.conversion?.type] ?? MEETING.walkthrough;
  const set = LINES[d.action] ?? LINES.question;
  const line = set[d.objective] ?? set[d.push_strength] ?? set[root] ?? set.default ?? Object.values(set)[0];
  return line.replace("{meeting}", meeting);
}

export function mockProvider({ delayMs = 0, fail = false, name = "mock" } = {}) {
  return {
    name,
    configured: true,
    async generate({ input, signal }) {
      if (delayMs) {
        await new Promise((resolve, reject) => {
          const timer = setTimeout(resolve, delayMs);
          signal?.addEventListener?.("abort", () => {
            clearTimeout(timer);
            const error = new Error("aborted");
            error.name = "AbortError";
            reject(error);
          }, { once: true });
        });
      }
      if (fail) throw new Error("mock failure");
      return { text: JSON.stringify({ response_text: mockLine(input) }), model: name };
    },
  };
}

// The provider the app uses: real when a key exists, otherwise the mock (and it says so)
export function defaultLlmProvider() {
  const choice = (process.env.AI_LLM_PROVIDER || "openai").toLowerCase();
  const provider = choice === "anthropic" ? anthropicProvider() : openAiProvider();
  return provider.configured ? provider : mockProvider({ name: "mock (no AI key configured)" });
}
