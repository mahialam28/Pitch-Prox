"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { campaignApi, formatWhen } from "../campaign-api";

// Outbox counts (30 days) and the job runner's last pass. "Run now" is for Super Admins.
export default function FailedDeliveriesSection({ overview, canRun = false, onRan }) {
  const [running, setRunning] = useState(false);
  const mail = overview?.mail;
  const stats = [
    { id: "queued", value: mail?.queued ?? "—", label: "QUEUED", valueColor: "text-amber-600" },
    { id: "failed", value: mail?.failed ?? "—", label: "FAILED", valueColor: "text-red" },
    { id: "skipped", value: mail?.skipped ?? "—", label: "SKIPPED", valueColor: "text-dark-black/80" },
    { id: "unsub", value: overview?.suppressed ?? "—", label: "UNSUB", valueColor: "text-orange-500" },
  ];
  const run = overview?.lastRun;

  const runNow = async () => {
    setRunning(true);
    try {
      const result = await campaignApi.runJobs();
      toast.success(result.skipped ? result.skipped : `Run finished: ${result.enrolled} entered journeys, ${result.emails} journey emails, ${result.broadcasts.recipients} campaign emails.`);
      onRan?.();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight">Delivery</h3>
        {canRun && (
          <button type="button" disabled={running} onClick={runNow} className="text-xs font-semibold text-primary hover:underline cursor-pointer disabled:opacity-60">
            {running ? "Running…" : "Run now"}
          </button>
        )}
      </div>
      <div className="grid grid-cols-4 gap-2 text-center items-center divide-x divide-light-gray/60">
        {stats.map((item) => (
          <div key={item.id} className="flex flex-col items-center justify-center px-1">
            <span className={`text-xl font-bold font-secondary leading-none ${item.valueColor}`}>{item.value}</span>
            <span className="text-[10px] sm:text-[11px] font-semibold text-light-black uppercase tracking-wider mt-1.5">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-light-gray text-[11px] text-light-black space-y-1">
        <p>
          {overview?.providerConnected
            ? `Postmark connected · last 30 days: ${mail?.sent ?? 0} sent, ${mail?.delivered ?? 0} delivered, ${mail?.bounced ?? 0} bounced, ${mail?.complained ?? 0} marked as spam.`
            : "Postmark isn't connected yet: emails wait in the outbox and go out once it is."}
        </p>
        <p>
          Scheduler: {run?.finishedAt ? `last run ${formatWhen(run.finishedAt)}` : "hasn't run yet"}
          {run?.error ? <span className="text-red"> · last error: {run.error}</span> : null}
        </p>
      </div>
    </div>
  );
}
