// Phrase lists for the rule-based interpreter. They are evidence for an interpretation, never the
// decision by themselves (Spec 01 §5): the interpreter combines them with the call state.

const TIME = [
  /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)s?\b/,
  /\b(tomorrow|tonight|this weekend|next week|this week|this afternoon|this evening|this morning)\b/,
  /\b\d{1,2}(:\d\d)?\s?(am|pm|a\.m\.|p\.m\.)\b/,
  /\b\d{1,2} ?o'?clock\b/,
  /\b(in the morning|in the afternoon|in the evening|after work|lunch ?time)\b/,
];

export const LEXICON = {
  objections: [
    { id: "financial:commission", categories: ["financial"], label: "Commission / fee", patterns: ["commission", "commissions", "fee", "fees", /\b\d(\.\d)?\s?(%|percent)\b/, "percent", "listing fee"] },
    { id: "financial:price", categories: ["financial"], label: "Price / cost", patterns: ["too expensive", "expensive", "afford", "too much", "cheaper", "discount", "budget", "cost", "costs", "price is", "can't spend", "too much money", "not paying that"] },
    { id: "financial:value", categories: ["financial"], label: "Value for money", patterns: ["worth it", "not worth", "what do i get", "what would i get", "why would i pay", "why pay"] },
    { id: "risk:past_failure", categories: ["risk"], label: "Bad past experience", patterns: ["last agent", "bad experience", "got burned", "burned", "didn't sell", "never sold", "nothing happened", "waste of time", "wasted", "they did nothing", "it didn't work"] },
    { id: "risk:uncertainty", categories: ["risk"], label: "Uncertainty / risk", patterns: ["not sure", "worried", "risky", "risk", "guarantee", "what if", "scared", "nervous"] },
    { id: "risk:trust", categories: ["risk", "relationship"], label: "Trust in the agent", patterns: ["scam", "don't trust", "how do i know", "heard that before", "you all say that", "you guys all say"] },
    { id: "logistics:timing", categories: ["logistics"], label: "Timing", patterns: ["not ready", "not right now", "not now", "next year", "later this year", "too busy", "busy right now", "bad timing", "wait until", "after the holidays", "in the spring", "few months"] },
    { id: "logistics:situation", categories: ["logistics"], label: "Situation / access", patterns: ["tenants", "renovating", "repairs first", "still living", "can't get in", "out of town"] },
    { id: "relationship:existing", categories: ["relationship"], label: "Already has someone", patterns: ["already have an agent", "already have a realtor", "already have a coach", "have a coach", "my cousin", "my friend is", "my brother is an agent", "working with someone", "working with an agent", "loyal to", "someone i know"] },
    { id: "relationship:diy", categories: ["relationship", "financial"], label: "Selling on their own", patterns: ["sell it myself", "selling it myself", "on my own", "by owner", "fsbo", "don't need an agent", "don't need a realtor", "do it myself"] },
  ],

  stalls: [
    { id: "think_about_it", patterns: ["think about it", "think it over", "let me think", "need to think", "sleep on it", "mull it over"] },
    { id: "send_info", patterns: ["send me something", "send me some info", "send me information", "send me an email", "email me", "send it over", "send me the details", "mail me something"] },
    { id: "call_later", patterns: ["call me later", "call me back", "call back later", "try me next", "reach out later"] },
  ],

  boundaries: [
    { type: "do_not_contact", patterns: ["don't call", "do not call", "stop calling", "take me off", "remove me", "remove my number", "never call", "lose my number", "don't contact"] },
    { type: "representation", patterns: ["signed with", "under contract with", "already listed with", "exclusive with", "we signed"] },
    { type: "legal", patterns: ["my lawyer", "my attorney", "harassment", "report you", "sue"] },
    { type: "privacy", patterns: ["how did you get my number", "where did you get my number", "who gave you my number"] },
  ],

  sensitive: [
    { type: "deceased", patterns: ["passed away", "died", "deceased", "funeral", "estate", "probate", "my late", "since mom passed", "since dad passed"] },
    { type: "divorce", patterns: ["divorce", "divorcing", "separated", "my ex"] },
    { type: "illness", patterns: ["sick", "cancer", "hospital", "health issues"] },
    { type: "hardship", patterns: ["foreclosure", "behind on payments", "lost my job", "can't pay the mortgage"] },
  ],

  decisionMakers: ["wife", "husband", "spouse", "partner", "my brother", "my sister", "my mom", "my dad", "co-owner", "on title", "my son", "my daughter", "business partner"],
  absent: ["talk to my", "ask my", "check with my", "run it by", "discuss it with", "isn't here", "is not here", "isn't home", "is not home", "not home", "talk to him", "talk to her", "ask him", "ask her", "handles all of this", "handles all that", "makes the decisions", "has to agree", "needs to see it", "handles the money", "handles most of the money", "handles the finances", "handles most of", "does the finances", "would want to be there", "want to be there", "needs to be there", "has to be there", "would need to be there", "wants to be there", "at work right now", "without my", "she decides", "he decides", "they decide"],
  present: ["we're both here", "she's right here", "he's right here", "both of us are here", "my wife is here", "my husband is here", "on speaker", "works for both of us", "works for us", "both of us can", "we can both", "he can join", "she can join", "he'll be there", "she'll be there", "he's home after", "she's home after", "we'll both be"],

  meetings: [
    { type: "walkthrough", patterns: ["walk through", "walkthrough", "come by", "come over", "see the house", "see the property", "see the place", "see the home", "look at the house", "look at the property", "stop by", "quick look", "take a look together", "look at it together"] },
    { type: "tour", patterns: ["showing", "tour", "see some homes", "see homes", "see a few homes", "view the house", "look at homes"] },
    { type: "strategy_meeting", patterns: ["meet", "meeting", "sit down", "coffee", "your office", "my office", "zoom", "video call", "appointment"] },
  ],
  time: TIME,

  accept: ["that works", "works for me", "sounds good", "see you then", "let's do it", "let's do", "book it", "perfect", "deal", "i'll be there", "we'll be there", "count me in", "that's fine", "sure", "yes", "yeah", "ok", "okay", "alright"],
  // Interest, never a confirmation (Spec 09: confirmed needs an explicit yes)
  hedges: ["could be good", "could work", "might work", "maybe", "possibly", "i guess", "probably", "i think so", "we'll see"],
  firmAccept: ["that works", "works for me", "works for us", "works for both of us", "see you then", "book it", "i'll be there", "we'll be there", "confirmed", "it's a date", "let's do it"],
  decline: ["no thanks", "no thank you", "not interested", "i'll pass", "not for me", "i'm good", "we're good", "no"],
  agreement: ["makes sense", "that's true", "true", "fair enough", "fair", "good point", "i agree", "exactly", "right", "you're right", "that's right", "yes", "yeah", "sure", "okay", "ok"],
  disagreement: ["that's not true", "not really", "i don't think so", "that's not it", "no it's not", "i disagree", "that's wrong", "nope"],
  accusation: ["you're just", "you people", "lying", "liar", "scam", "you just want", "all you care about"],
  future: ["when could", "when can", "how soon", "what would", "what's the next step", "next step", "how does it work", "how would it work", "what's the process", "if we", "would you", "could you", "when would", "how long would", "what happens after", "we'd want", "we would"],
  hostileQuestion: ["why do you keep", "who do you think", "why would i ever", "what makes you think", "are you serious"],
  questionWords: /^(what|when|where|who|why|how|which|can|could|would|will|do|does|did|is|are|should)\b/,
  positive: ["great", "good", "love", "like that", "interesting", "nice", "glad", "happy", "excited", "appreciate", "helpful", "awesome", "makes sense", "sounds good", "thanks", "thank you"],
  negative: ["frustrated", "annoyed", "angry", "upset", "terrible", "awful", "hate", "tired of", "fed up", "ridiculous", "waste", "bad", "worried", "stress", "stressed", "overwhelmed", "confused"],
  problem: ["the problem is", "the issue is", "we need", "i need", "we want", "i want", "our goal", "trying to", "we're hoping", "what failed", "didn't work because", "the reason"],
  value: ["that would help", "that helps", "that's helpful", "i like that", "that's different", "never thought", "good idea", "that makes sense", "interesting", "that's what we need"],
  disclosure: ["honestly", "to be honest", "the truth is", "between us", "i'll be honest", "we're actually", "the real reason", "what happened was", "we had", "we've been", "my situation"],
  pressure: ["you need to", "you have to", "you must", "last chance", "right now or", "trust me", "you'd be crazy", "everyone else", "don't you want"],
  laughter: ["haha", "lol", "(laughs)", "[laughter]"],
};
