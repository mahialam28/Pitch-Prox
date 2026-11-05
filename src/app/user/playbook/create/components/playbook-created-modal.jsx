"use client";

import React, { useState } from "react";
import { CircleCheck } from "lucide-react";
import DialogModal, { DialogButton } from "@/components/modals/dialog-modal";

// Shown after a custom playbook is published
const PlaybookCreatedModal = ({ playbook, onViewPlaybook, onSetActive }) => {
  const [activating, setActivating] = useState(false);

  const setActive = async () => {
    setActivating(true);
    try {
      await onSetActive();
    } finally {
      setActivating(false);
    }
  };

  return (
    <DialogModal
      isOpen={Boolean(playbook)}
      onClose={activating ? undefined : onViewPlaybook}
      title="Playbook created"
      size="sm"
      footer={
        <>
          <DialogButton onClick={onViewPlaybook} disabled={activating}>View Playbook</DialogButton>
          <DialogButton variant="primary" onClick={setActive} disabled={activating}>
            {activating ? "Activating…" : "Set as Active"}
          </DialogButton>
        </>
      }
    >
      <div className="flex flex-col items-center text-center gap-3 py-1">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
          <CircleCheck className="w-6 h-6" />
        </div>
        <p className="text-lg font-semibold text-dark-black">{playbook?.title} is ready</p>
        <p className="text-sm leading-5 text-medium-black max-w-sm">
          Your playbook is saved. Set it as your active playbook to use it on your next call.
        </p>
      </div>
    </DialogModal>
  );
};

export default PlaybookCreatedModal;
