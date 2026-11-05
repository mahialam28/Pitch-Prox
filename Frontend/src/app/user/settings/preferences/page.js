"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { FiRefreshCw, FiClock, FiBookOpen, FiChevronDown } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Text from "@/components/texts/text";
import { showError } from "@/lib/alerts";
import { apiRequest } from "@/lib/client-api";
import { useRouter } from "next/navigation";
import { usePortal } from "@/components/shared/use-portal";
import { RotateCw } from "lucide-react";
import ConfirmDialog from "@/components/modals/confirm-dialog";
import { showSavedToast } from "@/lib/toast";

const Preference = () => {
  const [fontSize, setFontSize] = useState(110);
  const [playbookOpen, setPlaybookOpen] = useState(false);
  const [selectedPlaybook, setSelectedPlaybook] = useState("pitchprox-standard");
  // Playbooks this account can use right now (Standard, published custom, purchased)
  const [playbookOptions, setPlaybookOptions] = useState([{ value: "pitchprox-standard", label: "PitchProX Standard" }]);
  const [message, setMessage] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const router = useRouter();
  const portal = usePortal();
  const playbookRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (playbookRef.current && !playbookRef.current.contains(event.target)) {
        setPlaybookOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Admin portals don't place calls, so they have no playbook or calibration
    Promise.all([apiRequest("/api/v1/settings/preferences"), portal.canCall ? apiRequest("/api/v1/playbooks") : null])
      .then(([settings, playbooks]) => {
        setFontSize(settings.preferences.fontSize || 110);
        if (!playbooks) return;
        setPlaybookOptions(playbooks.results.filter((p) => p.isAvailable).map((p) => ({ value: p.id, label: p.title })));
        setSelectedPlaybook(playbooks.activePlaybookId);
      })
      .catch((error) => showError("Preferences not loaded", error.message));
  }, [portal.canCall]);

  const resetCalibration = async () => {
    try {
      await apiRequest("/api/v1/calibration/sessions", { method: "DELETE" });
      router.push(`${portal.base}/calibration`);
    } catch (error) {
      showError("Calibration not reset", error.message);
      throw error;
    }
  };

  const savePreferences = async () => {
    try {
      // The playbook goes through the playbooks API, which checks this account may use it
      await apiRequest("/api/v1/settings/preferences", { method: "PUT", body: { fontSize } });
      if (portal.canCall) await apiRequest("/api/v1/playbooks/active", { method: "PUT", body: { playbookId: selectedPlaybook } });
      setMessage("Preferences saved.");
      showSavedToast("Changes saved", "Your settings were updated successfully.");
    } catch (error) {
      setMessage(error.message);
      await showError("Preferences not saved", error.message);
    }
  };

  const selectedPlaybookItem = playbookOptions.find((o) => o.value === selectedPlaybook);

  // Dynamic range fill using linear-gradient
  const rangeFill = useCallback(
    (val, min, max) =>
      `linear-gradient(to right, #0EADAB 0%, #0EADAB ${((val - min) / (max - min)) * 100}%, #e5e7eb ${((val - min) / (max - min)) * 100}%, #e5e7eb 100%)`,
    []
  );

  return (
    <div className="space-y-6">
      {/* 1. Prompt Size Section */}
      <div className="bg-white rounded-2xl border border-light-gray p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary font-bold text-base flex-shrink-0">
              Aa
            </div>
            <div>
              <Text variant="regular" className="font-bold">
                Prompt Size
              </Text>
              <Text variant="smaller" className="mt-0.5">
                Adjust the size of the AI prompt text for better readability during calls.
              </Text>
            </div>
          </div>
          <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg flex-shrink-0">
            {fontSize}%
          </span>
        </div>

        {/* Range Slider */}
        <div className="space-y-2 pt-2">
          <input
            type="range"
            min="80"
            max="150"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
className="w-full h-1.5 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white"
            style={{ background: rangeFill(fontSize, 80, 150) }}
          />
          <div className="flex justify-between text-[10px] font-bold tracking-wider text-medium-black uppercase">
            <span>Small</span>
            <span>Medium</span>
            <span>Large</span>
          </div>
        </div>

        {/* Preview Box */}
        <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 space-y-1.5">
          <span className="text-[10px] font-bold tracking-wider text-primary uppercase">
            Preview
          </span>
          <p
            className="font-medium text-medium-black transition-all duration-150 leading-normal"
            style={{ fontSize: `${(fontSize / 100) * 14}px` }}
          >
            This is how your AI prompt text will appear during live calls.
          </p>
        </div>
      </div>

      {portal.canCall && (
        <>
      {/* 2. Calibration Reset Section */}
      <div className="bg-white rounded-2xl border border-light-gray p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary flex-shrink-0">
              <FiRefreshCw className="w-5 h-5" />
            </div>
            <div>
              <Text variant="regular" className="font-bold">
                Calibration Reset
              </Text>
              <Text variant="smaller" className="mt-0.5 max-w-lg">
                Reset your calibration to go through the calibration process again. This helps PitchProX prompt communications closer to your natural reading capabilities.
              </Text>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setResetOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-primary text-primary hover:bg-primary/5 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer flex-shrink-0 w-full sm:w-auto sm:self-center"
          >
            <FiRefreshCw className="w-4 h-4" /> Reset Calibration
          </button>
        </div>

        {/* Info Box */}
        <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100/60 flex items-start gap-3">
          <FiClock className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <Text variant="small" className="font-bold">What does this do?</Text>
            <Text variant="smaller" className="mt-0.5">
              You will be guided through the calibration process again so PitchProX can adjust AI prompting to match your natural reading speed and style for more effective guidance.
            </Text>
          </div>
        </div>
      </div>

      {/* 3. Default Playbook Section */}
      <div className="bg-white rounded-2xl border border-light-gray p-6 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary flex-shrink-0">
              <FiBookOpen className="w-5 h-5" />
            </div>
            <div>
              <Text variant="regular" className="font-bold">
                Default Playbook
              </Text>
              <Text variant="smaller" className="mt-0.5">
                Choose the playbook you want to use by default when starting a call.
              </Text>
            </div>
          </div>

          {/* Select Component */}
          <div className="relative min-w-[220px] self-start sm:self-center" ref={playbookRef}>
            <button
              onClick={() => setPlaybookOpen(!playbookOpen)}
              className={`flex items-center justify-between w-full p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                playbookOpen
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-light-gray hover:border-medium-black/20"
              } bg-white`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-5 bg-dark-black rounded-md flex items-center justify-center">
                  <span className="w-3 h-0.5 bg-primary rounded-full"></span>
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-dark-black leading-none">
                    {selectedPlaybookItem?.label || "PitchProX Standard"}
                  </p>
                  <span className="text-[9px] font-semibold text-light-black uppercase tracking-wider block mt-1">
                    FACTORY DEFAULT PLAYBOOK
                  </span>
                </div>
              </div>
              <motion.span
                animate={{ rotate: playbookOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex shrink-0"
              >
                <FiChevronDown className="w-4 h-4 text-light-black" />
              </motion.span>
            </button>

            <AnimatePresence>
              {playbookOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 4, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute z-50 mt-1 min-w-full bg-white border border-light-gray rounded-xl shadow-lg overflow-hidden"
                  style={{ transformOrigin: "top" }}
                >
                  <div className="py-1">
                    {playbookOptions.map((option) => {
                      const isActive = selectedPlaybook === option.value;
                      return (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSelectedPlaybook(option.value);
                            setPlaybookOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-left transition-colors cursor-pointer ${
                            isActive
                              ? "bg-primary/5 text-primary"
                              : "hover:bg-primary/5 hover:text-primary text-dark-black/70"
                          }`}
                        >
                          <div className="w-5 h-3.5 bg-dark-black rounded flex items-center justify-center">
                            <span className="w-2 h-0.5 bg-primary rounded-full"></span>
                          </div>
                          <span>{option.label}</span>
                          {isActive && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

        </>
      )}

      {/* Save Action */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {message && <span className="text-xs font-medium text-primary">{message}</span>}
        <button
          type="button"
          onClick={savePreferences}
          className="px-6 py-2.5 bg-primary hover:bg-medium-teal text-white text-xs font-semibold rounded-xl transition-all duration-200 shadow-sm cursor-pointer"
        >
          Save changes
        </button>
      </div>

      <ConfirmDialog
        isOpen={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset calibration?"
        icon={RotateCw}
        iconTone="warning"
        message="You'll go through all 7 calibration rounds again so PitchProX can re-learn your reading speed and style."
        note="Until you finish, AI prompts use default pacing and live calling stays locked."
        confirmLabel="Reset Calibration"
        confirmVariant="primary"
        onConfirm={resetCalibration}
      />
    </div>
  );
};

export default Preference;
