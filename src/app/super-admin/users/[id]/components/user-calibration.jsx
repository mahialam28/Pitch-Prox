"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import CalibrationStats from "./calibration-stats";
import CalibrationModules, { CALIBRATION_MODULES_DATA } from "./calibration-modules";
import CalibrationNotes from "./calibration-notes";
import CalibrationSettings from "./calibration-settings";
import CalibrationInsights from "./calibration-insights";
import CalibrationHistory from "./calibration-history";
import CalibrationModuleModal from "./calibration-module-modal";
import AlertModal from "@/components/modals/alert-modal";
import AuditInfo from "./audit-info";

export default function UserCalibration() {
  const [selectedModule, setSelectedModule] = useState(null);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isResetAlertOpen, setIsResetAlertOpen] = useState(false);

  // Handlers
  const handleSelectModule = (moduleData) => {
    setSelectedModule(moduleData);
    setIsModuleModalOpen(true);
  };

  const handleConfirmReset = () => {
    setIsResetAlertOpen(false);
    toast.success("Calibration reset initiated. User will be notified to re-calibrate.");
  };

  return (
    <div className="w-full min-w-0 flex flex-col gap-6 pb-6">
      {/* ── 1. Top Stat Cards: Full Width Spacing (4 spacious boxes) ── */}
      <CalibrationStats
        onResetCalibration={() => setIsResetAlertOpen(true)}
        onStartEarly={() =>
          toast.success("Starting an early calibration session...")
        }
      />

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* MAIN 2-COLUMN LAYOUT                                        */}
      {/* ═════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start w-full min-w-0">
        {/* ── LEFT COLUMN (8 cols): Modules Table + Notes ── */}
        <div className="xl:col-span-8 flex flex-col gap-6 w-full min-w-0">
          {/* 2. Calibration Modules Card */}
          <CalibrationModules
            modules={CALIBRATION_MODULES_DATA}
            overallScore={92}
            onSelectModule={handleSelectModule}
          />

          {/* 3. Calibration Notes Card */}
          <CalibrationNotes />
        </div>

        {/* ── RIGHT COLUMN (4 cols): Settings (Moved Down) + Insights + History ── */}
        <div className="xl:col-span-4 flex flex-col gap-6 w-full min-w-0">
          {/* 1. Calibration Settings Card */}
          <CalibrationSettings />

          {/* 2. Calibration Insights Card */}
          <CalibrationInsights />

          {/* 3. Calibration History Card */}
          <CalibrationHistory
            onSelectHistory={(item) =>
              toast.success(`Viewing calibration report for ${item.date} (${item.score}/100).`)
            }
          />
        </div>
      </div>

      {/* ── Footer Audit Info ── */}
      <AuditInfo />

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* MODALS                                                       */}
      {/* ═════════════════════════════════════════════════════════════ */}

      {/* 1. Module Detail Modal */}
      <CalibrationModuleModal
        isOpen={isModuleModalOpen}
        onClose={() => setIsModuleModalOpen(false)}
        module={selectedModule}
      />

      {/* 2. Reset Calibration Alert Modal */}
      <AlertModal
        isOpen={isResetAlertOpen}
        onClose={() => setIsResetAlertOpen(false)}
        type="warning"
        title="Reset Calibration?"
        message="Are you sure you want to reset this user's voice calibration? They will be prompted to re-complete all 5 calibration modules."
        confirmLabel="Reset Calibration"
        onConfirm={handleConfirmReset}
      />
    </div>
  );
}
