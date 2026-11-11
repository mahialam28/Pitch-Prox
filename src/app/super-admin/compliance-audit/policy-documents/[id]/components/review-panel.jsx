"use client";

import React, { useState } from "react";
import { ClipboardCheck, Eye, Send, Undo2, Trash2, Check, MessageSquareWarning } from "lucide-react";
import { formatDateTime } from "@/lib/client-api";

// The version being prepared: a Super Admin approves or sends it back with a note;
// Admin Managers submit, withdraw or discard their drafts.
export default function ReviewPanel({ policy, permissions, onAction, onView }) {
  const [note, setNote] = useState("");
  const [askingChanges, setAskingChanges] = useState(false);
  const [busy, setBusy] = useState(false);
  const version = policy.versions.find((item) => item.id === policy.pendingVersion.id);
  if (!version) return null;
  const underReview = version.status === "under_review";
  const isNewPolicy = policy.statusKey !== "published" && policy.statusKey !== "archived";

  const run = async (action, actionNote) => {
    setBusy(true);
    const ok = await onAction(version.id, action, actionNote);
    setBusy(false);
    if (ok) {
      setNote("");
      setAskingChanges(false);
    }
  };

  const button = "px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50";

  return (
    <div className={`rounded-2xl border p-5 sm:p-6 flex flex-col gap-4 ${underReview ? "bg-amber-50/40 border-amber-200" : version.status === "rejected" ? "bg-rose-50/40 border-rose-200" : "bg-white border-light-gray"}`}>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-white border border-light-gray flex items-center justify-center shrink-0">
            <ClipboardCheck className="w-5 h-5 text-[#D97706]" />
          </div>
          <div className="space-y-1 min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-dark-black/85 font-secondary">
              {version.versionLabel} {underReview ? "is waiting for approval" : version.status === "rejected" ? "needs changes" : "is a draft"}
              {!isNewPolicy && <span className="font-medium text-light-black"> · {policy.version} stays in force until then</span>}
            </h2>
            <p className="text-xs text-light-black">
              {underReview ? `Submitted by ${version.submittedBy ?? "—"} on ${formatDateTime(version.submittedAt)}` : `Last edited by ${version.createdBy}`}
              {version.restoredFrom && ` · restored from v${version.restoredFrom}`}
            </p>
            {version.changeNote && <p className="text-xs text-dark-black/80"><span className="font-semibold">What changed:</span> {version.changeNote}</p>}
            {version.reviewNote && (
              <p className="text-xs text-rose-700 flex items-start gap-1.5">
                <MessageSquareWarning className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span><span className="font-semibold">{version.decidedBy ?? "Reviewer"}:</span> {version.reviewNote}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button type="button" onClick={() => onView(version.id)} className={`${button} border border-light-gray bg-white hover:bg-light-gray/40 text-dark-black/85`}>
            <Eye className="w-4 h-4" /> Preview
          </button>
          {permissions.manage && !underReview && (
            <button type="button" disabled={busy} onClick={() => run("submit")} className={`${button} bg-primary hover:bg-[#0c9593] text-white`}>
              <Send className="w-4 h-4" /> Submit for Approval
            </button>
          )}
          {permissions.manage && underReview && !permissions.approve && (
            <button type="button" disabled={busy} onClick={() => run("withdraw")} className={`${button} border border-light-gray bg-white hover:bg-light-gray/40 text-dark-black/85`}>
              <Undo2 className="w-4 h-4" /> Withdraw
            </button>
          )}
          {permissions.manage && !underReview && !isNewPolicy && (
            <button type="button" disabled={busy} onClick={() => run("discard")} className={`${button} border border-rose-200 bg-white hover:bg-rose-50 text-rose-600`}>
              <Trash2 className="w-4 h-4" /> Discard Draft
            </button>
          )}
          {permissions.approve && underReview && (
            <>
              <button type="button" disabled={busy} onClick={() => setAskingChanges((current) => !current)} className={`${button} border border-amber-300 bg-white hover:bg-amber-50 text-amber-700`}>
                <MessageSquareWarning className="w-4 h-4" /> Request Changes
              </button>
              <button type="button" disabled={busy} onClick={() => run("approve")} className={`${button} bg-[#16A34A] hover:bg-[#15803D] text-white`}>
                <Check className="w-4 h-4" /> Approve {version.versionLabel}
              </button>
            </>
          )}
        </div>
      </div>

      {askingChanges && (
        <div className="flex flex-col sm:flex-row gap-2">
          <label htmlFor="review-note" className="sr-only">What needs to change</label>
          <input
            id="review-note"
            type="text"
            value={note}
            maxLength={500}
            onChange={(event) => setNote(event.target.value)}
            placeholder="What needs to change? (shown to the author)"
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-light-gray text-xs text-dark-black/80 placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <button type="button" disabled={busy || !note.trim()} onClick={() => run("reject", note.trim())} className={`${button} bg-amber-600 hover:bg-amber-700 text-white justify-center`}>
            Send Back
          </button>
        </div>
      )}
    </div>
  );
}
