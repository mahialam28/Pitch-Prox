import { apiRequest, formatDateTime } from "@/lib/client-api";

// Client calls for the Sales Reps screens (lib/sales-team on the server)
const base = "/api/v1/admin/sales-reps";

export const loadTeam = (month) => apiRequest(`${base}${month ? `?month=${month}` : ""}`);
export const loadQuotas = (month) => apiRequest(`${base}/quotas${month ? `?month=${month}` : ""}`);
export const saveQuotas = (quotas, month) => apiRequest(`${base}/quotas`, { method: "PUT", body: { quotas, month } });
export const loadRep = (id) => apiRequest(`${base}/${encodeURIComponent(id)}`);
export const updateRep = (id, body) => apiRequest(`${base}/${encodeURIComponent(id)}`, { method: "PATCH", body });
export const saveRepSettings = (id, body) => apiRequest(`${base}/${encodeURIComponent(id)}/settings`, { method: "PUT", body });
export const loadRepNotes = (id, kind = "coaching") => apiRequest(`${base}/${encodeURIComponent(id)}/notes?kind=${kind}`);
export const addRepNote = (id, body) => apiRequest(`${base}/${encodeURIComponent(id)}/notes`, { method: "POST", body });
export const updateRepNote = (id, noteId, body) => apiRequest(`${base}/${encodeURIComponent(id)}/notes/${noteId}`, { method: "PATCH", body });
export const deleteRepNote = (id, noteId) => apiRequest(`${base}/${encodeURIComponent(id)}/notes/${noteId}`, { method: "DELETE" });
export const loadRepActivity = (id, params) => apiRequest(`${base}/${encodeURIComponent(id)}/activity?${new URLSearchParams(params)}`);

// ── Display helpers ──
export const dollars = (cents) => (cents == null ? "—" : `$${Math.round(cents / 100).toLocaleString("en-US")}`);
export const pct = (value) => (value == null ? "—" : `${value}%`);
export const lastActive = (value) => (value ? formatDateTime(value) : "Never signed in");

// "↑ 3 vs last month" style trend
export function trend(now, before, format = (value) => value) {
  const diff = (now ?? 0) - (before ?? 0);
  if (!diff) return { text: "No change vs last month", positive: null };
  return { text: `${diff > 0 ? "↑" : "↓"} ${format(Math.abs(diff))} vs last month`, positive: diff > 0 };
}

export const TIER_STYLES = {
  elite: { label: "Elite", bar: "bg-emerald-500", color: "#10B981", dot: "bg-emerald-500" },
  strong: { label: "Strong", bar: "bg-blue-500", color: "#3B82F6", dot: "bg-blue-500" },
  developing: { label: "Developing", bar: "bg-amber-500", color: "#F59E0B", dot: "bg-amber-500" },
  "at-risk": { label: "At Risk", bar: "bg-rose-500", color: "#EF4444", dot: "bg-rose-500" },
};

export const STATUS_STYLES = {
  active: { badge: "bg-emerald-50 text-emerald-600 border-emerald-200/80", dot: "bg-emerald-500" },
  onboarding: { badge: "bg-blue-50 text-blue-600 border-blue-200", dot: "bg-blue-500" },
  invited: { badge: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" },
  offboarding: { badge: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  deactivated: { badge: "bg-slate-100 text-slate-500 border-slate-200", dot: "bg-slate-400" },
};

// Status shown in the roster: "At Risk" when an active rep is well behind their quota pace
export const rosterStatus = (rep) =>
  rep.status === "active" && rep.behindPace
    ? { label: "At Risk", badge: "bg-rose-50 text-rose-600 border-rose-200", dot: "bg-rose-500" }
    : { label: rep.statusLabel, ...(STATUS_STYLES[rep.status] ?? STATUS_STYLES.invited) };

// CSV download of the roster (Export Team Performance Report)
export function downloadTeamCsv(reps, monthLabel, { includeQuota = true } = {}) {
  const header = ["Name", "Employee ID", "Email", "Title", "Manager", "Status", "Leads", "Accounts", "Lead to Subscription %", `Closed (${monthLabel})`, `Booked revenue (${monthLabel})`, ...(includeQuota ? ["Quota", "Attainment %"] : []), "Last active"];
  const rows = reps.map((rep) => [
    rep.name, rep.employeeId ?? "", rep.email, rep.jobTitle, rep.managerName ?? "", rep.statusLabel, rep.leads, rep.accounts, rep.leadToSubscription ?? "", rep.closed,
    (rep.revenueCents / 100).toFixed(2), ...(includeQuota ? [rep.quotaCents == null ? "" : (rep.quotaCents / 100).toFixed(2), rep.attainment ?? ""] : []), rep.lastActiveAt ?? "",
  ]);
  const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `team-performance-${monthLabel.replace(/\s+/g, "-").toLowerCase()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
export const loadLeaderboard = (period) => apiRequest(`${base}/leaderboard?period=${period}`);
