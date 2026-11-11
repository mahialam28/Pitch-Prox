import { callUsage, reportUsage } from "@/lib/calls";
import { query } from "@/lib/db";
import { TRIAL_PLAN_ID } from "@/lib/plan-catalog";

const money = (cents) => `$${(cents / 100).toFixed(cents % 100 ? 2 : 0)}`;

const presentPlan = (row) => ({
  id: row.id,
  name: row.name,
  description: row.description,
  priceMonthly: money(row.price_monthly_cents),
  priceAnnual: money(row.price_annual_cents),
  priceMonthlyCents: row.price_monthly_cents,
  priceAnnualCents: row.price_annual_cents,
  callsPerMonth: row.calls_per_month,
  reportsPerMonth: row.reports_per_month,
  overagePerCall: money(row.overage_cents_per_call),
  isTrial: Boolean(row.is_trial),
});

export async function listPlans() {
  return (await query("SELECT * FROM plans WHERE active = 1 ORDER BY sort_order")).map(presentPlan);
}

// Every company has a subscription; one that predates billing starts on the Free Trial
export async function getSubscription(organizationId) {
  const select = () => query("SELECT subscriptions.status, subscriptions.billing_cycle, subscriptions.current_period_start, subscriptions.current_period_end, subscriptions.paused_until, subscriptions.cancel_at_period_end, subscriptions.scheduled_plan_id, subscriptions.scheduled_cycle, plans.* FROM subscriptions JOIN plans ON plans.id = subscriptions.plan_id WHERE subscriptions.organization_id = ?", [organizationId]);
  let [row] = await select();
  if (!row) {
    await query("INSERT IGNORE INTO subscriptions (organization_id, plan_id, status, current_period_start) VALUES (?, ?, 'trialing', CURRENT_TIMESTAMP)", [organizationId, TRIAL_PLAN_ID]);
    [row] = await select();
  }
  const plan = presentPlan(row);
  return {
    plan,
    status: row.status,
    billingCycle: row.billing_cycle,
    currentPeriodStart: row.current_period_start,
    currentPeriodEnd: row.current_period_end,
    pausedUntil: row.paused_until ?? null,
    cancelAtPeriodEnd: Boolean(row.cancel_at_period_end),
    scheduledPlanId: row.scheduled_plan_id ?? null,
    scheduledCycle: row.scheduled_cycle ?? null,
    // Live calls this period (practice calls don't count); reports are counted with AI-4
    usage: {
      calls: { used: (await callUsage(organizationId)).used, total: plan.callsPerMonth },
      reports: { used: (await reportUsage(organizationId)).used, total: plan.reportsPerMonth },
    },
  };
}

export async function listInvoices(organizationId) {
  const rows = await query("SELECT id, number, description, amount_cents AS amountCents, status, issued_at AS issuedAt FROM invoices WHERE organization_id = ? ORDER BY issued_at DESC", [organizationId]);
  return rows.map((row) => ({ ...row, amount: money(row.amountCents) }));
}
