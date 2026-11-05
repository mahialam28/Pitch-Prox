import React from "react";
import { MessageSquare, Volume2, Smile, Headphones, Sliders, Zap } from "lucide-react";

const ScoreBreakdownGrid = () => {
  const metrics = [
    { label: "Word choice", score: 80, icon: MessageSquare },
    { label: "Tone/Emphasis", score: 86, icon: Headphones },
    { label: "Pacing", score: 84, icon: Volume2 },
    { label: "Pause/Filters", score: 83, icon: Sliders },
    { label: "Sentiment", score: 82, icon: Smile },
    { label: "Energy/Inflection", score: 85, icon: Zap },
  ];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-light-gray shadow-sm w-full flex flex-col gap-4 sm:gap-5">
      <h4 className="text-sm font-bold text-dark-black/80">Score breakdown</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2.5 font-medium text-dark-black/80">
                  <Icon className="h-4 w-4 text-primary/80" />
                  <span>{m.label}</span>
                </div>
                <span className="font-bold text-primary">{m.score}%</span>
              </div>
              {/* Progress track bar */}
              <div className="w-full h-2 bg-light-gray rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${m.score}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScoreBreakdownGrid;