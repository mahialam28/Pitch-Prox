import { query } from "@/lib/db";
import { leaderboard } from "@/lib/sales-team";

// ── Performance Analytics (Super Admin) ──
// Built from subscriptions, customer accounts, plan changes, cancellations, leads and
// support tickets. Revenue is the monthly value of subscriptions (plan price × seats);
// money actually collected waits for Stripe, and call/AI costs wait for calling.
// Trends compare with a daily snapshot (analytics_snapshots), so they fill in over time.

const DAY = 86400000;
const MONTHLY_VALUE = "(CASE WHEN subscriptions.billing_cycle = 'annual' THEN plans.price_annual_cents ELSE plans.price_monthly_cents END) * COALESCE(customer_accounts.seats, 1)";
const FROM_ACCOUNTS = `FROM customer_accounts
  JOIN subscriptions ON subscriptions.organization_id = customer_accounts.organization_id
  JOIN plans ON plans.id = subscriptions.plan_id
  JOIN organizations ON organizations.id = customer_accounts.organization_id`;
// Paying = active subscription on a paid plan, account not suspended/deleted
const PAYING = "subscriptions.status = 'active' AND plans.is_trial = 0 AND COALESCE(customer_accounts.status, 'active') = 'active'";

const pct = (part, whole) => (whole ? Math.round((part / whole) * 1000) / 10 : null);
const dayKey = (date) => date.toISOString().slice(0, 10);

async function totals() {
  const [row] = await query(
    `SELECT COALESCE(SUM(CASE WHEN ${PAYING} THEN ${MONTHLY_VALUE} ELSE 0 END), 0) AS mrrCents,
      SUM(${PAYING}) AS active, SUM(subscriptions.status = 'trialing') AS trialing, SUM(subscriptions.status = 'paused') AS paused, COUNT(*) AS accounts
     ${FROM_ACCOUNTS}`
  );
  return { mrrCents: Number(row.mrrCents), active: Number(row.active ?? 0), trialing: Number(row.trialing ?? 0), paused: Number(row.paused ?? 0), accounts: Number(row.accounts) };
}

// Today's totals are saved once a day; returns the last 31 days of snapshots
async function snapshots(today) {
  await query(
    "INSERT IGNORE INTO analytics_snapshots (day, mrr_cents, active_subscribers, trialing, paused, total_accounts) VALUES (?, ?, ?, ?, ?, ?)",
    [dayKey(new Date()), today.mrrCents, today.active, today.trialing, today.paused, today.accounts]
  );
  const rows = await query("SELECT day, mrr_cents AS mrrCents, active_subscribers AS active, trialing FROM analytics_snapshots WHERE day >= ? ORDER BY day", [dayKey(new Date(Date.now() - 31 * DAY))]);
  return rows.map((row) => ({ day: row.day, mrrCents: Number(row.mrrCents), active: Number(row.active), trialing: Number(row.trialing) }));
}

export async function businessAnalytics() {
  const now = new Date();
  const monthAgo = new Date(now.getTime() - 30 * DAY);
  const twoMonthsAgo = new Date(now.getTime() - 60 * DAY);
  const today = await totals();
  const history = await snapshots(today);
  const baseline = history.find((row) => row.day <= dayKey(monthAgo)) ?? null;

  // New paying accounts and cancellations in the last 30 days (and the 30 before)
  const [flow] = await query(
    `SELECT SUM(${PAYING} AND customer_accounts.created_at >= ?) AS newPaying,
      SUM(${PAYING} AND customer_accounts.created_at >= ? AND customer_accounts.created_at < ?) AS newPayingBefore,
      SUM(subscriptions.cancel_at_period_end = 1 AND subscriptions.cancel_requested_at >= ?) AS canceled,
      SUM(subscriptions.cancel_at_period_end = 1 AND subscriptions.cancel_requested_at >= ? AND subscriptions.cancel_requested_at < ?) AS canceledBefore,
      COALESCE(SUM(CASE WHEN subscriptions.cancel_at_period_end = 1 AND subscriptions.cancel_requested_at >= ? THEN ${MONTHLY_VALUE} ELSE 0 END), 0) AS canceledMrrCents,
      SUM(customer_accounts.source = 'self_signup') AS selfSignups,
      SUM(customer_accounts.source = 'self_signup' AND ${PAYING}) AS selfSignupsPaying
     ${FROM_ACCOUNTS}`,
    [monthAgo, twoMonthsAgo, monthAgo, monthAgo, twoMonthsAgo, monthAgo, monthAgo]
  );
  const newPaying = Number(flow.newPaying ?? 0);
  const canceled = Number(flow.canceled ?? 0);
  const canceledBefore = Number(flow.canceledBefore ?? 0);

  const kpis = {
    mrrCents: today.mrrCents,
    mrrBeforeCents: baseline?.mrrCents ?? null,
    netAccountGrowth: newPaying - canceled,
    netAccountGrowthPct: pct(newPaying - canceled, today.active || null),
    newPaying,
    activeSubscribers: today.active,
    activeBefore: baseline?.active ?? null,
    trialConversion: pct(Number(flow.selfSignupsPaying ?? 0), Number(flow.selfSignups ?? 0)),
    churnRate: pct(canceled, today.active + canceled),
    churnBefore: pct(canceledBefore, today.active + canceledBefore),
    canceled,
    revenueChurn: pct(Number(flow.canceledMrrCents), today.mrrCents + Number(flow.canceledMrrCents)),
    trialing: today.trialing,
  };

  // Revenue by plan (monthly value of paying subscriptions) + playbook sales in the last 30 days
  const byPlan = await query(
    `SELECT plans.id, plans.name, COUNT(*) AS accounts, COALESCE(SUM(${MONTHLY_VALUE}), 0) AS mrrCents ${FROM_ACCOUNTS} WHERE ${PAYING} GROUP BY plans.id, plans.name, plans.sort_order ORDER BY mrrCents DESC`
  );
  const [playbookSales] = await query(
    "SELECT COUNT(*) AS purchases, COALESCE(SUM(playbooks.price_cents), 0) AS cents FROM playbook_purchases JOIN playbooks ON playbooks.id = playbook_purchases.playbook_id WHERE playbook_purchases.purchased_at >= ?",
    [monthAgo]
  );

  // Plan changes in the last 30 days (old and new monthly value are in the audit metadata)
  const changes = await query(
    `SELECT audit_logs.entity_id AS organizationId, organizations.name AS company, audit_logs.summary, audit_logs.metadata, audit_logs.created_at AS createdAt
     FROM audit_logs LEFT JOIN organizations ON organizations.id = audit_logs.entity_id
     WHERE audit_logs.action = 'billing.plan_changed' AND audit_logs.created_at >= ? ORDER BY audit_logs.created_at DESC LIMIT 200`,
    [monthAgo]
  );
  const planChanges = changes.map((row) => {
    const meta = typeof row.metadata === "string" ? JSON.parse(row.metadata) : row.metadata ?? {};
    const diff = meta.toMonthlyCents != null && meta.fromMonthlyCents != null ? meta.toMonthlyCents - meta.fromMonthlyCents : null;
    return { organizationId: row.organizationId, company: row.company, summary: row.summary, createdAt: row.createdAt, direction: diff == null ? "change" : diff > 0 ? "upgrade" : diff < 0 ? "downgrade" : "change", diffCents: diff };
  });

  // Upgrade prospects: trials and accounts on the cheapest paid plan that are actively signing in
  const prospects = await query(
    `SELECT customer_accounts.organization_id AS id, organizations.name AS company, plans.name AS planName, plans.is_trial AS isTrial, customer_accounts.seats,
      subscriptions.status, subscriptions.current_period_end AS periodEnd,
      (SELECT COUNT(*) FROM login_events JOIN users ON users.id = login_events.user_id WHERE users.organization_id = customer_accounts.organization_id AND login_events.success = 1 AND login_events.created_at >= ?) AS logins7d,
      (SELECT COUNT(*) FROM leads WHERE leads.organization_id = customer_accounts.organization_id) AS leads,
      reps.name AS repName
     ${FROM_ACCOUNTS} LEFT JOIN users AS reps ON reps.id = customer_accounts.account_rep_id
     WHERE COALESCE(customer_accounts.status, 'active') = 'active' AND subscriptions.cancel_at_period_end = 0
       AND (subscriptions.status = 'trialing' OR (${PAYING} AND plans.sort_order = (SELECT MIN(sort_order) FROM plans WHERE is_trial = 0 AND active = 1)))
     ORDER BY logins7d DESC, leads DESC LIMIT 8`,
    [new Date(now.getTime() - 7 * DAY)]
  );

  // At-risk accounts
  const risky = await query(
    `SELECT customer_accounts.organization_id AS id, organizations.name AS company, plans.name AS planName, subscriptions.status,
      subscriptions.cancel_at_period_end AS cancelScheduled, subscriptions.cancel_reason AS cancelReason, subscriptions.paused_until AS pausedUntil,
      customer_accounts.created_at AS createdAt, ${MONTHLY_VALUE} AS mrrCents, reps.name AS repName,
      (SELECT MAX(login_events.created_at) FROM login_events JOIN users ON users.id = login_events.user_id WHERE users.organization_id = customer_accounts.organization_id AND login_events.success = 1) AS lastLoginAt,
      (SELECT COUNT(*) FROM support_tickets WHERE support_tickets.organization_id = customer_accounts.organization_id AND support_tickets.status NOT IN ('Resolved', 'Closed') AND support_tickets.priority IN ('urgent', 'high')) AS urgentTickets
     ${FROM_ACCOUNTS} LEFT JOIN users AS reps ON reps.id = customer_accounts.account_rep_id
     WHERE COALESCE(customer_accounts.status, 'active') = 'active' AND plans.is_trial = 0`
  );
  const riskAccounts = risky
    .map((row) => {
      const reasons = [];
      let score = 0;
      if (Number(row.cancelScheduled)) { reasons.push(`Cancelling${row.cancelReason ? `: ${row.cancelReason}` : ""}`); score += 50; }
      if (row.status === "paused") { reasons.push("Paused"); score += 30; }
      if (row.status === "pending_payment" && new Date(row.createdAt) < new Date(now.getTime() - 7 * DAY)) { reasons.push("Waiting for first payment over a week"); score += 25; }
      const idleDays = row.lastLoginAt ? Math.floor((now - new Date(row.lastLoginAt)) / DAY) : null;
      if (idleDays == null && new Date(row.createdAt) < new Date(now.getTime() - 7 * DAY)) { reasons.push("Never signed in"); score += 25; }
      else if (idleDays != null && idleDays >= 14) { reasons.push(`No sign-in for ${idleDays} days`); score += Math.min(30, idleDays); }
      if (Number(row.urgentTickets)) { reasons.push(`${row.urgentTickets} urgent/high ticket${Number(row.urgentTickets) === 1 ? "" : "s"} open`); score += 15; }
      return { id: row.id, company: row.company, planName: row.planName, mrrCents: Number(row.mrrCents), repName: row.repName, lastLoginAt: row.lastLoginAt, reasons, risk: Math.min(100, score) };
    })
    .filter((row) => row.reasons.length)
    .sort((a, b) => b.risk - a.risk || b.mrrCents - a.mrrCents)
    .slice(0, 20);

  // Cancellation reasons (all time, from the cancel dialog)
  const reasons = await query(
    "SELECT COALESCE(NULLIF(cancel_reason, ''), 'Not given') AS reason, COUNT(*) AS count FROM subscriptions WHERE cancel_at_period_end = 1 GROUP BY reason ORDER BY count DESC"
  );

  // Rep quota attainment this month (bonus eligibility at 100%)
  const board = await leaderboard({ period: "month" });

  // Lead funnel for the insights
  const [leads] = await query(
    `SELECT COUNT(*) AS total, SUM(created_at >= ?) AS new30, SUM(stage IN ('Qualified', 'Appointment Set')) AS qualified FROM leads WHERE organization_id = 'org_pitchprox_internal'`,
    [monthAgo]
  );
  const [tickets] = await query(
    "SELECT SUM(status NOT IN ('Resolved', 'Closed')) AS open, SUM(created_at >= ?) AS new30 FROM support_tickets",
    [monthAgo]
  );

  const insights = [];
  const top = [...board.reps].sort((a, b) => b.revenueCents - a.revenueCents)[0];
  if (top?.revenueCents) insights.push({ id: "top-rep", tone: "positive", title: `${top.name} leads ${board.label} with $${Math.round(top.revenueCents / 100).toLocaleString("en-US")} booked`, detail: `${top.closed} account${top.closed === 1 ? "" : "s"} closed this month.` });
  const behind = board.reps.filter((rep) => rep.attainment != null && rep.attainment < 50);
  if (behind.length) insights.push({ id: "behind", tone: "warning", title: `${behind.length} rep${behind.length === 1 ? " is" : "s are"} under 50% of quota`, detail: behind.map((rep) => rep.name).join(", ") });
  if (Number(leads.total)) insights.push({ id: "leads", tone: "neutral", title: `${Number(leads.new30 ?? 0)} new leads in the last 30 days`, detail: `${pct(Number(leads.qualified ?? 0), Number(leads.total))}% of all PitchProX leads are qualified or have an appointment.` });
  if (newPaying) insights.push({ id: "new-paying", tone: "positive", title: `${newPaying} new paying account${newPaying === 1 ? "" : "s"} in 30 days`, detail: Number(flow.newPayingBefore ?? 0) ? `${Number(flow.newPayingBefore)} in the 30 days before.` : "First month with this data." });
  const upgrades = planChanges.filter((change) => change.direction === "upgrade").length;
  const downgrades = planChanges.filter((change) => change.direction === "downgrade").length;
  if (upgrades || downgrades) insights.push({ id: "plan-moves", tone: upgrades >= downgrades ? "positive" : "warning", title: `${upgrades} upgrade${upgrades === 1 ? "" : "s"} and ${downgrades} downgrade${downgrades === 1 ? "" : "s"} in 30 days`, detail: "From plan changes made on customer accounts." });
  if (canceled) insights.push({ id: "cancels", tone: "warning", title: `${canceled} cancellation${canceled === 1 ? "" : "s"} requested in 30 days`, detail: reasons[0] ? `Most common reason: ${reasons[0].reason}.` : "" });
  if (Number(tickets.new30 ?? 0)) insights.push({ id: "support", tone: "neutral", title: `${Number(tickets.new30)} support tickets in 30 days`, detail: `${Number(tickets.open ?? 0)} still open.` });

  // Operational alerts
  const alerts = [
    canceled > canceledBefore && canceled >= 2 && { id: "churn", tone: "danger", title: "Churn spike detected", detail: `${canceled} cancellations in 30 days (vs ${canceledBefore} before).` },
    riskAccounts.length && { id: "risk", tone: "warning", title: `${riskAccounts.length} account${riskAccounts.length === 1 ? "" : "s"} at risk`, detail: `${riskAccounts.filter((row) => row.risk >= 50).length} high risk.` },
    behind.length && { id: "quota", tone: "warning", title: "Reps behind on quota", detail: `${behind.length} under 50% this month.` },
    upgrades && { id: "upgrades", tone: "positive", title: "Upgrades this month", detail: `${upgrades} account${upgrades === 1 ? "" : "s"} moved to a bigger plan.` },
    newPaying && { id: "growth", tone: "positive", title: "New paying accounts", detail: `${newPaying} in the last 30 days.` },
  ].filter(Boolean);

  return {
    generatedAt: now.toISOString(),
    historyDays: history.length,
    kpis,
    history,
    revenue: {
      totalCents: today.mrrCents,
      byPlan: byPlan.map((row) => ({ id: row.id, name: row.name, accounts: Number(row.accounts), mrrCents: Number(row.mrrCents) })),
      playbookSales: { purchases: Number(playbookSales.purchases), cents: Number(playbookSales.cents) },
    },
    upgrades: { upgrades, downgrades, changes: planChanges.slice(0, 10), prospects: prospects.map((row) => ({ ...row, isTrial: Boolean(row.isTrial), logins7d: Number(row.logins7d), leads: Number(row.leads) })) },
    unitEconomics: { arpuCents: today.active ? Math.round(today.mrrCents / today.active) : null },
    bonus: { label: board.label, reps: board.reps },
    insights,
    cancellations: { total: reasons.reduce((sum, row) => sum + Number(row.count), 0), reasons: reasons.map((row) => ({ reason: row.reason, count: Number(row.count) })) },
    riskAccounts,
    alerts,
  };
}
