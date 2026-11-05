"use client";

import { usePortal } from "@/components/shared/use-portal";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PENDING_CALL_KEY } from "@/utils.js/call-constants";
import {
  X,
  Mail,
  Phone,
  Tag,
  Home,
  Calendar,
  Info,
  CalendarDays,
  PhoneOutgoing,
  FileText,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  CircleCheck,
  ListPlus,
  Download,
  Archive,
  ArchiveRestore,
  MoreHorizontal,
} from "lucide-react";
import ActionMenu from "@/components/shared/dropdown/action-menu";
import AddNoteModal from "@/components/modals/add-note-modal";
import UpdateStatusModal from "../../live-calling/components/update-status-modal";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer } from "recharts";
import AlertModal from "@/components/modals/alert-modal";
import Tooltip from "@/components/modals/tooltip";
import ScheduleFollowUpModal from "../../live-calling/components/schedule-followup-modal";
import { apiRequest, formatDateTime } from "@/lib/client-api";
import { showError, showSuccess } from "@/lib/alerts";
import { showSavedToast } from "@/lib/toast";
import { exportLeadCsv } from "@/lib/export-lead";

// --- Mock Data for Charts ---
const trustGainData = [
  { value: 10 },
  { value: 15 },
  { value: 12 },
  { value: 18 },
  { value: 14 },
  { value: 20 },
  { value: 25 },
  { value: 22 },
  { value: 20 },
  { value: 18 },
  { value: 15 },
];

const aiAdherenceData = [
  { value: 60 },
  { value: 65 },
  { value: 55 },
  { value: 75 },
  { value: 70 },
  { value: 85 },
  { value: 80 },
  { value: 78 },
  { value: 75 },
  { value: 70 },
];

const totalCallsData = [
  { value: 2 },
  { value: 3 },
  { value: 5 },
  { value: 3 },
  { value: 5 },
  { value: 3 },
  { value: 8 },
  { value: 5 },
];

const STATUS_OPTIONS = [
  { value: "Hot", dotClass: "bg-orange-500" },
  { value: "Warm", dotClass: "bg-amber-500" },
  { value: "Cold", dotClass: "bg-light-blue" },
  { value: "Unknown", dotClass: "bg-medium-black" },
];

// Download one lead as a CSV file

const LeadDetailsModal = ({ isOpen = false, onClose, lead = null, onDelete, onLeadChange, onUpdateLead }) => {
  const portal = usePortal();
  const router = useRouter();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [followUpOpen, setFollowUpOpen] = useState(false);
  // Notes are keyed by lead so switching leads never shows stale notes
  const [notesState, setNotesState] = useState({ leadId: null, notes: [] });
  const [lastSavedNote, setLastSavedNote] = useState(null);
  const leadId = lead?.id;

  useEffect(() => {
    if (!isOpen || !leadId) return;
    let active = true;
    apiRequest(`/api/v1/leads/${leadId}/notes`)
      .then((data) => active && setNotesState({ leadId, notes: data.results }))
      .catch((error) => active && showError("Notes not loaded", error.message));
    return () => { active = false; };
  }, [isOpen, leadId]);

  const notes = notesState.leadId === leadId ? notesState.notes : [];
  const savedNote = lastSavedNote && lastSavedNote.leadId === leadId ? lastSavedNote.text : "";
  const hasSavedNote = Boolean(savedNote);

  if (!isOpen) return null;

  const leadName = lead?.name || "Devon Lane";
  const leadType = lead?.leadType || "Expired Listings";
  const stage = lead?.stage || "New";
  const status = lead?.status || "Unknown";
  const outcome = lead?.outcome || "Appointment Set";

  // Hand the lead to the live-calling page (same bridge the Leads table and
  // app header use: sessionStorage + navigate). The call auto-starts there
  // without the pre-call setup popup.
  const handleCallNow = () => {
    try {
      sessionStorage.setItem(
        PENDING_CALL_KEY,
        JSON.stringify({
          leadName: lead?.name || "",
          phoneNumber: lead?.phoneNumber || "",
          leadType: lead?.leadType || "",
          address: lead?.propertyAddress || "",
          playbook: "PitchProx Standard",
        })
      );
    } catch {
      /* sessionStorage unavailable — continue without prefill */
    }
    router.push(`${portal.base}/live-calling`);
  };

  const handleConfirmDelete = () => {
    onDelete?.(lead);
    setDeleteModalOpen(false);
    onClose?.();
  };

  const handleOpenNote = () => {
    setNoteText("");
    setNoteOpen(true);
  };

  const handleCancelNote = () => {
    setNoteOpen(false);
  };

  const handleSaveNote = async () => {
    const text = noteText.trim();
    if (!text) {
      setNoteOpen(false);
      return;
    }
    setSavingNote(true);
    try {
      const { note } = await apiRequest(`/api/v1/leads/${leadId}/notes`, { method: "POST", body: { body: text } });
      setNotesState((current) => ({ leadId, notes: [note, ...(current.leadId === leadId ? current.notes : [])] }));
      setLastSavedNote({ leadId, text });
      setNoteOpen(false);
    } catch (error) {
      showError("Note not saved", error.message);
    } finally {
      setSavingNote(false);
    }
  };

  const handleScheduleFollowUp = async (followUpAt) => {
    const { lead: updated } = await apiRequest(`/api/v1/leads/${leadId}/follow-ups`, {
      method: "POST",
      body: { followUpAt: followUpAt.toISOString() },
    });
    onLeadChange?.(updated);
    showSuccess("Follow-up scheduled", `Follow-up set for ${formatDateTime(updated.followUpAt)}.`);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto"
        onClick={onClose}
      >
      {/* Modal Container */}
      <div
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= Modal Header ================= */}
        <div className="p-6 sm:p-8 pb-4 flex items-start justify-between gap-4 border-b border-light-gray">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <Title variant="small" className="!text-2xl !font-bold !text-dark-black">{leadName}</Title>
              <span className="px-3 py-1 rounded-full text-xs font-semibold text-blue-500 bg-blue-50 border border-blue-100">
                {leadType}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold text-indigo-500 bg-indigo-50 border border-indigo-100">
                {stage}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                status === "Hot"
                  ? "text-orange-600 bg-orange-50 border-orange-100"
                  : status === "Warm"
                  ? "text-amber-600 bg-amber-50 border-amber-100"
                  : status === "Cold"
                  ? "text-sky-600 bg-sky-50 border-sky-100"
                  : "text-gray-500 bg-gray-100 border-gray-200"
              }`}>
                {status}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100">
                {outcome}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-100">
                Score <span className="text-emerald-500 font-bold">82</span>
                <Tooltip
                  title="Score"
                  position="top"
                  text="An AI-generated score from 0–100 measuring the overall quality of the conversation based on strategic execution, trust-building, objection handling, communication, and progress toward the desired outcome. It measures the quality of the conversation—not simply whether the call resulted in an appointment or sale."
                >
                  <Info
                    tabIndex={0}
                    aria-label="More about Score"
                    className="h-3 w-3 text-gray-400 outline-none"
                  />
                </Tooltip>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleCallNow}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
            >
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <span>Call Now</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
          {/* ================= Quick Info Card ================= */}
          <div className="bg-gray-50/60 rounded-2xl p-5 border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                <div className="text-xs">
                  <span className="text-gray-400 block text-[10px]">Email</span>
                  <span className="font-semibold text-gray-800">
                    demo@gmail.com
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                <div className="text-xs">
                  <span className="text-gray-400 block text-[10px]">Phone</span>
                  <span className="font-semibold text-gray-800">
                    +1 (962) 142-2314
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Tag className="h-4 w-4 text-gray-400 shrink-0" />
                <div className="text-xs">
                  <span className="text-gray-400 block text-[10px]">
                    Lead Type
                  </span>
                  <span className="font-semibold text-gray-800">
                    {leadType}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Home className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="text-gray-400 block text-[10px]">
                    {portal.addressLabel}
                  </span>
                  <span className="font-semibold text-gray-800">
                    443 N Camden Drive, Dallas, TX 75201
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                <div className="text-xs">
                  <span className="text-gray-400 block text-[10px]">
                    Added On
                  </span>
                  <span className="font-semibold text-gray-800">
                    May 16, 2025 1:14 PM
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= Activity Timeline & Lead Details Grid ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Timeline Card */}
            <div className="border border-gray-100 rounded-2xl p-5 bg-white shadow-xs flex flex-col justify-between">
              <div>
                <h2 className="text-xs font-bold text-dark-black mb-4">
                  Activity Timeline
                </h2>

                <div className="space-y-4">
                  {/* Upcoming follow-up */}
                  {lead?.followUpAt && (
                    <div className="flex items-start justify-between text-xs">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                          <CalendarDays className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">Follow-up scheduled</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            Due {formatDateTime(lead.followUpAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Saved notes */}
                  {notes.map((note) => (
                    <div key={note.id} className="flex items-start justify-between text-xs">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">Note added{note.authorName ? ` by ${note.authorName}` : ""}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5 whitespace-pre-line">
                            {note.body}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400 uppercase font-medium whitespace-nowrap ml-3">
                        {formatDateTime(note.createdAt)}
                      </span>
                    </div>
                  ))}

                  {/* Lead created */}
                  {lead?.createdAt && (
                    <div className="flex items-start justify-between text-xs">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-blue-50 text-light-blue">
                          <PhoneOutgoing className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">Lead added</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">Added to your leads</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400 uppercase font-medium whitespace-nowrap ml-3">
                        {formatDateTime(lead.createdAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <button className="w-full mt-5 py-2.5 text-xs font-semibold text-teal-600 border border-teal-200 rounded-xl hover:bg-teal-50 transition-colors cursor-pointer">
                View All Activity
              </button>
            </div>

            {/* Lead Details Card */}
            <div className="border border-gray-100 rounded-2xl p-5 bg-white shadow-xs space-y-4">
              <h2 className="text-xs font-bold text-dark-black mb-2">
                Lead Details
              </h2>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Lead Stage</span>
                  <span className="font-semibold text-indigo-500">
                    {stage}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Status</span>
                  <span className={`font-semibold ${
                    status === "Hot"
                      ? "text-orange-600"
                      : status === "Warm"
                      ? "text-amber-600"
                      : status === "Cold"
                      ? "text-sky-600"
                      : "text-gray-500"
                  }`}>
                    {status}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Outcome</span>
                  <span className="font-semibold text-emerald-600">
                    {outcome}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Last Contacted</span>
                  <span className="font-bold text-gray-800">
                    May 19, 2025 10:32 AM
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Next Follow Up</span>
                  <span className="font-bold text-gray-800">
                    May 22, 2025 11:00 AM
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Priority</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold text-red-500 bg-red-50 rounded-md">
                    High
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Estimated Value</span>
                  <span className="font-bold text-dark-black">$350,000</span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-50">
                <span className="text-xs font-semibold text-gray-400 block mb-1">
                  Notes
                </span>
                <p className="text-xs text-gray-600 italic whitespace-pre-line">
                  {notes[0]?.body || lead?.notes || "No notes yet."}
                </p>
              </div>

              <div className="pt-2">
                <span className="text-xs font-semibold text-gray-400 block mb-2">
                  Tags
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 text-[11px] font-medium text-blue-600 bg-blue-50 rounded-lg">
                    Motivated Seller
                  </span>
                  <span className="px-2.5 py-1 text-[11px] font-medium text-blue-600 bg-blue-50 rounded-lg">
                    Equity Rich
                  </span>
                  <button className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-gray-400 border border-dashed border-gray-200 rounded-lg hover:border-gray-400 transition-colors cursor-pointer">
                    <Plus className="h-3 w-3" />
                    <span>Add Tag</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ================= Performance Insights Charts ================= */}
          <div className="space-y-3 pt-2">
            <h2 className="text-xs font-bold text-dark-black">
              Performance Insights
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Trust Gain Chart */}
              <div className="border border-gray-100 rounded-2xl p-4 bg-white shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-medium text-gray-400 block">
                    Trust Gain
                  </span>
                  <span className="text-lg font-bold text-dark-black">
                    +18 pts
                  </span>
                </div>
                <div className="h-12 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trustGainData}>
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#0d9488"
                        strokeWidth={2}
                        fill="none"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AI Adherence Chart */}
              <div className="border border-gray-100 rounded-2xl p-4 bg-white shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-medium text-gray-400 block">
                    AI Adherence
                  </span>
                  <span className="text-lg font-bold text-dark-black">85 %</span>
                </div>
                <div className="h-12 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={aiAdherenceData}>
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#a855f7"
                        strokeWidth={2}
                        fill="none"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Total Calls Chart */}
              <div className="border border-gray-100 rounded-2xl p-4 bg-white shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-medium text-gray-400 block">
                    Total Calls This Month
                  </span>
                  <span className="text-lg font-bold text-dark-black">3</span>
                </div>
                <div className="h-12 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={totalCallsData}>
                      <Bar
                        dataKey="value"
                        fill="#60a5fa"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>

        <AddNoteModal
          isOpen={noteOpen}
          onClose={() => setNoteOpen(false)}
          value={noteText}
          onChange={setNoteText}
          onSave={handleSaveNote}
          saving={savingNote}
        />

        {/* ================= Saved Note Confirmation ================= */}
        {hasSavedNote && !noteOpen && (
          <div className="px-6 sm:px-8 py-3 border-t border-gray-100 bg-emerald-50/70 flex items-start gap-2.5">
            <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-xs text-gray-700 leading-relaxed">
              <span className="font-bold text-dark-black">Note saved:</span>{" "}
              {savedNote}
            </p>
          </div>
        )}

        {/* ================= Modal Footer Actions ================= */}
        <div className="p-4 sm:px-8 border-t border-gray-100 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleOpenNote}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-gray-500" />
              <span>Add Note</span>
            </button>

            <button
              onClick={() => setFollowUpOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Calendar className="h-3.5 w-3.5 text-gray-500" />
              <span>Schedule Follow-Up</span>
            </button>

            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
              <Mail className="h-3.5 w-3.5 text-gray-500" />
              <span>Send Email</span>
            </button>
          </div>

          <ActionMenu
            label="More actions"
            width={240}
            triggerClassName="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
            trigger={
              <>
                <MoreHorizontal className="h-3.5 w-3.5" />
                <span>More</span>
              </>
            }
            items={[
              { label: "Edit Lead", icon: Pencil, onClick: () => router.push(`${portal.base}/leads/edit?id=${lead?.id || ""}`) },
              { label: "Change Status", icon: CircleCheck, onClick: () => setStatusOpen(true) },
              { label: "Add to Follow Up Queue", icon: ListPlus, onClick: () => setFollowUpOpen(true) },
              { label: "Export Lead", icon: Download, onClick: () => lead && exportLeadCsv(lead) },
              // "Archived" is a lead stage, so archiving reuses the normal lead update
              stage === "Archived"
                ? {
                    label: "Restore Lead",
                    icon: ArchiveRestore,
                    onClick: async () => {
                      // onUpdateLead reports its own errors and resolves false on failure
                      if ((await onUpdateLead?.(lead.id, { stage: "New" })) !== false) showSavedToast("Lead restored", `${leadName} is back in your active leads.`);
                    },
                  }
                : {
                    label: "Archive Lead",
                    icon: Archive,
                    onClick: async () => {
                      // onUpdateLead reports its own errors and resolves false on failure
                      if ((await onUpdateLead?.(lead.id, { stage: "Archived" })) !== false) showSavedToast("Lead archived", `${leadName} was moved to Archived.`);
                    },
                  },
              { divider: true },
              { label: "Delete Lead", icon: Trash2, danger: true, onClick: () => setDeleteModalOpen(true) },
            ]}
          />
        </div>
      </div>
      </div>

      <UpdateStatusModal
        isOpen={statusOpen}
        onClose={() => setStatusOpen(false)}
        value={status}
        options={STATUS_OPTIONS}
        onSelect={(value) => {
          setStatusOpen(false);
          if (lead && value !== lead.status) onUpdateLead?.(lead.id, { status: value });
        }}
      />

      <ScheduleFollowUpModal
        isOpen={followUpOpen}
        onClose={() => setFollowUpOpen(false)}
        leadName={leadName}
        phoneNumber={lead?.phoneNumber || ""}
        onSchedule={handleScheduleFollowUp}
      />

      {/* Delete Confirmation Modal */}
      <AlertModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        type="warning"
        title="Delete Lead"
        message={`Are you sure you want to delete ${leadName}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default LeadDetailsModal;