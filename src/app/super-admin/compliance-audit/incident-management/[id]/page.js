"use client";

import React, { use, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CircleX } from "lucide-react";
import toast from "react-hot-toast";
import DialogModal, { DialogButton } from "@/components/modals/dialog-modal";
import ConfirmDialog from "@/components/modals/confirm-dialog";
import AddNoteModal from "@/components/modals/add-note-modal";
import { Field, Select, fieldClass } from "@/app/super-admin/users/[id]/components/account-dialogs";
import { apiRequest, formatDateTime } from "@/lib/client-api";
import { showError } from "@/lib/alerts";
import { INCIDENT_SEVERITIES, targetLabel } from "@/lib/compliance/incident-catalog";
import { formatHours } from "../components/incident-stats";
import { Card, CardLink, DashboardGrid, KpiRow, StackedList } from "@/components/shared/dashboard-ui";

const STATUS_NOTE = {
  Open: () => "Waiting for an investigator",
  Investigating: (incident) => (incident.assignedTo ? `Assigned to ${incident.assignedTo.name}` : "Under investigation"),
  Resolved: (incident) => `Investigation completed ${formatDateTime(incident.investigationCompletedAt)}`,
  Closed: (incident) => (incident.closeReason ? `Closed: ${incident.closeReason}` : `Closed ${formatDateTime(incident.closedAt)}`),
};
const EVENT_TONE = { Action: "blue", Update: "gray", Created: "green", Note: "gray", Resolved: "green", Closed: "gray", Request: "amber" };

const TextArea = ({ id, value, onChange, placeholder, rows = 3 }) => (
  <textarea id={id} rows={rows} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={`${fieldClass} resize-none`} />
);

// Submit Investigation: all three fields are required; Completed At / Investigated By are automatic
const ResolveIncidentModal = ({ onClose, incident, onResolve }) => {
  const [findings, setFindings] = useState(incident.investigationFindings ?? "");
  const [actions, setActions] = useState(incident.actionsTaken ?? "");
  const [conclusion, setConclusion] = useState(incident.finalConclusion ?? "");
  const valid = findings.trim() && actions.trim() && conclusion.trim();
  return (
    <DialogModal
      isOpen
      onClose={onClose}
      title="Submit Investigation"
      subtitle={`${incident.reference} · ${incident.title}`}
      size="md"
      footer={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton variant="primary" disabled={!valid} onClick={() => onResolve({ findings: findings.trim(), actionsTaken: actions.trim(), conclusion: conclusion.trim() })}>Submit Investigation</DialogButton>
        </>
      }
    >
      <div className="space-y-5">
        <Field label="Investigation Findings" htmlFor="resolve-findings"><TextArea id="resolve-findings" value={findings} onChange={setFindings} placeholder="What did the investigation find?" /></Field>
        <Field label="Actions Taken" htmlFor="resolve-actions"><TextArea id="resolve-actions" value={actions} onChange={setActions} placeholder="What was done to contain and fix it?" /></Field>
        <Field label="Final Conclusion" htmlFor="resolve-conclusion"><TextArea id="resolve-conclusion" value={conclusion} onChange={setConclusion} placeholder="Summary for the audit record" rows={2} /></Field>
        <p className="text-xs text-light-black">Investigation Completed At and Investigated By are filled in automatically, and the incident becomes Resolved.</p>
      </div>
    </DialogModal>
  );
};

const RequestInfoModal = ({ onClose, reporter, onSend }) => {
  const [message, setMessage] = useState("");
  return (
    <DialogModal
      isOpen
      onClose={onClose}
      title="Request More Info"
      subtitle={`To: ${reporter}`}
      size="sm"
      footer={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton variant="primary" disabled={!message.trim()} onClick={() => onSend(message.trim())}>Send Request</DialogButton>
        </>
      }
    >
      <Field label="What do you need?" htmlFor="request-message">
        <TextArea id="request-message" rows={4} value={message} onChange={setMessage} placeholder="e.g., Please confirm whether you recognise the device in Lagos, NG." />
      </Field>
      <p className="text-xs text-light-black mt-2">Emailed to the reporter once an email service is connected; it&apos;s on the timeline straight away.</p>
    </DialogModal>
  );
};

export default function IncidentDetailPage({ params }) {
  const { id } = use(params);
  const [data, setData] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [closeReason, setCloseReason] = useState("");
  const uploadRef = useRef(null);
  const base = `/api/v1/compliance/incidents/${id}`;

  const load = useCallback(() => apiRequest(base).then(setData).catch((error) => showError("Incident not loaded", error.message)), [base]);
  useEffect(() => {
    load();
  }, [load]);

  if (!data) return <div className="py-24 text-center text-sm text-light-black">Loading incident...</div>;
  const { incident, managers, closeReasons, permissions } = data;
  const canManage = permissions.manage;
  const isDone = incident.status === "Resolved" || incident.status === "Closed";

  const call = async (path, body, message) => {
    try {
      setData(await apiRequest(path, { method: body instanceof FormData ? "POST" : body?.__method ?? "POST", body: body?.__method ? body.payload : body }));
      if (message) toast.success(message);
      setDialog(null);
      return true;
    } catch (error) {
      toast.error(error.message);
      return false;
    }
  };
  const act = (body, message) => call(`${base}/actions`, body, message);
  const patch = (payload, message) => call(base, { __method: "PATCH", payload }, message);

  const upload = (event) => {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!picked.length) return;
    const body = new FormData();
    picked.forEach((file) => body.append("files", file));
    call(`${base}/files`, body, `${picked.length} file${picked.length === 1 ? "" : "s"} attached.`);
  };

  const sla = incident.sla;
  const kpis = [
    { label: "Severity", value: incident.severity, note: `Target: resolve within ${targetLabel(incident.severity)}`, good: incident.severity === "Low" },
    { label: "Status", value: incident.status, note: (STATUS_NOTE[incident.status] ?? (() => ""))(incident) },
    { label: isDone ? "Time to Resolve" : "Time Open", value: formatHours(sla.hoursOpen), note: `Since reported ${formatDateTime(incident.reportedAt)}` },
    { label: "Category", value: incident.category, note: incident.affectedSystems ? `Affects: ${incident.affectedSystems}` : "No systems listed" },
    { label: "SLA", value: sla.breached ? "Breached" : "Within SLA", note: isDone ? "Resolution time recorded" : sla.remainingHours > 0 ? `${formatHours(sla.remainingHours)} remaining` : "Past the target", good: !sla.breached },
  ];

  return (
    <div className="w-full flex flex-col gap-5 pb-12 font-secondary">
      <div>
        <Link href="/super-admin/compliance-audit/incident-management" className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline mb-2">
          <ArrowLeft className="w-3.5 h-3.5" /> Incident Management
        </Link>
        <h1 className="text-2xl font-semibold text-dark-black">{incident.title}</h1>
        <p className="text-sm text-medium-black mt-1">
          {incident.reference} · Reported {formatDateTime(incident.reportedAt)} by {incident.reportedBy.name}
          {incident.reopenedCount ? ` · reopened ${incident.reopenedCount}×` : ""}
        </p>
      </div>

      <KpiRow kpis={kpis} />

      <DashboardGrid
        main={
          <>
            <Card title="Incident Summary">
              <p className="text-sm leading-6 text-dark-black/80 whitespace-pre-line">{incident.description}</p>
              <dl className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 text-xs">
                {[
                  ["Incident Occurred At", incident.occurredAt ? formatDateTime(incident.occurredAt) : "Not given"],
                  ["Reported At", formatDateTime(incident.reportedAt)],
                  ["Reported By", incident.reportedBy.name],
                  ["Affected Systems", incident.affectedSystems || "—"],
                  ["Related Ticket", incident.relatedTicket?.reference ?? "—"],
                  ["Investigation Started", incident.investigationStartedAt ? formatDateTime(incident.investigationStartedAt) : "—"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-light-black">{label}</dt>
                    <dd className="font-medium text-dark-black mt-1">{value}</dd>
                  </div>
                ))}
              </dl>
              {incident.investigationFindings && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs space-y-1.5">
                  <p><span className="font-semibold text-dark-black">Investigation Findings:</span> {incident.investigationFindings}</p>
                  <p><span className="font-semibold text-dark-black">Actions Taken:</span> {incident.actionsTaken}</p>
                  <p><span className="font-semibold text-dark-black">Final Conclusion:</span> {incident.finalConclusion}</p>
                  <p className="text-light-black">Investigation Completed At {formatDateTime(incident.investigationCompletedAt)} · Investigated By {incident.investigatedBy ?? "—"}</p>
                </div>
              )}
            </Card>

            <Card title="Activity Timeline" action={canManage ? <CardLink onClick={() => setDialog("note")}>Add note</CardLink> : null}>
              <StackedList items={incident.timeline.map((event) => ({ title: event.body, subtitle: `${event.actor ?? "System"} • ${formatDateTime(event.createdAt)}`, badge: { tone: EVENT_TONE[event.kind] ?? "gray", label: event.kind } }))} />
            </Card>

            <Card title="Evidence & Attachments" action={canManage ? <CardLink onClick={() => uploadRef.current?.click()}>Upload</CardLink> : null}>
              <input ref={uploadRef} type="file" multiple className="hidden" onChange={upload} />
              {incident.files.length ? (
                <StackedList
                  items={incident.files.map((file) => ({
                    title: file.name,
                    subtitle: `${file.name.split(".").pop().toUpperCase()} · ${file.size} · Uploaded by ${file.uploadedBy ?? "—"} · ${formatDateTime(file.createdAt)}`,
                    href: `${base}/files/${file.id}`,
                    badge: { tone: "blue", label: "Download" },
                  }))}
                />
              ) : (
                <p className="text-xs text-medium-black">No evidence attached yet.</p>
              )}
            </Card>
          </>
        }
        side={
          <>
            {canManage && (
              <Card title="Actions">
                <div className="space-y-3">
                  {incident.status === "Open" && (
                    <button type="button" onClick={() => act({ action: "start" }, `${incident.reference} is now under investigation.`)} className="w-full py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-medium-teal cursor-pointer">Start Investigation</button>
                  )}
                  {incident.status === "Investigating" && (
                    <button type="button" onClick={() => setDialog("resolve")} className="w-full py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-medium-teal cursor-pointer">Submit Investigation</button>
                  )}
                  {incident.status === "Resolved" && (
                    <button type="button" onClick={() => act({ action: "close" }, `${incident.reference} is now closed.`)} className="w-full py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-medium-teal cursor-pointer">Close Incident</button>
                  )}
                  {isDone && (
                    <button type="button" onClick={() => act({ action: "reopen" }, `${incident.reference} is back under investigation.`)} className="w-full py-2.5 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/5 cursor-pointer">Reopen Incident</button>
                  )}
                  <button type="button" disabled={isDone} onClick={() => setDialog("info")} className="w-full py-2.5 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">Request More Info</button>
                  <button type="button" disabled={isDone} onClick={() => setDialog("close")} className="w-full py-2.5 rounded-lg border border-red-300 text-red-600 text-sm font-medium hover:bg-red-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">Close Without Incident</button>

                  <div className="pt-2 border-t border-light-gray space-y-3">
                    <Field label="Assigned To" htmlFor="incident-assignee">
                      <select id="incident-assignee" value={incident.assignedTo?.id ?? ""} onChange={(event) => patch({ assignedTo: event.target.value || null }, "Owner updated.")} className={`${fieldClass} cursor-pointer`}>
                        <option value="">Unassigned</option>
                        {managers.map((manager) => <option key={manager.id} value={manager.id}>{manager.name}</option>)}
                      </select>
                    </Field>
                    <Field label="Severity" htmlFor="incident-severity">
                      <select id="incident-severity" value={incident.severity} onChange={(event) => patch({ severity: event.target.value }, "Severity updated.")} className={`${fieldClass} cursor-pointer`}>
                        {INCIDENT_SEVERITIES.map((severity) => <option key={severity}>{severity}</option>)}
                      </select>
                    </Field>
                  </div>
                </div>
              </Card>
            )}
            <Card title="Linked Items">
              <StackedList
                chevron
                items={[
                  ...(incident.relatedTicket ? [{ title: `Support ticket ${incident.relatedTicket.reference}`, subtitle: [incident.relatedTicket.subject, incident.relatedTicket.company].filter(Boolean).join(" · "), href: `/super-admin/support-tickets?ticket=${incident.relatedTicket.id}` }] : []),
                  { title: "Audit log for this incident", subtitle: "Every change, with who and when", href: `/super-admin/compliance-audit/audit-logs` },
                ]}
              />
            </Card>
          </>
        }
      />

      {dialog === "resolve" && <ResolveIncidentModal onClose={() => setDialog(null)} incident={incident} onResolve={(fields) => act({ action: "resolve", ...fields }, `${incident.reference} is now Resolved. Close it when no further action is needed.`)} />}
      {dialog === "info" && <RequestInfoModal onClose={() => setDialog(null)} reporter={incident.reportedBy.name} onSend={(message) => call(`${base}/request-info`, { message }, "Request sent.")} />}
      <AddNoteModal
        isOpen={dialog === "note"}
        onClose={() => setDialog(null)}
        value={noteText}
        onChange={setNoteText}
        onSave={async () => {
          if (await call(`${base}/notes`, { note: noteText.trim() }, "Note added.")) setNoteText("");
        }}
      />
      <ConfirmDialog
        isOpen={dialog === "close"}
        onClose={() => {
          setCloseReason("");
          setDialog(null);
        }}
        title="Close without incident?"
        icon={CircleX}
        iconTone="warning"
        message={`${incident.reference} will be closed and marked as not a real incident.`}
        note="The timeline and evidence stay in the audit record."
        confirmLabel="Close Incident"
        confirmDisabled={!closeReason}
        onConfirm={() => act({ action: "close", reason: closeReason }, `${incident.reference} was closed without incident.`)}
      >
        <Field label="Reason" htmlFor="close-reason">
          <Select id="close-reason" value={closeReason} onChange={setCloseReason} options={closeReasons} placeholder="Select a reason" />
        </Field>
      </ConfirmDialog>
    </div>
  );
}
