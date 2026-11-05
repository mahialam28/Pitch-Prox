"use client";

import React, { useState } from "react";
import CallsTabHeader from "./calls-tab-header";
import CallsStats from "./calls-stats";
import CallsTable from "./calls-table";

export default function CallsTab({ rep }) {
  const repName = rep?.name || "Ryan Anderson";
  const [prospectType, setProspectType] = useState("All Prospect Types");
  const [outcome, setOutcome] = useState("All Outcomes");
  const [purpose, setPurpose] = useState("All Purposes");

  const handleResetFilters = () => {
    setProspectType("All Prospect Types");
    setOutcome("All Outcomes");
    setPurpose("All Purposes");
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-200">
      {/* 1. Header with Title & Filter Controls */}
      <CallsTabHeader
        repName={repName}
        prospectType={prospectType}
        setProspectType={setProspectType}
        outcome={outcome}
        setOutcome={setOutcome}
        purpose={purpose}
        setPurpose={setPurpose}
        onResetFilters={handleResetFilters}
      />

      {/* 2. 5 Primary Metric Cards */}
      <CallsStats />

      {/* 3. Calls Data Table */}
      <CallsTable
        prospectType={prospectType}
        outcome={outcome}
        purpose={purpose}
      />
    </div>
  );
}
