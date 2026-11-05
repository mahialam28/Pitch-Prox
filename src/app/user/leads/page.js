"use client";

import React, { useCallback, useEffect, useState } from "react";
import LeadsHeader from "./components/leads-header";
import LeadsHistory from "./components/leads-history";
import LeadDetailsModal from "./components/lead-details-modal";
import { apiRequest } from "@/lib/client-api";
import { showError } from "@/lib/alerts";
import { toTableRow } from "@/utils.js/records";

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);

  const loadLeads = useCallback(() => {
    return apiRequest("/api/v1/leads")
      .then((data) => setLeads(data.results.map(toTableRow)))
      .catch((error) => showError("Leads not loaded", error.message));
  }, []);

  useEffect(() => { loadLeads(); }, [loadLeads]);

  // Save an inline change (stage/status/outcome); roll back if the server rejects it
  const updateLead = async (leadId, changes) => {
    const previous = leads;
    setLeads((prev) => prev.map((lead) => (lead.id === leadId ? { ...lead, ...changes } : lead)));
    try {
      const { lead } = await apiRequest(`/api/v1/leads/${leadId}`, { method: "PATCH", body: changes });
      setLeads((prev) => prev.map((item) => (item.id === leadId ? toTableRow(lead) : item)));
      return true;
    } catch (error) {
      setLeads(previous);
      showError("Lead not updated", error.message);
      return false;
    }
  };

  const deleteLead = async (lead) => {
    try {
      await apiRequest(`/api/v1/leads/${lead.id}`, { method: "DELETE" });
      await loadLeads();
    } catch (error) {
      showError("Lead not deleted", error.message);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6">
      <LeadsHeader />
      <LeadsHistory
        onSelectLead={setSelectedLead}
        leads={leads}
        onUpdateLead={updateLead}
        onDeleteLead={deleteLead}
      />
      <LeadDetailsModal
        isOpen={!!selectedLead}
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdateLead={async (leadId, changes) => {
          setSelectedLead((current) => (current?.id === leadId ? { ...current, ...changes } : current));
          return updateLead(leadId, changes);
        }}
        onLeadChange={(lead) => {
          const row = toTableRow(lead);
          setLeads((prev) => prev.map((item) => (item.id === row.id ? row : item)));
          setSelectedLead(row);
        }}
        onDelete={async (lead) => {
          setSelectedLead(null);
          if (lead) await deleteLead(lead);
        }}
      />
    </div>
  );
}
