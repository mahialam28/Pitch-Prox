"use client";

import { usePathname } from "next/navigation";
import { internalLeadTypeOptions, internalOutcomeOptions, userLeadTypeOptions, userOutcomeOptions } from "@/utils.js/lead-options";

// Which portal a shared screen is shown in, worked out from the URL. Lets the
// Leads/CRM screens serve customers (/user), sales reps (/internal-sales-representative)
// and admins (/super-admin) with the right links, wording and option lists.
export function usePortal() {
  const segment = usePathname()?.split("/")[1] || "user";
  const base = `/${segment}`;
  const internal = segment !== "user";
  return {
    base,
    internal,
    // Admin portals don't place calls
    canCall: segment !== "super-admin",
    addressLabel: internal ? "Company Name" : "Property Address",
    leadTypes: internal ? internalLeadTypeOptions : userLeadTypeOptions,
    outcomes: internal ? internalOutcomeOptions : userOutcomeOptions,
    // Mail lives under Settings for customers and at /mail for staff
    mailBase: internal ? `${base}/mail` : "/user/settings/send-mail",
    mailBackLabel: internal ? "Back to Mail & Support" : "Back to Send Mail",
  };
}
