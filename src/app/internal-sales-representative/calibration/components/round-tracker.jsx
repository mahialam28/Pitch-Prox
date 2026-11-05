import React from "react";
import { Info } from "lucide-react";
import Tooltip from "@/components/modals/tooltip";

const RoundTracker = () => {
  const totalRounds = [1, 2, 3, 4, 5, 6, 7];
  const completedRounds = [1, 2];

  return (
    <div className="flex flex-col gap-2 w-full bg-white px-4 sm:px-8 py-4 sm:py-5 rounded-2xl border border-light-gray shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-dark-black/80 uppercase tracking-wider">
            Calibration Rounds (Round 2 of 7)
          </span>
          <Tooltip
            title="Round Structure"
            text="Each round introduces a different response pattern, objection, or pacing challenge so PitchProX can calibrate across multiple conversational conditions."
            position="top"
            align="start"
          >
            <Info className="w-3.5 h-3.5 text-light-black/60 hover:text-primary transition-colors cursor-pointer" />
          </Tooltip>
        </div>
        <span className="text-[11px] text-light-black hidden md:inline">
          Each round introduces a different response pattern, objection, or pacing challenge
        </span>
      </div>

      <div className="relative flex items-center justify-between w-full pt-2 pb-1 overflow-x-auto">
        {/* Background Line */}
        <div className="absolute top-1/2 left-8 sm:left-12 right-8 sm:right-12 h-[2px] bg-light-gray -translate-y-1/2 z-0" />

        {totalRounds.map((round) => {
          const isCompleted = completedRounds.includes(round);
          return (
            <div key={round} className="relative z-10 flex items-center justify-center">
              <div
                className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full text-[11px] sm:text-sm font-bold transition-all duration-200 ${
                  isCompleted
                    ? "bg-primary text-white"
                    : "bg-white border-2 border-light-black text-light-black"
                }`}
              >
                {round}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoundTracker;