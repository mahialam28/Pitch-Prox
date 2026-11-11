// Practice calls: a simulated prospect for each common lead type. The prospect's lines are fixed;
// everything PitchProX shows (state, strategy, the exact line to say) comes from the real Core,
// so a practice call shows exactly how live coaching behaves before phone calls are connected.
// "Role-play" lets the user type the prospect's side instead.

export const PRACTICE_SCRIPTS = [
  {
    id: "fsbo_commission",
    title: "For sale by owner: \"we don't want to pay a commission\"",
    lead_type: "FSBO",
    prospect_name: "Dana Whitfield",
    opener: "Hi, this is {rep} with {company}. I saw your home on Maple Street is for sale by owner. Do you have a minute?",
    lines: [
      "Yeah, we're selling it ourselves. We really don't want to pay a commission.",
      "Honestly, six percent is just too much money for what agents do.",
      "I hear you, but the commission is still the problem for us.",
      "Okay, that makes sense. How would that work for our house, though?",
      "Hm. My husband would want to be there for anything like that.",
      "He's home after five most days. Thursday at six could work.",
      "Yes, Thursday at six works for us. See you then.",
    ],
  },
  {
    id: "expired_guarded",
    title: "Expired listing: guarded, burned by the last agent",
    lead_type: "Expired",
    prospect_name: "Marcus Lee",
    opener: "Hi, this is {rep} with {company}, calling about your home on Oak Street that came off the market.",
    lines: [
      "Yeah.",
      "Not great.",
      "Honestly our last agent did nothing. It sat for six months with two showings and we got burned.",
      "We need to move by June for my job, so we can't wait another six months, and I think the price was off.",
      "What would you do differently, though? How would you price it?",
      "That actually makes sense. When could you come by to see it?",
      "Saturday at ten works for me.",
    ],
  },
  {
    id: "think_about_it",
    title: "\"I need to think about it\" (decision maker not on the call)",
    lead_type: "Absentee Owner",
    prospect_name: "Priya Shah",
    opener: "Hi, this is {rep} with {company}. I'm calling about the rental on Pine Street. Have you thought about selling it?",
    lines: [
      "We've talked about it, the tenants leave in the spring.",
      "I don't know. I need to think about it and talk to my husband, he isn't here right now.",
      "He handles most of the money side of things.",
      "Maybe, that could be good if he can join.",
      "Tuesday at six works for both of us.",
    ],
  },
  {
    id: "buyer_tour",
    title: "Open house buyer: ready to see homes",
    lead_type: "Open House Buyer",
    lead_side: "buyer",
    prospect_name: "Jordan Kim",
    opener: "Hi, this is {rep} with {company}. Thanks for stopping by the open house on Sunday. What did you think?",
    lines: [
      "It was nice, but the kitchen was smaller than we wanted.",
      "We need three bedrooms and something closer to the school, our daughter starts in the fall.",
      "How soon could we see a few homes like that?",
      "Yes, can we see some homes Saturday morning?",
      "Saturday at ten works for me.",
    ],
  },
  {
    id: "do_not_call",
    title: "Prospect asks not to be called",
    lead_type: "Circle Prospecting",
    prospect_name: "Alex Moreno",
    opener: "Hi, this is {rep} with {company}. We just sold a home on your street and I was curious if you've thought about what yours is worth?",
    lines: [
      "How did you get my number?",
      "Take me off your list and do not call me again.",
    ],
  },
];

export const practiceScript = (id) => PRACTICE_SCRIPTS.find((script) => script.id === id) ?? null;

// The list the setup screen shows (no lines)
export const practiceScriptOptions = () => PRACTICE_SCRIPTS.map(({ id, title, lead_type, prospect_name }) => ({ id, title, leadType: lead_type, prospectName: prospect_name }));
