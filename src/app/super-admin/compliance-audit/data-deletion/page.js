"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import DialogModal, { DialogButton } from "@/components/modals/dialog-modal";
import { apiRequest, formatDateTime } from "@/lib/client-api";
import { showError } from "@/lib/alerts";
import { showSavedToast } from "@/lib/toast";

// Compliance & Audit → Data Deletion: requests from pitchprox.com/data-deletion (Phase 15).
// Delete the data itself where it lives (e.g. Users → the account → Delete), then mark the request Done;
// the person is emailed. Rejected needs a reason, which is emailed too. Auditors read only.

const TABS = [
  { key: "", label: "All" },
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In progress" },
  { key: "done", label: "Done" },
  { key: "rejected", label: "Rejected" },
];
const STATUS_STYLE = {
  open: "bg-amber-50 text-amber-700 border-amber-100",
  in_progress: "bg-sky-50 text-sky-700 border-sky-100",
  done: "bg-emerald-50 text-emerald-700 border-emerald-100",
  rejected: "bg-light-gray text-medium-black border-light-gray",
};
const statusLabel = (status) => TABS.find((tab) => tab.key === status)?.label ?? status;

function CloseDialog({ request, status, onClose, onSaved }) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    try {
      const result = await apiRequest(`/api/v1/compliance/data-deletion/${request.id}`, { method: "PATCH", body: { status, note } });
      onSaved(result.request);
      showSavedToast(status === "done" ? "Marked done" : "Request rejected", `${request.reference}: ${request.email} has been emailed.`);
      onClose();
    } catch (error) {
      showError("Not saved", error.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <DialogModal
      isOpen
      onClose={onClose}
      title={status === "done" ? `Mark ${request.reference} done?` : `Reject ${request.reference}?`}
      subtitle={status === "done" ? "Only after the data has actually been deleted. The person is emailed." : "Explain why. The person is emailed your reason."}
      size="md"
      footer={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton variant={status === "done" ? "primary" : "danger"} disabled={busy || (status === "rejected" && !note.trim())} onClick={save}>
            {status === "done" ? "Mark done" : "Reject"}
          </DialogButton>
        </>
      }
    >
      <label className="block">
        <span className="block text-xs font-medium text-medium-black mb-1.5">{status === "done" ? "Note for the person (optional)" : "Reason (required)"}</span>
        <textarea rows={4} maxLength={1000} value={note} onChange={(event) => setNote(event.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm outline-none focus:border-primary resize-none" />
      </label>
    </DialogModal>
  );
}

export default function DataDeletionRequestsPage() {
  const [tab, setTab] = useState("");
  const [data, setData] = useState(null);
  const [me, setMe] = useState(null);
  const [closing, setClosing] = useState(null); // { request, status }

  const load = useCallback(() => {
    apiRequest(`/api/v1/compliance/data-deletion${tab ? `?status=${tab}` : ""}`)
      .then(setData)
      .catch((error) => showError("Requests not loaded", error.message));
  }, [tab]);
  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    apiRequest("/api/v1/me").then((result) => setMe(result.user)).catch(() => {});
  }, []);

  const canWrite = me && me.role !== "auditor";
  const replace = (updated) => setData((current) => ({ ...current, results: current.results.map((row) => (row.id === updated.id ? updated : row)) }));
  const start = async (request) => {
    try {
      replace((await apiRequest(`/api/v1/compliance/data-deletion/${request.id}`, { method: "PATCH", body: { status: "in_progress" } })).request);
    } catch (error) {
      showError("Not saved", error.message);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-dark-black">Data Deletion Requests</h1>
          <p className="text-sm text-medium-black">From pitchprox.com/data-deletion. Complete within 30 days; delete the data first, then mark the request done.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          ["Open", data?.counts.open, "text-amber-600"],
          ["In progress", data?.counts.inProgress, "text-sky-600"],
          ["Done", data?.counts.done, "text-emerald-600"],
          ["Rejected", data?.counts.rejected, "text-medium-black"],
        ].map(([label, value, color]) => (
          <div key={label} className="bg-white rounded-2xl border border-light-gray p-4">
            <p className="text-xs text-light-black">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value ?? "—"}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-light-gray shadow-sm p-4 sm:p-6">
        <div className="flex flex-wrap gap-2 mb-4" role="tablist">
          {TABS.map((item) => (
            <button key={item.key} type="button" role="tab" aria-selected={tab === item.key} onClick={() => setTab(item.key)} className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border cursor-pointer ${tab === item.key ? "bg-primary text-white border-primary" : "border-light-gray text-medium-black hover:border-primary/40"}`}>
              {item.label}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-light-black border-b border-light-gray">
                <th className="py-2.5 font-semibold">Request</th>
                <th className="py-2.5 font-semibold">Person</th>
                <th className="py-2.5 font-semibold">Wants deleted</th>
                <th className="py-2.5 font-semibold">Status</th>
                <th className="py-2.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray/60">
              {data?.results.map((request) => (
                <tr key={request.id} className="align-top">
                  <td className="py-3 pr-3">
                    <p className="font-semibold text-dark-black">{request.reference}</p>
                    <p className="text-xs text-light-black">{formatDateTime(request.createdAt)}</p>
                  </td>
                  <td className="py-3 pr-3">
                    <p className="font-medium text-dark-black">{request.name}</p>
                    <p className="text-xs text-light-black break-all">{request.email}</p>
                    <p className="text-[11px] text-light-black">{request.isCustomer ? "Has a PitchProX account" : "No account with this email"}</p>
                  </td>
                  <td className="py-3 pr-3 max-w-[260px]">
                    <p className="text-dark-black">{request.scopeLabel}</p>
                    {request.details && <p className="text-xs text-medium-black mt-0.5">{request.details}</p>}
                    {request.note && <p className="text-xs text-light-black mt-1">Note: {request.note}</p>}
                  </td>
                  <td className="py-3 pr-3">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[request.status]}`}>{statusLabel(request.status)}</span>
                    {request.handledBy && <p className="text-[11px] text-light-black mt-1">by {request.handledBy}</p>}
                  </td>
                  <td className="py-3 text-right whitespace-nowrap">
                    {canWrite && ["open", "in_progress"].includes(request.status) && (
                      <div className="inline-flex gap-1.5">
                        {request.status === "open" && (
                          <button type="button" onClick={() => start(request)} className="px-3 py-1.5 rounded-lg border border-light-gray text-xs font-semibold hover:border-primary/40 cursor-pointer">
                            Start
                          </button>
                        )}
                        <button type="button" onClick={() => setClosing({ request, status: "done" })} className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-medium-teal cursor-pointer">
                          Done
                        </button>
                        <button type="button" onClick={() => setClosing({ request, status: "rejected" })} className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 cursor-pointer">
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {data && data.results.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-light-black">
                    No requests here.
                  </td>
                </tr>
              )}
              {!data && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-light-black">
                    Loading…
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {closing && <CloseDialog request={closing.request} status={closing.status} onClose={() => setClosing(null)} onSaved={replace} />}
    </div>
  );
}
