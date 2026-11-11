import { randomBytes } from "node:crypto";
import { createId, hashPassword, hashToken, query } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { recordAudit } from "@/lib/audit";
import { sendCustomerActivationEmail } from "@/lib/email/system";
import { recordUserEvent } from "@/lib/campaigns/events";
import { redeemPromo, validatePromo } from "@/lib/pricing";
import { requireCurrentUser } from "@/lib/auth";
import { likePattern } from "@/lib/listing";
import { ROLES, canAccessSection } from "@/utils.js/roles";

// ── Customer accounts (the companies PitchProX sells to) ──
// Sales reps create accounts from the User Portal and see the accounts they own;
// admin roles with the "users" section see every customer.

const ACTIVATION_DAYS = 14;
const BILLING_CYCLES = ["monthly", "annual"];

// { user, ownOnly } — reps only see their own accounts
export async function requireCustomerManager() {
  const user = await requireCurrentUser();
  if (user.role === ROLES.SALES_REP) return { user, ownOnly: true };
  if (canAccessSection(user.role, "users")) return { user, ownOnly: false };
  throw new Error("FORBIDDEN");
}

const text = (value, label, max, { required = false } = {}) => {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (required && !trimmed) throw new ApiError(`${label} is required.`);
  if (trimmed.length > max) throw new ApiError(`${label} must be ${max} characters or fewer.`);
  return trimmed || null;
};

// Health score 0–100 from what we can measure before calling is connected:
// subscription in good standing, calibration done, signed in during the last week.
const healthOf = (row) => {
  let score = 0;
  if (["active", "trialing"].includes(row.subscriptionStatus)) score += 40;
  else if (row.subscriptionStatus === "pending_payment") score += 20;
  if (row.calibrated) score += 30;
  if (row.lastActiveAt && Date.now() - new Date(row.lastActiveAt) < 7 * 86400000) score += 30;
  return score;
};

const ACCOUNT_SELECT = `SELECT organizations.id AS organizationId, organizations.name AS company, organizations.created_at AS createdAt,
  owners.id AS ownerId, owners.name, owners.email, owners.password_set AS activated,
  customer_accounts.contact_phone AS phone, customer_accounts.country, customer_accounts.status AS accountStatus, customer_accounts.seats, customer_accounts.source,
  reps.id AS repId, reps.name AS repName,
  plans.id AS planId, plans.name AS planName, plans.calls_per_month AS callsMax, plans.reports_per_month AS reportsMax,
  subscriptions.status AS subscriptionStatus, subscriptions.billing_cycle AS billingCycle,
  (SELECT COUNT(*) FROM calibration_sessions WHERE calibration_sessions.organization_id = organizations.id) > 0 AS calibrated,
  (SELECT MAX(login_events.created_at) FROM login_events JOIN users AS members ON members.id = login_events.user_id WHERE members.organization_id = organizations.id AND login_events.success = 1) AS lastActiveAt,
  (SELECT COUNT(*) FROM users AS members WHERE members.organization_id = organizations.id) AS members
  FROM organizations
  JOIN users AS owners ON owners.organization_id = organizations.id AND owners.role = 'customer_admin'
  LEFT JOIN customer_accounts ON customer_accounts.organization_id = organizations.id
  LEFT JOIN users AS reps ON reps.id = customer_accounts.account_rep_id
  LEFT JOIN subscriptions ON subscriptions.organization_id = organizations.id
  LEFT JOIN plans ON plans.id = subscriptions.plan_id`;

const toAccount = (row) => ({
  ...row,
  activated: Boolean(row.activated),
  calibrated: Boolean(row.calibrated),
  members: Number(row.members),
  accountNumber: `ACC-${row.organizationId.slice(-6).toUpperCase()}`,
  status: row.accountStatus === "suspended" ? "Suspended" : row.accountStatus === "deleted" ? "Deleted" : !row.activated ? "Invited" : row.subscriptionStatus === "pending_payment" ? "Pending payment" : row.subscriptionStatus === "trialing" ? "Trial" : row.subscriptionStatus === "canceled" ? "Canceled" : "Active",
  healthScore: healthOf(row),
});

export async function listCustomers({ user, ownOnly }, { search } = {}) {
  const clauses = [];
  const values = [];
  if (ownOnly) {
    clauses.push("customer_accounts.account_rep_id = ?");
    values.push(user.id);
  }
  if (search) {
    clauses.push("(organizations.name LIKE ? OR owners.name LIKE ? OR owners.email LIKE ?)");
    values.push(likePattern(search), likePattern(search), likePattern(search));
  }
  const rows = await query(`${ACCOUNT_SELECT} ${clauses.length ? `WHERE ${clauses.join(" AND ")}` : ""} ORDER BY organizations.created_at DESC LIMIT 1000`, values);
  const accounts = rows.map(toAccount);
  const count = (status) => accounts.filter((account) => account.status === status).length;
  return {
    results: accounts,
    stats: {
      total: accounts.length,
      active: count("Active"),
      trial: count("Trial"),
      pending: count("Pending payment") + count("Invited"),
      calibrated: accounts.length ? Math.round((accounts.filter((account) => account.calibrated).length / accounts.length) * 100) : 0,
      avgHealth: accounts.length ? Math.round(accounts.reduce((sum, account) => sum + account.healthScore, 0) / accounts.length) : 0,
    },
  };
}

// User Portal: a new customer company, its owner account and a subscription waiting for payment.
// Until Stripe is connected the rep sends the activation link; the customer sets a password there.
export async function createCustomerAccount(user, body) {
  const name = text(body.fullName ?? body.name ?? body.firstName, "Customer name", 255, { required: true });
  const company = text(body.company, "Company name", 255, { required: true });
  const email = text(body.email, "Email", 255, { required: true }).toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new ApiError("Enter a valid email address.");
  const [existing] = await query("SELECT id FROM users WHERE email = ?", [email]);
  if (existing) throw new ApiError("Someone with this email already has an account.", 409);
  const [plan] = await query("SELECT id, name, is_trial AS isTrial FROM plans WHERE id = ? AND active = 1", [body.planId]);
  if (!plan) throw new ApiError("Choose a plan.");
  const billingCycle = BILLING_CYCLES.includes(body.billingCycle) ? body.billingCycle : "monthly";
  const seats = Math.min(Math.max(Number.parseInt(body.seats, 10) || 1, 1), 500);
  // A promo code is checked before anything is created
  const promo = typeof body.promoCode === "string" && body.promoCode.trim() ? await validatePromo({ code: body.promoCode, planId: plan.id, billingCycle }) : null;
  if (promo && !promo.valid) throw new ApiError(promo.message);

  const organizationId = createId("org");
  const ownerId = createId("user");
  const { salt, hash } = hashPassword(randomBytes(24).toString("hex"));
  await query("INSERT INTO organizations (id, name) VALUES (?, ?)", [organizationId, company]);
  await query("INSERT INTO users (id, organization_id, name, email, password_hash, password_salt, role, password_set) VALUES (?, ?, ?, ?, ?, ?, 'customer_admin', 0)", [ownerId, organizationId, name, email, hash, salt]);
  await query("INSERT INTO customer_accounts (organization_id, account_rep_id, contact_phone, country, seats, source, created_by) VALUES (?, ?, ?, ?, ?, 'sales', ?)", [
    organizationId, user.role === ROLES.SALES_REP ? user.id : null, text(body.phone, "Phone", 64), text(body.country, "Country", 80), seats, user.id,
  ]);
  await query("INSERT INTO subscriptions (organization_id, plan_id, status, billing_cycle, current_period_start) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)", [organizationId, plan.id, plan.isTrial ? "trialing" : "pending_payment", billingCycle]);
  if (promo) await redeemPromo(promo.promoId, organizationId);
  const invite = await createActivation(ownerId, user.id);
  await sendCustomerActivationEmail({ userId: ownerId, name, email, token: invite.token, company });
  await recordAudit(user, { action: "customer.created", entityType: "organization", entityId: organizationId, organizationId, summary: `Created ${company} (${email}) on ${plan.name}, ${seats} seat${seats === 1 ? "" : "s"}${promo ? `, promo ${promo.code} (${promo.discount.label})` : ""}` });
  const [row] = await query(`${ACCOUNT_SELECT} WHERE organizations.id = ?`, [organizationId]);
  return { account: toAccount(row), invite };
}

async function createActivation(userId, actorId) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + ACTIVATION_DAYS * 86400000);
  await query("INSERT INTO account_invites (id, user_id, token_hash, expires_at, created_by) VALUES (?, ?, ?, ?, ?)", [createId("activate"), userId, hashToken(token), expires, actorId]);
  return { token, expiresAt: expires.toISOString() };
}

// New activation link for a customer who hasn't activated yet
export async function resendActivation(context, organizationId) {
  const [row] = await query(`${ACCOUNT_SELECT} WHERE organizations.id = ?`, [organizationId]);
  if (!row || (context.ownOnly && row.repId !== context.user.id)) throw new ApiError("Customer not found.", 404);
  if (row.activated) throw new ApiError("This customer has already activated their account.");
  await query("UPDATE account_invites SET expires_at = NOW() WHERE user_id = ? AND accepted_at IS NULL AND expires_at > NOW()", [row.ownerId]);
  const invite = await createActivation(row.ownerId, context.user.id);
  await sendCustomerActivationEmail({ userId: row.ownerId, name: row.name, email: row.email, token: invite.token, company: row.company });
  return { invite };
}

// Activation link: set the first password → signed in as the customer owner
export async function activateAccount(token, password) {
  if (typeof token !== "string" || token.length < 20) throw new ApiError("This activation link is not valid.");
  if (typeof password !== "string" || password.length < 8) throw new ApiError("Password must be at least 8 characters.");
  if (password.length > 200) throw new ApiError("Password is too long.");
  const [invite] = await query("SELECT id, user_id AS userId, expires_at AS expiresAt, accepted_at AS acceptedAt FROM account_invites WHERE token_hash = ?", [hashToken(token)]);
  if (!invite) throw new ApiError("This activation link is not valid.", 404);
  if (invite.acceptedAt) throw new ApiError("This activation link was already used. Sign in instead.", 410);
  if (new Date(invite.expiresAt) <= new Date()) throw new ApiError("This activation link has expired. Ask your PitchProX rep for a new one.", 410);
  const { salt, hash } = hashPassword(password);
  await query("UPDATE users SET password_hash = ?, password_salt = ?, password_set = 1 WHERE id = ?", [hash, salt, invite.userId]);
  await query("UPDATE account_invites SET accepted_at = NOW() WHERE id = ?", [invite.id]);
  const [user] = await query("SELECT id, name, role, organization_id AS organizationId FROM users WHERE id = ?", [invite.userId]);
  await recordAudit(user, { action: "customer.activated", entityType: "user", entityId: user.id, organizationId: user.organizationId, summary: `${user.name} activated their account` });
  await recordUserEvent(user.id, "user_signed_up", { source: "sales" });
  return user;
}
