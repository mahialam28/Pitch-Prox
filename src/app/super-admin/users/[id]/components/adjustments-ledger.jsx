"use client";

import React, { useState } from "react";
import { Check, X, Undo2 } from "lucide-react";
import ConfirmDialog from "@/components/modals/confirm-dialog";
import { showSavedToast } from "@/lib/toast";
import { decideAdjustment, reverseAdjustment } from "@/app/super-admin/users/account-api";

// Credits & adjustments for one account: every entry stays in the ledger. A Super Admin approves or
// rejects pending requests and undoes applied entries with a reversal (a new, opposite entry).
const STATUS_TONE = {
  applied: "text-emerald-700 bg-emerald-50 border-emerald-200",
  pending: "text-amber-700 bg-amber-50 border-amber-200",
  rejected: "text-slate-600 bg-slate-100 border-slate-200",
};
const KIND = { calls: "Calls", reports: "Reports", credit: "Credit", discount: "Discount", refund: "Refund" };
const when = (value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function AdjustmentsLedger({ adjustments = [], isSuperAdmin = false, onChanged = () => {} }) {
  const [acting, setActing] = useState(null); // { row, action: "approve" | "reject" | "reverse" }
  const [note, setNote] = useState("");
  const close = () => {
    setActing(null);
    setNote("");
  };

  // Optional chaining: the React Compiler may read these while nothing is selected
  const confirm = async () => {
    const row = acting?.row;
    const action = acting?.action;
    if (!row) return;
    if (action === "reverse") await reverseAdjustment(row.id, note.trim());
    else await decideAdjustment(row.id, action, note.trim() || undefined);
    onChanged();
    showSavedToast(action === "reverse" ? "Adjustment reversed" : action === "approve" ? "Adjustment approved" : "Adjustment rejected", `${row.reference}: ${row.value}`);
    setNote("");
  };

  return (
    <div className="bg-white rounded-2xl border border-light-gray shadow-xs p-5 sm:p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xs font-bold text-dark-black tracking-wider uppercase">Credits &amp; Adjustments</h2>
        <span className="text-[11px] text-light-black">{adjustments.filter((row) => row.status === "pending").length} pending</span>
      </div>
      {!adjustments.length ? (
        <p className="text-xs text-light-black">No credits or adjustments yet.</p>
      ) : (
        <div className="divide-y divide-light-gray/60 text-xs">
          {adjustments.map((row) => (
            <div key={row.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-dark-black">{row.value}</span>
                  <span className="text-light-black">{KIND[row.kind]}</span>
                  <span className={`px-1.5 py-0.5 rounded-md border text-[10px] font-semibold capitalize ${STATUS_TONE[row.status]}`}>{row.reversed ? "reversed" : row.status}</span>
                  <span className="text-light-black">{row.reference}</span>
                </div>
                <p className="text-light-black mt-0.5 truncate" title={row.reason}>
                  {row.reason} · {row.requestedBy}, {when(row.createdAt)}
                  {row.applyTo ? ` · ${row.applyTo}` : ""}
                </p>
              </div>
              {isSuperAdmin && (
                <div className="flex items-center gap-1.5 shrink-0">
                  {row.status === "pending" && (
                    <>
                      <button type="button" onClick={() => setActing({ row, action: "approve" })} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-semibold cursor-pointer">
                        <Check className="w-3 h-3" /> Approve
                      </button>
                      <button type="button" onClick={() => setActing({ row, action: "reject" })} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-light-gray text-medium-black hover:bg-light-gray font-semibold cursor-pointer">
                        <X className="w-3 h-3" /> Reject
                      </button>
                    </>
                  )}
                  {row.status === "applied" && !row.reversed && !row.isReversal && (
                    <button type="button" onClick={() => setActing({ row, action: "reverse" })} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-light-gray text-medium-black hover:bg-light-gray font-semibold cursor-pointer">
                      <Undo2 className="w-3 h-3" /> Reverse
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(acting)}
        onClose={close}
        title={acting?.action === "reverse" ? "Reverse this adjustment?" : acting?.action === "approve" ? "Approve this request?" : "Reject this request?"}
        message={acting ? `${acting.row.reference}: ${acting.row.value} for ${acting.row.company}.` : ""}
        note={acting?.action === "reverse" ? "A new, opposite entry is added. The original stays in the ledger." : undefined}
        confirmLabel={acting?.action === "reverse" ? "Reverse" : acting?.action === "approve" ? "Approve" : "Reject"}
        confirmVariant={acting?.action === "approve" ? "primary" : "danger"}
        confirmDisabled={acting?.action === "reverse" && !note.trim()}
        onConfirm={confirm}
      >
        <label className="flex flex-col gap-1.5 text-xs font-semibold text-medium-black">
          {acting?.action === "reverse" ? "Reason" : "Note (optional)"}
          <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} className="w-full px-3 py-2 rounded-xl border border-light-gray text-sm outline-none focus:border-primary" />
        </label>
      </ConfirmDialog>
    </div>
  );
}
