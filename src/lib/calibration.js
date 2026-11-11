import { query } from "@/lib/db";
import { loadSettings, saveSettings } from "@/lib/settings";
import { CUSTOMER_ROLES } from "@/utils.js/roles";

// ── Calibration gate (client, Nov 8) ──
// Customer users calibrate before their first call. They may skip it ("Do it later") and keep
// using the CRM, prospects and playbooks, but calling stays locked until one session is done.
// Employees (sales reps etc.) aren't gated.

export async function calibrationStatus(user) {
  if (!CUSTOMER_ROLES.includes(user.role)) return { required: false, completed: true, deferredAt: null, sessions: 0 };
  const [[{ total }], preferences] = await Promise.all([
    query("SELECT COUNT(*) AS total FROM calibration_sessions WHERE user_id = ?", [user.id]),
    loadSettings(user.id, "preferences", {}),
  ]);
  const sessions = Number(total);
  return { required: true, completed: sessions > 0, deferredAt: preferences.calibrationDeferredAt ?? null, sessions };
}

// Send the user to calibration after signing in? (not done, and they haven't chosen "Do it later")
export async function needsCalibrationPrompt(user) {
  const status = await calibrationStatus(user);
  return status.required && !status.completed && !status.deferredAt;
}

// "Do it later": stop sending them to calibration on sign-in (the reminders stay)
export async function deferCalibration(user) {
  const deferredAt = new Date().toISOString();
  await saveSettings(user.id, "preferences", {}, { calibrationDeferredAt: deferredAt });
  return calibrationStatus(user);
}
