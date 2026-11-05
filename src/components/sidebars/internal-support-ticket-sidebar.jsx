"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ArrowLeft,
  ArrowRight,
  User,
  MessageSquare,
  Paperclip,
  Eye,
  Download,
  Send,
  Bold,
  Italic,
  Underline,
  List,
  AlignLeft,
  Link2,
  Smile,
  AtSign,
  ArrowUp,
  Tag,
  Check,
  Lock,
  ChevronDown,
  Edit3,
  Plus,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { CircleX } from "lucide-react";
import DialogModal, { DialogButton } from "@/components/modals/dialog-modal";
import { showSavedToast } from "@/lib/toast";
import ReassignTicketModal from "@/components/modals/reassign-ticket-modal";
import { EscalateTicketModal } from "@/app/super-admin/users/[id]/components/account-dialogs";
import { UserCog } from "lucide-react";

const defaultAgents = [
  {
    name: "Alex Turner",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100",
  },
  {
    name: "Sarah Connor",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
  },
  {
    name: "Michael Vance",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100",
  },
  {
    name: "Jessica Alba",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100",
  },
];

const defaultInternalNotes = [
  {
    id: 1,
    author: "Alex Turner",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100",
    role: "AGENT",
    time: "May 2, 2024 1:45 PM",
    text: "Customer is on Pro plan since Jan 2024. Checked server logs, OAuth token expired on Gmail API integration side. Awaiting screenshot verification.",
  },
  {
    id: 2,
    author: "Sarah Connor",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
    role: "AGENT",
    time: "May 2, 2024 2:15 PM",
    text: "Investigated permission scopes. Re-authenticating via OAuth settings will resolve this immediately.",
  },
];

const defaultTicket = {
  id: "#TKT-2849",
  status: "Open",
  priority: "High Priority",
  customer: {
    name: "John Smith",
    company: "Smith Realty Group",
    email: "john@smithrealty.com",
    avatar: "JS",
    plan: "Pro",
    accountId: "10293",
    memberSince: "Jan 15, 2024",
  },
  agent: {
    name: "Alex Turner",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100",
  },
  messages: [
    {
      id: 1,
      sender: "John Smith",
      role: "CUSTOMER",
      avatar: "JS",
      time: "May 2, 2024 1:15 PM",
      text: "Hi team, I'm trying to connect Gmail notifications but receive an authorization error.",
      attachment: {
        name: "screenshot_01.png",
        size: "184 KB",
      },
    },
    {
      id: 2,
      sender: "Alex Turner",
      role: "AGENT",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100",
      time: "May 2, 2024 1:40 PM",
      text: "Thank you for reaching out. Can you send a screenshot of the authorization error?",
    },
    {
      id: 3,
      sender: "John Smith",
      role: "CUSTOMER",
      avatar: "JS",
      time: "May 2, 2024 2:10 PM",
      text: "Sure, here is the screenshot.",
    },
  ],
  internalNotes: defaultInternalNotes,
};

export const InternalSupportTicketSidebar = ({
  isOpen = false,
  onClose,
  onNavigate,
  ticket = defaultTicket,
  // Admin portals add Reassign and use the Escalate dialog (Super Admin / Support designs)
  adminActions = false,
  // Live mode: { reply(text), addNote(text), update(changes), escalate(body) } call the API;
  // the parent then passes the saved ticket back in. Without it the drawer is a local preview.
  actions = null,
  // Staff who can take tickets: [{ id, name, openTickets }]
  agents = null,
}) => {
  const agentList = agents ?? defaultAgents;
  const run = async (fn, success) => {
    try {
      await fn();
      if (success) showSavedToast(success.title, success.text);
      return true;
    } catch (error) {
      toast.error(error.message || "Something went wrong.");
      return false;
    }
  };
  const [reassignOpen, setReassignOpen] = useState(false);
  const [escalateOpen, setEscalateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("conversation"); // 'conversation' | 'attachments' | 'internalNotes'
  const [replyText, setReplyText] = useState("");
  const [newNoteText, setNewNoteText] = useState("");

  const t = ticket || defaultTicket;

  const [ticketStatus, setTicketStatus] = useState(t.status || "Open");
  const [ticketPriority, setTicketPriority] = useState(
    t.priority
      ? t.priority.includes("Priority")
        ? t.priority
        : `${t.priority} Priority`
      : "High Priority"
  );
  const [currentAgent, setCurrentAgent] = useState(t.agent || t.assignedTo || (actions ? null : defaultAgents[0]));
  const [internalNotes, setInternalNotes] = useState(t.internalNotes ?? (actions ? [] : defaultInternalNotes));
  const [messages, setMessages] = useState(t.messages || defaultTicket.messages);

  const [isAssignDropdownOpen, setIsAssignDropdownOpen] = useState(false);
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);

  const assignDropdownRef = useRef(null);
  const priorityDropdownRef = useRef(null);

  // Reset local state when a different (or freshly saved) ticket comes in.
  // Done during render, as React recommends, instead of in an effect.
  const [shownTicket, setShownTicket] = useState(ticket);
  if (ticket && ticket !== shownTicket) {
    setShownTicket(ticket);
    setTicketStatus(ticket.status || "Open");
    setTicketPriority(ticket.priority ? (ticket.priority.includes("Priority") ? ticket.priority : `${ticket.priority} Priority`) : "High Priority");
    setCurrentAgent(ticket.agent || ticket.assignedTo || (actions ? null : defaultAgents[0]));
    setInternalNotes(ticket.internalNotes ?? (actions ? [] : defaultInternalNotes));
    setMessages(ticket.messages || defaultTicket.messages);
  }

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        assignDropdownRef.current &&
        !assignDropdownRef.current.contains(e.target)
      ) {
        setIsAssignDropdownOpen(false);
      }
      if (
        priorityDropdownRef.current &&
        !priorityDropdownRef.current.contains(e.target)
      ) {
        setIsPriorityDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape key + lock body scroll while drawer is open
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  const handleSendReply = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!replyText.trim()) return;
    if (actions) {
      const text = replyText.trim();
      run(() => actions.reply(text), { title: "Reply sent", text: "The customer can see it in their support tickets." }).then((ok) => ok && setReplyText(""));
      return;
    }

    const newMsg = {
      id: Date.now(),
      sender: currentAgent?.name || "Alex Turner",
      role: "AGENT",
      avatar:
        currentAgent?.avatar ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100",
      time: "Just now",
      text: replyText.trim(),
    };

    setMessages((prev) => [...prev, newMsg]);
    toast.success("Reply sent to customer");
    setReplyText("");
  };

  const handleAiSuggestedReply = () => {
    const customerName = t?.customer?.name || "there";
    const ticketSubject = t?.subject || "your inquiry";
    const suggestedResponse = `Hello ${customerName},\n\nThank you for reaching out to PitchProX Support regarding "${ticketSubject}".\n\nI have investigated your account details and verified all active settings. Everything is in order, and we have applied the necessary configuration updates. Please let us know if you need any additional assistance.\n\nBest regards,\nPitchProX Support Team`;
    setReplyText(suggestedResponse);
    toast.success("PitchProX AI Suggested Reply inserted. You can edit before sending.", {
      icon: "✨",
      duration: 3500,
    });
  };

  const handleAddInternalNote = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newNoteText.trim()) return;
    if (actions) {
      const text = newNoteText.trim();
      run(() => actions.addNote(text), { title: "Internal note added", text: "Only PitchProX staff can see it." }).then((ok) => ok && setNewNoteText(""));
      return;
    }

    const newNote = {
      id: Date.now(),
      author: currentAgent?.name || "Alex Turner",
      avatar: currentAgent?.avatar || defaultAgents[0].avatar,
      role: "AGENT",
      time: "Just now",
      text: newNoteText.trim(),
    };

    setInternalNotes((prev) => [...prev, newNote]);
    toast.success("Internal note added");
    setNewNoteText("");
  };

  const handleEscalate = () => {
    setTicketPriority("Urgent");
    setTicketStatus("In Progress");
    toast.success(`Ticket ${t.id} escalated to Tier 2 support`);
  };

  const handleSetPriority = (p) => {
    if (actions) {
      setIsPriorityDropdownOpen(false);
      run(() => actions.update({ priority: p.split(" ")[0].toLowerCase() }), { title: "Priority changed", text: `${t.id} is now ${p}.` });
      return;
    }
    setTicketPriority(p);
    setIsPriorityDropdownOpen(false);
    toast.success(`Priority changed to ${p}`);
  };

  const handleMarkResolved = () => {
    if (actions) {
      run(() => actions.update({ status: "Resolved" }), { title: "Ticket resolved", text: `Ticket ${t.id} was marked as resolved.` });
      return;
    }
    setTicketStatus("Resolved");
    showSavedToast("Ticket resolved", `Ticket ${t.id} was marked as resolved.`);
  };

  // Close asks for confirmation first (with an optional closing note)
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [closingNote, setClosingNote] = useState("");
  const handleCloseTicket = () => {
    setClosingNote("");
    setCloseDialogOpen(true);
  };
  const confirmCloseTicket = () => {
    if (actions) {
      run(() => actions.update({ status: "Closed", note: closingNote.trim() ? `Closing note: ${closingNote.trim()}` : undefined }), { title: "Ticket closed", text: `Ticket ${t.id} was closed.` }).then(
        (ok) => ok && setCloseDialogOpen(false)
      );
      return;
    }
    setTicketStatus("Closed");
    setCloseDialogOpen(false);
    toast.success(`Ticket ${t.id} closed successfully`);
  };

  const handleAssignAgent = (agent) => {
    if (actions) {
      setIsAssignDropdownOpen(false);
      run(() => actions.update({ assignedTo: agent.id }), { title: "Ticket assigned", text: `${t.id} is now assigned to ${agent.name}.` });
      return;
    }
    setCurrentAgent(agent);
    setIsAssignDropdownOpen(false);
    toast.success(`Assigned to ${agent.name}`);
  };

  // Status Badge Helper
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Open":
        return "bg-emerald-50 text-emerald-600 border border-emerald-100";
      case "In Progress":
      case "In progress":
        return "bg-blue-50 text-blue-600 border border-blue-100";
      case "Resolved":
        return "bg-emerald-50 text-emerald-600 border border-emerald-100";
      case "Closed":
        return "bg-light-gray text-light-black border border-light-black/20";
      default:
        return "bg-emerald-50 text-emerald-600 border border-emerald-100";
    }
  };

  // Priority Badge Helper
  const getPriorityBadgeStyle = (priority) => {
    if (priority.includes("High") || priority.includes("Urgent")) {
      return "bg-red/10 text-red border border-red/20";
    }
    if (priority.includes("Medium")) {
      return "bg-amber-50 text-amber-600 border border-amber-200";
    }
    return "bg-emerald-50 text-emerald-600 border border-emerald-100";
  };

  return (
    <>
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop Overlay ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-dark-black/50 backdrop-blur-sm h-screen"
          />

          {/* ── Right Side Drawer ── */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-label={`Ticket ${t.id}`}
            className="fixed inset-y-0 right-0 z-999 w-full max-w-lg bg-white shadow-2xl border-l border-light-gray flex flex-col"
          >
            {/* ── Top Header Bar ── */}
            <div className="px-6 pt-5 pb-3 flex flex-col gap-3">
              {/* Controls: Prev/Next & Close */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-light-black">
                  <button
                    type="button"
                    onClick={() => onNavigate?.(-1)}
                    className="hover:text-medium-black transition-colors cursor-pointer"
                    aria-label="Previous ticket"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate?.(1)}
                    className="hover:text-medium-black transition-colors cursor-pointer"
                    aria-label="Next ticket"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-light-black hover:text-dark-black p-1.5 rounded-lg hover:bg-light-gray transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Title with Status Badges */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <AtSign className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-dark-black">
                  Ticket {t.id}
                </h2>
                <div className="flex items-center gap-1.5 ml-1">
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium ${getStatusBadgeStyle(
                      ticketStatus
                    )}`}
                  >
                    {ticketStatus}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium ${getPriorityBadgeStyle(
                      ticketPriority
                    )}`}
                  >
                    {ticketPriority}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Content Scroll Area ── */}
            <div className="flex-1 px-6 overflow-y-auto space-y-4 pb-6">
              {/* Customer Meta Details Box */}
              <div className="bg-light-gray/60 rounded-2xl border border-light-gray p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-dark-teal text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {t.customer?.avatar || "JS"}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-dark-black leading-tight">
                      {t.customer?.name}
                    </h4>
                    <p className="text-xs text-light-black font-medium">
                      {t.customer?.company}
                    </p>
                    <a
                      href={`mailto:${t.customer?.email}`}
                      className="text-xs text-light-blue hover:underline block pt-0.5"
                    >
                      {t.customer?.email}
                    </a>
                  </div>
                </div>

                {/* Account Metadata */}
                <div className="text-left sm:text-right text-[11px] space-y-1 text-light-black">
                  <div>
                    <span>Plan</span>{" "}
                    <span className="font-bold text-medium-black ml-2">
                      {t.customer?.plan || "Pro"}
                    </span>
                  </div>
                  <div>
                    <span>Account ID</span>{" "}
                    <span className="font-bold text-medium-black ml-2">
                      {t.customer?.accountId || "10293"}
                    </span>
                  </div>
                  <div>
                    <span>Member Since</span>{" "}
                    <span className="font-bold text-medium-black ml-2">
                      {t.customer?.memberSince || "Jan 15, 2024"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Assigned Agent Row (Interactive Dropdown for Internal Role) */}
              <div className="flex items-center gap-2 text-xs text-light-black pl-1">
                <User className="w-3.5 h-3.5 text-light-black" />
                <span>Assigned to</span>
                <div className="relative" ref={assignDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsAssignDropdownOpen(!isAssignDropdownOpen)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-light-gray bg-white shadow-2xs hover:border-primary/40 cursor-pointer"
                  >
                    {currentAgent?.avatar || !actions ? (
                      <img
                        src={currentAgent?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"}
                        alt={currentAgent?.name || "Agent"}
                        className="w-4 h-4 rounded-full object-cover"
                      />
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-primary/10 text-primary text-[8px] font-bold flex items-center justify-center">{(currentAgent?.name ?? "?").charAt(0)}</span>
                    )}
                    <span className="font-semibold text-medium-black text-[11px]">
                      {currentAgent?.name || (actions ? "Unassigned" : "Alex Turner")}
                    </span>
                    <ChevronDown className="w-3 h-3 text-light-black ml-0.5" />
                  </button>

                  {/* Agent Selection Dropdown */}
                  {isAssignDropdownOpen && (
                    <div className="absolute left-0 mt-1.5 w-48 bg-white rounded-xl border border-light-gray shadow-lg p-1.5 z-30 space-y-1">
                      <p className="text-[10px] font-bold text-light-black uppercase px-2 py-1">
                        Assign to Agent
                      </p>
                      {agentList.map((agent) => (
                        <button
                          key={agent.name}
                          type="button"
                          onClick={() => handleAssignAgent(agent)}
                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors text-left cursor-pointer ${
                            currentAgent?.name === agent.name
                              ? "bg-primary/10 text-primary"
                              : "text-dark-black hover:bg-light-gray"
                          }`}
                        >
                          {agent.avatar ? (
                            <img src={agent.avatar} alt={agent.name} className="w-5 h-5 rounded-full object-cover" />
                          ) : (
                            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[9px] font-bold flex items-center justify-center">{agent.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>
                          )}
                          <span>{agent.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Tabs (Conversation / Attachments / Internal Notes) */}
              <div className="border-b border-light-gray pt-2">
                <nav className="flex items-center gap-6 overflow-x-auto no-scrollbar">
                  <button
                    type="button"
                    onClick={() => setActiveTab("conversation")}
                    className={`pb-2 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer shrink-0 ${
                      activeTab === "conversation"
                        ? "border-primary text-primary"
                        : "border-transparent text-light-black hover:text-primary"
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Conversation</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("attachments")}
                    className={`pb-2 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer shrink-0 ${
                      activeTab === "attachments"
                        ? "border-primary text-primary"
                        : "border-transparent text-light-black hover:text-primary"
                    }`}
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>Attachments (1)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("internalNotes")}
                    className={`pb-2 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer shrink-0 ${
                      activeTab === "internalNotes"
                        ? "border-primary text-primary"
                        : "border-transparent text-light-black hover:text-primary"
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Internal Notes ({internalNotes.length})</span>
                  </button>
                </nav>
              </div>

              {/* ── Conversation Thread ── */}
              {activeTab === "conversation" && (
                <div className="space-y-4 pt-1">
                  {messages &&
                    messages.map((msg) => (
                      <div key={msg.id} className="space-y-2">
                        {/* Sender Info Row */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {/* Avatar */}
                            {msg.role === "CUSTOMER" ? (
                              <div className="w-6 h-6 rounded-full bg-dark-teal text-white flex items-center justify-center font-bold text-[10px]">
                                {msg.avatar}
                              </div>
                            ) : (
                              <img
                                src={
                                  msg.avatar ||
                                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"
                                }
                                alt={msg.sender}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            )}

                            <span className="text-xs font-bold text-dark-black">
                              {msg.sender}
                            </span>

                            {/* Badge */}
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase ${
                                msg.role === "AGENT"
                                  ? "bg-primary/10 text-primary"
                                  : "bg-light-gray text-light-black"
                              }`}
                            >
                              {msg.role}
                            </span>
                          </div>

                          <span className="text-[10px] text-light-black">
                            {msg.time}
                          </span>
                        </div>

                        {/* Message Content Bubble */}
                        <div
                          className={`ml-8 p-3.5 rounded-2xl border text-xs leading-relaxed ${
                            msg.role === "AGENT"
                              ? "bg-primary/5 border-primary/20 text-medium-black"
                              : "bg-white border-light-gray text-medium-black shadow-2xs"
                          }`}
                        >
                          <p>{msg.text}</p>

                          {/* Attached File Box */}
                          {msg.attachment && (
                            <div className="mt-3 flex items-center justify-between p-2.5 rounded-xl bg-light-gray/60 border border-light-gray">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-white border border-light-gray flex items-center justify-center text-light-black shrink-0">
                                  <Paperclip className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-medium-black">
                                    {msg.attachment.name}
                                  </p>
                                  <p className="text-[10px] text-light-black">
                                    {msg.attachment.size}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 text-light-black">
                                <button
                                  type="button"
                                  onClick={() =>
                                    msg.attachment.url ? window.open(msg.attachment.url, "_blank", "noopener") : toast.success("Opening preview")
                                  }
                                  className="hover:text-medium-black transition-colors p-1 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    msg.attachment.url ? window.location.assign(msg.attachment.url) : toast.success("Downloading file")
                                  }
                                  className="hover:text-medium-black transition-colors p-1 cursor-pointer"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                  {/* ── Reply Editor Section ── */}
                  <div className="pt-2 space-y-2">
                    <span className="text-[11px] font-bold text-light-black uppercase tracking-wider block">
                      REPLY TO CUSTOMER
                    </span>

                    <div className="border border-light-gray rounded-2xl overflow-hidden bg-white shadow-2xs">
                      {/* Rich Text Toolbar */}
                      <div className="px-3 py-2 border-b border-light-gray flex items-center gap-3 text-light-black text-xs">
                        <button
                          type="button"
                          onClick={() => setReplyText((p) => p + " **bold** ")}
                          className="hover:text-medium-black cursor-pointer"
                        >
                          <Bold className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setReplyText((p) => p + " *italic* ")}
                          className="hover:text-medium-black cursor-pointer"
                        >
                          <Italic className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setReplyText((p) => p + " __underline__ ")
                          }
                          className="hover:text-medium-black cursor-pointer"
                        >
                          <Underline className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-px h-3 bg-light-gray" />
                        <button
                          type="button"
                          onClick={() => setReplyText((p) => p + "\n- ")}
                          className="hover:text-medium-black cursor-pointer"
                        >
                          <List className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setReplyText((p) => p + " ")}
                          className="hover:text-medium-black cursor-pointer"
                        >
                          <AlignLeft className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-px h-3 bg-light-gray" />
                        <button
                          type="button"
                          onClick={() =>
                            setReplyText((p) => p + " [link](https://) ")
                          }
                          className="hover:text-medium-black cursor-pointer"
                        >
                          <Link2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setReplyText((p) => p + " 😊 ")}
                          className="hover:text-medium-black cursor-pointer"
                        >
                          <Smile className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Textarea */}
                      <textarea
                        rows={4}
                        placeholder="Type your reply to customer..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="w-full p-3.5 text-xs text-dark-black placeholder:text-light-black focus:outline-none resize-none"
                      />

                      {/* Editor Bottom Actions */}
                      <div className="p-3 border-t border-light-gray flex items-center justify-between">
                        <div className="flex items-center gap-3 text-light-black">
                          <button
                            type="button"
                            onClick={() =>
                              toast.success("Attachment picker opened")
                            }
                            className="hover:text-medium-black cursor-pointer"
                          >
                            <Paperclip className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setReplyText((p) => p + " 👍 ")}
                            className="hover:text-medium-black cursor-pointer"
                          >
                            <Smile className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          <button
                            type="button"
                            onClick={handleAiSuggestedReply}
                            className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-2xs"
                            title="Generate AI response for review (editable)"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                            <span>PitchProX AI Suggested Reply</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleSendReply}
                            className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-medium-teal text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Send Reply</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Quick Actions Section (Internal Sales Representative Role) ── */}
                  <div className="pt-3 space-y-2.5">
                    <span className="text-[11px] font-bold text-light-black uppercase tracking-wider block">
                      QUICK ACTIONS
                    </span>

                    <div className={`grid gap-2.5 ${adminActions ? "grid-cols-3" : "grid-cols-2"}`}>
                      {adminActions && (
                        <button
                          type="button"
                          onClick={() => setReassignOpen(true)}
                          className="px-3.5 py-2.5 rounded-xl border border-light-gray bg-white hover:bg-light-gray/60 text-dark-black/85 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
                        >
                          <UserCog className="w-3.5 h-3.5 text-light-black" />
                          <span>Reassign</span>
                        </button>
                      )}
                      {/* Escalate */}
                      <button
                        type="button"
                        onClick={adminActions || actions ? () => setEscalateOpen(true) : handleEscalate}
                        className="px-3.5 py-2.5 rounded-xl border border-light-gray bg-white hover:bg-light-gray/60 text-dark-black/85 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
                      >
                        <ArrowUp className="w-3.5 h-3.5 text-light-black" />
                        <span>Escalate</span>
                      </button>

                      {/* Change Priority */}
                      <div className="relative" ref={priorityDropdownRef}>
                        <button
                          type="button"
                          onClick={() =>
                            setIsPriorityDropdownOpen(!isPriorityDropdownOpen)
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray bg-white hover:bg-light-gray/60 text-dark-black/85 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
                        >
                          <Tag className="w-3.5 h-3.5 text-light-black" />
                          <span>Change Priority</span>
                        </button>

                        {isPriorityDropdownOpen && (
                          <div className="absolute bottom-full mb-1.5 left-0 right-0 bg-white rounded-xl border border-light-gray shadow-lg p-1.5 z-30 space-y-1">
                            <p className="text-[10px] font-bold text-light-black uppercase px-2 py-1">
                              Select Priority
                            </p>
                            {[
                              "Urgent",
                              "High Priority",
                              "Medium Priority",
                              "Low Priority",
                            ].map((p) => (
                              <button
                                key={p}
                                type="button"
                                onClick={() => handleSetPriority(p)}
                                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                  ticketPriority === p
                                    ? "bg-primary/10 text-primary"
                                    : "text-dark-black hover:bg-light-gray"
                                }`}
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Mark Resolved */}
                      <button
                        type="button"
                        onClick={handleMarkResolved}
                        className="px-3.5 py-2.5 rounded-xl border border-primary bg-white hover:bg-primary/5 text-primary text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
                      >
                        <Check className="w-3.5 h-3.5 text-primary" />
                        <span>Mark Resolved</span>
                      </button>

                      {/* Close Ticket */}
                      <button
                        type="button"
                        onClick={handleCloseTicket}
                        className="px-3.5 py-2.5 rounded-xl bg-red hover:bg-red/90 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
                      >
                        <Lock className="w-3.5 h-3.5 text-white" />
                        <span>Close Ticket</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Internal Notes Tab View ── */}
              {activeTab === "internalNotes" && (
                <div className="space-y-4 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-light-black uppercase tracking-wider block">
                      INTERNAL TEAM NOTES ({internalNotes.length})
                    </span>
                    <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md font-semibold border border-amber-200/60">
                      Internal Only
                    </span>
                  </div>

                  {/* Notes List */}
                  <div className="space-y-3">
                    {internalNotes.map((note) => (
                      <div key={note.id} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src={
                                note.avatar ||
                                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"
                              }
                              alt={note.author}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                            <span className="text-xs font-bold text-dark-black">
                              {note.author}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-light-gray text-light-black">
                              {note.role || "AGENT"}
                            </span>
                          </div>
                          <span className="text-[10px] text-light-black">
                            {note.time}
                          </span>
                        </div>

                        <div className="ml-7 p-3 rounded-2xl bg-amber-50/40 border border-amber-200/60 text-xs text-dark-black/85 leading-relaxed shadow-2xs">
                          <p>{note.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Note Composer */}
                  <div className="pt-2 space-y-2">
                    <span className="text-[11px] font-bold text-light-black uppercase tracking-wider block">
                      ADD INTERNAL NOTE
                    </span>

                    <div className="border border-light-gray rounded-2xl overflow-hidden bg-white shadow-2xs">
                      <textarea
                        rows={3}
                        placeholder="Write a private note for your team (not visible to customer)..."
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        className="w-full p-3.5 text-xs text-dark-black placeholder:text-light-black focus:outline-none resize-none"
                      />

                      <div className="p-3 border-t border-light-gray flex items-center justify-between bg-light-gray/20">
                        <span className="text-[10px] text-light-black italic">
                          Visible only to internal staff
                        </span>

                        <button
                          type="button"
                          onClick={handleAddInternalNote}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary hover:bg-medium-teal text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Note</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Attachments Tab View ── */}
              {activeTab === "attachments" && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-light-gray/60 border border-light-gray">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white border border-light-gray flex items-center justify-center text-light-black shrink-0">
                        <Paperclip className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-medium-black">
                          screenshot_01.png
                        </p>
                        <p className="text-[10px] text-light-black">184 KB</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-light-black">
                      <button
                        type="button"
                        onClick={() => toast.success("Opening preview")}
                        className="hover:text-medium-black p-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toast.success("Downloading file")}
                        className="hover:text-medium-black p-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>

    {(adminActions || actions) && (
      <>
        <ReassignTicketModal
          key={reassignOpen ? `reassign-${t.id}` : "reassign-closed"}
          isOpen={reassignOpen}
          onClose={() => setReassignOpen(false)}
          ticketId={t.id}
          subject={t.subject}
          currentAgentName={currentAgent?.name}
          agents={agents ? agents.map((agent) => ({ id: agent.id, name: agent.name, role: agent.jobTitle ?? "Support Agent", open: Number(agent.openTickets ?? 0), available: true })) : undefined}
          onReassign={(agent) => {
            if (actions) {
              run(() => actions.update({ assignedTo: agent.id }), { title: "Ticket reassigned", text: `${t.id} is now assigned to ${agent.name}.` });
              return;
            }
            setCurrentAgent({ name: agent.name, avatar: agent.avatar });
            showSavedToast("Ticket reassigned", `${t.id} is now assigned to ${agent.name}.`);
          }}
        />
        <EscalateTicketModal
          key={escalateOpen ? `escalate-${t.id}` : "escalate-closed"}
          ticketId={escalateOpen ? t.id : null}
          onClose={() => setEscalateOpen(false)}
          managers={agents ? agents.filter((agent) => agent.name !== currentAgent?.name).map((agent) => ({ value: agent.id, label: agent.name })) : undefined}
          onConfirm={async ({ manager, priority, reason }) => {
            if (actions) {
              await actions.escalate({ assignedTo: manager, priority: priority.toLowerCase(), reason });
              return;
            }
            setTicketPriority(priority);
            setTicketStatus("In Progress");
          }}
        />
      </>
    )}
    <DialogModal
      isOpen={closeDialogOpen}
      onClose={() => setCloseDialogOpen(false)}
      title="Close this ticket?"
      size="sm"
      footer={
        <>
          <DialogButton onClick={() => setCloseDialogOpen(false)}>Cancel</DialogButton>
          <DialogButton variant="danger" onClick={confirmCloseTicket}>Close Ticket</DialogButton>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <CircleX className="w-6 h-6" />
          </div>
          <p className="text-sm leading-5 text-medium-black pt-1">
            Ticket {t.id} will be closed and the customer is notified.
          </p>
        </div>
        <div>
          <label htmlFor="closing-note" className="block text-xs font-medium text-medium-black mb-2">Closing note (optional)</label>
          <textarea
            id="closing-note"
            rows={3}
            value={closingNote}
            onChange={(event) => setClosingNote(event.target.value)}
            placeholder="Add a short note"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-dark-black placeholder:text-gray-500 outline-none focus:border-primary resize-none"
          />
        </div>
      </div>
    </DialogModal>
    </>
  );
};

export default InternalSupportTicketSidebar;