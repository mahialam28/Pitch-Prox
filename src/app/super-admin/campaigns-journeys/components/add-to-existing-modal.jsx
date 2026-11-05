"use client";

import React, { useState } from "react";
import DialogModal, { DialogButton } from "@/components/modals/dialog-modal";
import { SAVED_SEGMENTS } from "../user-segments";
import { showSavedToast } from "@/lib/toast";

// Add selected users to an existing Static segment (Dynamic segments fill themselves from their rules)
export default function AddToExistingModal({ isOpen, onClose, segments = SAVED_SEGMENTS, selectedUserIds = [], onAddSuccess }) {
  const staticSegments = segments.filter((segment) => segment.type === "Static");
  const [segmentId, setSegmentId] = useState("");
  const count = selectedUserIds.length;
  const target = staticSegments.find((segment) => segment.id === segmentId) ?? staticSegments[0];

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Users to a Static Segment"
      subtitle={`${count} ${count === 1 ? "user" : "users"} selected.`}
      size="sm"
      footer={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton
            variant="primary"
            disabled={!target || !count}
            onClick={() => {
              onAddSuccess?.(target);
              showSavedToast("Users added", `${count} ${count === 1 ? "user was" : "users were"} added to "${target.name}".`);
              onClose();
            }}
          >
            Add Users
          </DialogButton>
        </>
      }
    >
      {staticSegments.length ? (
        <label className="flex flex-col gap-1.5 text-xs font-semibold text-medium-black">
          Static segment
          <select value={target?.id ?? ""} onChange={(event) => setSegmentId(event.target.value)} className="h-10 px-3 rounded-xl border border-light-gray text-sm text-dark-black outline-none focus:border-primary">
            {staticSegments.map((segment) => (
              <option key={segment.id} value={segment.id}>{segment.name} ({(segment.userIds ?? []).length} users)</option>
            ))}
          </select>
        </label>
      ) : (
        <p className="text-sm text-medium-black">There are no Static segments yet. Use &ldquo;Create Static Segment&rdquo; to make one from the selected users.</p>
      )}
    </DialogModal>
  );
}
