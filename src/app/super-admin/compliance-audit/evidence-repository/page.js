"use client";

import React, { useCallback, useEffect, useState } from "react";
import EvidenceHeader from "./components/evidence-header";
import EvidenceRepositoryTable from "./components/evidence-repository-table";
import EvidenceByType from "./components/evidence-by-type";
import RecentUploads from "./components/recent-uploads";
import UploadEvidenceModal from "./components/upload-evidence-modal";
import EvidenceDetailsModal from "./components/evidence-details-modal";
import { apiRequest } from "@/lib/client-api";
import { showError } from "@/lib/alerts";

export default function EvidenceRepositoryPage() {
  const [data, setData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [detailsId, setDetailsId] = useState(null);
  const [editing, setEditing] = useState(null);

  const load = useCallback(() => apiRequest("/api/v1/compliance/evidence").then(setData).catch((error) => showError("Evidence not loaded", error.message)), []);
  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      <EvidenceHeader stats={data?.stats} />

      <div className="flex flex-col gap-6 w-full">
        <div className="w-full min-w-0">
          <EvidenceRepositoryTable data={data} onSelectEvidence={(item) => setDetailsId(item.id)} onOpenUploadModal={() => setUploading(true)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <EvidenceByType byType={data?.byType} />
          <RecentUploads recent={data?.recent} onSelect={setDetailsId} />
        </div>
      </div>

      {uploading && (
        <UploadEvidenceModal
          isOpen
          controls={data?.controls ?? []}
          owners={data?.owners ?? []}
          onClose={() => setUploading(false)}
          onSaved={(result) => {
            load();
            setDetailsId(result.evidence.id);
          }}
        />
      )}

      {detailsId && (
        <EvidenceDetailsModal
          key={detailsId}
          evidenceId={detailsId}
          onClose={() => setDetailsId(null)}
          onChanged={load}
          onEdit={(evidence) => {
            setDetailsId(null);
            setEditing(evidence);
          }}
        />
      )}

      {editing && (
        <UploadEvidenceModal
          isOpen
          evidence={editing}
          controls={data?.controls ?? []}
          owners={data?.owners ?? []}
          onClose={() => setEditing(null)}
          onSaved={(result) => {
            load();
            setDetailsId(result.evidence.id);
          }}
        />
      )}
    </div>
  );
}
