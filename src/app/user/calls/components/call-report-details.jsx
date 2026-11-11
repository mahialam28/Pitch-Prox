"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import CallReportView from "@/components/calls/call-report-view";

// /user/calls/report?id=<call id>[&print=1]: the real post-call report (AI-4)
function ReportForCall() {
  const params = useSearchParams();
  const callId = params.get("id");
  if (!callId) {
    return (
      <div className="rounded-2xl border border-light-gray bg-white p-8 text-center">
        <p className="text-sm text-medium-black">Choose a call to see its report.</p>
        <Link href="/user/calls" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">Go to Call History</Link>
      </div>
    );
  }
  return <CallReportView key={callId} callId={callId} autoPrint={params.get("print") === "1"} />;
}

const CallReportDetails = () => (
  <Suspense fallback={<div className="min-h-[40vh]" aria-busy="true" />}>
    <ReportForCall />
  </Suspense>
);

export default CallReportDetails;
