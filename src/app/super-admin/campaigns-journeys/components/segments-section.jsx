"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import SegmentsStats from "./segments-stats";
import SavedSegments from "./saved-segments";
import UsersTable from "./users-table";
import SegmentFormModal from "./segment-form-modal";
import AddToExistingModal from "./add-to-existing-modal";
import { showSavedToast } from "@/lib/toast";
import { useApi, useCanManage } from "../campaign-api";

// User Segments (live): groups of PitchProX customers for broadcast campaigns and journeys.
// Membership is worked out on the server from the same rules shown here.
export default function SegmentsSection() {
  const { data, error, reload } = useApi("/api/v1/campaigns/segments");
  const canManage = useCanManage();
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [dialog, setDialog] = useState(null); // "form" | "add"

  const users = data?.users ?? [];
  const segments = data?.segments ?? [];
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
        {canManage && (
          <button
            type="button"
            onClick={() => {
              setSelectedUserIds([]);
              setDialog("form");
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-medium-teal text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer ml-auto lg:ml-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create New Segment</span>
          </button>
        )}
      </div>

      {error && !data && <p className="text-sm text-red-600">{error}</p>}

      <SegmentsStats segments={segments} userCount={users.length} />

      <SavedSegments segments={segments} />

      <UsersTable
        title="All Users"
        subtitle={canManage ? "Select users to build a Static segment or add them to an existing Static segment." : "PitchProX customer users."}
        users={users}
        segments={segments}
        loading={!data}
        selectable={canManage}
        selectedIds={selectedUserIds}
        onToggle={toggleUser}
        actions={
          selectedUserIds.length > 0 && (
            <>
              <span className="text-xs font-semibold text-primary">{selectedUserIds.length} selected</span>
              <button type="button" onClick={() => setDialog("add")} className="h-9 px-3 rounded-xl border border-primary text-primary text-xs font-semibold hover:bg-primary/5 cursor-pointer">
                Add to Static Segment
              </button>
              <button type="button" onClick={() => setDialog("form")} className="h-9 px-3 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-medium-teal cursor-pointer">
                Create Static Segment
              </button>
            </>
          )
        }
      />

      {dialog === "form" && (
        <SegmentFormModal
          isOpen
          users={users}
          plans={data?.plans ?? []}
          onClose={() => setDialog(null)}
          initialUserIds={selectedUserIds}
          segment={selectedUserIds.length ? { type: "Static", name: "", userIds: selectedUserIds, isNew: true } : null}
          onSave={(segment) => {
            setSelectedUserIds([]);
            showSavedToast("Segment created", `"${segment.name}" is ready to use in campaigns and journeys.`);
            reload();
          }}
        />
      )}

      {dialog === "add" && (
        <AddToExistingModal
          isOpen
          onClose={() => setDialog(null)}
          segments={segments}
          selectedUserIds={selectedUserIds}
          onAddSuccess={() => {
            setSelectedUserIds([]);
            reload();
          }}
        />
      )}
    </div>
  );
}
