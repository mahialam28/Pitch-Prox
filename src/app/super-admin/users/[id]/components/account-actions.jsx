"use client";

import React, { useState } from "react";
import { Ban, MinusCircle, RefreshCw, RotateCcw, Undo2 } from "lucide-react";
import { SuspendAccountModal, CancelAccountModal, ReactivateAccountModal, ResetCalibrationModal } from "./account-dialogs";

// Account Actions (Overview). The live page passes the account's state and what to call:
//   status: "active" | "suspended" | "deleted"; cancelAtPeriodEnd: cancellation is scheduled
//   canSuspend: Super Admin / Support (a sales rep can't suspend; they can cancel or reactivate a subscription)
const buttonClass = "px-3.5 sm:px-4 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-2xs whitespace-nowrap";

const AccountActions = ({
  name,
  status = "active",
  cancelAtPeriodEnd = false,
  calibrated = true,
  canSuspend = true,
  canWrite = true,
  onSuspend,
  onReactivate,
  onCancel,
  onUndoCancel,
  onResetCalibration,
}) => {
  const [open, setOpen] = useState(null);
  const close = () => setOpen(null);
  if (!canWrite) return null;
  const active = status === "active";

  return (
    <>
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full">
        <h3 className="text-base font-bold text-dark-black/85 tracking-tight mb-4">Account Actions</h3>
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {active && canSuspend && (
            <button type="button" onClick={() => setOpen("suspend")} className={`${buttonClass} border-rose-200 text-rose-600 hover:bg-rose-50`}>
              <Ban className="w-3.5 h-3.5" />
              <span>Suspend Account</span>
            </button>
          )}
          {active && !cancelAtPeriodEnd && (
            <button type="button" onClick={() => setOpen("cancel")} className={`${buttonClass} border-rose-200 text-rose-600 hover:bg-rose-50`}>
              <MinusCircle className="w-3.5 h-3.5" />
              <span>Cancel Subscription</span>
            </button>
          )}
          {active && cancelAtPeriodEnd && (
            <button type="button" onClick={onUndoCancel} className={`${buttonClass} border-emerald-200 text-emerald-600 hover:bg-emerald-50`}>
              <Undo2 className="w-3.5 h-3.5" />
              <span>Keep Subscription</span>
            </button>
          )}
          {!active && canSuspend && (
            <button type="button" onClick={() => setOpen("reactivate")} className={`${buttonClass} border-emerald-200 text-emerald-600 hover:bg-emerald-50`}>
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reactivate Account</span>
            </button>
          )}
          {calibrated && (
            <button type="button" onClick={() => setOpen("reset")} className={`${buttonClass} border-blue-200 text-blue-600 hover:bg-blue-50`}>
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Calibration</span>
            </button>
          )}
        </div>
        {cancelAtPeriodEnd && active && <p className="text-[11px] text-rose-600 mt-3">The subscription ends at the end of the current billing period.</p>}
        {!active && <p className="text-[11px] text-rose-600 mt-3">This account is {status}. The customer can&apos;t sign in.</p>}
      </div>

      <SuspendAccountModal isOpen={open === "suspend"} onClose={close} name={name} onConfirm={onSuspend} />
      <CancelAccountModal isOpen={open === "cancel"} onClose={close} onConfirm={onCancel} />
      <ReactivateAccountModal isOpen={open === "reactivate"} onClose={close} onConfirm={onReactivate} />
      <ResetCalibrationModal isOpen={open === "reset"} onClose={close} onConfirm={onResetCalibration} />
    </>
  );
};

export default AccountActions;
