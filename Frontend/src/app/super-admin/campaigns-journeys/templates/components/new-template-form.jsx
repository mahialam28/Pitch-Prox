"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  Trash2,
  ChevronDown,
  Check,
  Zap,
  Navigation,
} from "lucide-react";
import toast from "react-hot-toast";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";

const BUTTON_COLORS = [
  { value: "#0EADAB", label: "Teal" },
  { value: "#059669", label: "Emerald" },
  { value: "#2563EB", label: "Blue" },
  { value: "#7C3AED", label: "Purple" },
  { value: "#EA580C", label: "Orange" },
  { value: "#DC2626", label: "Red" },
  { value: "#0F172A", label: "Dark Navy" },
];

export default function NewTemplateForm({
  initialTemplate,
  backUrl = "/super-admin/campaigns-journeys?tab=templates",
}) {
  const router = useRouter();

  // Form State
  const [heading, setHeading] = useState(
    initialTemplate?.heading ||
      initialTemplate?.title ||
      "Welcome to PitchProX!"
  );
  const [bodyCopy, setBodyCopy] = useState(
    initialTemplate?.body ||
      initialTemplate?.previewText ||
      "Thanks for starting your trial. Here's everything you need to get up and running."
  );
  const [buttonLabel, setButtonLabel] = useState(
    initialTemplate?.buttonLabel || "Get Started"
  );
  const [buttonColor, setButtonColor] = useState(
    initialTemplate?.buttonColor || "#0EADAB"
  );
  const [destinationUrl, setDestinationUrl] = useState(
    initialTemplate?.destinationUrl || "https://pitchprox.com/get-started"
  );
  const [subject, setSubject] = useState(
    initialTemplate?.subject || "Welcome to PitchProX! Let's get you started"
  );

  // Logo & Hero Image Customization
  const [hasLogo, setHasLogo] = useState(true);
  const [hasHeroImage, setHasHeroImage] = useState(true);
  const [customLogoUrl, setCustomLogoUrl] = useState(null);
  const [customHeroUrl, setCustomHeroUrl] = useState(null);

  const [colorDropdownOpen, setColorDropdownOpen] = useState(false);
  const colorRef = useRef(null);
  const logoInputRef = useRef(null);
  const heroInputRef = useRef(null);

  // Close color dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorRef.current && !colorRef.current.contains(event.target)) {
        setColorDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogoUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setCustomLogoUrl(url);
      setHasLogo(true);
      toast.success("Logo replaced successfully!");
    }
  };

  const handleHeroUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setCustomHeroUrl(url);
      setHasHeroImage(true);
      toast.success("Hero image replaced successfully!");
    }
  };

  const handleSave = () => {
    if (!heading.trim()) {
      toast.error("Please provide an email heading");
      return;
    }
    if (!subject.trim()) {
      toast.error("Please provide an email subject");
      return;
    }
    toast.success("Template saved successfully!");
    router.push(backUrl);
  };

  const handleSaveDraft = () => {
    toast.success("Template saved as draft!");
    router.push(backUrl);
  };

  return (
    <div className="w-full flex flex-col gap-6 min-w-0 pb-12">
      {/* ── Top Bar: Back Link ── */}
      <div className="flex items-center justify-between">
        <Link
          href={backUrl}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-primary hover:text-medium-teal transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Email Templates</span>
        </Link>
      </div>

      {/* ── Header Title & Subtitle ── */}
      <div className="w-full flex flex-col gap-1">
        <Title
          variant="small"
          className="!text-dark-black font-bold text-xl sm:text-2xl font-secondary"
        >
          New Email Template
        </Title>
        <Text variant="small" className="text-light-black">
          Add the content and appearance of this email template with live preview.
        </Text>
      </div>

      {/* ── Main Two-Column Grid (Spans Full Screen Width) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full min-w-0">
        {/* ── Left Column: Form Controls (6 cols) ── */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-light-gray p-6 sm:p-7 shadow-xs flex flex-col gap-5 w-full">
          <div className="flex items-center justify-between pb-2 border-b border-light-gray/60">
            <h2 className="text-sm sm:text-base font-bold text-dark-black/90 tracking-tight">
              Template Configuration
            </h2>
            <span className="text-[11px] text-light-black font-medium">
              Step-by-step Builder
            </span>
          </div>

          {/* 1. Header Logo */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-dark-black/85">
              1. Header Logo
            </label>
            <div className="flex items-center gap-3">
              {/* Logo Preview Box */}
              <div className="h-11 px-4 rounded-xl border border-light-gray bg-white flex items-center justify-center gap-2 shadow-2xs min-w-[140px]">
                {hasLogo ? (
                  customLogoUrl ? (
                    <img
                      src={customLogoUrl}
                      alt="Logo"
                      className="max-h-6 object-contain"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5 text-primary">
                        <span className="w-1 h-3 bg-primary rounded-full inline-block" />
                        <span className="w-1 h-4 bg-primary rounded-full inline-block" />
                        <span className="w-1 h-2 bg-primary rounded-full inline-block" />
                      </div>
                      <span className="text-xs font-bold text-dark-black tracking-tight font-secondary">
                        PitchProX
                      </span>
                    </div>
                  )
                ) : (
                  <span className="text-xs text-light-black italic">
                    No logo
                  </span>
                )}
              </div>

              {/* Replace Logo Button */}
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl border border-light-gray hover:bg-light-gray/50 text-xs font-semibold text-dark-black/80 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Upload className="w-3.5 h-3.5 text-light-black" />
                <span>Replace Logo</span>
              </button>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />

              {/* Delete Logo Button */}
              <button
                type="button"
                onClick={() => {
                  setHasLogo(false);
                  setCustomLogoUrl(null);
                }}
                className="w-9 h-9 rounded-xl border border-light-gray hover:bg-red/10 hover:border-red/30 hover:text-red text-light-black flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                title="Remove logo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 2. Email Heading */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-dark-black/85">
              2. Email Heading
            </label>
            <input
              type="text"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="e.g. Welcome to PitchProX!"
              className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-xs sm:text-sm text-dark-black/90 placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
            />
          </div>

          {/* 3. Body Copy */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-dark-black/85">
              3. Body Copy
            </label>
            <textarea
              rows={4}
              value={bodyCopy}
              onChange={(e) => setBodyCopy(e.target.value)}
              placeholder="Thanks for starting your trial. Here's everything you need to get up and running."
              className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-xs sm:text-sm text-dark-black/90 placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs resize-none leading-relaxed"
            />
          </div>

          {/* 4. CTA Button */}
          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-bold text-dark-black/85">
              4. CTA Button
            </label>

            {/* Sub-row: Button Label & Button Color */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Button Label */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-light-black uppercase tracking-wider">
                  BUTTON LABEL
                </span>
                <input
                  type="text"
                  value={buttonLabel}
                  onChange={(e) => setButtonLabel(e.target.value)}
                  placeholder="Get Started"
                  className="w-full px-3.5 py-2 rounded-xl border border-light-gray text-xs sm:text-sm text-dark-black/90 placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
                />
              </div>

              {/* Button Color Swatch Dropdown */}
              <div className="flex flex-col gap-1 relative" ref={colorRef}>
                <span className="text-[10px] font-bold text-light-black uppercase tracking-wider">
                  BUTTON COLOR
                </span>
                <button
                  type="button"
                  onClick={() => setColorDropdownOpen((prev) => !prev)}
                  className="w-full px-3.5 py-2 rounded-xl border border-light-gray bg-white flex items-center justify-between transition-all hover:border-slate-300 shadow-2xs cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-6 h-5 rounded-md shadow-2xs border border-black/10 inline-block"
                      style={{ backgroundColor: buttonColor }}
                    />
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-light-black" />
                </button>

                {/* Color Swatch Menu */}
                {colorDropdownOpen && (
                  <div className="absolute top-full mt-1.5 left-0 right-0 bg-white rounded-xl border border-light-gray shadow-lg p-2 z-30 grid grid-cols-4 gap-2">
                    {BUTTON_COLORS.map((col) => (
                      <button
                        key={col.value}
                        type="button"
                        onClick={() => {
                          setButtonColor(col.value);
                          setColorDropdownOpen(false);
                        }}
                        className="flex flex-col items-center gap-1 p-1.5 rounded-lg hover:bg-light-gray/40 transition-colors cursor-pointer"
                      >
                        <div
                          className="w-6 h-6 rounded-md shadow-2xs flex items-center justify-center border border-black/10"
                          style={{ backgroundColor: col.value }}
                        >
                          {buttonColor === col.value && (
                            <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                          )}
                        </div>
                        <span className="text-[9px] font-medium text-dark-black/80 truncate w-full text-center">
                          {col.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Destination URL */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-light-black uppercase tracking-wider">
                DESTINATION URL
              </span>
              <input
                type="text"
                value={destinationUrl}
                onChange={(e) => setDestinationUrl(e.target.value)}
                placeholder="https://pitchprox.com/get-started"
                className="w-full px-3.5 py-2 rounded-xl border border-light-gray text-xs sm:text-sm text-dark-black/90 placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* 5. Hero Image */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-dark-black/85">
              5. Hero Image
            </label>
            <div className="flex items-center gap-3">
              {/* Image Preview Box */}
              <div className="w-28 h-16 rounded-xl border border-light-gray bg-[#F8FAFC] flex items-center justify-center shadow-2xs overflow-hidden">
                {hasHeroImage ? (
                  customHeroUrl ? (
                    <img
                      src={customHeroUrl}
                      alt="Hero"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-primary flex items-center justify-center">
                      <Zap className="w-5 h-5 stroke-[2.2]" />
                    </div>
                  )
                ) : (
                  <span className="text-xs text-light-black italic">
                    No image
                  </span>
                )}
              </div>

              {/* Replace Image Button */}
              <button
                type="button"
                onClick={() => heroInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl border border-light-gray hover:bg-light-gray/50 text-xs font-semibold text-dark-black/80 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Upload className="w-3.5 h-3.5 text-light-black" />
                <span>Replace Image</span>
              </button>
              <input
                ref={heroInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleHeroUpload}
              />

              {/* Delete Image Button */}
              <button
                type="button"
                onClick={() => {
                  setHasHeroImage(false);
                  setCustomHeroUrl(null);
                }}
                className="w-9 h-9 rounded-xl border border-light-gray hover:bg-red/10 hover:border-red/30 hover:text-red text-light-black flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                title="Remove image"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 6. Email Subject */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-dark-black/85">
              6. Email Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Welcome to PitchProX! Let's get you started"
              className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-xs sm:text-sm text-dark-black/90 placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* ── Right Column: Live Preview (6 cols) ── */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-light-gray p-6 sm:p-7 shadow-xs flex flex-col gap-4 sticky top-4 w-full">
          <div className="flex items-center justify-between pb-2 border-b border-light-gray/60">
            <h2 className="text-sm sm:text-base font-bold text-dark-black/90 tracking-tight">
              Live Preview
            </h2>
            <span className="text-[11px] text-light-black font-medium">
              Interactive Canvas
            </span>
          </div>

          {/* Subject Line Bar */}
          <div className="flex items-center gap-2 text-xs pb-1">
            <span className="text-light-black font-normal">Subject:</span>
            <span className="text-dark-black/90 font-medium truncate">
              {subject || "No subject specified"}
            </span>
          </div>

          {/* Inner Browser / Email Viewport */}
          <div className="w-full rounded-2xl border border-light-gray/80 overflow-hidden bg-white shadow-2xs">
            {/* Browser Traffic Light Dots */}
            <div className="bg-[#F8FAFC] border-b border-light-gray/60 px-4 py-2.5 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] inline-block" />
            </div>

            {/* Email Body Canvas */}
            <div className="p-6 sm:p-7 flex items-start justify-between gap-4 bg-[#FAFAFA]/40 min-h-[240px]">
              {/* Left Text Block */}
              <div className="flex flex-col gap-3 max-w-[65%] min-w-0">
                {/* Brand Header */}
                {hasLogo && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-primary text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Zap className="w-3.5 h-3.5 fill-white" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-dark-black tracking-tight font-secondary">
                      PitchProX
                    </span>
                  </div>
                )}

                {/* Heading */}
                <h3 className="text-base sm:text-lg font-bold text-dark-black leading-snug tracking-tight">
                  {heading || "Welcome to PitchProX!"}
                </h3>

                {/* Body Copy */}
                <p className="text-xs text-light-black leading-relaxed whitespace-pre-line">
                  {bodyCopy ||
                    "Thanks for starting your trial. Here's everything you need to get up and running."}
                </p>

                {/* CTA Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    style={{ backgroundColor: buttonColor }}
                    className="inline-flex items-center justify-center px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xs transition-opacity hover:opacity-95 cursor-default"
                  >
                    {buttonLabel || "Get Started"}
                  </button>
                </div>
              </div>

              {/* Right Illustration Icon Badge */}
              {hasHeroImage && (
                <div className="shrink-0 pt-2">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-50/80 border border-emerald-100/90 text-primary flex items-center justify-center shadow-2xs">
                    <Navigation className="w-8 h-8 sm:w-9 sm:h-9 stroke-[2.2]" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Action Bar (Spans Full Width) ── */}
      <div className="w-full bg-white rounded-2xl border border-light-gray p-4 sm:p-5 shadow-xs flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push(backUrl)}
          className="px-5 py-2.5 rounded-xl border border-light-gray hover:bg-light-gray text-xs sm:text-sm font-semibold text-dark-black/80 transition-colors cursor-pointer shadow-2xs"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSaveDraft}
          className="px-5 py-2.5 rounded-xl border border-primary text-primary hover:bg-primary/5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-2xs"
        >
          Save as Draft
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs"
        >
          Save
        </button>
      </div>
    </div>
  );
}
