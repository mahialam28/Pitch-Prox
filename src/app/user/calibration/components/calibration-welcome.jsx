"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Clock } from "lucide-react";
import { apiRequest } from "@/lib/client-api";
import { showError } from "@/lib/alerts";

// First visit (until calibrated): what calibration is, start it now or "Do it later".
// "Do it later" stops the automatic trip here after sign-in; calling stays locked and the
// dashboard keeps a reminder.
const CalibrationWelcome = ({ onStart = () => {} }) => {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const doLater = async () => {
    setSaving(true);
    try {
      await apiRequest("/api/v1/calibration/defer", { method: "POST" });
      router.push("/user/dashboard");
    } catch (error) {
      showError("Couldn't save that", error.message);
      setSaving(false);
    }
  };

  return (
    <div className="w-full bg-white border border-primary/30 rounded-2xl p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-base sm:text-lg font-bold text-dark-black font-secondary">Welcome! Let&apos;s calibrate your coaching first</h2>
            <p className="text-xs sm:text-sm text-medium-black max-w-2xl">
              Calibration is a short practice session that teaches PitchProX how you speak, so live prompts fit your style. Calling unlocks once it&apos;s done.
            </p>
            <p className="text-xs text-light-black flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Not now? You can still upload your CRM, add prospects and set up playbooks.
            </p>
          </div>
        </div>
        <div className="flex flex-col-reverse sm:flex-row gap-2.5 shrink-0">
          <button
            type="button"
            onClick={doLater}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl border border-light-gray text-sm font-semibold text-medium-black hover:bg-light-gray transition-colors cursor-pointer disabled:opacity-60"
          >
            {saving ? "Saving…" : "Do it later"}
          </button>
          <button
            type="button"
            onClick={onStart}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-medium-teal text-sm font-semibold text-white transition-colors cursor-pointer shadow-sm"
          >
            Start calibration
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalibrationWelcome;
