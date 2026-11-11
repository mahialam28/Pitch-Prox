// ── Policy Documents: shared lists (server and browser) ──

export const POLICY_TOPICS = ["Security", "Access & Identity", "HR & People", "Compliance", "IT & Operations", "Legal", "Data Privacy"];

// policy_documents.status → label in the table and filters
export const POLICY_STATUS_LABELS = { published: "Approved", under_review: "Under Review", draft: "Draft", archived: "Archived" };
// policy_versions.status → label in Version History
export const VERSION_STATUS_LABELS = { approved: "Current", superseded: "Previous", under_review: "Under Review", draft: "Draft", rejected: "Changes Requested" };

export const POLICY_FILE_TYPES = ["pdf", "docx", "doc"];
export const POLICY_FILE_MAX_BYTES = 20 * 1024 * 1024;

// Days employees get to sign a newly approved version before it counts as overdue
export const DEFAULT_ACK_DUE_DAYS = 14;

// "v2.1" / "2.1" → "2.1"; null when it isn't a version number
export function normalizeVersion(value) {
  const match = String(value ?? "").trim().match(/^v?(\d{1,3}(?:\.\d{1,3}){0,2})$/i);
  return match ? match[1] : null;
}
export const displayVersion = (version) => (version ? `v${version}` : "—");

// Compare "1.10" with "1.9" numerically
export function compareVersions(a, b) {
  const left = String(a).split(".").map(Number);
  const right = String(b).split(".").map(Number);
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const diff = (left[index] ?? 0) - (right[index] ?? 0);
    if (diff) return diff;
  }
  return 0;
}

// The next minor version after the highest one ("2.4" → "2.5"), used when restoring an old version
export function nextVersion(versions) {
  const highest = [...versions].sort(compareVersions).at(-1) ?? "0.0";
  const [major, minor = 0] = highest.split(".").map(Number);
  return `${major}.${minor + 1}`;
}
