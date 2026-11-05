"use client";

import React, { useState } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PlaybookDnaAreasCard, { DNA_AREAS } from "./playbook-dna-areas-card";
import CoreCoachingPhilosophySection, {
  DEFAULT_COACHING_PHILOSOPHY,
} from "./core-coaching-philosophy-section";
import PromptVoiceSection, {
  DEFAULT_PROMPT_VOICE,
} from "./prompt-voice-section";
import StrategicFramingSection, {
  DEFAULT_STRATEGIC_FRAMING,
} from "./strategic-framing-section";
import TrustBuildingStyleSection, {
  DEFAULT_TRUST_BUILDING_STYLE,
} from "./trust-building-style-section";
import ObjectionToneSection, {
  DEFAULT_OBJECTION_TONE,
} from "./objection-tone-section";
import DiscoveryStyleSection, {
  DEFAULT_DISCOVERY_STYLE,
} from "./discovery-style-section";
import ClosingStyleSection, {
  DEFAULT_CLOSING_STYLE,
} from "./closing-style-section";
import FollowUpStyleSection, {
  DEFAULT_FOLLOW_UP_STYLE,
} from "./follow-up-style-section";
import LanguageRulesSection, {
  DEFAULT_LANGUAGE_RULES,
} from "./language-rules-section";
import DoDontBoundariesSection, {
  DEFAULT_DO_DONT_BOUNDARIES,
} from "./do-dont-boundaries-section";
import PromptStylePreviewCard from "./prompt-style-preview-card";
import toast from "react-hot-toast";

export default function AiPromptVariablesSection({
  formData = {},
  onChange = () => {},
  onBack = () => {},
}) {
  // Prompt DNA opens on Core Coaching Philosophy
  const [selectedArea, setSelectedArea] = useState("core-coaching-philosophy");

  const coachingPhilosophy =
    formData.coachingPhilosophy || DEFAULT_COACHING_PHILOSOPHY;
  const promptVoice = formData.promptVoice || DEFAULT_PROMPT_VOICE;
  const strategicFraming =
    formData.strategicFraming || DEFAULT_STRATEGIC_FRAMING;
  const trustBuildingStyle =
    formData.trustBuildingStyle || DEFAULT_TRUST_BUILDING_STYLE;
  const objectionTone = formData.objectionTone || DEFAULT_OBJECTION_TONE;
  const discoveryStyle = formData.discoveryStyle || DEFAULT_DISCOVERY_STYLE;
  const closingStyle = formData.closingStyle || DEFAULT_CLOSING_STYLE;
  const followUpStyle = formData.followUpStyle || DEFAULT_FOLLOW_UP_STYLE;
  const languageRules = formData.languageRules || DEFAULT_LANGUAGE_RULES;
  const doDontBoundaries = formData.doDontBoundaries || DEFAULT_DO_DONT_BOUNDARIES;

  const handleFieldChange = (key, val) => {
    onChange(key, val);
  };

  const handleResetAllDnaAreas = () => {
    onChange("coachingPhilosophy", DEFAULT_COACHING_PHILOSOPHY);
    onChange("promptVoice", DEFAULT_PROMPT_VOICE);
    onChange("strategicFraming", DEFAULT_STRATEGIC_FRAMING);
    onChange("trustBuildingStyle", DEFAULT_TRUST_BUILDING_STYLE);
    onChange("objectionTone", DEFAULT_OBJECTION_TONE);
    onChange("discoveryStyle", DEFAULT_DISCOVERY_STYLE);
    onChange("closingStyle", DEFAULT_CLOSING_STYLE);
    onChange("followUpStyle", DEFAULT_FOLLOW_UP_STYLE);
    onChange("languageRules", DEFAULT_LANGUAGE_RULES);
    onChange("doDontBoundaries", DEFAULT_DO_DONT_BOUNDARIES);
    setSelectedArea("core-coaching-philosophy");
    toast.success("Reset all Playbook DNA areas to defaults!");
  };

  const handleBackNavigation = () => {
    if (selectedArea === "do-dont-boundaries") {
      setSelectedArea("language-rules");
    } else if (selectedArea === "language-rules") {
      setSelectedArea("follow-up-style");
    } else if (selectedArea === "follow-up-style") {
      setSelectedArea("closing-style");
    } else if (selectedArea === "closing-style") {
      setSelectedArea("discovery-style");
    } else if (selectedArea === "discovery-style") {
      setSelectedArea("objection-tone");
    } else if (selectedArea === "objection-tone") {
      setSelectedArea("trust-building-style");
    } else if (selectedArea === "trust-building-style") {
      setSelectedArea("strategic-framing");
    } else if (selectedArea === "strategic-framing") {
      setSelectedArea("prompt-voice");
    } else if (selectedArea === "prompt-voice") {
      setSelectedArea("core-coaching-philosophy");
    } else {
      onBack();
    }
  };

  const getBackLabel = () => {
    if (selectedArea === "do-dont-boundaries") {
      return "Back: Language Rules";
    }
    if (selectedArea === "language-rules") {
      return "Back: Follow-Up Style";
    }
    if (selectedArea === "follow-up-style") {
      return "Back: Closing style";
    }
    if (selectedArea === "closing-style") {
      return "Back: Discovery style";
    }
    if (selectedArea === "discovery-style") {
      return "Back: Objection tone";
    }
    if (selectedArea === "objection-tone") {
      return "Back: Trust-building style";
    }
    if (selectedArea === "trust-building-style") {
      return "Back: Strategic framing";
    }
    if (selectedArea === "strategic-framing") {
      return "Back: Prompt voice";
    }
    if (selectedArea === "prompt-voice") {
      return "Back: Core Coaching Philosophy";
    }
    return "Back: Framework Builder";
  };

  return (
    <div className="space-y-6">
      {/* 3-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── Left Column: Playbook DNA Areas List ── */}
        <div className="lg:col-span-3">
          <PlaybookDnaAreasCard
            selectedArea={selectedArea}
            onSelectArea={(areaId) => setSelectedArea(areaId)}
            onResetDefaults={handleResetAllDnaAreas}
          />
        </div>

        {/* ── Middle Column: Active DNA Area Form ── */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {selectedArea === "core-coaching-philosophy" && (
              <motion.div
                key="area-core-coaching-philosophy"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <CoreCoachingPhilosophySection
                  data={coachingPhilosophy}
                  onChange={(val) => handleFieldChange("coachingPhilosophy", val)}
                  onResetDefaults={() =>
                    handleFieldChange("coachingPhilosophy", DEFAULT_COACHING_PHILOSOPHY)
                  }
                />
              </motion.div>
            )}

            {selectedArea === "prompt-voice" && (
              <motion.div
                key="area-prompt-voice"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <PromptVoiceSection
                  data={promptVoice}
                  onChange={(val) => handleFieldChange("promptVoice", val)}
                  onResetDefaults={() =>
                    handleFieldChange("promptVoice", DEFAULT_PROMPT_VOICE)
                  }
                />
              </motion.div>
            )}

            {selectedArea === "strategic-framing" && (
              <motion.div
                key="area-strategic-framing"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <StrategicFramingSection
                  data={strategicFraming}
                  onChange={(val) => handleFieldChange("strategicFraming", val)}
                  onResetDefaults={() =>
                    handleFieldChange("strategicFraming", DEFAULT_STRATEGIC_FRAMING)
                  }
                />
              </motion.div>
            )}

            {selectedArea === "trust-building-style" && (
              <motion.div
                key="area-trust-building-style"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <TrustBuildingStyleSection
                  data={trustBuildingStyle}
                  onChange={(val) => handleFieldChange("trustBuildingStyle", val)}
                  onResetDefaults={() =>
                    handleFieldChange(
                      "trustBuildingStyle",
                      DEFAULT_TRUST_BUILDING_STYLE
                    )
                  }
                />
              </motion.div>
            )}

            {selectedArea === "objection-tone" && (
              <motion.div
                key="area-objection-tone"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <ObjectionToneSection
                  data={objectionTone}
                  onChange={(val) => handleFieldChange("objectionTone", val)}
                  onResetDefaults={() =>
                    handleFieldChange("objectionTone", DEFAULT_OBJECTION_TONE)
                  }
                />
              </motion.div>
            )}

            {selectedArea === "discovery-style" && (
              <motion.div
                key="area-discovery-style"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <DiscoveryStyleSection
                  data={discoveryStyle}
                  onChange={(val) => handleFieldChange("discoveryStyle", val)}
                  onResetDefaults={() =>
                    handleFieldChange("discoveryStyle", DEFAULT_DISCOVERY_STYLE)
                  }
                />
              </motion.div>
            )}

            {selectedArea === "closing-style" && (
              <motion.div
                key="area-closing-style"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <ClosingStyleSection
                  data={closingStyle}
                  onChange={(val) => handleFieldChange("closingStyle", val)}
                  onResetDefaults={() =>
                    handleFieldChange("closingStyle", DEFAULT_CLOSING_STYLE)
                  }
                />
              </motion.div>
            )}

            {selectedArea === "follow-up-style" && (
              <motion.div
                key="area-follow-up-style"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <FollowUpStyleSection
                  data={followUpStyle}
                  onChange={(val) => handleFieldChange("followUpStyle", val)}
                  onResetDefaults={() =>
                    handleFieldChange("followUpStyle", DEFAULT_FOLLOW_UP_STYLE)
                  }
                />
              </motion.div>
            )}

            {selectedArea === "language-rules" && (
              <motion.div
                key="area-language-rules"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <LanguageRulesSection
                  data={languageRules}
                  onChange={(val) => handleFieldChange("languageRules", val)}
                  onResetDefaults={() =>
                    handleFieldChange("languageRules", DEFAULT_LANGUAGE_RULES)
                  }
                />
              </motion.div>
            )}

            {selectedArea === "do-dont-boundaries" && (
              <motion.div
                key="area-do-dont-boundaries"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <DoDontBoundariesSection
                  data={doDontBoundaries}
                  onChange={(val) => handleFieldChange("doDontBoundaries", val)}
                  onResetDefaults={() =>
                    handleFieldChange(
                      "doDontBoundaries",
                      DEFAULT_DO_DONT_BOUNDARIES
                    )
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right Column: Prompt Style Preview ── */}
        <div className="lg:col-span-4">
          <PromptStylePreviewCard />
        </div>
      </div>

      {/* ── Dynamic Back Navigation Button ── */}
      <div className="pt-1">
        <button
          type="button"
          onClick={handleBackNavigation}
          className="px-4 py-2.5 rounded-xl border border-light-gray hover:border-medium-black/30 bg-white text-medium-black hover:text-dark-black text-xs font-semibold flex items-center gap-2 transition-all duration-200 shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{getBackLabel()}</span>
        </button>
      </div>
    </div>
  );
}
