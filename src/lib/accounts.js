import { cookies } from "next/headers";
import { createId, hashToken, query } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { recordAudit } from "@/lib/audit";
import { SESSION_COOKIE, STAFF_SESSION_COOKIE, createSession, requireCurrentUser, swapToStaffSession } from "@/lib/auth";
import { getSubscription, listInvoices } from "@/lib/billing";
import { listAccountTickets } from "@/lib/support-staff";
import { ROLES, canAccessSection } from "@/utils.js/roles";

// ── Customer accounts, managed from the staff portals (Phase 3) ──
// Who can open an account:
//   - a sales rep: only the accounts they own (customer_accounts.account_rep_id)
//   - roles with the "users" section (Super Admin, Support): every account
// Who can change it:
//   - credits, calls and reports: a Super Admin applies them directly (no cap);
//     a sales rep applies up to 50 calls / 50 reports / $50 at a time;
//     anyone else (Support) can only request one, which a Super Admin approves
//   - refunds, approvals, reversals and deleting an account: Super Admin only
// Ledger rows are never edited or deleted; a mistake is undone with a reversal row.

export const REP_LIMIT = { calls: 50, reports: 50, credit: 5000, discount: 5000 }; // credit/discount in cents
const ADJUSTMENT_KINDS = ["calls", "reports", "credit", "discount"];
const APPLY_TO = ["Next Invoice", "Current Invoice", "All Future Invoices", "Account Balance"];
const money = (cents) => `$${(Math.abs(cents) / 100).toFixed(2)}`;
const isSuperAdmin = (user) => user.role === ROLES.SUPER_ADMIN;

const text = (value, label, max, { required = false } = {}) => {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (required && !trimmed) throw new ApiError(`${label} is required.`);
  if (trimmed.length > max) throw new ApiError(`${label} must be ${max} characters or fewer.`);
  return trimmed || null;
};

async function loadAccount(organizationId) {
  const [account] = await query(
    `SELECT customer_accounts.*, organizations.name AS company, organizations.created_at AS organizationCreatedAt
     FROM customer_accounts JOIN organizations ON organizations.id = customer_accounts.organization_id
     WHERE customer_accounts.organization_id = ?`,
    [typeof organizationId === "string" ? organizationId : ""]
  );
  return account;
}

// The account and the signed-in staff member, or 404/403
export async function requireAccountAccess(organizationId, { write = false } = {}) {
  const user = await requireCurrentUser();
  const rep = user.role === ROLES.SALES_REP;
  if (!rep && !canAccessSection(user.role, "users")) throw new Error("FORBIDDEN");
  if (write && user.role === ROLES.AUDITOR) throw new Error("FORBIDDEN");
  const account = await loadAccount(organizationId);
  if (!account || (rep && account.account_rep_id !== user.id)) throw new ApiError("Customer not found.", 404);
  if (write && account.status === "deleted") throw new ApiError("This account was deleted.");
  return { user, account };
}

// ── Balances: plan allowance plus applied adjustments ──
async function balancesOf(organizationId, plan) {
  const [sums] = await query(
    `SELECT
       COALESCE(SUM(CASE WHEN kind = 'calls' THEN quantity END), 0) AS calls,
       COALESCE(SUM(CASE WHEN kind = 'reports' THEN quantity END), 0) AS reports,
       COALESCE(SUM(CASE WHEN kind IN ('credit', 'discount') THEN amount_cents END), 0) AS creditCents,
       COALESCE(SUM(CASE WHEN kind = 'refund' THEN amount_cents END), 0) AS refundCents
     FROM account_adjustments WHERE organization_id = ? AND status = 'applied'`,
    [organizationId]
  );
  // Calls and reports are counted once calling is connected; until then nothing is used
  return {
    calls: { included: plan.callsPerMonth, added: Number(sums.calls), used: 0, total: plan.callsPerMonth + Number(sums.calls) },
    reports: { included: plan.reportsPerMonth, added: Number(sums.reports), used: 0, total: plan.reportsPerMonth + Number(sums.reports) },
    creditCents: Number(sums.creditCents),
    credit: money(Number(sums.creditCents)),
    refundedCents: Number(sums.refundCents),
  };
}

const ADJUSTMENT_SELECT = `SELECT account_adjustments.id, account_adjustments.number, account_adjustments.kind, account_adjustments.quantity,
  account_adjustments.amount_cents AS amountCents, account_adjustments.apply_to AS applyTo, account_adjustments.reason, account_adjustments.status,
  account_adjustments.reverses_id AS reversesId, account_adjustments.created_at AS createdAt, account_adjustments.decided_at AS decidedAt,
  account_adjustments.decision_note AS decisionNote, account_adjustments.organization_id AS organizationId, organizations.name AS company,
  requesters.id AS requesterId, requesters.name AS requestedBy, deciders.name AS decidedBy, customer_accounts.account_rep_id AS accountRepId,
  (SELECT COUNT(*) FROM account_adjustments AS reversals WHERE reversals.reverses_id = account_adjustments.id) > 0 AS reversed
  FROM account_adjustments
  JOIN organizations ON organizations.id = account_adjustments.organization_id
  JOIN users AS requesters ON requesters.id = account_adjustments.requested_by
  LEFT JOIN customer_accounts ON customer_accounts.organization_id = account_adjustments.organization_id
  LEFT JOIN users AS deciders ON deciders.id = account_adjustments.decided_by`;

const presentAdjustment = (row) => ({
  ...row,
  reference: `ADJ-${row.number}`,
  reversed: Boolean(row.reversed),
  isReversal: Boolean(row.reversesId),
  value:
    row.kind === "calls" || row.kind === "reports"
      ? `${row.quantity > 0 ? "+" : "−"}${Math.abs(row.quantity)} ${row.kind}`
      : `${row.amountCents < 0 ? "−" : row.kind === "refund" ? "" : "+"}${money(row.amountCents)}`,
});

export async function listAdjustments({ organizationId = null, status = null, limit = 200 } = {}) {
  const clauses = [];
  const values = [];
  if (organizationId) {
    clauses.push("account_adjustments.organization_id = ?");
    values.push(organizationId);
  }
  if (status) {
    clauses.push("account_adjustments.status = ?");
    values.push(status);
  }
  const rows = await query(`${ADJUSTMENT_SELECT} ${clauses.length ? `WHERE ${clauses.join(" AND ")}` : ""} ORDER BY account_adjustments.created_at DESC, account_adjustments.number DESC LIMIT ${Number(limit) || 200}`, values);
  return rows.map(presentAdjustment);
}

const healthOf = ({ subscriptionStatus, calibrated, lastActiveAt }) => {
  let score = 0;
  if (["active", "trialing"].includes(subscriptionStatus)) score += 40;
  else if (subscriptionStatus === "pending_payment") score += 20;
  if (calibrated) score += 30;
  if (lastActiveAt && Date.now() - new Date(lastActiveAt) < 7 * 86400000) score += 30;
  return score;
};

// Everything the customer detail page shows
export async function getAccountDetail({ user, account: loaded }) {
  // Read again so the page sees changes made earlier in the same request
  const account = (await loadAccount(loaded.organization_id)) ?? loaded;
  const organizationId = account.organization_id;
  const [owner] = await query("SELECT id, name, email, password_set AS activated, created_at AS createdAt FROM users WHERE organization_id = ? AND role = 'customer_admin' ORDER BY created_at LIMIT 1", [organizationId]);
  const members = await query(
    `SELECT users.id, users.name, users.email, users.role, users.created_at AS createdAt,
      (SELECT MAX(created_at) FROM login_events WHERE login_events.user_id = users.id AND success = 1) AS lastLoginAt
     FROM users WHERE organization_id = ? ORDER BY users.role = 'customer_admin' DESC, users.created_at`,
    [organizationId]
  );
  const [rep] = account.account_rep_id ? await query("SELECT id, name, email FROM users WHERE id = ?", [account.account_rep_id]) : [];
  const subscription = await getSubscription(organizationId);
  const [{ sessions, lastCalibratedAt }] = await query("SELECT COUNT(*) AS sessions, MAX(completed_at) AS lastCalibratedAt FROM calibration_sessions WHERE organization_id = ?", [organizationId]);
  const lastActiveAt = members.reduce((latest, member) => (member.lastLoginAt && (!latest || new Date(member.lastLoginAt) > new Date(latest)) ? member.lastLoginAt : latest), null);
  const tickets = await listAccountTickets(organizationId);
  const notes = await listNotes(organizationId);
  const [scheduledPlan] = subscription.scheduledPlanId ? await query("SELECT name FROM plans WHERE id = ?", [subscription.scheduledPlanId]) : [];
  const activity = await query(
    "SELECT id, action, summary, actor_name AS actor, created_at AS createdAt FROM audit_logs WHERE organization_id = ? ORDER BY created_at DESC LIMIT 25",
    [organizationId]
  );
  return {
    organizationId,
    company: account.company,
    accountNumber: `ACC-${organizationId.slice(-6).toUpperCase()}`,
    status: account.status,
    statusReason: account.status_reason,
    customerSince: account.created_at,
    source: account.source,
    profile: {
      phone: account.contact_phone,
      country: account.country,
      seats: account.seats,
      industry: account.industry,
      website: account.website,
      address: account.address,
      timezone: account.timezone,
      companySize: account.company_size,
      billingEmail: account.billing_email ?? owner?.email ?? null,
    },
    owner: owner ? { ...owner, activated: Boolean(owner.activated) } : null,
    members,
    rep: rep ?? null,
    subscription: { ...subscription, scheduledPlanName: scheduledPlan?.name ?? null },
    balances: await balancesOf(organizationId, subscription.plan),
    calibration: { completed: Number(sessions) > 0, sessions: Number(sessions), lastCompletedAt: lastCalibratedAt },
    lastActiveAt,
    activeRecently: Boolean(lastActiveAt && Date.now() - new Date(lastActiveAt) < 7 * 86400000),
    healthScore: healthOf({ subscriptionStatus: subscription.status, calibrated: Number(sessions) > 0, lastActiveAt }),
    tickets,
    notes,
    adjustments: await listAdjustments({ organizationId, limit: 50 }),
    invoices: await listInvoices(organizationId),
    activity,
    impersonations: await listImpersonations(organizationId),
    permissions: {
      canWrite: user.role !== ROLES.AUDITOR,
      isSuperAdmin: isSuperAdmin(user),
      limits: user.role === ROLES.SALES_REP ? REP_LIMIT : null,
      applyDirectly: isSuperAdmin(user) || user.role === ROLES.SALES_REP,
      canImpersonate: user.role !== ROLES.SALES_REP && user.role !== ROLES.AUDITOR,
      canSuspend: user.role !== ROLES.SALES_REP && user.role !== ROLES.AUDITOR,
    },
  };
}

// ── Notes ──
const NOTE_TYPES = ["Lead Insight", "Call Coaching", "Lead Update", "Communication", "System Note"];

export async function listNotes(organizationId) {
  const rows = await query(
    `SELECT account_notes.id, account_notes.title, account_notes.body, account_notes.type, account_notes.pinned, account_notes.created_at AS createdAt,
      account_notes.updated_at AS updatedAt, users.id AS authorId, users.name AS author, users.role AS authorRole, editors.name AS updatedBy
     FROM account_notes JOIN users ON users.id = account_notes.author_id LEFT JOIN users AS editors ON editors.id = account_notes.updated_by
     WHERE account_notes.organization_id = ? ORDER BY account_notes.pinned DESC, account_notes.created_at DESC`,
    [organizationId]
  );
  return rows.map((row) => ({ ...row, pinned: Boolean(row.pinned) }));
}

const noteFields = (body, { partial = false } = {}) => {
  const fields = {};
  if (!partial || body.body !== undefined) fields.body = text(body.body, "Note", 5000, { required: true });
  if (!partial || body.title !== undefined) fields.title = text(body.title, "Title", 255);
  if (!partial || body.type !== undefined) {
    if (body.type !== undefined && !NOTE_TYPES.includes(body.type)) throw new ApiError("Choose a note type.");
    fields.type = body.type ?? "Lead Insight";
  }
  if (!partial || body.pinned !== undefined) fields.pinned = body.pinned ? 1 : 0;
  return fields;
};

export async function addNote({ user, account }, body) {
  const fields = noteFields(body);
  const id = createId("note");
  await query("INSERT INTO account_notes (id, organization_id, author_id, body, title, type, pinned) VALUES (?, ?, ?, ?, ?, ?, ?)", [id, account.organization_id, user.id, fields.body, fields.title, fields.type, fields.pinned]);
  await recordAudit(user, { action: "account.note_added", entityType: "organization", entityId: account.organization_id, organizationId: account.organization_id, summary: `Added a note to ${account.company}${fields.title ? `: ${fields.title}` : ""}` });
  return listNotes(account.organization_id);
}

async function ownNote({ user, account }, noteId) {
  const [note] = await query("SELECT author_id AS authorId FROM account_notes WHERE id = ? AND organization_id = ?", [noteId, account.organization_id]);
  if (!note) throw new ApiError("Note not found.", 404);
  if (note.authorId !== user.id && !isSuperAdmin(user)) throw new ApiError("Only the author can change this note.", 403);
}

export async function updateNote(context, noteId, body) {
  await ownNote(context, noteId);
  const fields = noteFields(body, { partial: true });
  const entries = Object.entries(fields);
  if (entries.length) {
    await query(`UPDATE account_notes SET ${entries.map(([column]) => `${column} = ?`).join(", ")}, updated_at = NOW(), updated_by = ? WHERE id = ?`, [...entries.map(([, value]) => value), context.user.id, noteId]);
  }
  return listNotes(context.account.organization_id);
}

export async function deleteNote(context, noteId) {
  await ownNote(context, noteId);
  await query("DELETE FROM account_notes WHERE id = ?", [noteId]);
  return listNotes(context.account.organization_id);
}

// ── Credits & adjustments ──
export async function requestAdjustment({ user, account }, body) {
  const kind = body.kind;
  if (kind === "refund") return issueRefund({ user, account }, body);
  if (!ADJUSTMENT_KINDS.includes(kind)) throw new ApiError("Choose what to add: calls, reports, credit or discount.");
  const reason = text(body.reason, "Reason", 500, { required: true });
  let quantity = null;
  let amountCents = null;
  if (kind === "calls" || kind === "reports") {
    quantity = Number.parseInt(body.quantity, 10);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100000) throw new ApiError(`Enter how many ${kind} to add.`);
  } else {
    amountCents = Math.round(Number(body.amount) * 100);
    if (!Number.isFinite(amountCents) || amountCents < 1 || amountCents > 100000000) throw new ApiError("Enter an amount greater than $0.");
  }
  // Sales reps: up to 50 calls / 50 reports / $50 per adjustment
  if (user.role === ROLES.SALES_REP) {
    const limit = REP_LIMIT[kind];
    if ((quantity ?? amountCents) > limit) throw new ApiError(kind === "calls" || kind === "reports" ? `You can add up to ${limit} ${kind} at a time.` : `You can apply up to ${money(limit)} at a time.`);
  }
  const applyTo = kind === "calls" || kind === "reports" ? null : APPLY_TO.includes(body.applyTo) ? body.applyTo : "Next Invoice";
  // Super Admins and sales reps apply directly; anyone else's request waits for a Super Admin
  const status = isSuperAdmin(user) || user.role === ROLES.SALES_REP ? "applied" : "pending";
  const id = createId("adj");
  await query(
    "INSERT INTO account_adjustments (id, organization_id, kind, quantity, amount_cents, apply_to, reason, status, requested_by, decided_by, decided_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [id, account.organization_id, kind, quantity, amountCents, applyTo, reason, status, user.id, status === "applied" ? user.id : null, status === "applied" ? new Date() : null]
  );
  const [row] = await query(`${ADJUSTMENT_SELECT} WHERE account_adjustments.id = ?`, [id]);
  const adjustment = presentAdjustment(row);
  await recordAudit(user, {
    action: status === "applied" ? "billing.credits_added" : "billing.adjustment_requested",
    entityType: "account",
    entityId: account.organization_id,
    organizationId: account.organization_id,
    summary: `${status === "applied" ? "Applied" : "Requested"} ${adjustment.value} for ${account.company} (${adjustment.reference}): ${reason}`,
  });
  return adjustment;
}

// Refunds are recorded now and processed through Stripe once it's connected
async function issueRefund({ user, account }, body) {
  if (!isSuperAdmin(user)) throw new Error("FORBIDDEN");
  const reason = text(body.reason, "Reason", 500, { required: true });
  const amountCents = Math.round(Number(body.amount) * 100);
  if (!Number.isFinite(amountCents) || amountCents < 1) throw new ApiError("Enter the refund amount.");
  const id = createId("adj");
  await query(
    "INSERT INTO account_adjustments (id, organization_id, kind, amount_cents, apply_to, reason, status, requested_by, decided_by, decided_at) VALUES (?, ?, 'refund', ?, ?, ?, 'applied', ?, ?, NOW())",
    [id, account.organization_id, amountCents, text(body.invoice, "Invoice", 40), reason, user.id, user.id]
  );
  await recordAudit(user, { action: "billing.refund_recorded", entityType: "account", entityId: account.organization_id, organizationId: account.organization_id, summary: `Recorded a ${money(amountCents)} refund for ${account.company}: ${reason}` });
  const [row] = await query(`${ADJUSTMENT_SELECT} WHERE account_adjustments.id = ?`, [id]);
  return presentAdjustment(row);
}

async function findAdjustment(id) {
  const [row] = await query("SELECT * FROM account_adjustments WHERE id = ?", [id]);
  if (!row) throw new ApiError("Adjustment not found.", 404);
  return row;
}

// Super Admin approves or rejects a pending request
export async function decideAdjustment(user, id, { approve, note }) {
  if (!isSuperAdmin(user)) throw new Error("FORBIDDEN");
  const row = await findAdjustment(id);
  if (row.status !== "pending") throw new ApiError("This adjustment has already been decided.");
  const status = approve ? "applied" : "rejected";
  await query("UPDATE account_adjustments SET status = ?, decided_by = ?, decided_at = NOW(), decision_note = ? WHERE id = ? AND status = 'pending'", [status, user.id, text(note, "Note", 500), id]);
  await recordAudit(user, { action: approve ? "billing.credits_added" : "billing.adjustment_rejected", entityType: "account", entityId: row.organization_id, organizationId: row.organization_id, summary: `${approve ? "Approved" : "Rejected"} adjustment ADJ-${row.number}` });
  const [updated] = await query(`${ADJUSTMENT_SELECT} WHERE account_adjustments.id = ?`, [id]);
  return presentAdjustment(updated);
}

// Undo an applied adjustment with a new, opposite entry (the original stays as it was)
export async function reverseAdjustment(user, id, { reason }) {
  if (!isSuperAdmin(user)) throw new Error("FORBIDDEN");
  const row = await findAdjustment(id);
  if (row.status !== "applied" || row.reverses_id) throw new ApiError("Only an applied adjustment can be reversed.");
  const [already] = await query("SELECT id FROM account_adjustments WHERE reverses_id = ?", [id]);
  if (already) throw new ApiError("This adjustment was already reversed.");
  const why = text(reason, "Reason", 500, { required: true });
  const reversalId = createId("adj");
  await query(
    "INSERT INTO account_adjustments (id, organization_id, kind, quantity, amount_cents, apply_to, reason, status, requested_by, decided_by, decided_at, reverses_id) VALUES (?, ?, ?, ?, ?, ?, ?, 'applied', ?, ?, NOW(), ?)",
    [reversalId, row.organization_id, row.kind, row.quantity === null ? null : -row.quantity, row.amount_cents === null ? null : -row.amount_cents, row.apply_to, `Reversal of ADJ-${row.number}: ${why}`, user.id, user.id, id]
  );
  await recordAudit(user, { action: "billing.adjustment_reversed", entityType: "account", entityId: row.organization_id, organizationId: row.organization_id, summary: `Reversed adjustment ADJ-${row.number}: ${why}` });
  const [created] = await query(`${ADJUSTMENT_SELECT} WHERE account_adjustments.id = ?`, [reversalId]);
  return presentAdjustment(created);
}

// ── Subscription ──
const CYCLES = ["monthly", "annual"];

// What changing plan or billing cycle costs right now (shown before confirming)
export async function previewChange({ account }, { planId, billingCycle, when }) {
  const subscription = await getSubscription(account.organization_id);
  const [plan] = await query("SELECT * FROM plans WHERE id = ? AND active = 1", [planId ?? subscription.plan.id]);
  if (!plan) throw new ApiError("Choose a plan.");
  const cycle = CYCLES.includes(billingCycle) ? billingCycle : subscription.billingCycle ?? "monthly";
  const seats = Number(account.seats) || 1;
  const priceOf = (cents, c) => (c === "annual" ? cents.annual : cents.monthly) * seats;
  const current = priceOf({ monthly: subscription.plan.priceMonthlyCents, annual: subscription.plan.priceAnnualCents }, subscription.billingCycle ?? "monthly");
  const next = priceOf({ monthly: plan.price_monthly_cents, annual: plan.price_annual_cents }, cycle);
  const periodDays = (subscription.billingCycle ?? "monthly") === "annual" ? 365 : 30;
  const start = subscription.currentPeriodStart ? new Date(subscription.currentPeriodStart) : new Date();
  const used = Math.min(1, Math.max(0, (Date.now() - start) / (periodDays * 86400000)));
  const unusedCredit = Math.round(current * (1 - used));
  const immediate = when !== "renewal";
  const dueNow = immediate ? Math.max(0, next - unusedCredit) : 0;
  return {
    plan: { id: plan.id, name: plan.name },
    billingCycle: cycle,
    when: immediate ? "now" : "renewal",
    currentPriceCents: current,
    newPriceCents: next,
    unusedCreditCents: immediate ? unusedCredit : 0,
    dueNowCents: dueNow,
    creditGeneratedCents: immediate ? Math.max(0, unusedCredit - next) : 0,
    summary: immediate
      ? `Changes now. The unused part of the current ${subscription.billingCycle ?? "monthly"} period (${money(unusedCredit)}) is credited, so ${money(dueNow)} is due today${unusedCredit > next ? ` and ${money(unusedCredit - next)} is left as account credit` : ""}. Then ${money(next)} per ${cycle === "annual" ? "year" : "month"}.`
      : `Nothing changes until the next renewal. From then: ${plan.name}, ${money(next)} per ${cycle === "annual" ? "year" : "month"}. No proration.`,
  };
}

export async function changeSubscription({ user, account }, body) {
  const preview = await previewChange({ account }, body);
  if (preview.when === "now") {
    await query("UPDATE subscriptions SET plan_id = ?, billing_cycle = ?, current_period_start = NOW(), scheduled_plan_id = NULL, scheduled_cycle = NULL WHERE organization_id = ?", [preview.plan.id, preview.billingCycle, account.organization_id]);
  } else {
    await query("UPDATE subscriptions SET scheduled_plan_id = ?, scheduled_cycle = ? WHERE organization_id = ?", [preview.plan.id, preview.billingCycle, account.organization_id]);
  }
  await recordAudit(user, { action: "billing.plan_changed", entityType: "account", entityId: account.organization_id, organizationId: account.organization_id, summary: `${preview.when === "now" ? "Changed" : "Scheduled change of"} ${account.company} to ${preview.plan.name} (${preview.billingCycle})` });
  return preview;
}

export async function pauseSubscription({ user, account }, { until, resume }) {
  if (resume) {
    await query("UPDATE subscriptions SET paused_until = NULL, status = IF(status = 'paused', 'active', status) WHERE organization_id = ?", [account.organization_id]);
    await recordAudit(user, { action: "billing.subscription_resumed", entityType: "account", entityId: account.organization_id, organizationId: account.organization_id, summary: `Resumed ${account.company}'s subscription` });
    return;
  }
  if (typeof until !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(until) || new Date(until) <= new Date()) throw new ApiError("Choose a future date to pause until.");
  await query("UPDATE subscriptions SET paused_until = ?, status = 'paused' WHERE organization_id = ?", [until, account.organization_id]);
  await recordAudit(user, { action: "billing.subscription_paused", entityType: "account", entityId: account.organization_id, organizationId: account.organization_id, summary: `Paused ${account.company}'s subscription until ${until}` });
}

export async function cancelSubscription({ user, account }, { undo, reason }) {
  const why = undo ? null : text(reason, "Reason", 200);
  await query("UPDATE subscriptions SET cancel_at_period_end = ? WHERE organization_id = ?", [undo ? 0 : 1, account.organization_id]);
  await recordAudit(user, { action: undo ? "billing.cancellation_undone" : "billing.subscription_cancelled", entityType: "account", entityId: account.organization_id, organizationId: account.organization_id, summary: undo ? `Kept ${account.company}'s subscription` : `${account.company}'s subscription ends at the end of the current period${why ? ` (${why})` : ""}` });
}

// ── Account ──
export async function updateProfile({ user, account }, body) {
  const fields = {
    contact_phone: text(body.phone, "Phone", 64),
    country: text(body.country, "Country", 80),
    industry: text(body.industry, "Industry", 120),
    website: text(body.website, "Website", 255),
    address: text(body.address, "Address", 500),
    timezone: text(body.timezone, "Time zone", 80),
    company_size: text(body.companySize, "Company size", 40),
    billing_email: text(body.billingEmail, "Billing email", 255),
  };
  const entries = Object.entries(fields).filter(([column]) => body[{ contact_phone: "phone", company_size: "companySize", billing_email: "billingEmail" }[column] ?? column] !== undefined);
  if (body.seats !== undefined) {
    const seats = Number.parseInt(body.seats, 10);
    if (!Number.isInteger(seats) || seats < 1 || seats > 500) throw new ApiError("Seats must be between 1 and 500.");
    entries.push(["seats", seats]);
  }
  if (entries.length) await query(`UPDATE customer_accounts SET ${entries.map(([column]) => `${column} = ?`).join(", ")} WHERE organization_id = ?`, [...entries.map(([, value]) => value), account.organization_id]);
  if (body.company !== undefined) await query("UPDATE organizations SET name = ? WHERE id = ?", [text(body.company, "Company name", 255, { required: true }), account.organization_id]);
  await recordAudit(user, { action: "account.profile_updated", entityType: "organization", entityId: account.organization_id, organizationId: account.organization_id, summary: `Updated ${account.company}'s company profile` });
}

export async function updateOwner({ user, account }, body) {
  const [owner] = await query("SELECT id, email FROM users WHERE organization_id = ? AND role = 'customer_admin' ORDER BY created_at LIMIT 1", [account.organization_id]);
  if (!owner) throw new ApiError("This account has no owner.", 404);
  const name = text(body.name, "Name", 255, { required: true });
  const email = text(body.email, "Email", 255, { required: true }).toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new ApiError("Enter a valid email address.");
  if (email !== owner.email) {
    const [taken] = await query("SELECT id FROM users WHERE email = ? AND id <> ?", [email, owner.id]);
    if (taken) throw new ApiError("Someone else already uses this email.", 409);
  }
  await query("UPDATE users SET name = ?, email = ? WHERE id = ?", [name, email, owner.id]);
  await recordAudit(user, { action: "account.owner_updated", entityType: "user", entityId: owner.id, organizationId: account.organization_id, summary: `Updated the account owner of ${account.company}` });
}

// Suspended and deleted accounts can't sign in; their sessions end immediately
export async function setAccountStatus({ user, account }, { status, reason }) {
  if (!["active", "suspended", "deleted"].includes(status)) throw new ApiError("Unknown status.");
  if (status === "deleted" && !isSuperAdmin(user)) throw new Error("FORBIDDEN");
  if (status !== "active" && user.role === ROLES.SALES_REP) throw new Error("FORBIDDEN");
  const why = status === "active" ? null : text(reason, "Reason", 500, { required: true });
  await query("UPDATE customer_accounts SET status = ?, status_reason = ?, status_changed_at = NOW() WHERE organization_id = ?", [status, why, account.organization_id]);
  if (status !== "active") await query("DELETE sessions FROM sessions JOIN users ON users.id = sessions.user_id WHERE users.organization_id = ?", [account.organization_id]);
  await recordAudit(user, { action: `account.${status === "active" ? "reactivated" : status}`, entityType: "organization", entityId: account.organization_id, organizationId: account.organization_id, summary: `${status === "active" ? "Reactivated" : status === "suspended" ? "Suspended" : "Deleted"} ${account.company}${why ? `: ${why}` : ""}` });
}

export async function resetCalibration({ user, account }) {
  const result = await query("DELETE FROM calibration_sessions WHERE organization_id = ?", [account.organization_id]);
  await recordAudit(user, { action: "account.calibration_reset", entityType: "organization", entityId: account.organization_id, organizationId: account.organization_id, summary: `Reset calibration for ${account.company}` });
  return { removed: result.affectedRows };
}

// Credits & Adjustments page (Billing): every customer's ledger, with pending requests first
export async function requireBillingAccess() {
  const user = await requireCurrentUser();
  if (user.role !== ROLES.SALES_REP && !canAccessSection(user.role, "billing")) throw new Error("FORBIDDEN");
  return user;
}

export async function adjustmentsOverview(user) {
  const repScope = user.role === ROLES.SALES_REP;
  const rows = await listAdjustments({ limit: 500 });
  // A rep sees adjustments on the accounts they own
  const visible = repScope ? rows.filter((row) => row.accountRepId === user.id || row.requesterId === user.id) : rows;
  const applied = visible.filter((row) => row.status === "applied");
  const thisMonth = applied.filter((row) => new Date(row.createdAt).getMonth() === new Date().getMonth() && new Date(row.createdAt).getFullYear() === new Date().getFullYear());
  return {
    results: visible,
    stats: {
      addedThisMonth: visible.filter((row) => new Date(row.createdAt).getMonth() === new Date().getMonth() && new Date(row.createdAt).getFullYear() === new Date().getFullYear()).length,
      pending: visible.filter((row) => row.status === "pending").length,
      creditsThisMonthCents: thisMonth.filter((row) => ["credit", "discount"].includes(row.kind)).reduce((sum, row) => sum + row.amountCents, 0),
      callsThisMonth: thisMonth.filter((row) => row.kind === "calls").reduce((sum, row) => sum + row.quantity, 0),
      reportsThisMonth: thisMonth.filter((row) => row.kind === "reports").reduce((sum, row) => sum + row.quantity, 0),
      refundsThisMonthCents: thisMonth.filter((row) => row.kind === "refund").reduce((sum, row) => sum + row.amountCents, 0),
    },
  };
}

// ── Impersonation ("view as customer") ──
// Super Admins and Support open a real session as a customer user. The staff member's
// own session is kept aside and restored on exit. Read-only sessions can't change anything
// (enforced in withApi). Start and end are written to the audit log.
const IMPERSONATION_DURATIONS = { "15m": 15, "30m": 30, "1h": 60, "2h": 120, "4h": 240, logout: 720 }; // minutes; "Until Logout" caps at 12 hours

export async function startImpersonation({ user, account }, body) {
  if (user.role === ROLES.SALES_REP) throw new Error("FORBIDDEN");
  if (user.impersonation) throw new ApiError("You are already impersonating someone.");
  if (account.status !== "active") throw new ApiError("Reactivate this account before viewing it as the customer.");
  const reason = text(body.reason, "Reason", 500, { required: true });
  const access = body.accessLevel === "readonly" ? "readonly" : "full";
  const minutes = IMPERSONATION_DURATIONS[body.duration] ?? 60;
  const [target] = body.userId
    ? await query("SELECT id, name FROM users WHERE id = ? AND organization_id = ?", [body.userId, account.organization_id])
    : await query("SELECT id, name FROM users WHERE organization_id = ? AND role = 'customer_admin' ORDER BY created_at LIMIT 1", [account.organization_id]);
  if (!target) throw new ApiError("Choose someone on this account.", 404);
  const staffToken = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!staffToken) throw new Error("UNAUTHORIZED");
  const id = createId("imp");
  const expiresAt = new Date(Date.now() + minutes * 60000);
  await query("INSERT INTO impersonation_sessions (id, staff_id, user_id, organization_id, access, reason, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)", [id, user.id, target.id, account.organization_id, access, reason, expiresAt]);
  await recordAudit(user, {
    action: "account.impersonation_started",
    entityType: "user",
    entityId: target.id,
    organizationId: account.organization_id,
    summary: `Started ${access === "readonly" ? "read-only" : "full access"} impersonation of ${target.name} (${account.company}): ${reason}`,
    metadata: { impersonationId: id, minutes },
  });
  const store = await cookies();
  store.set(STAFF_SESSION_COOKIE, staffToken, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 });
  await createSession(target.id, { impersonationId: id, maxAgeSeconds: minutes * 60 });
  return { id, access, expiresAt, redirectTo: "/user/dashboard" };
}

// Leave the customer's portal and go back to the staff portal
export async function endImpersonation() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const [row] = token
    ? await query(
        `SELECT impersonation_sessions.*, users.name AS userName, staff.id AS staffId, staff.name AS staffName, staff.role AS staffRole, organizations.name AS company
         FROM sessions JOIN impersonation_sessions ON impersonation_sessions.id = sessions.impersonation_id
         JOIN users ON users.id = impersonation_sessions.user_id JOIN users AS staff ON staff.id = impersonation_sessions.staff_id
         JOIN organizations ON organizations.id = impersonation_sessions.organization_id
         WHERE sessions.token_hash = ?`,
        [hashToken(token)]
      )
    : [];
  if (row && !row.ended_at) {
    await query("UPDATE impersonation_sessions SET ended_at = NOW() WHERE id = ?", [row.id]);
    await recordAudit(
      { id: row.staffId, name: row.staffName, role: row.staffRole },
      { action: "account.impersonation_ended", entityType: "user", entityId: row.user_id, organizationId: row.organization_id, summary: `Ended impersonation of ${row.userName} (${row.company})`, metadata: { impersonationId: row.id } }
    );
  }
  const restored = await swapToStaffSession();
  return { restored, redirectTo: restored && row ? `/super-admin/users/${row.organization_id}` : "/sign-in" };
}

export async function listImpersonations(organizationId) {
  return query(
    `SELECT impersonation_sessions.id, impersonation_sessions.access, impersonation_sessions.reason, impersonation_sessions.started_at AS startedAt,
      impersonation_sessions.ended_at AS endedAt, impersonation_sessions.expires_at AS expiresAt, staff.name AS staffName, users.name AS userName
     FROM impersonation_sessions JOIN users AS staff ON staff.id = impersonation_sessions.staff_id JOIN users ON users.id = impersonation_sessions.user_id
     WHERE impersonation_sessions.organization_id = ? ORDER BY impersonation_sessions.started_at DESC LIMIT 20`,
    [organizationId]
  );
}
