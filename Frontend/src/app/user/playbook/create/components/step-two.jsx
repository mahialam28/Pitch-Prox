"use client";

import React, { useState } from "react";
import { ExamplePlaybooksModal } from "./playbook-help-modals";
import { showSavedToast } from "@/lib/toast";
import {
  Mic,
  Eye,
  RotateCcw,
  MessageSquare,
  ShieldCheck,
  Lightbulb,
  Zap,
  BookOpen,
  Plus,
  ArrowLeft,
  ArrowRight,
  X,
  Check,
} from "lucide-react";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";
import SettingsDropdown from "@/components/shared/dropdown/settings-dropdown";

const StepTwo = ({ formData, setFormData, onBack, onNext }) => {
  const [examplesOpen, setExamplesOpen] = useState(false);
  // "Use as template" fills the voice fields from Step 2
  const applyTemplate = (example) => {
    setFormData((prev) => ({
      ...prev,
      voiceDescription: example.template.voiceDescription,
      corePrinciples: example.template.corePrinciples,
      uniqueVoiceTags: example.template.uniqueVoiceTags,
    }));
    showSavedToast("Template applied", `${example.title} voice and principles were added to Step 2.`);
  };
  const [tagInput, setTagInput] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);
  const [previewData, setPreviewData] = useState({
    tone: "",
    communicationStyle: "",
    energyLevel: "",
    sentenceStyle: "",
    formality: "",
    useOfHumor: "",
    voiceDescription: "",
    corePrinciples: "",
  });

  const generatePreview = () => {
    setPreviewData({ ...formData });
    setHasGenerated(true);
  };

  const defaultTags = ["Here's the thing", "Bottom line", "What I've seen is..."];

  const toneOptions = [
    { id: "Confident", label: "Confident" },
    { id: "Friendly", label: "Friendly" },
    { id: "Calm", label: "Calm" },
    { id: "Direct", label: "Direct" },
    { id: "Empathetic", label: "Empathetic" },
    { id: "Authoritative", label: "Authoritative" },
  ];

  const rangeFill = (val, min, max) =>
    `linear-gradient(to right, #0EADAB 0%, #0EADAB ${((val - min) / (max - min)) * 100}%, #e5e7eb ${((val - min) / (max - min)) * 100}%, #e5e7eb 100%)`;

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTag = (tagToAdd) => {
    const tag = tagToAdd || tagInput.trim();
    if (tag && !formData.uniqueVoiceTags?.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        uniqueVoiceTags: [...(prev.uniqueVoiceTags || []), tag],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      uniqueVoiceTags: prev.uniqueVoiceTags.filter((t) => t !== tagToRemove),
    }));
  };

  const selectedTone = formData.tone || "Confident";

  return (
    <div className="space-y-6 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT / MAIN COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Define Your Communication Style */}
          <div className="bg-white rounded-2xl p-6 border border-light-gray shadow-sm space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3.5">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <Text variant="regular" className="font-bold">
                  Define Your Communication Style
                </Text>
                <Text variant="smaller" className="mt-0.5">
                  Choose the style and tone that best represents how you want PitchProX to coach and prompt you.
                </Text>
              </div>
            </div>

            {/* Controls Grid */}
            <div className="space-y-6 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Overall Tone */}
                <div>
                  <Text variant="smaller" className="!font-bold !text-medium-black uppercase tracking-wider mb-3 block">
                    OVERALL TONE
                  </Text>
                  <div className="grid grid-cols-2 gap-2">
                    {toneOptions.map((tone) => {
                      const isSelected = selectedTone === tone.id;
                      return (
                        <button
                          key={tone.id}
                          type="button"
                          onClick={() => handleInputChange("tone", tone.id)}
                          className={`relative py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center ${
                            isSelected
                              ? "border-primary text-primary bg-white ring-1 ring-primary"
                              : "border-light-gray text-medium-black bg-white hover:border-medium-black/30"
                          }`}
                        >
                          {tone.label}
                          {isSelected && (
                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary text-white rounded-full flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Communication Style */}
                <div>
                  <Text variant="smaller" className="!font-bold !text-medium-black uppercase tracking-wider mb-1 block">
                    COMMUNICATION STYLE
                  </Text>
                  <Text variant="extraSmall" className="text-light-black mb-2 block">
                    How you prefer to communicate on calls.
                  </Text>
                  <SettingsDropdown
                    label="Select style"
                    items={[
                      { value: "Consultative", label: "Consultative" },
                      { value: "Direct", label: "Direct" },
                      { value: "Challenger", label: "Challenger" },
                      { value: "Collaborative", label: "Collaborative" },
                    ]}
                    selected={formData.communicationStyle || ""}
                    onSelect={(v) => handleInputChange("communicationStyle", v)}
                    className="w-full"
                  />
                </div>

                {/* Energy Level */}
                <div>
                  <Text variant="smaller" className="!font-bold !text-medium-black uppercase tracking-wider mb-1 block">
                    ENERGY LEVEL
                  </Text>
                  <Text variant="extraSmall" className="text-light-black mb-4 block">
                    How energetic should the prompts feel?
                  </Text>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="1"
                      value={formData.energyLevel ?? 1}
                      onChange={(e) => handleInputChange("energyLevel", parseInt(e.target.value, 10))}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white"
                      style={{ background: rangeFill(formData.energyLevel ?? 1, 0, 2) }}
                    />
                    <div className="flex justify-between text-[10px] font-bold tracking-wider text-medium-black uppercase">
                      <span>Low</span>
                      <span>Medium</span>
                      <span>High</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-light-gray my-4" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sentence Style */}
                <div>
                  <Text variant="smaller" className="!font-bold !text-medium-black uppercase tracking-wider mb-1 block">
                    SENTENCE STYLE
                  </Text>
                  <Text variant="extraSmall" className="text-light-black mb-2 block">
                    How should your prompts be written?
                  </Text>
                  <SettingsDropdown
                    label="Select style"
                    items={[
                      { value: "Short & Conversational", label: "Short & Conversational" },
                      { value: "Detailed & Analytical", label: "Detailed & Analytical" },
                      { value: "Bullet Points", label: "Bullet Points" },
                    ]}
                    selected={formData.sentenceStyle || ""}
                    onSelect={(v) => handleInputChange("sentenceStyle", v)}
                    className="w-full"
                  />
                </div>

                {/* Formality */}
                <div>
                  <Text variant="smaller" className="!font-bold !text-medium-black uppercase tracking-wider mb-1 block">
                    FORMALITY
                  </Text>
                  <Text variant="extraSmall" className="text-light-black mb-2 block">
                    How formal should the language be?
                  </Text>
                  <SettingsDropdown
                    label="Select formality"
                    items={[
                      { value: "Professional", label: "Professional" },
                      { value: "Casual", label: "Casual" },
                      { value: "Formal", label: "Formal" },
                    ]}
                    selected={formData.formality || ""}
                    onSelect={(v) => handleInputChange("formality", v)}
                    className="w-full"
                  />
                </div>

                {/* Use of Humor */}
                <div>
                  <Text variant="smaller" className="!font-bold !text-medium-black uppercase tracking-wider mb-1 block">
                    USE OF HUMOR
                  </Text>
                  <Text variant="extraSmall" className="text-light-black mb-4 block">
                    How much humor should be used?
                  </Text>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="1"
                      value={formData.useOfHumor ?? 1}
                      onChange={(e) => handleInputChange("useOfHumor", parseInt(e.target.value, 10))}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white"
                      style={{ background: rangeFill(formData.useOfHumor ?? 1, 0, 2) }}
                    />
                    <div className="flex justify-between text-[10px] font-bold tracking-wider text-medium-black uppercase">
                      <span>None</span>
                      <span>Light</span>
                      <span>Moderate</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Words & Phrases to Avoid */}
          <div className="bg-white rounded-2xl p-6 border border-light-gray shadow-sm space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <Text variant="regular" className="font-bold">
                  Words &amp; Phrases to Avoid
                </Text>
                <Text variant="smaller" className="mt-0.5">
                  Add words, phrases, or expressions you never want PitchProX to suggest.
                </Text>
              </div>
            </div>

            <div className="relative">
              <textarea
                rows={4}
                placeholder="Add words or phrases to avoid, like: 'Just checking in', 'I was wondering...'"
                value={formData.voiceDescription || ""}
                onChange={(e) => handleInputChange("voiceDescription", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white transition-all duration-200 resize-none"
              />
            </div>

            <div className="space-y-3">
              {formData.uniqueVoiceTags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.uniqueVoiceTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 font-medium text-xs rounded-lg border border-rose-200"
                    >
                      &ldquo;{tag}&rdquo;
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-dark-black transition focus:outline-none cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Text variant="smaller" className="!font-bold !text-medium-black tracking-wider">
                    EXAMPLES:
                  </Text>

                  {["Just checking in", "I was wondering...", "Hopefully", "Cheap", "Honestly", "Trust me", "To be honest"].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleAddTag(tag)}
                      className="px-3 py-1 bg-light-gray hover:bg-light-gray/80 text-medium-black text-xs rounded-lg transition cursor-pointer font-medium"
                    >
                      &ldquo;{tag}&rdquo;
                    </button>
                  ))}

                  <div className="inline-flex items-center gap-1 border border-dashed border-light-gray rounded-lg px-2.5 py-1 bg-white focus-within:border-primary">
                    <input
                      type="text"
                      placeholder="&ldquo;Add a phrase to avoid&rdquo;"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      className="text-xs bg-transparent focus:outline-none w-36 text-slate-800 placeholder-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddTag()}
                      className="text-primary hover:text-medium-teal text-xs font-medium flex items-center gap-0.5 cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add more
                    </button>
                  </div>
                </div>

                <Text variant="extraSmall" className="text-light-black">
                  {(formData.voiceDescription || "").length}/500
                </Text>
              </div>
            </div>
          </div>

          {/* Section 3: Conversation Guardrails */}
          <div className="bg-white rounded-2xl p-6 border border-light-gray shadow-sm space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <Text variant="regular" className="font-bold">
                  Conversation Guardrails
                </Text>
                <Text variant="smaller" className="mt-0.5">
                  Define the rules PitchProX should always follow when coaching you.
                </Text>
              </div>
            </div>

            <div className="relative">
              <textarea
                rows={4}
                placeholder="Describe the rules or principles you want PitchProX to consistently follow while coaching your conversations..."
                value={formData.corePrinciples || ""}
                onChange={(e) => handleInputChange("corePrinciples", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white transition-all duration-200 resize-none"
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Text variant="smaller" className="!font-bold !text-medium-black tracking-wider w-full mb-1">
                EXAMPLES:
              </Text>
              {[
                "Never pressure the prospect.",
                "Don't interrupt emotional moments.",
                "Don't rush into pricing.",
                "Always acknowledge concerns first.",
                "Ask permission before transitioning topics.",
                "Avoid assumptions.",
                "Keep recommendations consultative.",
              ].map((example, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-light-gray text-medium-black text-xs rounded-lg border border-light-gray"
                >
                  {example}
                </span>
              ))}
            </div>

            <div className="flex justify-end pt-1">
              <Text variant="extraSmall" className="text-light-black">
                {(formData.corePrinciples || "").length}/1000
              </Text>
            </div>
          </div>

        </div>

        {/* RIGHT / SIDEBAR COLUMN */}
        <div className="space-y-6">
          {/* Live Preview Card */}
          <div className="bg-white rounded-2xl p-6 border border-light-gray shadow-sm space-y-5">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              <Text variant="regular" className="font-bold !text-primary">
                Live Preview
              </Text>
            </div>
            <Text variant="small" className="text-light-black">
              This is how your AI coaching will start to sound.
            </Text>

            {/* Bubble Message Box */}
            <div className="p-5 rounded-2xl bg-light-gray/60 border border-light-gray space-y-3">
              {hasGenerated ? (
                <>
                  <Title variant="small" className="!text-sm !font-bold !text-dark-black">
                    {previewData.tone
                      ? `Got it \u2014 ${previewData.tone.toLowerCase()} and ready.`
                      : "Your coaching prompt preview"}
                  </Title>
                  <Text variant="small" className="text-medium-black leading-relaxed">
                    I&apos;ll keep my prompts{" "}
                    {[
                      previewData.tone?.toLowerCase(),
                      previewData.communicationStyle?.toLowerCase(),
                    ]
                      .filter(Boolean)
                      .join(", ") || "confident and clear"}
                    {previewData.formality
                      ? ` \u2014 ${previewData.formality.toLowerCase()}`
                      : ""}
                    {previewData.sentenceStyle
                      ? `, ${previewData.sentenceStyle.toLowerCase()}`
                      : ""}
                    {previewData.useOfHumor === 2
                      ? ", with a light touch of humor"
                      : previewData.useOfHumor === 0
                        ? ", keeping it straight to the point"
                        : ""}
                    .
                  </Text>
                  {previewData.voiceDescription && (
                    <Text variant="small" className="text-medium-black leading-relaxed border-t border-light-gray pt-3 mt-1">
                      I&apos;ll weave in your natural language like &ldquo;
                      {previewData.uniqueVoiceTags?.[0] ||
                        previewData.voiceDescription.split(" ").slice(0, 5).join(" ")}
                      &rdquo; to keep it authentic to you.
                    </Text>
                  )}
                  {!previewData.voiceDescription && (
                    <Text variant="small" className="text-medium-black leading-relaxed">
                      Let&apos;s build a playbook that wins more conversations.
                    </Text>
                  )}
                </>
              ) : (
                <>
                  <Title variant="small" className="!text-sm !font-bold !text-dark-black">
                    Your preview will appear here
                  </Title>
                  <Text variant="small" className="text-medium-black leading-relaxed">
                    Fill in your style preferences and click
                    &ldquo;Generate Preview&rdquo; to see how your AI
                    coaching will sound.
                  </Text>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={generatePreview}
              className="w-full py-2.5 px-4 rounded-xl border-2 border-primary text-primary font-semibold text-sm hover:bg-primary/5 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              {hasGenerated ? "Regenerate Preview" : "Generate Preview"}
            </button>
          </div>

          {/* Style Tips Card */}
          <div className="bg-white rounded-2xl p-6 border border-light-gray shadow-sm space-y-5">
            <div className="flex items-center gap-3.5">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                <Text variant="regular" className="font-bold">
                  Style Tips
                </Text>
                <Text variant="smaller" className="mt-0.5">
                  The more specific you are, the better PitchProX can match your voice.
                </Text>
              </div>
            </div>

            <ul className="space-y-3 pt-2">
              {[
                "Be authentic and true to your natural style",
                "Use examples of phrases you say often",
                "Think about how you want to make people feel",
                "Your style can be refined and changed later",
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5 stroke-[2.5]" />
                  <Text variant="small" className="text-medium-black font-medium leading-snug">
                    {text}
                  </Text>
                </li>
              ))}
            </ul>
          </div>

          {/* Need Inspiration? Card */}
          <div className="bg-white rounded-2xl p-6 border border-light-gray shadow-sm text-center space-y-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mx-auto">
              <Zap className="w-5 h-5" />
            </div>

            <div>
              <Text variant="regular" className="font-bold !text-dark-black">
                Need Inspiration?
              </Text>
              <Text variant="small" className="text-light-black mt-1 max-w-[220px] mx-auto leading-relaxed">
                See example playbooks to get ideas for your style.
              </Text>
            </div>

            <button
              type="button"
              onClick={() => setExamplesOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl border-2 border-primary text-primary font-semibold text-sm hover:bg-primary/5 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              View Example Playbooks
            </button>
          </div>
        </div>
      </div>

      {/* ── Bottom Navigation Bar ── */}
      <div className="w-full flex items-center justify-between gap-4 pt-4 border-t border-light-gray">
        <div>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-light-gray rounded-xl text-sm font-semibold text-dark-black/80 hover:bg-light-gray transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-medium-black" />
              Back
            </button>
          )}
        </div>
        <div>
          {onNext && (
            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-medium-teal text-white font-semibold text-sm shadow-sm transition-all duration-300 cursor-pointer"
            >
              Next: Your Style
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <ExamplePlaybooksModal isOpen={examplesOpen} onClose={() => setExamplesOpen(false)} onUseTemplate={applyTemplate} />
    </div>
  );
};

export default StepTwo;