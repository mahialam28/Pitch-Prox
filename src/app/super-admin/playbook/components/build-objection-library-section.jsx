"use client";

import { normalizeObjection } from "@/lib/playbook-compile";

import React, { useState } from "react";
import {
  Shield,
  Plus,
  DownloadCloud,
  Search,
  Filter,
  Pencil,
  MoreVertical,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Clock,
  User,
  HelpCircle,
  AlertCircle,
  Mail,
  MessageCircle,
} from "lucide-react";
import AddObjectionModal, { OBJECTION_ICONS } from "./add-objection-modal";
import ImportObjectionModal from "./import-objection-modal";

export const DEFAULT_OBJECTIONS = [
  {
    id: 1,
    title: "I don't want to pay commission.",
    subtitle: "Pricing Objection",
    category: "Financial",
    rootCategory: "Financial",
    subtype: "Affordability",
    stage: "Value Prop",
    leadTypes: ["FSBO", "Expired", "Pre-Expired", "+2"],
    responseStyle: "Value & ROI Focus",
    goal: "Overcome price concern and show value",
    note: "Confident, respectful, value-driven",
    iconType: "message-rose",
  },
  {
    id: 2,
    title: "Not a good time to sell.",
    subtitle: "Timing Objection",
    category: "Logistics",
    rootCategory: "Logistics",
    subtype: "Timing",
    stage: "Discovery",
    leadTypes: ["FSBO", "Absentee", "Pre-Expired", "+1"],
    responseStyle: "Market Analysis & Urgency",
    goal: "Uncover true timing bottleneck and timeline",
    note: "Inquisitive, empathetic",
    iconType: "clock-amber",
  },
  {
    id: 3,
    title: "I already have an agent.",
    subtitle: "Competition Objection",
    category: "Relationship",
    rootCategory: "Relationship",
    subtype: "Competition",
    stage: "Discovery",
    leadTypes: ["FSBO", "Expired", "Circle"],
    responseStyle: "Differentiated Track Record",
    goal: "Position complementary value without badmouthing",
    note: "Respectful, authoritative",
    iconType: "user-purple",
  },
  {
    id: 4,
    title: "How did you get my number?",
    subtitle: "Privacy Objection",
    category: "Risk",
    rootCategory: "Risk",
    subtype: "Privacy concern",
    stage: "Opening",
    leadTypes: ["FSBO", "Circle Prospecting", "Sphere"],
    responseStyle: "Transparent & Direct",
    goal: "Disarm privacy concern instantly and pivot to value",
    note: "Calm, transparent",
    iconType: "clock-cyan",
  },
  {
    id: 5,
    title: "I'm not interested.",
    subtitle: "Disinterest Objection",
    category: "Relationship",
    rootCategory: "Relationship",
    subtype: "Identity cost / emotional",
    stage: "Objections",
    leadTypes: ["All Lead Types"],
    responseStyle: "Pattern Interrupt",
    goal: "Earn 30 more seconds by challenging assumptions",
    note: "High energy, punchy",
    iconType: "alert-emerald",
  },
  {
    id: 6,
    title: "Send me some information.",
    subtitle: "Information Objection",
    category: "Logistics",
    rootCategory: "Logistics",
    subtype: "Information needed",
    stage: "Follow Up",
    leadTypes: ["All Lead Types"],
    responseStyle: "Curiosity Anchor",
    goal: "Qualify what information is specifically valuable before sending",
    note: "Consultative",
    iconType: "mail-blue",
  },
  {
    id: 7,
    title: "I need to think about it.",
    subtitle: "Need Time Objection",
    category: "Logistics",
    rootCategory: "Logistics",
    subtype: "Timing",
    stage: "Close",
    leadTypes: ["All Lead Types"],
    responseStyle: "Isolation & Clarification",
    goal: "Isolate what specific factor they need to think over",
    note: "Direct, closing focus",
    iconType: "clock-amber",
  },
  {
    id: 8,
    title: "Your fee is too high compared to others.",
    subtitle: "Pricing Objection",
    category: "Financial",
    rootCategory: "Financial",
    subtype: "Affordability",
    stage: "Value Prop",
    leadTypes: ["Expired", "FSBO"],
    responseStyle: "Net Proceeds Anchor",
    goal: "Demonstrate higher net proceeds after commission",
    note: "Analytical, data-backed",
    iconType: "message-rose",
  },
];

const STAGE_COLORS = {
  Opening: "text-emerald-700 bg-emerald-50 border-emerald-100",
  Discovery: "text-blue-700 bg-blue-50 border-blue-100",
  "Value Prop": "text-purple-700 bg-purple-50 border-purple-100",
  "Value Proposition": "text-purple-700 bg-purple-50 border-purple-100",
  Objections: "text-amber-700 bg-amber-50 border-amber-100",
  Close: "text-teal-700 bg-teal-50 border-teal-100",
  "Follow Up": "text-rose-700 bg-rose-50 border-rose-100",
};

const BuildObjectionLibrarySection = ({
  objections = DEFAULT_OBJECTIONS,
  stages = null,
  selectedObjectionId = 1,
  onSelectObjection = () => {},
  onChange = () => {},
}) => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingObjection, setEditingObjection] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);

  const ITEMS_PER_PAGE = 8;

  // Filter list
  const filteredObjections = objections.filter((item) => {
    if (activeTab === "category" && !item.category) return false;
    if (activeTab === "leadType" && (!item.leadTypes || item.leadTypes.length === 0)) return false;
    if (activeTab === "stage" && !item.stage) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q) ||
      item.subtype?.toLowerCase().includes(q) ||
      item.stage?.toLowerCase().includes(q) ||
      (Array.isArray(item.leadTypes) && item.leadTypes.some((t) => t.toLowerCase().includes(q)))
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredObjections.length / ITEMS_PER_PAGE));
  const paginatedList = filteredObjections.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleOpenAdd = () => {
    setEditingObjection(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (obj) => {
    setEditingObjection(obj);
    setIsAddModalOpen(true);
    setActiveMenuId(null);
  };

  const handleDelete = (id) => {
    const updated = objections.filter((item) => item.id !== id);
    onChange(updated);
    if (selectedObjectionId === id && updated.length > 0) {
      onSelectObjection(updated[0]);
    }
    setActiveMenuId(null);
  };

  const handleSaveObjection = (objectionData) => {
    let updated;
    if (objectionData.id) {
      updated = objections.map((item) =>
        item.id === objectionData.id ? { ...item, ...objectionData } : item
      );
      if (selectedObjectionId === objectionData.id) {
        onSelectObjection({ ...objectionData });
      }
    } else {
      const newObj = {
        ...objectionData,
        id: Date.now(),
      };
      updated = [newObj, ...objections];
      onSelectObjection(newObj);
    }
    onChange(updated);
  };

  const handleImportLibrary = (templateId) => {
    // Merge or set imported template
    onChange(DEFAULT_OBJECTIONS);
  };

  const getIconComponent = (iconType) => {
    switch (iconType) {
      case "message-rose":
        return <MessageSquare className="w-3.5 h-3.5 text-rose-500" />;
      case "clock-amber":
        return <Clock className="w-3.5 h-3.5 text-amber-500" />;
      case "user-purple":
        return <User className="w-3.5 h-3.5 text-purple-500" />;
      case "clock-cyan":
        return <HelpCircle className="w-3.5 h-3.5 text-cyan-500" />;
      case "alert-emerald":
        return <AlertCircle className="w-3.5 h-3.5 text-emerald-500" />;
      case "mail-blue":
        return <Mail className="w-3.5 h-3.5 text-blue-500" />;
      default:
        return <MessageCircle className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-6 sm:p-7 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-dark-black/80 font-secondary">
              Build Objection Library
            </h2>
            <p className="text-xs text-medium-black mt-0.5 font-normal">
              Add, organize, and teach the AI how to handle objections.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-3.5 py-1.5 rounded-xl border border-primary/40 hover:border-primary bg-primary/5 hover:bg-primary/10 text-primary text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Objection</span>
          </button>

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl border border-light-gray hover:border-medium-black/30 text-medium-black hover:text-dark-black bg-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <DownloadCloud className="w-3.5 h-3.5" />
            <span>Import Library</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 pt-1">
        {/* Left Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab("all");
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-primary text-white shadow-2xs"
                : "bg-light-gray/40 text-medium-black hover:text-dark-black hover:bg-light-gray"
            }`}
          >
            All Objections ({objections.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("category");
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "category"
                ? "bg-primary text-white shadow-2xs"
                : "bg-light-gray/40 text-medium-black hover:text-dark-black hover:bg-light-gray"
            }`}
          >
            By Category
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("leadType");
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "leadType"
                ? "bg-primary text-white shadow-2xs"
                : "bg-light-gray/40 text-medium-black hover:text-dark-black hover:bg-light-gray"
            }`}
          >
            By Lead Type
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("stage");
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "stage"
                ? "bg-primary text-white shadow-2xs"
                : "bg-light-gray/40 text-medium-black hover:text-dark-black hover:bg-light-gray"
            }`}
          >
            By Stage
          </button>
        </div>

        {/* Right Search & Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-light-black" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search objections..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-light-gray text-xs focus:outline-none focus:border-primary text-dark-black/80 placeholder:text-light-black bg-white"
            />
          </div>

          <button
            type="button"
            className="px-3 py-1.5 rounded-xl border border-light-gray hover:border-medium-black/30 bg-white text-xs font-semibold text-medium-black hover:text-dark-black flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-light-gray">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-light-gray/40 border-b border-light-gray text-[10px] font-bold text-light-black uppercase tracking-wider">
              <th className="py-3 px-4 min-w-[220px]">Objection</th>
              <th className="py-3 px-3 min-w-[100px]">Category</th>
              <th className="py-3 px-3 min-w-[140px]">Lead Types</th>
              <th className="py-3 px-3 min-w-[110px]">Stage</th>
              <th className="py-3 px-4 text-right min-w-[80px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-gray">
            {paginatedList.map((item) => {
              const isSelected = selectedObjectionId === item.id;
              const stageBadgeClass = STAGE_COLORS[item.stage] || "text-teal-700 bg-teal-50 border-teal-100";

              return (
                <tr
                  key={item.id}
                  onClick={() => onSelectObjection(item)}
                  className={`transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-primary/5 hover:bg-primary/10"
                      : "bg-white hover:bg-light-gray/30"
                  }`}
                >
                  {/* Objection + Subtitle */}
                  <td className="py-3 px-4">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 shrink-0">
                        {getIconComponent(item.iconType)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-dark-black/90 font-secondary leading-snug truncate max-w-[260px]">
                          {item.title}
                        </h4>
                        <span className="text-[11px] text-light-black font-normal block">
                          {item.subtitle || `${item.subtype ?? item.category} Objection`}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-3 font-medium text-medium-black">
                    {normalizeObjection(item).rootCategory ?? item.category}{normalizeObjection(item).subtype ? ` · ${normalizeObjection(item).subtype}` : ""}
                  </td>

                  {/* Lead Types */}
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(item.leadTypes) ? (
                        item.leadTypes.map((lt, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded-md bg-light-gray/70 text-medium-black text-[10px] font-medium"
                          >
                            {lt}
                          </span>
                        ))
                      ) : (
                        <span className="px-1.5 py-0.5 rounded-md bg-light-gray/70 text-medium-black text-[10px] font-medium">
                          {item.leadTypes}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Stage */}
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold ${stageBadgeClass}`}>
                      {item.stage}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="relative inline-flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="p-1 rounded-lg text-light-black hover:text-dark-black hover:bg-light-gray transition-colors cursor-pointer"
                        title="Edit objection"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                        className="p-1 rounded-lg text-light-black hover:text-dark-black hover:bg-light-gray transition-colors cursor-pointer"
                        title="More actions"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === item.id && (
                        <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl border border-light-gray shadow-lg py-1 z-20 text-left">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="w-full px-3 py-1.5 text-xs text-medium-black hover:text-dark-black hover:bg-light-gray flex items-center gap-2 cursor-pointer"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="w-full px-3 py-1.5 text-xs text-rose-500 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs">
        <span className="text-light-black font-normal">
          Showing 1 to {Math.min(paginatedList.length, 8)} of {filteredObjections.length} objections
        </span>

        <div className="flex items-center gap-1 self-center sm:self-auto">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1.5 rounded-lg border border-light-gray text-light-black hover:bg-light-gray disabled:opacity-30 cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                currentPage === page
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
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded-lg border border-light-gray text-light-black hover:bg-light-gray disabled:opacity-30 cursor-pointer transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Modals */}
      <AddObjectionModal
        key={isAddModalOpen ? `edit-${editingObjection?.id ?? "new"}` : "closed"}
        stages={stages}
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveObjection}
        editObjection={editingObjection}
      />

      <ImportObjectionModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportLibrary}
      />
    </div>
  );
};

export default BuildObjectionLibrarySection;
