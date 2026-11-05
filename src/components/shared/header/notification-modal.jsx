"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MoreVertical,
  DollarSign,
  Mail,
  ShieldCheck,
  Zap,
  UserPlus,
  AlertTriangle,
  Calendar,
  Check,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";

const initialNotifications = [
  {
    id: "1",
    title: "Failed payment detected",
    description: "3 failed retry attempts detected on account ACC-2031.",
    time: "2m ago",
    isUnread: true,
    type: "payment",
  },
  {
    id: "2",
    title: "Campaign delivery completed",
    description: '"Product Update - May" was sent successfully to 4,685 recipients.',
    time: "15m ago",
    isUnread: true,
    type: "campaign",
  },
  {
    id: "3",
    title: "Compliance acknowledgment pending",
    description: "New SOC 2 policy acknowledgment is awaiting your review.",
    time: "1h ago",
    isUnread: true,
    type: "compliance",
  },
  {
    id: "4",
    title: "AI guidance latency spike",
    description: "High latency detected in prompt responses for last 30 minutes.",
    time: "2h ago",
    isUnread: true,
    type: "latency",
  },
  {
    id: "5",
    title: "New user signed up",
    description: "John Smith just signed up for a ProX plan.",
    time: "3h ago",
    isUnread: true,
    type: "user",
  },
  {
    id: "6",
    title: "Suspicious login detected",
    description: "New login from unknown device in Chicago, IL.",
    time: "Yesterday",
    isUnread: false,
    type: "security",
  },
  {
    id: "7",
    title: "Scheduled maintenance",
    description: "System maintenance scheduled for May 22, 2:00 - 4:00 AM UTC.",
    time: "Yesterday",
    isUnread: false,
    type: "maintenance",
  },
];

const NotificationsDropdown = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const menuRef = useRef(null);
  const panelRef = useRef(null);


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

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
  };

  const handleMarkAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isUnread: false } : n))
    );
    setActiveMenuId(null);
  };

  const handleDelete = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setActiveMenuId(null);
  };

  const getIconConfig = (type) => {
    switch (type) {
      case "payment":
        return { icon: DollarSign, bg: "bg-light-teal", text: "text-primary" };
      case "campaign":
        return { icon: Mail, bg: "bg-blue-100", text: "text-blue-600" };
      case "compliance":
        return { icon: ShieldCheck, bg: "bg-orange-100", text: "text-orange-600" };
      case "latency":
        return { icon: Zap, bg: "bg-purple-100", text: "text-purple-600" };
      case "user":
        return { icon: UserPlus, bg: "bg-blue-100", text: "text-indigo-600" };
      case "security":
        return { icon: AlertTriangle, bg: "bg-red/10", text: "text-red" };
      case "maintenance":
        return { icon: Calendar, bg: "bg-light-teal", text: "text-primary" };
      default:
        return { icon: Mail, bg: "bg-light-gray", text: "text-medium-black" };
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
                className="text-[11px] font-medium text-primary hover:text-medium-teal transition-colors cursor-pointer shrink-0"
              >
                Mark all read
              </button>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto divide-y divide-light-gray/60">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Text variant="small" className="!font-normal">
                    No notifications available
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

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-1.5 sm:gap-2">
                          <Title variant="small" className="!text-sm !text-dark-black/80 !font-bold truncate">
                            {item.title}
                          </Title>
                          <Text variant="smaller" className="!font-normal !text-light-black flex-shrink-0 whitespace-nowrap">
                            {item.time}
                          </Text>
                        </div>
                        <Text variant="smaller" className="!font-normal leading-relaxed mt-0.5">
                          {item.description}
                        </Text>
                      </div>

                      {/* Three dots menu */}
                      <div className="relative flex-shrink-0 self-start pt-0.5">
                        <button
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
                            {item.isUnread && (
                              <button
                                onClick={() => handleMarkAsRead(item.id)}className="w-full px-3 py-2 text-left text-xs font-medium text-medium-black hover:bg-light-gray flex items-center gap-2 transition-colors cursor-pointer"
                                >
                                  <Check className="h-3.5 w-3.5 text-primary" />
                                  Mark as read
                              </button>
                            )}
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

            {/* Footer */}
            <div className="border-t border-light-gray/60 p-3 sm:p-4 text-center bg-white">
              <button className="text-xs font-bold text-primary hover:text-medium-teal transition-colors w-full py-1 cursor-pointer">
                View all notifications
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationsDropdown;
