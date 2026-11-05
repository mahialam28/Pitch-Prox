import React from "react";

const categories = [
  {
    name: "Lead Qualification",
    score: 92,
    tag: "92% • Excellent",
    color: "bg-[#0EADAB]",
    tagColor: "text-[#0EADAB]",
  },
  {
    name: "Needs Discovery",
    score: 88,
    tag: "88% • Strong",
    color: "bg-[#06B6D4]",
    tagColor: "text-[#0891B2]",
  },
  {
    name: "Objection Handling",
    score: 84,
    tag: "84% • Improving",
    color: "bg-[#3B82F6]",
    tagColor: "text-[#2563EB]",
  },
  {
    name: "Closing & Next Steps",
    score: 79,
    tag: "79% • Focus area",
    color: "bg-[#F59E0B]",
    tagColor: "text-[#D97706]",
  },
];

export default function PerformanceByCategory({ totalCalls = 248 }) {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <h3 className="text-sm sm:text-base font-bold text-dark-black/90 font-secondary">
          Performance by Category
        </h3>
        <span className="text-xs text-light-black font-normal">
          Based on {totalCalls} calls
        </span>
      </div>

      {/* Categories Progress List */}
      <div className="flex flex-col gap-4">
        {categories.map((cat, idx) => (
          <div key={idx} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-dark-black/85">
                {cat.name}
              </span>
              <span className={`font-bold ${cat.tagColor}`}>
                {cat.tag}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${cat.color}`}
                style={{ width: `${cat.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
