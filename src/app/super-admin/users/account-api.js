// Browser calls for managing one customer account (Super Admin, Support, and a sales rep's own accounts).
// Every call reports its own error and rethrows, so confirm dialogs stay open for a retry.
import { apiRequest } from "@/lib/client-api";
import { showError } from "@/lib/alerts";

const base = (organizationId) => `/api/v1/customers/${organizationId}`;

async function call(title, url, options) {
  try {
    return await apiRequest(url, options);
  } catch (error) {
    showError(title, error.message);
    throw error;
  }
}

export const loadAccount = (id) => apiRequest(base(id));

export const accountApi = (id) => ({
  setStatus: (status, reason) => call("Status not changed", `${base(id)}/status`, { method: "POST", body: { status, reason } }),
  updateProfile: (body) => call("Profile not saved", `${base(id)}/profile`, { method: "PATCH", body }),
  updateOwner: (body) => call("Owner not saved", `${base(id)}/owner`, { method: "PATCH", body }),
  addNote: (body) => call("Note not saved", `${base(id)}/notes`, { method: "POST", body }),
  updateNote: (noteId, body) => call("Note not saved", `${base(id)}/notes/${noteId}`, { method: "PATCH", body }),
  deleteNote: (noteId) => call("Note not deleted", `${base(id)}/notes/${noteId}`, { method: "DELETE" }),
  adjust: (body) => call(body.kind === "refund" ? "Refund not recorded" : "Adjustment not saved", `${base(id)}/adjustments`, { method: "POST", body }),
  previewChange: (body) => call("Preview not available", `${base(id)}/subscription/preview`, { method: "POST", body }),
  changePlan: (body) => call("Plan not changed", `${base(id)}/subscription`, { method: "PATCH", body }),
  pause: (body) => call("Subscription not updated", `${base(id)}/subscription/pause`, { method: "POST", body }),
  cancel: (body) => call("Subscription not updated", `${base(id)}/subscription/cancel`, { method: "POST", body }),
  resetCalibration: () => call("Calibration not reset", `${base(id)}/calibration/reset`, { method: "POST" }),
  resendActivation: () => call("Activation link not created", `${base(id)}/activation`, { method: "POST" }),
  // Opens the customer's portal in this tab as a real (audited) session
  impersonate: async (options) => {
    const result = await call("Impersonation not started", `${base(id)}/impersonate`, { method: "POST", body: options });
    window.location.assign(result.redirectTo);
    return result;
  },
});

// Super Admin: approve / reject a pending adjustment, or reverse an applied one
export const decideAdjustment = (adjustmentId, decision, note) =>
  call("Adjustment not updated", `/api/v1/billing/adjustments/${adjustmentId}`, { method: "PATCH", body: { decision, note } });
export const reverseAdjustment = (adjustmentId, reason) =>
  call("Adjustment not reversed", `/api/v1/billing/adjustments/${adjustmentId}/reverse`, { method: "POST", body: { reason } });

export const money = (cents) => `$${(Math.abs(Number(cents) || 0) / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
