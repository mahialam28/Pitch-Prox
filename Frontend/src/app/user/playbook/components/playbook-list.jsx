"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  Check,
  Lock,
  Plus,
  Compass,
  ArrowUpDown,
  Pencil,
  Trash2,
} from "lucide-react";
import { RiArrowLeftLongLine, RiArrowRightLongLine } from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";
import PlaybookDetailsModal from "./playbook-details-modal";
import AlertModal from "@/components/modals/alert-modal";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

const TABS = ["All Playbooks", "My Playbooks", "Premium", "Custom"];

// onCreate lets another portal (e.g. the sales rep design preview) handle Create / Edit itself
const PlaybookList = ({ playbooks = [], loaded = true, onActivate, onDelete, onCreate }) => {
  const router = useRouter();
  const [playbookToDelete, setPlaybookToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortSelected, setSortSelected] = useState(sortOptions[0].value);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlaybook, setSelectedPlaybook] = useState(null);
  const sortDropdownRef = useRef(null);
  const tabScrollRef = useRef(null);

  // Auto-scroll the active tab into view on small screens
  const activeTabIndex = TABS.indexOf(activeTab);

  const [tabCanScrollLeft, setTabCanScrollLeft] = useState(false);
  const [tabCanScrollRight, setTabCanScrollRight] = useState(false);

  const updateTabArrows = useCallback(() => {
    const el = tabScrollRef.current;
    if (!el) return;
    setTabCanScrollLeft(el.scrollLeft > 4);
    setTabCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  const scrollTabs = useCallback((direction) => {
    const el = tabScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === "left" ? -200 : 200, behavior: "smooth" });
    setTimeout(updateTabArrows, 350);
  }, [updateTabArrows]);

  useEffect(() => {
    const el = tabScrollRef.current;
    if (!el || activeTabIndex < 0) return;
    const child = el.children[activeTabIndex];
    if (child) {
      child.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
    setTimeout(updateTabArrows, 400);
  }, [activeTabIndex, updateTabArrows]);

  useEffect(() => {
    const el = tabScrollRef.current;
    if (!el) return;
    updateTabArrows();
    const observer = new ResizeObserver(() => updateTabArrows());
    observer.observe(el);
    el.addEventListener("scroll", updateTabArrows, { passive: true });
    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", updateTabArrows);
    };
  }, [updateTabArrows]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedSort = sortOptions.find((o) => o.value === sortSelected);

  // Filter playbooks based on active tab and search term
  const filteredPlaybooks = useMemo(() => {
    let result = [...playbooks];

    // Tab filter: "My Playbooks" = the ones this account can use right now
    if (activeTab === "My Playbooks") {
      result = result.filter((p) => p.isAvailable);
    } else if (activeTab === "Premium") {
      result = result.filter((p) => p.isPremium);
    } else if (activeTab === "Custom") {
      result = result.filter((p) => p.isCustom);
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          (p.author && p.author.toLowerCase().includes(term)) ||
          (p.description || "").toLowerCase().includes(term)
      );
    }

    // Sort
    if (sortSelected === "newest") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortSelected === "price-low") {
      result.sort((a, b) => {
        const pa = parseFloat((a.price || "$0").replace("$", ""));
        const pb = parseFloat((b.price || "$0").replace("$", ""));
        return pa - pb;
      });
    } else if (sortSelected === "price-high") {
      result.sort((a, b) => {
        const pa = parseFloat((a.price || "$0").replace("$", ""));
        const pb = parseFloat((b.price || "$0").replace("$", ""));
        return pb - pa;
      });
    }

    return result;
  }, [playbooks, activeTab, searchTerm, sortSelected]);

  const showCustomCard =
    activeTab === "All Playbooks" || activeTab === "Custom";

  return (
    <div className="w-full space-y-6 sm:mt-0 mt-5">
      {/* Top Bar: Navigation Tabs & Search/Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-light-gray pb-3">
        {/* Navigation Tabs — swipeable on small screens */}
        <div className="relative flex-1 min-w-0">
          {tabCanScrollLeft && (
            <button
              onClick={() => scrollTabs("left")}
              className="absolute left-0 top-1/2 z-20 -translate-y-1/2 w-9 h-10 flex items-center justify-center bg-gradient-to-r from-[#F4F6F8] via-[#F4F6F8]/90 to-transparent rounded-r-xl cursor-pointer group"
              aria-label="Scroll tabs left"
            >
              <RiArrowLeftLongLine className="w-5 h-5 text-slate-500 group-hover:text-primary group-hover:scale-110 transition-all duration-200" />
            </button>
          )}
          {tabCanScrollRight && (
            <button
              onClick={() => scrollTabs("right")}
              className="absolute right-0 top-1/2 z-20 -translate-y-1/2 w-9 h-10 flex items-center justify-center bg-gradient-to-l from-[#F4F6F8] via-[#F4F6F8]/90 to-transparent rounded-l-xl cursor-pointer group"
              aria-label="Scroll tabs right"
            >
              <RiArrowRightLongLine className="w-5 h-5 text-slate-500 group-hover:text-primary group-hover:scale-110 transition-all duration-200" />
            </button>
          )}
        <nav
          ref={tabScrollRef}
          className="flex space-x-4 xs:space-x-6 sm:space-x-8 overflow-hidden snap-x snap-mandatory px-4 sm:px-0 pt-2 sm:pt-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-semibold relative transition-colors whitespace-nowrap cursor-pointer snap-start shrink-0 ${
                activeTab === tab
                  ? "text-primary"
                  : "text-light-black hover:text-medium-black"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.span
                  layoutId="tab-indicator"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                />
              )}
            </button>
          ))}
        </nav>
        </div>

        {/* Right Search and Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[180px] sm:w-64">
            <Search className="w-4 h-4 text-light-black absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search playbooks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-light-gray rounded-xl text-xs sm:text-sm text-foreground placeholder-light-black focus:outline-none focus:border-primary"
            />
          </div>

          {/* Sort Dropdown — matching dashboard pattern */}
          <div className="relative" ref={sortDropdownRef}>
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-light-gray rounded-xl text-xs font-semibold text-dark-black/80 hover:bg-light-gray shadow-sm transition-colors cursor-pointer"
            >
              <ArrowUpDown className="h-4 w-4 text-light-black" />
              <span>{selectedSort?.label || "Featured"}</span>
              <motion.svg
                animate={{ rotate: sortOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="h-3.5 w-3.5 text-light-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </motion.svg>
            </button>

            <AnimatePresence>
              {sortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 4, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 z-50 mt-1 min-w-[200px] bg-white border border-light-gray rounded-xl shadow-lg overflow-hidden"
                  style={{ transformOrigin: "top" }}
                >
                  <div className="py-1">
                    {sortOptions.map((option) => {
                      const isActive = sortSelected === option.value;
                      return (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortSelected(option.value);
                            setSortOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-left transition-colors cursor-pointer ${
                            isActive
                              ? "bg-primary/5 text-primary"
                              : "text-dark-black/70 hover:bg-light-gray"
                          }`}
                        >
                          <span>{option.label}</span>
                          {isActive && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Playbooks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {loaded && filteredPlaybooks.length === 0 && !showCustomCard ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <Text variant="small" className="text-light-black mb-1">
              No playbooks found in this category.
            </Text>
            <Text variant="smaller" className="text-light-black">
              Try a different search or filter.
            </Text>
          </div>
        ) : null}

        {filteredPlaybooks.map((card) => {
          // Active PitchProX Standard Card
          if (card.isActive) {
            return (
              <div
                key={card.id}
                className="bg-white rounded-2xl border-2 border-primary p-5 shadow-sm flex flex-col justify-between relative min-h-[340px]"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                    </div>
                  </div>

                  <Title variant="small" className="!text-base !font-bold !text-dark-black">
                    {card.title}
                  </Title>
                  <Text variant="small" className="text-light-black mt-0.5 mb-3">
                    {card.subtitle}
                  </Text>
                  <Text variant="small" className="leading-relaxed">
                    {card.description}
                  </Text>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <span className="inline-block bg-light-teal text-primary text-[10px] font-bold px-2.5 py-1 rounded tracking-wide">
                    ACTIVE
                  </span>
                  {card.isCustom && (
                    <button
                      onClick={() => (onCreate ? onCreate(card) : router.push(`/user/playbook/create?id=${card.id}`))}
                      className="px-3.5 py-1.5 rounded-lg border border-primary text-primary font-semibold text-xs hover:bg-primary hover:text-white transition-colors duration-200 cursor-pointer"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            );
          }

          // Standard (not active) or the account's own custom playbook
          if (!card.isPremium) {
            return (
              <div
                key={card.id}
                className="bg-white rounded-2xl border border-light-gray p-5 shadow-sm flex flex-col justify-between hover:border-dark-black/20 transition-all duration-200 min-h-[340px]"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-light-gray flex items-center justify-center text-medium-black font-bold text-xs">
                      {card.isCustom ? card.title.slice(0, 2).toUpperCase() : <Compass className="w-5 h-5" />}
                    </div>
                    {card.isCustom && (
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wide ${card.status === "draft" ? "bg-light-gray text-medium-black" : "bg-light-teal text-primary"}`}>
                        {card.status === "draft" ? "DRAFT" : "CUSTOM"}
                      </span>
                    )}
                  </div>

                  <Title variant="small" className="!text-base !font-bold !text-dark-black">
                    {card.title}
                  </Title>
                  <Text variant="small" className="text-light-black mt-0.5 mb-3">
                    {card.subtitle}
                  </Text>
                  <Text variant="small" className="leading-relaxed">
                    {card.description || "No description yet."}
                  </Text>
                </div>

                <div className="mt-6 pt-2 flex items-center justify-between gap-2">
                  {card.isCustom ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => (onCreate ? onCreate(card) : router.push(`/user/playbook/create?id=${card.id}`))}
                        className="p-1.5 rounded-lg text-light-black hover:text-light-blue hover:bg-light-blue/10 transition-colors cursor-pointer"
                        aria-label={`Edit ${card.title}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setPlaybookToDelete(card)}
                        className="p-1.5 rounded-lg text-light-black hover:text-red hover:bg-red/5 transition-colors cursor-pointer"
                        aria-label={`Delete ${card.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : <span />}
                  {card.isAvailable ? (
                    <button
                      onClick={() => onActivate?.(card)}
                      className="px-3.5 py-1.5 rounded-lg border border-primary text-primary font-semibold text-xs hover:bg-primary hover:text-white transition-colors duration-200 cursor-pointer"
                    >
                      Use Playbook
                    </button>
                  ) : (
                    <button
                      onClick={() => (onCreate ? onCreate(card) : router.push(`/user/playbook/create?id=${card.id}`))}
                      className="px-3.5 py-1.5 rounded-lg border border-light-gray text-medium-black font-semibold text-xs hover:bg-light-gray transition-colors duration-200 cursor-pointer"
                    >
                      Finish Draft
                    </button>
                  )}
                </div>
              </div>
            );
          }

          // Standard Premium Playbook Card
          return (
            <div
              key={card.id}
              className="bg-white rounded-2xl border border-light-gray p-5 shadow-sm flex flex-col justify-between hover:border-dark-black/20 transition-all duration-200 min-h-[340px]"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  {card.avatarUrl ? (
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-light-gray">
                      <Image
                        src={card.avatarUrl}
                        alt={card.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-dark-black flex items-center justify-center text-white font-bold text-xs">
                      {card.iconLetter}
                    </div>
                  )}

                  <div className="flex items-center space-x-1 bg-[#fff8e6] border border-[#ffe099] px-2 py-0.5 rounded-md">
                    <span className="text-[10px] font-extrabold text-[#d97706] tracking-wide">
                      PREMIUM
                    </span>
                    <Lock className="w-2.5 h-2.5 text-[#d97706]" />
                  </div>
                </div>

                <Title variant="small" className="!text-base !font-bold !text-dark-black">
                  {card.title}
                </Title>
                {card.author && (
                  <Text variant="small" className="text-light-black mt-0.5 mb-3">
                    {card.author}
                  </Text>
                )}
                <Text variant="small" className="leading-relaxed">
                  {card.description}
                </Text>
              </div>

              <div className="mt-6 pt-2 flex items-center justify-between">
                <Text variant="regular" className="!font-bold !text-dark-black">
                  {card.price}
                </Text>
                <button
                  onClick={() => setSelectedPlaybook(card)}
                  className="px-3.5 py-1.5 rounded-lg border border-primary text-primary font-semibold text-xs hover:bg-primary hover:text-white transition-colors duration-200 cursor-pointer"
                >
                  View Details
                </button>
              </div>
            </div>
          );
        })}

        {/* Dotted Custom Playbook Card - only on All Playbooks and Custom tabs */}
        {showCustomCard && (
        <div className="rounded-2xl border-2 border-dotted border-dark-black/20 p-5 flex flex-col items-center justify-center text-center bg-white/80 hover:border-primary transition-colors min-h-[340px]">
          <div className="w-10 h-10 rounded-full bg-light-gray flex items-center justify-center text-light-black mb-3">
            <Plus className="w-5 h-5" />
          </div>

          <Title variant="small" className="!text-base !font-bold !text-dark-black">
            Custom Playbook
          </Title>
          <Text variant="small" className="text-light-black mt-0.5 mb-3">
            Create Your Own
          </Text>
          <Text variant="small" className="leading-relaxed max-w-[200px] mb-5">
            Build a custom playbook tailored to your unique process, style, and market.
          </Text>

          <button
            onClick={() => (onCreate ? onCreate() : router.push("/user/playbook/create"))}
            className="w-auto py-3 px-6 rounded-xl border-2 border-primary text-primary font-semibold text-sm hover:bg-primary hover:text-white active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Playbook
          </button>
        </div>
        )}
      </div>

      {/* Bottom Disclaimer */}
      <div className="flex items-center justify-center space-x-1.5 pt-4">
        <Lock className="w-3 h-3 text-light-black" />
        <Text variant="small" className="text-light-black">
          Premium playbooks are sold individually. No subscriptions or bundles.
        </Text>
      </div>

      <PlaybookDetailsModal
        isOpen={!!selectedPlaybook}
        onClose={() => setSelectedPlaybook(null)}
        playbook={selectedPlaybook}
      />

      <AlertModal
        isOpen={!!playbookToDelete}
        onClose={() => setPlaybookToDelete(null)}
        type="warning"
        title="Delete Playbook"
        message={`Are you sure you want to delete ${playbookToDelete?.title || "this playbook"}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => {
          if (playbookToDelete) onDelete?.(playbookToDelete);
          setPlaybookToDelete(null);
        }}
      />
    </div>
  );
};

export default PlaybookList;