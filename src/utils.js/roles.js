// ── Roles and the portal each one belongs to ──
// Shared by the server guards, the API and the client redirects so a role
// always maps to the same portal everywhere.

export const ROLES = {
  CUSTOMER_ADMIN: "customer_admin",
  CUSTOMER_MEMBER: "customer_member",
  SALES_REP: "sales_rep",
  SUPER_ADMIN: "super_admin",
  // Internal staff roles that share the Super Admin portal with a narrower sidebar
  ADMIN_MANAGER: "admin_manager",
  SUPPORT: "support",
  AUDITOR: "auditor",
};

export const CUSTOMER_ROLES = [ROLES.CUSTOMER_ADMIN, ROLES.CUSTOMER_MEMBER];
// Roles that use the Super Admin portal
export const ADMIN_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN_MANAGER, ROLES.SUPPORT, ROLES.AUDITOR];
// PitchProX employees (they go through employee onboarding)
export const STAFF_ROLES = [...ADMIN_ROLES, ROLES.SALES_REP];

// Portal (first URL segment) → roles allowed inside it
export const PORTAL_ROLES = {
  user: CUSTOMER_ROLES,
  "internal-sales-representative": [ROLES.SALES_REP],
  "super-admin": ADMIN_ROLES,
};

export const ROLE_LABELS = {
  [ROLES.CUSTOMER_ADMIN]: "Customer Admin",
  [ROLES.CUSTOMER_MEMBER]: "Team Member",
  [ROLES.SALES_REP]: "Internal Sales Rep",
  [ROLES.SUPER_ADMIN]: "Super Admin",
  [ROLES.ADMIN_MANAGER]: "Admin Manager",
  [ROLES.SUPPORT]: "Support",
  [ROLES.AUDITOR]: "Auditor",
};

// ── Super Admin portal sections ──
// One list drives both the sidebar (portal-shell) and the API permission checks
// (lib/permissions), so a role can never see a page whose data it can't load.
// Order matches each role's sidebar in the Figma designs.
export const ADMIN_SECTIONS = {
  [ROLES.SUPER_ADMIN]: ["dashboard", "users", "sales-reps", "plans", "support", "performance", "calendar", "campaigns", "mail", "billing", "compliance", "playbook", "settings"],
  [ROLES.ADMIN_MANAGER]: ["dashboard", "sales-reps", "crm", "calendar", "campaigns", "mail", "billing", "compliance", "settings"],
  [ROLES.SUPPORT]: ["dashboard", "plans", "users", "sales-reps", "support", "calendar", "mail", "billing", "campaigns", "settings"],
  // Read-only access to compliance records and evidence
  [ROLES.AUDITOR]: ["compliance", "settings"],
};

export const canAccessSection = (role, section) => Boolean(ADMIN_SECTIONS[role]?.includes(section));

// Home pages that differ from the portal's /dashboard
const HOME_OVERRIDES = {
  [ROLES.SUPPORT]: "/super-admin/support-dashboard",
  [ROLES.AUDITOR]: "/super-admin/compliance-audit/overview",
};

// Home page for a role, or null for an unknown role (which has no portal)
export function dashboardPathFor(role) {
  if (HOME_OVERRIDES[role]) return HOME_OVERRIDES[role];
  const portal = Object.keys(PORTAL_ROLES).find((key) => PORTAL_ROLES[key].includes(role));
  return portal ? `/${portal}/dashboard` : null;
}

// Roles offered in the Add Employee wizard (label in the design → role)
export const EMPLOYEE_ROLE_OPTIONS = [
  { label: "Super Admin", role: ROLES.SUPER_ADMIN },
  { label: "Admin Manager", role: ROLES.ADMIN_MANAGER },
  { label: "Support", role: ROLES.SUPPORT },
  { label: "Auditor", role: ROLES.AUDITOR },
  { label: "Sales Rep", role: ROLES.SALES_REP },
];
