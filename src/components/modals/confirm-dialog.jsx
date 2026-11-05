"use client";

import React, { useState } from "react";
import DialogModal, { DialogButton } from "./dialog-modal";

// Confirmation dialog: icon badge + message, Cancel and a confirm action.
// onConfirm may be async; the dialog shows a busy state and closes when it resolves.

const TONES = {
  danger: "bg-red-50 text-red-600",
  warning: "bg-amber-50 text-amber-600",
  primary: "bg-light-teal text-primary",
};

const ConfirmDialog = ({
  isOpen,
  onClose,
  title,
  icon: Icon,
  iconTone = "danger",
  message,
  note,
  noteClassName = "text-medium-black",
  confirmLabel = "Confirm",
  confirmVariant = "danger",
  cancelLabel = "Cancel",
  onConfirm,
  confirmDisabled = false,
  children,
}) => {
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm?.();
      onClose();
    } catch {
      // The caller reports its own error; keep the dialog open so the user can retry
    } finally {
      setBusy(false);
    }
  };

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={busy ? undefined : onClose}
      title={title}
      size="sm"
      footer={
        <>
          <DialogButton onClick={onClose} disabled={busy}>{cancelLabel}</DialogButton>
          <DialogButton variant={confirmVariant} onClick={handleConfirm} disabled={busy || confirmDisabled}>
            {busy ? "Please wait…" : confirmLabel}
          </DialogButton>
        </>
      }
    >
      <div className="flex items-start gap-4">
        {Icon && (
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${TONES[iconTone] ?? TONES.danger}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
        <div className="flex-1 min-w-0 space-y-2">
          <p className="text-sm leading-5 text-medium-black">{message}</p>
          {note && <p className={`text-xs leading-4 ${noteClassName}`}>{note}</p>}
        </div>
      </div>
      {/* Optional extra fields (reason, type-to-confirm) below the message */}
      {children && <div className="mt-5">{children}</div>}
    </DialogModal>
  );
};

export default ConfirmDialog;
