"use client";

import React, { useState } from "react";
import AlertModal from "@/components/modals/alert-modal";

const SimulationHeader = () => {
  const [isEnding, setIsEnding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleEndCalibration = () => {
    setIsEnding(true);
    setTimeout(() => {
      setIsEnding(false);
      setShowSuccess(true);
    }, 800);
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-light-gray shadow-sm w-full">
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-bold text-dark-black/80">Simulation: FSBO</span>
          <span className="text-xs text-light-black font-medium">Round 2 of 7</span>
        </div>
      </div>
      <button
        onClick={handleEndCalibration}
        disabled={isEnding}
        className="w-full sm:w-auto px-5 py-2 rounded-xl border border-primary text-primary font-semibold text-sm hover:bg-primary/5 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isEnding ? "Ending..." : "End Calibration"}
      </button>

      {/* Success Alert */}
      <AlertModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        type="success"
        title="Calibration Complete"
        message="Your calibration has ended successfully! You can now view your results in the analytics section."
        confirmLabel="View Results"
      />
    </div>
  );
};

export default SimulationHeader;