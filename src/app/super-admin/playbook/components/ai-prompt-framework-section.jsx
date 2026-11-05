"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AiPromptFrameworkHeader from "./ai-prompt-framework-header";
import AiFrameworkBuilderSection from "./ai-framework-builder-section";
import AiPromptVariablesSection from "./ai-prompt-variables-section";
import AiLogicRulesTabSection from "./ai-logic-rules-tab-section";
import AiPromptLengthSection from "./ai-prompt-length-section";
import AiSafetyGuardrailsSection from "./ai-safety-guardrails-section";
import AiAdvancedSettingsCard from "./ai-advanced-settings-card";

import LivePromptPreviewCard from "./live-prompt-preview-card";
import FrameworkSettingsCard from "./framework-settings-card";
import QualityScoreCard from "./quality-score-card";

import AiPromptLengthInfoCard from "./ai-prompt-length-info-card";
import AiSafetyInfoCard from "./ai-safety-info-card";
import AiWhatItDoesCard from "./ai-what-it-does-card";
import AiProTipCard from "./ai-pro-tip-card";

const PRO_TIPS_BY_TAB = {
  "framework-builder": "Test different trigger combinations in simulation mode before publishing live.",
  "prompt-variables": "Anchor your core coaching pillars to shape the strategic personality of every prompt.",
  "logic-rules": "Configure real-time decision logic rules to trigger high-converting response sequences.",
  "prompt-length": "For fast-paced cold calling, keep prompts under 20 words so reps can absorb talking points instantly.",
  "safety-guardrails": "Guardrails protect your team, your clients, and your brand across every call.",
  "advanced": "Start with balanced settings and adjust based on your call style and results.",
};

export default function AiPromptFrameworkSection({
  formData = {},
  onChange = () => {},
}) {
  const [activeTab, setActiveTab] = useState("framework-builder");

  const aiData = formData.aiFramework || {};

  const handleAiChange = (field, val) => {
    onChange("aiFramework", {
      ...aiData,
      [field]: val,
    });
  };

  const handleAdvancedCardChange = (updatedAdvanced) => {
    onChange("aiFramework", {
      ...aiData,
      ...updatedAdvanced,
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Title Banner & Sub-tabs */}
      <AiPromptFrameworkHeader
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId)}
      />

      {/* 2. Main Content */}
      {activeTab === "prompt-variables" ? (
        <AnimatePresence mode="wait">
          <motion.div
            key="tab-prompt-variables"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <AiPromptVariablesSection
              formData={aiData}
              onChange={handleAiChange}
              onBack={() => setActiveTab("framework-builder")}
            />
          </motion.div>
        </AnimatePresence>
      ) : activeTab === "logic-rules" ? (
        <AnimatePresence mode="wait">
          <motion.div
            key="tab-logic-rules"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <AiLogicRulesTabSection
              formData={aiData}
              onChange={handleAiChange}
              onBack={() => setActiveTab("prompt-variables")}
            />
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* LEFT MAIN COLUMN */}
          <div className="xl:col-span-8">
            <AnimatePresence mode="wait">
              {activeTab === "framework-builder" && (
                <motion.div
                  key="tab-framework-builder"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <AiFrameworkBuilderSection
                    formData={aiData}
                    onChange={handleAiChange}
                  />
                </motion.div>
              )}

              {activeTab === "prompt-length" && (
                <motion.div
                  key="tab-prompt-length"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <AiPromptLengthSection
                    formData={aiData}
                    onChange={handleAiChange}
                    onBack={() => setActiveTab("logic-rules")}
                  />
                </motion.div>
              )}

              {activeTab === "safety-guardrails" && (
                <motion.div
                  key="tab-safety-guardrails"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <AiSafetyGuardrailsSection
                    formData={aiData}
                    onChange={handleAiChange}
                    onBack={() => setActiveTab("prompt-length")}
                  />
                </motion.div>
              )}

              {activeTab === "advanced" && (
                <motion.div
                  key="tab-advanced"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <AiAdvancedSettingsCard
                    formData={aiData}
                    onChange={handleAdvancedCardChange}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT SIDEBAR COLUMN */}
          <div className="xl:col-span-4 space-y-6">
            <AnimatePresence mode="wait">
              {activeTab === "framework-builder" && (
                <motion.div
                  key="sidebar-framework-builder"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* 1. Live Prompt Preview */}
                  <LivePromptPreviewCard />

                  {/* 2. Framework Settings */}
                  <FrameworkSettingsCard
                    settings={aiData.frameworkSettings}
                    onChange={(val) =>
                      handleAiChange("frameworkSettings", {
                        ...aiData.frameworkSettings,
                        ...val,
                      })
                    }
                  />

                  {/* 3. Quality Score */}
                  <QualityScoreCard />
                </motion.div>
              )}

              {activeTab === "prompt-length" && (
                <motion.div
                  key="sidebar-prompt-length"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <AiPromptLengthInfoCard />
                </motion.div>
              )}

              {activeTab === "safety-guardrails" && (
                <motion.div
                  key="sidebar-safety-guardrails"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <AiSafetyInfoCard />
                </motion.div>
              )}

              {activeTab === "advanced" && (
                <motion.div
                  key="sidebar-advanced"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <AiWhatItDoesCard />
                  <AiProTipCard tip={PRO_TIPS_BY_TAB["advanced"]} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
