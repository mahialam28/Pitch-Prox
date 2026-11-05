// ── Subscription plans ──
// Taken from the public pricing section. Seeded with INSERT IGNORE on first
// start; the super admin edits them later (build plan step 2.3).
export const TRIAL_PLAN_ID = "free-trial";

export const PLANS = [
  { id: TRIAL_PLAN_ID, name: "Free Trial", description: "Try PitchProX with live AI guidance.", priceMonthlyCents: 0, priceAnnualCents: 0, callsPerMonth: 10, reportsPerMonth: 1, overageCentsPerCall: 0, isTrial: true, sortOrder: 0 },
  { id: "basic", name: "Basic", description: "Core live call guidance for solo agents.", priceMonthlyCents: 9900, priceAnnualCents: 8900, callsPerMonth: 150, reportsPerMonth: 5, overageCentsPerCall: 45, sortOrder: 1 },
  { id: "pro", name: "Pro", description: "More volume, more reports, and more control.", priceMonthlyCents: 19900, priceAnnualCents: 17900, callsPerMonth: 400, reportsPerMonth: 20, overageCentsPerCall: 45, sortOrder: 2 },
  { id: "elite", name: "Elite", description: "Built for high-volume closers and teams.", priceMonthlyCents: 34900, priceAnnualCents: 31400, callsPerMonth: 750, reportsPerMonth: 50, overageCentsPerCall: 35, sortOrder: 3 },
];
