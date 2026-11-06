import { createId, query } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { recordAudit } from "@/lib/audit";
import { TRIAL_PLAN_ID } from "@/lib/plan-catalog";

// ── Plan & Pricing Control (Super Admin; Support can view) ──
// Plans, promo codes and four settings documents (trial rules, enterprise defaults,
// report add-ons, billing rules). Charging customers uses these once Stripe is connected.

const money = (cents) => `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const text = (value, label, max, { required = false } = {}) => {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (required && !trimmed) throw new ApiError(`${label} is required.`);
  if (trimmed.length > max) throw new ApiError(`${label} must be ${max} characters or fewer.`);
  return trimmed || null;
};
const whole = (value, label, min, max) => {
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) throw new ApiError(`${label} must be a whole number from ${min} to ${max}.`);
  return number;
};
const cents = (value, label, max = 10000000) => {
  const number = Math.round(Number(value) * 100);
  if (!Number.isFinite(number) || number < 0 || number > max) throw new ApiError(`Enter a valid ${label}.`);
  return number;
};

// ── Plans ──
const presentPlan = (row) => ({
  id: row.id,
  name: row.name,
  description: row.description,
  status: row.active ? "Active" : "Archived",
  badge: row.badge,
  displayOrder: row.sort_order,
  isTrial: Boolean(row.is_trial),
  priceMonthlyCents: row.price_monthly_cents,
  // Per month when billed annually (the catalog convention), and the yearly total
  priceAnnualMonthlyCents: row.price_annual_cents,
  priceAnnualCents: row.price_annual_cents * 12,
  callsIncluded: row.calls_per_month,
  reportsIncluded: row.reports_per_month,
  calibrationsIncluded: row.calibrations_included,
  callOverageCents: row.overage_cents_per_call,
  reportOverageCents: row.report_overage_cents,
  subscribers: Number(row.subscribers ?? 0),
});

async function listAllPlans() {
  const rows = await query(
    `SELECT plans.*, (SELECT COUNT(*) FROM subscriptions WHERE subscriptions.plan_id = plans.id AND subscriptions.status <> 'canceled') AS subscribers
     FROM plans ORDER BY plans.active DESC, plans.sort_order, plans.name`
  );
  return rows.map(presentPlan);
}

const slug = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "plan";

function planFields(body, { trial = false } = {}) {
  const monthly = cents(body.monthlyPrice, "monthly price");
  // The dialog shows the yearly total; plans store the per-month price when billed annually
  const annualTotal = body.annualPrice === undefined || body.annualPrice === "" ? monthly * 12 : cents(body.annualPrice, "annual price");
  if (trial && (monthly !== 0 || annualTotal !== 0)) throw new ApiError("The free trial can't have a price.");
  if (!trial && monthly < 100) throw new ApiError("A paid plan needs a monthly price of at least $1.");
  if (annualTotal > monthly * 12) throw new ApiError("The annual price can't be more than 12 monthly payments.");
  return {
    name: text(body.name, "Plan name", 120, { required: true }),
    description: text(body.description, "Description", 500),
    badge: text(body.badge, "Badge", 40),
    sort_order: whole(body.displayOrder ?? 1, "Display order", 0, 99),
    price_monthly_cents: monthly,
    price_annual_cents: Math.round(annualTotal / 12),
    calls_per_month: whole(body.callsIncluded, "Calls included", 0, 100000),
    reports_per_month: whole(body.reportsIncluded, "Reports included", 0, 10000),
    calibrations_included: whole(body.calibrationsIncluded ?? 1, "Calibrations included", 0, 1000),
    overage_cents_per_call: cents(body.callOverageFee ?? 0, "call overage fee", 10000),
    report_overage_cents: cents(body.reportOverageFee ?? 0, "report overage fee", 100000),
    active: body.status === undefined || body.status === "Active" ? 1 : 0,
  };
}

export async function createPlan(user, body) {
  const fields = planFields(body);
  let id = slug(fields.name);
  if ((await query("SELECT id FROM plans WHERE id = ? OR name = ?", [id, fields.name])).length) {
    if ((await query("SELECT id FROM plans WHERE name = ?", [fields.name])).length) throw new ApiError("A plan with this name already exists.", 409);
    id = `${id}-${createId("p").slice(-4)}`;
  }
  const columns = Object.keys(fields);
  await query(`INSERT INTO plans (id, is_trial, ${columns.join(", ")}, updated_at) VALUES (?, 0, ${columns.map(() => "?").join(", ")}, NOW())`, [id, ...Object.values(fields)]);
  await recordAudit(user, { action: "pricing.plan_created", entityType: "plan", entityId: id, summary: `Created the ${fields.name} plan (${money(fields.price_monthly_cents)}/month)` });
  return (await listAllPlans()).find((plan) => plan.id === id);
}

export async function updatePlan(user, id, body) {
  const [existing] = await query("SELECT plans.*, (SELECT COUNT(*) FROM subscriptions WHERE plan_id = plans.id AND status <> 'canceled') AS subscribers FROM plans WHERE id = ?", [id]);
  if (!existing) throw new ApiError("Plan not found.", 404);
  const fields = planFields(body, { trial: Boolean(existing.is_trial) });
  if (existing.is_trial) fields.active = 1;
  if (!fields.active && Number(existing.subscribers) > 0) throw new ApiError(`${existing.subscribers} customer${Number(existing.subscribers) === 1 ? " is" : "s are"} on this plan. Move them to another plan before archiving it.`);
  const [clash] = await query("SELECT id FROM plans WHERE name = ? AND id <> ?", [fields.name, id]);
  if (clash) throw new ApiError("A plan with this name already exists.", 409);
  await query(`UPDATE plans SET ${Object.keys(fields).map((column) => `${column} = ?`).join(", ")}, updated_at = NOW() WHERE id = ?`, [...Object.values(fields), id]);
  const priceChanged = existing.price_monthly_cents !== fields.price_monthly_cents || existing.price_annual_cents !== fields.price_annual_cents;
  await recordAudit(user, {
    action: "pricing.plan_updated",
    entityType: "plan",
    entityId: id,
    summary: `Updated the ${fields.name} plan${priceChanged ? ` (price ${money(existing.price_monthly_cents)} → ${money(fields.price_monthly_cents)}/month; existing customers keep their price until they change plan)` : ""}`,
  });
  return (await listAllPlans()).find((plan) => plan.id === id);
}

// Plans with customers on them are archived, never deleted
export async function deletePlan(user, id) {
  const [existing] = await query("SELECT plans.*, (SELECT COUNT(*) FROM subscriptions WHERE plan_id = plans.id) AS subscriptions FROM plans WHERE id = ?", [id]);
  if (!existing) throw new ApiError("Plan not found.", 404);
  if (existing.is_trial) throw new ApiError("The free trial plan can't be deleted.");
  if (Number(existing.subscriptions) > 0) throw new ApiError("Customers have used this plan, so it can only be archived.");
  await query("DELETE FROM plans WHERE id = ?", [id]);
  await recordAudit(user, { action: "pricing.plan_deleted", entityType: "plan", entityId: id, summary: `Deleted the ${existing.name} plan` });
}

// ── Promo codes ──
const DISCOUNT_TYPES = {
  "Percentage Discount": "percent",
  "Fixed Amount": "fixed",
  "Free Reports": "free_reports",
  "Free Calls": "free_calls",
  "Trial Extension": "trial_days",
};
const TYPE_LABELS = Object.fromEntries(Object.entries(DISCOUNT_TYPES).map(([label, type]) => [type, label]));

const valueLabel = (type, value) =>
  ({ percent: `${value}% Off`, fixed: `${money(value)} Off`, free_reports: `${value} Reports`, free_calls: `${value} Calls`, trial_days: `${value} Days` })[type];

const promoStatus = (row, used) => {
  if (row.status === "paused") return "Paused";
  if (row.status === "archived") return "Archived";
  if (row.expires_at && new Date(row.expires_at) < new Date()) return "Expired";
  if (row.starts_at && new Date(row.starts_at) > new Date()) return "Scheduled";
  if (row.max_uses !== null && used >= row.max_uses) return "Used Up";
  return "Active";
};

const presentPromo = (row, plans) => {
  const used = Number(row.used ?? 0);
  const planIds = row.applies_to ? JSON.parse(row.applies_to) : null;
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    type: TYPE_LABELS[row.discount_type],
    discountType: row.discount_type,
    discountValue: row.discount_value,
    value: valueLabel(row.discount_type, row.discount_value),
    planIds,
    appliesTo: planIds ? planIds.map((id) => plans.find((plan) => plan.id === id)?.name ?? id).join(", ") : "All Plans",
    billingCycles: row.billing_cycles,
    minPurchaseCents: row.min_purchase_cents,
    maxUses: row.max_uses,
    perCustomerLimit: row.per_customer_limit,
    stackable: Boolean(row.stackable),
    startsAt: row.starts_at,
    expiresAt: row.expires_at,
    used,
    status: promoStatus(row, used),
    createdAt: row.created_at,
  };
};

const PROMO_SELECT = "SELECT promo_codes.*, (SELECT COUNT(*) FROM promo_redemptions WHERE promo_redemptions.promo_id = promo_codes.id) AS used FROM promo_codes";

async function listPromos(plans) {
  const rows = await query(`${PROMO_SELECT} WHERE promo_codes.status <> 'archived' ORDER BY promo_codes.created_at DESC`);
  return rows.map((row) => presentPromo(row, plans));
}

const date = (value, label) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) throw new ApiError(`Enter a valid ${label}.`);
  return parsed;
};

async function promoFields(body, { id = null } = {}) {
  const code = text(body.code, "Code", 40, { required: true }).toUpperCase().replace(/\s+/g, "");
  if (!/^[A-Z0-9_-]{3,40}$/.test(code)) throw new ApiError("Codes use 3–40 letters, numbers, - or _.");
  const [clash] = await query("SELECT id FROM promo_codes WHERE code = ? AND id <> ?", [code, id ?? ""]);
  if (clash) throw new ApiError("This code already exists.", 409);
  const discountType = DISCOUNT_TYPES[body.discountType] ?? body.discountType;
  if (!Object.values(DISCOUNT_TYPES).includes(discountType)) throw new ApiError("Choose a discount type.");
  let discountValue;
  if (discountType === "percent") discountValue = whole(body.discountValue, "Percentage", 1, 100);
  else if (discountType === "fixed") {
    discountValue = cents(body.discountValue, "amount");
    if (discountValue < 1) throw new ApiError("Enter an amount greater than $0.");
  } else discountValue = whole(body.discountValue, discountType === "trial_days" ? "Extra trial days" : "Quantity", 1, 10000);
  let planIds = Array.isArray(body.planIds) && body.planIds.length ? [...new Set(body.planIds.map(String))] : null;
  if (planIds) {
    const known = await query(`SELECT id FROM plans WHERE id IN (${planIds.map(() => "?").join(", ")})`, planIds);
    if (known.length !== planIds.length) throw new ApiError("Choose plans that exist.");
  }
  if (discountType === "trial_days") planIds = [TRIAL_PLAN_ID];
  const startsAt = date(body.startsAt, "start date");
  const expiresAt = date(body.expiresAt, "expiration date");
  if (startsAt && expiresAt && expiresAt <= startsAt) throw new ApiError("The expiration date must be after the start date.");
  if (expiresAt && expiresAt <= new Date() && body.status !== "Paused") throw new ApiError("The expiration date is in the past.");
  // No limit given = unlimited
  const unlimited = body.unlimitedUses === true || body.maxUses === null || body.maxUses === undefined || body.maxUses === "";
  const billingCycles = ["monthly", "annual"].includes(body.billingCycles) ? body.billingCycles : "any";
  const perCustomerLimit = whole(body.perCustomerLimit ?? 1, "Uses per customer", 1, 100);
  const maxUses = unlimited ? null : whole(body.maxUses, "Maximum uses", 1, 1000000);
  if (maxUses !== null && maxUses < perCustomerLimit) throw new ApiError("Maximum uses can't be lower than the uses allowed per customer.");
  const minPurchaseCents = cents(body.minPurchase ?? 0, "minimum purchase");

  // The code has to be usable on at least one eligible plan
  const eligible = await query("SELECT price_monthly_cents AS monthly, price_annual_cents AS annualMonthly, is_trial AS isTrial FROM plans WHERE active = 1");
  const eligiblePlans = planIds
    ? await query(`SELECT price_monthly_cents AS monthly, price_annual_cents AS annualMonthly, is_trial AS isTrial FROM plans WHERE id IN (${planIds.map(() => "?").join(", ")})`, planIds)
    : eligible.filter((plan) => !plan.isTrial);
  const highestPrice = Math.max(
    0,
    ...eligiblePlans.map((plan) => (billingCycles === "monthly" ? plan.monthly : billingCycles === "annual" ? plan.annualMonthly * 12 : Math.max(plan.monthly, plan.annualMonthly * 12)))
  );
  if (discountType !== "trial_days" && planIds && eligiblePlans.every((plan) => plan.isTrial)) throw new ApiError("Discounts apply to paid plans. Use a Trial Extension code for the free trial.");
  if (discountType === "fixed" && discountValue > highestPrice) throw new ApiError(`A ${money(discountValue)} discount is more than any eligible plan costs (${money(highestPrice)}).`);
  if (minPurchaseCents > highestPrice && discountType !== "trial_days") throw new ApiError(`No eligible plan reaches the ${money(minPurchaseCents)} minimum purchase.`);
  if (discountType === "trial_days" && minPurchaseCents > 0) throw new ApiError("Trial extensions can't have a minimum purchase.");
  if (discountType === "trial_days" && billingCycles !== "any") throw new ApiError("Trial extensions don't depend on a billing cycle.");
  if (discountType === "percent" && discountValue === 100 && maxUses === null) throw new ApiError("A 100% discount needs a usage limit.");
  return {
    code,
    name: text(body.name, "Name", 120) ?? code,
    description: text(body.description, "Description", 500),
    discount_type: discountType,
    discount_value: discountValue,
    applies_to: planIds ? JSON.stringify(planIds) : null,
    billing_cycles: billingCycles,
    min_purchase_cents: minPurchaseCents,
    max_uses: maxUses,
    per_customer_limit: perCustomerLimit,
    stackable: body.stackable ? 1 : 0,
    starts_at: startsAt,
    expires_at: expiresAt,
    status: body.status === "Paused" ? "paused" : "active",
  };
}

export async function createPromo(user, body) {
  const fields = await promoFields(body);
  const id = createId("promo");
  const columns = Object.keys(fields);
  await query(`INSERT INTO promo_codes (id, ${columns.join(", ")}, created_by) VALUES (?, ${columns.map(() => "?").join(", ")}, ?)`, [id, ...Object.values(fields), user.id]);
  await recordAudit(user, { action: "pricing.promo_created", entityType: "promo_code", entityId: id, summary: `Created promo code ${fields.code} (${valueLabel(fields.discount_type, fields.discount_value)})` });
  return getPromo(id);
}

async function getPromo(id) {
  const [row] = await query(`${PROMO_SELECT} WHERE promo_codes.id = ?`, [id]);
  if (!row) throw new ApiError("Promo code not found.", 404);
  return presentPromo(row, await listAllPlans());
}

export async function updatePromo(user, id, body) {
  const existing = await getPromo(id);
  const fields = await promoFields(body, { id });
  // A used code keeps its code and discount, so past redemptions stay meaningful
  if (existing.used > 0 && (fields.code !== existing.code || fields.discount_type !== existing.discountType || fields.discount_value !== existing.discountValue)) {
    throw new ApiError("This code has been used, so its code and discount can't change. Pause it and create a new one.");
  }
  if (fields.max_uses !== null && fields.max_uses < existing.used) throw new ApiError(`This code was already used ${existing.used} times; the limit can't be lower.`);
  await query(`UPDATE promo_codes SET ${Object.keys(fields).map((column) => `${column} = ?`).join(", ")}, updated_at = NOW() WHERE id = ?`, [...Object.values(fields), id]);
  await recordAudit(user, { action: "pricing.promo_updated", entityType: "promo_code", entityId: id, summary: `Updated promo code ${fields.code}` });
  return getPromo(id);
}

// Never-used codes are deleted; used codes are archived so their history stays
export async function deletePromo(user, id) {
  const existing = await getPromo(id);
  if (existing.used > 0) await query("UPDATE promo_codes SET status = 'archived', updated_at = NOW() WHERE id = ?", [id]);
  else await query("DELETE FROM promo_codes WHERE id = ?", [id]);
  await recordAudit(user, { action: "pricing.promo_deleted", entityType: "promo_code", entityId: id, summary: `${existing.used > 0 ? "Archived" : "Deleted"} promo code ${existing.code}` });
  return { archived: existing.used > 0 };
}

// Checkout / plan change: is this code valid for this plan and billing cycle? (client item 60)
export async function validatePromo({ code, planId, billingCycle = "monthly", organizationId = null }) {
  const normalized = typeof code === "string" ? code.trim().toUpperCase() : "";
  if (!normalized) throw new ApiError("Enter a promo code.");
  const [row] = await query(`${PROMO_SELECT} WHERE promo_codes.code = ?`, [normalized]);
  const invalid = (message) => ({ valid: false, code: normalized, message });
  if (!row || row.status === "archived") return invalid("This promo code doesn't exist.");
  const plans = await listAllPlans();
  const promo = presentPromo(row, plans);
  if (promo.status === "Paused") return invalid("This promo code isn't active right now.");
  if (promo.status === "Expired") return invalid("This promo code has expired.");
  if (promo.status === "Scheduled") return invalid("This promo code isn't active yet.");
  if (promo.status === "Used Up") return invalid("This promo code has reached its limit.");
  const plan = plans.find((item) => item.id === planId && item.status === "Active");
  if (!plan) return invalid("Choose a plan first.");
  if (promo.planIds && !promo.planIds.includes(plan.id)) return invalid(`This code works with ${promo.appliesTo} only.`);
  if (!promo.planIds && plan.isTrial && promo.discountType !== "trial_days") return invalid("This code works with paid plans only.");
  if (promo.billingCycles !== "any" && promo.billingCycles !== billingCycle) return invalid(`This code works with ${promo.billingCycles} billing only.`);
  const priceCents = billingCycle === "annual" ? plan.priceAnnualCents : plan.priceMonthlyCents;
  if (priceCents < promo.minPurchaseCents) return invalid(`This code needs a purchase of at least ${money(promo.minPurchaseCents)}.`);
  if (organizationId) {
    const [{ uses }] = await query("SELECT COUNT(*) AS uses FROM promo_redemptions WHERE promo_id = ? AND organization_id = ?", [promo.id, organizationId]);
    if (Number(uses) >= promo.perCustomerLimit) return invalid("This promo code was already used on this account.");
  }
  const amountOffCents = promo.discountType === "percent" ? Math.round((priceCents * promo.discountValue) / 100) : promo.discountType === "fixed" ? Math.min(priceCents, promo.discountValue) : 0;
  return {
    valid: true,
    code: promo.code,
    promoId: promo.id,
    discount: { type: promo.discountType, value: promo.discountValue, label: promo.value },
    amountOffCents,
    totalCents: priceCents - amountOffCents,
    message: amountOffCents ? `${promo.value}: you save ${money(amountOffCents)}.` : `${promo.value} added.`,
  };
}

// Records a use of a validated code for an account (account creation / checkout)
export async function redeemPromo(promoId, organizationId) {
  await query("INSERT INTO promo_redemptions (id, promo_id, organization_id) VALUES (?, ?, ?)", [createId("redeem"), promoId, organizationId]);
  await query("UPDATE subscriptions SET promo_code_id = ? WHERE organization_id = ?", [promoId, organizationId]);
}

// ── Settings documents ──
export const PRICING_DEFAULTS = {
  trial: {
    trialDuration: "7",
    durationUnit: "Days",
    newAccountsOnly: true,
    oneTrialPerOrg: true,
    requirePaymentMethod: false,
    aiCalls: "10",
    reports: "1",
    calibrations: "1",
    whenTrialEnds: "Restrict premium features",
    preserveDataFor: "30 days",
    autoConvertToPaid: false,
    allowAdminExtension: true,
    notify3DaysBefore: true,
    notify1DayBefore: true,
    notifyAtExpiration: true,
    sendEmailAndInApp: true,
  },
  enterprise: {
    price: "5,000",
    billingCycle: "Annual",
    contractTerm: "12 months",
    onboardingFee: "500",
    currency: "USD",
    customCallLimits: true,
    callLimitsValue: "2,000",
    customReportLimits: true,
    reportLimitsValue: "50",
    unlimitedMembers: true,
    overagePricing: "Defined per contract",
  },
  reportAddOns: {
    enabled: true,
    tiers: [
      { id: 1, reports: "5", price: "25.00", active: true },
      { id: 2, reports: "15", price: "60.00", active: true },
      { id: 3, reports: "30", price: "99.00", active: true },
      { id: 4, reports: "50", price: "149.00", active: true },
    ],
    allowStacking: true,
    reportRollover: false,
    maxBundlesPerCycle: "10",
  },
  billingRules: {
    annualDiscount: "20",
    gracePeriod: "3",
    retrySchedule: "3 attempts (1, 3, 7 days)",
    autoRenew: true,
    trialAutoConvert: true,
    reportRollover: false,
    callRollover: false,
  },
};

// Plain JSON only: strings, numbers, booleans, and lists/objects of them
const plainJson = (value, depth = 0) => {
  if (depth > 4) return false;
  if (value === null || ["string", "number", "boolean"].includes(typeof value)) return typeof value !== "string" || value.length <= 500;
  if (Array.isArray(value)) return value.length <= 50 && value.every((item) => plainJson(item, depth + 1));
  if (typeof value === "object") return Object.keys(value).length <= 60 && Object.values(value).every((item) => plainJson(item, depth + 1));
  return false;
};

const CHECKS = {
  trial: (value) => {
    whole(Number(value.trialDuration), "Trial length", 1, 90);
    whole(Number(value.aiCalls), "Trial calls", 0, 1000);
    whole(Number(value.reports), "Trial reports", 0, 100);
    whole(Number(value.calibrations), "Trial calibrations", 0, 100);
  },
  enterprise: (value) => {
    cents(String(value.price).replace(/,/g, ""), "enterprise price");
    cents(String(value.onboardingFee ?? 0).replace(/,/g, ""), "onboarding fee");
  },
  reportAddOns: (value) => {
    if (!Array.isArray(value.tiers) || !value.tiers.length) throw new ApiError("Add at least one report bundle.");
    value.tiers.forEach((tier) => {
      whole(Number(tier.reports), "Reports per bundle", 1, 10000);
      if (cents(tier.price, "bundle price") < 100) throw new ApiError("Each bundle needs a price of at least $1.");
    });
    whole(Number(value.maxBundlesPerCycle), "Bundles per cycle", 1, 100);
  },
  billingRules: (value) => {
    whole(Number(value.annualDiscount), "Annual discount", 0, 90);
    whole(Number(value.gracePeriod), "Grace period", 0, 60);
  },
};

export async function getSettings() {
  const rows = await query("SELECT setting_key AS settingKey, value FROM pricing_settings");
  const stored = Object.fromEntries(rows.map((row) => [row.settingKey, JSON.parse(row.value)]));
  return Object.fromEntries(Object.entries(PRICING_DEFAULTS).map(([key, defaults]) => [key, { ...defaults, ...(stored[key] ?? {}) }]));
}

export async function saveSetting(user, key, value) {
  if (!CHECKS[key]) throw new ApiError("Unknown setting.", 404);
  if (!value || typeof value !== "object" || Array.isArray(value) || !plainJson(value)) throw new ApiError("Invalid settings.");
  const merged = { ...PRICING_DEFAULTS[key], ...value };
  CHECKS[key](merged);
  await query("INSERT INTO pricing_settings (setting_key, value, updated_by) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value), updated_by = VALUES(updated_by)", [key, JSON.stringify(merged), user.id]);
  // The trial's allowance is also the Free Trial plan's limits
  if (key === "trial") await query("UPDATE plans SET calls_per_month = ?, reports_per_month = ?, calibrations_included = ?, updated_at = NOW() WHERE id = ?", [Number(merged.aiCalls), Number(merged.reports), Number(merged.calibrations), TRIAL_PLAN_ID]);
  const labels = { trial: "trial rules", enterprise: "enterprise defaults", reportAddOns: "report add-ons", billingRules: "billing rules" };
  await recordAudit(user, { action: "pricing.settings_updated", entityType: "pricing_settings", entityId: key, summary: `Updated the ${labels[key]}` });
  return merged;
}

// ── The page ──
export async function pricingOverview() {
  const plans = await listAllPlans();
  const [revenue] = await query(
    `SELECT COUNT(*) AS paying,
       COALESCE(SUM(CASE WHEN subscriptions.billing_cycle = 'annual' THEN plans.price_annual_cents ELSE plans.price_monthly_cents END * COALESCE(customer_accounts.seats, 1)), 0) AS mrrCents
     FROM subscriptions JOIN plans ON plans.id = subscriptions.plan_id
     LEFT JOIN customer_accounts ON customer_accounts.organization_id = subscriptions.organization_id
     WHERE subscriptions.status = 'active' AND plans.is_trial = 0`
  );
  const [{ trialing }] = await query("SELECT COUNT(*) AS trialing FROM subscriptions WHERE status = 'trialing'");
  const promos = await listPromos(plans);
  return {
    plans,
    promoCodes: promos,
    settings: await getSettings(),
    stats: {
      activePlans: plans.filter((plan) => plan.status === "Active").length,
      payingCustomers: Number(revenue.paying),
      mrrCents: Number(revenue.mrrCents),
      trialing: Number(trialing),
      activePromos: promos.filter((promo) => promo.status === "Active").length,
      promoRedemptions: promos.reduce((sum, promo) => sum + promo.used, 0),
    },
  };
}
