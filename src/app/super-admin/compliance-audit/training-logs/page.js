"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import TrainingStats from "./components/training-stats";
import TrainingTable from "./components/training-table";
import UpcomingExpirations from "./components/upcoming-expirations";
import CompletionOverview from "./components/completion-overview";
import QuickActions from "./components/quick-actions";
import CreateTrainingModal from "./components/create-training-modal";
import { apiRequest } from "@/lib/client-api";
import { showError } from "@/lib/alerts";

export default function TrainingLogsPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const load = useCallback(
    () => apiRequest("/api/v1/compliance/training").then(setData).catch((error) => showError("Training not loaded", error.message)),
    []
  );
  useEffect(() => {
    load();
  }, [load]);

  const canManage = Boolean(data?.permissions.manage);

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-dark-black font-secondary tracking-tight">Training Logs</h1>
        <p className="text-xs sm:text-sm text-medium-black">Track employee training assignments, completions, and compliance acknowledgments.</p>
      </div>

      <TrainingStats stats={data?.stats} />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-8 w-full min-w-0">
          <TrainingTable data={data} onChanged={load} />
        </div>

        <div className="xl:col-span-4 w-full min-w-0 flex flex-col gap-6">
          {/* Create Training sits above Upcoming Due Dates (client item) */}
          {canManage && (
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary hover:bg-[#0c9593] text-white text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Create Training
            </button>
          )}
          <UpcomingExpirations upcoming={data?.upcoming} onViewAll={() => router.push("/super-admin/compliance-audit/training-logs/export-report")} />
          <CompletionOverview statuses={data?.statuses} onViewReport={() => router.push("/super-admin/compliance-audit/training-logs/export-report")} />
          <QuickActions />
        </div>
      </div>

      {isCreateModalOpen && (
        <CreateTrainingModal
          isOpen
          onClose={() => setIsCreateModalOpen(false)}
          onSaved={() => {
            setIsCreateModalOpen(false);
            load();
          }}
        />
      )}
    </div>
  );
}
