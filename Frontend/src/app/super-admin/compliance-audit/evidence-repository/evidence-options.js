// Evidence Repository options (client spec, Nov 2026)

export const EVIDENCE_STATUSES = ["Draft", "Under Review", "Needs Changes", "Verified", "Expired", "Archived"];
export const TRUST_SERVICE_CRITERIA = ["Security", "Availability", "Confidentiality", "Processing Integrity", "Privacy"];

// Controls from the SOC 2 Readiness control library
export const SOC2_CONTROLS = [
  { id: "CC6.1", name: "Logical access controls" },
  { id: "CC6.2", name: "User provisioning & removal" },
  { id: "CC6.3", name: "Role-based access" },
  { id: "CC7.2", name: "Security monitoring" },
  { id: "CC8.1", name: "Change management" },
  { id: "A1.2", name: "Backup & recovery" },
  { id: "C1.1", name: "Confidential data handling" },
  { id: "PI1.1", name: "Processing integrity" },
  { id: "P4.1", name: "Personal data retention" },
];

// People with permission to manage Compliance & Audit evidence
export const EVIDENCE_OWNERS = ["Daniel Miller", "Sarah Johnson", "Mike Davis", "Jessica Lee"];

// "SEC-02" style ids from older sample rows map onto real controls
export const controlsOf = (item) => item.controls ?? (item.controlId ? [item.controlId] : []);
export const criteriaOf = (item) => item.trustCriteriaList ?? (item.trustCriteria ? [item.trustCriteria] : []);
// "CC6.1 +2 more"
export const controlsLabel = (item) => {
  const list = controlsOf(item);
  return list.length > 1 ? `${list[0]} +${list.length - 1} more` : list[0] ?? "—";
};
