import React from "react";
import { formatDateTime } from "@/lib/client-api";

// Live list of the rep's completed calibration sessions. Scores come from the AI once it's connected.
export default function CalibrationSessions({ calibration }) {
  const minutes = (seconds) => `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, "0")}s`;
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-light-gray shadow-xs flex flex-col gap-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-dark-black/90 font-secondary tracking-tight">Calibration</h2>
        <p className="text-xs sm:text-sm text-light-black mt-0.5">
          {calibration.sessions} completed session{calibration.sessions === 1 ? "" : "s"} · {calibration.minutes} minutes in total. Scores and round-by-round feedback appear once the AI provider is connected.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[480px]">
          <thead>
            <tr className="border-b border-light-gray text-[10.5px] font-bold text-light-black uppercase tracking-wider">
              <th className="pb-3">Completed</th>
              <th className="pb-3">Rounds</th>
              <th className="pb-3">Duration</th>
              <th className="pb-3 text-right">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-gray/60 text-xs">
            {!calibration.recent.length && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-light-black">No calibration sessions yet.</td>
              </tr>
            )}
            {calibration.recent.map((session) => (
              <tr key={session.id}>
                <td className="py-3 font-semibold text-dark-black/85">{formatDateTime(session.completedAt)}</td>
                <td className="py-3 text-dark-black/75">{session.rounds ?? "—"}</td>
                <td className="py-3 text-dark-black/75">{minutes(session.durationSeconds)}</td>
                <td className="py-3 text-right text-light-black">Needs AI</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
