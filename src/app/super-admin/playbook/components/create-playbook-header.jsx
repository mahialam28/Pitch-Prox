"use client";

import React from "react";
import { ArrowRight, Bookmark } from "lucide-react";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";

const CreatePlaybookHeader = ({
  currentStep = 1,
  nextStepLabel = "Next: Style & Voice",
  onSaveDraft = () => {},
  onNext = () => {},
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
      <div className="flex flex-col gap-1 min-w-0">
        <Title
          variant="small"
          className="!text-dark-black/80 font-bold !text-xl sm:!text-2xl font-secondary"
        >
          Create Internal Playbook
        </Title>
        <Text variant="small" className="text-medium-black text-xs sm:text-sm">
          Design the AI prompt framework that powers real-time coaching.
        </Text>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        <button
          type="button"
          onClick={onSaveDraft}
          className="px-4 py-2.5 rounded-xl border border-light-gray hover:border-medium-black/30 bg-white text-dark-black/80 text-xs font-semibold flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow cursor-pointer"
        >
          <Bookmark className="w-3.5 h-3.5 text-medium-black" />
          <span>Save Draft</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="px-4 py-2.5 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
        >
          <span>{nextStepLabel}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CreatePlaybookHeader;
