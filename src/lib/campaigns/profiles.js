import { query } from "@/lib/db";
import { getSettings } from "@/lib/pricing";
import { CUSTOMER_ROLES } from "@/utils.js/roles";

// ── Customer profiles for Campaigns & Journeys ──
// One row per PitchProX customer user (account owners and team members), with every field
// segment rules and journey conditions can test (lib/campaigns/rules).
//   • Call usage: live calls this billing period against the plan's allowance + bonus calls.
//   • Payment status: from the subscription state until Stripe reports real payments.
//   • Email engagement: from opens in the outbox (once an email service reports them).

const DAY = 86400000;
const iso = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const SUBSCRIPTION_LABELS = { active: "Active", trialing: "Trialing", pending_payment: "Pending Payment", past_due: "Past Due", paused: "Paused", canceled: "Canceled" };
const PAYMENT_LABELS = { active: "Paid", paused: "Paid", past_due: "Failed", pending_payment: "No Payment Method", trialing: "No Payment Method", canceled: "Paid" };

function trialDays(settings) {
  const amount = Number.parseInt(settings.trial?.trialDuration, 10) || 7;
  const unit = String(settings.trial?.durationUnit ?? "Days").toLowerCase();
  return unit.startsWith("week") ? amount * 7 : unit.startsWith("month") ? amount * 30 : amount;
}

// userIds: limit to these users (e.g. one user when a journey re-checks their state)
export async function loadProfiles({ userIds = null, now = new Date() } = {}) {
  if (userIds && !userIds.length) return [];
  const clauses = [`users.role IN (${CUSTOMER_ROLES.map(() => "?").join(", ")})`, "COALESCE(customer_accounts.status, 'active') <> 'deleted'"];
  const values = [...CUSTOMER_ROLES];
  if (userIds) {
    clauses.push(`users.id IN (${userIds.map(() => "?").join(", ")})`);
    values.push(...userIds);
  }
  const rows = await query(
    `SELECT users.id, users.name, users.email, users.role, users.created_at AS createdAt, users.organization_id AS organizationId,
      organizations.name AS company, customer_accounts.source, customer_accounts.created_at AS accountCreatedAt, customer_accounts.status AS accountStatus,
      plans.id AS planId, plans.name AS planName, plans.is_trial AS isTrial, plans.calls_per_month AS callsIncluded,
      subscriptions.status AS subscriptionStatus, subscriptions.cancel_at_period_end AS cancelScheduled,
      subscriptions.current_period_start AS periodStart, subscriptions.current_period_end AS periodEnd,
      (SELECT MAX(created_at) FROM login_events WHERE login_events.user_id = users.id AND login_events.success = 1) AS lastLoginAt,
      (SELECT COUNT(*) FROM calibration_sessions WHERE calibration_sessions.user_id = users.id) AS calibrations,
      (SELECT COALESCE(SUM(quantity), 0) FROM account_adjustments WHERE account_adjustments.organization_id = users.organization_id AND account_adjustments.kind = 'calls' AND account_adjustments.status = 'applied' AND account_adjustments.decided_at >= COALESCE(subscriptions.current_period_start, '1970-01-01')) AS bonusCalls,
      (SELECT COUNT(*) FROM calls WHERE calls.organization_id = users.organization_id AND calls.mode = 'live' AND calls.status = 'completed' AND calls.started_at >= COALESCE(subscriptions.current_period_start, '1970-01-01')) AS callsUsed
     FROM users
     JOIN organizations ON organizations.id = users.organization_id
     LEFT JOIN customer_accounts ON customer_accounts.organization_id = users.organization_id
     LEFT JOIN subscriptions ON subscriptions.organization_id = users.organization_id
     LEFT JOIN plans ON plans.id = subscriptions.plan_id
     WHERE ${clauses.join(" AND ")}
     ORDER BY users.created_at DESC LIMIT 20000`,
    values
  );
  if (!rows.length) return [];
  const ids = rows.map((row) => row.id);
  const orgIds = [...new Set(rows.map((row) => row.organizationId))];
  const inList = (list) => list.map(() => "?").join(", ");

  const [tags, fields, features, engagement, upgrades, settings] = await Promise.all([
    query(`SELECT user_id AS userId, tag FROM customer_user_tags WHERE user_id IN (${inList(ids)})`, ids),
    query(`SELECT user_id AS userId, field, value FROM customer_user_fields WHERE user_id IN (${inList(ids)})`, ids),
    query(
      `SELECT organizations.id AS organizationId,
        (SELECT COUNT(*) FROM leads WHERE leads.organization_id = organizations.id) AS leads,
        (SELECT COUNT(*) FROM prospects WHERE prospects.organization_id = organizations.id) AS prospects,
        (SELECT COUNT(*) FROM playbooks WHERE playbooks.organization_id = organizations.id) + (SELECT COUNT(*) FROM playbook_purchases WHERE playbook_purchases.organization_id = organizations.id) AS playbooks,
        (SELECT COUNT(*) FROM training_assets WHERE training_assets.organization_id = organizations.id) AS training
       FROM organizations WHERE organizations.id IN (${inList(orgIds)})`,
      orgIds
    ),
    query(
      `SELECT user_id AS userId, SUM(status = 'sent') AS sent, SUM(opened_at IS NOT NULL) AS opened, SUM(clicked_at IS NOT NULL) AS clicked
       FROM email_deliveries WHERE user_id IN (${inList(ids)}) AND created_at >= ? GROUP BY user_id`,
      [...ids, new Date(now.getTime() - 90 * DAY)]
    ),
    // Upgrades in the last 30 days (old/new monthly value are kept in the audit metadata)
    query(
      `SELECT entity_id AS organizationId, metadata FROM audit_logs WHERE action = 'billing.plan_changed' AND created_at >= ? AND entity_id IN (${inList(orgIds)})`,
      [new Date(now.getTime() - 30 * DAY), ...orgIds]
    ),
    getSettings(),
  ]);
  const days = trialDays(settings);

  const tagsBy = new Map();
  for (const row of tags) tagsBy.set(row.userId, [...(tagsBy.get(row.userId) ?? []), row.tag]);
  const fieldsBy = new Map();
  for (const row of fields) fieldsBy.set(row.userId, { ...(fieldsBy.get(row.userId) ?? {}), [row.field]: row.value });
  const featuresBy = new Map(features.map((row) => [row.organizationId, row]));
  const engagementBy = new Map(engagement.map((row) => [row.userId, row]));
  const upgradedOrgs = new Set(
    upgrades
      .filter((row) => {
        const meta = typeof row.metadata === "string" ? JSON.parse(row.metadata) : row.metadata ?? {};
        return meta.toMonthlyCents != null && meta.fromMonthlyCents != null && meta.toMonthlyCents > meta.fromMonthlyCents;
      })
      .map((row) => row.organizationId)
  );

  return rows.map((row) => {
    const onTrialPlan = Boolean(row.isTrial);
    const selfSignup = row.source === "self_signup";
    const trialStartAt = onTrialPlan ? row.periodStart ?? row.accountCreatedAt : selfSignup ? row.accountCreatedAt : null;
    const trialEndAt = trialStartAt ? (onTrialPlan && row.periodEnd ? new Date(row.periodEnd) : new Date(new Date(trialStartAt).getTime() + days * DAY)) : null;
    const trialStatus = onTrialPlan ? (trialEndAt && trialEndAt < now ? "Trial Expired" : "Active Trial") : selfSignup ? "Converted" : "No Trial";

    let subscriptionStatus = SUBSCRIPTION_LABELS[row.subscriptionStatus] ?? "Canceled";
    if (row.subscriptionStatus === "active" && Number(row.cancelScheduled)) subscriptionStatus = "Cancellation Scheduled";
    const callsIncluded = Number(row.callsIncluded ?? 0) + Number(row.bonusCalls ?? 0);
    const callsUsed = Number(row.callsUsed ?? 0); // live calls this period (practice calls don't count)

    const org = featuresBy.get(row.organizationId) ?? {};
    const featureUsage = [
      Number(org.leads) && "Leads",
      Number(org.prospects) && "CRM",
      Number(org.playbooks) && "Playbooks",
      Number(org.training) && "AI Training",
      Number(row.calibrations) && "Calibration",
    ].filter(Boolean);

    const mail = engagementBy.get(row.id);
    const sent = Number(mail?.sent ?? 0);
    const openRate = sent ? Number(mail.opened) / sent : 0;
    const emailEngagement = !sent ? "None" : openRate >= 0.4 ? "High" : openRate >= 0.15 ? "Medium" : "Low";

    const userTags = [...(tagsBy.get(row.id) ?? [])];
    if (upgradedOrgs.has(row.organizationId)) userTags.push("Recently Upgraded");

    return {
      id: row.id,
      name: row.name,
      email: row.email,
      initials: row.name.split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
      role: row.role,
      company: row.company,
      organizationId: row.organizationId,
      accountStatus: row.accountStatus ?? "active",
      planId: row.planId,
      plan: row.planName ?? "No plan",
      subscriptionStatus,
      trialStatus,
      trialStart: iso(trialStartAt),
      trialEnd: iso(trialEndAt),
      callUsagePct: callsIncluded ? Math.round((callsUsed / callsIncluded) * 100) : 0,
      callsRemaining: Math.max(0, callsIncluded - callsUsed),
      calibrationStatus: Number(row.calibrations) ? "Completed" : "Not Started",
      paymentStatus: PAYMENT_LABELS[row.subscriptionStatus] ?? "No Payment Method",
      lastLogin: iso(row.lastLoginAt),
      lastLoginAt: row.lastLoginAt,
      lastCallDate: null,
      signupDate: iso(row.createdAt),
      signupAt: row.createdAt,
      tags: userTags,
      emailEngagement,
      featureUsage,
      fields: fieldsBy.get(row.id) ?? {},
    };
  });
}
