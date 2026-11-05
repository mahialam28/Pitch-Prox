"use client";

import React, { useState } from "react";
import { ExamplePlaybooksModal } from "./playbook-help-modals";
import { showSavedToast } from "@/lib/toast";
import {
  Plus,
  Download,
  Search,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Clock,
  UserX,
  HelpCircle,
  XCircle,
  Lightbulb,
  Check,
  Mic,
  Heart,
  RotateCw,
  FileText,
  Eye,
  RotateCcw,
  Zap,
  BookOpen,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import Text from "@/components/texts/text";
import SettingsDropdown from "@/components/shared/dropdown/settings-dropdown";
import AddObjectionModal, { CATEGORY_OPTIONS } from "./add-objection-modal";
import FrameworkEditModal from "./framework-edit-modal";

// Starting objection library for a new playbook
export const DEFAULT_OBJECTIONS = [
  {
    id: 1,
    title: "I don't want to pay commission.",
    category: "Financial",
    icon: MessageSquare,
    iconColor: "text-rose-500 bg-rose-50",
    leadTypes: ["FSBO", "Expired", "Pre-Expired"],
    extraLeadTypesCount: 2,
    responseStyle: "Focus Value & ROI",
    styleBadgeColor: "bg-emerald-50 text-emerald-700",
    lastUpdated: "May 2, 2024",
  },
  {
    id: 2,
    title: "Not a good time to sell.",
    category: "Risk",
    icon: Clock,
    iconColor: "text-amber-500 bg-amber-50",
    leadTypes: ["FSBO", "Expired", "Absentee"],
    extraLeadTypesCount: 1,
    responseStyle: "Future Pacing",
    styleBadgeColor: "bg-orange-50 text-orange-600",
    lastUpdated: "May 2, 2024",
  },
  {
    id: 3,
    title: "I already have an agent.",
    category: "Relationship",
    icon: UserX,
    iconColor: "text-purple-500 bg-purple-50",
    leadTypes: ["Expired", "Pre-Expired"],
    extraLeadTypesCount: 0,
    responseStyle: "Differentiation",
    styleBadgeColor: "bg-purple-50 text-purple-600",
    lastUpdated: "May 2, 2024",
  },
  {
    id: 4,
    title: "How did you get my number?",
    category: "Relationship",
    icon: HelpCircle,
    iconColor: "text-blue-500 bg-blue-50",
    leadTypes: ["FSBO", "Circle Prospecting"],
    extraLeadTypesCount: 0,
    responseStyle: "Transparency",
    styleBadgeColor: "bg-sky-50 text-sky-600",
    lastUpdated: "May 2, 2024",
  },
  {
    id: 5,
    title: "I'm not interested.",
    category: "Relationship",
    icon: XCircle,
    iconColor: "text-emerald-500 bg-emerald-50",
    leadTypes: ["All Lead Types"],
    extraLeadTypesCount: 0,
    responseStyle: "Curiosity Respect",
    styleBadgeColor: "bg-emerald-50 text-emerald-600",
    lastUpdated: "May 2, 2024",
  },
  {
    id: 6,
    title: "Your commission is too high.",
    category: "Financial",
    icon: MessageSquare,
    iconColor: "text-rose-500 bg-rose-50",
    leadTypes: ["FSBO", "Expired"],
    extraLeadTypesCount: 0,
    responseStyle: "Value Justification",
    styleBadgeColor: "bg-rose-50 text-rose-600",
    lastUpdated: "May 3, 2024",
  },
  {
    id: 7,
    title: "I need to think about it.",
    category: "Risk",
    icon: Clock,
    iconColor: "text-amber-500 bg-amber-50",
    leadTypes: ["FSBO", "Expired", "Absentee", "Circle Prospecting"],
    extraLeadTypesCount: 0,
    responseStyle: "Gentle Urgency",
    styleBadgeColor: "bg-amber-50 text-amber-600",
    lastUpdated: "May 3, 2024",
  },
  {
    id: 8,
    title: "The market is too slow right now.",
    category: "Risk",
    icon: XCircle,
    iconColor: "text-blue-500 bg-blue-50",
    leadTypes: ["FSBO", "Expired", "Pre-Expired"],
    extraLeadTypesCount: 0,
    responseStyle: "Market Intelligence",
    styleBadgeColor: "bg-blue-50 text-blue-600",
    lastUpdated: "May 4, 2024",
  },
  {
    id: 9,
    title: "I'm working with a family friend.",
    category: "Relationship",
    icon: UserX,
    iconColor: "text-purple-500 bg-purple-50",
    leadTypes: ["Expired", "Absentee"],
    extraLeadTypesCount: 0,
    responseStyle: "Differentiation",
    styleBadgeColor: "bg-purple-50 text-purple-600",
    lastUpdated: "May 5, 2024",
  },
  {
    id: 10,
    title: "Can you guarantee a sale?",
    category: "Risk",
    icon: HelpCircle,
    iconColor: "text-teal-500 bg-teal-50",
    leadTypes: ["All Lead Types"],
    extraLeadTypesCount: 0,
    responseStyle: "Honest Transparency",
    styleBadgeColor: "bg-teal-50 text-teal-600",
    lastUpdated: "May 5, 2024",
  },
  {
    id: 11,
    title: "I'll list with a discounter.",
    category: "Financial",
    icon: UserX,
    iconColor: "text-orange-500 bg-orange-50",
    leadTypes: ["FSBO", "Expired"],
    extraLeadTypesCount: 0,
    responseStyle: "Value Comparison",
    styleBadgeColor: "bg-orange-50 text-orange-600",
    lastUpdated: "May 6, 2024",
  },
  {
    id: 12,
    title: "Call me back in 6 months.",
    category: "Logistic",
    icon: Clock,
    iconColor: "text-sky-500 bg-sky-50",
    leadTypes: ["FSBO", "Absentee"],
    extraLeadTypesCount: 0,
    responseStyle: "Future Pacing",
    styleBadgeColor: "bg-sky-50 text-sky-600",
    lastUpdated: "May 6, 2024",
  },
  {
    id: 13,
    title: "I don't trust real estate agents.",
    category: "Relationship",
    icon: HelpCircle,
    iconColor: "text-red-500 bg-red-50",
    leadTypes: ["FSBO", "Expired", "Absentee"],
    extraLeadTypesCount: 1,
    responseStyle: "Empathy & Proof",
    styleBadgeColor: "bg-red-50 text-red-600",
    lastUpdated: "May 7, 2024",
  },
  {
    id: 14,
    title: "I already have an offer pending.",
    category: "Logistic",
    icon: MessageSquare,
    iconColor: "text-lime-500 bg-lime-50",
    leadTypes: ["Expired", "Pre-Expired", "FSBO"],
    extraLeadTypesCount: 0,
    responseStyle: "Contingency Planning",
    styleBadgeColor: "bg-lime-50 text-lime-600",
    lastUpdated: "May 7, 2024",
  },
];

// Default objection-handling framework
export const DEFAULT_FRAMEWORK_STEPS = [
  { id: "acknowledge", label: "Acknowledge", icon: Mic },
  { id: "validate", label: "Validate", icon: Heart },
  { id: "reframe", label: "Reframe", icon: RotateCw },
  { id: "guide", label: "Guide Forward", icon: FileText },
];

const StepFour = ({ formData, setFormData, objections, setObjections, frameworkSteps, setFrameworkSteps, onBack, onNext }) => {
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
  const ITEMS_PER_PAGE = 5;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeadType, setSelectedLeadType] = useState("All Lead Types");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [currentPage, setCurrentPage] = useState(1);

  // Full real-estate lead types available in the filter dropdown
  const leadTypeFilterOptions = [
    "Expired Listings",
    "Pre-Expired Listings",
    "FSBO",
    "Absentee Owners",
    "Circle Prospecting",
    "Just Listed",
    "Just Sold",
    "Probate",
    "Trust & Estate",
    "Pre-Foreclosure",
    "Foreclosure / REO",
    "Divorce",
    "Tax Delinquent",
    "Vacant Properties",
    "Investor / Cash Buyers",
    "Past Clients & Sphere",
  ].map((label) => ({ value: label, label }));

  // Short aliases used inside objection templates (e.g. "Expired") for the
  // longer dropdown labels (e.g. "Expired Listings") so filtering still matches.
  const LEAD_TYPE_ALIASES = {
    "Expired Listings": "Expired",
    "Pre-Expired Listings": "Pre-Expired",
    "Absentee Owners": "Absentee",
  };

  const matchesLeadType = (o, selected) => {
    if (o.leadTypes.includes(selected)) return true;
    const alias = LEAD_TYPE_ALIASES[selected];
    if (alias && o.leadTypes.includes(alias)) return true;
    return false;
  };

  // The wizard owns objections and framework steps (so they're saved); these
  // local copies keep the step responsive while editing.
  const [localObjections, setLocalObjections] = useState(objections || DEFAULT_OBJECTIONS);
  const updateObjections = (next) => {
    const value = typeof next === "function" ? next(localObjections) : next;
    setLocalObjections(value);
    if (setObjections) setObjections(value);
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingObjection, setEditingObjection] = useState(null);
  const [isFrameworkModalOpen, setIsFrameworkModalOpen] = useState(false);
  const [frameworkModalKey, setFrameworkModalKey] = useState(0);
  const [localFrameworkSteps, setLocalFrameworkSteps] = useState(frameworkSteps || DEFAULT_FRAMEWORK_STEPS);
  const updateFrameworkSteps = (next) => {
    setLocalFrameworkSteps(next);
    if (setFrameworkSteps) setFrameworkSteps(next);
  };

  // Category + lead type + search filters ("All …" values show everything)
  const filteredObjections = localObjections.filter((o) => {
    if (selectedCategory !== "All Categories" && o.category !== selectedCategory) return false;
    if (selectedLeadType !== "All Lead Types") {
      const matchesType =
        matchesLeadType(o, selectedLeadType) || o.leadTypes.includes("All Lead Types");
      if (!matchesType) return false;
    }
    if (searchQuery.trim() && !o.title.toLowerCase().includes(searchQuery.trim().toLowerCase())) {
      return false;
    }
    return true;
  });

  // Pagination calculations (clamp to a valid page so no effect is needed)
  const totalPages = Math.max(1, Math.ceil(filteredObjections.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedObjections = filteredObjections.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );
  const startItem = filteredObjections.length === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(safePage * ITEMS_PER_PAGE, filteredObjections.length);

  const handleOpenAdd = () => {
    setEditingObjection(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (obj) => {
    setEditingObjection(obj);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingObjection(null);
    setIsModalOpen(false);
  };

  const handleSaveFrameworkSteps = (newSteps) => {
    updateFrameworkSteps(newSteps);
  };

  const handleOpenFrameworkModal = () => {
    // Remount the modal so it always starts from the current saved steps
    setFrameworkModalKey((k) => k + 1);
    setIsFrameworkModalOpen(true);
  };

  const handleDeleteObjection = (id) => {
    const remaining = localObjections.filter((o) => o.id !== id);
    updateObjections(remaining);
    // Jump back to page 1 if the current page no longer exists after deletion
    // (computed against the filtered list so it stays correct with filters active)
    const remainingFiltered = remaining.filter((o) => {
      if (selectedCategory !== "All Categories" && o.category !== selectedCategory) return false;
      if (selectedLeadType !== "All Lead Types") {
        const matchesType =
          matchesLeadType(o, selectedLeadType) || o.leadTypes.includes("All Lead Types");
        if (!matchesType) return false;
      }
      return true;
    });
    if (currentPage > Math.max(1, Math.ceil(remainingFiltered.length / ITEMS_PER_PAGE))) {
      setCurrentPage(1);
    }
  };

  const handleSaveObjection = (objData) => {
    if (objData.id) {
      // Editing existing
      updateObjections(localObjections.map((o) => (o.id === objData.id ? { ...o, ...objData } : o)));
    } else {
      // Adding new
      updateObjections([...localObjections, { id: Math.max(0, ...localObjections.map((o) => Number(o.id) || 0)) + 1, ...objData }]);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT / MAIN CONTENT AREA */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-light-gray shadow-sm overflow-hidden">
            {/* Tab Header with inline action buttons */}
            <div className="px-6 pt-5 pb-3 border-b border-light-gray flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="pb-0 text-sm font-bold text-primary border-b-2 border-primary flex items-center gap-2 cursor-pointer"
                >
                  My Objections
                  <span className="px-2 py-0.5 text-xs font-semibold bg-light-teal text-primary rounded-full">
                    {localObjections.length}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-primary text-primary font-semibold text-xs hover:bg-primary hover:text-white transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-primary text-primary font-semibold text-xs hover:bg-primary hover:text-white transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Import
                </button>
              </div>
            </div>

            {/* Filters Row */}
            <div className="p-4 bg-light-gray/30 border-b border-light-gray flex flex-wrap items-center gap-3">
              {/* Lead Type Dropdown */}
              <div className="min-w-[150px]">
                <SettingsDropdown
                  label="All Lead Types"
                  items={[
                    { value: "All Lead Types", label: "All Lead Types" },
                    ...leadTypeFilterOptions,
                  ]}
                  selected={selectedLeadType}
                  onSelect={(v) => {
                    setSelectedLeadType(v);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {/* Category Dropdown */}
              <div className="min-w-[150px]">
                <SettingsDropdown
                  label="All Categories"
                  items={[
                    { value: "All Categories", label: "All Categories" },
                    ...CATEGORY_OPTIONS.map((c) => ({ value: c, label: c })),
                  ]}
                  selected={selectedCategory}
                  onSelect={(v) => {
                    setSelectedCategory(v);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {/* Search Bar */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-light-black absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search localObjections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-light-gray text-[10px] font-bold text-light-black uppercase tracking-wider bg-light-gray/30">
                    <th className="py-3 px-4 pl-6">
                      <div className="flex items-center gap-1 cursor-pointer">
                        OBJECTION <ChevronDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3 px-4">LEAD TYPES</th>
                    <th className="py-3 px-4">YOUR RESPONSE STYLE</th>
                    <th className="py-3 px-4">LAST UPDATED</th>
                    <th className="py-3 px-4 pr-6 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-gray text-xs">
                  {paginatedObjections.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <tr key={item.id} className="hover:bg-primary/5 transition">
                        {/* Objection Title & Category */}
                        <td className="py-4 px-4 pl-6">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-xl shrink-0 ${item.iconColor}`}>
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <div>
                              <Text variant="smaller" className="!font-bold !text-dark-black">
                                {item.title}
                              </Text>
                              <Text variant="extraSmall" className="text-light-black mt-0.5">
                                {item.category}
                              </Text>
                            </div>
                          </div>
                        </td>

                        {/* Lead Types Badges */}
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {item.leadTypes.map((type, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-light-gray text-medium-black font-semibold text-[10px] rounded-md"
                              >
                                {type}
                              </span>
                            ))}
                            {item.extraLeadTypesCount > 0 && (
                              <span className="px-1.5 py-0.5 bg-light-gray text-light-black font-medium text-[10px] rounded-md">
                                +{item.extraLeadTypesCount}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Response Style Badge */}
                        <td className="py-4 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold inline-block ${item.styleBadgeColor}`}
                          >
                            {item.responseStyle}
                          </span>
                        </td>

                        {/* Last Updated */}
                        <td className="py-4 px-4 text-medium-black font-medium text-xs">
                          {item.lastUpdated}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(item)}
                              className="p-1.5 text-light-black hover:text-blue-500 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteObjection(item.id)}
                              className="p-1.5 text-light-black hover:text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-4 border-t border-light-gray flex flex-col sm:flex-row items-center justify-between gap-2">
              <Text variant="extraSmall" className="!font-medium text-light-black text-center sm:text-left">
                {filteredObjections.length === 0
                  ? "No localObjections found"
                  : `Showing ${startItem} to ${endItem} of ${filteredObjections.length} objection${filteredObjections.length !== 1 ? "s" : ""}`}
              </Text>

              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className="p-1.5 rounded-lg border border-light-gray text-light-black hover:bg-light-gray disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center cursor-pointer transition ${
                        page === currentPage
                          ? "bg-primary text-white"
                          : "border border-light-gray text-medium-black hover:bg-light-gray"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    className="p-1.5 rounded-lg border border-light-gray text-medium-black hover:bg-light-gray disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Add / Edit Objection Modal */}
          <AddObjectionModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={handleSaveObjection}
            editObjection={editingObjection}
          />

          {/* Framework Edit Modal */}
          <FrameworkEditModal
            key={frameworkModalKey}
            isOpen={isFrameworkModalOpen}
            onClose={() => setIsFrameworkModalOpen(false)}
            onSave={handleSaveFrameworkSteps}
            steps={localFrameworkSteps}
          />

        </div>

        {/* RIGHT SIDEBAR COLUMN */}
        <div className="space-y-6">
          {/* Strategy Tips Card */}
          <div className="bg-white rounded-2xl p-6 border border-light-gray shadow-sm space-y-5">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-primary" />
              <Text variant="regular" className="font-bold !text-primary">
                Objection Strategy Tips
              </Text>
            </div>
            <Text variant="small" className="text-light-black">
              Best practices for handling localObjections effectively.
            </Text>

            <ul className="space-y-3 pt-1">
              {[
                "Focus on value, not price",
                "Acknowledge, validate, then redirect",
                "Keep responses short and natural",
                "Always guide toward the next step",
                "Use your unique voice and style",
              ].map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5 stroke-[2.5]" />
                  <Text variant="small" className="text-medium-black font-medium leading-tight">
                    {tip}
                  </Text>
                </li>
              ))}
            </ul>
          </div>

          {/* Response Framework Card */}
          <div className="bg-white rounded-2xl p-6 border border-light-gray shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <Text variant="regular" className="font-bold !text-dark-black">
                  Objection Response Framework
                </Text>
                <Text variant="smaller" className="text-light-black mt-0.5">
                  This is the structure PitchProX will use.
                </Text>
              </div>
              <button
                type="button"
                onClick={handleOpenFrameworkModal}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                <Pencil className="w-3 h-3" /> Edit
              </button>
            </div>

            {/* Process Step Flow */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-1 items-center pt-2 text-center">
              {localFrameworkSteps.map((step, idx) => {
                const StepIcon = typeof step.icon === "string"
                  ? { Mic, Heart, RotateCw, FileText }[step.icon] || Mic
                  : step.icon || Mic;
                return (
                  <div key={step.id} className="flex flex-col items-center gap-1.5 relative">
                    {idx > 0 && (
                      <>
                        <div className="hidden sm:block absolute -left-2 top-2.5 text-light-black">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                        {idx % 2 === 1 && (
                          <div className="sm:hidden absolute top-1/2 -left-3 -translate-y-1/2 text-light-black">
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        )}
                      </>
                    )}
                    <div className="p-2.5 rounded-xl bg-light-teal/60 text-primary">
                      <StepIcon className="w-4 h-4" />
                    </div>
                    <Text variant="extraSmall" className="!font-medium text-medium-black">{step.label}</Text>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="bg-white rounded-2xl p-6 border border-light-gray shadow-sm space-y-5">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-teal-600" />
              <Text variant="regular" className="font-bold !text-teal-700">
                Live Preview
              </Text>
            </div>
            <Text variant="small" className="text-light-black">
              This is how your AI coaching will start to sound.
            </Text>

            {/* Bubble Box - teal tones to match framework */}
            <div className="p-5 rounded-2xl bg-teal-50/80 border border-teal-100 space-y-3">
              <Text variant="small" className="!font-bold !text-dark-black">
                Hey Daniel, I&apos;ve got you.
              </Text>
              <Text variant="small" className="text-teal-800 leading-relaxed">
                I&apos;ll keep my prompts confident, direct, and consultative &mdash; short, professional, and to the point.
              </Text>
              <Text variant="small" className="text-teal-800 leading-relaxed">
                Let&apos;s build a playbook that wins more conversations.
              </Text>
            </div>

            <button
              type="button"
              className="w-full py-2.5 px-4 rounded-xl border-2 border-primary text-primary font-semibold text-sm hover:bg-primary/5 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Regenerate Preview
            </button>
          </div>

          {/* Need Inspiration Card */}
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
              Next: Objection Handling
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <ExamplePlaybooksModal isOpen={examplesOpen} onClose={() => setExamplesOpen(false)} onUseTemplate={applyTemplate} />
    </div>
  );
};

export default StepFour;