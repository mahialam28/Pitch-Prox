"use client";

import React, { useState } from "react";
import { Ban, MinusCircle, RefreshCw, RotateCcw, Mail } from "lucide-react";
import { SendNotificationModal } from "@/app/internal-sales-representative/users/[id]/components/account-action-modals";
import { SuspendAccountModal, CancelAccountModal, ReactivateAccountModal, ResetCalibrationModal } from "./account-dialogs";

// Design only: each action opens its confirmation dialog; nothing is changed on the server.
const AccountActions = () => {
  const [open, setOpen] = useState(null);
  const close = () => setOpen(null);

  return (
    <>
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full">
        {/* ── Title ── */}
        <h3 className="text-base font-bold text-dark-black/85 tracking-tight mb-4">
          Account Actions
        </h3>

        {/* ── Buttons Row ── */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Suspend Account */}
          <button
            type="button"
            onClick={() => setOpen("suspend")}
            className="px-3.5 sm:px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-2xs whitespace-nowrap"
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Suspend Account</span>
          </button>

          {/* Cancel Account */}
          <button
            type="button"
            onClick={() => setOpen("cancel")}
            className="px-3.5 sm:px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-2xs whitespace-nowrap"
          >
            <MinusCircle className="w-3.5 h-3.5" />
            <span>Cancel Account</span>
          </button>

          {/* Reactivate Account */}
          <button
            type="button"
            onClick={() => setOpen("reactivate")}
            className="px-3.5 sm:px-4 py-2 rounded-xl border border-emerald-200 text-emerald-600 hover:bg-emerald-50 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-2xs whitespace-nowrap"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reactivate Account</span>
          </button>

          {/* Reset Calibration */}
          <button
            type="button"
            onClick={() => setOpen("reset")}
            className="px-3.5 sm:px-4 py-2 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-2xs whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Calibration</span>
          </button>

          {/* Send Notification */}
          <button
            type="button"
            onClick={() => setOpen("notify")}
            className="px-3.5 sm:px-4 py-2 rounded-xl border border-light-gray text-dark-black/80 hover:bg-light-gray text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-2xs whitespace-nowrap"
          >
            <Mail className="w-3.5 h-3.5 text-light-black" />
            <span>Send Notification</span>
          </button>
        </div>
      </div>

      <SuspendAccountModal isOpen={open === "suspend"} onClose={close} />
      <CancelAccountModal isOpen={open === "cancel"} onClose={close} />
      <ReactivateAccountModal isOpen={open === "reactivate"} onClose={close} />
      <ResetCalibrationModal isOpen={open === "reset"} onClose={close} />
      <SendNotificationModal isOpen={open === "notify"} onClose={close} />
    </>
  );
};

export default AccountActions;
