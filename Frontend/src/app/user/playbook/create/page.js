"use client";

import React, { Suspense, useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";
import StepOne from "./components/step-one";
import StepTwo from "./components/step-two";
import StepThree, { DEFAULT_PHASES } from "./components/step-three";
import StepFour, { DEFAULT_OBJECTIONS, DEFAULT_FRAMEWORK_STEPS } from "./components/step-four";
import StepFive from "./components/step-five";
import PlaybookCreatedModal from "./components/playbook-created-modal";
import { showSavedToast } from "@/lib/toast";
import { fromStorable, toStorable } from "./playbook-icons";
import { apiRequest } from "@/lib/client-api";
import { showError } from "@/lib/alerts";

const STEPS = [
  { id: 1, name: "Basic Info" },
  { id: 2, name: "Your Style" },
  { id: 3, name: "Conversation Flow" },
  { id: 4, name: "Objection Handling" },
  { id: 5, name: "Review & Save" },
];

const PlaybookWizard = () => {
  const router = useRouter();
  // ?id=… opens an existing custom playbook for editing
  const editId = useSearchParams().get("id");
  const [playbookId, setPlaybookId] = useState(editId);
  const [savedStatus, setSavedStatus] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [loaded, setLoaded] = useState(!editId);
  const [saving, setSaving] = useState(false);
  const loadedIdRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    playbookName: "",
    shortDescription: "",
    industry: "",
    leadType: [],
    experienceLevel: "",
    voiceDescription: "",
    uniqueVoiceTags: [],
    corePhilosophy: "",
    selectedGoal: "",
  });
  // Steps 3 and 4 edit these; keeping them here means they survive moving
  // between steps and are included when the playbook is saved
  const [phases, setPhases] = useState(DEFAULT_PHASES);
  const [objections, setObjections] = useState(DEFAULT_OBJECTIONS);
  const [frameworkSteps, setFrameworkSteps] = useState(DEFAULT_FRAMEWORK_STEPS);

  useEffect(() => {
    // Skip when the id is one this page just saved (its data is already here)
    if (!editId || loadedIdRef.current === editId) return;
    let active = true;
    apiRequest(`/api/v1/playbooks/${encodeURIComponent(editId)}`)
      .then(({ playbook }) => {
        if (!active) return;
        if (!playbook.isCustom) throw new Error("Only your own custom playbooks can be edited.");
        const content = playbook.content || {};
        loadedIdRef.current = playbook.id;
        setPlaybookId(playbook.id);
        setSavedStatus(playbook.status);
        setFormData((prev) => ({ ...prev, ...content.form, playbookName: playbook.title, shortDescription: playbook.description || "" }));
        if (content.phases) setPhases(fromStorable(content.phases));
        if (content.objections) setObjections(fromStorable(content.objections));
        if (content.frameworkSteps) setFrameworkSteps(fromStorable(content.frameworkSteps));
        setLoaded(true);
      })
      .catch((error) => active && setLoadError(error.message));
    return () => { active = false; };
  }, [editId]);

  // Save the whole wizard. "draft" keeps it private; "published" makes it usable and active.
  const [createdPlaybook, setCreatedPlaybook] = useState(null);

  const setCreatedActive = async () => {
    try {
      await apiRequest("/api/v1/playbooks/active", { method: "PUT", body: { playbookId: createdPlaybook.id } });
      showSavedToast("Playbook activated", `${createdPlaybook.title} is now your active playbook.`);
      router.push("/user/playbook");
    } catch (error) {
      showError("Playbook not activated", error.message);
    }
  };

  const savePlaybook = async (status) => {
    if (!formData.playbookName?.trim()) {
      setCurrentStep(1);
      showError("Name your playbook", "Add a playbook name in Step 1 before saving.");
      return;
    }
    setSaving(true);
    try {
      const body = {
        title: formData.playbookName,
        description: formData.shortDescription || null,
        status,
        activate: false,
        content: {
          version: 1,
          form: formData,
          phases: toStorable(phases),
          objections: toStorable(objections),
          frameworkSteps: toStorable(frameworkSteps),
        },
      };
      const { playbook } = playbookId
        ? await apiRequest(`/api/v1/playbooks/${playbookId}`, { method: "PATCH", body })
        : await apiRequest("/api/v1/playbooks", { method: "POST", body });
      loadedIdRef.current = playbook.id;
      setPlaybookId(playbook.id);
      setSavedStatus(playbook.status);
      if (status === "published") {
        setCreatedPlaybook(playbook);
      } else {
        // Keep the id in the address so a refresh keeps editing this draft
        router.replace(`/user/playbook/create?id=${playbook.id}`);
        showSavedToast("Draft saved", "Your custom playbook draft was saved.");
      }
    } catch (error) {
      showError("Playbook not saved", error.message);
    } finally {
      setSaving(false);
    }
  };
  const stepperRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateStepperArrows = useCallback(() => {
    const el = stepperRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  const scrollStepper = useCallback((direction) => {
    const el = stepperRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === "left" ? -240 : 240, behavior: "smooth" });
    setTimeout(updateStepperArrows, 350);
  }, [updateStepperArrows]);

  // Check overflow on mount, resize, and step change
  useEffect(() => {
    const el = stepperRef.current;
    if (!el) return;
    updateStepperArrows();
    const observer = new ResizeObserver(() => updateStepperArrows());
    observer.observe(el);
    el.addEventListener("scroll", updateStepperArrows, { passive: true });
    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", updateStepperArrows);
    };
    // `loaded`: when editing, the stepper only appears once the playbook has loaded
  }, [updateStepperArrows, loaded]);

  // Scroll active step into view
  useEffect(() => {
    const el = stepperRef.current;
    if (!el || currentStep < 1) return;
    const child = el.children[currentStep - 1];
    if (child) {
      child.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
    setTimeout(updateStepperArrows, 400);
  }, [currentStep, updateStepperArrows]);

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1);
    } else {
      savePlaybook("published");
    }
  };

  // When the step changes, jump back to the top of the page so the user
  // sees the start of the next step instead of staying at the bottom.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [currentStep]);

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  if (!loaded) {
    return (
      <div className="w-full bg-white rounded-2xl border border-light-gray shadow-sm p-8 flex flex-col items-center text-center gap-3">
        <p className="text-sm font-semibold text-dark-black/80">{loadError || "Loading playbook…"}</p>
        {loadError && (
          <Link href="/user/playbook" className="text-xs font-semibold text-primary hover:underline">
            Back to playbooks
          </Link>
        )}
      </div>
    );
  }

  // Editing a published playbook saves in place instead of turning it back into a draft
  const isPublished = savedStatus === "published";

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6">
      {/* Header & Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-light-gray ">
        <div className="flex flex-col gap-1">
          <Title variant="small" className="!text-dark-black/80 !text-base sm:!text-lg">
            {playbookId ? "Edit Your Custom Playbook" : "Create Your Custom Playbook"}
          </Title>
          <Text variant="small" className="text-light-black text-xs sm:text-sm">
            Build a playbook that reflects your unique style, voice, and sales methodology.
          </Text>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={() => savePlaybook(isPublished ? "published" : "draft")}
            disabled={saving}
            className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-xl border-2 border-primary text-primary font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-primary hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            {saving ? "Saving…" : isPublished ? "Save Changes" : "Save as Draft"}
          </button>
          <button
            onClick={handleNext}
            disabled={saving}
            className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-xl border-2 border-primary bg-primary hover:bg-medium-teal text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            <span className="truncate">Next: {STEPS[currentStep]?.name || "Save"}</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          </button>
        </div>
      </div>

      {/* Stepper Header - Scrollable with smooth snap */}
      <div className="relative w-full">
        {/* Arrow Left */}
        {canScrollLeft && (
          <button
            onClick={() => scrollStepper("left")}
            className="absolute left-0 top-0 z-10 h-full w-8 flex items-center justify-center bg-gradient-to-r from-white via-white/90 to-transparent cursor-pointer group"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors" />
          </button>
        )}
        {/* Arrow Right */}
        {canScrollRight && (
          <button
            onClick={() => scrollStepper("right")}
            className="absolute right-0 top-0 z-10 h-full w-8 flex items-center justify-center bg-gradient-to-l from-white via-white/90 to-transparent cursor-pointer group"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors" />
          </button>
        )}
        <div
          ref={stepperRef}
          className="w-full overflow-hidden pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth snap-x snap-mandatory"
        >
        <div className="flex items-center w-full min-w-max sm:min-w-0 px-1 py-2 gap-0 sm:justify-between">
          {STEPS.map((step, idx) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <React.Fragment key={step.id}>
                <motion.div
                  className="flex items-center gap-3 cursor-pointer group shrink-0 snap-center"
                  onClick={() => setCurrentStep(step.id)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <motion.div
                    animate={
                      isCompleted
                        ? { backgroundColor: "#0EADAB", color: "#FFFFFF", scale: 1 }
                        : isCurrent
                        ? { backgroundColor: "#0EADAB", color: "#FFFFFF", scale: 1.1 }
                        : { backgroundColor: "#F5F5F5", color: "#A5B1B5", scale: 1 }
                    }
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCurrent ? "shadow-md shadow-primary/30" : ""
                    }`}
                  >
                    {isCompleted ? (
                      <motion.span
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Check className="w-4 h-4" />
                      </motion.span>
                    ) : (
                      <motion.span
                        key={step.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {step.id}
                      </motion.span>
                    )}
                  </motion.div>
                  <motion.span
                    animate={{
                      opacity: isCurrent || isCompleted ? 1 : 0.45,
                    }}
                    transition={{ duration: 0.2 }}
                    className={`hidden sm:inline text-sm ${
                      isCurrent || isCompleted
                        ? "text-dark-black font-semibold"
                        : "text-light-black"
                    }`}
                  >
                    {step.name}
                  </motion.span>
                </motion.div>

                {idx < STEPS.length - 1 && (
                  <motion.div
                    className="flex-1 shrink-0 h-0.5 mx-3 sm:mx-5 rounded-full"
                    animate={{
                      backgroundColor:
                        step.id < currentStep ? "#0EADAB" : "#E5E7EB",
                    }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
      </div>

      {/* Step Content with Animated Transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {currentStep === 1 && (
            <StepOne formData={formData} setFormData={setFormData} onNext={handleNext} />
          )}
          {currentStep === 2 && (
            <StepTwo formData={formData} setFormData={setFormData} onBack={handleBack} onNext={handleNext} />
          )}
          {currentStep === 3 && (
            <StepThree formData={formData} setFormData={setFormData} phases={phases} setPhases={setPhases} onBack={handleBack} onNext={handleNext} />
          )}
          {currentStep === 4 && (
            <StepFour
              formData={formData}
              setFormData={setFormData}
              objections={objections}
              setObjections={setObjections}
              frameworkSteps={frameworkSteps}
              setFrameworkSteps={setFrameworkSteps}
              onBack={handleBack}
              onNext={handleNext}
            />
          )}
          {currentStep === 5 && (
            <StepFive
              formData={formData}
              phases={phases}
              objections={objections}
              frameworkSteps={frameworkSteps}
              status={savedStatus}
              saving={saving}
              onBack={handleBack}
              onGoToStep={setCurrentStep}
              onComplete={() => savePlaybook("published")}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <PlaybookCreatedModal
        playbook={createdPlaybook}
        onViewPlaybook={() => router.push("/user/playbook")}
        onSetActive={setCreatedActive}
      />
    </div>
  );
};

// useSearchParams needs a Suspense boundary above it
export default function CreatePlaybookPage() {
  return (
    <Suspense fallback={null}>
      <PlaybookWizard />
    </Suspense>
  );
}
