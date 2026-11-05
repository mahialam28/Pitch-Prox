"use client";

import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { apiRequest } from "@/lib/client-api";
// Simulator View Components
import Calibration from "./components/calibration";
import CalibrationHeader from "./components/calibration-header";
import SimulationHeader from "./components/simulator-header";
import RoundTracker from "./components/round-tracker";
import AudioPlayerCard from "./components/audio-player";
import TeleprompterCard from "./components/teleprompter";
import RecorderCard from "./components/recorder";
import SimulationSidePanel from "./components/simulation-side-panel";
import ScoreMetricsCard from "./components/score-matrix";

// Calibration Completed View Components
import ResultsBanner from "./components/result-banner";
import ResultsOverview from "./components/results-overview";
import RoundPerformanceTimeline from "./components/round-performance";
import ScoreBreakdownGrid from "./components/score-breakdown";
import WhatsNextCard from "./components/what-next";

export default function CalibrationPage() {
  const [isCompleted, setIsCompleted] = useState(false);
  const startedAtRef = useRef(null);

  useEffect(() => {
    if (!isCompleted) startedAtRef.current = Date.now();
  }, [isCompleted]);

  // View state handlers. Ending saves the session (when and how long); the
  // scores shown afterwards are samples until an AI provider is connected.
  const handleEndCalibration = () => {
    if (isCompleted) return;
    setIsCompleted(true);
    const durationSeconds = Math.round((Date.now() - (startedAtRef.current ?? Date.now())) / 1000);
    apiRequest("/api/v1/calibration/sessions", { method: "POST", body: { durationSeconds } })
      .then(({ total }) => toast.success(`Calibration saved. You've completed ${total} session${total === 1 ? "" : "s"}.`))
      .catch((error) => toast.error(`Calibration not saved: ${error.message}`));
  };
  const handleReset = () => setIsCompleted(false);

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6">
      {!isCompleted ? (
        /* ================= SIMULATION LIVE SCREEN VIEW ================= */
        <>
          {/* Top Banner Alert notification */}
          <Calibration />

          {/* Main Page Header Overview Text */}
          <CalibrationHeader />

          {/* Main Workspace Grid split into Action Center and Side Trackers */}
          <div className="w-full flex flex-col lg:flex-row gap-6 items-start">
            {/* Left Interaction Workspace Column */}
            <div className="flex-1 flex flex-col gap-6 w-full">
              {/* Wraps SimulationHeader to listen for 'End Calibration' click events */}
              <div onClick={handleEndCalibration} className="cursor-pointer">
                <SimulationHeader />
              </div>
              <RoundTracker />
              <AudioPlayerCard />
              <TeleprompterCard />
              <RecorderCard />
            </div>

            {/* Right Side Panel / Metrics Insights Column */}
            <div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-6">
              <SimulationSidePanel />
              <ScoreMetricsCard />
            </div>
          </div>
        </>
      ) : (
        /* CALIBRATION COMPLETE REPORT SCREEN VIEW */
        <>
          {/* Success Top Status bar notification */}
          <ResultsBanner />
          
          <div className="w-full flex flex-col gap-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-dark-black/80">
              Calibration results
            </h1>
          </div>
          
          {/* Primary Results Score & Metadata blocks */}
          <ResultsOverview />
          
          {/* Horizontal Completed Stepper Row */}
          <RoundPerformanceTimeline />

          {/* Bottom layout split block */}
          <div className="w-full flex flex-col lg:flex-row gap-6 items-stretch">
            {/* Left Grid Bar Breakdown */}
            <div className="flex-1 w-full">
              <ScoreBreakdownGrid />
            </div>
            
            {/* Right Quick Action steps column container */}
            <div className="w-full lg:w-[380px] shrink-0">
              <WhatsNextCard />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
