"use client";

import React, { useState } from "react";
import EndCall from "./components/end-call";
import StartCall from "./components/start-call";

export default function LiveCallingPage() {
  const [callEnded, setCallEnded] = useState(false);

  // Pre-call setup state shared between the setup form (StartCall) and the
  // post-call summary (EndCall).
  const [callSetup, setCallSetup] = useState({
    leadName: "",
    phoneNumber: "",
    leadType: "",
    companyName: "",
    playbook: "PitchProX Standard",
  });

  // Disposition selected after the call ends.
  const [outcome, setOutcome] = useState("");

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6">
      {callEnded ? (
        <EndCall
          setup={callSetup}
          outcome={outcome}
          onOutcomeChange={setOutcome}
          onStartNewCall={() => {
            setOutcome("");
            setCallEnded(false);
          }}
        />
      ) : (
        <StartCall
          setup={callSetup}
          onSetupChange={setCallSetup}
          onCallEnded={() => setCallEnded(true)}
        />
      )}
    </div>
  );
}
