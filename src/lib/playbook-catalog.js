// ── Platform playbooks every customer sees ──
// Seeded into the `playbooks` table on first start (INSERT IGNORE, so later
// edits made by the super admin are never overwritten). Customers' own custom
// playbooks live in the same table with their organization_id.

export const STANDARD_PLAYBOOK_ID = "pitchprox-standard";

export const CATALOG = [
  {
    id: STANDARD_PLAYBOOK_ID,
    kind: "standard",
    title: "PitchProX Standard",
    subtitle: "Factory Default",
    description: "Our proven framework built on emotional intelligence, trust-building, and strategic conversation flow.",
    iconLetter: "PS",
  },
  {
    id: "spin-selling",
    kind: "premium",
    title: "SPIN Selling",
    subtitle: "Neil Rackham",
    description: "Ask better questions. Discover needs. Guide to value. A classic methodology for consultative selling.",
    priceCents: 4900,
    avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "challenger-sale",
    kind: "premium",
    title: "Challenger Sale",
    subtitle: "Matthew Dixon",
    description: "Teach, challenge, and take control of the sale. Differentiate with insights that drive change.",
    priceCents: 4900,
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "sandler-selling",
    kind: "premium",
    title: "Sandler Selling System",
    subtitle: "David Sandler",
    description: "Build rapport, uncover pain, and lead with questions. A system for long-term sales success.",
    priceCents: 4900,
    iconLetter: "S",
  },
  {
    id: "herjavec-method",
    kind: "premium",
    title: "Herjavec Sales Method",
    subtitle: "Robert Herjavec",
    description: "Real-world, no-nonsense tactics from Shark Tank's Robert Herjavec. Build trust, add value, close bigger deals.",
    priceCents: 4900,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "daniel-g-method",
    kind: "premium",
    title: "Daniel G. Method",
    subtitle: "Daniel G.",
    description: "Emotional connection, storytelling, and influence. A high-impact method for modern sellers.",
    priceCents: 4900,
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "meddic",
    kind: "premium",
    title: "MEDDIC",
    subtitle: "Andy Whyte",
    description: "Qualify like a pro. Identify pain, quantify impact, and build unstoppable business cases.",
    priceCents: 4900,
    iconLetter: "MEDDIC",
  },
];
