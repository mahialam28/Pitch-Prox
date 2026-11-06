"use client";

import React, { useState } from "react";
import ConfirmDialog from "@/components/modals/confirm-dialog";
import { Edit2, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";

const CalibrationStatus = ({
  status = "Completed",
  completedDate = "Apr 22,2025",
  nextCalibration = "in 60days",
  onReset = () => {},
  onEdit = () => {},
  canReset = true,
}) => {
  // Resetting asks for confirmation first
  const [confirming, setConfirming] = useState(false);
  const handleReset = async () => {
    await onReset();
    toast.success("Calibration reset. The user will be asked to calibrate again.");
  };
  const completed = status === "Completed";

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full shrink-0 flex flex-col justify-between">
      {/* ── Header: Title & Edit Button ── */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="text-base font-bold text-dark-black/85 tracking-tight">
          Calibration Status
        </h3>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-light-gray bg-white hover:bg-light-gray text-xs font-semibold text-dark-black/80 transition-colors cursor-pointer shadow-2xs"
        >
          <Edit2 className="w-3 h-3 text-light-black" />
          <span>Edit</span>
        </button>
      </div>

      {/* ── Completed Status Box with Inline Reset Button ── */}
      <div className={`${completed ? "bg-[#F0FDF4] border-[#DCFCE7]" : "bg-amber-50/60 border-amber-100"} border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs">
            <RotateCcw className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-dark-black text-sm leading-tight">
              {status}
            </h4>
            <p className="text-xs text-light-black mt-0.5 font-medium">
              {completed ? `Completed on ${completedDate}` : "The user hasn't calibrated yet."}
            </p>
            {nextCalibration && (
              <p className="text-[11px] text-light-black/70 mt-0.5 italic">
                {completed ? `Next calibration ${nextCalibration}` : nextCalibration}
              </p>
            )}
          </div>
        </div>

        {canReset && completed && (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-light-gray bg-white hover:bg-light-gray text-xs font-semibold text-dark-black/85 transition-colors cursor-pointer shadow-2xs shrink-0 self-start sm:self-center"
        >
          <RotateCcw className="w-3 h-3 text-light-black" />
          <span>Reset Calibration</span>
        </button>
        )}
      </div>
      <ConfirmDialog
        isOpen={confirming}
        onClose={() => setConfirming(false)}
        title="Reset calibration?"
        message="This clears the user's calibration. They will need to complete calibration again before their AI prompts are personalized."
        confirmLabel="Reset Calibration"
        onConfirm={handleReset}
      />
    </div>
  );
};

export default CalibrationStatus;
