"use client";

import React, { useState } from "react";
import {
  FileText,
  Plus,
  Upload,
  Eye,
  MoreVertical,
  Pencil,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Archive,
  Mail,
  MessageSquare,
} from "lucide-react";
import AddResourceModal from "./add-resource-modal";
import ImportResourceModal from "./import-resource-modal";
import ViewResourceModal from "./view-resource-modal";

export const DEFAULT_RESOURCES = [
  {
    id: 1,
    name: "Call Flow Overview",
    type: "Script",
    category: "Scripts",
    description: "Complete call structure with key talking points and transitions",
    addedBy: "Daniel Miller",
    addedDate: "May 10, 2024",
    iconColor: "rose",
    content: "Complete call flow structure designed for high-value sales conversations:\n1. Pattern interrupt greeting.\n2. Diagnostic inquiry.\n3. Value anchor.\n4. Definite closing question.",
  },
  {
    id: 2,
    name: "Opening Scripts (10 Variations)",
    type: "Call Openers",
    category: "Call Openers",
    description: "10 powerful opening lines for different lead types.",
    addedBy: "Daniel Miller",
    addedDate: "May 10, 2024",
    iconColor: "sky",
    content: "10 tested opening hooks for expired listings, FSBO, probate, and cold outreach. Emphasizes instant rapport, curiosity, and authority.",
  },
  {
    id: 3,
    name: "Discovery Question Bank",
    type: "Script",
    category: "Scripts",
    description: "Deep discovery questions organized by motivation.",
    addedBy: "Daniel Miller",
    addedDate: "May 9, 2024",
    iconColor: "emerald",
    content: "Categorized questions to uncover:\n- Core motivation\n- Financial urgency\n- Timeline constraints\n- Previous bad experiences with agents",
  },
  {
    id: 4,
    name: "Value Proposition Framework",
    type: "Guide",
    category: "Guides",
    description: "How to present value in a way that resonates.",
    addedBy: "Daniel Miller",
    addedDate: "May 9, 2024",
    iconColor: "amber",
    content: "Framework for articulating net equity return, strategic marketing positioning, and proprietary negotiation leverage.",
  },
  {
    id: 5,
    name: "Email Follow-Up Templates",
    type: "Email Template",
    category: "Email Templates",
    description: "5 follow-up email templates for different scenarios.",
    addedBy: "Daniel Miller",
    addedDate: "May 9, 2024",
    iconColor: "purple",
    content: "Multi-scenario email sequences:\n- Post-call summary\n- Unresponsive prospect re-engagement\n- Market update value drop\n- Final decision check-in",
  },
  {
    id: 6,
    name: "Objection Response Scripts",
    type: "Objection Script",
    category: "Objection Responses",
    description: "Detailed response scripts for top 20 objections.",
    addedBy: "Daniel Miller",
    addedDate: "May 8, 2024",
    iconColor: "rose",
    content: "Comprehensive word-for-word rebuttals for fee objections, market delay excuses, and competing representation.",
  },
  {
    id: 7,
    name: "Closing Scripts (8 Variations)",
    type: "Script",
    category: "Scripts",
    description: "8 closing approaches to secure commitment.",
    addedBy: "Daniel Miller",
    addedDate: "May 7, 2024",
    iconColor: "teal",
    content: "Proven closing variations:\n- Assumptive close\n- Alternative choice close\n- Urgency/Market shift close\n- Net proceeds agreement close",
  },
  {
    id: 8,
    name: "Implementation Playbook",
    type: "Guide",
    category: "Guides",
    description: "Step-by-step guide to implementing this method.",
    addedBy: "Daniel Miller",
    addedDate: "May 7, 2024",
    iconColor: "blue",
    content: "Team rollout procedures, daily warm-up scripts, call review rubrics, and KPI benchmarks for representatives.",
  },
  // Extra items to fulfill 24 resources for pagination
  {
    id: 9,
    name: "FSBO Direct Outreach Scripts",
    type: "Call Openers",
    category: "Call Openers",
    description: "Direct-to-seller opening scripts focusing on net savings and exposure.",
    addedBy: "Daniel Miller",
    addedDate: "May 6, 2024",
    iconColor: "sky",
    content: "Specific dialogues to overcome FSBO seller skepticism and secure in-person evaluation appointments.",
  },
  {
    id: 10,
    name: "Price Reduction Negotiation Guide",
    type: "Guide",
    category: "Guides",
    description: "Data-backed framework for managing client pricing expectations.",
    addedBy: "Daniel Miller",
    addedDate: "May 5, 2024",
    iconColor: "amber",
    content: "How to present 30-day market feedback and adjust list price seamlessly.",
  },
  {
    id: 11,
    name: "Expired Listing Re-engagement Script",
    type: "Script",
    category: "Scripts",
    description: "Empathetic reset script diagnosing why the previous listing expired.",
    addedBy: "Daniel Miller",
    addedDate: "May 5, 2024",
    iconColor: "rose",
    content: "Conversation flow for sellers frustrated with past agents.",
  },
  {
    id: 12,
    name: "Post-Showing Follow Up Sequence",
    type: "Follow Up",
    category: "Follow Up",
    description: "Fast-turnaround SMS and email messages following property showings.",
    addedBy: "Daniel Miller",
    addedDate: "May 4, 2024",
    iconColor: "purple",
    content: "Buyer agent follow up scripts to solicit buyer interest and urgency.",
  },
  {
    id: 13,
    name: "Authority Positioning Masterclass",
    type: "Guide",
    category: "Guides",
    description: "Shark Tank credibility building techniques for high-ticket clients.",
    addedBy: "Daniel Miller",
    addedDate: "May 4, 2024",
    iconColor: "blue",
    content: "Techniques on body language, vocal pacing, and social proof integration.",
  },
  {
    id: 14,
    name: "Cold Lead Revival Email Template",
    type: "Email Template",
    category: "Email Templates",
    description: "9-word email revival template for leads dormant 60+ days.",
    addedBy: "Daniel Miller",
    addedDate: "May 3, 2024",
    iconColor: "purple",
    content: "Subject: Still looking in [City]?\nBody: Are you still considering a move in the next few months?",
  },
  {
    id: 15,
    name: "Commission Justification Talking Points",
    type: "Objection Script",
    category: "Objection Responses",
    description: "Calculated talking points showing how full service yields higher net ROI.",
    addedBy: "Daniel Miller",
    addedDate: "May 3, 2024",
    iconColor: "rose",
    content: "Step-by-step mathematical demonstration of net vs gross proceeds.",
  },
  {
    id: 16,
    name: "Probate & Estate Consultation Script",
    type: "Script",
    category: "Scripts",
    description: "Respectful, service-first communication framework for estate executors.",
    addedBy: "Daniel Miller",
    addedDate: "May 2, 2024",
    iconColor: "emerald",
    content: "Sensitive consultation dialogue focusing on property management, liquidation, and timeline ease.",
  },
  {
    id: 17,
    name: "Investor Deal Pitch Template",
    type: "Other",
    category: "Other",
    description: "One-page deal analysis and pitch summary sheet for cash buyers.",
    addedBy: "Daniel Miller",
    addedDate: "May 2, 2024",
    iconColor: "teal",
    content: "Cap rate, cash-on-cash return, and exit strategy summary format.",
  },
  {
    id: 18,
    name: "Urgency Close for Hesitant Buyers",
    type: "Script",
    category: "Scripts",
    description: "Overcome buyer paralysis during interest rate fluctuations.",
    addedBy: "Daniel Miller",
    addedDate: "May 1, 2024",
    iconColor: "rose",
    content: "Rate vs price dynamics dialogue and long-term equity projection.",
  },
  {
    id: 19,
    name: "Pre-Listing Information Packet",
    type: "Guide",
    category: "Guides",
    description: "Digital brochure sent ahead of listing appointments.",
    addedBy: "Daniel Miller",
    addedDate: "May 1, 2024",
    iconColor: "amber",
    content: "Preparation checklist for sellers prior to first meeting.",
  },
  {
    id: 20,
    name: "Past Client Annual Equity Review",
    type: "Follow Up",
    category: "Follow Up",
    description: "Annual touchpoint script updating past clients on home equity.",
    addedBy: "Daniel Miller",
    addedDate: "Apr 30, 2024",
    iconColor: "purple",
    content: "Warm script for referral generation and repeat business touchpoints.",
  },
  {
    id: 21,
    name: "Open House Lead Capture Script",
    type: "Call Openers",
    category: "Call Openers",
    description: "Natural registration sign-in scripts and unrepresented buyer qualifying.",
    addedBy: "Daniel Miller",
    addedDate: "Apr 29, 2024",
    iconColor: "sky",
    content: "Non-intrusive qualifying questions for open house visitors.",
  },
  {
    id: 22,
    name: "Circle Prospecting Voicemail Script",
    type: "Call Openers",
    category: "Call Openers",
    description: "Neighborhood just-listed and just-sold voicemail drop scripts.",
    addedBy: "Daniel Miller",
    addedDate: "Apr 28, 2024",
    iconColor: "sky",
    content: "High response voicemail script notifying neighbors of recent transactions.",
  },
  {
    id: 23,
    name: "Multiple Offer Strategy Guide",
    type: "Guide",
    category: "Guides",
    description: "How to orchestrate competitive bidding and seller negotiation deadlines.",
    addedBy: "Daniel Miller",
    addedDate: "Apr 27, 2024",
    iconColor: "blue",
    content: "Best and final offer deadline guidelines and escalation clause handling.",
  },
  {
    id: 24,
    name: "Standard Client Onboarding Checklist",
    type: "Other",
    category: "Other",
    description: "Internal operations checklist from contract execution to closing.",
    addedBy: "Daniel Miller",
    addedDate: "Apr 26, 2024",
    iconColor: "teal",
    content: "Administrative milestone checklist for seamless transaction coordination.",
  },
];

const TABS = [
  { id: "all", label: "All Resources" },
  { id: "Scripts", label: "Scripts" },
  { id: "Email Templates", label: "Email Templates" },
  { id: "Call Openers", label: "Call Openers" },
  { id: "Objection Responses", label: "Objection Responses" },
  { id: "Follow Up", label: "Follow Up" },
  { id: "Guides", label: "Guides" },
  { id: "Other", label: "Other" },
];

const TYPE_BADGES = {
  Script: "bg-emerald-50 text-emerald-600 border-emerald-100",
  "Call Openers": "bg-sky-50 text-sky-600 border-sky-100",
  "Email Template": "bg-purple-50 text-purple-600 border-purple-100",
  "Objection Script": "bg-rose-50 text-rose-600 border-rose-100",
  "Follow Up": "bg-purple-50 text-purple-600 border-purple-100",
  Guide: "bg-amber-50 text-amber-600 border-amber-100",
  Other: "bg-slate-50 text-slate-600 border-slate-200",
};

const ResourcesScriptsSection = ({
  resources = DEFAULT_RESOURCES,
  onChange = () => {},
  onOpenAddWithType = () => {},
}) => {
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [viewingResource, setViewingResource] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [initialModalType, setInitialModalType] = useState("Script");

  const ITEMS_PER_PAGE = 8;

  // Filter resources by tab
  const filteredResources = resources.filter((item) => {
    if (activeTab === "all") return true;
    if (activeTab === "Scripts") return item.type === "Script" || item.category === "Scripts";
    if (activeTab === "Email Templates") return item.type === "Email Template" || item.category === "Email Templates";
    if (activeTab === "Call Openers") return item.type === "Call Openers" || item.category === "Call Openers";
    if (activeTab === "Objection Responses") return item.type === "Objection Script" || item.category === "Objection Responses";
    if (activeTab === "Follow Up") return item.type === "Follow Up" || item.category === "Follow Up";
    if (activeTab === "Guides") return item.type === "Guide" || item.category === "Guides";
    if (activeTab === "Other") return item.type === "Other" || item.category === "Other";
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredResources.length / ITEMS_PER_PAGE));
  const paginatedList = filteredResources.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleOpenAdd = (type = "Script") => {
    setEditingResource(null);
    setInitialModalType(type);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (res) => {
    setEditingResource(res);
    setInitialModalType(res.type || "Script");
    setIsAddModalOpen(true);
    setActiveMenuId(null);
  };

  const handleOpenView = (res) => {
    setViewingResource(res);
    setIsViewModalOpen(true);
    setActiveMenuId(null);
  };

  const handleDuplicate = (res) => {
    const duplicated = {
      ...res,
      id: Date.now(),
      name: `${res.name} (Copy)`,
    };
    onChange([duplicated, ...resources]);
    setActiveMenuId(null);
  };

  const handleDelete = (id) => {
    const updated = resources.filter((item) => item.id !== id);
    onChange(updated);
    setActiveMenuId(null);
  };

  const handleSaveResource = (resData) => {
    let updated;
    if (resData.id) {
      updated = resources.map((item) =>
        item.id === resData.id ? { ...item, ...resData } : item
      );
    } else {
      const newRes = {
        ...resData,
        id: Date.now(),
      };
      updated = [newRes, ...resources];
    }
    onChange(updated);
  };

  const handleImportLibrary = (packId) => {
    onChange(DEFAULT_RESOURCES);
  };

  const getFileIcon = (res) => {
    const color = res.iconColor || "emerald";
    let colorClass = "text-emerald-500";
    if (color === "rose") colorClass = "text-rose-500";
    else if (color === "sky" || color === "blue") colorClass = "text-sky-500";
    else if (color === "amber") colorClass = "text-amber-500";
    else if (color === "purple") colorClass = "text-purple-500";
    else if (color === "teal") colorClass = "text-teal-500";

    if (res.type === "Email Template") {
      return <Mail className={`w-4 h-4 ${colorClass}`} />;
    }
    if (res.type === "Objection Script") {
      return <MessageSquare className={`w-4 h-4 ${colorClass}`} />;
    }
    return <FileText className={`w-4 h-4 ${colorClass}`} />;
  };

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-6 sm:p-7 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-dark-black/80 font-secondary">
              Resources & Scripts
            </h2>
            <p className="text-xs text-medium-black mt-0.5 font-normal">
              Upload or create the content that supports this playbook.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => handleOpenAdd("Script")}
            className="px-3.5 py-1.5 rounded-xl border border-primary/40 hover:border-primary bg-primary/5 hover:bg-primary/10 text-primary text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Resource</span>
          </button>

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl border border-light-gray hover:border-medium-black/30 text-medium-black hover:text-dark-black bg-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import from Library</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-light-gray">
        <div className="flex items-center gap-6 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1);
                }}
                className={`pb-2.5 text-xs font-medium whitespace-nowrap transition-all relative cursor-pointer ${
                  isActive
                    ? "text-primary font-bold"
                    : "text-medium-black hover:text-dark-black"
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Resources Table */}
      <div className="overflow-x-auto rounded-xl border border-light-gray">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-light-gray/40 border-b border-light-gray text-[10px] font-bold text-light-black uppercase tracking-wider">
              <th className="py-3 px-4 min-w-[200px]">Name</th>
              <th className="py-3 px-3 min-w-[120px]">Type</th>
              <th className="py-3 px-3 min-w-[240px]">Description</th>
              <th className="py-3 px-3 min-w-[120px]">Added By</th>
              <th className="py-3 px-4 text-right min-w-[80px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-gray">
            {paginatedList.map((item) => {
              const badgeClass = TYPE_BADGES[item.type] || "bg-light-gray text-medium-black border-light-gray";

              return (
                <tr
                  key={item.id}
                  onClick={() => handleOpenView(item)}
                  className="bg-white hover:bg-light-gray/30 transition-colors cursor-pointer"
                >
                  {/* Name + Icon */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="shrink-0">
                        {getFileIcon(item)}
                      </div>
                      <h4 className="font-bold text-dark-black/90 font-secondary text-xs truncate max-w-[220px]">
                        {item.name}
                      </h4>
                    </div>
                  </td>

                  {/* Type Badge */}
                  <td className="py-3.5 px-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[10px] font-medium ${badgeClass}`}>
                      {item.type}
                    </span>
                  </td>

                  {/* Description */}
                  <td className="py-3.5 px-3 text-medium-black text-xs">
                    <p className="truncate max-w-[280px]" title={item.description}>
                      {item.description}
                    </p>
                  </td>

                  {/* Added By & Date */}
                  <td className="py-3.5 px-3">
                    <div>
                      <span className="font-semibold text-dark-black/80 text-xs block">
                        {item.addedBy || "Daniel Miller"}
                      </span>
                      <span className="text-[10px] text-light-black font-normal block mt-0.5">
                        {item.addedDate || "May 10, 2024"}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="relative inline-flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenView(item)}
                        className="p-1 rounded-lg text-light-black hover:text-dark-black hover:bg-light-gray transition-colors cursor-pointer"
                        title="View resource"
                      >
                        <Eye className="w-3.5 h-3.5" />
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
                            onClick={() => handleOpenView(item)}
                            className="w-full px-3 py-1.5 text-xs text-medium-black hover:text-dark-black hover:bg-light-gray flex items-center gap-2 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View</span>
                          </button>
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
                            onClick={() => handleDuplicate(item)}
                            className="w-full px-3 py-1.5 text-xs text-medium-black hover:text-dark-black hover:bg-light-gray flex items-center gap-2 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Duplicate</span>
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
          Showing 1 to {Math.min(paginatedList.length, 8)} of {filteredResources.length} resources
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
      <AddResourceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveResource}
        editResource={editingResource}
        initialType={initialModalType}
      />

      <ImportResourceModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportLibrary}
      />

      <ViewResourceModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        resource={viewingResource}
      />
    </div>
  );
};

export default ResourcesScriptsSection;
