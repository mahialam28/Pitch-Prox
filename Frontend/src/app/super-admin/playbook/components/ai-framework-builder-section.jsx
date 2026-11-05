"use client";

import React from "react";
import ContextInputsSection from "./context-inputs-section";
import InstructionSetSection from "./instruction-set-section";
import ResponseStructureSection from "./response-structure-section";
import PromptExampleSection from "./prompt-example-section";
import { Info } from "lucide-react";

export default function AiFrameworkBuilderSection({
  formData = {},
  onChange = () => {},
}) {
  return (
    <div className="space-y-6">
      {/* ── 1. Context Inputs (What the AI considers) ── */}
      <ContextInputsSection
        inputs={formData.contextInputs}
        onChange={(val) => onChange("contextInputs", val)}
      />

      {/* ── 2. Instruction Set (How the AI should behave) ── */}
      <InstructionSetSection
        instructions={formData.instructions}
        onChange={(val) => onChange("instructions", val)}
      />

      {/* ── 3. Response Structure (How each prompt is formatted) ── */}
      <ResponseStructureSection
        steps={formData.responseStructure}
        onChange={(val) => onChange("responseStructure", val)}
      />

      {/* ── 4. Prompt Example (How the AI will respond) ── */}
      <PromptExampleSection />

      {/* ── Bottom Dynamic Adaptation Notice Banner ── */}
      <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-100/90 flex items-center gap-3 text-xs text-blue-900 shadow-2xs">
        <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
          <Info className="w-3.5 h-3.5" />
        </div>
        <span className="font-medium leading-relaxed">
          The AI will dynamically adapt this framework based on real-time conversation signals and your playbook settings.
        </span>
      </div>
    </div>
  );
}
