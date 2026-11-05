"use client";

import { usePortal } from "@/components/shared/use-portal";
import React from "react";
import { useRouter } from "next/navigation";
import ProspectForm from "../components/prospect-form";
import { apiRequest } from "@/lib/client-api";
import { showError, showSuccess } from "@/lib/alerts";

export default function AddProspectsPage() {
  const portal = usePortal();
  const router = useRouter();

  const createProspect = async (values) => {
    try {
      await apiRequest("/api/v1/crm/prospects", { method: "POST", body: values });
    } catch (error) {
      await showError("Prospect not saved", error.message);
      throw error;
    }
    await showSuccess("Prospect saved", "The new prospect has been added to your CRM.");
    router.push(`${portal.base}/crm`);
  };

  return (
    <ProspectForm
      title="Add New Prospects"
      description="Enter the details of the new prospect to start tracking their progress."
      submitLabel="Save Prospect"
      onSubmit={createProspect}
    />
  );
}
