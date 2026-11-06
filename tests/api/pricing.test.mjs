// Phase 3: Plan & Pricing Control — plans, promo codes (with validation at checkout) and pricing settings.
// Uses the demo staff from `npm run db:seed` (skipped when they aren't there).
import { test } from "node:test";
import assert from "node:assert/strict";
import { RUN, actor, newCustomer, signIn } from "./helpers.mjs";

const PASSWORD = "password-123";
const [superAdmin, support, rep, manager] = await Promise.all(
  ["sarah.johnson", "emily.brown", "ryan.anderson", "mike.davis"].map((name) => signIn(`${name}@pitchprox.test`, PASSWORD).catch(() => null))
);
const needsStaff = () => ({ skip: !(superAdmin && support && rep && manager) && "demo staff not seeded (npm run test:db)" });
const PLAN = { name: `Team ${RUN}`, description: "For small teams", displayOrder: 5, monthlyPrice: 299, annualPrice: 2868, callsIncluded: 1000, reportsIncluded: 30, calibrationsIncluded: 5, callOverageFee: 0.3, reportOverageFee: 4 };

test("pricing: Super Admin and Support can view; others can't", needsStaff(), async () => {
  const page = await superAdmin.get("/api/v1/admin/pricing");
  assert.equal(page.status, 200);
  assert.ok(page.json.plans.some((plan) => plan.id === "free-trial" && plan.isTrial));
  assert.deepEqual(Object.keys(page.json.settings).sort(), ["billingRules", "enterprise", "reportAddOns", "trial"]);
  assert.equal((await support.get("/api/v1/admin/pricing")).status, 200);
  assert.equal((await rep.get("/api/v1/admin/pricing")).status, 403);
  assert.equal((await manager.get("/api/v1/admin/pricing")).status, 403);
  assert.equal((await support.post("/api/v1/admin/plans", PLAN)).status, 403, "Support views only");
});

let planId;
test("plans: create, validate, update, archive rules", needsStaff(), async () => {
  assert.equal((await superAdmin.post("/api/v1/admin/plans", { ...PLAN, name: "" })).status, 400);
  assert.equal((await superAdmin.post("/api/v1/admin/plans", { ...PLAN, monthlyPrice: 0 })).status, 400, "paid plans need a price");
  assert.equal((await superAdmin.post("/api/v1/admin/plans", { ...PLAN, annualPrice: 99999 })).status, 400, "annual can't exceed 12 months");
  const created = await superAdmin.post("/api/v1/admin/plans", PLAN);
  assert.equal(created.status, 201, JSON.stringify(created.json));
  planId = created.json.plan.id;
  assert.deepEqual([created.json.plan.priceMonthlyCents, created.json.plan.priceAnnualCents, created.json.plan.callsIncluded], [29900, 286800, 1000]);
  assert.equal((await superAdmin.post("/api/v1/admin/plans", PLAN)).status, 409, "names are unique");
  // Customers see it in the plan picker
  assert.ok((await rep.get("/api/v1/plans")).json.results.some((plan) => plan.id === planId));
  const updated = await superAdmin.patch(`/api/v1/admin/plans/${planId}`, { ...PLAN, monthlyPrice: 249, annualPrice: "", badge: "New" });
  assert.equal(updated.status, 200);
  assert.deepEqual([updated.json.plan.priceMonthlyCents, updated.json.plan.priceAnnualCents, updated.json.plan.badge], [24900, 298800, "New"]);
  // The trial can't get a price; a plan with customers can't be archived
  assert.equal((await superAdmin.patch("/api/v1/admin/plans/free-trial", { ...PLAN, name: "Free Trial", monthlyPrice: 10 })).status, 400);
  assert.match((await superAdmin.patch("/api/v1/admin/plans/basic", { ...PLAN, name: "Basic", status: "Archived" })).json.error ?? "", /customer|Move them/);
});

let promoId;
test("promo codes: create, validate at checkout, protect used codes", needsStaff(), async () => {
  const code = `SAVE${RUN}`.toUpperCase().slice(0, 20);
  assert.equal((await superAdmin.post("/api/v1/admin/promo-codes", { code: "x", discountType: "Percentage Discount", discountValue: 20 })).status, 400);
  assert.equal((await superAdmin.post("/api/v1/admin/promo-codes", { code, discountType: "Percentage Discount", discountValue: 120 })).status, 400);
  assert.equal((await superAdmin.post("/api/v1/admin/promo-codes", { code, discountType: "Percentage Discount", discountValue: 20, startsAt: "2027-02-01", expiresAt: "2027-01-01" })).status, 400);
  const created = await superAdmin.post("/api/v1/admin/promo-codes", { code: code.toLowerCase(), name: "Twenty off", discountType: "Percentage Discount", discountValue: 20, planIds: [planId], maxUses: 100 });
  assert.equal(created.status, 201, JSON.stringify(created.json));
  promoId = created.json.promoCode.id;
  assert.deepEqual([created.json.promoCode.code, created.json.promoCode.value, created.json.promoCode.status, created.json.promoCode.appliesTo], [code, "20% Off", "Active", `Team ${RUN}`]);
  assert.equal((await superAdmin.post("/api/v1/admin/promo-codes", { code, discountType: "Fixed Amount", discountValue: 10 })).status, 409);

  // Validation (any signed-in user)
  const customer = await newCustomer("promo");
  const ok = await customer.post("/api/v1/promo-codes/validate", { code: code.toLowerCase(), planId });
  assert.equal(ok.status, 200);
  assert.deepEqual([ok.json.valid, ok.json.amountOffCents, ok.json.totalCents], [true, 4980, 19920]);
  const wrongPlan = (await customer.post("/api/v1/promo-codes/validate", { code, planId: "basic" })).json;
  assert.equal(wrongPlan.valid, false);
  assert.match(wrongPlan.message, /works with/);
  assert.equal((await customer.post("/api/v1/promo-codes/validate", { code: "NOPE-NOPE", planId })).json.valid, false);
  assert.equal((await customer.post("/api/v1/promo-codes/validate", { code: "", planId })).status, 400);
  assert.equal((await actor().post("/api/v1/promo-codes/validate", { code, planId })).status, 401);

  // Paused and scheduled codes don't validate
  assert.equal((await superAdmin.patch(`/api/v1/admin/promo-codes/${promoId}`, { code, discountType: "percent", discountValue: 20, planIds: [planId], maxUses: 100, status: "Paused" })).json.promoCode.status, "Paused");
  assert.match((await customer.post("/api/v1/promo-codes/validate", { code, planId })).json.message, /isn't active/);
  const scheduled = await superAdmin.patch(`/api/v1/admin/promo-codes/${promoId}`, { code, discountType: "percent", discountValue: 20, planIds: [planId], maxUses: 100, startsAt: "2099-01-01" });
  assert.equal(scheduled.json.promoCode.status, "Scheduled");
  assert.match((await customer.post("/api/v1/promo-codes/validate", { code, planId })).json.message, /isn't active yet/);

  // Never-used codes are deleted
  assert.deepEqual((await superAdmin.del(`/api/v1/admin/promo-codes/${promoId}`)).json, { archived: false });
  assert.ok(!(await superAdmin.get("/api/v1/admin/pricing")).json.promoCodes.some((promo) => promo.id === promoId));
});

test("settings: trial rules update the Free Trial plan; values are checked", needsStaff(), async () => {
  const before = (await superAdmin.get("/api/v1/admin/pricing")).json.settings.trial;
  assert.equal((await superAdmin.put("/api/v1/admin/pricing-settings/trial", { ...before, trialDuration: "0" })).status, 400);
  assert.equal((await superAdmin.put("/api/v1/admin/pricing-settings/unknown", {})).status, 404);
  assert.equal((await superAdmin.put("/api/v1/admin/pricing-settings/trial", { ...before, nested: { a: { b: { c: { d: { e: 1 } } } } } })).status, 400);
  const saved = await superAdmin.put("/api/v1/admin/pricing-settings/trial", { ...before, aiCalls: "12", trialDuration: "14" });
  assert.equal(saved.status, 200);
  const trial = (await superAdmin.get("/api/v1/admin/pricing")).json.plans.find((plan) => plan.id === "free-trial");
  assert.equal(trial.callsIncluded, 12);
  // Put the defaults back for other tests
  await superAdmin.put("/api/v1/admin/pricing-settings/trial", before);
  assert.equal((await superAdmin.put("/api/v1/admin/pricing-settings/reportAddOns", { tiers: [] })).status, 400);
  const addOns = await superAdmin.put("/api/v1/admin/pricing-settings/reportAddOns", { tiers: [{ id: 1, reports: "10", price: "40.00", active: true }], maxBundlesPerCycle: "5" });
  assert.equal(addOns.json.settings.tiers.length, 1);
  assert.equal((await support.put("/api/v1/admin/pricing-settings/billingRules", { annualDiscount: "10" })).status, 403);
});

test("plans: an unused plan can be deleted", needsStaff(), async () => {
  assert.equal((await superAdmin.del("/api/v1/admin/plans/free-trial")).status, 400);
  assert.equal((await superAdmin.del(`/api/v1/admin/plans/${planId}`)).status, 200);
  assert.ok(!(await rep.get("/api/v1/plans")).json.results.some((plan) => plan.id === planId));
});

test("promo codes: contradictory settings are refused (client item 60)", needsStaff(), async () => {
  const base = { code: `RULE${RUN}`.toUpperCase().slice(0, 20), discountType: "Fixed Amount", discountValue: 10 };
  const refuse = async (body, pattern) => {
    const res = await superAdmin.post("/api/v1/admin/promo-codes", { ...base, ...body });
    assert.equal(res.status, 400, JSON.stringify(body));
    if (pattern) assert.match(res.json.error, pattern);
  };
  await refuse({ discountValue: 100000, planIds: ["basic"], billingCycles: "monthly" }, /more than any eligible plan/);
  await refuse({ minPurchase: 100000 }, /minimum purchase/);
  await refuse({ expiresAt: "2020-01-01" }, /in the past/);
  await refuse({ maxUses: 1, perCustomerLimit: 3 }, /lower than the uses allowed per customer/);
  await refuse({ planIds: ["free-trial"] }, /Trial Extension/);
  await refuse({ discountType: "Percentage Discount", discountValue: 100, unlimitedUses: true }, /usage limit/);
  await refuse({ discountType: "Trial Extension", discountValue: 7, minPurchase: 10 }, /minimum purchase/);
  // A trial extension always targets the free trial
  const trialCode = await superAdmin.post("/api/v1/admin/promo-codes", { code: `TRIAL${RUN}`.toUpperCase().slice(0, 20), discountType: "Trial Extension", discountValue: 7 });
  assert.equal(trialCode.status, 201, JSON.stringify(trialCode.json));
  assert.deepEqual([trialCode.json.promoCode.planIds, trialCode.json.promoCode.value], [["free-trial"], "7 Days"]);
});

test("promo codes: a rep's new account redeems a valid code; invalid codes stop the sale", needsStaff(), async () => {
  const code = `REP${RUN}`.toUpperCase().slice(0, 20);
  const created = await superAdmin.post("/api/v1/admin/promo-codes", { code, discountType: "Percentage Discount", discountValue: 15, planIds: ["pro"], maxUses: 5 });
  assert.equal(created.status, 201, JSON.stringify(created.json));
  const account = (label, promoCode, planId = "pro") => rep.post("/api/v1/customers", { fullName: `${label} Owner`, company: `${label} Co ${RUN}`, email: `${label}-${RUN}@customer.test`, planId, billingCycle: "monthly", seats: 1, promoCode });
  const wrongPlan = await account("promo-basic", code, "basic");
  assert.equal(wrongPlan.status, 400);
  assert.match(wrongPlan.json.error, /works with Pro only/);
  assert.equal((await rep.get("/api/v1/customers")).json.results.some((item) => item.company === `promo-basic Co ${RUN}`), false, "nothing was created");
  assert.equal((await account("promo-pro", code)).status, 201);
  let promo = (await superAdmin.get("/api/v1/admin/pricing")).json.promoCodes.find((item) => item.code === code);
  assert.equal(promo.used, 1);
  // Used codes keep their discount, can't drop below their uses, and are archived instead of deleted
  assert.equal((await superAdmin.patch(`/api/v1/admin/promo-codes/${promo.id}`, { code, discountType: "Percentage Discount", discountValue: 50, planIds: ["pro"], maxUses: 5 })).status, 400);
  assert.equal((await superAdmin.patch(`/api/v1/admin/promo-codes/${promo.id}`, { code, discountType: "Percentage Discount", discountValue: 15, planIds: ["pro"], maxUses: 0 })).status, 400);
  assert.deepEqual((await superAdmin.del(`/api/v1/admin/promo-codes/${promo.id}`)).json, { archived: true });
  promo = (await superAdmin.get("/api/v1/admin/pricing")).json.promoCodes.find((item) => item.code === code);
  assert.equal(promo, undefined, "archived codes leave the list");
  assert.match((await rep.post("/api/v1/promo-codes/validate", { code, planId: "pro" })).json.message, /doesn't exist/);
});
