import { query } from "@/lib/db";
import { requireCurrentUser } from "@/lib/auth";
import { ROLE_LABELS, ROLES, STAFF_ROLES, canAccessSection } from "@/utils.js/roles";

// ── Sales overview dashboard (Sales Rep and Super Admin dashboards) ──
// A rep sees their own pipeline and accounts; admins with the Dashboard section see the whole company.
// Call-based scores (prompt adherence, trust gain) stay empty until calling is connected.

export async function requireDashboardUser() {
  const user = await requireCurrentUser();
  if (user.role === ROLES.SALES_REP) return { user, ownOnly: true };
  if (canAccessSection(user.role, "dashboard")) return { user, ownOnly: false };
  throw new Error("FORBIDDEN");
}

const percent = (part, whole) => (whole ? Math.round((Number(part) / Number(whole)) * 1000) / 10 : 0);
const money = (cents) => `$${Math.round(cents / 100).toLocaleString("en-US")}`;
const change = (now, before) => {
  if (!before) return now ? "New" : "—";
  const value = ((now - before) / before) * 100;
  return `${value >= 0 ? "↑" : "↓"} ${Math.abs(value).toFixed(1)}%`;
};

export async function salesDashboard({ user, ownOnly }) {
  const internal = user.organizationId;
  // Leads/prospects owned by the rep (or all PitchProX leads); accounts owned by the rep (or all)
  const leadWhere = ownOnly ? "organization_id = ? AND assigned_to = ?" : "organization_id = ?";
  const leadValues = ownOnly ? [internal, user.id] : [internal];
  const accountJoin = "FROM customer_accounts JOIN subscriptions ON subscriptions.organization_id = customer_accounts.organization_id JOIN plans ON plans.id = subscriptions.plan_id";
  const accountWhere = ownOnly ? "WHERE customer_accounts.account_rep_id = ?" : "WHERE 1 = 1";
  const accountValues = ownOnly ? [user.id] : [];

  const [leads] = await query(
    `SELECT COUNT(*) AS total, SUM(stage IN ('Qualified', 'Appointment Set')) AS qualified,
      SUM(created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS last30,
      SUM(follow_up_at IS NOT NULL AND follow_up_at < NOW() AND stage <> 'Archived') AS overdueFollowUps
     FROM leads WHERE ${leadWhere}`,
    leadValues
  );
  const [accounts] = await query(
    `SELECT COUNT(*) AS total,
      SUM(subscriptions.status = 'active') AS paying,
      SUM(subscriptions.status = 'trialing') AS trial,
      SUM(subscriptions.status = 'pending_payment') AS pending,
      SUM(subscriptions.status = 'pending_payment' AND customer_accounts.created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)) AS stalePending,
      SUM(subscriptions.status = 'canceled') AS canceled,
      SUM(customer_accounts.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS new30,
      SUM(customer_accounts.created_at >= DATE_SUB(NOW(), INTERVAL 60 DAY) AND customer_accounts.created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)) AS newPrev30,
      SUM(CASE WHEN subscriptions.status = 'active' THEN (CASE WHEN subscriptions.billing_cycle = 'annual' THEN plans.price_annual_cents ELSE plans.price_monthly_cents END) * customer_accounts.seats ELSE 0 END) AS mrrCents
     ${accountJoin} ${accountWhere}`,
    accountValues
  );
  const totalLeads = Number(leads.total);
  const qualified = Number(leads.qualified ?? 0);
  const totalAccounts = Number(accounts.total);
  const paying = Number(accounts.paying ?? 0);
  const mrrCents = Number(accounts.mrrCents ?? 0);

  // Last 7 days: conversion momentum (qualified share of leads) and accounts created
  const days = await query(
    `SELECT DATE(created_at) AS day, COUNT(*) AS leads, SUM(stage IN ('Qualified', 'Appointment Set')) AS qualified FROM leads WHERE ${leadWhere} AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) GROUP BY DATE(created_at)`,
    leadValues
  );
  const accountDays = await query(
    `SELECT DATE(customer_accounts.created_at) AS day, COUNT(*) AS accounts ${accountJoin} ${accountWhere} AND customer_accounts.created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) GROUP BY DATE(customer_accounts.created_at)`,
    accountValues
  );
  const key = (value) => new Date(value).toISOString().slice(0, 10);
  const trend = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(Date.now() - (6 - index) * 86400000);
    const iso = date.toISOString().slice(0, 10);
    const leadDay = days.find((row) => key(row.day) === iso);
    const accountDay = accountDays.find((row) => key(row.day) === iso);
    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
      convMom: leadDay ? percent(leadDay.qualified ?? 0, leadDay.leads) : 0,
      promptAdh: null,
      trustGain: null,
      quota: Number(accountDay?.accounts ?? 0),
    };
  });

  // Rep leaderboard: accounts signed and lead → subscription rate
  const reps = await query(
    `SELECT users.id, users.name, staff_profiles.status,
      (SELECT COUNT(*) FROM customer_accounts WHERE customer_accounts.account_rep_id = users.id) AS accounts,
      (SELECT COUNT(*) FROM leads WHERE leads.assigned_to = users.id) AS leads,
      (SELECT COUNT(*) FROM leads WHERE leads.assigned_to = users.id AND leads.stage IN ('Qualified', 'Appointment Set')) AS qualified
     FROM users JOIN staff_profiles ON staff_profiles.user_id = users.id
     WHERE users.role = 'sales_rep' AND staff_profiles.status IN ('active', 'offboarding')
     ORDER BY accounts DESC, qualified DESC, users.name LIMIT 5`
  );

  const recentAccounts = await query(
    `SELECT customer_accounts.organization_id AS id, organizations.name AS company, owners.name, plans.name AS planName, subscriptions.status,
      (SELECT MAX(login_events.created_at) FROM login_events JOIN users AS members ON members.id = login_events.user_id WHERE members.organization_id = customer_accounts.organization_id AND login_events.success = 1) AS lastActiveAt
     ${accountJoin} JOIN organizations ON organizations.id = customer_accounts.organization_id
     JOIN users AS owners ON owners.organization_id = customer_accounts.organization_id AND owners.role = 'customer_admin'
     ${accountWhere} ORDER BY customer_accounts.created_at DESC LIMIT 6`,
    accountValues
  );

  const roster = await query(
    `SELECT users.role, COUNT(*) AS count FROM users JOIN staff_profiles ON staff_profiles.user_id = users.id WHERE staff_profiles.status <> 'deactivated' AND users.role IN (${STAFF_ROLES.map(() => "?").join(", ")}) GROUP BY users.role`,
    STAFF_ROLES
  );

  const [tickets] = await query(
    `SELECT SUM(status NOT IN ('Resolved', 'Closed') AND first_response_at IS NULL AND created_at < DATE_SUB(NOW(), INTERVAL CASE priority WHEN 'urgent' THEN 4 WHEN 'high' THEN 8 WHEN 'medium' THEN 24 ELSE 48 END HOUR)) AS breached,
      SUM(status NOT IN ('Resolved', 'Closed') AND assigned_to IS NULL) AS unassigned
     FROM support_tickets`
  );
  const alerts = [
    Number(leads.overdueFollowUps ?? 0) && { id: "follow-ups", tone: "warning", title: `${leads.overdueFollowUps} lead follow-up${leads.overdueFollowUps == 1 ? " is" : "s are"} overdue` },
    Number(accounts.stalePending ?? 0) && { id: "pending", tone: "warning", title: `${accounts.stalePending} account${accounts.stalePending == 1 ? " has" : "s have"} been waiting for payment for over a week` },
    Number(tickets.breached ?? 0) && { id: "sla", tone: "danger", title: `${tickets.breached} support ticket${tickets.breached == 1 ? " has" : "s have"} missed the first-response SLA` },
    Number(tickets.unassigned ?? 0) && { id: "unassigned", tone: "info", title: `${tickets.unassigned} open support ticket${tickets.unassigned == 1 ? " is" : "s are"} unassigned` },
  ].filter(Boolean);

  const activity = await query(
    `SELECT id, summary, action, created_at AS createdAt FROM audit_logs
     WHERE action IN ('customer.created', 'customer.activated', 'support.ticket_updated', 'support.ticket_escalated', 'onboarding.completed', 'staff.invited', 'offboarding.completed')
     ${ownOnly ? "AND actor_id = ?" : ""} ORDER BY created_at DESC LIMIT 6`,
    ownOnly ? [user.id] : []
  );

  const newNow = Number(accounts.new30 ?? 0);
  const newBefore = Number(accounts.newPrev30 ?? 0);
  return {
    scope: ownOnly ? "rep" : "company",
    overview: {
      conversionMomentum: percent(qualified, totalLeads),
      leadToSubscription: percent(totalAccounts, totalLeads),
      leads: totalLeads,
      accounts: totalAccounts,
      promptAdherence: null,
      trustGain: null,
    },
    trend,
    topSales: reps.map((rep) => ({
      id: rep.id,
      name: rep.name,
      accounts: Number(rep.accounts),
      convMom: `${percent(rep.qualified, rep.leads)}%`,
      lead: `${percent(rep.accounts, rep.leads)}%`,
      status: rep.status === "active" ? "ACTIVE" : "OFFBOARDING",
    })),
    insights: [
      { id: "mrr", label: "Monthly Recurring Revenue (MRR)", value: money(mrrCents), change: "", isPositive: true, subtext: `${paying} paying account${paying === 1 ? "" : "s"}` },
      { id: "churn", label: "Churn Rate", value: `${percent(accounts.canceled ?? 0, totalAccounts)}%`, change: "", isPositive: Number(accounts.canceled ?? 0) === 0, subtext: `${accounts.canceled ?? 0} canceled` },
      { id: "growth", label: "Net Account Growth", value: `+${newNow}`, change: change(newNow, newBefore), isPositive: newNow >= newBefore, subtext: "last 30 days vs previous" },
      { id: "paying", label: "Active Paying Accounts", value: String(paying), change: "", isPositive: true, subtext: `${accounts.pending ?? 0} waiting for payment` },
      { id: "trial", label: "Trial to Paid Conversion", value: `${percent(paying, paying + Number(accounts.trial ?? 0))}%`, change: "", isPositive: true, subtext: `${accounts.trial ?? 0} on trial` },
      { id: "arpu", label: "Average Revenue Per User (ARPU)", value: paying ? money(mrrCents / paying) : "$0", change: "", isPositive: true, subtext: "per paying account / month" },
      { id: "reports", label: "Report Revenue", value: "$0", change: "", isPositive: true, subtext: "starts with paid reports" },
      { id: "overage", label: "Overage Revenue", value: "$0", change: "", isPositive: true, subtext: "starts once calls are metered" },
    ],
    recentAccounts,
    roster: roster.map((row) => ({ role: row.role, label: ROLE_LABELS[row.role] ?? row.role, count: Number(row.count) })),
    alerts,
    activity,
  };
}
