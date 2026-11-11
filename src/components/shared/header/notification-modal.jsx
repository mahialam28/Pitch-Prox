"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  MoreVertical,
  ShieldCheck,
  AlertTriangle,
  GraduationCap,
  MessageSquare,
  LifeBuoy,
  CheckCircle2,
  UserPlus,
  Bell,
  Check,
  Trash2,
} from "lucide-react";
import { apiRequest } from "@/lib/client-api";
import { motion, AnimatePresence } from "framer-motion";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";

// "2m ago", "3h ago", "Yesterday", "Nov 3"; `now` is when the list was loaded
const timeAgo = (value, now) => {
  const minutes = Math.max(0, Math.round((now - new Date(value).getTime()) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  if (hours < 48) return "Yesterday";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// Real notifications (GET /api/v1/notifications). onUnreadChange keeps the bell's badge in step.
const NotificationsDropdown = ({ isOpen, onClose, onUnreadChange = () => {} }) => {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [loadedAt, setLoadedAt] = useState(0);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const menuRef = useRef(null);
  const panelRef = useRef(null);

  // Load the latest each time the panel opens (state updates happen after the request, not in the effect body)
  useEffect(() => {
    if (!isOpen) return undefined;
    let cancelled = false;
    const timer = setTimeout(() => !cancelled && setLoading(true), 0);
    apiRequest("/api/v1/notifications?limit=20")
      .then((result) => {
        if (cancelled) return;
        setNotifications(result.results);
        setHasMore(result.hasMore);
        setLoadedAt(Date.now());
        setLoadError("");
        onUnreadChange(result.unreadCount);
      })
      .catch((error) => !cancelled && setLoadError(error.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isOpen, onUnreadChange]);

  const loadOlder = async () => {
    const last = notifications[notifications.length - 1];
    if (!last) return;
    try {
      const result = await apiRequest(`/api/v1/notifications?limit=20&before=${encodeURIComponent(last.createdAt)}`);
      setNotifications((prev) => [...prev, ...result.results.filter((item) => !prev.some((existing) => existing.id === item.id))]);
      setHasMore(result.hasMore);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      // Use click event instead of mousedown so the bell toggle fires first
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen, onClose]);

  // Close context menu when clicking outside
  useEffect(() => {
    if (activeMenuId === null) return;

    const handleMenuClickOutside = (event) => {

      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    };

    // Delay adding listener so current click doesn't immediately close
    const timer = setTimeout(() => {
      // Use click instead of mousedown so the three-dots toggle fires first
      document.addEventListener("click", handleMenuClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleMenuClickOutside);
    };
  }, [activeMenuId]);

  const handleMarkAllAsRead = async () => {
    try {
      await apiRequest("/api/v1/notifications/read-all", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
      onUnreadChange(0);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleMarkAsRead = async (id, read = true) => {
    setActiveMenuId(null);
    try {
      const result = await apiRequest(`/api/v1/notifications/${id}`, { method: "PATCH", body: { read } });
      setNotifications((prev) => prev.map((n) => (n.id === id ? result.notification : n)));
      onUnreadChange(result.unreadCount);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id) => {
    setActiveMenuId(null);
    try {
      const result = await apiRequest(`/api/v1/notifications/${id}`, { method: "DELETE" });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      onUnreadChange(result.unreadCount);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Opening a notification marks it read and goes to the page it's about
  const handleOpen = (item) => {
    if (item.isUnread) handleMarkAsRead(item.id);
    if (item.link) {
      onClose();
      router.push(item.link);
    }
  };

  const getIconConfig = (type) => {
    switch (type) {
      case "policy":
        return { icon: ShieldCheck, bg: "bg-orange-100", text: "text-orange-600" };
      case "training":
        return { icon: GraduationCap, bg: "bg-blue-100", text: "text-blue-600" };
      case "incident":
        return { icon: AlertTriangle, bg: "bg-red/10", text: "text-red" };
      case "coaching":
        return { icon: MessageSquare, bg: "bg-purple-100", text: "text-purple-600" };
      case "ticket":
        return { icon: LifeBuoy, bg: "bg-light-teal", text: "text-primary" };
      case "approval":
        return { icon: CheckCircle2, bg: "bg-emerald-50", text: "text-emerald-600" };
      case "lead":
        return { icon: UserPlus, bg: "bg-blue-100", text: "text-blue-600" };
      case "privacy":
        return { icon: ShieldCheck, bg: "bg-red/10", text: "text-red" };
      default:
        return { icon: Bell, bg: "bg-light-gray", text: "text-medium-black" };
    }
  };

  const unreadCount = notifications.filter((n) => n.isUnread).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="fixed left-4 right-4 top-[4.5rem] sm:absolute sm:right-0 sm:left-auto sm:top-full sm:mt-2 z-50 w-auto sm:w-[400px]"
          style={{ transformOrigin: "top right" }}
        >
          <div className="bg-white rounded-2xl border border-light-gray shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-5 pt-4 sm:pt-5 pb-3 border-b border-light-gray/60">
              <div className="flex items-center gap-2 min-w-0">
                <Title variant="small" className="!text-base sm:!text-lg !text-dark-black/80 !font-bold truncate">
                  Notifications
                </Title>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-[11px] font-medium rounded-full shrink-0">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <button
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
                className="text-[11px] font-medium text-primary hover:text-medium-teal transition-colors cursor-pointer shrink-0"
              >
                Mark all read
              </button>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto divide-y divide-light-gray/60">
              {loadError ? (
                <div className="p-8 text-center">
                  <Text variant="small" className="!font-normal !text-red">
                    {loadError}
                  </Text>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Text variant="small" className="!font-normal">
                    {loading ? "Loading…" : "You're all caught up. Nothing new."}
                  </Text>
                </div>
              ) : (
                notifications.map((item) => {
                  const config = getIconConfig(item.type);
                  const IconComponent = config.icon;
                  return (
                    <div
                      key={item.id}
                      className={`flex items-start gap-2 sm:gap-3 p-3 sm:p-4 px-4 sm:px-5 relative border border-transparent transition-colors hover:border-primary/30 hover:bg-primary/5 ${
                        item.isUnread ? "bg-white" : "bg-white/80"
                      }`}
                    >
                      {/* Unread dot */}
                      <div className="w-1.5 flex-shrink-0 pt-3 sm:pt-4 self-start flex justify-center">
                        {item.isUnread && (
                          <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                        )}
                      </div>

                      {/* Icon */}
                      <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full ${config.bg} ${config.text} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 stroke-[2.25]" />
                      </div>

                      {/* Content: opens the page it's about (and marks it read) */}
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => handleOpen(item)}
                        onKeyDown={(event) => (event.key === "Enter" || event.key === " ") && (event.preventDefault(), handleOpen(item))}
                        className="flex-1 min-w-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-md"
                      >
                        <div className="flex items-baseline justify-between gap-1.5 sm:gap-2">
                          <Title variant="small" className="!text-sm !text-dark-black/80 !font-bold line-clamp-2 break-words">
                            {item.title}
                          </Title>
                          <Text variant="smaller" className="!font-normal !text-light-black flex-shrink-0 whitespace-nowrap">
                            {timeAgo(item.createdAt, loadedAt)}
                          </Text>
                        </div>
                        {item.body && (
                          <Text variant="smaller" className="!font-normal leading-relaxed mt-0.5 line-clamp-2">
                            {item.body}
                          </Text>
                        )}
                      </div>

                      {/* Three dots menu */}
                      <div className="relative flex-shrink-0 self-start pt-0.5">
                        <button
                          aria-label="Notification options"
                          onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                          className="p-1 rounded-md text-light-black hover:text-medium-black hover:bg-light-gray transition-all cursor-pointer"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {activeMenuId === item.id && (
                          <div
                            ref={menuRef}
                            className="absolute right-0 mt-1 w-40 bg-white rounded-xl border border-light-gray shadow-xl py-1.5 z-10"
                          >
                            <button
                              onClick={() => handleMarkAsRead(item.id, item.isUnread)}
                              className="w-full px-3 py-2 text-left text-xs font-medium text-medium-black hover:bg-light-gray flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <Check className="h-3.5 w-3.5 text-primary" />
                              {item.isUnread ? "Mark as read" : "Mark as unread"}
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}className="w-full px-3 py-2 text-left text-xs font-medium text-red hover:bg-red/5 flex items-center gap-2 transition-colors cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer: older notifications (kept 90 days once read) */}
            {hasMore && (
              <div className="border-t border-light-gray/60 p-3 sm:p-4 text-center bg-white">
                <button onClick={loadOlder} className="text-xs font-bold text-primary hover:text-medium-teal transition-colors w-full py-1 cursor-pointer">
                  Show older notifications
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationsDropdown;
