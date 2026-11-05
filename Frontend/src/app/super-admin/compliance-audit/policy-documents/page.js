"use client";

import React from "react";
import ComplianceHeader from "./components/compliance-header";
import AllPolicyDocuments from "./components/all-policy-documents";
import PendingApprovals from "./components/pending-approvals";
import TrainingAcknowledgment from "./components/training-acknowledgment";
import PolicyAcknowledgmentBanner from "./components/policy-acknowledgment-banner";

export default function PolicyDocumentsPage() {
  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      {/* ── 1. Page Header & 5 Metric KPI Cards ── */}
      <ComplianceHeader />

      {/* ── 2. Main 2-Column Section (All Policies Table + Pending Approvals & Training Cards) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        {/* Left Column: All Policy Documents Table */}
        <div className="lg:col-span-8 xl:col-span-8 2xl:col-span-9 w-full">
          <AllPolicyDocuments />
        </div>

        {/* Right Column: Pending Approvals & Training Acknowledgment */}
        <div className="lg:col-span-4 xl:col-span-4 2xl:col-span-3 flex flex-col gap-6 w-full">
          <PendingApprovals />
          <TrainingAcknowledgment />
        </div>
      </div>

      {/* ── 3. Bottom Banner Card (Policy Acknowledgment Required) ── */}
      <PolicyAcknowledgmentBanner />
    </div>
  );
}
