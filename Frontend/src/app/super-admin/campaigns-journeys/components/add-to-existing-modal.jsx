"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";
import DialogModal, { DialogButton } from "@/components/modals/dialog-modal";
import { showSavedToast } from "@/lib/toast";
import RadioCards from "@/components/shared/radio-cards";
import { SAVED_SEGMENTS } from "../segments-data";

// Design only: adding leads just confirms on screen.
export default function AddToExistingModal({ isOpen, onClose, selectedLeads = [], onAddSuccess }) {
  const [selectedSegmentId, setSelectedSegmentId] = useState(SAVED_SEGMENTS[0]?.id || "1");
  const [skipExisting, setSkipExisting] = useState(true);
  const count = selectedLeads.length;

  const handleAdd = () => {
    const targetSegment = SAVED_SEGMENTS.find((segment) => segment.id === selectedSegmentId);
    showSavedToast("Leads added", count ? `${count} ${count === 1 ? "lead was" : "leads were"} added to "${targetSegment?.name || "Segment"}".` : `Leads were added to "${targetSegment?.name || "Segment"}".`);
    onAddSuccess?.(targetSegment);
    onClose();
  };

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add to Existing Segment"
      subtitle={count ? `${count} ${count === 1 ? "lead" : "leads"} selected.` : "Choose the segment to add these leads to."}
      size="sm"
      footer={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton variant="primary" onClick={handleAdd}>
            {count ? `Add ${count} ${count === 1 ? "Lead" : "Leads"}` : "Add Leads"}
          </DialogButton>
        </>
      }
    >
      <div className="space-y-3">
        <div className="max-h-[340px] overflow-y-auto">
          <RadioCards
            label="Segment"
            value={selectedSegmentId}
            onChange={setSelectedSegmentId}
            options={SAVED_SEGMENTS.map((segment) => ({
              value: segment.id,
              label: segment.name,
              description: `${segment.leadsCount.toLocaleString("en-US")} leads`,
            }))}
          />
        </div>

        <label className="flex items-center gap-3 pt-1 cursor-pointer select-none">
          <input type="checkbox" checked={skipExisting} onChange={(event) => setSkipExisting(event.target.checked)} className="sr-only peer" />
          <span className="w-5 h-5 rounded-md border border-gray-300 flex items-center justify-center peer-checked:bg-primary peer-checked:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30">
            {skipExisting && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
          </span>
          <span className="text-sm text-medium-black">Skip leads already in the segment</span>
        </label>
      </div>
    </DialogModal>
  );
}
