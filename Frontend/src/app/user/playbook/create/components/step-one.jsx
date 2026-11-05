"use client";

import React, { useState, useEffect } from "react";
import { WatchTutorialModal, ExamplePlaybooksModal } from "./playbook-help-modals";
import {
  Pencil,
  Sparkles,
  Zap,
  Flag,
  Eye,
  Play,
  Plus,
  Check,
  Building2,
  Users,
  Calendar,
  ArrowLeft,
  ArrowRight,
  X,
  TrendingUp,
  HeartHandshake,
  RotateCcw,
} from "lucide-react";
import Text from "@/components/texts/text";
import ProfileInput from "@/components/forms/profile-input";
import SettingsDropdown from "@/components/shared/dropdown/settings-dropdown";
import Dropdown from "@/components/shared/dropdown/dropdown";

const leadTypesData = [
  { value: "Expired Listings", label: "Expired Listings", desc: "Listings that recently expired without selling." },
  { value: "Pre-Expired Listings", label: "Pre-Expired Listings", desc: "Listings approaching expiration." },
  { value: "FSBO", label: "FSBO (For Sale By Owner)", desc: "Owners selling without an agent." },
  { value: "Absentee Owners", label: "Absentee Owners", desc: "Owners who do not occupy the property (often investors)." },
  { value: "Circle Prospecting", label: "Circle Prospecting", desc: "Homeowners near a listing or recent sale." },
  { value: "Just Listed", label: "Just Listed", desc: "Prospecting around a newly listed property." },
  { value: "Just Sold", label: "Just Sold", desc: "Prospecting around a recently sold property." },
  { value: "Probate", label: "Probate", desc: "Properties involved in probate or estate administration." },
  { value: "Trust & Estate", label: "Trust & Estate", desc: "Trust-owned properties and estate planning situations." },
  { value: "Pre-Foreclosure", label: "Pre-Foreclosure", desc: "Owners showing signs of mortgage distress before foreclosure." },
  { value: "Foreclosure / REO", label: "Foreclosure / REO", desc: "Bank-owned or foreclosure-related opportunities." },
  { value: "Divorce", label: "Divorce", desc: "Homeowners involved in divorce proceedings." },
  { value: "Tax Delinquent", label: "Tax Delinquent", desc: "Owners with delinquent property taxes." },
  { value: "Vacant Properties", label: "Vacant Properties", desc: "Homes appearing vacant or abandoned." },
  { value: "Investor / Cash Buyers", label: "Investor / Cash Buyers", desc: "Investors purchasing for rental, flip, or portfolio growth." },
  { value: "Past Clients & Sphere", label: "Past Clients & Sphere", desc: "Previous clients, referrals, and sphere of influence follow-up." },
];

const StepOne = ({ formData, setFormData, onBack, onNext }) => {
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");

  // Auto-select Real Estate on mount
  useEffect(() => {
    setFormData((prev) => ({ ...prev, industry: "Real Estate" }));
  }, [setFormData]);

  const handleLeadTypeToggle = (value) => {
    const current = formData.leadType || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setFormData((prev) => ({ ...prev, leadType: updated }));
  };
  const [previewData, setPreviewData] = useState({
    playbookName: "",
    shortDescription: "",
    industry: "",
    leadType: "",
    experienceLevel: "",
    corePhilosophy: "",
    selectedGoal: "",
  });

  const generatePreview = () => {
    setPreviewData({ ...formData });
  };

  const defaultTags = ["Here's the thing", "Bottom line", "What I've seen is..."];

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

  const goalOptions = [
    {
      id: "trust",
      title: "Build stronger trust",
      desc: "Create deeper connections and credibility with every prospect.",
      icon: HeartHandshake,
    },
    {
      id: "appointments",
      title: "Increase appointments",
      desc: "Get more yes's and convert conversations into next steps.",
      icon: Calendar,
    },
    {
      id: "deals",
      title: "Close more deals",
      desc: "Turn more opportunities into closed-won business faster.",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT / MAIN COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Basic Information */}
          <div className="bg-white rounded-2xl p-6 border border-light-gray shadow-sm space-y-5">
            <div className="flex items-center gap-3.5">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary">
                <Pencil className="w-5 h-5" />
              </div>
              <div>
                <Text variant="regular" className="font-bold">
                  Basic Information
                </Text>
                <Text variant="smaller" className="mt-0.5">
                  Start by giving your playbook a name and purpose.
                </Text>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ProfileInput
                label="Playbook Name"
                name="playbookName"
                placeholder="e.g., Daniel G. Method"
                value={formData.playbookName || ""}
                onChange={(e) => handleInputChange("playbookName", e.target.value)}
              />
              <div className="flex flex-col space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-medium-black">
                    Short Description
                  </label>
                  <Text variant="smaller" className="text-light-black">
                    {(formData.shortDescription || "").length}/120
                  </Text>
                </div>
                <ProfileInput
                  textarea
                  rows={2}
                  maxLength={120}
                  placeholder="e.g., My approach to building trust and closing more high-value deals."
                  value={formData.shortDescription || ""}
                  onChange={(e) => handleInputChange("shortDescription", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-medium-black mb-1.5">
                  Select Industry / Niche
                </label>
                <div className="w-full px-4 py-2.5 text-sm bg-light-gray/60 border border-light-gray rounded-xl text-medium-black cursor-not-allowed">
                  Real Estate
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-medium-black">
                  Best For Lead Types <span className="text-xs text-light-black font-normal">(Select all that apply)</span>
                </label>

                {/* Multi-select dropdown */}
                <Dropdown
                  label={formData.leadType?.length > 0 ? `${formData.leadType.length} lead type${formData.leadType.length > 1 ? "s" : ""} selected` : "Select lead types"}
                  items={leadTypesData}
                  selected={formData.leadType || []}
                  onSelect={handleLeadTypeToggle}
                  className="w-full"
                  multiSelect
                />

                {/* Selected tags summary */}
                {formData.leadType?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {formData.leadType.map((val) => (
                      <span
                        key={val}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-light-teal text-primary text-[10px] font-semibold rounded-md border border-primary/20"
                      >
                        {val}
                        <button
                          type="button"
                          onClick={() => handleLeadTypeToggle(val)}
                          className="hover:text-dark-black transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-medium-black mb-1.5">
                  Experience Level
                </label>
                <SettingsDropdown
                  label="Select experience level"
                  items={[
                    { value: "Beginner", label: "Beginner" },
                    { value: "Intermediate", label: "Intermediate" },
                    { value: "Advanced", label: "Advanced" },
                  ]}
                  selected={formData.experienceLevel || ""}
                  onSelect={(v) => handleInputChange("experienceLevel", v)}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Your Unique Voice */}
          <div className="bg-white rounded-2xl p-6 border border-light-gray shadow-sm space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <Text variant="regular" className="font-bold">
                  Your Unique Voice
                </Text>
                <Text variant="smaller" className="mt-0.5">
                  Add phrases, words, or expressions you use often. PitchProX will incorporate them naturally.
                </Text>
              </div>
            </div>

            <div className="relative">
              <ProfileInput
                textarea
                rows={3}
                placeholder="Add your go-to phrases, words you love to use, or expressions that sound like you..."
                value={formData.voiceDescription || ""}
                onChange={(e) => handleInputChange("voiceDescription", e.target.value)}
              />
              <Text variant="smaller" className="absolute bottom-3 right-3 text-light-black">
                {(formData.voiceDescription || "").length}/500
              </Text>
            </div>

            <div className="space-y-3">
              {formData.uniqueVoiceTags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.uniqueVoiceTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-light-teal text-primary font-medium text-xs rounded-lg border border-primary/20"
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

              <div className="flex flex-wrap items-center gap-2">
                <Text variant="smaller" className="!font-bold !text-medium-black tracking-wider mr-1">
                  EXAMPLES:
                </Text>

                {defaultTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddTag(tag)}
                    className="px-3 py-1 bg-light-gray hover:bg-light-gray/80 text-medium-black text-xs rounded-lg transition cursor-pointer"
                  >
                    &ldquo;{tag}&rdquo;
                  </button>
                ))}

                <div className="inline-flex items-center gap-1 border border-dashed border-light-gray rounded-lg px-2.5 py-1 bg-white focus-within:border-primary">
                  <input
                    type="text"
                    placeholder="At the end of the day"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}                     className="text-xs bg-transparent focus:outline-none w-36 text-slate-800 placeholder-slate-400"
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
            </div>
          </div>

          {/* Section 3: Core Philosophy */}
          <div className="bg-white rounded-2xl p-6 border border-light-gray shadow-sm space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <Text variant="regular" className="font-bold">
                  Your Playbook&apos;s Core Philosophy
                </Text>
                <Text variant="smaller" className="mt-0.5">
                  What&apos;s the #1 principle or belief that drives your sales approach?
                </Text>
              </div>
            </div>

            <div className="relative">
              <ProfileInput
                textarea
                rows={3}
                placeholder="Write 3-5 principles that define how you help clients and close deals..."
                value={formData.corePhilosophy || ""}
                onChange={(e) => handleInputChange("corePhilosophy", e.target.value)}
              />
              <Text variant="smaller" className="absolute bottom-3 right-3 text-light-black">
                {(formData.corePhilosophy || "").length}/1000
              </Text>
            </div>
          </div>

          {/* Section 4: Goals & Outcomes */}
          <div className="bg-white rounded-2xl p-6 border border-light-gray shadow-sm space-y-5">
            <div className="flex items-center gap-3.5">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary">
                <Flag className="w-5 h-5" />
              </div>
              <div>
                <Text variant="regular" className="font-bold">
                  Goals &amp; Outcomes
                </Text>
                <Text variant="smaller" className="mt-0.5">
                  What do you want to achieve most with this playbook?
                </Text>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {goalOptions.map((goal) => {
                const Icon = goal.icon;
                const isSelected = formData.selectedGoal === goal.id;
                return (
                  <div
                    key={goal.id}
                    onClick={() => handleInputChange("selectedGoal", goal.id)}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between min-h-[150px] relative ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                        : "border-light-gray bg-white hover:border-medium-black/20 hover:shadow-sm"
                    }`}
                  >
                    {/* Top Row */}
                    <div className="flex justify-between items-start">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                          isSelected ? "bg-primary text-white" : "bg-light-teal text-primary"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                          isSelected
                            ? "border-primary bg-primary"
                            : "border-light-gray bg-white"
                        }`}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                    </div>

                    {/* Bottom Content */}
                    <div className="mt-3">
                      <Text variant="small" className="!font-bold !text-dark-black">
                        {goal.title}
                      </Text>
                      <Text variant="smaller" className="text-light-black mt-1 leading-relaxed">
                        {goal.desc}
                      </Text>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT / SIDEBAR COLUMN */}
        <div className="space-y-6">
          {/* Playbook Preview */}
          <div className="bg-white rounded-2xl p-5 border border-light-gray shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              <Text variant="regular" className="font-bold !text-primary">
                Playbook Preview
              </Text>
            </div>
            <Text variant="small" className="text-light-black">
              This is how your playbook will appear.
            </Text>

            <div className="p-4 rounded-xl bg-light-gray border border-light-gray/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-light-gray text-medium-black font-bold flex items-center justify-center text-sm">
                CP
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Text variant="smaller" className="!font-bold !text-dark-black">
                    {previewData.playbookName || "Custom Playbook"}
                  </Text>
                  <span className="px-1.5 py-0.5 text-[10px] bg-light-gray text-medium-black font-medium rounded uppercase">
                    DRAFT
                  </span>
                </div>
                <Text variant="smaller" className="text-light-black leading-tight">
                  {previewData.shortDescription || "New Playbook"}
                </Text>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-light-black shrink-0" />
                <div>
                  <Text variant="small" className="!font-medium text-medium-black">
                    Industry / Niche
                  </Text>
                  <Text variant="smaller" className="text-light-black">
                    {previewData.industry || "Not selected"}
                  </Text>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-light-black shrink-0" />
                <div>
                  <Text variant="small" className="!font-medium text-medium-black">
                    Best For Lead Types
                  </Text>
                  <Text variant="smaller" className="text-light-black">
                    {previewData.leadType?.length > 0
                      ? previewData.leadType.slice(0, 3).join(", ") + (previewData.leadType.length > 3 ? ` +${previewData.leadType.length - 3} more` : "")
                      : "Not selected"}
                  </Text>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-light-black shrink-0" />
                <div>
                  <Text variant="small" className="!font-medium text-medium-black">
                    Goal
                  </Text>
                  <Text variant="smaller" className="text-light-black">
                    {goalOptions.find((g) => g.id === previewData.selectedGoal)?.title || "Not selected"}
                  </Text>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-light-black shrink-0" />
                <div>
                  <Text variant="small" className="!font-medium text-medium-black">
                    Core Philosophy
                  </Text>
                  <Text variant="smaller" className="text-light-black">
                    {previewData.corePhilosophy ? "Defined" : "Not defined yet"}
                  </Text>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={generatePreview}
              className="w-full py-2.5 px-4 rounded-xl border-2 border-primary text-primary font-semibold text-sm hover:bg-primary/5 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Generate Preview
            </button>

            <div className="p-3 bg-light-teal/40 rounded-xl border border-light-teal/50 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <Text variant="small" className="!font-semibold !text-dark-black">
                  You&apos;re in Control
                </Text>
                <Text variant="smaller" className="text-primary">
                  You can always edit and refine your playbook as your style evolves.
                </Text>
              </div>
            </div>
          </div>

          {/* Why Create Card */}
          <div className="bg-white rounded-2xl p-5 border border-light-gray shadow-sm space-y-3">
            <Text variant="regular" className="font-bold !text-dark-black">
              Why Create a Custom Playbook?
            </Text>
            <ul className="space-y-2">
              {[
                "Reflect your unique voice and style",
                "Get AI prompts tailored to your approach",
                "Maintain consistency across every call",
                "Improve outcomes with your proven methods",
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 stroke-[2.5]" />
                  <Text variant="small" className="text-medium-black">
                    {text}
                  </Text>
                </li>
              ))}
            </ul>
          </div>

          {/* Tutorial Card */}
          <div className="bg-white rounded-2xl p-5 border border-light-gray shadow-sm flex items-center justify-between">
            <div>
              <Text variant="regular" className="font-bold !text-dark-black">
                Need help getting started?
              </Text>
              <Text variant="smaller" className="text-light-black mt-0.5">
                Watch our quick tutorial on building your custom playbook.
              </Text>
            </div>
            <button
              type="button"
              aria-label="Watch tutorial"
              onClick={() => setTutorialOpen(true)}
              className="p-3 bg-light-teal text-primary hover:bg-light-teal/80 rounded-xl transition cursor-pointer shrink-0"
            >
              <Play className="w-4 h-4 fill-current" />
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
              Next: Basic Info
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <WatchTutorialModal isOpen={tutorialOpen} onClose={() => setTutorialOpen(false)} />
    </div>
  );
};

export default StepOne;