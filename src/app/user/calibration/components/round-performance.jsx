import React from "react";
import { Check } from "lucide-react";

const RoundPerformanceTimeline = () => {
  const horizontalRounds = [
    { num: 1, score: "82%" },
    { num: 2, score: "84%" },
    { num: 3, score: "85%" },
    { num: 4, score: "87%" },
    { num: 5, score: "89%" },
    { num: 6, score: "86%" },
    { num: 7, score: "87%" },
  ];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-light-gray shadow-sm w-full flex flex-col gap-4 sm:gap-6">
      <h4 className="text-sm font-bold text-dark-black/80 tracking-tight">Round performance</h4>
      
      <div className="relative flex items-center justify-between w-full px-1 sm:px-4 overflow-x-auto py-2">
        {/* Connector solid active bar line */}
        <div className="absolute top-[18px] sm:top-[21px] left-4 sm:left-8 right-4 sm:right-8 h-[2px] sm:h-[3px] bg-primary z-0" />

        {horizontalRounds.map((round) => (
          <div key={round.num} className="relative z-10 flex flex-col items-center text-center min-w-[46px] sm:min-w-[65px]">
            {/* Checked Node circle */}
            <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-primary text-white">
              <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 stroke-[3]" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-dark-black/80 mt-2 sm:mt-3">Round {round.num}</span>
            <span className="text-[10px] sm:text-[11px] font-bold text-primary mt-0.5">{round.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoundPerformanceTimeline;