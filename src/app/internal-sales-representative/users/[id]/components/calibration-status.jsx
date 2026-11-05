"use client";

import React, { useState } from "react";
import ConfirmDialog from "@/components/modals/confirm-dialog";
import { Edit2, RotateCcw, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

const CalibrationStatus = ({
  status = "Completed",
  completedDate = "Apr 22, 2025",
  nextCalibration = "in 60days",
  onReset = () => { },
  onEdit = () => { },
}) => {
  // Resetting asks for confirmation first
  const [confirming, setConfirming] = useState(false);
  const handleReset = () => {
    onReset();
    toast.success("Calibration reset. The user will be asked to calibrate again.");
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full flex flex-col justify-between">
      {/* ── Header: Title & Edit Button ── */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-base font-bold text-dark-black/85 tracking-tight">
          Calibration Status
        </h3>
        <button
          type="button"
          onClick={() => {
            onEdit();
            toast("Opening calibration editor...");
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-light-gray bg-white hover:bg-light-gray text-xs font-semibold text-dark-black/80 transition-colors cursor-pointer shadow-2xs"
        >
          <Edit2 className="w-3 h-3 text-light-black" />
          <span>Edit</span>
        </button>
      </div>

      {/* ── Completed Status Box ── */}
      <div className="bg-[#F0FDF4] border border-emerald-100 rounded-xl p-4 flex items-center gap-3.5 mb-5">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
          <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-dark-black text-sm leading-tight">
              {status}
            </h4>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 uppercase tracking-wide">
              Active
            </span>
          </div>
          <p className="text-xs text-light-black mt-0.5 font-medium">
            Completed on {completedDate}
          </p>
          <p className="text-[11px] text-light-black/70 mt-0.5">
            Next calibration {nextCalibration}
          </p>
        </div>
      </div>

      {/* ── Action Button: Reset Calibration (Positioned below status like other cards) ── */}
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="mt-auto w-full py-2 px-3 rounded-xl border border-light-gray bg-white hover:bg-light-gray text-xs font-semibold text-dark-black/85 transition-colors cursor-pointer text-center shadow-2xs flex items-center justify-center gap-2"
      >
        <RotateCcw className="w-3.5 h-3.5 text-light-black" />
        <span>Reset Calibration</span>
      </button>
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
