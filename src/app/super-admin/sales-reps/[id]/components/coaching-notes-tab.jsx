"use client";

import React, { useCallback, useEffect, useState } from "react";
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
import { addRepNote, deleteRepNote, loadRepNotes, updateRepNote } from "../../team-api";

const dateRangeOptions = [
  { value: "All time", label: "All time" },
  { value: "This month", label: "This month" },
  { value: "Last 30 days", label: "Last 30 days" },
  { value: "Last 90 days", label: "Last 90 days" },
];

const noteTypeFilterOptions = [
  { value: "All note types", label: "All note types" },
  { value: "Opportunity", label: "Opportunities" },
  { value: "Strength", label: "Strengths" },
  { value: "Action Item", label: "Action Items" },
  { value: "General Feedback", label: "General Feedback" },
];

const extraFilterOptions = [
  { value: "Filters", label: "All statuses" },
  { value: "High Priority", label: "High Priority" },
  { value: "Open", label: "Open" },
  { value: "Completed", label: "Completed" },
];

const pillFilterTabs = [
  { id: "all", label: "All Notes" },
  { id: "Strength", label: "Strengths" },
  { id: "Opportunity", label: "Opportunities" },
  { id: "Action Item", label: "Action Items" },
  { id: "General Feedback", label: "General Feedback" },
];

const TYPE_COLORS = {
  Strength: "bg-indigo-50 text-indigo-600 border border-indigo-200/80",
  Opportunity: "bg-purple-50 text-purple-600 border border-purple-200/80",
  "Action Item": "bg-amber-50 text-amber-700 border border-amber-200/80",
  "General Feedback": "bg-slate-100 text-slate-600 border border-slate-200",
};
const shortDate = (value) => new Date(`${value}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });

// API note → table row
const toRow = (note) => {
  const created = new Date(note.createdAt);
  const done = Boolean(note.completedAt);
  const overdue = !done && note.dueDate && new Date(`${note.dueDate}T23:59:59`) < new Date();
  return {
    ...note,
    created,
    date: created.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    time: created.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    typeColor: TYPE_COLORS[note.type] ?? TYPE_COLORS["General Feedback"],
    relatedCall: note.relatedTo || "—",
    insight: note.body,
    coach: note.authorName,
    done,
    due: done ? "Done" : note.dueDate ? shortDate(note.dueDate) : "No due date",
    dueColor: done ? "bg-emerald-50 text-emerald-600 border border-emerald-200/80" : overdue ? "bg-rose-50 text-rose-600 border border-rose-200/80" : "bg-amber-50 text-amber-700 border border-amber-200/80",
  };
};
const RANGE_DAYS = { "Last 30 days": 30, "Last 90 days": 90 };

// Live coaching notes (shared with the rep). Managers add, complete and delete; Support views.
export default function CoachingNotesTab({ rep, canManage = false }) {
  const repName = rep?.name ?? "";

  const [dateRange, setDateRange] = useState("All time");
  const [noteType, setNoteType] = useState("All note types");
  const [coach, setCoach] = useState("All coaches");
  const [extraFilter, setExtraFilter] = useState("Filters");
  const [activePill, setActivePill] = useState("all");

  const [data, setData] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeActionId, setActiveActionId] = useState(null);
  const [openNote, setOpenNote] = useState(null);
  const PAGE_SIZE = 5;

  const reload = useCallback(() => loadRepNotes(rep.id).then(setData).catch((error) => toast.error(error.message)), [rep.id]);
  useEffect(() => {
    reload();
  }, [reload]);

  const notesList = (data?.notes ?? []).map(toRow);
  const coachFilterOptions = [{ value: "All coaches", label: "All coaches" }, ...(data?.coaches ?? []).map((name) => ({ value: name, label: name }))];

  const setComplete = async (note, completed) => {
    try {
      await updateRepNote(rep.id, note.id, { completed });
      setOpenNote(null);
      toast.success(`${completed ? "Marked" : "Reopened"} "${note.title}"`);
      reload();
    } catch (error) {
      toast.error(error.message);
    }
  };
  const removeNote = async (note) => {
    if (!window.confirm(`Delete the coaching note "${note.title}"?`)) return;
    try {
      await deleteRepNote(rep.id, note.id);
      setOpenNote(null);
      toast.success("Coaching note deleted");
      reload();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleResetFilters = () => {
    setDateRange("All time");
    setNoteType("All note types");
    setCoach("All coaches");
    setExtraFilter("Filters");
    setActivePill("all");
    setCurrentPage(1);
  };

  const handleAddNote = async (newNote) => {
    await addRepNote(rep.id, { kind: "coaching", ...newNote });
    reload();
  };

  // Filtered Notes
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const filteredNotes = notesList.filter((item) => {
    if (activePill !== "all" && item.type !== activePill) return false;
    if (noteType !== "All note types" && item.type !== noteType) return false;
    if (coach !== "All coaches" && item.coach !== coach) return false;
    if (extraFilter === "High Priority" && item.priority !== "High") return false;
    if (extraFilter === "Open" && item.done) return false;
    if (extraFilter === "Completed" && !item.done) return false;
    if (dateRange === "This month" && item.created < monthStart) return false;
    if (RANGE_DAYS[dateRange] && (new Date() - item.created) / 86400000 > RANGE_DAYS[dateRange]) return false;
    return true;
  });
  const totalPages = Math.max(1, Math.ceil(filteredNotes.length / PAGE_SIZE));
  const stats = data?.stats ?? { thisMonth: 0, lastMonth: 0, actionItems: 0, actionItemsDone: 0, topFocus: null };
  const monthDiff = stats.thisMonth - stats.lastMonth;
  const focusAreas = (data?.focus ?? []).map((note) => ({
    title: note.title,
    priority: [note.priority ? `${note.priority}` : null, note.dueDate ? `Due ${shortDate(note.dueDate)}` : null].filter(Boolean).join(" • ") || note.type,
    insight: note.body,
  }));
  const recentStrengths = (data?.strengths ?? []).map((note) => ({ title: note.title, date: new Date(note.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), desc: note.body }));

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
                onSelect={(val) => { setDateRange(val); setCurrentPage(1); }}
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
                onSelect={(val) => { setNoteType(val); setCurrentPage(1); }}
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
                onSelect={(val) => { setCoach(val); setCurrentPage(1); }}
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
                onSelect={(val) => { setExtraFilter(val); setCurrentPage(1); }}
                variant="small"
                placement="bottom"
                className="w-full"
              />
            </div>

            {canManage && <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Add Coaching Note</span>
            </button>}
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
              —
            </h3>
            <p className="text-xs font-semibold text-light-black mt-1">
              Scored from calls once calling is connected
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-5 border border-light-gray shadow-xs flex flex-col justify-between gap-1.5">
          <span className="text-[11px] font-bold text-light-black tracking-wider uppercase">
            TOP FOCUS AREA
          </span>
          <div className="mt-0.5">
            <h3 className="text-xl sm:text-2xl font-bold text-dark-black/90 font-secondary tracking-tight leading-tight break-words">
              {stats.topFocus ?? "None open"}
            </h3>
            <p className="text-xs font-semibold text-emerald-600 mt-1">
              {stats.topFocus ? "Most urgent open item" : "No open opportunities or action items"}
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
              {stats.thisMonth}
            </h3>
            <p className={`text-xs font-semibold mt-1 ${monthDiff > 0 ? "text-emerald-600" : monthDiff < 0 ? "text-rose-500" : "text-light-black"}`}>
              {monthDiff ? `${monthDiff > 0 ? "↑" : "↓"} ${Math.abs(monthDiff)} vs last month` : "Same as last month"}
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
              {stats.actionItemsDone} / {stats.actionItems}
            </h3>
            <p className="text-xs font-semibold text-emerald-600 mt-1">
              {stats.actionItems ? `${Math.round((stats.actionItemsDone / stats.actionItems) * 100)}% completion rate` : "No action items yet"}
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
                Showing {filteredNotes.length} of {notesList.length} notes
              </span>
            </div>

            {/* Pill Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto select-none [-ms-overflow-style:none] [scrollbar-width:none]">
              {pillFilterTabs.map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => { setActivePill(pill.id); setCurrentPage(1); }}
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
            <table className="w-full text-left border-collapse min-w-[1040px]">
              <thead>
                <tr className="border-b border-light-gray text-[10.5px] font-bold text-light-black uppercase tracking-wider select-none">
                  <th className="pb-3 px-4 text-left">DATE / TIME</th>
                  <th className="pb-3 px-4 text-left">TYPE</th>
                  <th className="pb-3 px-4 text-left">RELATED CALL</th>
                  <th className="pb-3 px-4 text-left">COACHING INSIGHT</th>
                  <th className="pb-3 px-4 text-left">COACH</th>
                  <th className="pb-3 px-4 text-left">DUE</th>
                  <th className="pb-3 px-4 text-right"></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-light-gray/60 text-xs">
                {!filteredNotes.length && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-xs text-light-black">
                      {data ? (notesList.length ? "No notes match these filters." : "No coaching notes yet.") : "Loading…"}
                    </td>
                  </tr>
                )}
                {filteredNotes.slice((Math.min(currentPage, totalPages) - 1) * PAGE_SIZE, Math.min(currentPage, totalPages) * PAGE_SIZE).map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setOpenNote(item)}
                    className="hover:bg-light-gray/40 transition-colors group cursor-pointer"
                  >
                    {/* Date / Time */}
                    <td className="py-4 px-4 text-left whitespace-nowrap">
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
                    <td className="py-4 px-4 text-left whitespace-nowrap">
                      <span
                        className={`inline-flex items-center text-[10.5px] font-bold px-2.5 py-0.5 rounded-full ${item.typeColor}`}
                      >
                        {item.type}
                      </span>
                    </td>

                    {/* Related Call */}
                    <td className="py-4 px-4 text-left whitespace-nowrap text-dark-black/80 font-medium text-xs">
                      {item.relatedCall}
                    </td>

                    {/* Coaching Insight */}
                    <td className="py-4 px-4 text-left max-w-[320px]">
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
                    <td className="py-4 px-4 text-left whitespace-nowrap text-dark-black/80 text-xs">
                      {item.coach}
                    </td>

                    {/* Due */}
                    <td className="py-4 px-4 text-left whitespace-nowrap">
                      <span
                        className={`inline-flex items-center text-[10.5px] font-bold px-2.5 py-0.5 rounded-full ${item.dueColor}`}
                      >
                        {item.due}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right whitespace-nowrap relative">
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
                              setOpenNote(item);
                            }}
                            className="w-full px-3.5 py-2 text-xs text-dark-black/80 hover:bg-light-gray cursor-pointer"
                          >
                            View Details
                          </button>
                          {canManage && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveActionId(null);
                                setComplete(item, !item.done);
                              }}
                              className="w-full px-3.5 py-2 text-xs text-dark-black/80 hover:bg-light-gray cursor-pointer"
                            >
                              {item.done ? "Reopen" : "Mark Complete"}
                            </button>
                          )}
                          {canManage && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveActionId(null);
                                removeNote(item);
                              }}
                              className="w-full px-3.5 py-2 text-xs text-rose-600 hover:bg-light-gray cursor-pointer"
                            >
                              Delete
                            </button>
                          )}
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
            <span className="text-xs text-light-black">{filteredNotes.length} note{filteredNotes.length === 1 ? "" : "s"}</span>

            <div className="flex items-center gap-1">
              <span className="text-xs text-light-black mr-2">Page {Math.min(currentPage, totalPages)} of {totalPages}</span>
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-7 h-7 rounded-lg border border-light-gray flex items-center justify-center text-light-black hover:bg-light-gray disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNum) => (
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
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
                Open opportunities and action items, most urgent first.
              </p>
            </div>

            <div className="flex flex-col gap-4 pt-1">
              {!focusAreas.length && <p className="text-xs text-light-black">Nothing open right now.</p>}
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

                </div>
              ))}
            </div>

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
              {!recentStrengths.length && <p className="text-xs text-light-black">No strengths recorded yet.</p>}
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
      {addModalOpen && <AddCoachingNoteModal
        isOpen
        onClose={() => setAddModalOpen(false)}
        repName={repName}
        onAdd={handleAddNote}
      />}

      {/* Note details: reps see their coaching notes on their own dashboard and mark them complete there too */}
      {openNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="coaching-note-title" onClick={() => setOpenNote(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl flex flex-col gap-4" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className={`inline-flex items-center text-[10.5px] font-bold px-2.5 py-0.5 rounded-full ${openNote.typeColor}`}>{openNote.type}</span>
                <h3 id="coaching-note-title" className="text-lg font-bold text-dark-black mt-2">{openNote.title}</h3>
                <p className="text-xs text-light-black mt-0.5">{openNote.date} · {openNote.time} · by {openNote.coach}</p>
              </div>
              <span className={`inline-flex items-center text-[10.5px] font-bold px-2.5 py-0.5 rounded-full ${openNote.dueColor}`}>{openNote.due === "Done" ? "Completed" : `Due ${openNote.due}`}</span>
            </div>
            <p className="text-sm text-dark-black/80 leading-relaxed whitespace-pre-line">{openNote.insight}</p>
            {openNote.priority && <p className="text-xs text-medium-black">Priority: {openNote.priority}</p>}
            <p className="text-xs text-medium-black">Related call: {openNote.relatedCall}</p>
            <p className="text-[11px] text-light-black bg-light-gray/50 rounded-xl px-3 py-2">
              The rep sees this note on their dashboard (My Coaching Notes) and can mark it complete there. Email notifications come once an email service is connected.
            </p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setOpenNote(null)} className="px-4 py-2 rounded-xl border border-light-gray text-sm font-semibold text-dark-black hover:bg-light-gray cursor-pointer">Close</button>
              {canManage && (
                <button type="button" onClick={() => setComplete(openNote, !openNote.done)} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-medium-teal cursor-pointer">{openNote.done ? "Reopen" : "Mark Complete"}</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
