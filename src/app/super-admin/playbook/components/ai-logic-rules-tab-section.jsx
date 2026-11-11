"use client";

import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LogicCategoriesCard from "./logic-categories-card";
import LogicRulesOverviewSection, {
  DEFAULT_RULES_BY_CATEGORY,
} from "./logic-rules-overview-section";
import PromptStylePreviewCard from "./prompt-style-preview-card";
import { confirmAction } from "@/lib/alerts";
import toast from "react-hot-toast";

const CATEGORY_LIST = [
  "intent-detection",
  "emotion-analysis",
  "trust-logic",
  "objection-logic",
  "response-selection",
  "escalation-logic",
  "timing-pacing",
  "follow-up-logic",
  "success-indicators",
];

const CATEGORY_NAMES = {
  "intent-detection": "Intent Detection",
  "emotion-analysis": "Emotion Analysis",
  "trust-logic": "Trust Logic",
  "objection-logic": "Objection Logic",
  "response-selection": "Response Selection",
  "escalation-logic": "Escalation Logic",
  "timing-pacing": "Timing & Pacing",
  "follow-up-logic": "Follow-Up Logic",
  "success-indicators": "Success Indicators",
};

export default function AiLogicRulesTabSection({
  formData = {},
  onChange = () => {},
  onBack = () => {},
}) {
  const [selectedCategory, setSelectedCategory] = useState("intent-detection");

  const rulesByCategory =
    formData.logicRulesByCategory || DEFAULT_RULES_BY_CATEGORY;

  const handleRulesChange = (updatedCategoryRules) => {
    if (typeof updatedCategoryRules === "object" && !Array.isArray(updatedCategoryRules)) {
      onChange("logicRulesByCategory", updatedCategoryRules);
    } else {
      onChange("logicRulesByCategory", {
        ...rulesByCategory,
        [selectedCategory]: updatedCategoryRules,
      });
    }
  };

  const handleResetCategoryDefaults = (categoryKey) => {
    const keyToReset = categoryKey || selectedCategory;
    const defaultForCategory = DEFAULT_RULES_BY_CATEGORY[keyToReset];
    if (defaultForCategory) {
      onChange("logicRulesByCategory", {
        ...rulesByCategory,
        [keyToReset]: defaultForCategory,
      });
    }
  };

  const handleResetAllLogicDefaults = async () => {
    if (!(await confirmAction({ title: "Reset all to defaults?", text: "This resets every Logic & Rules category back to the defaults. Changes you made in them are lost.", confirmText: "Reset all" }))) return;
    onChange("logicRulesByCategory", DEFAULT_RULES_BY_CATEGORY);
    setSelectedCategory("intent-detection");
    toast.success("Reset all Logic & Rules to defaults!");
  };

  const handleBackNavigation = () => {
    const currentIndex = CATEGORY_LIST.indexOf(selectedCategory);
    if (currentIndex > 0) {
      setSelectedCategory(CATEGORY_LIST[currentIndex - 1]);
    } else {
      onBack();
    }
  };

  const getBackLabel = () => {
    const currentIndex = CATEGORY_LIST.indexOf(selectedCategory);
    if (currentIndex > 0) {
      const prevCatId = CATEGORY_LIST[currentIndex - 1];
      return `Back: ${CATEGORY_NAMES[prevCatId] || "Previous Category"}`;
    }
    return "Back: Playbook Prompt DNA";
  };

  return (
    <div className="space-y-6">
      {/* 3-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── Left Column: Logic Categories ── */}
        <div className="lg:col-span-3">
          <LogicCategoriesCard
            selectedCategory={selectedCategory}
            onSelectCategory={(catId) => setSelectedCategory(catId)}
            onResetDefaults={handleResetAllLogicDefaults}
          />
        </div>

        {/* ── Middle Column: Category-Specific Rules Table ── */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={`logic-category-${selectedCategory}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              <LogicRulesOverviewSection
                category={selectedCategory}
                rules={rulesByCategory}
                onChange={handleRulesChange}
                onResetDefaults={handleResetCategoryDefaults}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Right Column: Prompt Style Preview ── */}
        <div className="lg:col-span-4">
          <PromptStylePreviewCard />
        </div>
      </div>

      {/* ── Bottom Back Navigation ── */}
      <div className="pt-1">
        <button
          type="button"
          onClick={handleBackNavigation}
          className="px-4 py-2.5 rounded-xl border border-light-gray hover:border-medium-black/30 bg-white text-medium-black hover:text-dark-black text-xs font-semibold flex items-center gap-2 transition-all duration-200 shadow-2xs cursor-pointer select-none"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{getBackLabel()}</span>
        </button>
      </div>
    </div>
  );
}

