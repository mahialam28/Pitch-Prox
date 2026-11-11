"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import EndCall from "./components/end-call";
import StartCall from "./components/start-call";
import CalibrationReminder from "../calibration/components/calibration";
import { useCalibrationStatus } from "../calibration/use-calibration-status";
import { PENDING_CALL_KEY } from "@/utils.js/call-constants";

export default function LiveCallingPage() {
  const [callEnded, setCallEnded] = useState(false);

  // Pre-call setup state shared between the setup form (StartCall) and the
  // post-call summary (EndCall).
  const [callSetup, setCallSetup] = useState({
    leadName: "",
    phoneNumber: "",
    leadType: "",
    playbook: "PitchProX Standard",
  });

  // Disposition selected after the call ends.
  const [outcome, setOutcome] = useState("");
  // What the AI recorded for the call that just ended (summary + transcript)
  const [liveCall, setLiveCall] = useState(null);

  // Calling is locked until the user has calibrated (client rule, Nov 8)
  const { status, failed, locked } = useCalibrationStatus();
  useEffect(() => {
    // A call started from the header while locked must not start by itself later
    if (!locked) return;
    try {
      sessionStorage.removeItem(PENDING_CALL_KEY);
    } catch {
      /* sessionStorage unavailable */
    }
  }, [locked]);

  if (locked) {
    return (
      <div className="w-full flex flex-col gap-4 sm:gap-6">
        <CalibrationReminder />
        <div className="w-full bg-white rounded-2xl border border-light-gray shadow-sm p-8 sm:p-12 flex flex-col items-center text-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-light-gray text-medium-black">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-dark-black font-secondary">Calling unlocks after calibration</h2>
          <p className="text-xs sm:text-sm text-medium-black max-w-md">
            Calibration is a short practice session that tunes your live prompts. Once it&apos;s done, you can start calls here.
          </p>
          <Link href="/user/calibration" className="mt-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-medium-teal text-sm font-semibold text-white transition-colors">
            Start calibration
          </Link>
        </div>
      </div>
    );
  }
  // Wait for the check before showing the call setup (if the check fails, don't block)
  if (!status && !failed) return <div className="w-full min-h-[40vh]" aria-busy="true" />;

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6">
      {callEnded ? (
        <EndCall
          setup={callSetup}
          outcome={outcome}
          onOutcomeChange={setOutcome}
          liveCall={liveCall}
          onStartNewCall={() => {
            setOutcome("");
            setLiveCall(null);
            setCallEnded(false);
          }}
        />
      ) : (
        <StartCall
          setup={callSetup}
          onSetupChange={setCallSetup}
          onCallEnded={(result) => {
            setLiveCall(result ?? null);
            setCallEnded(true);
          }}
        />
      )}
    </div>
  );
}
