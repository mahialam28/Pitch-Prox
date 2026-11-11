"use client";

import React, { useEffect, useCallback, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShoppingCart,
  Compass,
  User,
  MessageSquare,
  Clock,
  Check,
  FileText,
  PhoneCall,
  ShieldCheck,
  Mail,
  ClipboardCheck,
  Lock,
  Hexagon,
} from "lucide-react";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";
import { showError } from "@/lib/alerts";
import { apiRequest } from "@/lib/client-api";

// "build-trust" → "Build Trust"
const humanize = (value) => String(value ?? "").replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const joined = (items, fallback = "—") => (items?.length ? items.map(humanize).join(", ") : fallback);

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.12 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 400, damping: 32, mass: 0.65 },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 10,
    transition: { duration: 0.12, ease: "easeIn" },
  },
};

const premiumColors = {
  bg: "bg-[#fff3eb]",
  border: "border-[#ffedd5]",
  text: "text-[#f97316]",
};

// playbook: the card's data (overview included). The full record is loaded on open: people who
// have the playbook also get `inside` (stages, objections, resources) to read.
const PlaybookDetailsModal = ({ isOpen = false, onClose = () => {}, playbook: card = null, onActivate }) => {
  const [detail, setDetail] = useState(null);
  useEffect(() => {
    if (!isOpen || !card?.id) return undefined;
    let cancelled = false;
    apiRequest(`/api/v1/playbooks/${card.id}`).then((data) => !cancelled && setDetail(data.playbook)).catch(() => {});
    return () => { cancelled = true; };
  }, [isOpen, card?.id]);
  const playbook = card ? { ...card, ...(detail?.id === card.id ? { inside: detail.inside } : {}) } : null;
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Scroll lock
  const lockScroll = useCallback(() => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  }, []);

  const unlockScroll = useCallback(() => {
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  }, []);

  useEffect(() => {
    if (isOpen) {
      lockScroll();
      const handleResize = () => {
        const w = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.paddingRight = `${w}px`;
      };
      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
        unlockScroll();
      };
    } else {
      unlockScroll();
    }
    return () => unlockScroll();
  }, [isOpen, lockScroll, unlockScroll]);

  if (!playbook) return null;

  const initials = playbook.title
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const overview = playbook.overview;
  const counts = overview?.counts;
  const highlights = [
    {
      icon: Compass,
      label: "FOCUS",
      value: joined(overview?.focusAreas, "Trust, value and next steps"),
      bgColor: "bg-blue-50/50",
      borderColor: "border-blue-100",
      iconBg: "bg-white",
      iconColor: "text-blue-600",
    },
    {
      icon: User,
      label: "BEST FOR",
      value: joined(overview?.bestFor, "All lead types"),
      bgColor: "bg-emerald-50/40",
      borderColor: "border-emerald-100",
      iconBg: "bg-white",
      iconColor: "text-emerald-600",
    },
    {
      icon: MessageSquare,
      label: "STYLE",
      value: overview ? joined([...(overview.tones ?? []), overview.style].filter(Boolean)) : "Coaching voice of the author",
      bgColor: "bg-indigo-50/40",
      borderColor: "border-indigo-100",
      iconBg: "bg-white",
      iconColor: "text-indigo-600",
    },
    {
      icon: Clock,
      label: "INSIDE",
      value: counts ? `${counts.stages} stages · ${counts.objections} objections · ${counts.resources} resources` : overview?.experienceLevel ? humanize(overview.experienceLevel) : "Call stages, objections and scripts",
      bgColor: "bg-amber-50/40",
      borderColor: "border-amber-100",
      iconBg: "bg-white",
      iconColor: "text-amber-600",
    },
  ];

  const whatsIncluded = [
    {
      icon: FileText,
      title: "Complete AI Prompt Framework",
      desc: "Ready-to-use prompts built on this playbook's principles.",
    },
    {
      icon: PhoneCall,
      title: counts ? `Conversation Flow (${counts.stages} stages)` : "Conversation Flow Framework",
      desc: "Full call structure and word tracks for key conversations.",
    },
    {
      icon: ShieldCheck,
      title: counts ? `Objection Library (${counts.objections} objections)` : "Objection Response Library",
      desc: "Proven responses to the most common objections.",
    },
    {
      icon: Mail,
      title: "Trust & Communication Style",
      desc: "AI adapts its tone, pacing, and coaching to reflect this playbook's approach.",
    },
    {
      icon: ClipboardCheck,
      title: "Conversation Intelligence Rules",
      desc: "Decision-making logic that helps the AI recommend the next best response throughout the conversation.",
    },
  ];

  // "You'll Learn": the key outcomes from the published version
  const learningPoints = overview?.keyOutcomes ?? [];

  return (
    <>
     
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="details-backdrop"
              className="fixed inset-0 z-999 bg-dark-black/50 backdrop-blur-sm h-screen"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              key="details-modal"
              className="fixed inset-0 z-[999] flex items-center justify-center p-5 sm:p-6 pointer-events-none"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div
                className="relative w-full max-w-[840px] bg-white rounded-3xl shadow-2xl pointer-events-auto flex flex-col max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Icon Button - Fixed to modal, with visible background */}
                <button
                  onClick={onClose}
                  className="absolute top-6 right-8 sm:right-10 p-1.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm text-light-black hover:text-dark-black hover:bg-white transition-colors z-20 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden pt-14 sm:pt-16 pb-8">
                  <div className="px-8 sm:px-10">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                      <div className="flex items-start space-x-5">
                        {/* Profile Image */}
                        {playbook.avatarUrl ? (
                          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-light-gray shrink-0">
                            <Image
                              src={playbook.avatarUrl}
                              alt={playbook.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-dark-black flex items-center justify-center text-white font-bold text-lg shrink-0">
                            {playbook.iconLetter || initials}
                          </div>
                        )}

                        <div>
                          {/* Badge */}
                          {playbook.isPremium && (
                            <span className={`inline-block px-2.5 py-0.5 rounded-md ${premiumColors.bg} ${premiumColors.text} font-bold text-[10px] tracking-wider uppercase mb-1.5`}>
                              PREMIUM PLAYBOOK
                            </span>
                          )}

                          {/* Title & Lock */}
                          <div className="flex items-center space-x-2">
                            <Title variant="small" className="!text-2xl sm:!text-3xl !font-extrabold !text-dark-black tracking-tight">
                              {playbook.title}
                            </Title>
                            {playbook.isPremium && !playbook.isAvailable && (
                              <Lock className="w-3.5 h-3.5 text-light-black shrink-0" />
                            )}
                          </div>

                          {playbook.author && (
                            <Text variant="small" className="text-light-black font-medium mt-0.5 mb-3">
                              By {playbook.author}
                            </Text>
                          )}

                          <Text variant="small" className="leading-relaxed max-w-lg">
                            {playbook.description}
                          </Text>
                        </div>
                      </div>

                      {/* Price & Purchase CTA */}
                      {playbook.isPremium && (
                        <div className="flex flex-col items-start md:items-end shrink-0">
                          <div className="text-left md:text-right mb-4">
                            <Title variant="small" className="!text-3xl sm:!text-4xl !font-extrabold !text-dark-black">
                              {playbook.price}
                            </Title>
                            <Text variant="small" className="text-light-black font-medium mt-0.5">
                              {playbook.price === "Free" ? "Included for everyone" : playbook.isAvailable ? "You have this playbook" : "One-time purchase"}
                            </Text>
                          </div>

                          {playbook.isActive ? (
                            <span className="px-6 py-3 rounded-2xl bg-light-teal text-primary font-bold text-sm">Your active playbook</span>
                          ) : playbook.isAvailable ? (
                            <button
                              onClick={() => {
                                onActivate?.(playbook);
                                onClose();
                              }}
                              className="w-full md:w-auto px-6 py-3 rounded-2xl bg-primary hover:bg-medium-teal text-white font-bold text-sm flex items-center justify-center space-x-2.5 shadow-md transition-all cursor-pointer"
                            >
                              <Check className="w-4 h-4 stroke-[2.5]" />
                              <span>Use Playbook</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => showError("Purchasing isn't available yet", "Premium playbooks can be bought once payments (Stripe) are connected by the client.")}
                              className="w-full md:w-auto px-6 py-3 rounded-2xl bg-primary hover:bg-medium-teal text-white font-bold text-sm flex items-center justify-center space-x-2.5 shadow-md transition-all cursor-pointer"
                            >
                              <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
                              <span>Purchase Playbook</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 4 Feature Highlight Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                      {highlights.map((item, index) => {
                        const Icon = item.icon;
                        return (
                          <div
                            key={index}
                            className={`p-4 rounded-2xl border ${item.bgColor} ${item.borderColor} flex flex-col justify-between min-h-[110px]`}
                          >
                            <div className={`w-8 h-8 rounded-xl ${item.iconBg} flex items-center justify-center mb-2.5 shadow-sm`}>
                              <Icon className={`w-4 h-4 ${item.iconColor}`} />
                            </div>
                            <div>
                              <Text variant="smaller" className="!font-bold !text-dark-black tracking-wider uppercase block mb-0.5">
                                {item.label}
                              </Text>
                              <Text variant="small" className="font-medium leading-snug">
                                {item.value}
                              </Text>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Bottom Grid Section: About + You'll Learn & What's Included */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      {/* Left Column (About + You'll Learn) */}
                      <div className="lg:col-span-6 space-y-6">
                        <div>
                          <Title variant="small" className="!text-base !font-bold !text-dark-black mb-2">
                            About This Playbook
                          </Title>
                          <Text variant="small" className="leading-relaxed">
                            {playbook.description}
                          </Text>
                        </div>

                        {/* You'll Learn Box (the playbook's key outcomes) */}
                        {learningPoints.length > 0 && <div className="p-6 bg-light-gray rounded-2xl border border-light-gray/80">
                          <Title variant="small" className="!text-sm !font-bold !text-dark-black mb-4">
                            You&apos;ll Learn
                          </Title>

                          <ul className="space-y-3.5">
                            {learningPoints.map((point, index) => (
                              <li key={index} className="flex items-start space-x-3">
                                <Check className="w-4 h-4 text-foreground shrink-0 mt-0.5 stroke-[2.5]" />
                                <Text variant="small" className="font-medium leading-snug">
                                  {point}
                                </Text>
                              </li>
                            ))}
                          </ul>
                        </div>}
                      </div>

                      {/* Right Column (What's Included) */}
                      <div className="lg:col-span-6 bg-light-gray rounded-2xl p-6 border border-light-gray/80">
                        <Title variant="small" className="!text-base !font-bold !text-dark-black mb-5">
                          What&apos;s Included
                        </Title>

                        <div className="space-y-4">
                          {whatsIncluded.map((item, index) => {
                            const Icon = item.icon;
                            return (
                              <div key={index} className="flex items-start space-x-3.5">
                                <div className="p-2 rounded-xl bg-light-teal text-primary shrink-0 mt-0.5">
                                  <Icon className="w-4 h-4 stroke-[2]" />
                                </div>
                                <div>
                                  <Text variant="small" className="!font-bold !text-dark-black">
                                    {item.title}
                                  </Text>
                                  <Text variant="small" className="text-light-black leading-relaxed mt-0.5">
                                    {item.desc}
                                  </Text>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* What's inside: read-only for people who have the playbook */}
                    {playbook.inside && (
                      <div className="mt-8 space-y-6">
                        <Title variant="small" className="!text-base !font-bold !text-dark-black">What&apos;s Inside</Title>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="rounded-2xl border border-light-gray p-5">
                            <Text variant="small" className="!font-bold !text-dark-black mb-3">Conversation Flow</Text>
                            <ol className="space-y-2.5">
                              {playbook.inside.stages.map((stage, index) => (
                                <li key={`${stage.title}-${index}`} className="text-xs">
                                  <span className="font-semibold text-dark-black">{index + 1}. {stage.title}</span>
                                  {stage.goal && <span className="block text-light-black">{stage.goal}</span>}
                                </li>
                              ))}
                            </ol>
                          </div>
                          <div className="rounded-2xl border border-light-gray p-5">
                            <Text variant="small" className="!font-bold !text-dark-black mb-3">Objections Covered</Text>
                            <ul className="space-y-2.5">
                              {playbook.inside.objections.map((objection, index) => (
                                <li key={`${objection.phrase}-${index}`} className="text-xs">
                                  <span className="font-semibold text-dark-black">&ldquo;{objection.phrase}&rdquo;</span>
                                  <span className="block text-light-black">{[objection.rootCategory, objection.subtype].filter(Boolean).join(" · ")}{objection.goal ? ` · ${objection.goal}` : ""}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        {playbook.inside.resources.length > 0 && (
                          <div className="rounded-2xl border border-light-gray p-5">
                            <Text variant="small" className="!font-bold !text-dark-black mb-3">Scripts &amp; Resources</Text>
                            <div className="space-y-3">
                              {playbook.inside.resources.map((resource, index) => (
                                <details key={`${resource.name}-${index}`} className="text-xs group">
                                  <summary className="cursor-pointer font-semibold text-dark-black">{resource.name} <span className="font-normal text-light-black">· {resource.type}</span></summary>
                                  <p className="mt-1.5 text-medium-black whitespace-pre-line">{resource.content || resource.description || "No text for this resource."}</p>
                                </details>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default PlaybookDetailsModal;