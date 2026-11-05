"use client";

import React, { useState } from "react";
import EvidenceHeader from "./components/evidence-header";
import EvidenceRepositoryTable from "./components/evidence-repository-table";
import EvidenceByType from "./components/evidence-by-type";
import RecentUploads from "./components/recent-uploads";
import UploadEvidenceModal from "./components/upload-evidence-modal";
import EvidenceDetailsModal from "./components/evidence-details-modal";
import EditEvidenceModal from "./components/edit-evidence-modal";
import { initialEvidenceItems } from "./evidence-data";

export default function EvidenceRepositoryPage() {
  const [evidenceList, setEvidenceList] = useState(initialEvidenceItems);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedEvidenceForDetails, setSelectedEvidenceForDetails] = useState(null);
  const [selectedEvidenceForEdit, setSelectedEvidenceForEdit] = useState(null);

  const handleUploadSuccess = (newDoc) => {
    setEvidenceList((prev) => [newDoc, ...prev]);
  };

  const handleSaveEditSuccess = (updatedDoc) => {
    setEvidenceList((prev) =>
      prev.map((item) => (item.id === updatedDoc.id ? updatedDoc : item))
    );
  };

  const handleDeleteEvidence = (id) => {
    setEvidenceList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleOpenEditFromDetails = (evidence) => {
    setSelectedEvidenceForDetails(null);
    setSelectedEvidenceForEdit(evidence);
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      {/* ── 1. Page Header & 3 Metric KPI Cards ── */}
      <EvidenceHeader />

      {/* ── 2. Main 2-Column Section (Table + Right Breakdown Cards) ── */}
      <div className="flex flex-col gap-6 w-full">
        {/* Table at full width so every column and the Upload button fit */}
        <div className="w-full min-w-0">
          <EvidenceRepositoryTable
            evidenceList={evidenceList}
            onSelectEvidence={(item) => setSelectedEvidenceForDetails(item)}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
          />
        </div>

        {/* Evidence by Type & Recent Uploads, below the table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <EvidenceByType />
          <RecentUploads />
        </div>
      </div>

      {/* ── 3. Upload Evidence Modal ── */}
      <UploadEvidenceModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* ── 4. Evidence Details Modal ── */}
      <EvidenceDetailsModal
        isOpen={Boolean(selectedEvidenceForDetails)}
        evidence={selectedEvidenceForDetails}
        onClose={() => setSelectedEvidenceForDetails(null)}
        onEdit={handleOpenEditFromDetails}
        onDelete={handleDeleteEvidence}
        onUpdate={handleSaveEditSuccess}
      />

      {/* ── 5. Edit Evidence Modal ── */}
      <EditEvidenceModal
        key={selectedEvidenceForEdit?.id ?? "closed"}
        isOpen={Boolean(selectedEvidenceForEdit)}
        evidence={selectedEvidenceForEdit}
        onClose={() => setSelectedEvidenceForEdit(null)}
        onSaveSuccess={handleSaveEditSuccess}
      />
    </div>
  );
}
