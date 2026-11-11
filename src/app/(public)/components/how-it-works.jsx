"use client";

import React, { useEffect, useState } from "react";
import VideoReady from "@/components/demo/video-ready";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Play,
  Calendar,
  KeyRound,
  Quote,
  User,
  Mail,
  Phone,
  Building,
  Send,
  Lock,
} from "lucide-react";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";
import Wrapper from "@/components/wrappers/wrapper";
import Dropdown from "@/components/shared/dropdown/dropdown";
import { useEmail } from "./email-context";
import { formatPhoneNumber } from "@/utils.js/phone";
import banner from "@/assets/images/home/hero.png";

export default function SeeHowItWorks() {
  const { email } = useEmail();
  const [formData, setFormData] = useState({
    fullName: "",
    workEmail: "",
    phoneNumber: "",
    company: "",
    roleDescription: "",
    referralSource: "",
    additionalNotes: "",
  });

  // Sync email from the hero demo form into this form.
  // React-recommended pattern: adjust state during render, not inside an effect.
  const [prevEmail, setPrevEmail] = useState(email);
  if (email && prevEmail !== email) {
    setPrevEmail(email);
    setFormData((prev) => ({ ...prev, workEmail: email }));
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "phoneNumber" ? formatPhoneNumber(value) : value,
    }));
  };

  const roleOptions = [
    { value: "sales-rep", label: "Sales Representative", desc: "Individual contributor focused on outbound" },
    { value: "sales-manager", label: "Sales Manager / Director", desc: "Managing a team of sales professionals" },
    { value: "exec", label: "Executive / Founder", desc: "Leadership or founding team member" },
    { value: "other", label: "Other", desc: "A different role or perspective" },
  ];

  const sourceOptions = [
    { value: "google", label: "Search Engine (Google, Bing)", desc: "Found us through organic or paid search" },
    { value: "social", label: "Social Media (LinkedIn, Twitter)", desc: "Came across us on social platforms" },
    { value: "referral", label: "Friend or Colleague", desc: "Referred by someone in your network" },
    { value: "ad", label: "Online Advertisement", desc: "Clicked on an online ad or promotion" },
  ];

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 60 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  // Saved for the sales team and emailed; the video and plans open right away (client, Nov 10)
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState("");
  const [ready, setReady] = useState(null); // { id, name, email }
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.roleDescription || !formData.referralSource) {
      setFormError("Please choose your role and how you heard about us.");
      return;
    }
    setSending(true);
    setFormError("");
    try {
      const response = await fetch("/api/v1/public/demo-requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Something went wrong. Please try again.");
      setReady({ id: result.id, name: formData.fullName, email: formData.workEmail });
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSending(false);
    }
  };

  // Escape closes the pop-up
  useEffect(() => {
    if (!ready) return undefined;
    const onKey = (event) => event.key === "Escape" && setReady(null);
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [ready]);

  return (
    <section id="how-it-works" className="relative container mx-auto md:px-5 overflow-hidden select-none scroll-mt-[100px] bg-dark-black rounded-2xl md:rounded-3xl xl:rounded-40">
      {/* Background Image Layer - same hero.png used in Hero section */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src={banner}
          alt="Background"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />
      </div>

      {/* Dark scrim so the text stays readable on the photo (client, Nov 9: the light text was hard to read) */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-dark-black/85 via-dark-black/65 to-dark-black/40 pointer-events-none" />

      {/* Subtle gradient glow */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/10 to-transparent blur-3xl pointer-events-none z-[1]" />

      <Wrapper variant="bottomSmall" className="py-12 sm:py-16 md:py-20 lg:py-24 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start"
        >
          {/* ── LEFT COLUMN: Dark Content Side ── */}
          <motion.div variants={fadeUp} className="lg:col-span-6 space-y-8 lg:pr-4">
            {/* Eyebrow Label */}
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[11px] sm:text-xs font-semibold tracking-wide text-primary uppercase rounded-full bg-primary/10 border border-primary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              SEE HOW IT WORKS
            </div>

            {/* Main Headline */}
            <Title
              variant="large"
              className="text-white font-extrabold tracking-tight"
            >
              See PitchProX <br />
              <span className="text-white">in action.</span>
            </Title>

            {/* Subheading Description */}
            <Text
              variant="large"
              className="text-white leading-relaxed max-w-lg font-normal"
            >
              Discover how PitchProX delivers live AI teleprompting, objection
              guidance, and strategic responses that help sales professionals win
              more conversations.
            </Text>

            {/* Feature Steps List */}
            <div className="space-y-6 pt-2">
              {/* Step 1 */}
              <motion.div
                variants={slideInLeft}
                className="flex items-start gap-4 group"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-primary shrink-0 group-hover:border-primary/50 transition-colors">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">
                    Understand How It Works
                  </h3>
                  <p className="text-sm text-white/95 leading-relaxed max-w-md">
                    See how PitchProX supports a sales conversation from the
                    moment the call begins.
                  </p>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                variants={slideInLeft}
                className="flex items-start gap-4 group"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-primary shrink-0 group-hover:border-primary/50 transition-colors">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">
                    Explore the Core Features
                  </h3>
                  <p className="text-sm text-white/95 leading-relaxed max-w-md">
                    Learn how live prompts, objection guidance, trust detection
                    and post call insights work together.
                  </p>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                variants={slideInLeft}
                className="flex items-start gap-4 group"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-primary shrink-0 group-hover:border-primary/50 transition-colors">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">
                    See Where It Fits
                  </h3>
                  <p className="text-sm text-white/95 leading-relaxed max-w-md">
                    Understand how PitchProX can support your individual sales
                    process, team or organization.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Testimonial Card */}
            <motion.div variants={fadeUp} className="pt-4 max-w-sm">
              <div className="bg-dark-black/60 backdrop-blur-md border border-white/20 rounded-2xl p-5 shadow-xl space-y-4">
                <Quote className="w-6 h-6 text-primary fill-primary/20" />
                <p className="text-sm text-white italic leading-relaxed">
                  {"\"PitchProX changed the way our team communicates. It's like having a coach in every call.\""}
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <Image
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=120"
                    alt="Daniel Miller"
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded-full object-cover border border-white/20"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      Daniel Miller
                    </h4>
                    <p className="text-[11px] text-white/90">
                      Sales Director, ABC Realty Group
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* ── RIGHT COLUMN: Light Form Side ── */}
          <motion.div
            variants={slideInRight}
            className="lg:col-span-6 bg-white text-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100"
          >
            {/* Form Header */}
            <div className="space-y-1.5 mb-6">
              <h2 className="text-2xl font-bold text-dark-black tracking-tight">
                See How PitchProX Works
              </h2>
              <p className="text-xs text-medium-black/70 leading-relaxed">
                {"Fill out the form below and we'll email you a personalized \"See How It Works\" video and connect you with the right team member."}
              </p>
            </div>

            {/* Form Controls */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-dark-black">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    name="fullName"
                    required
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-primary text-dark-black placeholder-slate-400 transition-colors"
                  />
                </div>
              </div>

              {/* Work Email */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-dark-black">
                  Work Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    name="workEmail"
                    required
                    placeholder="Enter your work email"
                    value={formData.workEmail}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-primary text-dark-black placeholder-slate-400 transition-colors"
                  />
                </div>
              </div>

              {/* Phone Number & Company Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone Number */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-dark-black">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      name="phoneNumber"
                      required
                      placeholder="(213) 555-1234"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-primary text-dark-black placeholder-slate-400 transition-colors"
                    />
                  </div>
                </div>

                {/* Company */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-dark-black">
                    Company <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      name="company"
                      required
                      placeholder="Enter your company name"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-primary text-dark-black placeholder-slate-400 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* What best describes you? */}
              <div className="space-y-1">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-dark-black">
                    What best describes you? <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-medium-black/60">
                    This helps us connect you with the right person.
                  </span>
                </div>
                <div className="pt-1">
                  <Dropdown
                    label="Select an option"
                    items={roleOptions}
                    selected={formData.roleDescription}
                    onSelect={(value) => setFormData((prev) => ({ ...prev, roleDescription: value }))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* How did you hear about PitchProX? */}
              <div className="space-y-1">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-dark-black">
                    How did you hear about PitchProX? <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-medium-black/60">
                    Help us understand where you found us.
                  </span>
                </div>
                <div className="pt-1">
                  <Dropdown
                    label="Select an option"
                    items={sourceOptions}
                    selected={formData.referralSource}
                    onSelect={(value) => setFormData((prev) => ({ ...prev, referralSource: value }))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Additional Notes */}
              <div className="space-y-1">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-dark-black">
                    Additional Notes (Optional)
                  </label>
                  <span className="text-[10px] text-medium-black/60">
                    {"Anything else you'd like us to know?"}
                  </span>
                </div>
                <textarea
                  rows={3}
                  name="additionalNotes"
                  placeholder="Type your message here..."
                  value={formData.additionalNotes}
                  onChange={handleChange}
                  className="w-full p-3.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-primary text-dark-black placeholder-slate-400 resize-none transition-colors"
                />
              </div>

              {/* Informational Callout Box */}
              <div className="p-3.5 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-white border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-sm">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5">
                  <h5 className="text-xs font-bold text-dark-black">
                    What happens next?
                  </h5>
                  <p className="text-[11px] text-medium-black/70 leading-snug">
                    {"The \"See How It Works\" video opens right here, and we'll email you the link too. Our team will follow up shortly."}
                  </p>
                </div>
              </div>

              {formError && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-600">
                  {formError}
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={sending}
                className="w-full py-3 px-6 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-70 disabled:cursor-wait"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sending ? "Getting your video…" : "Show Me the Video"}</span>
              </button>

              {/* Privacy Note */}
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-medium-black/60 pt-1">
                <Lock className="w-3 h-3 text-medium-black/60" />
                <span>We respect your privacy. Your information is safe with us.</span>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </Wrapper>

      {/* "Your Video Is Ready" pop-up */}
      {ready && (
        <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center overflow-y-auto bg-dark-black/70 backdrop-blur-sm p-3 sm:p-6" onClick={() => setReady(null)}>
          <div role="dialog" aria-modal="true" aria-labelledby="video-ready-title" className="relative w-full max-w-3xl rounded-3xl bg-light-gray p-5 sm:p-8 shadow-2xl my-auto select-text" onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setReady(null)} aria-label="Close" className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-medium-black hover:text-dark-black shadow cursor-pointer">
              ×
            </button>
            <VideoReady requestId={ready.id} name={ready.name} email={ready.email} onClose={() => setReady(null)} />
          </div>
        </div>
      )}
    </section>
  );
}