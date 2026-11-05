"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import SegmentsStats from "./segments-stats";
import SavedSegments from "./saved-segments";
import LeadsSelectionTable from "./leads-selection-table";
import CreateSegmentModal from "./create-segment-modal";
import AddToExistingModal from "./add-to-existing-modal";
import { SAVED_SEGMENTS, INITIAL_LEADS } from "../segments-data";

export default function SegmentsSection() {
  const [segmentsList, setSegmentsList] = useState(SAVED_SEGMENTS);
  const [leadsList, setLeadsList] = useState(INITIAL_LEADS);
  const [selectedLeadIds, setSelectedLeadIds] = useState(["lead-1", "lead-3", "lead-5"]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [addToExistingModalOpen, setAddToExistingModalOpen] = useState(false);

  // Toggle single lead selection
  const handleToggleSelectLead = (id) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Clear all selected leads
  const handleClearSelection = () => {
    setSelectedLeadIds([]);
  };

  // Selected lead objects
  const selectedLeads = leadsList.filter((lead) =>
    selectedLeadIds.includes(lead.id)
  );

  // Handle new segment creation from modal
  const handleCreateSegmentSuccess = (newSegment) => {
    setSegmentsList((prev) => [newSegment, ...prev]);
    // Optionally update leads segment tag
    setLeadsList((prev) =>
      prev.map((l) =>
        selectedLeadIds.includes(l.id) ? { ...l, segment: newSegment.name } : l
      )
    );
  };

  // Handle adding leads to existing segment
  const handleAddToExistingSuccess = (targetSegment) => {
    setLeadsList((prev) =>
      prev.map((l) =>
        selectedLeadIds.includes(l.id)
          ? { ...l, segment: targetSegment.name }
          : l
      )
    );
  };

  return (
    <div className="w-full flex flex-col gap-7">
      {/* 1. Header Toolbar */}
      <div className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-lg sm:text-xl font-bold text-dark-black/85 tracking-tight">
            Lead Segments
          </h2>
          <p className="text-xs sm:text-[13px] text-light-black">
            Create and manage targeted lead groups for campaigns and automated journeys.
          </p>
        </div>

        {/* Create New Segment Button */}
        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-medium-teal text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer ml-auto lg:ml-0"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Create New Segment</span>
        </button>
      </div>

      {/* 2. Top 4 Metric KPI Cards */}
      <SegmentsStats />

      {/* 3. Saved Segments Cards Grid */}
      <SavedSegments
        segments={segmentsList}
        onSelectSegment={(seg) => {
          // When a segment is clicked, filter or view
        }}
      />

      {/* 4. Select Leads Interactive Section */}
      <LeadsSelectionTable
        leads={leadsList}
        selectedLeadIds={selectedLeadIds}
        onToggleSelectLead={handleToggleSelectLead}
        onClearSelection={handleClearSelection}
        onCreateSegment={() => setCreateModalOpen(true)}
        onAddToExisting={() => setAddToExistingModalOpen(true)}
      />

      {/* 5. Create Segment Modal */}
      <CreateSegmentModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        selectedLeads={selectedLeads}
        onCreateSuccess={handleCreateSegmentSuccess}
      />

      {/* 6. Add to Existing Segment Modal */}
      <AddToExistingModal
        isOpen={addToExistingModalOpen}
        onClose={() => setAddToExistingModalOpen(false)}
        selectedLeads={selectedLeads}
        onAddSuccess={handleAddToExistingSuccess}
      />
    </div>
  );
}
