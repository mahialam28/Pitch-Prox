"use client";

import React, { useCallback, useEffect, useState } from "react";
import ComplianceHeader from "./components/compliance-header";
import AllPolicyDocuments from "./components/all-policy-documents";
import PendingApprovals from "./components/pending-approvals";
import TrainingAcknowledgment from "./components/training-acknowledgment";
import PolicyAcknowledgmentBanner from "./components/policy-acknowledgment-banner";
import { apiRequest } from "@/lib/client-api";
import { showError } from "@/lib/alerts";

export default function PolicyDocumentsPage() {
  const [data, setData] = useState(null);

  const load = useCallback(
    () => apiRequest("/api/v1/compliance/policies").then(setData).catch((error) => showError("Policies not loaded", error.message)),
    []
  );
  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      <ComplianceHeader stats={data?.stats} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        <div className="lg:col-span-8 xl:col-span-8 2xl:col-span-9 w-full min-w-0">
          <AllPolicyDocuments data={data} onChanged={load} />
        </div>
        <div className="lg:col-span-4 xl:col-span-4 2xl:col-span-3 flex flex-col gap-6 w-full">
          <PendingApprovals items={data?.pendingApprovals} />
          <TrainingAcknowledgment />
        </div>
      </div>

      <PolicyAcknowledgmentBanner overdueCount={data?.stats.overdueEmployees} canRemind={Boolean(data?.permissions.manage)} />
    </div>
  );
}
