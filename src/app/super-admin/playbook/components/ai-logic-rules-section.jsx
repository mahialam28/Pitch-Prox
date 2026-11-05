"use client";

import React, { useState } from "react";
import {
  GitBranch,
  Plus,
  Pencil,
  Trash2,
  AlertOctagon,
  HelpCircle,
  CheckCircle2,
  Sliders,
} from "lucide-react";
import AddLogicRuleModal from "./add-logic-rule-modal";

const AiLogicRulesSection = ({
  formData = {},
  onChange = () => {},
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [newConstraintText, setNewConstraintText] = useState("");

  const logicRules = formData.logicRules || [
    {
      id: 1,
      stage: "Discovery",
      condition: "Prospect mentions high price or budget constraints",
      action: "Trigger 'Value & Cost-of-Inaction' probe cue",
      priority: "High",
      enabled: true,
    },
    {
      id: 2,
      stage: "Discovery",
      condition: "Prospect mentions competitor X",
      action: "Trigger 'Differentiation & Proof Matrix' prompt",
      priority: "High",
      enabled: true,
    },
    {
      id: 3,
      stage: "Handle Objections",
      condition: "Trust score drops below 40 / 100",
      action: "Prompt empathy validation bridge before counter-pitch",
      priority: "Critical",
      enabled: true,
    },
    {
      id: 4,
      stage: "Close",
      condition: "Prospect expresses hesitation on timeline",
      action: "Trigger 'Cost of Waiting Calculation' closing prompt",
      priority: "Normal",
      enabled: true,
    },
  ];

  const negativeConstraints = formData.negativeConstraints || [
    {
      id: 1,
      text: "Never quote fixed pricing before uncovering at least 2 pain points.",
      enabled: true,
    },
    {
      id: 2,
      text: "Do not interrupt when prospect is explaining an objection or concern.",
      enabled: true,
    },
    {
      id: 3,
      text: "Do not offer discounts or concessions in Stage 1 or Stage 2.",
      enabled: true,
    },
  ];

  const handleSaveRule = (rule) => {
    if (editingRule) {
      const updated = logicRules.map((r) => (r.id === rule.id ? rule : r));
      onChange("logicRules", updated);
    } else {
      onChange("logicRules", [...logicRules, rule]);
    }
  };

  const handleDeleteRule = (id) => {
    onChange("logicRules", logicRules.filter((r) => r.id !== id));
  };

  const handleToggleRule = (id) => {
    const updated = logicRules.map((r) =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    );
    onChange("logicRules", updated);
  };

  const handleToggleConstraint = (id) => {
    const updated = negativeConstraints.map((c) =>
      c.id === id ? { ...c, enabled: !c.enabled } : c
    );
    onChange("negativeConstraints", updated);
  };

  const handleAddConstraint = (e) => {
    e.preventDefault();
    if (!newConstraintText.trim()) return;
    const newConstraint = {
      id: Date.now(),
      text: newConstraintText.trim(),
      enabled: true,
    };
    onChange("negativeConstraints", [...negativeConstraints, newConstraint]);
    setNewConstraintText("");
  };

  const handleDeleteConstraint = (id) => {
    onChange(
      "negativeConstraints",
      negativeConstraints.filter((c) => c.id !== id)
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-6 sm:p-7 shadow-sm space-y-7">
      {/* Header */}
      <div>
        <h2 className="text-base sm:text-lg font-bold text-dark-black/80 font-secondary">
          Logic & Rules Engine
        </h2>
        <p className="text-xs text-medium-black mt-0.5 font-normal">
          Configure stage-based routing rules, situational trigger logic, and negative boundary constraints.
        </p>
      </div>

      {/* 1. Stage-Based Routing & Dynamic Cues */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <h3 className="text-xs sm:text-sm font-bold text-dark-black/90 font-secondary uppercase tracking-wider">
              Stage-Based Prompt Routing Logic
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingRule(null);
              setModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Rule</span>
          </button>
        </div>

        <div className="space-y-3">
          {logicRules.map((rule) => (
            <div
              key={rule.id}
              className={`p-4 rounded-xl border transition-all ${
                rule.enabled
                  ? "border-light-gray bg-white hover:border-light-black/30"
                  : "border-light-gray/60 bg-light-gray/20 opacity-60"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-light-gray/60">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primary px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200">
                    {rule.stage}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      rule.priority === "Critical"
                        ? "bg-rose-50 text-rose-600 border border-rose-200"
                        : rule.priority === "High"
                        ? "bg-amber-50 text-amber-600 border border-amber-200"
                        : "bg-light-gray text-medium-black"
                    }`}
                  >
                    {rule.priority} Priority
                  </span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {/* Enable Switch */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={rule.enabled}
                    onClick={() => handleToggleRule(rule.id)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      rule.enabled ? "bg-primary" : "bg-light-gray border-light-gray"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        rule.enabled ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingRule(rule);
                      setModalOpen(true);
                    }}
                    className="p-1 rounded-lg text-medium-black hover:text-dark-black hover:bg-light-gray cursor-pointer"
                    title="Edit Rule"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteRule(rule.id)}
                    className="p-1 rounded-lg text-medium-black hover:text-red-500 hover:bg-red-50 cursor-pointer"
                    title="Delete Rule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* IF Condition & THEN Action */}
              <div className="pt-2.5 space-y-1.5 text-xs">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-dark-black/90 shrink-0 font-secondary">
                    IF:
                  </span>
                  <span className="text-medium-black font-medium">
                    {rule.condition}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-primary shrink-0 font-secondary">
                    THEN:
                  </span>
                  <span className="text-dark-black/95 font-semibold">
                    {rule.action}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Negative Constraints & Guardrail Rules */}
      <div className="space-y-3.5 pt-2 border-t border-light-gray">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <h3 className="text-xs sm:text-sm font-bold text-dark-black/90 font-secondary uppercase tracking-wider">
            Negative Constraints (Never Say / Never Do)
          </h3>
        </div>

        <div className="space-y-2">
          {negativeConstraints.map((constraint) => (
            <div
              key={constraint.id}
              className="p-3 rounded-xl border border-light-gray hover:border-light-black/30 bg-white flex items-center justify-between gap-3 transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <AlertOctagon className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="text-xs text-dark-black/90 font-medium truncate">
                  {constraint.text}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  role="switch"
                  aria-checked={constraint.enabled}
                  onClick={() => handleToggleConstraint(constraint.id)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    constraint.enabled ? "bg-primary" : "bg-light-gray border-light-gray"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      constraint.enabled ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteConstraint(constraint.id)}
                  className="p-1 rounded-lg text-medium-black hover:text-red-500 hover:bg-red-50 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Add Constraint Form */}
        <form onSubmit={handleAddConstraint} className="flex gap-2 pt-1">
          <input
            type="text"
            value={newConstraintText}
            onChange={(e) => setNewConstraintText(e.target.value)}
            placeholder="Add new negative constraint rule..."
            className="flex-1 px-3.5 py-2 rounded-xl border border-light-gray text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-dark-black/90"
          />
          <button
            type="submit"
            disabled={!newConstraintText.trim()}
            className="px-3.5 py-2 rounded-xl bg-light-gray hover:bg-teal-50 text-dark-black hover:text-primary border border-light-gray text-xs font-semibold cursor-pointer disabled:opacity-50 transition-colors"
          >
            Add Rule
          </button>
        </form>
      </div>

      {/* 3. Fallback & Silence Recovery */}
      <div className="space-y-2.5 pt-2 border-t border-light-gray">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <h3 className="text-xs sm:text-sm font-bold text-dark-black/90 font-secondary uppercase tracking-wider">
            Silence & Ambiguity Recovery Directives
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl border border-light-gray bg-light-gray/20 space-y-1">
            <span className="font-bold text-dark-black/90">Prospect Gives Non-Committal Answer (&quot;Maybe&quot;, &quot;Send Email&quot;)</span>
            <p className="text-[11px] text-light-black">
              Prompt the rep to establish email criteria: &quot;Gladly. So I send only what matters to you, what is the single most important metric?&quot;
            </p>
          </div>
          <div className="p-3.5 rounded-xl border border-light-gray bg-light-gray/20 space-y-1">
            <span className="font-bold text-dark-black/90">Dead Silence &gt; 4 Seconds</span>
            <p className="text-[11px] text-light-black">
              Prompt a check-in question: &quot;Take your time. Are you comparing this to where you are right now?&quot;
            </p>
          </div>
        </div>
      </div>

      {/* Add Logic Rule Modal */}
      <AddLogicRuleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveRule}
        editRule={editingRule}
      />
    </div>
  );
};

export default AiLogicRulesSection;
