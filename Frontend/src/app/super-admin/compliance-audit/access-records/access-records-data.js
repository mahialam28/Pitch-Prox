// Access Records: tabs and filter options (labels shown → values sent to /api/v1/admin/employees)

export const accessTabs = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending Invitations" },
  { id: "in-progress", label: "Onboarding In Progress" },
  { id: "active", label: "Active" },
  { id: "offboarding", label: "Offboarding Pending" },
  { id: "expired", label: "Expired Invites" },
];

export const ROLE_FILTERS = {
  "All Roles": null,
  "Super Admin": "super_admin",
  "Admin Manager": "admin_manager",
  "Support Assistant": "support",
  Auditor: "auditor",
  "Sales Rep": "sales_rep",
};
export const roleFilterOptions = Object.keys(ROLE_FILTERS);

export const STATUS_FILTERS = {
  "All Statuses": null,
  Active: "active",
  Onboarding: "onboarding",
  Pending: "invited",
  Offboarding: "offboarding",
  Deactivated: "deactivated",
};
export const statusFilterOptions = Object.keys(STATUS_FILTERS);

export const MFA_FILTERS = { "All MFA Statuses": null, Enabled: "enabled", Disabled: "disabled" };
export const mfaFilterOptions = Object.keys(MFA_FILTERS);
