"use client";

import React, { use, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CircleX } from "lucide-react";
import DialogModal, { DialogButton } from "@/components/modals/dialog-modal";
import ConfirmDialog from "@/components/modals/confirm-dialog";
import AddNoteModal from "@/components/modals/add-note-modal";
import { Field, Select, fieldClass } from "@/app/super-admin/users/[id]/components/account-dialogs";
import { showSavedToast } from "@/lib/toast";
import { getIncidentById } from "../incident-data";
import { Badge, Card, CardLink, DashboardGrid, KpiRow, StackedList } from "@/components/shared/dashboard-ui";

// Incident Details (design only): actions update local state; nothing is saved yet.

const nowLabel = () => new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

const STATUS_NOTE = {
  Investigating: (incident) => `Assigned to ${incident.assignedTo?.name}`,
  Open: () => "Waiting for an investigator",
  Resolved: (incident) => (incident.investigationCompletedAt ? `Investigation completed ${incident.investigationCompletedAt}` : "Investigation complete"),
  Closed: () => "Closed",
};

const EVENT_TONE = { Action: "blue", Update: "gray", Created: "green", Note: "gray", Resolved: "green", Closed: "gray", Request: "amber" };

const TextArea = ({ id, value, onChange, placeholder, rows = 3 }) => (
  <textarea id={id} rows={rows} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={`${fieldClass} resize-none`} />
);

const ResolveIncidentModal = ({ isOpen, onClose, incident, onResolve }) => {
  const [findings, setFindings] = useState(incident.investigationFindings ?? "");
  const [actions, setActions] = useState(incident.actionsTaken ?? "");
  const [conclusion, setConclusion] = useState(incident.finalConclusion ?? "");
  const valid = findings.trim() && actions.trim() && conclusion.trim();

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Investigation"
      subtitle={`${incident.id} · ${incident.title}`}
      size="md"
      footer={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton
            variant="primary"
            disabled={!valid}
            onClick={() => {
              onResolve({ investigationFindings: findings.trim(), actionsTaken: actions.trim(), finalConclusion: conclusion.trim() });
              onClose();
            }}
          >
            Submit Investigation
          </DialogButton>
        </>
      }
    >
      <div className="space-y-5">
        <Field label="Investigation findings" htmlFor="resolve-findings"><TextArea id="resolve-findings" value={findings} onChange={setFindings} placeholder="What did the investigation find?" /></Field>
        <Field label="Actions taken" htmlFor="resolve-actions"><TextArea id="resolve-actions" value={actions} onChange={setActions} placeholder="What was done to contain and fix it?" /></Field>
        <Field label="Final conclusion" htmlFor="resolve-conclusion"><TextArea id="resolve-conclusion" value={conclusion} onChange={setConclusion} placeholder="Summary for the audit record" rows={2} /></Field>
      </div>
    </DialogModal>
  );
};

const RequestInfoModal = ({ isOpen, onClose, reporter, onSend }) => {
  const [message, setMessage] = useState("");
  return (
    <DialogModal
      isOpen={isOpen}
      onClose={onClose}
      title="Request More Info"
      subtitle={`To: ${reporter}`}
      size="sm"
      footer={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton
            variant="primary"
            disabled={!message.trim()}
            onClick={() => {
              onSend(message.trim());
              onClose();
            }}
          >
            Send Request
          </DialogButton>
        </>
      }
    >
      <Field label="What do you need?" htmlFor="request-message">
        <TextArea id="request-message" rows={4} value={message} onChange={setMessage} placeholder="e.g., Please confirm whether you recognise the device in Lagos, NG." />
      </Field>
    </DialogModal>
  );
};

const CLOSE_REASONS = ["False positive", "Duplicate report", "Expected behaviour", "Not a security issue"];

export default function IncidentDetailPage({ params }) {
  const { id } = use(params);
  const [incident, setIncident] = useState(() => getIncidentById(id));
  const [timeline, setTimeline] = useState(() => {
    const base = getIncidentById(id);
    return [
      { title: "Account locked and password reset forced", by: base.assignedTo?.name, when: "May 19, 2024 11:02 AM", type: "Action" },
      { title: "User contacted for verification", by: base.assignedTo?.name, when: "May 19, 2024 10:48 AM", type: "Update" },
      { title: `Incident created${base.relatedTicket ? ` from escalated ticket ${base.relatedTicket}` : ""}`, by: base.reportedBy?.name, when: `${base.reportedAt} ${base.reportedTime}`, type: "Created" },
    ];
  });
  const [files, setFiles] = useState(incident.proofFiles ?? []);
  const [dialog, setDialog] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [closeReason, setCloseReason] = useState("");
  const uploadRef = useRef(null);

  // Open → Investigating → Resolved (investigation submitted) → Closed; Resolved/Closed can be reopened
  const isDone = incident.status === "Resolved" || incident.status === "Closed";
  const addEvent = (title, type) => setTimeline((prev) => [{ title, by: "Daniel Miller", when: nowLabel(), type }, ...prev]);

  const upload = (event) => {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!picked.length) return;
    setFiles((prev) => [
      ...prev,
      ...picked.map((file) => ({ id: `${file.name}-${file.size}`, name: file.name, size: file.size >= 1048576 ? `${(file.size / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`, uploadedBy: "Daniel Miller" })),
    ]);
    addEvent(`Uploaded ${picked.length === 1 ? picked[0].name : `${picked.length} files`}`, "Update");
    showSavedToast("Evidence uploaded", `${picked.length} ${picked.length === 1 ? "file was" : "files were"} attached to ${incident.id}.`);
  };

  const kpis = [
    { label: "Severity", value: incident.severity, note: incident.severity === "Low" ? "Monitor" : "Needs attention", good: incident.severity === "Low" },
    { label: "Status", value: incident.status, note: (STATUS_NOTE[incident.status] ?? (() => ""))(incident) },
    { label: "Time Open", value: isDone ? "Closed" : "18h 42m", note: "Target: resolve within 24h" },
    { label: "Category", value: incident.category, note: "User accounts affected: 3" },
    { label: "SLA", value: "Within SLA", note: "5h 18m remaining" },
  ];

  return (
    <div className="w-full flex flex-col gap-5 pb-12 font-secondary">
      <div>
        <Link href="/super-admin/compliance-audit/incident-management" className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline mb-2">
          <ArrowLeft className="w-3.5 h-3.5" /> Incident Management
        </Link>
        <h1 className="text-2xl font-semibold text-dark-black">{incident.title}</h1>
        <p className="text-sm text-medium-black mt-1">
          {incident.id} · Reported {incident.reportedAt} at {incident.reportedTime} by {incident.reportedBy?.name}
        </p>
      </div>

      <KpiRow kpis={kpis} />

      <DashboardGrid
        main={
          <>
            <Card title="Incident Summary">
              <p className="text-sm leading-6 text-dark-black/80">{incident.description}</p>
              <dl className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 text-xs">
                {[
                  ["Reported by", incident.reportedBy?.name],
                  ["Reported at", incident.submittedAt ?? `${incident.reportedAt} ${incident.reportedTime}`],
                  ["Assigned to", incident.assignedTo?.name],
                  ["Affected systems", "Auth service, User accounts"],
                  ["Related ticket", incident.relatedTicket ?? "TKT-2849"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-light-black">{label}</dt>
                    <dd className="font-medium text-dark-black mt-1">{value}</dd>
                  </div>
                ))}
              </dl>
              {incident.investigationFindings && isDone && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs space-y-1.5">
                  <p><span className="font-semibold text-dark-black">Findings:</span> {incident.investigationFindings}</p>
                  <p><span className="font-semibold text-dark-black">Actions taken:</span> {incident.actionsTaken}</p>
                  <p><span className="font-semibold text-dark-black">Conclusion:</span> {incident.finalConclusion}</p>
                  {incident.investigationCompletedAt && (
                    <p className="text-light-black">Investigation Completed At {incident.investigationCompletedAt} · Investigated By {incident.investigatedBy}</p>
                  )}
                </div>
              )}
            </Card>

            <Card title="Activity Timeline" action={<CardLink onClick={() => setDialog("note")}>Add note</CardLink>}>
              <StackedList
                items={timeline.map((event) => ({
                  title: event.title,
                  subtitle: `${event.by} • ${event.when}`,
                  badge: { tone: EVENT_TONE[event.type] ?? "gray", label: event.type },
                }))}
              />
            </Card>

            <Card title="Evidence & Attachments" action={<CardLink onClick={() => uploadRef.current?.click()}>Upload</CardLink>}>
              <input ref={uploadRef} type="file" multiple className="hidden" onChange={upload} />
              {files.length ? (
                <StackedList
                  items={files.map((file) => ({
                    title: file.name,
                    subtitle: `${file.name.split(".").pop().toUpperCase()} · ${file.size} · Uploaded by ${file.uploadedBy ?? incident.reportedBy?.name}`,
                    badge: { tone: "blue", label: "Evidence" },
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
            <Card title="Actions">
              <div className="space-y-3">
                {incident.status === "Open" && (
                  <button
                    type="button"
                    onClick={() => {
                      setIncident((prev) => ({ ...prev, status: "Investigating" }));
                      addEvent("Investigation started", "Action");
                      showSavedToast("Investigation started", `${incident.id} is now under investigation.`);
                    }}
                    className="w-full py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-medium-teal cursor-pointer"
                  >
                    Start Investigation
                  </button>
                )}
                {incident.status === "Investigating" && (
                  <button type="button" onClick={() => setDialog("resolve")} className="w-full py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-medium-teal cursor-pointer">
                    Submit Investigation
                  </button>
                )}
                {incident.status === "Resolved" && (
                  <button
                    type="button"
                    onClick={() => {
                      setIncident((prev) => ({ ...prev, status: "Closed" }));
                      addEvent("Incident closed", "Closed");
                      showSavedToast("Incident closed", `${incident.id} is now closed.`);
                    }}
                    className="w-full py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-medium-teal cursor-pointer"
                  >
                    Close Incident
                  </button>
                )}
                {isDone && (
                  <button
                    type="button"
                    onClick={() => {
                      setIncident((prev) => ({ ...prev, status: "Investigating" }));
                      addEvent("Incident reopened", "Action");
                      showSavedToast("Incident reopened", `${incident.id} is back under investigation.`);
                    }}
                    className="w-full py-2.5 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/5 cursor-pointer"
                  >
                    Reopen Incident
                  </button>
                )}
                <button type="button" disabled={isDone} onClick={() => setDialog("info")} className="w-full py-2.5 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                  Request More Info
                </button>
                <button type="button" disabled={isDone} onClick={() => setDialog("close")} className="w-full py-2.5 rounded-lg border border-red-300 text-red-600 text-sm font-medium hover:bg-red-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                  Close Without Incident
                </button>
              </div>
            </Card>
            <Card title="Linked Items">
              <StackedList
                chevron
                items={[
                  { title: `Support ticket ${incident.relatedTicket ?? "TKT-2849"}`, subtitle: "Smith Realty Group", href: "/super-admin/support-tickets" },
                  { title: "Audit log entry #1248", subtitle: "Login success from unknown device", href: "/super-admin/compliance-audit/audit-logs" },
                ]}
              />
            </Card>
          </>
        }
      />

      <ResolveIncidentModal
        key={dialog === "resolve" ? "resolve-open" : "resolve-closed"}
        isOpen={dialog === "resolve"}
        onClose={() => setDialog(null)}
        incident={incident}
        onResolve={(result) => {
          // Investigation Completed At / Investigated By are filled automatically
          setIncident((prev) => ({ ...prev, ...result, status: "Resolved", investigationCompletedAt: nowLabel(), investigatedBy: "Daniel Miller" }));
          addEvent("Investigation submitted; incident resolved", "Resolved");
          showSavedToast("Investigation submitted", `${incident.id} is now Resolved. Close it when no further action is needed.`);
        }}
      />
      <RequestInfoModal
        key={dialog === "info" ? "info-open" : "info-closed"}
        isOpen={dialog === "info"}
        onClose={() => setDialog(null)}
        reporter={incident.reportedBy?.name}
        onSend={() => {
          addEvent(`Requested more information from ${incident.reportedBy?.name}`, "Request");
          showSavedToast("Request sent", `${incident.reportedBy?.name} was asked for more information.`);
        }}
      />
      <AddNoteModal
        isOpen={dialog === "note"}
        onClose={() => setDialog(null)}
        value={noteText}
        onChange={setNoteText}
        onSave={() => {
          addEvent(noteText.trim(), "Note");
          setNoteText("");
          setDialog(null);
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
        message={`${incident.id} will be closed and marked as not a real incident.`}
        note="The timeline and evidence stay in the audit record."
        confirmLabel="Close Incident"
        confirmDisabled={!closeReason}
        onConfirm={() => {
          setIncident((prev) => ({ ...prev, status: "Closed" }));
          addEvent(`Closed without incident: ${closeReason}`, "Closed");
          showSavedToast("Incident closed", `${incident.id} was closed without incident.`);
        }}
      >
        <Field label="Reason" htmlFor="close-reason">
          <Select id="close-reason" value={closeReason} onChange={setCloseReason} options={CLOSE_REASONS} placeholder="Select a reason" />
        </Field>
      </ConfirmDialog>
    </div>
  );
}
