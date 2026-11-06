import { NextResponse } from "next/server";
import { createId, hashPassword, query } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { jsonError, readJson, withApi } from "@/lib/api";
import { ROLES } from "@/utils.js/roles";
import { TRIAL_PLAN_ID } from "@/lib/plan-catalog";
import { recordUserEvent } from "@/lib/campaigns/events";

export const runtime = "nodejs";

export const POST = withApi(async (request) => {
  const body = await readJson(request);
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const organizationName = (typeof body.organizationName === "string" && body.organizationName.trim()) || `${name || "My"} Organization`;
  if (!name || name.length > 255 || !/^\S+@\S+\.\S+$/.test(email) || email.length > 255 || password.length < 8) {
    return jsonError("Name, a valid email, and a password of at least 8 characters are required.");
  }
  if ((await query("SELECT id FROM users WHERE email = ?", [email])).length) {
    return jsonError("An account with that email already exists.", 409);
  }
  const organizationId = createId("org");
  const userId = createId("user");
  const { hash, salt } = hashPassword(password);
  // Public sign-up always creates a customer admin; roles are never taken from the request.
  await query("INSERT INTO organizations (id, name) VALUES (?, ?)", [organizationId, organizationName.slice(0, 255)]);
  try {
    await query("INSERT INTO users (id, organization_id, name, email, password_hash, password_salt, role) VALUES (?, ?, ?, ?, ?, ?, ?)", [userId, organizationId, name, email, hash, salt, ROLES.CUSTOMER_ADMIN]);
  } catch (error) {
    await query("DELETE FROM organizations WHERE id = ?", [organizationId]);
    if (error.code === "ER_DUP_ENTRY") return jsonError("An account with that email already exists.", 409);
    throw error;
  }
  // Customer account record + Free Trial subscription (used by the admin and sales dashboards)
  await query("INSERT IGNORE INTO customer_accounts (organization_id, source, created_by) VALUES (?, 'self_signup', ?)", [organizationId, userId]);
  await query("INSERT IGNORE INTO subscriptions (organization_id, plan_id, status, current_period_start) VALUES (?, ?, 'trialing', CURRENT_TIMESTAMP)", [organizationId, TRIAL_PLAN_ID]);
  // Lifecycle events for Campaigns & Journeys
  await recordUserEvent(userId, "user_signed_up", { source: "self_signup" });
  await recordUserEvent(userId, "trial_started", { planId: TRIAL_PLAN_ID });
  await createSession(userId);
  return NextResponse.json({ user: { id: userId, name, email, role: ROLES.CUSTOMER_ADMIN, organizationId } }, { status: 201 });
});
