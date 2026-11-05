import { requireCurrentUser } from "@/lib/auth";
import { CUSTOMER_ROLES, ROLES, canAccessSection } from "@/utils.js/roles";

// ── Who can see which leads and CRM prospects ──
//  - customers: everything in their company
//  - sales reps: the leads/prospects assigned to them
//  - admin roles with the CRM section (Admin Manager, Super Admin): all PitchProX leads
// `scope(table)` gives the WHERE fragment + values for that table (or alias).
export async function requirePipelineUser() {
  const user = await requireCurrentUser();
  const isCustomer = CUSTOMER_ROLES.includes(user.role);
  const ownOnly = user.role === ROLES.SALES_REP;
  if (!isCustomer && !ownOnly && !canAccessSection(user.role, "crm") && user.role !== ROLES.SUPER_ADMIN) throw new Error("FORBIDDEN");
  const scope = (table) =>
    ownOnly
      ? { sql: `${table}.organization_id = ? AND ${table}.assigned_to = ?`, values: [user.organizationId, user.id] }
      : { sql: `${table}.organization_id = ?`, values: [user.organizationId] };
  // Internal (PitchProX) pipelines use the internal lead types and "Company" wording
  return { user, scope, internal: !isCustomer };
}
