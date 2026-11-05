import React from "react";

const breakdownItems = [
  { label: "Trust & Disclosure", score: 94 },
  { label: "Script Adherence", score: 91 },
  { label: "Objection Handling", score: 86 },
  { label: "Conversation Quality", score: 82 },
];

export default function ScoreBreakdownCard({ overallScore = 92, rank = "#1 of 12 reps" }) {
  // SVG circular gauge calculation
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <h3 className="text-sm sm:text-base font-bold text-dark-black/90 font-secondary">
          Score Breakdown
        </h3>

        {/* Circular Gauge + Category List */}
        <div className="flex items-center gap-6 mt-5">
          {/* Circular Score Ring */}
          <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="stroke-slate-100"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="stroke-primary transition-all duration-1000 ease-out"
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-xl font-bold text-dark-black/90 font-secondary">
              {overallScore}
            </span>
          </div>

          {/* Breakdown Items */}
          <div className="flex-1 flex flex-col gap-2.5">
            {breakdownItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-light-black font-medium">{item.label}</span>
                <span className="font-bold text-dark-black/90">{item.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Rank Banner */}
      <div className="mt-5 bg-emerald-50/70 border border-emerald-100/80 rounded-xl px-4 py-2.5 flex items-center justify-between">
        <span className="text-xs font-semibold text-emerald-800/80">
          Team Rank
        </span>
        <span className="text-xs font-bold text-emerald-700">
          {rank}
        </span>
      </div>
    </div>
  );
}
