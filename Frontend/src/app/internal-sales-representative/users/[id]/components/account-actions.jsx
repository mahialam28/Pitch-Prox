"use client";

import React, { useState } from "react";
import { Ban, MinusCircle, RefreshCw, RotateCcw, Mail, AlertTriangle, X, Undo2 } from "lucide-react";
import { IssueRefundModal, SendNotificationModal } from "./account-action-modals";
import toast from "react-hot-toast";

const AccountActions = () => {
  const [confirmModal, setConfirmModal] = useState(null);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);

  const handleActionClick = (type, title, description, color) => {
    setConfirmModal({ type, title, description, color });
  };

  const handleConfirm = () => {
    const title = confirmModal?.title || "Action";
    toast.success(`Action confirmed: ${title}`);
    setConfirmModal(null);
  };

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
            onClick={() =>
              handleActionClick(
                "suspend",
                "Suspend Account",
                "Are you sure you want to suspend Jennifer Smith's account? The user will temporarily lose system access.",
                "red"
              )
            }
            className="px-3.5 sm:px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-2xs whitespace-nowrap"
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Suspend Account</span>
          </button>

          {/* Cancel Account */}
          <button
            type="button"
            onClick={() =>
              handleActionClick(
                "cancel",
                "Cancel Account",
                "Are you sure you want to cancel this account? This will terminate active subscription services.",
                "red"
              )
            }
            className="px-3.5 sm:px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-2xs whitespace-nowrap"
          >
            <MinusCircle className="w-3.5 h-3.5" />
            <span>Cancel Account</span>
          </button>

          {/* Reactivate Account */}
          <button
            type="button"
            onClick={() =>
              handleActionClick(
                "reactivate",
                "Reactivate Account",
                "Reactivating this account will restore full access and resume standard billing cycles.",
                "emerald"
              )
            }
            className="px-3.5 sm:px-4 py-2 rounded-xl border border-emerald-200 text-emerald-600 hover:bg-emerald-50 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-2xs whitespace-nowrap"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reactivate Account</span>
          </button>

          {/* Reset Calibration */}
          <button
            type="button"
            onClick={() =>
              handleActionClick(
                "reset_cal",
                "Reset Calibration",
                "This will reset voice and speech calibration models for all users in this account.",
                "blue"
              )
            }
            className="px-3.5 sm:px-4 py-2 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-2xs whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Calibration</span>
          </button>

          {/* Send Notification */}
          <button
            type="button"
            onClick={() => setNotifyOpen(true)}
            className="px-3.5 sm:px-4 py-2 rounded-xl border border-light-gray text-dark-black/80 hover:bg-light-gray text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-2xs whitespace-nowrap"
          >
            <Mail className="w-3.5 h-3.5 text-light-black" />
            <span>Send Notification</span>
          </button>

          {/* Issue Refund */}
          <button
            type="button"
            onClick={() => setRefundOpen(true)}
            className="px-3.5 sm:px-4 py-2 rounded-xl border border-light-gray text-dark-black/80 hover:bg-light-gray text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-2xs whitespace-nowrap"
          >
            <Undo2 className="w-3.5 h-3.5 text-light-black" />
            <span>Issue Refund</span>
          </button>
        </div>
      </div>

      <SendNotificationModal isOpen={notifyOpen} onClose={() => setNotifyOpen(false)} />
      <IssueRefundModal isOpen={refundOpen} onClose={() => setRefundOpen(false)} />

      {/* ── Confirmation Modal ── */}
      {Boolean(confirmModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 border border-light-gray shadow-2xl max-w-md w-full space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    confirmModal?.color === "red"
                      ? "bg-rose-50 text-rose-600"
                      : confirmModal?.color === "emerald"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-blue-50 text-blue-600"
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-dark-black text-sm">
                  {confirmModal?.title || "Confirm Action"}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="p-1 rounded-lg hover:bg-light-gray text-light-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-light-black leading-relaxed">
              {confirmModal?.description || ""}
            </p>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-xl border border-light-gray text-xs font-semibold text-medium-black hover:bg-light-gray cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={`px-4 py-2 rounded-xl text-white text-xs font-semibold cursor-pointer shadow-xs ${
                  confirmModal?.color === "red"
                    ? "bg-rose-600 hover:bg-rose-700"
                    : confirmModal?.color === "emerald"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-primary hover:bg-medium-teal"
                }`}
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AccountActions;
