// ── Evidence Repository & SOC 2: shared lists (server and browser) ──

// Expired is worked out from the expiry date (a Verified item past it); it isn't set by hand
export const EVIDENCE_STATUSES = ["Draft", "Under Review", "Needs Changes", "Verified", "Expired", "Archived"];
export const TRUST_SERVICE_CRITERIA = ["Security", "Availability", "Confidentiality", "Processing Integrity", "Privacy"];
export const CONTROL_STATUSES = ["Not Started", "In Progress", "Implemented"];
export const EVIDENCE_FILE_TYPES = ["pdf", "png", "jpg", "jpeg", "csv", "xlsx", "xls", "doc", "docx", "txt", "json", "zip"];
export const EVIDENCE_FILE_MAX_BYTES = 25 * 1024 * 1024;

// The SOC 2 control library (seeded once; owners and status are managed in SOC 2 Readiness)
export const SOC2_CONTROL_LIBRARY = [
  ["CC1.1", "Security", "Code of conduct acknowledged by staff", "High"],
  ["CC1.4", "Security", "Security awareness training completed", "High"],
  ["CC2.2", "Security", "Policies communicated to employees", "Medium"],
  ["CC3.2", "Security", "Annual risk assessment", "High"],
  ["CC5.2", "Security", "Policies reviewed and approved", "Medium"],
  ["CC6.1", "Security", "Logical access controls", "High"],
  ["CC6.2", "Security", "User provisioning & removal", "High"],
  ["CC6.3", "Security", "Role-based access", "High"],
  ["CC6.6", "Security", "Multi-factor authentication", "High"],
  ["CC7.2", "Security", "Security monitoring", "High"],
  ["CC7.3", "Security", "Incident response", "High"],
  ["CC8.1", "Security", "Change management", "Medium"],
  ["CC9.2", "Security", "Vendor risk management", "Medium"],
  ["A1.1", "Availability", "Capacity monitoring", "Medium"],
  ["A1.2", "Availability", "Backup & recovery", "High"],
  ["A1.3", "Availability", "Recovery testing", "Medium"],
  ["C1.1", "Confidentiality", "Confidential data handling", "High"],
  ["C1.2", "Confidentiality", "Confidential data disposal", "Medium"],
  ["PI1.1", "Processing Integrity", "Processing integrity", "Medium"],
  ["PI1.3", "Processing Integrity", "Input and output validation", "Low"],
  ["P1.1", "Privacy", "Privacy notice", "Medium"],
  ["P3.1", "Privacy", "Consent for recording and AI use", "High"],
  ["P4.1", "Privacy", "Personal data retention", "Medium"],
  ["P5.1", "Privacy", "Data subject access requests", "Medium"],
].map(([id, criteria, name, priority]) => ({ id, criteria, name, priority }));

// "CC6.1 +2 more"
export const controlsLabel = (controls = []) => (controls.length > 1 ? `${controls[0]} +${controls.length - 1} more` : controls[0] ?? "—");
