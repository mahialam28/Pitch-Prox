import { query } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { recordAudit } from "@/lib/audit";
import { ROLE_LABELS, ROLES } from "@/utils.js/roles";
import { ownerOptions } from "@/lib/compliance/policies";
import { shownStatus } from "@/lib/compliance/evidence";
import { CONTROL_STATUSES, TRUST_SERVICE_CRITERIA } from "@/lib/compliance/evidence-catalog";

// ── SOC 2 Readiness ──
// A control is ready when it's Implemented and has Verified evidence that hasn't expired.
// Readiness, gaps and per-criteria progress are worked out from the control library
// (soc2_controls) and the Evidence Repository, so they update as evidence is verified.

const DAY = 86400000;
const parseJson = (value) => (typeof value === "string" ? JSON.parse(value) : value) ?? [];
const dateText = (value) => (value ? new Date(value).toISOString().slice(0, 10) : null);
const isDate = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

async function loadControls() {
  const [controls, evidence] = await Promise.all([
    query("SELECT soc2_controls.*, users.name AS ownerName, users.role AS ownerRole FROM soc2_controls LEFT JOIN users ON users.id = soc2_controls.owner_id ORDER BY soc2_controls.sort_order"),
    query("SELECT id, number, title, status, expires_on, controls FROM evidence_items WHERE status <> 'Archived'"),
  ]);
  return controls.map((control) => {
    const linked = evidence.filter((item) => parseJson(item.controls).includes(control.id)).map((item) => ({ id: item.id, reference: `EV-${String(item.number).padStart(3, "0")}`, title: item.title, status: shownStatus(item) }));
    const verified = linked.filter((item) => item.status === "Verified");
    const gaps = [];
    if (control.status !== "Implemented") gaps.push(control.status === "In Progress" ? "Control still being implemented" : "Control not implemented");
    if (!verified.length) {
      if (linked.some((item) => item.status === "Expired")) gaps.push("Evidence expired");
      else if (linked.some((item) => item.status === "Under Review")) gaps.push("Evidence waiting for review");
      else if (linked.some((item) => item.status === "Needs Changes")) gaps.push("Evidence needs changes");
      else gaps.push("No verified evidence");
    }
    return {
      id: control.id,
      criteria: control.criteria,
      name: control.name,
      priority: control.priority,
      status: control.status,
      owner: control.owner_id ? { id: control.owner_id, name: control.ownerName, role: ROLE_LABELS[control.ownerRole] ?? control.ownerRole } : null,
      dueDate: dateText(control.due_date),
      evidence: linked,
      ready: !gaps.length,
      gaps,
    };
  });
}

export async function soc2Overview(user) {
  const controls = await loadControls();
  const total = controls.length;
  const ready = controls.filter((control) => control.ready).length;
  const implemented = controls.filter((control) => control.status === "Implemented").length;
  const withEvidence = controls.filter((control) => control.evidence.some((item) => item.status === "Verified")).length;
  const milestones = (await query("SELECT * FROM soc2_milestones ORDER BY sort_order")).map((row) => ({ id: row.id, title: row.title, startsOn: dateText(row.starts_on), endsOn: dateText(row.ends_on), done: Boolean(row.done_at), doneAt: row.done_at }));
  const fieldwork = milestones.find((item) => item.title === "Auditor fieldwork");
  const pct = (part, whole) => (whole ? Math.round((part / whole) * 100) : 0);

  const criteria = TRUST_SERVICE_CRITERIA.map((name) => {
    const list = controls.filter((control) => control.criteria === name);
    const done = list.filter((control) => control.ready).length;
    const progress = pct(done, list.length);
    // Owner: whoever owns most of the criteria's controls
    const owners = new Map();
    for (const control of list) if (control.owner) owners.set(control.owner.name, { ...control.owner, count: (owners.get(control.owner.name)?.count ?? 0) + 1 });
    const owner = [...owners.values()].sort((a, b) => b.count - a.count)[0] ?? null;
    return { criteria: name, ready: done, total: list.length, progress, status: progress >= 85 ? "On track" : progress >= 60 ? "At risk" : "Behind", owner };
  });

  return {
    kpis: {
      readiness: pct(ready, total),
      implemented,
      total,
      evidenceCollected: pct(withEvidence, total),
      openGaps: total - ready,
      fieldworkStartsOn: fieldwork?.startsOn ?? null,
      daysToFieldwork: fieldwork?.startsOn ? Math.ceil((Date.parse(`${fieldwork.startsOn}T00:00:00`) - Date.now()) / DAY) : null,
    },
    criteria,
    controls,
    gaps: controls.filter((control) => !control.ready).map((control) => ({ control: control.id, name: control.name, gap: control.gaps.join("; "), owner: control.owner?.name ?? null, due: control.dueDate, severity: control.priority })),
    milestones,
    owners: await ownerOptions(),
    permissions: { manage: user.role !== ROLES.AUDITOR },
  };
}

// { status?, ownerId?, dueDate? }
export async function updateControl(user, id, body) {
  const [control] = await query("SELECT * FROM soc2_controls WHERE id = ?", [id]);
  if (!control) throw new ApiError("Control not found.", 404);
  const fields = {};
  if (body.status !== undefined) {
    if (!CONTROL_STATUSES.includes(body.status)) throw new ApiError("Choose Not Started, In Progress or Implemented.");
    fields.status = body.status;
  }
  if (body.ownerId !== undefined) {
    if (body.ownerId && !(await ownerOptions()).some((owner) => owner.id === body.ownerId)) throw new ApiError("The owner must be a Super Admin or Admin Manager.");
    fields.owner_id = body.ownerId || null;
  }
  if (body.dueDate !== undefined) {
    if (body.dueDate && !isDate(body.dueDate)) throw new ApiError("The due date isn't valid.");
    fields.due_date = body.dueDate || null;
  }
  const keys = Object.keys(fields);
  if (!keys.length) throw new ApiError("Nothing to update.");
  await query(`UPDATE soc2_controls SET ${keys.map((key) => `${key} = ?`).join(", ")} WHERE id = ?`, [...keys.map((key) => fields[key]), id]);
  await recordAudit(user, { action: "compliance.control_updated", entityType: "soc2_control", entityId: id, summary: `Updated SOC 2 control ${id} ${control.name}${fields.status ? `: ${fields.status}` : ""}` });
  return soc2Overview(user);
}

// { startsOn?, endsOn?, done? }
export async function updateMilestone(user, id, body) {
  const [milestone] = await query("SELECT * FROM soc2_milestones WHERE id = ?", [id]);
  if (!milestone) throw new ApiError("Milestone not found.", 404);
  for (const key of ["startsOn", "endsOn"]) if (body[key] && !isDate(body[key])) throw new ApiError("Dates must look like 2026-11-08.");
  const startsOn = body.startsOn !== undefined ? body.startsOn || null : dateText(milestone.starts_on);
  const endsOn = body.endsOn !== undefined ? body.endsOn || null : dateText(milestone.ends_on);
  if (startsOn && endsOn && endsOn < startsOn) throw new ApiError("The end date must be after the start date.");
  await query("UPDATE soc2_milestones SET starts_on = ?, ends_on = ?, done_at = ? WHERE id = ?", [startsOn, endsOn, body.done === undefined ? milestone.done_at : body.done ? milestone.done_at ?? new Date() : null, id]);
  await recordAudit(user, { action: "compliance.milestone_updated", entityType: "soc2_milestone", entityId: id, summary: `Updated the SOC 2 milestone ${milestone.title}` });
  return soc2Overview(user);
}

// Open Gaps as CSV
export async function gapsCsv(user) {
  const { gaps } = await soc2Overview(user);
  const cell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  await recordAudit(user, { action: "compliance.gaps_exported", entityType: "soc2_control", summary: `Exported ${gaps.length} SOC 2 gap${gaps.length === 1 ? "" : "s"}` });
  return [["Control", "Name", "Gap", "Owner", "Due", "Severity"].map(cell).join(","), ...gaps.map((gap) => [gap.control, gap.name, gap.gap, gap.owner ?? "", gap.due ?? "", gap.severity].map(cell).join(","))].join("\n");
}
