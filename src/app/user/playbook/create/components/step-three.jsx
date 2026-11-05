"use client";

import React, { useState } from "react";
import {
  GitBranch,
  GripVertical,
  Plus,
  Pencil,
  Trash2,
  Hand,
  Search,
  Gem,
  ShieldAlert,
  Target,
  PhoneCall,
  Check,
  Play,
  Info,
  Eye,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  RotateCw,
} from "lucide-react";
import Text from "@/components/texts/text";
import AddPhaseModal from "./add-phase-modal";
import ConfirmDialog from "@/components/modals/confirm-dialog";
import { WatchTutorialModal } from "./playbook-help-modals";

// Starting conversation phases for a new playbook
export const DEFAULT_PHASES = [
  {
    id: 1,
    title: "Opening",
    description: "Create rapport and get permission to have a conversation.",
    goal: "Set a positive tone and gain engagement.",
    badgeGoal: "Goal: Engage",
    icon: Hand,
    color: "text-emerald-500 bg-emerald-50 border-emerald-200",
  },
  {
    id: 2,
    title: "Discovery",
    description: "Ask questions and uncover their situation and needs.",
    goal: "Understand their motivation and timeline.",
    badgeGoal: "Goal: Understand",
    icon: Search,
    color: "text-blue-500 bg-blue-50 border-blue-200",
  },
  {
    id: 3,
    title: "Value Proposition",
    shortTitle: "Value Prop",
    description: "Position your value and show how you solve their problem.",
    goal: "Build credibility and differentiate yourself.",
    badgeGoal: "Goal: Differentiate",
    icon: Gem,
    color: "text-purple-500 bg-purple-50 border-purple-200",
  },
  {
    id: 4,
    title: "Handle Objections",
    description: "Address concerns and remove hesitation.",
    goal: "Overcome doubt and strengthen confidence.",
    badgeGoal: "Goal: Resolve",
    icon: ShieldAlert,
    color: "text-amber-500 bg-[#fff8f0] border-amber-200",
  },
  {
    id: 5,
    title: "Close",
    description: "Guide them to commit to the next step.",
    goal: "Get a commitment to move forward.",
    badgeGoal: "Goal: Commit",
    icon: Target,
    color: "text-teal-500 bg-[#e6f7f5] border-teal-200",
  },
  {
    id: 6,
    title: "Follow Up",
    description: "Reinforce value and keep the momentum.",
    goal: "Stay top of mind and convert later.",
    badgeGoal: "Goal: Nurture",
    icon: PhoneCall,
    color: "text-pink-500 bg-pink-50 border-pink-200",
  },
  {
    id: 7,
    title: "Pre-Listing Prep",
    description: "Prepare listing materials and pre-market positioning.",
    goal: "Build confidence in your listing strategy.",
    badgeGoal: "Goal: Prepare",
    icon: Eye,
    color: "text-indigo-500 bg-indigo-50 border-indigo-200",
  },
  {
    id: 8,
    title: "Qualification",
    description: "Assess lead readiness, budget, and timeline.",
    goal: "Identify high-potential opportunities.",
    badgeGoal: "Goal: Qualify",
    icon: Search,
    color: "text-cyan-500 bg-cyan-50 border-cyan-200",
  },
  {
    id: 9,
    title: "Trial Close",
    description: "Test commitment assumptions before the final ask.",
    goal: "Gauge readiness and address hidden hesitations.",
    badgeGoal: "Goal: Test",
    icon: Target,
    color: "text-lime-500 bg-lime-50 border-lime-200",
  },
  {
    id: 10,
    title: "Referral Request",
    description: "Ask for introductions to their network.",
    goal: "Expand your pipeline through warm referrals.",
    badgeGoal: "Goal: Refer",
    icon: PhoneCall,
    color: "text-violet-500 bg-violet-50 border-violet-200",
  },
  {
    id: 11,
    title: "Re-Engagement",
    description: "Follow up with cold or stalled leads.",
    goal: "Restart the conversation with fresh value.",
    badgeGoal: "Goal: Re-engage",
    icon: RotateCw,
    color: "text-orange-500 bg-orange-50 border-orange-200",
  },
  {
    id: 12,
    title: "Negotiation",
    description: "Handle pricing, terms, and close the deal.",
    goal: "Reach a mutually beneficial agreement.",
    badgeGoal: "Goal: Negotiate",
    icon: Hand,
    color: "text-rose-500 bg-rose-50 border-rose-200",
  },
];

const StepThree = ({ formData, setFormData, phases, setPhases, onBack, onNext }) => {
  const [dragIndex, setDragIndex] = useState(null);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [phaseToDelete, setPhaseToDelete] = useState(null);
  const [dropIndex, setDropIndex] = useState(null);
  // The wizard owns the phases (so they survive moving between steps and get
  // saved); this local copy keeps the step responsive while editing.
  const [localPhases, setLocalPhases] = useState(phases || DEFAULT_PHASES);
  const currentPhases = localPhases;

  const updatePhases = (next) => {
    setLocalPhases(next);
    if (setPhases) setPhases(next);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPhase, setEditingPhase] = useState(null);
  const [selectedPhaseId, setSelectedPhaseId] = useState(null);
  const [phaseCurrentPage, setPhaseCurrentPage] = useState(1);

  const PHASES_PER_PAGE = 5;
  const totalPhasePages = Math.ceil(currentPhases.length / PHASES_PER_PAGE);
  const safePhasePage = Math.min(phaseCurrentPage, Math.max(totalPhasePages, 1));
  const paginatedPhases = currentPhases.slice(
    (safePhasePage - 1) * PHASES_PER_PAGE,
    safePhasePage * PHASES_PER_PAGE
  );
  const phaseStartItem = currentPhases.length === 0 ? 0 : (safePhasePage - 1) * PHASES_PER_PAGE + 1;
  const phaseEndItem = Math.min(safePhasePage * PHASES_PER_PAGE, currentPhases.length);

  const handleOpenAdd = () => {
    setEditingPhase(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (phase) => {
    setEditingPhase(phase);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingPhase(null);
    setIsModalOpen(false);
  };

  const handleSaveNewPhase = (phaseData) => {
    if (phaseData.id) {
      // Editing existing phase
      updatePhases(currentPhases.map((s) => (s.id === phaseData.id ? { ...s, ...phaseData } : s)));
    } else {
      // Adding new phase
      const newPhase = {
        id: currentPhases.length + 1,
        title: phaseData.title,
        description: phaseData.description,
        goal: phaseData.goal,
        badgeGoal: phaseData.badgeGoal,
        icon: phaseData.icon,
        color: phaseData.color,
      };
      updatePhases([...currentPhases, newPhase]);
    }
  };

  const handleDeletePhase = (phaseId) => {
    updatePhases(currentPhases.filter((s) => s.id !== phaseId));
  };

  // ── Drag-and-Drop Handlers (reorder on drop, like the step-four framework) ──
  const handleDragStart = (e, index) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
    // Needed for Firefox to initiate the drag
    e.dataTransfer.setData("text/html", e.target?.closest("div")?.innerHTML || "");
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragIndex !== null) {
      setDropIndex(index === dragIndex ? null : index);
    }
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (dragIndex === null) return;
    const from = dragIndex;
    const to = index;
    if (from !== to) {
      const updated = [...currentPhases];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      // Re-assign IDs based on new order
      updatePhases(updated.map((phase, i) => ({ ...phase, id: i + 1 })));
    }
    setDragIndex(null);
    setDropIndex(null);
    // IDs are re-assigned after reorder, so clear any stale selection
    setSelectedPhaseId(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDropIndex(null);
  };

  const handleToggleSelect = (phaseId) => {
    setSelectedPhaseId((prev) => (prev === phaseId ? null : phaseId));
  };

  const handleCardKeyDown = (e, phaseId) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggleSelect(phaseId);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT / MAIN PHASES COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {/* Combined Header + Phases Card */}
          <div className="bg-white rounded-2xl border border-light-gray shadow-sm">
            {/* Header Section */}
            <div className="p-6 pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary">
                  <GitBranch className="w-5 h-5" />
                </div>
                <div>
                  <Text variant="regular" className="font-bold">
                    Build Your Conversation Flow
                  </Text>
                  <Text variant="smaller" className="mt-0.5">
                    Define the phases of your call and what you want to accomplish in each one.
                  </Text>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border-2 border-primary text-primary font-semibold text-xs hover:bg-primary hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                Add Phase
              </button>
            </div>

            {/* Phases List */}
            <div className="p-4 sm:p-6 relative pl-10 sm:pl-12 space-y-4">
              {/* Dashed Timeline Connector Line */}
              <div className="absolute left-[17px] sm:left-[21px] top-6 bottom-6 w-0.5 border-l-2 border-dashed border-slate-200" />                  {paginatedPhases.map((phase, idx) => {
                const Icon = phase.icon;
                const globalIdx = (safePhasePage - 1) * PHASES_PER_PAGE + idx;
                const isDragging = dragIndex === globalIdx;
                const isDropTarget = dropIndex === globalIdx && dragIndex !== null && dropIndex !== dragIndex;
                return (
                  <div
                    key={phase.id}
                    className="relative flex items-center"
                  >
                    {/* Timeline Circle Icon */}
                    <div
                      className={`absolute -left-10 sm:-left-12 w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center z-10 bg-white ${
                        phase.color ? phase.color.split(" ")[0] : "text-[#0d9488]"
                      }`}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>

                    {/* Phase Card (drop target, click to select) */}
                    <div
                      onDragOver={(e) => handleDragOver(e, globalIdx)}
                      onDrop={(e) => handleDrop(e, globalIdx)}
                      onDragEnd={handleDragEnd}
                      onClick={() => handleToggleSelect(phase.id)}
                      onKeyDown={(e) => handleCardKeyDown(e, phase.id)}
                      role="button"
                      tabIndex={0}
                      aria-pressed={selectedPhaseId === phase.id}
                      aria-label={`Select phase ${phase.id}`}
                      className={`w-full bg-white rounded-2xl p-4 sm:p-5 border shadow-sm transition-all duration-150 group cursor-pointer ${
                        isDragging
                          ? "border-primary/60 border-dashed opacity-60 shadow-sm"
                          : isDropTarget
                            ? "border-primary border-dashed bg-primary/5 ring-2 ring-primary/20"
                            : selectedPhaseId === phase.id
                              ? "border-primary/60 bg-primary/5 ring-1 ring-primary/25"
                              : "border-light-gray hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm"
                      }`}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        {/* Column 1: Grip handle + Number & Title/Desc */}
                        <div className="md:col-span-6 flex items-center gap-3">
                          {/* Grip / Reorder handle (drag source) */}
                          <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, globalIdx)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => e.preventDefault()}
                            onDragEnd={handleDragEnd}
                            className={`shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-light-black/40 group-hover:text-medium-black group-hover:bg-light-gray/70 transition cursor-grab active:cursor-grabbing select-none ${
                              isDragging ? "cursor-grabbing text-primary" : ""
                            }`}
                            title="Drag to reorder"
                            aria-label={`Reorder phase ${phase.id}`}
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>
                          <span className="w-7 h-7 rounded-full bg-light-gray text-medium-black font-bold text-xs flex items-center justify-center shrink-0">
                            {phase.id}
                          </span>
                          <div>
                            <Text variant="small" className="!font-bold !text-dark-black">
                              {phase.title}
                            </Text>
                            <Text variant="smaller" className="text-light-black leading-relaxed mt-1">
                              {phase.description}
                            </Text>
                          </div>
                        </div>

                        {/* Column 2: Goal Section */}
                        <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-light-gray pt-3 md:pt-0 md:pl-4">
                          <Text variant="smaller" className="!font-bold !text-primary tracking-wider uppercase block mb-1">
                            GOAL
                          </Text>
                          <Text variant="smaller" className="text-medium-black font-medium leading-relaxed">
                            {phase.goal}
                          </Text>
                        </div>

                        {/* Column 3: Actions */}
                        <div
                          className="md:col-span-2 flex items-center justify-end gap-1.5 pt-2 md:pt-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(phase)}
                            className="p-2 hover:bg-blue-50 rounded-xl text-light-black hover:text-blue-500 transition cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPhaseToDelete(phase)}
                            aria-label={`Delete ${phase.title}`}
                            className="p-2 hover:bg-red-50 rounded-xl text-light-black hover:text-red-500 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Footer for Phases */}
            {totalPhasePages > 1 && (
              <div className="px-4 sm:px-6 pb-5 pt-3 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-light-gray mx-4 sm:mx-6">
                <span className="text-[10px] sm:text-[11px] font-medium text-light-black">
                  Showing {phaseStartItem} to {phaseEndItem} of {currentPhases.length} phase{currentPhases.length !== 1 ? "s" : ""}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={safePhasePage === 1}
                    onClick={() => setPhaseCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className="p-1.5 rounded-lg border border-light-gray text-light-black hover:bg-light-gray disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPhasePages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setPhaseCurrentPage(page)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center cursor-pointer transition ${
                        page === safePhasePage
                          ? "bg-primary text-white"
                          : "border border-light-gray text-medium-black hover:bg-light-gray"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={safePhasePage === totalPhasePages}
                    onClick={() => setPhaseCurrentPage((prev) => Math.min(prev + 1, totalPhasePages))}
                    className="p-1.5 rounded-lg border border-light-gray text-medium-black hover:bg-light-gray disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Reorder Tip Banner */}
            <div className="mx-4 sm:mx-6 mb-6 p-3 sm:p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Info className="w-4 h-4" />
              </div>
              <Text variant="smaller" className="!font-medium text-dark-black/80">
                <span className="font-bold">Tip:</span> You can reorder phases by dragging and dropping. The AI will follow this flow during calls.
              </Text>
            </div>
          </div>

          {/* Add / Edit Phase Modal */}
          <AddPhaseModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={handleSaveNewPhase}
            editPhase={editingPhase}
          />
        </div>

        {/* RIGHT SIDEBAR COLUMN */}
        <div className="space-y-6">
          {/* Flow Overview Card */}
          <div className="bg-white rounded-2xl p-6 border border-light-gray shadow-sm space-y-5">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              <Text variant="regular" className="font-bold !text-primary">
                Flow Overview
              </Text>
            </div>
            <Text variant="small" className="text-light-black">
              This is the journey your AI will follow in every call.
            </Text>

            <div className="space-y-3 pt-1">
              {currentPhases.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between py-1.5 border-b border-light-gray last:border-0"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${s.color || "bg-light-gray text-medium-black"}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <Text variant="extraSmall" className="!font-medium text-light-black">{s.id}</Text>
                      <Text variant="small" className="!font-semibold !text-dark-black">
                        {s.shortTitle || s.title}
                      </Text>
                    </div>
                    <Text variant="smaller" className="!font-semibold text-medium-black px-2.5 py-1 bg-light-gray rounded-lg">
                      {s.badgeGoal}
                    </Text>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conversation Tips Card */}
          <div className="bg-white rounded-2xl p-6 border border-light-gray shadow-sm space-y-5">
            <div className="flex items-center gap-3.5">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <Text variant="regular" className="font-bold">
                  Conversation Tips
                </Text>
                <Text variant="smaller" className="mt-0.5">
                  Best practices for an effective flow.
                </Text>
              </div>
            </div>

            <ul className="space-y-3 pt-1">
              {[
                "Keep your opening short and friendly",
                "Ask open-ended questions in discovery",
                "Always connect value to their needs",
                "Address objections with empathy",
                "Ask for commitment, don't assume it",
                "Follow up consistently",
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5 stroke-[2.5]" />
                  <Text variant="small" className="text-medium-black font-medium leading-tight">
                    {tip}
                  </Text>
                </li>
              ))}
            </ul>
          </div>

          {/* Need help getting started Card */}
          <div className="bg-white rounded-2xl p-6 border border-light-gray shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Text variant="regular" className="font-bold !text-dark-black">
                  Need help getting started?
                </Text>
                <Text variant="smaller" className="text-light-black mt-0.5 leading-snug">
                  Watch our quick tutorial on building your custom playbook.
                </Text>
              </div>
              <div className="w-10 h-10 bg-light-teal text-primary rounded-xl flex items-center justify-center shrink-0">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setTutorialOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl border-2 border-primary text-primary font-semibold text-sm hover:bg-primary/5 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              Watch Tutorial
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
              Next: Conversation Flow
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <WatchTutorialModal isOpen={tutorialOpen} onClose={() => setTutorialOpen(false)} />

      <ConfirmDialog
        isOpen={Boolean(phaseToDelete)}
        onClose={() => setPhaseToDelete(null)}
        title="Delete this stage?"
        icon={Trash2}
        message={`The "${phaseToDelete?.title ?? ""}" stage and its goal, instructions and objection responses will be removed from this playbook.`}
        note="This action can't be undone."
        noteClassName="text-red-600"
        confirmLabel="Delete Stage"
        onConfirm={() => handleDeletePhase(phaseToDelete?.id)}
      />
    </div>
  );
};

export default StepThree;