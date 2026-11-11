"use client";

import toast from "react-hot-toast";
import { uploadBuilderFile } from "../builder-files";

import React, { useState, useRef } from "react";
import {
  FileText,
  UploadCloud,
  X,
  ChevronDown,
  Plus,
} from "lucide-react";
import Text from "@/components/texts/text";
import SettingsDropdown from "@/components/shared/dropdown/settings-dropdown";

const categoryOptions = [
  { value: "prospecting-outreach", label: "Prospecting & Outreach" },
  { value: "discovery-qualification", label: "Discovery & Qualification" },
  { value: "objection-handling", label: "Objection Handling" },
  { value: "appointment-setting", label: "Appointment Setting" },
  { value: "presentation-value", label: "Presentation & Value Building" },
  { value: "negotiation", label: "Negotiation" },
  { value: "closing", label: "Closing" },
  { value: "follow-up-nurture", label: "Follow-Up & Nurture" },
  { value: "sales-methodology", label: "Sales Methodology" },
  { value: "relationship-referral", label: "Relationship / Referral" },
  { value: "retention-expansion", label: "Retention & Expansion" },
];

const industryOptions = [
  { value: "real-estate", label: "Real Estate" },
  { value: "saas", label: "SaaS & Tech" },
  { value: "finance", label: "Financial Services" },
  { value: "insurance", label: "Insurance" },
  { value: "healthcare", label: "Healthcare" },
  { value: "general", label: "All Industries" },
];

const experienceOptions = [
  { value: "beginner", label: "Beginner" },
  { value: "beginner-intermediate", label: "Beginner–Intermediate" },
  { value: "intermediate", label: "Intermediate" },
  { value: "intermediate-to-advanced", label: "Intermediate–Advanced" },
  { value: "advanced", label: "Advanced" },
  { value: "all-levels", label: "All Experience Levels" },
];

const styleOptions = [
  { value: "direct", label: "Direct" },
  { value: "consultative", label: "Consultative" },
  { value: "relationship-led", label: "Relationship-Led" },
  { value: "insight-led", label: "Insight-Led" },
  { value: "question-led", label: "Question-Led" },
  { value: "advisory", label: "Advisory" },
  { value: "persuasive", label: "Persuasive" },
  { value: "educational", label: "Educational" },
  { value: "high-energy", label: "High-Energy" },
  { value: "low-pressure", label: "Low-Pressure" },
];

// Professional Custom Radio Component
const CustomRadio = ({ label, value, selected, onChange, name }) => {
  const isChecked = selected === value;
  return (
    <label
      onClick={() => onChange(name, value)}
      className="flex items-center gap-2 cursor-pointer select-none group py-0.5"
    >
      <div
        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-200 shrink-0 ${
          isChecked
            ? "border-primary bg-white ring-2 ring-primary/20"
            : "border-light-black/40 bg-white group-hover:border-medium-black"
        }`}
      >
        {isChecked && (
          <div className="w-2 h-2 rounded-full bg-primary" />
        )}
      </div>
      <span
        className={`text-xs transition-colors duration-150 ${
          isChecked
            ? "font-semibold text-dark-black/90"
            : "font-medium text-medium-black group-hover:text-dark-black/80"
        }`}
      >
        {label}
      </span>
    </label>
  );
};

const PlaybookDetailsSection = ({
  formData,
  onChange = () => {},
  currentUserName = "",
}) => {
  const fileInputRef = useRef(null);
  const [coverPreview, setCoverPreview] = useState(formData.coverImage || null);
  const [leadTypes, setLeadTypes] = useState(
    formData.leadTypes || ["Expired", "FSBO", "Pre-Expired", "Probate", "Absentee", "Past Clients"]
  );
  const [leadDropdownOpen, setLeadDropdownOpen] = useState(false);
  const [newLeadInput, setNewLeadInput] = useState("");

  // The cover is uploaded straight away so the saved playbook keeps a real link to it
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const saved = await uploadBuilderFile(file, "cover");
      setCoverPreview(saved.url);
      onChange("coverImage", saved.url);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const removeLeadType = (tag) => {
    const updated = leadTypes.filter((t) => t !== tag);
    setLeadTypes(updated);
    onChange("leadTypes", updated);
  };

  const addLeadType = (tag) => {
    const trimmed = tag.trim();
    if (trimmed && !leadTypes.includes(trimmed)) {
      const updated = [...leadTypes, trimmed];
      setLeadTypes(updated);
      onChange("leadTypes", updated);
      setNewLeadInput("");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-6 sm:p-7 shadow-sm space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3.5">
        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-dark-black/80 font-secondary">
            Playbook Details
          </h2>
          <Text variant="smaller" className="text-medium-black mt-0.5">
            Define the core information about this playbook.
          </Text>
        </div>
      </div>

      {/* Top Details Grid (Cover Upload + Name & Description) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-1">
        {/* Upload Cover Box */}
        <div className="md:col-span-4 lg:col-span-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative w-full aspect-square max-h-[160px] md:max-h-full rounded-2xl border-2 border-dashed border-light-gray hover:border-primary bg-light-gray/40 hover:bg-primary/5 transition-all duration-200 flex flex-col items-center justify-center text-center p-4 cursor-pointer group"
          >
            {coverPreview ? (
              <>
                <img
                  src={coverPreview}
                  alt="Playbook Cover"
                  className="w-full h-full object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCoverPreview(null);
                    onChange("coverImage", null);
                  }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-dark-black/70 text-white flex items-center justify-center hover:bg-rose-500 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-white text-primary flex items-center justify-center shadow-xs mb-2 group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-dark-black/80 group-hover:text-primary transition-colors">
                  Upload Cover
                </span>
                <span className="text-[10px] text-light-black font-medium mt-0.5">
                  JPG, PNG (1:1)
                </span>
                <span className="text-[9px] text-light-black/80 mt-0.5">
                  Recommended 1024×1024
                </span>
              </>
            )}
          </div>
        </div>

        {/* Playbook Name & Short Description */}
        <div className="md:col-span-8 lg:col-span-9 flex flex-col gap-4">
          {/* Playbook Name */}
          <div>
            <label className="block text-xs font-medium text-medium-black mb-1.5">
              Playbook Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.playbookName || ""}
              onChange={(e) => onChange("playbookName", e.target.value)}
              placeholder="e.g. Herjavec Sales Method"
              className="w-full px-4 py-2.5 rounded-xl border border-light-gray bg-white text-dark-black/80 text-xs sm:text-sm font-normal focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-light-black"
            />
          </div>

          {/* Short Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-medium-black">
                Short Description <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-normal text-light-black">
                {(formData.shortDescription || "").length}/200
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={200}
              value={formData.shortDescription || ""}
              onChange={(e) => onChange("shortDescription", e.target.value)}
              placeholder="Describe the main focus and methodology of this playbook..."
              className="w-full px-4 py-2.5 rounded-xl border border-light-gray bg-white text-dark-black/80 text-xs sm:text-sm font-normal focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-light-black resize-none leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* 4 Dropdown Selectors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
        {/* Category */}
        <div>
          <label className="block text-xs font-medium text-medium-black mb-1.5">
            Category <span className="text-rose-500">*</span>
          </label>
          <SettingsDropdown
            label="Select Category"
            items={categoryOptions}
            selected={formData.category || "sales-methodology"}
            onSelect={(val) => onChange("category", val)}
            className="w-full"
          />
        </div>

        {/* Industry / Niche */}
        <div>
          <label className="block text-xs font-medium text-medium-black mb-1.5">
            Industry / Niche <span className="text-rose-500">*</span>
          </label>
          <SettingsDropdown
            label="Select Industry"
            items={industryOptions}
            selected={formData.industry || "real-estate"}
            onSelect={(val) => onChange("industry", val)}
            className="w-full"
          />
        </div>

        {/* Experience Level */}
        <div>
          <label className="block text-xs font-medium text-medium-black mb-1.5">
            Experience Level <span className="text-rose-500">*</span>
          </label>
          <SettingsDropdown
            label="Select Level"
            items={experienceOptions}
            selected={formData.experienceLevel || "intermediate-to-advanced"}
            onSelect={(val) => onChange("experienceLevel", val)}
            className="w-full"
          />
        </div>

        {/* Author / Creator (defaults to the person creating the playbook; shown in the preview) */}
        <div>
          <label className="block text-xs font-medium text-medium-black mb-1.5">
            Author / Creator
          </label>
          <input
            type="text"
            value={formData.author ?? ""}
            onChange={(e) => onChange("author", e.target.value)}
            placeholder={currentUserName ? `${currentUserName} (you)` : "You"}
            className="w-full px-4 py-2.5 rounded-xl border border-light-gray bg-white text-dark-black/80 text-xs sm:text-sm font-normal focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-light-black"
          />
        </div>
      </div>

      {/* Style: choose up to two */}
      <div>
        <label className="block text-xs font-medium text-medium-black mb-1.5">
          Style <span className="text-rose-500">*</span>
          <span className="ml-1.5 font-normal text-light-black">Choose up to 2</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {styleOptions.map((option) => {
            const styles = formData.styles ?? [formData.style || "direct"];
            const active = styles.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  const next = active ? styles.filter((value) => value !== option.value) : [...styles, option.value].slice(-2);
                  if (!next.length) return;
                  onChange("styles", next);
                  onChange("style", next[0]);
                }}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${active ? "bg-primary/10 border-primary text-primary" : "bg-white border-light-gray text-medium-black hover:border-primary/40"}`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Best For Lead Types Multi-Select Tags */}
      <div>
        <label className="block text-xs font-medium text-medium-black mb-1.5">
          Best For Lead Types <span className="text-rose-500">*</span>
        </label>
        <div className="p-2.5 rounded-xl border border-light-gray bg-white flex flex-wrap items-center gap-2 min-h-[46px]">
          {leadTypes.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-light-gray/80 hover:bg-light-gray border border-light-gray text-medium-black text-xs font-medium rounded-lg transition-colors"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeLeadType(tag)}
                className="text-light-black hover:text-rose-500 transition-colors cursor-pointer"
                aria-label={`Remove ${tag}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}

          {leadTypes.length > 3 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setLeadDropdownOpen(!leadDropdownOpen)}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-lg hover:bg-primary/20 transition-colors cursor-pointer"
              >
                <span>+{leadTypes.length - 3} more</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {leadDropdownOpen && (
                <div className="absolute left-0 top-full mt-1.5 z-30 w-52 bg-white rounded-xl border border-light-gray shadow-lg p-2.5 flex flex-wrap gap-1.5">
                  {leadTypes.slice(3).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-light-gray text-medium-black text-xs font-medium rounded-lg"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeLeadType(tag)}
                        className="text-light-black hover:text-rose-500 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Add Lead Tag Input */}
          <div className="flex items-center gap-1 ml-auto">
            <input
              type="text"
              value={newLeadInput}
              onChange={(e) => setNewLeadInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addLeadType(newLeadInput);
                }
              }}
              placeholder="Add lead type..."
              className="text-xs px-2.5 py-1 border border-transparent focus:border-light-gray focus:bg-light-gray/40 rounded-lg outline-none w-28 sm:w-36 text-medium-black placeholder:text-light-black"
            />
            {newLeadInput && (
              <button
                type="button"
                onClick={() => addLeadType(newLeadInput)}
                className="p-1 rounded-md bg-primary text-white text-xs hover:bg-medium-teal cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pricing, Distribution, Access Type & Status Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-12 gap-5 pt-2 items-start">
        {/* Price (USD) */}
        <div className="xl:col-span-3">
          <label className="block text-xs font-medium text-medium-black mb-1.5">
            Price (USD) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.price || "49.00"}
              onChange={(e) => onChange("price", e.target.value)}
              placeholder="49.00"
              className="w-full pl-4 pr-4 py-2.5 rounded-xl border border-light-gray bg-white text-dark-black/80 text-xs sm:text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-light-black"
            />
          </div>
        </div>

        {/* Distribution Radio */}
        <div className="xl:col-span-3">
          <label className="block text-xs font-medium text-medium-black mb-2">
            Distribution
          </label>
          <div className="flex flex-col gap-2">
            <CustomRadio
              name="distribution"
              value="one-time"
              label="One-time Purchase"
              selected={formData.distribution || "one-time"}
              onChange={onChange}
            />
            <CustomRadio
              name="distribution"
              value="subscription"
              label="Subscription"
              selected={formData.distribution || "one-time"}
              onChange={onChange}
            />
          </div>
        </div>

        {/* Access Type Radio */}
        <div className="xl:col-span-3">
          <label className="block text-xs font-medium text-medium-black mb-2">
            Access Type
          </label>
          <div className="flex items-center gap-4">
            <CustomRadio
              name="accessType"
              value="premium"
              label="Premium"
              selected={formData.accessType || "premium"}
              onChange={onChange}
            />
            <CustomRadio
              name="accessType"
              value="free"
              label="Free"
              selected={formData.accessType || "premium"}
              onChange={onChange}
            />
          </div>
        </div>

        {/* Status Radio */}
        <div className="xl:col-span-3">
          <label className="block text-xs font-medium text-medium-black mb-2">
            Status
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <CustomRadio
              name="status"
              value="draft"
              label="Draft"
              selected={formData.status || "draft"}
              onChange={onChange}
            />
            <CustomRadio
              name="status"
              value="published"
              label="Published"
              selected={formData.status || "draft"}
              onChange={onChange}
            />
            <CustomRadio
              name="status"
              value="archived"
              label="Archived"
              selected={formData.status || "draft"}
              onChange={onChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaybookDetailsSection;
