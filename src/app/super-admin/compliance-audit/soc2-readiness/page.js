"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Badge, Card, CardLink, DashboardGrid, DataTable, KpiRow, PageHeader, Person, Progress } from "@/components/shared/dashboard-ui";
import { apiRequest, formatDate } from "@/lib/client-api";
import { showError } from "@/lib/alerts";
import { CONTROL_STATUSES, TRUST_SERVICE_CRITERIA } from "@/lib/compliance/evidence-catalog";

const STATUS_TONE = { "On track": "green", "At risk": "amber", Behind: "red" };
const SEVERITY_TONE = { High: "red", Medium: "amber", Low: "green" };
const select = "px-2 py-1.5 rounded-lg border border-light-gray bg-white text-xs text-dark-black focus:outline-none focus:border-primary cursor-pointer";
const BASE = "/api/v1/compliance/soc2";

// SOC 2 Readiness: a control is ready when it's Implemented and has verified, unexpired evidence
// in the Evidence Repository. Status, owner and due date are set per control here.
export default function Soc2ReadinessPage() {
  const [data, setData] = useState(null);
  const [criteria, setCriteria] = useState("All");
  useEffect(() => {
    apiRequest(BASE).then(setData).catch((error) => showError("SOC 2 not loaded", error.message));
  }, []);

  const save = async (path, body, message) => {
    try {
      setData(await apiRequest(path, { method: "PATCH", body }));
      toast.success(message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const kpis = data?.kpis;
  const canManage = Boolean(data?.permissions.manage);
  const KPIS = [
    { label: "Overall Readiness", value: kpis ? `${kpis.readiness}%` : "—", note: "Controls implemented with verified evidence", good: kpis ? kpis.readiness >= 85 : undefined },
    { label: "Controls Implemented", value: kpis ? `${kpis.implemented} / ${kpis.total}` : "—", note: kpis?.total ? `${Math.round((kpis.implemented / kpis.total) * 100)}% complete` : "" },
    { label: "Evidence Collected", value: kpis ? `${kpis.evidenceCollected}%` : "—", note: "Controls with verified evidence", good: kpis ? kpis.evidenceCollected >= 85 : undefined },
    { label: "Open Gaps", value: kpis ? kpis.openGaps : "—", note: "Controls not ready", good: kpis ? kpis.openGaps === 0 : undefined },
    { label: "Audit Window Opens", value: kpis?.daysToFieldwork != null ? `${Math.max(0, kpis.daysToFieldwork)} days` : "Not set", note: kpis?.fieldworkStartsOn ? `Fieldwork starts ${formatDate(`${kpis.fieldworkStartsOn}T12:00:00`)}` : "Set the fieldwork date below" },
  ];
  const controls = (data?.controls ?? []).filter((control) => criteria === "All" || control.criteria === criteria);

  return (
    <div className="w-full flex flex-col gap-5 pb-12 font-secondary">
      <PageHeader title="SOC 2 Readiness" subtitle="Monitor control implementation, evidence collection and audit timeline." />
      <KpiRow kpis={KPIS} />
      <DashboardGrid
        main={
          <>
            <Card title="Trust Services Criteria" action={<CardLink href="/super-admin/compliance-audit/evidence-repository">Evidence Repository</CardLink>}>
              <DataTable
                rowKey={(row) => row.criteria}
                rows={data?.criteria ?? []}
                columns={[
                  { key: "criteria", label: "Criteria" },
                  { key: "controls", label: "Controls Ready", render: (row) => `${row.ready} / ${row.total}` },
                  { key: "progress", label: "Progress", render: (row) => <Progress value={row.progress} /> },
                  { key: "status", label: "Status", render: (row) => <Badge tone={STATUS_TONE[row.status]}>{row.status}</Badge> },
                  { key: "owner", label: "Owner", render: (row) => (row.owner ? <Person name={row.owner.name} role={row.owner.role} /> : "—") },
                ]}
              />
            </Card>

            <Card
              title="Controls"
              action={
                <select aria-label="Filter controls by criteria" value={criteria} onChange={(event) => setCriteria(event.target.value)} className={select}>
                  <option value="All">All criteria</option>
                  {TRUST_SERVICE_CRITERIA.map((item) => <option key={item}>{item}</option>)}
                </select>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-light-black border-b border-light-gray">
                      <th className="py-2 pr-3 font-semibold">Control</th>
                      <th className="py-2 px-3 font-semibold">Status</th>
                      <th className="py-2 px-3 font-semibold">Owner</th>
                      <th className="py-2 px-3 font-semibold">Due</th>
                      <th className="py-2 pl-3 font-semibold">Evidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-light-gray/70">
                    {controls.map((control) => (
                      <tr key={control.id} className="align-top">
                        <td className="py-2.5 pr-3">
                          <p className="font-semibold text-dark-black">{control.id} · {control.name}</p>
                          <p className={`text-[11px] ${control.ready ? "text-emerald-600" : "text-light-black"}`}>{control.ready ? "Ready" : control.gaps.join("; ")}</p>
                        </td>
                        <td className="py-2.5 px-3">
                          {canManage ? (
                            <select aria-label={`Status of ${control.id}`} value={control.status} onChange={(event) => save(`${BASE}/controls/${control.id}`, { status: event.target.value }, `${control.id} updated.`)} className={select}>
                              {CONTROL_STATUSES.map((status) => <option key={status}>{status}</option>)}
                            </select>
                          ) : control.status}
                        </td>
                        <td className="py-2.5 px-3">
                          {canManage ? (
                            <select aria-label={`Owner of ${control.id}`} value={control.owner?.id ?? ""} onChange={(event) => save(`${BASE}/controls/${control.id}`, { ownerId: event.target.value || null }, `${control.id} owner updated.`)} className={select}>
                              <option value="">Unassigned</option>
                              {data.owners.map((owner) => <option key={owner.id} value={owner.id}>{owner.name}</option>)}
                            </select>
                          ) : control.owner?.name ?? "—"}
                        </td>
                        <td className="py-2.5 px-3">
                          {canManage ? (
                            <input type="date" aria-label={`Due date of ${control.id}`} value={control.dueDate ?? ""} onChange={(event) => save(`${BASE}/controls/${control.id}`, { dueDate: event.target.value || null }, `${control.id} due date updated.`)} className={select} />
                          ) : control.dueDate ? formatDate(`${control.dueDate}T12:00:00`) : "—"}
                        </td>
                        <td className="py-2.5 pl-3 text-medium-black">
                          {control.evidence.length ? control.evidence.map((item) => <span key={item.id} className="block">{item.reference} · {item.status}</span>) : "None"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card title="Open Gaps" action={<CardLink href={`${BASE}/gaps`}>Export</CardLink>}>
              {data && !data.gaps.length ? (
                <p className="text-xs text-medium-black">No gaps. Every control is implemented with verified evidence.</p>
              ) : (
                <DataTable
                  rowKey={(row) => row.control}
                  rows={data?.gaps ?? []}
                  columns={[
                    { key: "control", label: "Control", render: (row) => `${row.control} · ${row.name}` },
                    { key: "gap", label: "Gap" },
                    { key: "owner", label: "Owner", render: (row) => row.owner ?? "Unassigned" },
                    { key: "due", label: "Due", render: (row) => (row.due ? formatDate(`${row.due}T12:00:00`) : "—") },
                    { key: "severity", label: "Severity", render: (row) => <Badge tone={SEVERITY_TONE[row.severity]}>{row.severity}</Badge> },
                  ]}
                />
              )}
            </Card>
          </>
        }
        side={
          <>
            <Card title="Audit Timeline">
              <div className="space-y-4">
                {(data?.milestones ?? []).map((milestone) => (
                  <div key={milestone.id} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-dark-black">{milestone.title}</p>
                      <Badge tone={milestone.done ? "green" : milestone.startsOn ? "blue" : "gray"}>{milestone.done ? "Done" : milestone.startsOn ? "Planned" : "Not scheduled"}</Badge>
                    </div>
                    {canManage ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <input type="date" aria-label={`${milestone.title} start`} value={milestone.startsOn ?? ""} onChange={(event) => save(`${BASE}/milestones/${milestone.id}`, { startsOn: event.target.value || null }, "Timeline updated.")} className={select} />
                        <span className="text-xs text-light-black">to</span>
                        <input type="date" aria-label={`${milestone.title} end`} value={milestone.endsOn ?? ""} onChange={(event) => save(`${BASE}/milestones/${milestone.id}`, { endsOn: event.target.value || null }, "Timeline updated.")} className={select} />
                        <label className="flex items-center gap-1 text-xs text-medium-black cursor-pointer">
                          <input type="checkbox" checked={milestone.done} onChange={(event) => save(`${BASE}/milestones/${milestone.id}`, { done: event.target.checked }, "Timeline updated.")} className="accent-primary" /> Done
                        </label>
                      </div>
                    ) : (
                      <p className="text-xs text-light-black">{milestone.startsOn ? `${formatDate(`${milestone.startsOn}T12:00:00`)}${milestone.endsOn ? ` – ${formatDate(`${milestone.endsOn}T12:00:00`)}` : ""}` : "Not scheduled"}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
            <Card title="Auditor Access">
              <p className="text-xs text-medium-black">External auditors get the Auditor role: read-only access to Compliance & Audit (controls, evidence, policies, training, incidents and audit logs).</p>
              {canManage && (
                <Link href="/super-admin/compliance-audit/access-records" className="mt-4 block w-full py-2.5 rounded-lg bg-primary text-white text-sm font-semibold text-center hover:bg-medium-teal">
                  Invite Auditor
                </Link>
              )}
            </Card>
          </>
        }
      />
    </div>
  );
}
