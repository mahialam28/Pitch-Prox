"use client";

import React from "react";
import CallReport from "./call-report";
import CallSummary from "./call-summary";
import { PerformanceMetrics } from "./performance";
import { ConversionIndicators } from "./conversion";
import { AgentSentiment } from "./agent-sentiment";

const CallReportDetails = () => {
  return (
    <div className="w-full flex flex-col gap-6">
      <CallReport />
      <CallSummary />
      <PerformanceMetrics />
      <ConversionIndicators />
      <AgentSentiment/>
    </div>
  );
};

export default CallReportDetails;
