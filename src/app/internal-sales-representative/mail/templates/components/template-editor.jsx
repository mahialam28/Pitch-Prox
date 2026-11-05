"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  Trash2,
  ChevronDown,
  Check,
  Zap,
  Navigation,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { apiRequest } from "@/lib/client-api";

// ── CTA Color Swatches ──
const buttonColors = [
  { value: "#0EADAB", label: "Teal" },
  { value: "#059669", label: "Emerald" },
  { value: "#2563EB", label: "Blue" },
  { value: "#7C3AED", label: "Purple" },
  { value: "#EA580C", label: "Orange" },
  { value: "#DC2626", label: "Red" },
  { value: "#0F172A", label: "Dark Navy" },
];

export default function TemplateEditor({
  template,
  backUrl = "/internal-sales-representative/mail/templates",
}) {
  // ── Form State (Drives Live Email Canvas) ──
  const [toEmail, setToEmail] = useState("");
  const [subject, setSubject] = useState(
    template?.subject || "PitchProX Platform Overview & Key Capabilities"
  );
  const [heading, setHeading] = useState(
    template?.title || "Product Overview Follow-Up"
  );
  const [bodyCopy, setBodyCopy] = useState(
    template?.body ||
      `Hi {First Name},

Thank you for your interest in PitchProX! Following our discussion, I wanted to share a comprehensive overview of how our platform accelerates sales cycle velocity and rep productivity.

Key capabilities for your team:
• Real-time AI playbooks and talk tracks during live calls
• In-depth conversation analytics, sentiment tracking, and performance scoring
• Seamless calendar scheduling and automated follow-up sequences

I'd love to show you how other sales organizations are achieving a 35%+ increase in qualified meetings using PitchProX.

When are you available for a 15-minute live platform demo?

Best regards,
{Your Name}
PitchProX Sales Team`
  );
  const [buttonLabel, setButtonLabel] = useState("Get Started");
  const [buttonColor, setButtonColor] = useState("#0EADAB");
  const [destinationUrl, setDestinationUrl] = useState(
    "https://pitchprox.com/get-started"
  );
  const [showCC, setShowCC] = useState(false);
  const [showBCC, setShowBCC] = useState(false);
  const [ccEmail, setCcEmail] = useState("");
  const [bccEmail, setBccEmail] = useState("");
  const [colorOpen, setColorOpen] = useState(false);
  const colorRef = useRef(null);

  // Logo & Hero Image Customization
  const [hasLogo, setHasLogo] = useState(true);
  const [hasHeroImage, setHasHeroImage] = useState(true);
  const [customLogoUrl, setCustomLogoUrl] = useState(null);
  const [customHeroUrl, setCustomHeroUrl] = useState(null);

  const logoInputRef = useRef(null);
  const heroInputRef = useRef(null);

  // Close color dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorRef.current && !colorRef.current.contains(event.target)) {
        setColorOpen(false);
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

  // Saved to the sender's outbox; delivery starts once an email service is connected
  const [sending, setSending] = useState(false);
  const handleSend = async () => {
    if (sending) return;
    if (!toEmail.trim()) {
      toast.error("Please enter a recipient email before sending.");
      return;
    }
    const body = [heading, bodyCopy, buttonLabel && destinationUrl ? `${buttonLabel}: ${destinationUrl}` : ""].filter((part) => part && part.trim()).join("\n\n");
    setSending(true);
    try {
      await apiRequest("/api/v1/mail/messages", {
        method: "POST",
        body: { to: toEmail, cc: showCC ? ccEmail : "", bcc: showBCC ? bccEmail : "", subject, body },
      });
    } catch (error) {
      toast.error(error.message);
      return;
    } finally {
      setSending(false);
    }
    toast.success(`Saved. It will be sent to ${toEmail} once email sending is connected.`, { duration: 5000 });
    setToEmail("");
  };

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-5 min-w-0">
      {/* ── Top Bar: Back Link ── */}
      <div className="flex items-center justify-between">
        <Link
          href={backUrl}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-primary hover:text-medium-teal transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Quick templates</span>
        </Link>
      </div>

      {/* ── Main Two-Column Grid (items-start so left height never stretches with right text) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full min-w-0">
        {/* ── LEFT COLUMN: Dedicated Edit Template Card (5 cols) ── */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-light-gray p-6 sm:p-7 shadow-sm space-y-4 sm:space-y-5 min-w-0">
          {/* Header Row: Title & Send Button */}
          <div className="flex items-center justify-between gap-3 pb-1">
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-dark-black">
                Edit template
              </h2>
              <p className="text-xs text-light-black mt-0.5 leading-relaxed">
                Changes reflect instantly in the live preview.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSend}
              className="inline-flex items-center justify-center px-5 py-2 text-xs sm:text-sm font-bold text-white bg-primary hover:bg-medium-teal rounded-xl shadow-sm transition-all duration-200 cursor-pointer shrink-0"
            >
              <span>Send</span>
            </button>
          </div>

          {/* To Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-dark-black">To</label>
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <button
                  type="button"
                  onClick={() => setShowCC(!showCC)}
                  className="hover:underline cursor-pointer"
                >
                  CC
                </button>
                <button
                  type="button"
                  onClick={() => setShowBCC(!showBCC)}
                  className="hover:underline cursor-pointer"
                >
                  BCC
                </button>
              </div>
            </div>
            <input
              type="email"
              placeholder="Enter prospect email"
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
              className="w-full px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary text-dark-black placeholder:text-light-black transition-colors"
            />
          </div>

          {/* Conditional CC / BCC */}
          {showCC && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-dark-black">CC</label>
              <input
                type="email"
                placeholder="Enter CC email"
                value={ccEmail}
                onChange={(e) => setCcEmail(e.target.value)}
                className="w-full px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary text-dark-black placeholder:text-light-black transition-colors"
              />
            </div>
          )}
          {showBCC && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-dark-black">BCC</label>
              <input
                type="email"
                placeholder="Enter BCC email"
                value={bccEmail}
                onChange={(e) => setBccEmail(e.target.value)}
                className="w-full px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary text-dark-black placeholder:text-light-black transition-colors"
              />
            </div>
          )}

          {/* Subject Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-dark-black">Subject</label>
            <input
              type="text"
              placeholder="Enter email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary text-dark-black placeholder:text-light-black transition-colors"
            />
          </div>

          {/* Header Logo */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-dark-black">Header Logo</label>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Logo Preview Box */}
              <div className="h-11 w-32 sm:w-36 px-2.5 bg-white border border-light-gray rounded-xl flex items-center justify-center shrink-0">
                {customLogoUrl ? (
                  <img
                    src={customLogoUrl}
                    alt="Custom Logo"
                    className="max-h-6 max-w-full object-contain"
                  />
                ) : hasLogo ? (
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-md bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <Sparkles className="w-2.5 h-2.5" />
                    </div>
                    <span className="font-bold text-dark-black text-xs tracking-tight">
                      PitchProX
                    </span>
                  </div>
                ) : (
                  <span className="text-[11px] text-light-black italic">No logo</span>
                )}
              </div>

              {/* Replace Logo Button */}
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-medium-black bg-white hover:bg-light-gray border border-light-gray rounded-xl transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-light-black" />
                <span>Replace Logo</span>
              </button>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />

              {/* Delete Logo */}
              <button
                type="button"
                onClick={() => {
                  setHasLogo(false);
                  setCustomLogoUrl(null);
                  toast.success("Logo removed");
                }}
                className="p-2 text-light-black hover:text-red border border-light-gray hover:border-red/30 rounded-xl transition-colors cursor-pointer"
                title="Remove logo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Email Heading */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-dark-black">Email Heading</label>
            <input
              type="text"
              placeholder="Welcome to PitchProX!"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              className="w-full px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary text-dark-black placeholder:text-light-black transition-colors"
            />
          </div>

          {/* Body Copy */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-dark-black">Body Copy</label>
            <textarea
              rows={5}
              placeholder="Enter body copy..."
              value={bodyCopy}
              onChange={(e) => setBodyCopy(e.target.value)}
              className="w-full px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary text-dark-black placeholder:text-light-black resize-none transition-colors"
            />
          </div>

          {/* CTA Button Settings */}
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-bold text-dark-black uppercase tracking-wider">
              CTA BUTTON
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
              {/* Button Label */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-light-black uppercase tracking-wider">
                  BUTTON LABEL
                </span>
                <input
                  type="text"
                  value={buttonLabel}
                  onChange={(e) => setButtonLabel(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary text-dark-black"
                />
              </div>

              {/* Button Color */}
              <div className="space-y-1" ref={colorRef}>
                <span className="text-[10px] font-bold text-light-black uppercase tracking-wider">
                  BUTTON COLOR
                </span>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setColorOpen(!colorOpen)}
                    className="w-full px-3 py-2 text-xs bg-white border border-light-gray rounded-xl flex items-center justify-between gap-2 text-dark-black cursor-pointer"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-3.5 h-3.5 rounded-md shrink-0 shadow-xs"
                        style={{ backgroundColor: buttonColor }}
                      />
                      <span className="font-semibold text-xs truncate">
                        {buttonColors.find((c) => c.value === buttonColor)?.label || "Custom"}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-light-black shrink-0" />
                  </button>

                  <AnimatePresence>
                    {colorOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute left-0 right-0 top-full mt-1 bg-white border border-light-gray rounded-xl shadow-lg p-1.5 z-30 space-y-1 max-h-56 overflow-y-auto"
                      >
                        {buttonColors.map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => {
                              setButtonColor(color.value);
                              setColorOpen(false);
                            }}
                            className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-between hover:bg-light-gray/60 transition-colors cursor-pointer text-dark-black"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span
                                className="w-3.5 h-3.5 rounded-md shrink-0"
                                style={{ backgroundColor: color.value }}
                              />
                              <span className="truncate">{color.label}</span>
                            </div>
                            {buttonColor === color.value && (
                              <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                            )}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Destination URL */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-light-black uppercase tracking-wider">
                DESTINATION URL
              </span>
              <input
                type="url"
                value={destinationUrl}
                onChange={(e) => setDestinationUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary text-dark-black"
              />
            </div>
          </div>

          {/* Hero Image */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold text-dark-black">Hero Image</label>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Hero Image Preview Box */}
              <div className="h-14 w-24 bg-emerald-50/60 border border-emerald-100 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                {customHeroUrl ? (
                  <img
                    src={customHeroUrl}
                    alt="Custom Hero"
                    className="w-full h-full object-cover"
                  />
                ) : hasHeroImage ? (
                  <div className="text-primary">
                    <Navigation className="w-5 h-5 -rotate-45" />
                  </div>
                ) : (
                  <span className="text-[11px] text-light-black italic">No image</span>
                )}
              </div>

              {/* Replace Image Button */}
              <button
                type="button"
                onClick={() => heroInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-medium-black bg-white hover:bg-light-gray border border-light-gray rounded-xl transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-light-black" />
                <span>Replace Image</span>
              </button>
              <input
                ref={heroInputRef}
                type="file"
                accept="image/*"
                onChange={handleHeroUpload}
                className="hidden"
              />

              {/* Delete Hero Image */}
              <button
                type="button"
                onClick={() => {
                  setHasHeroImage(false);
                  setCustomHeroUrl(null);
                  toast.success("Hero image removed");
                }}
                className="p-2 text-light-black hover:text-red border border-light-gray hover:border-red/30 rounded-xl transition-colors cursor-pointer"
                title="Remove hero image"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Live Preview Section (7 cols) ── */}
        <div className="lg:col-span-7 space-y-3 min-w-0">
          {/* Header Row */}
          <div className="space-y-1 pl-1">
            <h3 className="text-sm font-bold text-dark-black">Live Preview</h3>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-light-black font-medium">Subject:</span>
              <span className="font-semibold text-dark-black truncate">
                {subject || "PitchProX Platform Overview & Key Capabilities"}
              </span>
            </div>
          </div>

          {/* Email Mockup Card */}
          <div className="w-full bg-white rounded-2xl border border-light-gray shadow-sm overflow-hidden flex flex-col min-w-0">
            {/* Traffic Light Dot Bar */}
            <div className="bg-[#f4f5f7] px-4 py-3 border-b border-light-gray flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
            </div>

            {/* Email Canvas Content */}
            <div className="p-6 sm:p-8 lg:p-10 space-y-6 min-w-0">
              {/* Brand Logo Header */}
              {hasLogo && (
                <div className="flex items-center gap-2">
                  {customLogoUrl ? (
                    <img
                      src={customLogoUrl}
                      alt="Logo"
                      className="max-h-7 max-w-[140px] object-contain"
                    />
                  ) : (
                    <>
                      <div className="w-6 h-6 rounded-md bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        <Zap className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-dark-black text-sm tracking-tight">
                        PitchProX
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* Main Content Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
                {/* Left: Text & CTA */}
                <div className={hasHeroImage ? "sm:col-span-8 space-y-4" : "sm:col-span-12 space-y-4"}>
                  <h2 className="text-xl sm:text-2xl font-bold text-dark-black leading-tight break-words">
                    {heading || "Product Overview Follow-Up"}
                  </h2>
                  <div className="text-xs sm:text-sm text-medium-black leading-relaxed whitespace-pre-wrap break-words">
                    {bodyCopy}
                  </div>

                  {buttonLabel && (
                    <div className="pt-2">
                      <a
                        href={destinationUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ backgroundColor: buttonColor }}
                        className="inline-block px-6 py-2.5 rounded-xl font-bold text-white text-xs shadow-sm hover:opacity-95 transition-opacity"
                      >
                        {buttonLabel}
                      </a>
                    </div>
                  )}
                </div>

                {/* Right: Circular Hero Badge Illustration */}
                {hasHeroImage && (
                  <div className="sm:col-span-4 flex items-center justify-center pt-2">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-emerald-50/80 border border-emerald-100 flex items-center justify-center shadow-xs overflow-hidden shrink-0">
                      {customHeroUrl ? (
                        <img
                          src={customHeroUrl}
                          alt="Hero"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Navigation className="w-10 h-10 sm:w-12 sm:h-12 text-primary -rotate-45" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
