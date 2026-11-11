"use client";

import React, { useEffect, useRef, useState } from "react";
import { Download, Eye, Upload } from "lucide-react";
import toast from "react-hot-toast";
import DialogModal, { DialogButton } from "@/components/modals/dialog-modal";
import { apiRequest, formatDate, formatDateTime } from "@/lib/client-api";

const STATUS_STYLES = {
  Verified: "bg-emerald-50 text-emerald-600",
  "Under Review": "bg-amber-50 text-amber-600",
  "Needs Changes": "bg-rose-50 text-rose-600",
  Draft: "bg-gray-100 text-gray-600",
  Expired: "bg-red-50 text-red-600",
  Archived: "bg-slate-100 text-slate-500",
};

// One evidence item: details, files (every version), and the review actions for its status.
// evidenceId: which item; onChanged: reload the list; onEdit(evidence): open the edit form
export default function EvidenceDetailsModal({ evidenceId, onClose, onChanged, onEdit }) {
  const [data, setData] = useState(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const base = `/api/v1/compliance/evidence/${evidenceId}`;

  useEffect(() => {
    if (!evidenceId) return;
    apiRequest(base).then(setData).catch((error) => toast.error(error.message));
  }, [base, evidenceId]);

  if (!evidenceId) return null;
  const evidence = data?.evidence;
  const canManage = data?.permissions.manage;

  const run = async (request, message, close = false) => {
    setBusy(true);
    try {
      const result = await request();
      toast.success(message);
      onChanged?.();
      if (close) onClose();
      else {
        setData(result);
        setNote("");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };
  const act = (action, message) => run(() => apiRequest(`${base}/actions`, { method: "POST", body: { action, note: note.trim() || undefined } }), message);
  const uploadVersion = (file) => {
    if (!file) return;
    const body = new FormData();
    body.append("file", file);
    if (note.trim()) body.append("note", note.trim());
    run(() => apiRequest(`${base}/versions`, { method: "POST", body }), "New version uploaded. The old file is kept, and it's back under review.");
  };

  const status = evidence?.status;
  const button = "px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50";

  return (
    <DialogModal
      isOpen
      onClose={onClose}
      title={evidence ? evidence.name : "Loading..."}
      subtitle={evidence ? `${evidence.reference} · ${evidence.controls.join(", ")}` : ""}
      size="2xl"
      footer={
        evidence && (
          <div className="flex flex-wrap items-center gap-2 w-full justify-end">
            {canManage && status === "Draft" && (
              <button type="button" disabled={busy} onClick={() => run(() => apiRequest(base, { method: "DELETE" }), "Draft deleted.", true)} className={`${button} mr-auto text-red-500 border border-red-200 hover:bg-red-50`}>Delete Draft</button>
            )}
            {canManage && ["Verified", "Expired", "Under Review", "Needs Changes"].includes(status) && (
              <button type="button" disabled={busy} onClick={() => act("archive", "Archived. It stays in the audit history.")} className={`${button} mr-auto text-medium-black border border-light-gray hover:bg-light-gray/60`}>Archive</button>
            )}
            {canManage && status === "Archived" && <button type="button" disabled={busy} onClick={() => act("restore", "Restored and sent for review.")} className={`${button} border border-primary text-primary hover:bg-primary/5`}>Restore</button>}
            <DialogButton onClick={onClose}>Close</DialogButton>
            {canManage && ["Draft", "Needs Changes"].includes(status) && <button type="button" onClick={() => onEdit(evidence)} className={`${button} border border-light-gray hover:bg-light-gray/60`}>Edit</button>}
            {canManage && ["Draft", "Needs Changes"].includes(status) && <button type="button" disabled={busy} onClick={() => act("submit", "Sent for review.")} className={`${button} bg-primary hover:bg-[#0c9593] text-white`}>Submit for Review</button>}
            {canManage && status === "Under Review" && (
              <>
                <button type="button" disabled={busy || !note.trim()} title={note.trim() ? undefined : "Write what needs to change below"} onClick={() => act("request_changes", "Returned to the owner for changes.")} className={`${button} text-amber-700 border border-amber-300 hover:bg-amber-50`}>Request Changes</button>
                <button type="button" disabled={busy} onClick={() => act("verify", "Evidence verified.")} className={`${button} bg-primary hover:bg-[#0c9593] text-white`}>Verify Evidence</button>
              </>
            )}
            {canManage && ["Verified", "Expired", "Needs Changes"].includes(status) && (
              <button type="button" disabled={busy} onClick={() => fileRef.current?.click()} className={`${button} bg-primary hover:bg-[#0c9593] text-white flex items-center gap-1.5`}><Upload className="w-3.5 h-3.5" /> Upload New Version</button>
            )}
            <input ref={fileRef} type="file" className="hidden" onChange={(event) => { uploadVersion(event.target.files?.[0]); event.target.value = ""; }} />
          </div>
        )
      }
    >
      {!evidence ? (
        <p className="text-sm text-light-black py-8 text-center">Loading...</p>
      ) : (
        <div className="space-y-5 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_STYLES[status]}`}>{status}</span>
            {evidence.criteria.map((item) => <span key={item} className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E6F4F2] text-[#0D9488]">{item}</span>)}
          </div>

          <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              ["Evidence Owner", evidence.owner?.name ?? "—"],
              ["Evidence Period", evidence.period || "—"],
              ["Evidence Expiration", evidence.expiresOn ? formatDate(`${evidence.expiresOn}T12:00:00`) : "Does Not Expire"],
              ["Uploaded By", evidence.uploadedBy ?? "—"],
              ["Uploaded At", formatDateTime(evidence.uploadedAt)],
              ["Last Updated", formatDateTime(evidence.updatedAt)],
              ["Verified By", evidence.verifiedBy ?? "—"],
              ["Verified At", evidence.verifiedAt ? formatDateTime(evidence.verifiedAt) : "—"],
              ["File", evidence.file ? `${evidence.file.type.toUpperCase()} · ${evidence.file.size}` : "No file yet"],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-light-black">{label}</dt>
                <dd className="font-semibold text-dark-black mt-0.5">{value}</dd>
              </div>
            ))}
          </dl>

          <div>
            <h4 className="font-bold text-dark-black/85 mb-1">Description / Supporting Notes</h4>
            <p className="text-medium-black leading-relaxed whitespace-pre-line">{evidence.description || "—"}</p>
          </div>
          <div>
            <h4 className="font-bold text-dark-black/85 mb-1">Verification Note</h4>
            <p className="text-medium-black">{evidence.verificationNote || "Not reviewed yet."}</p>
          </div>

          {canManage && ["Under Review", "Verified", "Expired", "Needs Changes"].includes(status) && (
            <div>
              <label htmlFor="evidence-note" className="font-bold text-dark-black/85 mb-1 block">{status === "Under Review" ? "Reviewer note" : "Note for the new version"}</label>
              <input id="evidence-note" value={note} maxLength={1000} onChange={(event) => setNote(event.target.value)} placeholder={status === "Under Review" ? "Required when requesting changes; optional when verifying" : "Optional"} className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-xs focus:outline-none focus:border-primary" />
            </div>
          )}

          <div>
            <h4 className="font-bold text-dark-black/85 mb-2">Files ({evidence.versions.length})</h4>
            <ul className="divide-y divide-light-gray/70 rounded-xl border border-light-gray">
              {evidence.versions.length === 0 && <li className="p-3 text-light-black">No file uploaded yet.</li>}
              {evidence.versions.map((version, index) => (
                <li key={version.id} className="p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-dark-black truncate">v{version.version} · {version.name} {index === 0 && <span className="text-[10px] text-primary">(current)</span>}</p>
                    <p className="text-[11px] text-light-black">{version.size} · {version.uploadedBy ?? "—"} · {formatDateTime(version.uploadedAt)}{version.note ? ` · ${version.note}` : ""}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 font-semibold">
                    {/\.(pdf|png|jpe?g)$/i.test(version.name) && <a href={`${base}/file?version=${version.id}&inline=1`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-dark-black/70 hover:text-primary"><Eye className="w-3.5 h-3.5" /> View</a>}
                    <a href={`${base}/file?version=${version.id}`} className="flex items-center gap-1 text-dark-black/70 hover:text-primary"><Download className="w-3.5 h-3.5" /> Download</a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </DialogModal>
  );
}
