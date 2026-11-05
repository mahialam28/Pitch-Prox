import React from "react";

const ScoreMetricsCard = () => {
  const parameters = ["Word Choice", "Tone", "Pacing", "Pause", "Sentiment", "Energy"];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-light-gray shadow-sm w-full flex flex-col gap-4">
      <div>
        <h4 className="text-xs font-bold text-dark-black/80 uppercase tracking-wider inline-block">Final score</h4>
        <span className="text-[11px] text-light-black font-medium ml-1.5">(After 7 rounds)</span>
        <div className="text-xs text-dark-black/80 font-semibold mt-3">-- Overall score</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {parameters.map((param) => (
          <div key={param} className="flex justify-between items-center bg-light-gray border border-light-gray px-4 py-3 rounded-xl text-xs text-dark-black/80 font-medium">
            <span>{param}</span>
            <span className="text-light-black font-semibold">--</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScoreMetricsCard;