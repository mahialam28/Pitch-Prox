"use client";

import React, { useCallback, useEffect, useState } from "react";
import CrmHeader from "./components/crm-header";
import CrmHistory from "./components/crm-history";
import CrmDetailsModal from "./components/crm-details-modal";
import { apiRequest } from "@/lib/client-api";
import { showError, showSuccess } from "@/lib/alerts";
import { toTableRow } from "@/utils.js/records";

export default function CrmPage() {
  const [prospects, setProspects] = useState([]);
  const [selectedProspect, setSelectedProspect] = useState(null);

  const loadProspects = useCallback(() => {
    return apiRequest("/api/v1/crm/prospects")
      .then((data) => setProspects(data.results.map(toTableRow)))
      .catch((error) => showError("Prospects not loaded", error.message));
  }, []);

  useEffect(() => { loadProspects(); }, [loadProspects]);

  // Replace one prospect with the server's copy (table and open modal)
  const applyProspect = (prospect) => {
    const row = toTableRow(prospect);
    setProspects((prev) => prev.map((item) => (item.id === row.id ? row : item)));
    setSelectedProspect((current) => (current?.id === row.id ? row : current));
  };

  // Save an inline change; stage moves use the dedicated endpoint. Rolls back on failure.
  const updateProspect = async (prospectId, changes) => {
    const previous = prospects;
    setProspects((prev) => prev.map((item) => (item.id === prospectId ? { ...item, ...changes } : item)));
    try {
      const { prospect } = changes.stage
        ? await apiRequest(`/api/v1/crm/prospects/${prospectId}/move`, { method: "POST", body: { stage: changes.stage } })
        : await apiRequest(`/api/v1/crm/prospects/${prospectId}`, { method: "PATCH", body: changes });
      applyProspect(prospect);
    } catch (error) {
      setProspects(previous);
      showError("Prospect not updated", error.message);
    }
  };

  const deleteProspect = async (prospect) => {
    try {
      await apiRequest(`/api/v1/crm/prospects/${prospect.id}`, { method: "DELETE" });
      await loadProspects();
    } catch (error) {
      showError("Prospect not deleted", error.message);
    }
  };

  // Save imported rows one by one; rows the server rejects are reported, not dropped silently
  const importProspects = async (rows, { addToFollowUp = false } = {}) => {
    // Next day at 9:00 AM for "Add imported prospects to follow up queue"
    const followUpAt = new Date();
    followUpAt.setDate(followUpAt.getDate() + 1);
    followUpAt.setHours(9, 0, 0, 0);
    const results = await Promise.allSettled(rows.map(async ({ name, phoneNumber, email, propertyAddress, city, state, zipCode, stage, status, leadType, outcome }) => {
      const { prospect } = await apiRequest("/api/v1/crm/prospects", {
        method: "POST",
        body: { name, phoneNumber, email, propertyAddress, city, state, zipCode, stage, status, leadType: leadType || null, outcome: outcome || null },
      });
      if (addToFollowUp) {
        await apiRequest(`/api/v1/crm/prospects/${prospect.id}/follow-ups`, { method: "POST", body: { followUpAt: followUpAt.toISOString() } });
      }
    }));
    const failed = results.filter((result) => result.status === "rejected");
    await loadProspects();
    if (failed.length) {
      showError("Some prospects were not imported", `${rows.length - failed.length} of ${rows.length} imported. First problem: ${failed[0].reason.message}`);
    } else {
      showSuccess("Prospects imported", `${rows.length} prospect${rows.length === 1 ? "" : "s"} added to your CRM${addToFollowUp ? " and the follow up queue" : ""}.`);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6">
      <CrmHeader />
      <CrmHistory
        onSelectProspect={setSelectedProspect}
        prospects={prospects}
        onUpdateProspect={updateProspect}
        onDeleteProspect={deleteProspect}
        onImportProspects={importProspects}
      />
      <CrmDetailsModal
        isOpen={!!selectedProspect}
        prospect={selectedProspect}
        onClose={() => setSelectedProspect(null)}
        onProspectChange={applyProspect}
        onDelete={async (prospect) => {
          setSelectedProspect(null);
          if (prospect) await deleteProspect(prospect);
        }}
      />
    </div>
  );
}
