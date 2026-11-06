import React, { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Edit3, MessageSquare, X } from "lucide-react";
import ReportsStats from "./reports-stats";
import ReportsTable from "./reports-table";
import ReportDetailPanel from "./report-detail-panel";
import ReportDetailModal from "./report-detail-modal";
import AdjustReportScoreModal from "./adjust-report-score-modal";
import AlertModal from "@/components/modals/alert-modal";
import AuditInfo from "./audit-info";

// ── Initial Reports Mock Data ──
const INITIAL_REPORTS = [
  {
    id: "REP-874512",
    title: "Call Analysis Report",
    subtitle: "+1 (512) 555-0198",
    reportType: "Call Analysis",
    leadType: "Expired Listing",
    score: 92,
    scoreRating: "HIGH SCORE",
    createdDate: "May 16, 2025",
    createdTime: "10:30 AM",
    createdBy: "System",
    duration: "18:42",
    trustScore: "94/100",
    objectionsHandled: 7,
    keyObjections: "Commission, Timing",
    adherenceScore: "88%",
    sentiment: "Positive (89%)",
    talkRatio: "42% Agent / 58% Lead",
    notes: "Lead showed high interest in a free home valuation next Tuesday.",
    internalNotes: [
      {
        id: "n-1",
        author: "Jennifer Smith (Rep)",
        time: "May 16, 2025 • 10:45 AM",
        content: "Coached agent on opening value proposition; seller committed to a video valuation review.",
      },
    ],
    iconColor: "text-purple-600 bg-purple-50 border-purple-100",
  },
  {
    id: "REP-874511",
    title: "Call Analysis Report",
    subtitle: "+1 (512) 555-0144",
    reportType: "Call Analysis",
    leadType: "FSBO",
    score: 87,
    scoreRating: "GOOD SCORE",
    createdDate: "May 16, 2025",
    createdTime: "9:49 AM",
    createdBy: "System",
    duration: "12:15",
    trustScore: "89/100",
    objectionsHandled: 5,
    keyObjections: "Pricing, Already Listed",
    adherenceScore: "84%",
    sentiment: "Neutral / Inquisitive",
    talkRatio: "48% Agent / 52% Lead",
    notes: "Seller was skeptical about commission fees, addressed with value stack.",
    internalNotes: [],
    iconColor: "text-purple-600 bg-purple-50 border-purple-100",
  },
  {
    id: "REP-874510",
    title: "Calibration Session Report",
    subtitle: "Real Estate Expireds v2.1",
    reportType: "Calibration",
    leadType: "—",
    score: 95,
    scoreRating: "HIGH SCORE",
    createdDate: "May 16, 2025",
    createdTime: "9:15 AM",
    createdBy: "Jennifer Smith",
    duration: "25:00",
    trustScore: "96/100",
    objectionsHandled: 8,
    keyObjections: "Tone & Pacing",
    adherenceScore: "95%",
    sentiment: "Strong Confidence",
    talkRatio: "50% Agent / 50% AI Simulator",
    notes: "Mastered the initial 30-second hook with 0 filler words.",
    iconColor: "text-teal-600 bg-teal-50 border-teal-100",
  },
  {
    id: "REP-874509",
    title: "Call Analysis Report",
    subtitle: "+1 (512) 555-0177",
    reportType: "Call Analysis",
    leadType: "Pre-Expired",
    score: 78,
    scoreRating: "NEEDS REVIEW",
    createdDate: "May 15, 2025",
    createdTime: "4:35 PM",
    createdBy: "System",
    duration: "08:30",
    trustScore: "76/100",
    objectionsHandled: 4,
    keyObjections: "Not selling right now",
    adherenceScore: "75%",
    sentiment: "Guarded",
    talkRatio: "60% Agent / 40% Lead",
    notes: "Agent spoke too quickly during objection handling phase.",
    iconColor: "text-purple-600 bg-purple-50 border-purple-100",
  },
  {
    id: "REP-874508",
    title: "Call Analysis Report",
    subtitle: "+1 (512) 555-0133",
    reportType: "Call Analysis",
    leadType: "Absentee Owner",
    score: null,
    scoreRating: "NO SCORE",
    createdDate: "May 15, 2025",
    createdTime: "2:14 PM",
    createdBy: "System",
    duration: "04:10",
    trustScore: "—",
    objectionsHandled: 0,
    keyObjections: "Voicemail / Gatekeeper",
    adherenceScore: "—",
    sentiment: "N/A",
    talkRatio: "N/A",
    notes: "Short call connected to assistant, callback scheduled.",
    iconColor: "text-purple-600 bg-purple-50 border-purple-100",
  },
  {
    id: "REP-874507",
    title: "Call Analysis Report",
    subtitle: "+1 (512) 555-0189",
    reportType: "Call Analysis",
    leadType: "Expired Listing",
    score: 85,
    scoreRating: "GOOD SCORE",
    createdDate: "May 15, 2025",
    createdTime: "11:11 AM",
    createdBy: "System",
    duration: "15:20",
    trustScore: "88/100",
    objectionsHandled: 6,
    keyObjections: "Market conditions",
    adherenceScore: "86%",
    sentiment: "Positive",
    talkRatio: "45% Agent / 55% Lead",
    notes: "Great discovery questions around relocation timeline.",
    iconColor: "text-purple-600 bg-purple-50 border-purple-100",
  },
  {
    id: "REP-874506",
    title: "Playbook Adherence Report",
    subtitle: "Real Estate Mastery v1.2",
    reportType: "Adherence",
    leadType: "—",
    score: 81,
    scoreRating: "GOOD SCORE",
    createdDate: "May 14, 2025",
    createdTime: "5:22 PM",
    createdBy: "System",
    duration: "10:00",
    trustScore: "82/100",
    objectionsHandled: 3,
    keyObjections: "Script pacing",
    adherenceScore: "81%",
    sentiment: "Neutral",
    talkRatio: "52% Agent / 48% Lead",
    notes: "Agent adhered to mandatory compliance disclosures.",
    iconColor: "text-emerald-600 bg-emerald-50 border-emerald-100",
  },
  {
    id: "REP-874505",
    title: "Call Analysis Report",
    subtitle: "+1 (512) 555-0122",
    reportType: "Call Analysis",
    leadType: "Circle Prospecting",
    score: 65,
    scoreRating: "NEEDS REVIEW",
    createdDate: "May 14, 2025",
    createdTime: "3:48 PM",
    createdBy: "System",
    duration: "06:45",
    trustScore: "62/100",
    objectionsHandled: 3,
    keyObjections: "No interest, Bad timing",
    adherenceScore: "68%",
    sentiment: "Challenging",
    talkRatio: "65% Agent / 35% Lead",
    notes: "Needs calibration on early trust building and active listening.",
    iconColor: "text-purple-600 bg-purple-50 border-purple-100",
  },
  {
    id: "REP-874504",
    title: "Call Analysis Report",
    subtitle: "+1 (512) 555-0166",
    reportType: "Call Analysis",
    leadType: "Expired Listing",
    score: 90,
    scoreRating: "HIGH SCORE",
    createdDate: "May 13, 2025",
    createdTime: "11:20 AM",
    createdBy: "System",
    duration: "14:10",
    trustScore: "92/100",
    objectionsHandled: 5,
    keyObjections: "Prior agent performance",
    adherenceScore: "90%",
    sentiment: "High Rapport",
    talkRatio: "44% Agent / 56% Lead",
    notes: "Successfully positioned PitchProx exclusive marketing system.",
    iconColor: "text-purple-600 bg-purple-50 border-purple-100",
  },
  {
    id: "REP-874503",
    title: "Performance Summary Report",
    subtitle: "Weekly AI Benchmark",
    reportType: "Performance",
    leadType: "—",
    score: 88,
    scoreRating: "GOOD SCORE",
    createdDate: "May 12, 2025",
    createdTime: "4:00 PM",
    createdBy: "System",
    duration: "N/A",
    trustScore: "90/100",
    objectionsHandled: 28,
    keyObjections: "Weekly Aggregation",
    adherenceScore: "87%",
    sentiment: "Positive Trend",
    talkRatio: "Balanced",
    notes: "Overall team metrics improved by 14% this week.",
    iconColor: "text-blue-600 bg-blue-50 border-blue-100",
  },
  {
    id: "REP-874502",
    title: "Call Analysis Report",
    subtitle: "+1 (512) 555-0119",
    reportType: "Call Analysis",
    leadType: "FSBO",
    score: 84,
    scoreRating: "GOOD SCORE",
    createdDate: "May 12, 2025",
    createdTime: "1:15 PM",
    createdBy: "System",
    duration: "11:05",
    trustScore: "85/100",
    objectionsHandled: 4,
    keyObjections: "Sell by owner savings",
    adherenceScore: "83%",
    sentiment: "Engaged",
    talkRatio: "47% Agent / 53% Lead",
    notes: "Clear value explanation regarding net proceeds vs gross price.",
    iconColor: "text-purple-600 bg-purple-50 border-purple-100",
  },
  {
    id: "REP-874501",
    title: "Call Analysis Report",
    subtitle: "+1 (512) 555-0199",
    reportType: "Call Analysis",
    leadType: "Pre-Foreclosure",
    score: 91,
    scoreRating: "HIGH SCORE",
    createdDate: "May 11, 2025",
    createdTime: "10:05 AM",
    createdBy: "System",
    duration: "16:40",
    trustScore: "95/100",
    objectionsHandled: 6,
    keyObjections: "Sensitive timeline",
    adherenceScore: "92%",
    sentiment: "Empathetic",
    talkRatio: "41% Agent / 59% Lead",
    notes: "Handled with extreme empathy and established trusted advisor status.",
    iconColor: "text-purple-600 bg-purple-50 border-purple-100",
  },
];

export default function UserReports() {
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [selectedReportId, setSelectedReportId] = useState("REP-874512");

  // Filter states
  const [dateRange, setDateRange] = useState("may1-may16");
  const [reportType, setReportType] = useState("all");
  const [leadType, setLeadType] = useState("all");
  const [scoreFilter, setScoreFilter] = useState("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal states
  const [isFullReportModalOpen, setIsFullReportModalOpen] = useState(false);
  const [isAdjustScoreModalOpen, setIsAdjustScoreModalOpen] = useState(false);
  const [isRemoveAlertOpen, setIsRemoveAlertOpen] = useState(false);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      if (reportType !== "all" && item.reportType !== reportType) return false;
      if (leadType !== "all" && item.leadType !== leadType) return false;
      if (scoreFilter === "high" && (item.score === null || item.score < 90)) return false;
      if (scoreFilter === "good" && (item.score === null || item.score < 80 || item.score >= 90))
        return false;
      if (scoreFilter === "review" && (item.score === null || item.score >= 80)) return false;
      return true;
    });
  }, [reports, reportType, leadType, scoreFilter]);

  // Selected report
  const selectedReport =
    reports.find((r) => r.id === selectedReportId) || filteredReports[0] || reports[0];

  // Paginated reports
  const startIndex = (currentPage - 1) * pageSize;
  const currentPaginatedReports = filteredReports.slice(startIndex, startIndex + pageSize);

  // Clear filters
  const handleClearFilters = () => {
    setDateRange("may1-may16");
    setReportType("all");
    setLeadType("all");
    setScoreFilter("all");
    setCurrentPage(1);
    toast.success("Filters cleared");
  };

  // Adjust score
  const handleSaveScore = (newScore, reason) => {
    const parsedScore = parseInt(newScore, 10);
    if (isNaN(parsedScore) || parsedScore < 0 || parsedScore > 100) {
      toast.error("Please enter a valid score between 0 and 100.");
      return;
    }
    setReports((prev) =>
      prev.map((r) =>
        r.id === selectedReport.id
          ? {
              ...r,
              score: parsedScore,
              scoreRating:
                parsedScore >= 90
                  ? "HIGH SCORE"
                  : parsedScore >= 80
                  ? "GOOD SCORE"
                  : "NEEDS REVIEW",
            }
          : r
      )
    );
    setIsAdjustScoreModalOpen(false);
    toast.success(`Score for ${selectedReport.id} updated to ${parsedScore}!`);
  };

  // Add internal note
  const handleSaveInternalNote = (e) => {
    e?.preventDefault?.();
    if (!newNoteText.trim()) {
      toast.error("Please enter internal note content.");
      return;
    }
    const newNote = {
      id: `note-${Date.now()}`,
      author: "Jennifer Smith (Internal Rep)",
      time: "Just now",
      content: newNoteText.trim(),
    };
    setReports((prev) =>
      prev.map((r) =>
        r.id === selectedReport.id
          ? {
              ...r,
              internalNotes: [newNote, ...(r.internalNotes || [])],
            }
          : r
      )
    );
    setNewNoteText("");
    setIsAddNoteModalOpen(false);
    toast.success(`Internal note added to report ${selectedReport.id}!`);
  };

  // Remove report
  const handleConfirmRemoveReport = () => {
    if (selectedReport?.id) {
      const removedId = selectedReport.id;
      setReports((prev) => prev.filter((r) => r.id !== removedId));
      setIsRemoveAlertOpen(false);
      toast.error(`Report ${removedId} has been removed.`);
      const remaining = reports.filter((r) => r.id !== removedId);
      if (remaining.length > 0) {
        setSelectedReportId(remaining[0].id);
      }
    }
  };

  return (
    <div className="w-full min-w-0 flex flex-col gap-6 pb-6">
      {/* ═════════════════════════════════════════════════════════════ */}
      {/* MAIN 2-COLUMN LAYOUT MATCHING USER REFERENCE IMAGE          */}
      {/* ═════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start w-full min-w-0">
        {/* ── LEFT COLUMN: Stats + Reports Table (With Embedded Filters) (8 cols) ── */}
        <div className="xl:col-span-8 flex flex-col gap-5 w-full min-w-0">
          {/* 1. Stat Cards (No Title, No Add Button) */}
          <ReportsStats
            stats={{
              reportsUsed: 18,
              reportsTotal: 50,
              usedPercent: 36,
              highScoreCount: 11,
              highScorePercent: 61,
              averageScore: 82,
              scoreDiff: "+ 8 pts",
              lastReportDate: "May 16, 2025",
              lastReportAgo: "12m ago",
            }}
          />

          {/* 2. Reports Table (Filter Row Embedded Inside, No Action Column, with Pagination) */}
          <ReportsTable
            reports={currentPaginatedReports}
            selectedReportId={selectedReport?.id}
            onSelectReport={setSelectedReportId}
            // Filter Props
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            reportType={reportType}
            onReportTypeChange={(val) => {
              setReportType(val);
              setCurrentPage(1);
            }}
            leadType={leadType}
            onLeadTypeChange={(val) => {
              setLeadType(val);
              setCurrentPage(1);
            }}
            scoreFilter={scoreFilter}
            onScoreFilterChange={(val) => {
              setScoreFilter(val);
              setCurrentPage(1);
            }}
            onClearFilters={handleClearFilters}
            // Pagination Props
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={filteredReports.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* ── RIGHT COLUMN: Selected Report Detail Panel (4 cols) ── */}
        <div className="xl:col-span-4 flex flex-col gap-6 w-full min-w-0">
          <ReportDetailPanel
            report={selectedReport}
            onViewFullReport={() => setIsFullReportModalOpen(true)}
            onAdjustScore={() => setIsAdjustScoreModalOpen(true)}
            onRemoveReport={() => setIsRemoveAlertOpen(true)}
            onAddNote={() => {
              setNewNoteText("");
              setIsAddNoteModalOpen(true);
            }}
          />
        </div>
      </div>

      {/* ── Footer Audit Info ── */}
      <AuditInfo />

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* MODALS                                                       */}
      {/* ═════════════════════════════════════════════════════════════ */}

      {/* 1. Full Report Detail Modal */}
      <ReportDetailModal
        isOpen={isFullReportModalOpen}
        onClose={() => setIsFullReportModalOpen(false)}
        report={selectedReport}
        onDownloadPdf={() =>
          toast.success(`Downloading PDF for ${selectedReport?.id}...`)
        }
      />

      {/* 2. Adjust Report Score Modal */}
      <AdjustReportScoreModal
        key={`${selectedReport?.id ?? "none"}-${isAdjustScoreModalOpen}`}
        isOpen={isAdjustScoreModalOpen}
        onClose={() => setIsAdjustScoreModalOpen(false)}
        report={selectedReport}
        onSave={handleSaveScore}
      />

      {/* 3. Remove Report Alert Modal */}
      <AlertModal
        isOpen={isRemoveAlertOpen}
        onClose={() => setIsRemoveAlertOpen(false)}
        type="error"
        title="Remove Report?"
        message={`Are you sure you want to remove report ${selectedReport?.id}? This action will permanently remove this report from the user's history.`}
        confirmLabel="Remove Report"
        onConfirm={handleConfirmRemoveReport}
      />

      {/* 4. Add Internal Note Modal */}
      <AnimatePresence>
        {isAddNoteModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto"
            onClick={() => setIsAddNoteModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-light-gray overflow-hidden my-8 flex flex-col"
            >
              {/* Header */}
              <div className="p-6 pb-4 border-b border-light-gray flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-dark-black">
                      Add Internal Note
                    </h3>
                    <p className="text-xs text-light-black">
                      Report {selectedReport?.id} • {selectedReport?.title}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddNoteModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-light-gray text-light-black hover:text-dark-black transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveInternalNote} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-dark-black uppercase tracking-wider mb-1.5">
                    Internal Note Content
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Write coaching notes, objections summary, or follow-up action items..."
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-light-gray rounded-xl text-dark-black focus:outline-none focus:border-primary font-medium resize-none"
                  />
                  <span className="text-[11px] text-light-black mt-1 block">
                    Internal notes are confidential and visible to sales representatives & administrators.
                  </span>
                </div>

                <div className="pt-3 border-t border-light-gray flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsAddNoteModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-light-gray hover:bg-light-gray text-xs font-semibold text-dark-black transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer"
                  >
                    Save Note
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
