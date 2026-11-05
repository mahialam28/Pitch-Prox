import React from "react";

const goals = [
  {
    name: "Calls Completed",
    current: "248",
    target: "300",
    fillPercent: 82.6,
    color: "bg-[#0EADAB]",
  },
  {
    name: "Qualified Leads",
    current: "46",
    target: "55",
    fillPercent: 83.6,
    color: "bg-[#3B82F6]",
  },
  {
    name: "Revenue Target",
    current: "$124.8k",
    target: "$150k",
    fillPercent: 83.2,
    color: "bg-[#8B5CF6]",
  },
];

export default function MonthlyGoalsCard({ month = "June 2026" }) {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-4 mb-4">
          <h3 className="text-sm sm:text-base font-bold text-dark-black/90 font-secondary">
            Monthly Goals
          </h3>
          <span className="text-xs text-light-black font-normal">
            {month}
          </span>
        </div>

        {/* Goals Progress Bars */}
        <div className="flex flex-col gap-3.5">
          {goals.map((goal, idx) => (
            <div key={idx} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-dark-black/85">
                  {goal.name}
                </span>
                <span className="font-bold text-dark-black/85">
                  {goal.current} / {goal.target}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${goal.color}`}
                  style={{ width: `${goal.fillPercent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coaching Insight Callout Box */}
      <div className="mt-5 bg-purple-50/70 border border-purple-100/80 rounded-xl p-3.5 flex flex-col gap-1">
        <span className="text-[10px] font-bold text-purple-700 tracking-wider uppercase">
          COACHING INSIGHT
        </span>
        <p className="text-xs text-purple-900/90 leading-relaxed font-medium">
          Prioritize stronger closing summaries to improve the final-step conversion rate.
        </p>
      </div>
    </div>
  );
}
