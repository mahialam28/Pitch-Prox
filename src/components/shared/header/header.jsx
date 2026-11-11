"use client";

import React, { useState } from "react";
import { Search, Bell, Phone, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import NotificationsDropdown from "@/components/shared/header/notification-modal";
import { useUnreadNotifications } from "@/components/shared/header/use-unread-notifications";
import LiveCallingModal from "@/app/user/live-calling/components/live-calling-modal";
import {
  PENDING_CALL_KEY,
  PENDING_CALL_EVENT,
} from "@/utils.js/call-constants";

// ── Animation Variants ──────────────────────────────────────────────────────

const headerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.25,
      ease: "easeOut",
    },
  },
};

const iconButtonVariants = {
  hover: { scale: 1.08 },
  tap: { scale: 0.92 },
};

const ctaButtonVariants = {
  hover: {
    scale: 1.04,
    transition: { type: "spring", stiffness: 400, damping: 10 },
  },
  tap: { scale: 0.95 },
};

const badgePulse = {
  animate: {
    scale: [1, 1.12, 1],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// ── Component ───────────────────────────────────────────────────────────────

const Header = ({
  leftContent = null,
  notifOpen = false,
  onSearchClick = () => {},
  onNotificationClick = () => {},
  onCloseNotif = () => {},
  onToggleSidebar = () => {},
  isSidebarOpen = false,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const { unreadCount, setUnreadCount } = useUnreadNotifications();

  const isInternalRole = pathname?.startsWith("/internal-sales-representative");
  const canCall = !pathname?.startsWith("/super-admin");

  // Called when the user submits the Start Call modal in the header.
  // Persist the filled setup, tell any already-mounted StartCall to begin,
  // then navigate to the live-calling page where the call starts.
  const handleStartCall = (setup) => {
    try {
      sessionStorage.setItem(PENDING_CALL_KEY, JSON.stringify(setup || {}));
    } catch {
      /* sessionStorage unavailable — continue without prefill */
    }
    window.dispatchEvent(new CustomEvent(PENDING_CALL_EVENT));
    setIsCallModalOpen(false);
    const targetRoute = isInternalRole
      ? "/internal-sales-representative/live-calling"
      : "/user/live-calling";
    router.push(targetRoute);
  };

  return (
    <>
      <motion.header
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="sticky top-0 z-40 flex h-16 items-center justify-between bg-white px-3 sm:px-6 lg:px-8 border-b border-light-gray"
      >
        {/* Left side — hamburger on mobile + custom content */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile hamburger */}
          <button
            onClick={onToggleSidebar}
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-light-gray text-medium-black hover:bg-light-gray transition-colors cursor-pointer lg:hidden shrink-0"
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <motion.span
              animate={{ rotate: isSidebarOpen ? 90 : 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 16 }}
              className="flex items-center justify-center"
            >
              <Menu className="h-5 w-5" />
            </motion.span>
          </button>

          {leftContent}
        </div>

        {/* Right Side Utility Controls */}
        <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 lg:gap-4 shrink-0">
          {/* Search */}
          <motion.button
            onClick={onSearchClick}
            variants={iconButtonVariants}
            whileHover="hover"
            whileTap="tap"
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-light-gray text-medium-black hover:bg-light-gray transition-colors cursor-pointer"
          >
            <Search className="h-4 w-4 sm:h-5 sm:w-5" />
          </motion.button>

          {/* Notifications */}
          <div className="relative">
            <motion.button
              onClick={onNotificationClick}
              aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"}
              variants={iconButtonVariants}
              whileHover="hover"
              whileTap="tap"
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-light-gray text-medium-black hover:bg-light-gray transition-colors cursor-pointer"
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              {unreadCount > 0 && (
                <motion.span
                  animate="animate"
                  variants={badgePulse}
                  className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 sm:h-5 sm:min-w-5 px-1 items-center justify-center rounded-full bg-red text-[10px] font-bold text-white ring-2 ring-white"
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </motion.span>
              )}
            </motion.button>

            <NotificationsDropdown
              isOpen={notifOpen}
              onClose={onCloseNotif}
              onUnreadChange={setUnreadCount}
            />
          </div>

          {/* Start Call CTA (admins don't place calls, so the Super Admin portal has none) */}
          {canCall && (
          <motion.button
            onClick={() => setIsCallModalOpen(true)}
            variants={ctaButtonVariants}
            whileHover="hover"
            whileTap="tap"
            className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-primary px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-white shrink-0" />
            <span className="hidden xs:inline">Start Call</span>
          </motion.button>
          )}
        </div>
      </motion.header>

      {/* Start Call modal — opens above any page from the header CTA */}
      <LiveCallingModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        onStartCall={handleStartCall}
      />
    </>
  );
};

export default Header;
