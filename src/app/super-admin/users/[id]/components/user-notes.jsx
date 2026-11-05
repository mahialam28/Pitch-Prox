"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Plus,
  Search,
  ChevronDown,
  Edit2,
  Trash2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  Paperclip,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { DeleteNoteModal } from "./account-dialogs";
import AuditInfo from "./audit-info";
import AddNoteModal from "./add-note-modal";

const NOTE_TYPES = [
  {
    id: "Lead Insight",
    label: "Lead Insight",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200/70",
  },
  {
    id: "Call Coaching",
    label: "Call Coaching",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200/70",
  },
  {
    id: "Lead Update",
    label: "Lead Update",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200/70",
  },
  {
    id: "Communication",
    label: "Communication",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200/70",
  },
  {
    id: "System Note",
    label: "System Note",
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-200/70",
  },
];

const INITIAL_NOTES = [
  {
    id: "1",
    title: "Prefers morning follow-up calls",
    content:
      "Lead mentioned 9-11 AM CST works best for callbacks. Higher connection rate in the mornings.",
    type: "Lead Insight",
    isPinned: false,
    createdBy: { name: "Daniel Miller", role: "Super Admin" },
    createdDate: "May 16, 2025",
    createdTime: "10:28 AM",
    updatedDate: "May 16, 2025",
    updatedTime: "10:28 AM",
    activity: [
      {
        label: "Note created",
        author: "Daniel Miller",
        date: "May 16, 2025 10:28 AM",
      },
      {
        label: "Note updated",
        author: "Daniel Miller",
        date: "May 16, 2025 10:28 AM",
      },
    ],
  },
  {
    id: "2",
    title: "Commission objection handled well",
    content:
      "Rep used variation #7 from Objection Tree. Lead was receptive but needs follow-up confirmation.",
    type: "Call Coaching",
    isPinned: false,
    createdBy: { name: "Sarah Johnson", role: "Team Leader" },
    createdDate: "May 15, 2025",
    createdTime: "3:42 PM",
    updatedDate: "May 16, 2025",
    updatedTime: "3:42 PM",
    activity: [
      {
        label: "Note created",
        author: "Sarah Johnson",
        date: "May 15, 2025 3:42 PM",
      },
      {
        label: "Note updated",
        author: "Sarah Johnson",
        date: "May 16, 2025 3:42 PM",
      },
    ],
  },
  {
    id: "3",
    title: "Property vacant – motivation likely high",
    content:
      "Absentee owner confirmed property has been vacant for 8+ months. Ready for aggressive follow-up.",
    type: "Lead Update",
    isPinned: false,
    createdBy: { name: "Michael Roberts", role: "Admin" },
    createdDate: "May 14, 2025",
    createdTime: "11:15 AM",
    updatedDate: "May 16, 2025",
    updatedTime: "11:15 AM",
    activity: [
      {
        label: "Note created",
        author: "Michael Roberts",
        date: "May 14, 2025 11:15 AM",
      },
      {
        label: "Note updated",
        author: "Michael Roberts",
        date: "May 16, 2025 11:15 AM",
      },
    ],
  },
  {
    id: "4",
    title: "Requested text follow-up",
    content:
      "Lead asked to receive info via text before scheduling a call. Text campaign initiated.",
    type: "Communication",
    isPinned: false,
    createdBy: { name: "Tina Walker", role: "Billing Admin" },
    createdDate: "May 13, 2025",
    createdTime: "9:05 AM",
    updatedDate: "May 16, 2025",
    updatedTime: "9:05 AM",
    activity: [
      {
        label: "Note created",
        author: "Tina Walker",
        date: "May 13, 2025 9:05 AM",
      },
      {
        label: "Note updated",
        author: "Tina Walker",
        date: "May 16, 2025 9:05 AM",
      },
    ],
  },
  {
    id: "5",
    title: "Do Not Call – Wrong Number",
    content: "Confirmed wrong number. Do not contact again.",
    type: "System Note",
    isPinned: false,
    createdBy: { name: "System", role: "" },
    createdDate: "May 10, 2025",
    createdTime: "2:22 PM",
    updatedDate: "May 16, 2025",
    updatedTime: "2:22 PM",
    activity: [
      {
        label: "Note created",
        author: "System",
        date: "May 10, 2025 2:22 PM",
      },
    ],
  },
  {
    id: "6",
    title: "Inquired about API CRM integrations",
    content:
      "Lead asked about custom webhook integration with HubSpot. Sent technical documentation.",
    type: "Lead Insight",
    isPinned: false,
    createdBy: { name: "Daniel Miller", role: "Super Admin" },
    createdDate: "May 08, 2025",
    createdTime: "4:15 PM",
    updatedDate: "May 09, 2025",
    updatedTime: "10:00 AM",
    activity: [
      {
        label: "Note created",
        author: "Daniel Miller",
        date: "May 08, 2025 4:15 PM",
      },
    ],
  },
  {
    id: "7",
    title: "Billing cycle adjustment requested",
    content:
      "Customer requested changing billing date to 1st of month. Handled by billing support.",
    type: "Communication",
    isPinned: false,
    createdBy: { name: "Tina Walker", role: "Billing Admin" },
    createdDate: "May 05, 2025",
    createdTime: "11:30 AM",
    updatedDate: "May 05, 2025",
    updatedTime: "11:30 AM",
    activity: [
      {
        label: "Note created",
        author: "Tina Walker",
        date: "May 05, 2025 11:30 AM",
      },
    ],
  },
  {
    id: "8",
    title: "AI playbook pitch optimization",
    content:
      "Adjusted AI objection confidence thresholds for property tax questions.",
    type: "Call Coaching",
    isPinned: false,
    createdBy: { name: "Sarah Johnson", role: "Team Leader" },
    createdDate: "May 02, 2025",
    createdTime: "1:20 PM",
    updatedDate: "May 03, 2025",
    updatedTime: "2:10 PM",
    activity: [
      {
        label: "Note created",
        author: "Sarah Johnson",
        date: "May 02, 2025 1:20 PM",
      },
    ],
  },
];

const pageSizeOptions = [
  { value: 5, label: "5 / page" },
  { value: 10, label: "10 / page" },
  { value: 20, label: "20 / page" },
];

export const UserNotes = () => {
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [selectedNoteId, setSelectedNoteId] = useState("1");

  // Modal State for Add / Edit Note
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalInitialData, setModalInitialData] = useState(null);

  // Form State for Right-hand Note Details Panel
  const [formType, setFormType] = useState("Lead Insight");
  const [formTitle, setFormTitle] = useState(INITIAL_NOTES[0].title);
  const [formContent, setFormContent] = useState(INITIAL_NOTES[0].content);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [authorFilter, setAuthorFilter] = useState("all");

  // Dropdown menus tracking
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Current selected note object
  const activeNote = useMemo(
    () => notes.find((n) => n.id === selectedNoteId) || notes[0],
    [notes, selectedNoteId]
  );

  // Sync right panel form when active note changes
  const handleSelectNote = (note) => {
    setSelectedNoteId(note.id);
    setFormType(note.type);
    setFormTitle(note.title);
    setFormContent(note.content);
  };

  // Open Modal for Creating a New Note
  const handleOpenAddModal = () => {
    setModalInitialData(null);
    setIsAddModalOpen(true);
  };

  // Open Modal for Editing Note
  const handleOpenEditModal = (note) => {
    setModalInitialData(note);
    setIsAddModalOpen(true);
  };

  // Save handler from Modal
  const handleModalSave = (noteData) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const formattedTime = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    if (noteData.id) {
      // Update existing note
      setNotes((prev) =>
        prev.map((n) => {
          if (n.id === noteData.id) {
            return {
              ...n,
              title: noteData.title,
              content: noteData.content,
              type: noteData.type,
              isPinned: noteData.isPinned,
              updatedDate: formattedDate,
              updatedTime: formattedTime,
              activity: [
                ...(n.activity || []),
                {
                  label: "Note updated",
                  author: "Daniel Miller",
                  date: `${formattedDate} ${formattedTime}`,
                },
              ],
            };
          }
          return n;
        })
      );
      if (selectedNoteId === noteData.id) {
        setFormTitle(noteData.title);
        setFormContent(noteData.content);
        setFormType(noteData.type);
      }
      toast.success("Note updated successfully!");
    } else {
      // Add new note
      const newNote = {
        id: String(Date.now()),
        title: noteData.title,
        content: noteData.content,
        type: noteData.type,
        isPinned: noteData.isPinned,
        createdBy: { name: "Daniel Miller", role: "Super Admin" },
        createdDate: formattedDate,
        createdTime: formattedTime,
        updatedDate: formattedDate,
        updatedTime: formattedTime,
        activity: [
          {
            label: "Note created",
            author: "Daniel Miller",
            date: `${formattedDate} ${formattedTime}`,
          },
        ],
      };
      setNotes([newNote, ...notes]);
      handleSelectNote(newNote);
      toast.success("New note added successfully!");
    }
  };

  // Save handler from Right Panel
  const handleSavePanelNote = () => {
    if (!formTitle.trim()) {
      toast.error("Please enter a note title");
      return;
    }

    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const formattedTime = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === selectedNoteId) {
          return {
            ...n,
            title: formTitle.trim(),
            content: formContent.trim(),
            type: formType,
            updatedDate: formattedDate,
            updatedTime: formattedTime,
            activity: [
              ...(n.activity || []),
              {
                label: "Note updated",
                author: "Daniel Miller",
                date: `${formattedDate} ${formattedTime}`,
              },
            ],
          };
        }
        return n;
      })
    );
    toast.success("Note updated successfully!");
  };

  // Delete note handler
  const [deletingNote, setDeletingNote] = useState(null);

  // Delete asks first (Delete Note dialog), then removes the note locally
  const handleDeleteNote = (e, noteId) => {
    e.stopPropagation();
    const note = notes.find((n) => n.id === noteId);
    if (note) setDeletingNote({ id: note.id, preview: note.title });
  };

  const confirmDeleteNote = ({ id: noteId }) => {
    const remaining = notes.filter((n) => n.id !== noteId);
    setNotes(remaining);
    if (selectedNoteId === noteId && remaining.length > 0) {
      handleSelectNote(remaining[0]);
    }
    toast.success("Note deleted successfully");
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setAuthorFilter("all");
    setCurrentPage(1);
  };

  // Filtered Notes
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = note.title.toLowerCase().includes(q);
        const matchesContent = note.content.toLowerCase().includes(q);
        const matchesAuthor = note.createdBy.name.toLowerCase().includes(q);
        if (!matchesTitle && !matchesContent && !matchesAuthor) return false;
      }

      if (typeFilter !== "all" && note.type !== typeFilter) {
        return false;
      }

      if (authorFilter !== "all" && note.createdBy.name !== authorFilter) {
        return false;
      }

      return true;
    });
  }, [notes, searchQuery, typeFilter, authorFilter]);

  // Paginated Notes
  const totalItems = filteredNotes.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startItem = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, totalItems);

  const paginatedNotes = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredNotes.slice(start, start + pageSize);
  }, [filteredNotes, safePage, pageSize]);

  const getTypeConfig = (typeName) => {
    return (
      NOTE_TYPES.find((t) => t.id === typeName) || {
        bg: "bg-gray-100",
        text: "text-gray-700",
        border: "border-gray-200/70",
      }
    );
  };

  return (
    <div ref={dropdownRef} className="w-full max-w-full flex flex-col gap-6 min-w-0">
      {/* ── Top Header Card (White BG with Border & Shadow) ── */}
      <div className="w-full bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-dark-black tracking-tight font-secondary">
            Notes
          </h2>
          <p className="text-xs sm:text-sm text-light-black mt-0.5">
            Create and manage internal notes for this user account.
          </p>
        </div>

        {/* Add Note Button (Triggers Modal) */}
        <button
          type="button"
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Note</span>
        </button>
      </div>

      {/* ── Main Two-Column Layout (Responsive for All Screens) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full max-w-full min-w-0">
        {/* ── Left Column: Notes Table with Search & Filters Inside Box (8 Cols) ── */}
        <div className="lg:col-span-8 flex flex-col gap-4 w-full max-w-full min-w-0">
          {/* ── Notes Table Container with Search & Filters Inside Box ── */}
          <div className="bg-white rounded-2xl border border-light-gray shadow-xs overflow-hidden flex flex-col w-full max-w-full">
            {/* Search & Filter Toolbar Inside Table Box */}
            <div className="w-full p-4 sm:p-5 border-b border-light-gray/60 bg-white flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-4 h-4 text-light-black absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search notes..."
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-light-gray bg-white text-xs font-medium text-dark-black outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Dropdowns & Clear button */}
              <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
                {/* Note Type Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenDropdown(openDropdown === "type" ? null : "type")
                    }
                    className="flex items-center justify-between gap-2 px-3 py-2 text-xs font-semibold text-medium-black bg-white border border-light-gray rounded-xl hover:bg-light-gray/40 transition-colors shadow-2xs cursor-pointer min-w-[130px]"
                  >
                    <span>
                      {typeFilter === "all" ? "All Note Types" : typeFilter}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-light-black shrink-0" />
                  </button>

                  <AnimatePresence>
                    {openDropdown === "type" && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        className="absolute left-0 top-full mt-1 w-48 bg-white border border-light-gray rounded-xl shadow-lg p-1 z-30 text-xs"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setTypeFilter("all");
                            setOpenDropdown(null);
                            setCurrentPage(1);
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-between cursor-pointer ${
                            typeFilter === "all"
                              ? "bg-primary/10 text-primary font-bold"
                              : "text-dark-black hover:bg-light-gray"
                          }`}
                        >
                          <span>All Note Types</span>
                          {typeFilter === "all" && (
                            <Check className="w-3.5 h-3.5 text-primary" />
                          )}
                        </button>
                        {NOTE_TYPES.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => {
                              setTypeFilter(t.id);
                              setOpenDropdown(null);
                              setCurrentPage(1);
                            }}
                            className={`w-full text-left px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-between cursor-pointer ${
                              typeFilter === t.id
                                ? "bg-primary/10 text-primary font-bold"
                                : "text-dark-black hover:bg-light-gray"
                            }`}
                          >
                            <span>{t.label}</span>
                            {typeFilter === t.id && (
                              <Check className="w-3.5 h-3.5 text-primary" />
                            )}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Created By Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenDropdown(openDropdown === "author" ? null : "author")
                    }
                    className="flex items-center justify-between gap-2 px-3 py-2 text-xs font-semibold text-medium-black bg-white border border-light-gray rounded-xl hover:bg-light-gray/40 transition-colors shadow-2xs cursor-pointer min-w-[130px]"
                  >
                    <span>
                      {authorFilter === "all" ? "All Created By" : authorFilter}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-light-black shrink-0" />
                  </button>

                  <AnimatePresence>
                    {openDropdown === "author" && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        className="absolute left-0 top-full mt-1 w-44 bg-white border border-light-gray rounded-xl shadow-lg p-1 z-30 text-xs"
                      >
                        {[
                          "all",
                          "Daniel Miller",
                          "Sarah Johnson",
                          "Michael Roberts",
                          "Tina Walker",
                          "System",
                        ].map((auth) => (
                          <button
                            key={auth}
                            type="button"
                            onClick={() => {
                              setAuthorFilter(auth);
                              setOpenDropdown(null);
                              setCurrentPage(1);
                            }}
                            className={`w-full text-left px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-between cursor-pointer ${
                              authorFilter === auth
                                ? "bg-primary/10 text-primary font-bold"
                                : "text-dark-black hover:bg-light-gray"
                            }`}
                          >
                            <span>
                              {auth === "all" ? "All Created By" : auth}
                            </span>
                            {authorFilter === auth && (
                              <Check className="w-3.5 h-3.5 text-primary" />
                            )}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Clear Button */}
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs font-bold text-primary hover:underline px-2 py-1 transition-colors cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Scroll wrapper for table on mobile/tablet */}
            <div className="w-full max-w-full overflow-x-auto min-w-0 overscroll-x-contain touch-pan-x scrollbar-thin">
              <table className="w-full text-left border-collapse min-w-[850px] table-fixed">
                <thead>
                  <tr className="border-b border-light-gray text-[11px] font-bold text-light-black uppercase tracking-wider bg-[#FAFAFA]/50">
                    <th className="py-3.5 pl-5 sm:pl-6 pr-3 font-semibold w-[240px]">
                      NOTE
                    </th>
                    <th className="py-3.5 px-3 font-semibold w-[120px]">
                      TYPE
                    </th>
                    <th className="py-3.5 px-3 font-semibold w-[130px]">
                      CREATED BY
                    </th>
                    <th className="py-3.5 px-3 font-semibold w-[120px] whitespace-nowrap">
                      CREATED ON
                    </th>
                    <th className="py-3.5 px-3 font-semibold w-[120px] whitespace-nowrap">
                      UPDATED ON
                    </th>
                    <th className="py-3.5 pr-5 sm:pr-6 pl-3 font-semibold text-center w-[80px]">
                      ACTIONS
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-light-gray/60">
                  {paginatedNotes.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 text-center text-light-black text-xs"
                      >
                        No notes found matching your search or filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedNotes.map((note) => {
                      const typeCfg = getTypeConfig(note.type);
                      const isSelected = selectedNoteId === note.id;

                      return (
                        <tr
                          key={note.id}
                          onClick={() => handleSelectNote(note)}
                          className={`group transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-primary/5 ring-1 ring-inset ring-primary/20"
                              : "hover:bg-light-gray/20"
                          }`}
                        >
                          {/* 1. NOTE (Title, Snippet, Pin Tag) */}
                          <td className="py-3.5 pl-5 sm:pl-6 pr-3 align-middle">
                            <div className="min-w-0 max-w-[240px]">
                              <div className="flex items-center gap-1.5">
                                {note.isPinned && (
                                  <Paperclip className="w-3 h-3 text-primary shrink-0" />
                                )}
                                <p className="font-semibold text-xs sm:text-[13px] text-dark-black truncate group-hover:text-primary transition-colors">
                                  {note.title}
                                </p>
                              </div>
                              <p className="text-[11px] text-light-black truncate mt-0.5">
                                {note.content}
                              </p>
                            </div>
                          </td>

                          {/* 2. TYPE BADGE */}
                          <td className="py-3.5 px-3 align-middle whitespace-nowrap">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${typeCfg.bg} ${typeCfg.text} ${typeCfg.border}`}
                            >
                              {note.type}
                            </span>
                          </td>

                          {/* 3. CREATED BY */}
                          <td className="py-3.5 px-3 align-middle whitespace-nowrap text-xs">
                            <p className="font-semibold text-dark-black leading-tight">
                              {note.createdBy.name}
                            </p>
                            {note.createdBy.role && (
                              <p className="text-[10px] text-light-black mt-0.5">
                                {note.createdBy.role}
                              </p>
                            )}
                          </td>

                          {/* 4. CREATED ON (Date & Time) */}
                          <td className="py-3.5 px-3 align-middle whitespace-nowrap text-xs text-light-black leading-tight">
                            <p className="font-medium text-dark-black/80">
                              {note.createdDate}
                            </p>
                            <p className="text-[10px] text-light-black mt-0.5">
                              {note.createdTime}
                            </p>
                          </td>

                          {/* 5. UPDATED ON (Date & Time) */}
                          <td className="py-3.5 px-3 align-middle whitespace-nowrap text-xs text-light-black leading-tight">
                            <p className="font-medium text-dark-black/80">
                              {note.updatedDate}
                            </p>
                            <p className="text-[10px] text-light-black mt-0.5">
                              {note.updatedTime}
                            </p>
                          </td>

                          {/* 6. ACTIONS (Triggers Edit Modal & Delete) */}
                          <td className="py-3.5 pr-5 sm:pr-6 px-3 align-middle text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditModal(note);
                                }}
                                className="w-7 h-7 rounded-lg border border-light-gray hover:bg-light-gray text-light-black hover:text-dark-black transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
                                title="Edit in Modal"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteNote(e, note.id)}
                                className="w-7 h-7 rounded-lg border border-light-gray hover:border-rose-200 hover:bg-rose-50 text-light-black hover:text-rose-600 transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
                                title="Delete Note"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Standard Pagination ── */}
            <div className="p-4 sm:px-5 flex items-center justify-end gap-3 border-t border-light-gray/70 text-xs bg-white">
              {/* Page Controls */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-1">
                  {/* Prev Button */}
                  <button
                    type="button"
                    disabled={safePage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg border border-light-gray hover:bg-light-gray text-medium-black disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  {/* Page Buttons */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNum) => {
                      const isActive = pageNum === safePage;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-7 h-7 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                            isActive
                              ? "bg-primary text-white font-bold shadow-xs"
                              : "border border-light-gray text-medium-black hover:bg-light-gray"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}

                  {/* Next Button */}
                  <button
                    type="button"
                    disabled={safePage >= totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    className="p-1.5 rounded-lg border border-light-gray hover:bg-light-gray text-medium-black disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Page Size Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenDropdown(
                        openDropdown === "pageSize" ? null : "pageSize"
                      )
                    }
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-medium-black bg-white border border-light-gray rounded-xl hover:bg-light-gray/40 transition-colors cursor-pointer"
                  >
                    <span>{pageSize} / page</span>
                    <ChevronDown className="w-3 h-3 text-light-black" />
                  </button>
                  <AnimatePresence>
                    {openDropdown === "pageSize" && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute right-0 bottom-full mb-1 w-28 bg-white border border-light-gray rounded-xl shadow-lg p-1 z-30 text-xs"
                      >
                        {pageSizeOptions.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setPageSize(opt.value);
                              setOpenDropdown(null);
                              setCurrentPage(1);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                              pageSize === opt.value
                                ? "bg-primary/10 text-primary font-bold"
                                : "text-dark-black hover:bg-light-gray"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Info Notice Banner */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#EDF7FA] border border-[#D0EEF4] flex items-center gap-2.5 text-xs text-dark-black/85">
            <Clock className="w-4 h-4 text-primary shrink-0" />
            <span>
              Notes are internal and only visible to authorized team members.
            </span>
          </div>
        </div>

        {/* ── Right Column: Note Details & Activity Timeline (4 Cols) ── */}
        <div className="lg:col-span-4 flex flex-col gap-5 sticky top-6 w-full max-w-full min-w-0">
          {/* Card 1: Note Details Form */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-dark-black tracking-tight font-secondary">
                Note Details
              </h3>
              <p className="text-xs text-light-black mt-0.5">
                Edit this note or view full details.
              </p>
            </div>

            {/* Note Type Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-medium-black tracking-wider uppercase">
                NOTE TYPE
              </label>
              <div className="relative">
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-light-gray bg-white text-xs font-semibold text-dark-black outline-none focus:border-primary transition-colors cursor-pointer"
                >
                  {NOTE_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-light-black absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Title Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-medium-black tracking-wider uppercase">
                TITLE
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Enter note title..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray bg-white text-xs font-semibold text-dark-black outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Content Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-medium-black tracking-wider uppercase">
                NOTE CONTENT
              </label>
              <textarea
                rows={4}
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="Write detailed internal note..."
                className="w-full p-3 rounded-xl border border-light-gray bg-white text-xs text-dark-black placeholder:text-light-black/60 outline-none focus:border-primary transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Form Actions */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  if (activeNote) {
                    setFormTitle(activeNote.title);
                    setFormContent(activeNote.content);
                    setFormType(activeNote.type);
                  }
                }}
                className="px-4 py-2 rounded-xl border border-light-gray text-xs font-semibold text-dark-black hover:bg-light-gray/40 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSavePanelNote}
                className="px-5 py-2 rounded-xl bg-primary hover:bg-medium-teal active:scale-[0.98] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                Update Note
              </button>
            </div>
          </div>

          {/* Card 2: Note Activity Timeline */}
          {activeNote && (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-dark-black tracking-tight font-secondary">
                Note Activity
              </h3>

              <div className="relative pl-6 space-y-4">
                {/* Vertical connecting line */}
                <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-emerald-200" />

                {(activeNote.activity || [
                  {
                    label: "Note created",
                    author: activeNote.createdBy.name,
                    date: `${activeNote.createdDate} ${activeNote.createdTime}`,
                  },
                ]).map((act, index) => (
                  <div key={index} className="relative flex flex-col gap-0.5">
                    {/* Green node circle */}
                    <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white" />
                    <p className="text-xs font-bold text-dark-black leading-tight">
                      {act.label}
                    </p>
                    <p className="text-[11px] text-light-black">
                      {act.author} • {act.date}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Add / Edit Note Modal (Matching 2nd Image) ── */}
      <AddNoteModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        initialData={modalInitialData}
        onSave={handleModalSave}
      />

      <DeleteNoteModal note={deletingNote} onClose={() => setDeletingNote(null)} onConfirm={confirmDeleteNote} />

      {/* ── Footer Audit Info ── */}
      <AuditInfo />
    </div>
  );
};

export default UserNotes;
