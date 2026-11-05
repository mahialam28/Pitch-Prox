"use client";

import React, { useState } from "react";
import {
  Plus,
  X,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Filter,
} from "lucide-react";
import Dropdown from "@/components/shared/dropdown/dropdown";
import AddCoachingNoteModal from "./add-coaching-note-modal";
import toast from "react-hot-toast";

const dateRangeOptions = [
  { value: "May 1 – May 31, 2026", label: "May 1 – May 31, 2026" },
  { value: "April 1 – April 30, 2026", label: "April 1 – April 30, 2026" },
  { value: "Last 30 Days", label: "Last 30 Days" },
  { value: "This Quarter", label: "This Quarter" },
];

const noteTypeFilterOptions = [
  { value: "All note types", label: "All note types" },
  { value: "Opportunity", label: "Opportunities" },
  { value: "Strength", label: "Strengths" },
  { value: "Action Item", label: "Action Items" },
  { value: "General Feedback", label: "General Feedback" },
];

const coachFilterOptions = [
  { value: "All coaches", label: "All coaches" },
  { value: "Sarah Johnson", label: "Sarah Johnson" },
  { value: "Michael Carter", label: "Michael Carter" },
  { value: "Daniel Martine", label: "Daniel Martine" },
];

const extraFilterOptions = [
  { value: "Filters", label: "Filters" },
  { value: "High Priority", label: "High Priority" },
  { value: "Pending Due", label: "Pending Due" },
  { value: "Completed", label: "Completed" },
];

const initialCoachingNotes = [
  {
    id: "CN-101",
    date: "May 31, 2026",
    time: "10:32 AM",
    type: "Opportunity",
    typeColor: "bg-purple-50 text-purple-600 border border-purple-200/80",
    relatedCall: "Subscription Closed",
    title: "Stronger objection handling needed",
    insight: "Anchor value before presenting pricing.",
    coach: "Sarah Johnson",
    due: "Jun 5",
    dueColor: "bg-amber-50 text-amber-700 border border-amber-200/80",
  },
  {
    id: "CN-102",
    date: "May 31, 2026",
    time: "9:15 AM",
    type: "Strength",
    typeColor: "bg-indigo-50 text-indigo-600 border border-indigo-200/80",
    relatedCall: "Demo Booked",
    title: "Excellent demo transition",
    insight: "Built trust and increased show rate.",
    coach: "Sarah Johnson",
    due: "Done",
    dueColor: "bg-amber-50/80 text-amber-800 border border-amber-200",
  },
  {
    id: "CN-103",
    date: "May 30, 2026",
    time: "4:32 PM",
    type: "Action Item",
    typeColor: "bg-purple-50 text-purple-600 border border-purple-200/80",
    relatedCall: "Trial Started",
    title: "Follow-up consistency",
    insight: "Send recap within one hour after calls.",
    coach: "Sarah Johnson",
    due: "Jun 2",
    dueColor: "bg-amber-50 text-amber-700 border border-amber-200/80",
  },
  {
    id: "CN-104",
    date: "May 30, 2026",
    time: "2:18 PM",
    type: "Opportunity",
    typeColor: "bg-purple-50 text-purple-600 border border-purple-200/80",
    relatedCall: "Follow-up Scheduled",
    title: "Pacing adjustment",
    insight: "Slow the middle section to invite response.",
    coach: "Michael Carter",
    due: "Jun 10",
    dueColor: "bg-amber-50 text-amber-700 border border-amber-200/80",
  },
  {
    id: "CN-105",
    date: "May 29, 2026",
    time: "3:41 PM",
    type: "Strength",
    typeColor: "bg-indigo-50 text-indigo-600 border border-indigo-200/80",
    relatedCall: "Objection Handling",
    title: "Strong use of ROI framing",
    insight: "Keep leveraging real numbers.",
    coach: "Sarah Johnson",
    due: "Done",
    dueColor: "bg-amber-50/80 text-amber-800 border border-amber-200",
  },
];

const focusAreas = [
  {
    title: "Objection Handling",
    priority: "High • Due Jun 5",
    insight: "Improve value anchoring before pricing.",
    progress: 40,
    color: "bg-primary",
  },
  {
    title: "Follow-up Consistency",
    priority: "Medium • Due Jun 2",
    insight: "Send recaps faster after every call.",
    progress: 75,
    color: "bg-primary",
  },
  {
    title: "Emotional Pacing",
    priority: "Low • Due Jun 10",
    insight: "Maintain a steady pace throughout the call.",
    progress: 55,
    color: "bg-primary",
  },
];

const recentStrengths = [
  {
    title: "Great rapport in opening",
    date: "May 31, 2026",
    desc: "Mirrored the prospect's concerns effectively.",
  },
  {
    title: "Excellent demo engagement",
    date: "May 29, 2026",
    desc: "Connected product value to discovery insights.",
  },
];

const pillFilterTabs = [
  { id: "all", label: "All Notes" },
  { id: "Strength", label: "Strengths" },
  { id: "Opportunity", label: "Opportunities" },
  { id: "Action Item", label: "Action Items" },
  { id: "General Feedback", label: "General Feedback" },
];

export default function CoachingNotesTab({ rep }) {
  const repName = rep?.name || "Ryan Anderson";

  // Filter States
  const [dateRange, setDateRange] = useState("May 1 – May 31, 2026");
  const [noteType, setNoteType] = useState("All note types");
  const [coach, setCoach] = useState("All coaches");
  const [extraFilter, setExtraFilter] = useState("Filters");
  const [activePill, setActivePill] = useState("all");

  // Coaching Notes Data
  const [notesList, setNotesList] = useState(initialCoachingNotes);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeActionId, setActiveActionId] = useState(null);

  const handleResetFilters = () => {
    setDateRange("May 1 – May 31, 2026");
    setNoteType("All note types");
    setCoach("All coaches");
    setExtraFilter("Filters");
    setActivePill("all");
  };

  const handleAddNote = (newNote) => {
    setNotesList((prev) => [
      {
        ...newNote,
        typeColor:
          newNote.type === "Strength"
            ? "bg-indigo-50 text-indigo-600 border border-indigo-200/80"
            : "bg-purple-50 text-purple-600 border border-purple-200/80",
        dueColor:
          newNote.due === "Done"
            ? "bg-amber-50/80 text-amber-800 border border-amber-200"
            : "bg-amber-50 text-amber-700 border border-amber-200/80",
      },
      ...prev,
    ]);
  };

  // Filtered Notes
  const filteredNotes = notesList.filter((item) => {
    if (activePill !== "all" && item.type !== activePill) return false;
    if (noteType !== "All note types" && item.type !== noteType) return false;
    if (coach !== "All coaches" && item.coach !== coach) return false;
    return true;
  });

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-200">
      {/* 1. Header Card with Title & Filters */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-light-gray shadow-xs flex flex-col gap-5">
        {/* Title & Description */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-dark-black/90 font-secondary tracking-tight">
            Coaching Notes
          </h2>
          <p className="text-xs sm:text-sm text-light-black mt-0.5">
            Capture feedback, track action plans, and reinforce performance.
          </p>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pt-1">
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Date Range Dropdown */}
            <div className="w-48">
              <Dropdown
                items={dateRangeOptions}
                selected={dateRange}
                onSelect={(val) => setDateRange(val)}
                variant="small"
                placement="bottom"
                className="w-full"
              />
            </div>

            {/* Note Type Dropdown */}
            <div className="w-40">
              <Dropdown
                items={noteTypeFilterOptions}
                selected={noteType}
                onSelect={(val) => setNoteType(val)}
                variant="small"
                placement="bottom"
                className="w-full"
              />
            </div>

            {/* Coach Dropdown */}
            <div className="w-36">
              <Dropdown
                items={coachFilterOptions}
                selected={coach}
                onSelect={(val) => setCoach(val)}
                variant="small"
                placement="bottom"
                className="w-full"
              />
            </div>

            {/* Clear Filters Button */}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-light-black hover:text-dark-black transition-colors px-2 py-2 flex items-center gap-1 cursor-pointer select-none"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear filters</span>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 self-start xl:self-auto">
            <div className="w-28">
              <Dropdown
                items={extraFilterOptions}
                selected={extraFilter}
                onSelect={(val) => setExtraFilter(val)}
                variant="small"
                placement="bottom"
                className="w-full"
              />
            </div>

            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Add Coaching Note</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-5 border border-light-gray shadow-xs flex flex-col justify-between gap-1.5">
          <span className="text-[11px] font-bold text-light-black tracking-wider uppercase">
            OVERALL COACHING SCORE
          </span>
          <div className="mt-0.5">
            <h3 className="text-2xl sm:text-3xl font-bold text-dark-black/90 font-secondary tracking-tight">
              87 / 100
            </h3>
            <p className="text-xs font-semibold text-emerald-600 mt-1">
              ↑ 6 pts vs previous period
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-5 border border-light-gray shadow-xs flex flex-col justify-between gap-1.5">
          <span className="text-[11px] font-bold text-light-black tracking-wider uppercase">
            TOP FOCUS AREA
          </span>
          <div className="mt-0.5">
            <h3 className="text-xl sm:text-2xl font-bold text-dark-black/90 font-secondary tracking-tight truncate">
              Objection Handling
            </h3>
            <p className="text-xs font-semibold text-emerald-600 mt-1">
              Priority for improvement
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-5 border border-light-gray shadow-xs flex flex-col justify-between gap-1.5">
          <span className="text-[11px] font-bold text-light-black tracking-wider uppercase">
            COACHING NOTES THIS MONTH
          </span>
          <div className="mt-0.5">
            <h3 className="text-2xl sm:text-3xl font-bold text-dark-black/90 font-secondary tracking-tight">
              12
            </h3>
            <p className="text-xs font-semibold text-emerald-600 mt-1">
              ↑ 3 vs previous period
            </p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl p-5 border border-light-gray shadow-xs flex flex-col justify-between gap-1.5">
          <span className="text-[11px] font-bold text-light-black tracking-wider uppercase">
            ACTION ITEMS COMPLETED
          </span>
          <div className="mt-0.5">
            <h3 className="text-2xl sm:text-3xl font-bold text-dark-black/90 font-secondary tracking-tight">
              8 / 12
            </h3>
            <p className="text-xs font-semibold text-emerald-600 mt-1">
              67% completion rate
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Two-Column Layout */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Coaching Notes History Table */}
        <div className="w-full lg:col-span-8 bg-white rounded-3xl p-5 sm:p-6 border border-light-gray shadow-xs flex flex-col justify-between overflow-hidden">
          {/* Section Header & Pill Tabs */}
          <div className="flex flex-col gap-4 pb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-dark-black/90 font-secondary tracking-tight">
                Coaching Notes History
              </h3>
              <span className="text-xs text-light-black">
                Showing {filteredNotes.length} of 12 notes
              </span>
            </div>

            {/* Pill Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto select-none [-ms-overflow-style:none] [scrollbar-width:none]">
              {pillFilterTabs.map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setActivePill(pill.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    activePill === pill.id
                      ? "bg-primary text-white shadow-xs"
                      : "bg-slate-100/90 text-dark-black/75 hover:bg-slate-200/80"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto w-full [-ms-overflow-style:none] [scrollbar-width:thin]">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-light-gray text-[10.5px] font-bold text-light-black uppercase tracking-wider select-none">
                  <th className="pb-3 text-left">DATE / TIME</th>
                  <th className="pb-3 text-left">TYPE</th>
                  <th className="pb-3 text-left">RELATED CALL</th>
                  <th className="pb-3 text-left">COACHING INSIGHT</th>
                  <th className="pb-3 text-left">COACH</th>
                  <th className="pb-3 text-left">DUE</th>
                  <th className="pb-3 text-right"></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-light-gray/60 text-xs">
                {filteredNotes.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-light-gray/40 transition-colors group cursor-pointer"
                  >
                    {/* Date / Time */}
                    <td className="py-3.5 text-left whitespace-nowrap">
                      <div>
                        <p className="font-semibold text-dark-black/85 text-xs">
                          {item.date}
                        </p>
                        <p className="text-[11px] text-light-black mt-0.5">
                          {item.time}
                        </p>
                      </div>
                    </td>

                    {/* Type Pill */}
                    <td className="py-3.5 text-left whitespace-nowrap">
                      <span
                        className={`inline-flex items-center text-[10.5px] font-bold px-2.5 py-0.5 rounded-full ${item.typeColor}`}
                      >
                        {item.type}
                      </span>
                    </td>

                    {/* Related Call */}
                    <td className="py-3.5 text-left whitespace-nowrap text-dark-black/80 font-medium text-xs">
                      {item.relatedCall}
                    </td>

                    {/* Coaching Insight */}
                    <td className="py-3.5 text-left max-w-[220px]">
                      <div>
                        <p className="font-bold text-dark-black/90 text-xs group-hover:text-primary transition-colors">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-light-black truncate mt-0.5">
                          {item.insight}
                        </p>
                      </div>
                    </td>

                    {/* Coach */}
                    <td className="py-3.5 text-left whitespace-nowrap text-dark-black/80 text-xs">
                      {item.coach}
                    </td>

                    {/* Due */}
                    <td className="py-3.5 text-left whitespace-nowrap">
                      <span
                        className={`inline-flex items-center text-[10.5px] font-bold px-2.5 py-0.5 rounded-full ${item.dueColor}`}
                      >
                        {item.due}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 text-right whitespace-nowrap relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveActionId(
                            activeActionId === item.id ? null : item.id
                          );
                        }}
                        className="w-7 h-7 rounded-lg inline-flex items-center justify-center text-light-black hover:text-dark-black hover:bg-light-gray transition-colors cursor-pointer"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {activeActionId === item.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 top-10 z-30 bg-white border border-light-gray rounded-xl shadow-xl py-1 w-36 animate-in fade-in zoom-in-95 duration-150 text-left"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setActiveActionId(null);
                              toast.success(`Opening note for ${item.title}`);
                            }}
                            className="w-full px-3.5 py-2 text-xs text-dark-black/80 hover:bg-light-gray cursor-pointer"
                          >
                            View Details
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveActionId(null);
                              toast.success(`Marked ${item.title} as Done`);
                            }}
                            className="w-full px-3.5 py-2 text-xs text-dark-black/80 hover:bg-light-gray cursor-pointer"
                          >
                            Mark Complete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer with Link & Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 mt-2 border-t border-light-gray select-none">
            <button
              type="button"
              onClick={() => toast.success("Loading complete coaching archive...")}
              className="text-xs font-semibold text-primary hover:text-primary/80 inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View all coaching notes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-7 h-7 rounded-lg border border-light-gray flex items-center justify-center text-light-black hover:bg-light-gray disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {[1, 2, 3].map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                    currentPage === pageNum
                      ? "bg-primary text-white shadow-xs"
                      : "border border-light-gray text-dark-black/75 hover:bg-light-gray"
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage === 3}
                onClick={() => setCurrentPage((p) => Math.min(3, p + 1))}
                className="w-7 h-7 rounded-lg border border-light-gray flex items-center justify-center text-light-black hover:bg-light-gray disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Focus Areas & Action Plan + Recent Strengths */}
        <div className="w-full lg:col-span-4 flex flex-col gap-6">
          {/* Card 1: Focus Areas & Action Plan */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-light-gray shadow-xs flex flex-col gap-4">
            <div>
              <h3 className="text-base font-bold text-dark-black/90 font-secondary tracking-tight">
                Focus Areas & Action Plan
              </h3>
              <p className="text-xs text-light-black mt-0.5">
                AI-prioritized coaching actions based on performance patterns.
              </p>
            </div>

            <div className="flex flex-col gap-4 pt-1">
              {focusAreas.map((area, idx) => (
                <div key={idx} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-dark-black/90">
                      {area.title}
                    </span>
                    <span className="text-[11px] font-semibold text-amber-700">
                      {area.priority}
                    </span>
                  </div>

                  <p className="text-[11.5px] text-light-black">
                    {area.insight}
                  </p>

                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${area.color} rounded-full transition-all duration-500`}
                        style={{ width: `${area.progress}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-dark-black/75 shrink-0">
                      {area.progress}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => toast.success("Opening detailed action plan...")}
              className="text-xs font-semibold text-primary hover:text-primary/80 inline-flex items-center gap-1 cursor-pointer transition-colors pt-1"
            >
              <span>View full action plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Recent Strengths */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-light-gray shadow-xs flex flex-col gap-4">
            <div>
              <h3 className="text-base font-bold text-dark-black/90 font-secondary tracking-tight">
                Recent Strengths
              </h3>
              <p className="text-xs text-light-black mt-0.5">
                Keep doing more of what works.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {recentStrengths.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-light-gray/80 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-dark-black/90">
                      {item.title}
                    </span>
                    <span className="text-[10.5px] text-light-black">
                      {item.date}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-light-black mt-0.5 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Coaching Note Modal */}
      <AddCoachingNoteModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        repName={repName}
        onAdd={handleAddNote}
      />
    </div>
  );
}
