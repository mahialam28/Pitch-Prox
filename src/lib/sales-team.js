import { createId, query } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { recordAudit } from "@/lib/audit";
import { notify } from "@/lib/notifications";
import { requireSection } from "@/lib/permissions";
import { getEmployee, updateEmployee } from "@/lib/staff";
import { paged } from "@/lib/listing";
import { ROLES } from "@/utils.js/roles";

// ── Sales team (Super Admin → Sales Reps) ──
// Numbers come from the rep's own records:
//   closed  = customer accounts the rep sold in the month (not canceled)
//   revenue = monthly value of those accounts (plan price × seats) — "booked"
//             revenue until Stripe is connected and payments can be counted
//   quota   = monthly revenue target (sales_quotas; carries forward)
// Call-based scores (prompt adherence, trust gain, calls) wait for calling.

export const canManageTeam = (user) => [ROLES.SUPER_ADMIN, ROLES.ADMIN_MANAGER].includes(user.role);

// Managers change things; Support may only look
export async function requireTeamSection({ write = false } = {}) {
  const user = await requireSection("sales-reps");
  if (write && !canManageTeam(user)) throw new Error("FORBIDDEN");
  return user;
}

// ── Months ──
const monthKey = (date) => `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
const parseMonth = (key) => {
  if (typeof key !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(key)) throw new ApiError("Month must look like 2026-11.");
  return key;
};
const shiftMonth = (key, by) => {
  const [year, month] = key.split("-").map(Number);
  return monthKey(new Date(Date.UTC(year, month - 1 + by, 1)));
};
const monthStart = (key) => `${key}-01 00:00:00`;
const monthLabel = (key, style = "long") => new Date(`${key}-01T00:00:00Z`).toLocaleDateString("en-US", { month: style, year: "numeric", timeZone: "UTC" });
export const currentMonth = () => monthKey(new Date());

// Share of the month gone by (for "on pace" checks)
function monthProgress(key) {
  const now = new Date();
  if (key !== monthKey(now)) return key < monthKey(now) ? 1 : 0;
  const days = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).getUTCDate();
  return now.getUTCDate() / days;
}

const percent = (part, whole) => (whole ? Math.round((Number(part) / Number(whole)) * 1000) / 10 : 0);
// Accounts sold per lead worked. Accounts don't always start as a lead, so it's capped at 100%; null without leads.
const conversion = (accounts, leads) => (Number(leads) ? Math.min(100, percent(accounts, leads)) : null);

// Performance tiers from quota attainment (Team Performance donut)
export const TIERS = [
  { key: "elite", label: "Elite (100%+)", min: 100 },
  { key: "strong", label: "Strong (75-99%)", min: 75 },
  { key: "developing", label: "Developing (40-74%)", min: 40 },
  { key: "at-risk", label: "At Risk (<40%)", min: 0 },
];
const tierFor = (attainment) => (attainment == null ? null : TIERS.find((tier) => attainment >= tier.min));

const MONTHLY_VALUE = "(CASE WHEN subscriptions.billing_cycle = 'annual' THEN plans.price_annual_cents ELSE plans.price_monthly_cents END) * COALESCE(customer_accounts.seats, 1)";
const SOLD = "FROM customer_accounts JOIN subscriptions ON subscriptions.organization_id = customer_accounts.organization_id JOIN plans ON plans.id = subscriptions.plan_id";

// Quota in force for a month: the latest row at or before it
const QUOTA_FOR = (alias) => `(SELECT revenue_cents FROM sales_quotas WHERE sales_quotas.user_id = ${alias}.id AND sales_quotas.effective_month <= ? ORDER BY effective_month DESC LIMIT 1)`;

const STATUS_LABELS = { active: "Active", onboarding: "Onboarding", invited: "Invited", offboarding: "Offboarding", deactivated: "Deactivated" };

// One row per rep with this month's (and last month's) numbers
async function repRows({ month, repId = null, includeInactive = true }) {
  const from = monthStart(month);
  const to = monthStart(shiftMonth(month, 1));
  const prevFrom = monthStart(shiftMonth(month, -1));
  const clauses = ["users.role = 'sales_rep'"];
  const values = [];
  if (repId) { clauses.push("users.id = ?"); values.push(repId); }
  if (!includeInactive) clauses.push("staff_profiles.status <> 'deactivated'");
  const rows = await query(
    `SELECT users.id, users.name, users.email, staff_profiles.employee_number AS employeeNumber, staff_profiles.job_title AS jobTitle,
      staff_profiles.status, staff_profiles.manager_id AS managerId, managers.name AS managerName,
      (SELECT MAX(created_at) FROM login_events WHERE login_events.user_id = users.id AND login_events.success = 1) AS lastActiveAt,
      (SELECT COUNT(*) FROM leads WHERE leads.assigned_to = users.id) AS leads,
      (SELECT COUNT(*) FROM leads WHERE leads.assigned_to = users.id AND leads.created_at >= ? AND leads.created_at < ?) AS leadsMonth,
      (SELECT COUNT(*) FROM leads WHERE leads.assigned_to = users.id AND leads.stage IN ('Qualified', 'Appointment Set') AND leads.created_at >= ? AND leads.created_at < ?) AS qualifiedMonth,
      (SELECT COUNT(*) FROM customer_accounts WHERE customer_accounts.account_rep_id = users.id) AS accounts,
      (SELECT COUNT(*) ${SOLD} WHERE customer_accounts.account_rep_id = users.id AND subscriptions.status <> 'canceled' AND customer_accounts.created_at >= ? AND customer_accounts.created_at < ?) AS closed,
      (SELECT COUNT(*) ${SOLD} WHERE customer_accounts.account_rep_id = users.id AND subscriptions.status <> 'canceled' AND customer_accounts.created_at >= ? AND customer_accounts.created_at < ?) AS closedPrev,
      (SELECT COALESCE(SUM(${MONTHLY_VALUE}), 0) ${SOLD} WHERE customer_accounts.account_rep_id = users.id AND subscriptions.status <> 'canceled' AND customer_accounts.created_at >= ? AND customer_accounts.created_at < ?) AS revenueCents,
      (SELECT COALESCE(SUM(${MONTHLY_VALUE}), 0) ${SOLD} WHERE customer_accounts.account_rep_id = users.id AND subscriptions.status <> 'canceled' AND customer_accounts.created_at >= ? AND customer_accounts.created_at < ?) AS revenuePrevCents,
      (SELECT COUNT(*) FROM leads WHERE leads.assigned_to = users.id AND leads.follow_up_at IS NOT NULL AND leads.follow_up_at < NOW() AND leads.stage <> 'Archived') AS overdueFollowUps,
      ${QUOTA_FOR("users")} AS quotaCents
     FROM users JOIN staff_profiles ON staff_profiles.user_id = users.id LEFT JOIN users AS managers ON managers.id = staff_profiles.manager_id
     WHERE ${clauses.join(" AND ")} ORDER BY users.name`,
    [from, to, from, to, from, to, prevFrom, from, from, to, prevFrom, from, month, ...values]
  );
  return rows.map((row) => toRep(row, month));
}

function toRep(row, month) {
  const quotaCents = row.quotaCents == null ? null : Number(row.quotaCents);
  const revenueCents = Number(row.revenueCents);
  const attainment = quotaCents ? Math.round((revenueCents / quotaCents) * 100) : null;
  const pace = monthProgress(month);
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    employeeId: row.employeeNumber ? `EMP-${row.employeeNumber}` : null,
    jobTitle: row.jobTitle || "Sales Representative",
    status: row.status,
    statusLabel: STATUS_LABELS[row.status] ?? row.status,
    managerId: row.managerId,
    managerName: row.managerName,
    lastActiveAt: row.lastActiveAt,
    leads: Number(row.leads),
    leadsMonth: Number(row.leadsMonth),
    qualifiedMonth: Number(row.qualifiedMonth),
    accounts: Number(row.accounts),
    leadToSubscription: conversion(row.accounts, row.leads),
    closed: Number(row.closed),
    closedPrev: Number(row.closedPrev),
    revenueCents,
    revenuePrevCents: Number(row.revenuePrevCents),
    overdueFollowUps: Number(row.overdueFollowUps),
    quotaCents,
    attainment,
    tier: tierFor(attainment)?.key ?? null,
    // Behind pace: less than half of where they should be by now (only after the first week)
    behindPace: quotaCents != null && row.status === "active" && pace > 0.25 && revenueCents < quotaCents * pace * 0.5,
    // Call-based scores wait for calling
    promptAdherence: null,
    trustGain: null,
    calls: null,
  };
}

// ── Sales Reps page ──
export async function teamOverview({ month = currentMonth() } = {}) {
  parseMonth(month);
  const reps = await repRows({ month });
  const working = reps.filter((rep) => rep.status !== "deactivated");
  const active = working.filter((rep) => rep.status === "active");
  const [{ activePrev }] = await query(
    "SELECT COUNT(*) AS activePrev FROM users JOIN staff_profiles ON staff_profiles.user_id = users.id WHERE users.role = 'sales_rep' AND staff_profiles.status <> 'deactivated' AND users.created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)"
  );
  const sum = (key) => working.reduce((total, rep) => total + (rep[key] ?? 0), 0);
  const withQuota = working.filter((rep) => rep.quotaCents != null);
  const distribution = TIERS.map((tier) => ({ ...tier, count: withQuota.filter((rep) => rep.tier === tier.key).length }));
  const ranked = [...working].sort((a, b) => b.revenueCents - a.revenueCents || b.closed - a.closed || (b.leadToSubscription ?? 0) - (a.leadToSubscription ?? 0));

  const behind = working.filter((rep) => rep.behindPace);
  const overdue = working.filter((rep) => rep.overdueFollowUps > 0);
  const noQuota = active.filter((rep) => rep.quotaCents == null);
  const alerts = [
    behind.length && { id: "quota", tone: "danger", title: `${behind.length} rep${behind.length === 1 ? " is" : "s are"} at risk of missing quota`, subtitle: behind.map((rep) => rep.name).join(", ") },
    overdue.length && { id: "follow-ups", tone: "warning", title: `${overdue.length} rep${overdue.length === 1 ? " has" : "s have"} overdue lead follow-ups`, subtitle: "Coaching recommended" },
    noQuota.length && { id: "no-quota", tone: "info", title: `${noQuota.length} active rep${noQuota.length === 1 ? " has" : "s have"} no quota set`, subtitle: "Use Adjust Quotas to set one" },
  ].filter(Boolean);

  return {
    month,
    monthLabel: monthLabel(month),
    stats: {
      activeReps: active.length,
      activeRepsChange: active.length - Number(activePrev),
      leadToSubscription: conversion(sum("accounts"), sum("leads")),
      subscriptionsClosed: sum("closed"),
      subscriptionsClosedPrev: sum("closedPrev"),
      revenueCents: sum("revenueCents"),
      revenuePrevCents: sum("revenuePrevCents"),
      promptAdherence: null,
      trustGain: null,
    },
    reps,
    topPerformers: ranked.filter((rep) => rep.closed || rep.revenueCents || rep.accounts).slice(0, 3),
    leaderboard: ranked,
    distribution,
    tracked: withQuota.length,
    alerts,
  };
}

// ── Leaderboard: this month, this quarter or this year ──
// Revenue and accounts are booked in the period; attainment is against the sum of the monthly quotas in it.
export const LEADERBOARD_PERIODS = ["month", "quarter", "year"];

export async function leaderboard({ period = "month" } = {}) {
  if (!LEADERBOARD_PERIODS.includes(period)) throw new ApiError("Period must be month, quarter or year.");
  const now = currentMonth();
  const [year, month] = now.split("-").map(Number);
  const firstMonth = period === "month" ? now : period === "quarter" ? `${year}-${String(Math.floor((month - 1) / 3) * 3 + 1).padStart(2, "0")}` : `${year}-01`;
  const months = [];
  for (let key = firstMonth; key <= now; key = shiftMonth(key, 1)) months.push(key);
  // The same span before it, for the trend
  const previousFirst = shiftMonth(firstMonth, -months.length);
  const from = monthStart(firstMonth);
  const to = monthStart(shiftMonth(now, 1));

  const rows = await query(
    `SELECT users.id, users.name, staff_profiles.job_title AS jobTitle,
      (SELECT COUNT(*) FROM leads WHERE leads.assigned_to = users.id) AS leads,
      (SELECT COUNT(*) FROM customer_accounts WHERE customer_accounts.account_rep_id = users.id) AS accounts,
      (SELECT COUNT(*) ${SOLD} WHERE customer_accounts.account_rep_id = users.id AND subscriptions.status <> 'canceled' AND customer_accounts.created_at >= ? AND customer_accounts.created_at < ?) AS closed,
      (SELECT COALESCE(SUM(${MONTHLY_VALUE}), 0) ${SOLD} WHERE customer_accounts.account_rep_id = users.id AND subscriptions.status <> 'canceled' AND customer_accounts.created_at >= ? AND customer_accounts.created_at < ?) AS revenueCents,
      (SELECT COALESCE(SUM(${MONTHLY_VALUE}), 0) ${SOLD} WHERE customer_accounts.account_rep_id = users.id AND subscriptions.status <> 'canceled' AND customer_accounts.created_at >= ? AND customer_accounts.created_at < ?) AS revenuePrevCents
     FROM users JOIN staff_profiles ON staff_profiles.user_id = users.id
     WHERE users.role = 'sales_rep' AND staff_profiles.status <> 'deactivated' ORDER BY users.name`,
    [from, to, from, to, monthStart(previousFirst), from]
  );
  const quotaRows = await query("SELECT user_id AS userId, effective_month AS month, revenue_cents AS cents FROM sales_quotas WHERE effective_month <= ? ORDER BY effective_month DESC", [now]);
  const quotaFor = (userId, key) => quotaRows.find((row) => row.userId === userId && row.month <= key);

  const reps = rows.map((row) => {
    const quotas = months.map((key) => quotaFor(row.id, key));
    const quotaCents = quotas.some(Boolean) ? quotas.reduce((total, quota) => total + Number(quota?.cents ?? 0), 0) : null;
    const revenueCents = Number(row.revenueCents);
    return {
      id: row.id,
      name: row.name,
      jobTitle: row.jobTitle || "Sales Representative",
      closed: Number(row.closed),
      revenueCents,
      revenuePrevCents: Number(row.revenuePrevCents),
      leadToSubscription: conversion(row.accounts, row.leads),
      quotaCents,
      attainment: quotaCents ? Math.round((revenueCents / quotaCents) * 100) : null,
      calls: null,
    };
  });
  const total = reps.reduce((sum, rep) => sum + rep.revenueCents, 0);
  return {
    period,
    label: period === "month" ? monthLabel(now) : period === "quarter" ? `Q${Math.floor((month - 1) / 3) + 1} ${year}` : `${year} to date`,
    reps,
    totalRevenueCents: total,
    averageRevenueCents: reps.length ? Math.round(total / reps.length) : 0,
  };
}

// ── Quotas ──
export async function listQuotas({ month = currentMonth() } = {}) {
  parseMonth(month);
  const rows = await query(
    `SELECT users.id, users.name, ${QUOTA_FOR("users")} AS quotaCents FROM users JOIN staff_profiles ON staff_profiles.user_id = users.id WHERE users.role = 'sales_rep' AND staff_profiles.status <> 'deactivated' ORDER BY users.name`,
    [month]
  );
  return { month, monthLabel: monthLabel(month), quotas: rows.map((row) => ({ userId: row.id, name: row.name, quotaCents: row.quotaCents == null ? null : Number(row.quotaCents) })) };
}

// Sets quotas from `month` onward (this month or a later one; past months stay as they were)
export async function setQuotas(actor, { month = currentMonth(), quotas } = {}) {
  parseMonth(month);
  if (month < currentMonth()) throw new ApiError("Quotas can only be changed for this month or a later one.");
  if (month > shiftMonth(currentMonth(), 12)) throw new ApiError("Quotas can be planned up to 12 months ahead.");
  if (!Array.isArray(quotas) || !quotas.length) throw new ApiError("Add at least one quota.");
  if (quotas.length > 500) throw new ApiError("Too many quotas at once.");
  const ids = [...new Set(quotas.map((item) => item?.userId))];
  if (ids.length !== quotas.length) throw new ApiError("Each rep can only appear once.");
  const reps = await query(
    `SELECT users.id, users.name FROM users JOIN staff_profiles ON staff_profiles.user_id = users.id WHERE users.role = 'sales_rep' AND staff_profiles.status <> 'deactivated' AND users.id IN (${ids.map(() => "?").join(", ")})`,
    ids
  );
  if (reps.length !== ids.length) throw new ApiError("Quotas can only be set for current sales reps.");
  for (const item of quotas) {
    const cents = Number(item.quotaCents);
    if (!Number.isInteger(cents) || cents < 0 || cents > 100_000_000_00) throw new ApiError("Each quota must be a whole number of dollars between $0 and $100,000,000.");
  }
  const before = await listQuotas({ month });
  for (const item of quotas) {
    await query(
      "INSERT INTO sales_quotas (user_id, effective_month, revenue_cents, updated_by) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE revenue_cents = VALUES(revenue_cents), updated_by = VALUES(updated_by)",
      [item.userId, month, Number(item.quotaCents), actor.id]
    );
  }
  const changed = quotas.filter((item) => before.quotas.find((row) => row.userId === item.userId)?.quotaCents !== Number(item.quotaCents));
  if (changed.length) {
    const names = changed.map((item) => reps.find((rep) => rep.id === item.userId).name);
    await recordAudit(actor, {
      action: "team.quotas_updated",
      entityType: "sales_quota",
      entityId: month,
      summary: `Set ${monthLabel(month)} quotas for ${names.length === 1 ? names[0] : `${names.length} reps`}`,
      metadata: { month, quotas: changed.map((item) => ({ userId: item.userId, quotaCents: Number(item.quotaCents), before: before.quotas.find((row) => row.userId === item.userId)?.quotaCents ?? null })) },
    });
  }
  return listQuotas({ month });
}

// ── One rep ──
async function loadRep(id) {
  const [row] = await query("SELECT users.id FROM users WHERE users.id = ? AND users.role = 'sales_rep'", [id]);
  if (!row) throw new ApiError("Sales rep not found.", 404);
}

const NOTE_COLUMNS = "id, kind, note_type AS type, title, body, related_to AS relatedTo, priority, due_date AS dueDate, completed_at AS completedAt, author_id AS authorId, author_name AS authorName, created_at AS createdAt";

export async function getRepDetail(viewer, id, { month = currentMonth() } = {}) {
  parseMonth(month);
  await loadRep(id);
  const [rep] = await repRows({ month, repId: id });
  const profile = await getEmployee(id);

  // Last 6 months: accounts sold, booked revenue and the quota in force
  const months = Array.from({ length: 6 }, (_, index) => shiftMonth(month, index - 5));
  const sold = await query(
    `SELECT DATE_FORMAT(customer_accounts.created_at, '%Y-%m') AS month, COUNT(*) AS closed, COALESCE(SUM(${MONTHLY_VALUE}), 0) AS revenueCents
     ${SOLD} WHERE customer_accounts.account_rep_id = ? AND subscriptions.status <> 'canceled' AND customer_accounts.created_at >= ? AND customer_accounts.created_at < ?
     GROUP BY DATE_FORMAT(customer_accounts.created_at, '%Y-%m')`,
    [id, monthStart(months[0]), monthStart(shiftMonth(month, 1))]
  );
  const quotaRows = await query("SELECT effective_month AS month, revenue_cents AS cents FROM sales_quotas WHERE user_id = ? ORDER BY effective_month", [id]);
  const quotaAt = (key) => {
    const row = [...quotaRows].reverse().find((item) => item.month <= key);
    return row ? Number(row.cents) : null;
  };
  const history = months.map((key) => {
    const row = sold.find((item) => item.month === key);
    return { month: key, label: monthLabel(key, "short"), closed: Number(row?.closed ?? 0), revenueCents: Number(row?.revenueCents ?? 0), quotaCents: quotaAt(key) };
  });

  // This month, day by day: accounts sold and leads qualified
  const days = await query(
    `SELECT DAY(customer_accounts.created_at) AS day, COUNT(*) AS closed, COALESCE(SUM(${MONTHLY_VALUE}), 0) AS revenueCents
     ${SOLD} WHERE customer_accounts.account_rep_id = ? AND subscriptions.status <> 'canceled' AND customer_accounts.created_at >= ? AND customer_accounts.created_at < ?
     GROUP BY DAY(customer_accounts.created_at)`,
    [id, monthStart(month), monthStart(shiftMonth(month, 1))]
  );
  const [year, monthNumber] = month.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  let cumulative = 0;
  const daily = Array.from({ length: daysInMonth }, (_, index) => {
    const row = days.find((item) => Number(item.day) === index + 1);
    cumulative += Number(row?.revenueCents ?? 0);
    return { day: index + 1, label: `${new Date(Date.UTC(year, monthNumber - 1, 1)).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })} ${index + 1}`, closed: Number(row?.closed ?? 0), cumulativeCents: cumulative };
  });

  const managerView = canManageTeam(viewer);
  const managerNotes = managerView ? await query(`SELECT ${NOTE_COLUMNS} FROM rep_notes WHERE rep_id = ? AND kind = 'manager' ORDER BY created_at DESC LIMIT 3`, [id]) : [];
  const [calibration] = await query("SELECT COUNT(*) AS sessions, MAX(completed_at) AS lastAt, SUM(duration_seconds) AS seconds FROM calibration_sessions WHERE user_id = ?", [id]);
  const recentCalibration = await query("SELECT id, rounds_completed AS rounds, duration_seconds AS durationSeconds, completed_at AS completedAt FROM calibration_sessions WHERE user_id = ? ORDER BY completed_at DESC LIMIT 10", [id]);
  const [settingsRow] = await query("SELECT settings FROM rep_settings WHERE user_id = ?", [id]);

  return {
    month,
    monthLabel: monthLabel(month),
    rep: {
      ...rep,
      phone: profile.phone,
      timezone: profile.timezone,
      language: profile.language,
      department: profile.department,
      startDate: profile.startDate,
      mfa: profile.mfa,
    },
    history,
    daily,
    goals: {
      qualifiedLeads: rep.qualifiedMonth,
      newLeads: rep.leadsMonth,
      revenueCents: rep.revenueCents,
      quotaCents: rep.quotaCents,
      calls: null,
    },
    managerNotes,
    calibration: { sessions: Number(calibration.sessions), lastAt: calibration.lastAt, minutes: Math.round(Number(calibration.seconds ?? 0) / 60), recent: recentCalibration },
    settings: { ...SETTINGS_DEFAULTS, ...(settingsRow ? (typeof settingsRow.settings === "string" ? JSON.parse(settingsRow.settings) : settingsRow.settings) : {}) },
    permissions: { canManage: managerView, canSeeManagerNotes: managerView },
  };
}

// Profile fields from the Edit Rep dialog / Account Settings tab, and deactivate / reactivate
export async function updateRep(actor, id, body) {
  await loadRep(id);
  if (body.name !== undefined) {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) throw new ApiError("Name is required.");
    if (name.length > 255) throw new ApiError("Name must be 255 characters or fewer.");
    const [current] = await query("SELECT name FROM users WHERE id = ?", [id]);
    if (current.name !== name) {
      await query("UPDATE users SET name = ? WHERE id = ?", [name, id]);
      await recordAudit(actor, { action: "staff.updated", entityType: "user", entityId: id, summary: `Renamed ${current.name} to ${name}` });
    }
  }
  if (body.language !== undefined) {
    const language = typeof body.language === "string" ? body.language.trim().slice(0, 40) : null;
    await query("UPDATE staff_profiles SET language = ? WHERE user_id = ?", [language || null, id]);
  }
  const allowed = ["managerId", "jobTitle", "phone", "timezone", "status"];
  const rest = Object.fromEntries(Object.entries(body).filter(([key]) => allowed.includes(key)));
  if (Object.keys(rest).length) await updateEmployee(actor, id, rest);
  const [rep] = await repRows({ month: currentMonth(), repId: id });
  return rep;
}

// ── Rep workspace settings (Account Settings tab) ──
// Saved now; the call-screen options take effect once calling is connected.
export const SETTINGS_DEFAULTS = {
  dateFormat: "MM/DD/YYYY",
  landingPage: "Dashboard",
  scriptView: "AI Prompts",
  aiRealtimeGuidance: true,
  postCallAnalysis: true,
  lowTrustThreshold: -10,
  promptAdherenceAlert: 75,
  sessionTimeout: "30 minutes",
  platformAccess: "Full Access",
  reportsAccess: "Own Reports Only",
  coachingAccess: "Own Notes Only",
  exportData: true,
  managePlaybooks: false,
};
const SETTING_CHOICES = {
  dateFormat: ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"],
  landingPage: ["Dashboard", "Live Calling", "Performance", "Reports"],
  scriptView: ["AI Prompts", "Full Playbook", "Compact Cue Cards"],
  sessionTimeout: ["15 minutes", "30 minutes", "1 hour", "2 hours"],
  platformAccess: ["Full Access", "Restricted Closer", "Read Only"],
  reportsAccess: ["All Reports", "Team Reports Only", "Own Reports Only"],
  coachingAccess: ["Own Notes Only", "Team Notes", "Full Access"],
};
const SETTING_FLAGS = ["aiRealtimeGuidance", "postCallAnalysis", "exportData", "managePlaybooks"];

export async function saveRepSettings(actor, id, body) {
  await loadRep(id);
  const [row] = await query("SELECT settings FROM rep_settings WHERE user_id = ?", [id]);
  const current = { ...SETTINGS_DEFAULTS, ...(row ? (typeof row.settings === "string" ? JSON.parse(row.settings) : row.settings) : {}) };
  const next = { ...current };
  for (const [key, value] of Object.entries(body ?? {})) {
    if (SETTING_CHOICES[key]) {
      if (!SETTING_CHOICES[key].includes(value)) throw new ApiError(`Choose a valid option for ${key}.`);
      next[key] = value;
    } else if (SETTING_FLAGS.includes(key)) {
      if (typeof value !== "boolean") throw new ApiError(`${key} must be on or off.`);
      next[key] = value;
    } else if (key === "lowTrustThreshold") {
      const number = Number(value);
      if (!Number.isFinite(number) || number < -100 || number > 0) throw new ApiError("The low-trust alert must be between -100 and 0.");
      next[key] = Math.round(number);
    } else if (key === "promptAdherenceAlert") {
      const number = Number(value);
      if (!Number.isFinite(number) || number < 0 || number > 100) throw new ApiError("The prompt adherence alert must be between 0 and 100%.");
      next[key] = Math.round(number);
    }
  }
  await query(
    "INSERT INTO rep_settings (user_id, settings, updated_by) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE settings = VALUES(settings), updated_by = VALUES(updated_by)",
    [id, JSON.stringify(next), actor.id]
  );
  const changed = Object.keys(next).filter((key) => next[key] !== current[key]);
  if (changed.length) {
    const [rep] = await query("SELECT name FROM users WHERE id = ?", [id]);
    await recordAudit(actor, { action: "team.settings_updated", entityType: "user", entityId: id, summary: `Updated ${rep.name}'s workspace settings (${changed.join(", ")})` });
  }
  return next;
}

// ── Coaching notes (shared with the rep) and manager notes (private) ──
export const COACHING_TYPES = ["Strength", "Opportunity", "Action Item", "General Feedback"];
const PRIORITIES = ["High", "Medium", "Low"];

const cleanText = (value, label, max, { required = false } = {}) => {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (required && !trimmed) throw new ApiError(`${label} is required.`);
  if (trimmed.length > max) throw new ApiError(`${label} must be ${max} characters or fewer.`);
  return trimmed || null;
};
const cleanDate = (value) => {
  if (value == null || value === "") return null;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value))) throw new ApiError("Due date must be a date (YYYY-MM-DD).");
  return value;
};

function assertKind(viewer, kind) {
  if (!["coaching", "manager"].includes(kind)) throw new ApiError("Unknown note kind.");
  if (kind === "manager" && !canManageTeam(viewer)) throw new Error("FORBIDDEN");
}

export async function listRepNotes(viewer, id, { kind = "coaching", type } = {}) {
  assertKind(viewer, kind);
  await loadRep(id);
  const clauses = ["rep_id = ?", "kind = ?"];
  const values = [id, kind];
  if (type) {
    if (!COACHING_TYPES.includes(type)) throw new ApiError("Unknown note type.");
    clauses.push("note_type = ?");
    values.push(type);
  }
  const notes = await query(`SELECT ${NOTE_COLUMNS} FROM rep_notes WHERE ${clauses.join(" AND ")} ORDER BY created_at DESC LIMIT 500`, values);
  if (kind !== "coaching") return { notes };

  const [counts] = await query(
    `SELECT SUM(created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')) AS thisMonth,
      SUM(created_at >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01') AND created_at < DATE_FORMAT(NOW(), '%Y-%m-01')) AS lastMonth,
      SUM(note_type = 'Action Item') AS actionItems, SUM(note_type = 'Action Item' AND completed_at IS NOT NULL) AS actionItemsDone
     FROM rep_notes WHERE rep_id = ? AND kind = 'coaching'`,
    [id]
  );
  // Focus areas: open improvement notes (opportunities and action items), most urgent first
  const focus = await query(
    `SELECT ${NOTE_COLUMNS} FROM rep_notes WHERE rep_id = ? AND kind = 'coaching' AND note_type IN ('Opportunity', 'Action Item') AND completed_at IS NULL
     ORDER BY FIELD(priority, 'High', 'Medium', 'Low'), due_date IS NULL, due_date LIMIT 3`,
    [id]
  );
  const strengths = await query(`SELECT ${NOTE_COLUMNS} FROM rep_notes WHERE rep_id = ? AND kind = 'coaching' AND note_type = 'Strength' ORDER BY created_at DESC LIMIT 2`, [id]);
  const coaches = [...new Set(notes.map((note) => note.authorName))];
  return {
    notes,
    coaches,
    stats: {
      thisMonth: Number(counts.thisMonth ?? 0),
      lastMonth: Number(counts.lastMonth ?? 0),
      actionItems: Number(counts.actionItems ?? 0),
      actionItemsDone: Number(counts.actionItemsDone ?? 0),
      topFocus: focus[0]?.title ?? null,
    },
    focus,
    strengths,
  };
}

export async function addRepNote(actor, id, body) {
  const kind = body?.kind ?? "coaching";
  assertKind(actor, kind);
  if (!canManageTeam(actor)) throw new Error("FORBIDDEN");
  await loadRep(id);
  const note = { id: createId("repnote"), body: cleanText(body.body, "Note", 5000, { required: true }) };
  if (kind === "coaching") {
    note.type = body.type ?? "General Feedback";
    if (!COACHING_TYPES.includes(note.type)) throw new ApiError("Choose a valid note type.");
    note.title = cleanText(body.title, "Title", 160, { required: true });
    note.relatedTo = cleanText(body.relatedTo, "Related call", 160);
    note.priority = body.priority ?? null;
    if (note.priority !== null && !PRIORITIES.includes(note.priority)) throw new ApiError("Choose a valid priority.");
    note.dueDate = cleanDate(body.dueDate);
  }
  await query(
    "INSERT INTO rep_notes (id, rep_id, author_id, author_name, kind, note_type, title, body, related_to, priority, due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [note.id, id, actor.id, actor.name, kind, note.type ?? null, note.title ?? null, note.body, note.relatedTo ?? null, note.priority ?? null, note.dueDate ?? null]
  );
  const [rep] = await query("SELECT name FROM users WHERE id = ?", [id]);
  // Coaching notes are for the rep; private manager notes never notify them
  if (kind === "coaching") await notify([id], { type: "coaching", title: `New coaching note: ${note.title}`, body: `${actor.name}${note.priority ? ` · ${note.priority} priority` : ""}${note.dueDate ? ` · due ${note.dueDate}` : ""}`, link: "/internal-sales-representative/dashboard", entityType: "rep_note", entityId: note.id, actor });
  await recordAudit(actor, { action: kind === "coaching" ? "team.coaching_note_added" : "team.manager_note_added", entityType: "user", entityId: id, summary: kind === "coaching" ? `Added a coaching note for ${rep.name}: ${note.title}` : `Added a private manager note for ${rep.name}` });
  const [saved] = await query(`SELECT ${NOTE_COLUMNS} FROM rep_notes WHERE id = ?`, [note.id]);
  return saved;
}

async function loadNote(id, noteId) {
  const [note] = await query(`SELECT ${NOTE_COLUMNS} FROM rep_notes WHERE id = ? AND rep_id = ?`, [noteId, id]);
  if (!note) throw new ApiError("Note not found.", 404);
  return note;
}

// Mark complete / reopen; the author (or a Super Admin) can also edit the text
export async function updateRepNote(actor, id, noteId, body) {
  if (!canManageTeam(actor)) throw new Error("FORBIDDEN");
  const note = await loadNote(id, noteId);
  const sets = [];
  const values = [];
  if (body.completed !== undefined) {
    if (note.kind !== "coaching") throw new ApiError("Only coaching notes can be completed.");
    sets.push("completed_at = ?", "completed_by = ?");
    values.push(body.completed ? new Date() : null, body.completed ? actor.id : null);
  }
  const editing = ["title", "body", "type", "priority", "dueDate", "relatedTo"].some((key) => body[key] !== undefined);
  if (editing) {
    if (note.authorId !== actor.id && actor.role !== ROLES.SUPER_ADMIN) throw new ApiError("Only the author or a Super Admin can edit this note.", 403);
    if (body.body !== undefined) { sets.push("body = ?"); values.push(cleanText(body.body, "Note", 5000, { required: true })); }
    if (note.kind === "coaching") {
      if (body.title !== undefined) { sets.push("title = ?"); values.push(cleanText(body.title, "Title", 160, { required: true })); }
      if (body.type !== undefined) { if (!COACHING_TYPES.includes(body.type)) throw new ApiError("Choose a valid note type."); sets.push("note_type = ?"); values.push(body.type); }
      if (body.priority !== undefined) { if (body.priority !== null && !PRIORITIES.includes(body.priority)) throw new ApiError("Choose a valid priority."); sets.push("priority = ?"); values.push(body.priority); }
      if (body.dueDate !== undefined) { sets.push("due_date = ?"); values.push(cleanDate(body.dueDate)); }
      if (body.relatedTo !== undefined) { sets.push("related_to = ?"); values.push(cleanText(body.relatedTo, "Related call", 160)); }
    }
    sets.push("updated_at = NOW()");
  }
  if (!sets.length) throw new ApiError("Nothing to change.");
  await query(`UPDATE rep_notes SET ${sets.join(", ")} WHERE id = ?`, [...values, noteId]);
  if (body.completed !== undefined) {
    await recordAudit(actor, { action: "team.coaching_note_updated", entityType: "user", entityId: id, summary: `${body.completed ? "Completed" : "Reopened"} coaching note: ${note.title}` });
  }
  return loadNote(id, noteId);
}

export async function deleteRepNote(actor, id, noteId) {
  if (!canManageTeam(actor)) throw new Error("FORBIDDEN");
  const note = await loadNote(id, noteId);
  if (note.authorId !== actor.id && actor.role !== ROLES.SUPER_ADMIN) throw new ApiError("Only the author or a Super Admin can delete this note.", 403);
  await query("DELETE FROM rep_notes WHERE id = ?", [noteId]);
  await recordAudit(actor, { action: "team.note_deleted", entityType: "user", entityId: id, summary: `Deleted a ${note.kind} note${note.title ? `: ${note.title}` : ""}` });
}

// ── Activity log: everything the rep did, and everything done to their profile ──
const ACTIVITY_CATEGORIES = {
  Accounts: ["customer.", "account.", "billing."],
  Support: ["support."],
  Profile: ["staff.", "security.", "team.settings"],
  Coaching: ["team.coaching", "team.manager", "team.note", "team.quotas"],
  Onboarding: ["onboarding.", "policy.", "training.", "offboarding."],
};
const categoryOf = (action) => Object.keys(ACTIVITY_CATEGORIES).find((name) => ACTIVITY_CATEGORIES[name].some((prefix) => action.startsWith(prefix))) ?? "Other";

export async function repActivity(id, { category, performedBy, page, pageSize, offset }) {
  await loadRep(id);
  // Quota changes are logged per month with every rep in the metadata
  const clauses = ["(audit_logs.actor_id = ? OR (audit_logs.entity_type = 'user' AND audit_logs.entity_id = ?) OR (audit_logs.action = 'team.quotas_updated' AND JSON_SEARCH(audit_logs.metadata, 'one', ?, NULL, '$.quotas[*].userId') IS NOT NULL))"];
  const values = [id, id, id];
  if (category) {
    if (!ACTIVITY_CATEGORIES[category]) throw new ApiError("Unknown activity type.");
    clauses.push(`(${ACTIVITY_CATEGORIES[category].map(() => "audit_logs.action LIKE ?").join(" OR ")})`);
    values.push(...ACTIVITY_CATEGORIES[category].map((prefix) => `${prefix}%`));
  }
  if (performedBy === "self") { clauses.push("audit_logs.actor_id = ?"); values.push(id); }
  if (performedBy === "others") { clauses.push("(audit_logs.actor_id IS NULL OR audit_logs.actor_id <> ?)"); values.push(id); }
  const where = `WHERE ${clauses.join(" AND ")}`;
  const [{ total }] = await query(`SELECT COUNT(*) AS total FROM audit_logs ${where}`, values);
  const rows = await query(
    `SELECT id, action, summary, actor_id AS actorId, actor_name AS actorName, actor_role AS actorRole, ip, created_at AS createdAt FROM audit_logs ${where} ORDER BY created_at DESC LIMIT ${Number(pageSize)} OFFSET ${Number(offset)}`,
    values
  );
  return paged(rows.map((row) => ({ ...row, category: categoryOf(row.action), self: row.actorId === id })), total, { page, pageSize });
}

// ── The rep's own side: coaching notes they receive (manager notes stay private) ──
export async function myCoachingNotes(user) {
  if (user.role !== ROLES.SALES_REP) throw new Error("FORBIDDEN");
  const notes = await query(
    `SELECT ${NOTE_COLUMNS} FROM rep_notes WHERE rep_id = ? AND kind = 'coaching' ORDER BY completed_at IS NOT NULL, FIELD(priority, 'High', 'Medium', 'Low'), due_date IS NULL, due_date, created_at DESC LIMIT 100`,
    [user.id]
  );
  return { notes, open: notes.filter((note) => !note.completedAt).length };
}

// A rep marks their coaching note done (or reopens it)
export async function completeMyNote(user, noteId, completed) {
  if (user.role !== ROLES.SALES_REP) throw new Error("FORBIDDEN");
  const note = await loadNote(user.id, noteId);
  if (note.kind !== "coaching") throw new ApiError("Note not found.", 404);
  await query("UPDATE rep_notes SET completed_at = ?, completed_by = ? WHERE id = ?", [completed ? new Date() : null, completed ? user.id : null, noteId]);
  await recordAudit(user, { action: "team.coaching_note_updated", entityType: "user", entityId: user.id, summary: `${completed ? "Completed" : "Reopened"} coaching note: ${note.title}` });
  return loadNote(user.id, noteId);
}
