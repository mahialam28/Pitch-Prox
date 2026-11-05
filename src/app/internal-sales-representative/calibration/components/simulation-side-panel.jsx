import React from "react";
import { PlayCircle, Layers, Info } from "lucide-react";
import Tooltip from "@/components/modals/tooltip";

const SimulationSidePanel = () => {
  const timeline = [
    { round: "Round 1", status: "Completed", time: "00:35", styles: "bg-light-teal text-primary" },
    { round: "Round 2", status: "In progress", time: "", styles: "bg-[#FFF4EB] text-orange-500 border border-orange-100" },
    { round: "Round 3", status: "Pending", time: "", styles: "bg-light-gray text-light-black" },
    { round: "Round 4", status: "Pending", time: "", styles: "bg-light-gray text-light-black" },
    { round: "Round 5", status: "Pending", time: "", styles: "bg-light-gray text-light-black" },
    { round: "Round 6", status: "Pending", time: "", styles: "bg-light-gray text-light-black" },
    { round: "Round 7", status: "Pending", time: "", styles: "bg-light-gray text-light-black" },
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Session Status Box */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-light-gray shadow-sm flex flex-col gap-3">
        <h4 className="text-xs font-bold text-dark-black/80 uppercase tracking-wider">Session Status</h4>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-light-gray border border-light-gray text-dark-black/80">
            <PlayCircle className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium">Listening for your response</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-light-gray border border-light-gray text-dark-black/80">
            <Layers className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium">Objection audio queued</span>
          </div>
        </div>
      </div>

      {/* Round Timeline Box */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-light-gray shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-dark-black/80 uppercase tracking-wider">Round timeline</h4>
          <Tooltip
            title="Round Structure"
            text="Each round introduces a different response pattern, objection, or pacing challenge so PitchProX can calibrate across multiple conversational conditions."
            position="top"
            align="end"
          >
            <Info className="w-3.5 h-3.5 text-light-black/60 hover:text-primary transition-colors cursor-pointer" />
          </Tooltip>
        </div>
        <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
          {timeline.map((t, index) => (
            <div key={index} className={`flex justify-between items-center px-4 py-3 rounded-xl text-xs font-semibold ${t.styles}`}>
              <span>{t.round}</span>
              <div className="flex items-center gap-4">
                <span>{t.status}</span>
                {t.time && <span className="font-mono font-medium opacity-80">{t.time}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimulationSidePanel;