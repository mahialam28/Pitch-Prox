"use client";

import React, { useState, useEffect } from "react";
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
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

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
};

// `onReply(text)` saves a reply (sample-data screens leave it out); `showAiReply`
// hides the staff-only AI button on customer screens.
export const SupportTicketSidebar = ({
  isOpen = false,
  onClose,
  onNavigate,
  onReply,
  showAiReply = true,
  ticket = defaultTicket,
}) => {
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState("conversation"); // 'conversation' | 'attachments'
  const [replyText, setReplyText] = useState("");

  const t = ticket || defaultTicket;

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

  const handleSendReply = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!replyText.trim() || sending) return;
    if (!onReply) {
      toast.success("Reply sent to customer");
      setReplyText("");
      return;
    }
    setSending(true);
    try {
      await onReply(replyText.trim());
      setReplyText("");
      toast.success("Reply sent");
    } catch (error) {
      toast.error(error.message || "Reply not sent");
    } finally {
      setSending(false);
    }
  };

  // Real attachments carry a download url; sample ones only show a notice
  const openAttachment = (attachment) => {
    if (attachment?.url) window.open(attachment.url, "_blank", "noopener");
    else toast.success("Downloading file");
  };
  const attachments = (t.messages || []).filter((msg) => msg.attachment).map((msg) => msg.attachment);

  const handleAiSuggestedReply = () => {
    const customerName = t?.customer?.name || "there";
    const ticketSubject = t?.subject || "your inquiry";
    const suggestedResponse = `Hello ${customerName},\n\nThank you for reaching out to PitchProX Support regarding "${ticketSubject}".\n\nI have reviewed your account configuration and verified the parameters. Everything is running smoothly, and we have applied the necessary updates to ensure optimal performance. Please let us know if you have any questions.\n\nBest regards,\nPitchProX Support Team`;
    setReplyText(suggestedResponse);
    toast.success("AI suggested reply inserted. You can edit it before sending.", {
      icon: "✨",
      duration: 3500,
    });
  };

  return (
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
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
                    {t.status}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-red/10 text-red border border-red/20">
                    {t.priority}
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

              {/* Assigned Agent Row */}
              <div className="flex items-center gap-2 text-xs text-light-black pl-1">
                <User className="w-3.5 h-3.5 text-light-black" />
                <span>Assigned to</span>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-light-gray bg-white shadow-sm">
                  <img
                    src={
                      t.agent?.avatar ||
                      t.assignedTo?.avatar ||
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"
                    }
                    alt={t.agent?.name || t.assignedTo?.name || "Agent"}
                    className="w-4 h-4 rounded-full object-cover"
                  />
                  <span className="font-semibold text-medium-black text-[11px]">
                    {t.agent?.name || t.assignedTo?.name || "Alex Turner"}
                  </span>
                </div>
              </div>

              {/* Navigation Tabs (Conversation / Attachments) */}
              <div className="border-b border-light-gray pt-2">
                <nav className="flex items-center gap-6">
                  <button
                    type="button"
                    onClick={() => setActiveTab("conversation")}
                    className={`pb-2 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${activeTab === "conversation"
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
                    className={`pb-2 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${activeTab === "attachments"
                      ? "border-primary text-primary"
                      : "border-transparent text-light-black hover:text-primary"
                      }`}
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>Attachments (1)</span>
                  </button>
                </nav>
              </div>

              {/* ── Conversation Thread ── */}
              {activeTab === "conversation" && (
                <div className="space-y-4 pt-1">
                  {t.messages &&
                    t.messages.map((msg) => (
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
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-light-gray text-light-black">
                              {msg.role}
                            </span>
                          </div>

                          <span className="text-[10px] text-light-black">
                            {msg.time}
                          </span>
                        </div>

                        {/* Message Content Bubble */}
                        <div
                          className={`ml-8 p-3.5 rounded-2xl border text-xs leading-relaxed ${msg.role === "AGENT"
                            ? "bg-primary/5 border-primary/20 text-medium-black"
                            : "bg-white border-light-gray text-medium-black shadow-sm"
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
                                  onClick={() => openAttachment(msg.attachment)}
                                  className="hover:text-medium-black transition-colors p-1 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openAttachment(msg.attachment)}
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
                      REPLY TO SUPPORT
                    </span>

                    <div className="border border-light-gray rounded-2xl overflow-hidden bg-white shadow-sm">
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
                          onClick={() => setReplyText((p) => p + " __underline__ ")}
                          className="hover:text-medium-black cursor-pointer"
                        >
                          <Underline className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-px h-3 bg-light-black" />
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
                        <span className="w-px h-3 bg-light-black" />
                        <button
                          type="button"
                          onClick={() => setReplyText((p) => p + " [link](https://) ")}
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
                        placeholder="Type your reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="w-full p-3.5 text-xs text-dark-black placeholder:text-light-black focus:outline-none resize-none"
                      />

                      {/* Editor Bottom Actions */}
                      <div className="p-3 border-t border-light-gray flex items-center justify-between">
                        <div className="flex items-center gap-3 text-light-black">
                          <button
                            type="button"
                            onClick={() => toast.success("Attachment picker opened")}
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
                          {showAiReply && (
                          <button
                            type="button"
                            onClick={handleAiSuggestedReply}
                            className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-2xs"
                            title="Generate AI response for review (editable)"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                            <span>PitchProX AI Suggested Reply</span>
                          </button>
                          )}

                          <button
                            type="button"
                            onClick={handleSendReply}
                            disabled={sending}
                            className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-medium-teal text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{sending ? "Sending…" : "Send Reply"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Attachments Tab View ── */}
              {activeTab === "attachments" && (
                <div className="space-y-3 pt-1">
                  {attachments.length === 0 && (
                    <p className="text-xs text-light-black text-center py-6">No attachments on this ticket.</p>
                  )}
                  {attachments.map((attachment, index) => (
                  <div key={`${attachment.name}-${index}`} className="flex items-center justify-between p-3 rounded-xl bg-light-gray/60 border border-light-gray">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white border border-light-gray flex items-center justify-center text-light-black shrink-0">
                        <Paperclip className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-medium-black">
                          {attachment.name}
                        </p>
                        <p className="text-[10px] text-light-black">{attachment.size}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-light-black">
                      <button
                        type="button"
                        onClick={() => openAttachment(attachment)}
                        className="hover:text-medium-black p-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openAttachment(attachment)}
                        className="hover:text-medium-black p-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SupportTicketSidebar;
