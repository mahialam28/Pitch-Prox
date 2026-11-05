// ── API record → table row ──
// The Leads and CRM tables were built around display fields (strings, a
// follow-up status label). This maps a lead/prospect from /api/v1 into that
// shape so missing optional values never crash filters or rendering.

const DAY_MS = 24 * 60 * 60 * 1000;

export function followUpStatusFor(followUpAt, now = Date.now()) {
  if (!followUpAt) return "None";
  const remaining = new Date(followUpAt).getTime() - now;
  if (Number.isNaN(remaining)) return "None";
  if (remaining <= 0) return "Due Now";
  if (remaining <= 2 * DAY_MS) return "Due Soon";
  return "Scheduled";
}

export function toTableRow(record) {
  return {
    ...record,
    name: record.name ?? "",
    email: record.email ?? "",
    phoneNumber: record.phoneNumber ?? "",
    propertyAddress: record.propertyAddress ?? "",
    leadType: record.leadType ?? "",
    outcome: record.outcome ?? "",
    // No calls are recorded yet, so there is no "last connected" moment to show
    lastConnectedDate: "—",
    lastConnectedTime: "",
    followUpStatus: followUpStatusFor(record.followUpAt),
  };
}
