"use client";

import React, { useEffect, useState } from "react";
import { History, RotateCcw, Download } from "lucide-react";
import toast from "react-hot-toast";
import DialogModal, { DialogButton } from "@/components/modals/dialog-modal";
import { apiRequest, formatDateTime } from "@/lib/client-api";

// Published versions of a platform playbook (Spec 12 §11). Versions never change; rolling back
// re-publishes an earlier version as the newest number, with a reason.
export default function VersionHistoryModal({ playbookId, onClose, onChanged }) {
  const [data, setData] = useState(null);
  const [rollingBack, setRollingBack] = useState(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    apiRequest(`/api/v1/admin/playbooks/${playbookId}/versions`).then(setData).catch((error) => toast.error(error.message));
  }, [playbookId]);

  const rollback = async () => {
    setBusy(true);
    try {
      const result = await apiRequest(`/api/v1/admin/playbooks/${playbookId}/rollback`, { method: "POST", body: { version: rollingBack, releaseNotes: reason } });
      setData(result);
      toast.success(`Rolled back. v${result.playbook.version} is now in force.`);
      setRollingBack(null);
      setReason("");
      onChanged?.();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <DialogModal isOpen onClose={onClose} title={data ? `${data.playbook.title}: versions` : "Versions"} subtitle="Published versions are fixed. Customers and live calls use the one in force." size="lg" footer={<DialogButton onClick={onClose}>Close</DialogButton>}>
      {!data && <p className="text-sm text-light-black py-6 text-center">Loading...</p>}
      {data && data.versions.length === 0 && <p className="text-sm text-light-black py-6 text-center">Not published from the builder yet.</p>}
      <ul className="space-y-3">
        {data?.versions.map((version) => (
          <li key={version.id} className={`rounded-xl border p-4 space-y-2 ${version.active ? "border-primary/50 bg-primary/5" : "border-light-gray"}`}>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-dark-black">v{version.version}</span>
                {version.active && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary text-white">In force</span>}
                {version.rolledBackFrom && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700">Rollback</span>}
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <a href={`/api/v1/admin/playbooks/${playbookId}/versions/${version.version}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-dark-black/70 hover:text-primary"><Download className="w-3.5 h-3.5" /> Compiled playbook</a>
                <a href={`/api/v1/admin/playbooks/${playbookId}/export?version=${version.version}`} className="flex items-center gap-1 text-dark-black/70 hover:text-primary" title="AI-safe JSON: no price, access or internal notes"><Download className="w-3.5 h-3.5" /> For AI developer</a>
                {!version.active && (
                  <button type="button" onClick={() => setRollingBack(version.version)} className="flex items-center gap-1 text-dark-black/70 hover:text-primary cursor-pointer"><RotateCcw className="w-3.5 h-3.5" /> Roll back to this</button>
                )}
              </div>
            </div>
            <p className="text-xs text-medium-black">{version.releaseNotes || "First version."}</p>
            <p className="text-[11px] text-light-black">
              {version.publishedBy} · {formatDateTime(version.publishedAt)}
              {version.changedSections.length > 0 && ` · changed: ${version.changedSections.join(", ")}`}
              {version.warningsAcknowledged > 0 && ` · ${version.warningsAcknowledged} review warning${version.warningsAcknowledged === 1 ? "" : "s"} confirmed`}
            </p>
            {rollingBack === version.version && (
              <div className="pt-2 space-y-2">
                <label htmlFor={`reason-${version.id}`} className="text-xs font-semibold text-dark-black block">Why roll back? (shown in the history)</label>
                <input id={`reason-${version.id}`} value={reason} maxLength={500} onChange={(event) => setReason(event.target.value)} placeholder="e.g. v3 objection guidance caused confusing prompts" className="w-full px-3 py-2 rounded-xl border border-light-gray text-xs focus:outline-none focus:border-primary" />
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => setRollingBack(null)} className="px-3 py-1.5 rounded-lg border border-light-gray text-xs font-semibold cursor-pointer">Cancel</button>
                  <button type="button" disabled={busy || reason.trim().length < 10} onClick={rollback} className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold cursor-pointer disabled:opacity-50">{busy ? "Rolling back..." : `Make v${version.version} current`}</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </DialogModal>
  );
}
