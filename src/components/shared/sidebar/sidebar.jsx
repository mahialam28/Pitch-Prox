"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { LogOut, X, ChevronDown } from "lucide-react";
import whiteLogo from "@/assets/logos/white-logo.png";
import { motion, AnimatePresence } from "framer-motion";

// ── Animation Variants ──────────────────────────────────────────────────────

const sidebarVariants = {
  hidden: { x: "-100%" },
  visible: {
    x: 0,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 24,
      mass: 0.8,
    },
  },
  exit: {
    x: "-100%",
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 28,
      mass: 0.8,
    },
  },
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
};

const navItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
      delay: 0.04 * i,
    },
  }),
};

const profileVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.3, duration: 0.4, ease: "easeOut" },
  },
};

// ── Component ───────────────────────────────────────────────────────────────

const Sidebar = ({
  navItems = [],
  pathname = "",
  userName = "User",
  userRole = "Member",
  userAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop",
  onLogout = () => console.log("Logging out..."),
  isOpen = false,
  onClose = () => {},
}) => {
  // State to track open/closed state of dropdown submenus
  const [openMenus, setOpenMenus] = useState(() => {
    const initial = {};
    navItems.forEach((item) => {
      if (item.subItems && item.subItems.length > 0) {
        const isMatch =
          pathname.startsWith(item.href) ||
          item.subItems.some((sub) => pathname.startsWith(sub.href));
        initial[item.label] = isMatch;
      }
    });
    return initial;
  });

  // Keep active menu open on route change if not explicitly toggled
  useEffect(() => {
    navItems.forEach((item) => {
      if (item.subItems && item.subItems.length > 0) {
        const isMatch =
          pathname.startsWith(item.href) ||
          item.subItems.some((sub) => pathname.startsWith(sub.href));
        if (isMatch) {
          setOpenMenus((prev) => ({
            ...prev,
            [item.label]: prev[item.label] !== undefined ? prev[item.label] : true,
          }));
        }
      }
    });
  }, [pathname, navItems]);

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  // ── Shared sidebar inner content ──────────────────────────────────────────
  const sidebarContent = (
    <aside className="flex h-full w-64 flex-col bg-dark-black text-white select-none">
      {/* Brand Logo */}
      <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-white/10">
        <Link href="/" className="flex items-center">
          <div className="w-[140px] h-12 overflow-hidden">
            <Image
              className="w-full h-full object-contain"
              src={whiteLogo}
              alt="PitchProX"
              width={140}
              height={48}
            />
          </div>
        </Link>

        {/* Close button — visible only on mobile */}
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-colors cursor-pointer lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation Links with dark slim scrollbar */}
      <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto sidebar-scroll">
        {navItems.map((item, i) => {
          const hasSubItems = item.subItems && item.subItems.length > 0;

          // Check if parent or any sub-item is active
          const isParentActive =
            pathname === item.href ||
            (item.href.includes("/settings") && pathname.includes("/settings")) ||
            (hasSubItems &&
              (pathname.startsWith(item.href) ||
                item.subItems.some((sub) => pathname.startsWith(sub.href))));

          const isMenuOpen = hasSubItems && !!openMenus[item.label];

          if (hasSubItems) {
            return (
              <motion.div
                key={item.label}
                custom={i}
                variants={navItemVariants}
                initial="hidden"
                animate="visible"
                className="space-y-1"
              >
                {/* Parent Nav Item (Clicking toggles dropdown open/close) */}
                <button
                  type="button"
                  onClick={() => toggleMenu(item.label)}
                  className={`w-full group relative flex items-center justify-between px-4 py-3 rounded-xl text-sm font-secondary font-medium transition-all duration-200 cursor-pointer ${
                    isParentActive
                      ? "bg-primary text-white font-bold shadow-xs"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span>{item.label}</span>
                  </span>

                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-250 ${
                      isMenuOpen ? "rotate-180 text-white" : "text-white/60"
                    }`}
                  />
                </button>

                {/* Submenu Tree structure with smooth animated collapse */}
                <AnimatePresence initial={false}>
                  {isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.22, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="relative ml-5 pl-4 border-l border-white/20 space-y-1 my-1.5">
                        {item.subItems.map((sub) => {
                          const isSubActive =
                            pathname === sub.href ||
                            (sub.href === "/super-admin/compliance-audit" &&
                              (pathname === "/super-admin/compliance-audit" ||
                                (pathname.startsWith("/super-admin/compliance-audit/") &&
                                  !pathname.includes("/overview") &&
                                  !pathname.includes("/training-logs") &&
                                  !pathname.includes("/ai-governance") &&
                                  !pathname.includes("/incident-management") &&
                                  !pathname.includes("/audit-logs") &&
                                  !pathname.includes("/access-records") &&
                                  !pathname.includes("/soc2-readiness") &&
                                  !pathname.includes("/evidence-repository"))));

                          return (
                            <Link
                              key={sub.label}
                              href={sub.href}
                              onClick={onClose}
                              className={`relative block px-3 py-2 rounded-lg text-xs sm:text-[13px] font-secondary transition-all cursor-pointer ${
                                isSubActive
                                  ? "text-secondary font-semibold bg-white/5"
                                  : "text-white/65 hover:text-white hover:bg-white/5"
                              }`}
                            >
                              {/* Left vertical cyan indicator bar on the connector line */}
                              {isSubActive && (
                                <span className="absolute -left-[18px] top-1/2 -translate-y-1/2 w-[3px] h-5 bg-secondary rounded-r-full shadow-sm" />
                              )}
                              <span className="truncate block">{sub.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          }

          const isActive =
            pathname === item.href ||
            (item.href.includes("/settings") && pathname.includes("/settings"));

          return (
            <motion.div
              key={item.label}
              custom={i}
              variants={navItemVariants}
              initial="hidden"
              animate="visible"
            >
              <Link
                href={item.href}
                onClick={onClose}
                className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-secondary font-medium transition-colors duration-200 overflow-hidden cursor-pointer ${
                  isActive
                    ? "text-white font-semibold"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {/* Active background pill */}
                {isActive && (
                  <motion.span
                    layoutId="activeNavPill"
                    className="absolute inset-0 bg-primary rounded-xl"
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                  />
                )}

                {/* Hover background */}
                {!isActive && (
                  <span className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/10 transition-colors duration-200" />
                )}

                {/* Content */}
                <span className="relative z-10 flex items-center gap-3">
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <motion.div
        variants={profileVariants}
        initial="hidden"
        animate="visible"
        className="p-4 border-t border-white/10 flex flex-col gap-3 shrink-0"
      >
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-amber-400">
            <Image
              src={userAvatar}
              alt={userName}
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-white truncate">
              {userName}
            </span>
            <span className="text-xs text-white/50 truncate">{userRole}</span>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors duration-200 cursor-pointer"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Logout</span>
        </button>
      </motion.div>
    </aside>
  );

  return (
    <>
      {/* ── Desktop: always visible (lg+) ── */}
      <div className="hidden lg:flex fixed inset-y-0 left-0 z-40">
        {sidebarContent}
      </div>

      {/* ── Mobile/Tablet: overlay (below lg) ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="sidebar-backdrop"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={onClose}
              className="fixed inset-0 z-40 bg-dark-black/50 backdrop-blur-sm lg:hidden"
            />

            {/* Sidebar panel */}
            <motion.div
              key="sidebar-panel"
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
