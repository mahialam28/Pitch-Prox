"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import SegmentsStats from "./segments-stats";
import SavedSegments from "./saved-segments";
import UsersTable from "./users-table";
import SegmentFormModal from "./segment-form-modal";
import AddToExistingModal from "./add-to-existing-modal";
import { SAVED_SEGMENTS } from "../user-segments";
import { showSavedToast } from "@/lib/toast";

// User Segments: groups of PitchProX users (customers) for broadcast campaigns and journeys
export default function SegmentsSection() {
  const [segmentsList, setSegmentsList] = useState(SAVED_SEGMENTS);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [addToExistingOpen, setAddToExistingOpen] = useState(false);

  const toggleUser = (id) => setSelectedUserIds((ids) => (ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]));

  return (
    <div className="w-full flex flex-col gap-7">
      <div className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-lg sm:text-xl font-bold text-dark-black/85 tracking-tight">User Segments</h2>
          <p className="text-xs sm:text-[13px] text-light-black">
            Group PitchProX users for campaigns and lifecycle journeys. Dynamic segments update automatically as users match their rules.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-medium-teal text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer ml-auto lg:ml-0"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Create New Segment</span>
        </button>
      </div>

      <SegmentsStats segments={segmentsList} />

      <SavedSegments segments={segmentsList} />

      <UsersTable
        title="All Users"
        subtitle="Select users to build a Static segment or add them to an existing Static segment."
        selectable
        selectedIds={selectedUserIds}
        onToggle={toggleUser}
        actions={
          selectedUserIds.length > 0 && (
            <>
              <span className="text-xs font-semibold text-primary">{selectedUserIds.length} selected</span>
              <button type="button" onClick={() => setAddToExistingOpen(true)} className="h-9 px-3 rounded-xl border border-primary text-primary text-xs font-semibold hover:bg-primary/5 cursor-pointer">
                Add to Static Segment
              </button>
              <button type="button" onClick={() => setFormOpen(true)} className="h-9 px-3 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-medium-teal cursor-pointer">
                Create Static Segment
              </button>
            </>
          )
        }
      />

      <SegmentFormModal
        key={formOpen ? `form-${selectedUserIds.join(",")}` : "closed"}
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        initialUserIds={selectedUserIds}
        segment={selectedUserIds.length ? { type: "Static", name: "", userIds: selectedUserIds, isNew: true } : null}
        onSave={(saved) => {
          const { isNew, ...segment } = saved;
          setSegmentsList((list) => (isNew || !list.some((item) => item.id === segment.id) ? [segment, ...list] : list.map((item) => (item.id === segment.id ? segment : item))));
          setSelectedUserIds([]);
          showSavedToast("Segment created", `"${segment.name}" is ready to use in campaigns and journeys.`);
        }}
      />

      <AddToExistingModal
        isOpen={addToExistingOpen}
        onClose={() => setAddToExistingOpen(false)}
        segments={segmentsList}
        selectedUserIds={selectedUserIds}
        onAddSuccess={(target) => {
          setSegmentsList((list) => list.map((item) => (item.id === target.id ? { ...item, userIds: [...new Set([...(item.userIds ?? []), ...selectedUserIds])], updatedAt: "Just now" } : item)));
          setSelectedUserIds([]);
        }}
      />
    </div>
  );
}
